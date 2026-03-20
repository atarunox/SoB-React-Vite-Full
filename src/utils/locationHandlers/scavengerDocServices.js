// src/utils/locationHandlers/scavengerDocServices.js
//
// Scavenger Doc — Surgery ($250) and Xanthar Leech Treatment ($50/leech)
//
// Surgery outcome table (D6 + mods):
//   0  → Dead! Hero is killed during surgery.
//   1  → Painful Butchering — not healed, lose D6 Health/Sanity permanently.
//   2-3 → Failed — not healed.
//   4-6+ → Success! — Injury/Mutation/Parasite is healed.
// If a Parasite is chosen, -1 to the roll.
//
// Xanthar Leech Treatment ($50/leech, up to 5, limit once per Town Stay):
//   Roll D6 per leech. On 5-6, remove 1 Corruption Point.
//   On 1, take D6 Wounds ignoring Defense.
//   (Rusty Tools event changes wound threshold to 1-2.)

import { d6 as _d6 } from '../../utils/diceHelpers';
import { loadTownState } from '../../utils/townState';

const ctxD6 = async (ctx, label) => (typeof ctx?.d6 === 'function') ? ctx.d6(label) : _d6();

function safeNumber(n, def = 0) {
  const v = Number(n);
  return Number.isFinite(v) ? v : def;
}

function getShopFlags() {
  const s = loadTownState() || {};
  return s.scavengerDoc || {};
}

/**
 * performScavengerDocSurgery
 *
 * @param {Object} params
 * @param {Object} params.hero - The hero data
 * @param {Object} params.io - UI interface { promptInjuryOrMutation, roll, pay, notify, getSurgeryOutcomeMod }
 * @param {Object} [params.mods] - { outcomeDelta }
 */
export async function performScavengerDocSurgery({ hero, io = {}, mods = {} }) {
  const log = [];
  const actions = [];
  const note = (m) => {
    log.push(String(m));
    try { io.notify?.(m); } catch {}
  };

  const flags = getShopFlags();

  // Check if surgery is disabled (event #3)
  if (flags.surgeryDisabled) {
    note('[Surgery] The Scavenger Doc cannot perform surgery — he has no understanding of human anatomy this Town Stay.');
    return { actions, log };
  }

  // Check if doc is closed (event #2)
  if (flags.closed) {
    note('[Surgery] The Scavenger Doc is closed for the remainder of this Town Stay.');
    return { actions, log };
  }

  // 1) Pick target condition (Injury, Mutation, or Parasite)
  const pick = await io.promptInjuryOrMutation?.(hero);
  if (!pick) {
    note('Surgery canceled — no condition selected.');
    return { actions, log };
  }

  const goldBefore = safeNumber(hero?.gold, 0);
  const cost = 250;

  // 2) Pay $250
  if (goldBefore < cost) {
    note(`[Surgery] Not enough gold ($${goldBefore}/$${cost} needed).`);
    return { actions, log };
  }

  const payOk = await io.pay?.(cost, `Pay $${cost} for Scavenger Doc Surgery`);
  if (!payOk) {
    note('Surgery aborted — payment declined.');
    return { actions, log };
  }

  let gold = goldBefore - cost;

  // 3) Outcome roll: D6 + mods
  // Apply event-based surgery modifier
  const eventMod = safeNumber(flags.surgeryMod, 0);
  const externalMod = safeNumber(mods.outcomeDelta, 0) +
    safeNumber(mods.outcomeBonus, 0) +
    safeNumber(io.getSurgeryOutcomeMod?.(), 0);

  // If Parasite is chosen, -1 to the roll
  const kind = String(pick.kind || pick.type || '').toLowerCase();
  const parasiteMod = kind === 'parasite' ? -1 : 0;

  const totalMod = eventMod + externalMod + parasiteMod;

  const rolled = (await io.roll?.(1, 6, 'Scavenger Doc Surgery Outcome'))?.[0] ?? _d6();
  const outcomeRoll = rolled + totalMod;

  note(`[Surgery] Rolled ${rolled}${totalMod !== 0 ? ` (mods ${totalMod >= 0 ? '+' : ''}${totalMod})` : ''} = ${outcomeRoll}.`);
  if (parasiteMod) note('[Surgery] Parasite chosen: -1 to roll.');

  // Resolve condition bucket
  const resolveConditionBucket = (h, pickKind) => {
    const k = String(pickKind || '').toLowerCase();
    if (k === 'injury') {
      if (Array.isArray(h?.conditions?.injury)) return { where: 'nested', key: 'injury', list: [...h.conditions.injury] };
      if (Array.isArray(h?.injuries)) return { where: 'legacy', key: 'injuries', list: [...h.injuries] };
    }
    if (k === 'mutation') {
      if (Array.isArray(h?.conditions?.mutation)) return { where: 'nested', key: 'mutation', list: [...h.conditions.mutation] };
      if (Array.isArray(h?.mutations)) return { where: 'legacy', key: 'mutations', list: [...h.mutations] };
    }
    if (k === 'parasite') {
      if (Array.isArray(h?.conditions?.parasite)) return { where: 'nested', key: 'parasite', list: [...h.conditions.parasite] };
      if (Array.isArray(h?.parasites)) return { where: 'legacy', key: 'parasites', list: [...h.parasites] };
    }
    return { where: 'none', key: '', list: [] };
  };

  const writeBucketPatch = (h, patchObj, bucket, nextList) => {
    if (bucket.where === 'nested') {
      patchObj.conditions = {
        ...(h.conditions || {}),
        [bucket.key]: nextList,
      };
    } else if (bucket.where === 'legacy') {
      patchObj[bucket.key] = nextList;
    }
  };

  const bucket = resolveConditionBucket(hero, kind);
  const idx = Math.max(0, Math.min(safeNumber(pick._idx, 0), bucket.list.length - 1));

  // --- Outcome Map ---

  // 0 or less: Dead!
  if (outcomeRoll <= 0) {
    note('[Surgery] DEAD! Your Hero is killed during surgery.');
    const patch = {
      gold,
      dead: true,
      currentHealth: 0,
    };
    return { actions, patch: { id: hero.id || hero.localId, ...patch }, log };
  }

  // 1: Painful Butchering — not healed, lose D6 Health/Sanity permanently (any mix)
  if (outcomeRoll === 1) {
    const lossRoll = (await io.roll?.(1, 6, 'Painful Butchering — D6 Health/Sanity lost permanently'))?.[0] ?? _d6();
    note(`[Surgery] Painful Butchering! Rolled [${lossRoll}] — lose ${lossRoll} Health/Sanity (any mix) permanently. Ailment NOT healed.`);

    // Default: split evenly, Health first
    const healthLoss = Math.ceil(lossRoll / 2);
    const sanityLoss = Math.floor(lossRoll / 2);

    const patch = {
      gold,
      maxHealth: Math.max(0, safeNumber(hero?.maxHealth, 0) - healthLoss),
      currentHealth: Math.max(0, safeNumber(hero?.currentHealth, 0) - healthLoss),
    };

    const maxSan = safeNumber(hero?.maxSanity ?? hero?.SanityMax, 0);
    if (maxSan > 0 || sanityLoss > 0) {
      patch.maxSanity = Math.max(0, maxSan - sanityLoss);
      patch.currentSanity = Math.max(0, safeNumber(hero?.currentSanity, 0) - sanityLoss);
    }

    return { actions, patch: { id: hero.id || hero.localId, ...patch }, log };
  }

  // 2-3: Failed — not healed
  if (outcomeRoll >= 2 && outcomeRoll <= 3) {
    note('[Surgery] Failed — the ailment is not Healed.');
    return { actions, patch: { id: hero.id || hero.localId, gold }, log };
  }

  // 4-6+: Success! — Injury/Mutation/Parasite is Healed
  if (outcomeRoll >= 4) {
    const patch = { gold };
    if (bucket.list.length && idx >= 0) {
      const nextList = [...bucket.list];
      nextList.splice(idx, 1);
      writeBucketPatch(hero, patch, bucket, nextList);
      note('[Surgery] Success! The ailment is Healed and removed.');
    } else {
      note('[Surgery] Success! (No matching condition found to remove.)');
    }
    return { actions, patch: { id: hero.id || hero.localId, ...patch }, log };
  }

  return { actions, log };
}

/**
 * performXantharLeechTreatment
 *
 * Decide how many Xanthar Leeches to apply (up to 5), $50 per leech.
 * Roll D6 for each: on 5 or 6, remove 1 Corruption Point.
 * On 1, take D6 Wounds ignoring Defense.
 * (Rusty Tools event changes wound threshold to 1-2.)
 *
 * Limit once per Town Stay.
 */
export async function performXantharLeechTreatment({ hero, io = {}, ctx = {} }) {
  const log = [];
  const note = (m) => {
    log.push(String(m));
    try { io.notify?.(m); } catch {}
  };

  const flags = getShopFlags();

  if (flags.closed) {
    note('[Xanthar Leech] The Scavenger Doc is closed for the remainder of this Town Stay.');
    return { actions: [], log };
  }

  if (flags.leechUsed) {
    note('[Xanthar Leech] Xanthar Leech Treatment is limited to once per Town Stay.');
    return { actions: [], log };
  }

  const curCorruption = Math.max(0, safeNumber(hero?.currentCorruption, 0));
  const gold = Math.max(0, safeNumber(hero?.gold, 0));
  const maxByGold = Math.floor(gold / 50);
  const maxLeeches = Math.min(5, maxByGold);

  if (maxLeeches <= 0) {
    note(`[Xanthar Leech] Not enough gold for even one leech ($50 needed, have $${gold}).`);
    return { actions: [], log };
  }

  // Prompt for number of leeches
  let numLeeches = 1;
  if (typeof io.promptNumber === 'function') {
    numLeeches = await io.promptNumber(
      `How many Xanthar Leeches to apply? ($50 each, up to ${maxLeeches})`,
      { min: 0, max: maxLeeches, defaultValue: Math.min(curCorruption, maxLeeches) }
    );
  }
  numLeeches = Math.max(0, Math.min(maxLeeches, safeNumber(numLeeches, 1)));

  if (numLeeches <= 0) {
    note('[Xanthar Leech] Treatment canceled.');
    return { actions: [], log };
  }

  const totalCost = numLeeches * 50;
  note(`[Xanthar Leech] Applying ${numLeeches} leech${numLeeches !== 1 ? 'es' : ''} for $${totalCost}.`);

  // Wound threshold: normally 1, but Rusty Tools event makes it 1-2
  const woundThreshold = safeNumber(flags.leechWoundThreshold, 1);

  let corruptionRemoved = 0;
  let totalWounds = 0;
  const rollResults = [];

  const rollFn = io.roll
    ? io.roll
    : async (n, sides, label) => Array.from({ length: n }, () => _d6());

  for (let i = 0; i < numLeeches; i++) {
    const [leechRoll] = await rollFn(1, 6, `Xanthar Leech #${i + 1}`);
    let resultText = `Leech #${i + 1}: Rolled [${leechRoll}]`;

    if (leechRoll >= 5) {
      corruptionRemoved++;
      resultText += ' — Removes 1 Corruption Point!';
    } else if (leechRoll <= woundThreshold) {
      const [woundRoll] = await rollFn(1, 6, `Leech #${i + 1} — Wound roll (ignores Defense)`);
      totalWounds += woundRoll;
      resultText += ` — Leech chews too deeply! Take ${woundRoll} Wounds (ignores Defense).`;
    } else {
      resultText += ' — No effect.';
    }

    rollResults.push(resultText);
    log.push(resultText);
  }

  // Build patch
  const nextGold = Math.max(0, gold - totalCost);
  const nextCorruption = Math.max(0, curCorruption - corruptionRemoved);
  const curHP = safeNumber(hero?.currentHealth, safeNumber(hero?.health, 0));
  const nextHealth = Math.max(0, curHP - totalWounds);

  // Mark leech treatment as used this Town Stay
  // (We don't call patchShopFlags here since it's the caller's responsibility via townState,
  //  but we do note it for the log.)

  const summary = [
    `Corruption removed: ${corruptionRemoved} (${curCorruption} → ${nextCorruption})`,
    totalWounds > 0 ? `Wounds taken: ${totalWounds} (Health: ${curHP} → ${nextHealth})` : 'No wounds taken.',
    `Gold spent: $${totalCost} ($${gold} → $${nextGold})`,
  ];
  log.push('---');
  summary.forEach(s => log.push(s));

  const actions = [
    {
      type: 'update',
      gold: nextGold,
      currentCorruption: nextCorruption,
      currentHealth: nextHealth,
      health: nextHealth,
    },
  ];

  return { actions, log, leechUsed: true };
}

export default {
  performScavengerDocSurgery,
  performXantharLeechTreatment,
};
