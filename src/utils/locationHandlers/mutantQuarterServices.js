// src/utils/locationHandlers/mutantQuarterServices.js

// ---------- tiny dice helpers ----------
const d6 = () => Math.floor(Math.random() * 6) + 1;
const d3 = () => Math.floor(Math.random() * 3) + 1;

const safeNum = (v, def = 0) => (Number.isFinite(+v) ? +v : def);

// Merge patch into the hero via caller’s updateHero({ id, ...patch })
const mergePatch = (hero, patch) => {
  const id = hero?.id || hero?.localId;
  return id ? { id, ...patch } : null;
};

// Best-effort read of hero Spirit (dice count) and Willpower target (TN)
function readSpiritDice(hero) {
  // prefer numeric Spirit; otherwise ask caller UI when missing
  const s = safeNum(hero?.Spirit ?? hero?.spirit ?? hero?.stats?.Spirit, NaN);
  return Number.isFinite(s) && s > 0 ? s : null;
}
function readWillpowerTN(hero) {
  // prefer "5+" style or numeric TN stored somewhere on hero
  const wp = String(hero?.willpower ?? hero?.stats?.willpower ?? '').trim();
  const m = wp.match(/(\d)\s*\+/);
  if (m) return safeNum(m[1], 5);
  const asNum = safeNum(hero?.willpowerTN ?? hero?.stats?.willpowerTN, NaN);
  return Number.isFinite(asNum) ? asNum : 5; // default 5+
}

// Common UI roll that respects your TownTab promptRoll
async function roll1d6(ui, label) {
  if (ui?.roll) {
    const arr = await ui.roll(1, 6, label);
    if (Array.isArray(arr) && Number.isFinite(arr[0])) {
      // clamp to 1–6
      const v = Math.max(1, Math.min(6, Math.floor(arr[0])));
      return v;
    }
  }
  return d6();
}

// ---------- Condition Notes helpers (for ConditionsTab) ----------
function pushMaxChangeNote(prevNotes, { stat, delta, newMax, source }) {
  const next = Array.isArray(prevNotes) ? prevNotes.slice() : [];
  next.push({
    id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    kind: 'MaxChange',
    stat,                 // 'Max Health' | 'Max Sanity'
    delta,                // +/- number
    newMax,               // resulting max
    source,               // 'Mutant Surgeon – Butchered' / 'Mutant Surgeon – Painful Success'
    ts: Date.now(),
  });
  return next;
}

// Remove ONE Mutation from hero (nested and legacy shapes supported)
function removeOneMutation(hero, pick) {
  // try modern nested first
  const patch = {};
  let removed = false;

  const nested = hero?.conditions?.mutation;
  if (Array.isArray(nested)) {
    const idx = Number.isFinite(pick?._idx) ? pick._idx : -1;
    if (idx >= 0 && idx < nested.length) {
      const next = nested.filter((_, i) => i !== idx);
      patch.conditions = { ...(hero.conditions || {}), mutation: next };
      removed = true;
    } else if (pick?.name) {
      const i2 = nested.findIndex((c) => String(c?.name?.trim()) === String(pick.name).trim());
      if (i2 >= 0) {
        const next = nested.filter((_, i) => i !== i2);
        patch.conditions = { ...(hero.conditions || {}), mutation: next };
        removed = true;
      }
    }
  }

  // legacy arrays
  if (!removed && Array.isArray(hero?.mutations)) {
    const idx = Number.isFinite(pick?._idx) ? pick._idx : -1;
    if (idx >= 0 && idx < hero.mutations.length) {
      patch.mutations = hero.mutations.filter((_, i) => i !== idx);
      removed = true;
    }
  }
  if (!removed && Array.isArray(hero?.mutation)) {
    const idx = Number.isFinite(pick?._idx) ? pick._idx : -1;
    if (idx >= 0 && idx < hero.mutation.length) {
      patch.mutation = hero.mutation.filter((_, i) => i !== idx);
      removed = true;
    }
  }

  return { removed, patch };
}

// Count total mutations on a list of heroes
function countMutationsOnHeroes(list) {
  let total = 0;
  for (const h of list || []) {
    const n1 = Array.isArray(h?.conditions?.mutation) ? h.conditions.mutation.length : 0;
    const n2 = Array.isArray(h?.mutations) ? h.mutations.length : 0;
    const n3 = Array.isArray(h?.mutation) ? h.mutation.length : 0;
    total += Math.max(n1, n2, n3); // prefer the populated one; avoid double-counting the same data
  }
  return total;
}

/* -------------------------------------------------------------------------- */
/*                       Mutant Quarter – Community APIs                       */
/* -------------------------------------------------------------------------- */

/**
 * performMqSurgeon
 * Table:
 * 1–2  Butchered           → NOT removed; −1 Max Health (note)
 * 3    Painful Success     → removed;   −1 Max Sanity (note)
 * 4    Success… Mostly     → removed;   +D3 Corruption (ignores WP)
 * 5–6  Well Done!          → removed cleanly
 */
export async function performMqSurgeon({ hero, ui }) {
  const log = [];
  const note = (m) => { log.push(String(m)); try { ui?.toast?.(m); } catch {} };

  // ask which Mutation to operate on (reuse your Doc picker if provided)
  const pick = await ui?.promptInjuryOrMutation?.(hero);
  if (!pick || String(pick.kind).toLowerCase() !== 'mutation') {
    note('Surgery canceled — select a Mutation to proceed.');
    return { log, ui: { title: 'Mutant Surgeon', outcome: log } };
  }

  const roll = await roll1d6(ui, 'Mutant Surgeon – Outcome (1d6)');
  note(`Surgery roll: ${roll}`);

  const patch = {};
  let desc = '';

  if (roll <= 2) {
    // Butchered: not removed; −1 Max Health
    const newMax = Math.max(0, safeNum(hero?.maxHealth ?? hero?.health?.max, 0) - 1);
    patch.maxHealth = newMax;
    patch.conditionNotes = pushMaxChangeNote(hero?.conditionNotes, {
      stat: 'Max Health',
      delta: -1,
      newMax,
      source: 'Mutant Surgeon – Butchered',
    });
    desc = 'Butchered — Mutation NOT removed. −1 Max Health.';
  } else if (roll === 3) {
    // Painful Success: removed; −1 Max Sanity
    const { removed, patch: rm } = removeOneMutation(hero, pick);
    Object.assign(patch, rm);
    const curMax = safeNum(hero?.maxSanity ?? hero?.sanity?.max, 0);
    const newMax = Math.max(0, curMax - 1);
    patch.maxSanity = newMax;
    patch.conditionNotes = pushMaxChangeNote(hero?.conditionNotes, {
      stat: 'Max Sanity',
      delta: -1,
      newMax,
      source: 'Mutant Surgeon – Painful Success',
    });
    desc = removed
      ? 'Painful Success — Mutation removed; −1 Max Sanity.'
      : 'Painful Success — (no mutation found to remove); −1 Max Sanity.';
  } else if (roll === 4) {
    // Success… Mostly: removed; +D3 Corruption (ignores WP)
    const { removed, patch: rm } = removeOneMutation(hero, pick);
    Object.assign(patch, rm);
    const add = d3();
    const cur = safeNum(hero?.currentCorruption ?? hero?.corruption, 0);
    patch.currentCorruption = cur + add;
    desc = removed
      ? `Success… Mostly — Mutation removed; +${add} Corruption.`
      : `Success… Mostly — (no mutation found to remove); +${add} Corruption.`;
  } else {
    // 5–6 Well Done!: removed cleanly
    const { removed, patch: rm } = removeOneMutation(hero, pick);
    Object.assign(patch, rm);
    desc = removed ? 'Well Done! — Mutation removed cleanly.' : 'Well Done! — nothing removed.';
  }

  note(desc);
  return {
    log,
    patch: mergePatch(hero, patch),
    ui: { title: 'Mutant Surgeon', outcome: log },
  };
}

/**
 * performMqProphet
 * Cost: D6×$10
 * Test: Spirit 5+ with dice = hero.Spirit
 *  - On each 5+, gain +10XP.
 *  - If ≥1 success: grant a one-time Prophetic Blessing for next Adventure
 *  - If 0 successes: take D6 Horror Hits; prompt Willpower TN; for each failed save, take D3 Sanity damage.
 */
export async function performMqProphet({ hero, ui }) {
  const log = [];
  const note = (m) => { log.push(String(m)); try { ui?.toast?.(m); } catch {} };

  // Cost
  const priceRoll = await roll1d6(ui, 'Prophet – Price (1d6 × $10)');
  const price = priceRoll * 10;
  note(`Price roll: ${priceRoll} → $${price}`);

  const ok = await (ui?.pay ? ui.pay(hero, price, `Pay $${price} for the Prophet’s counsel?`) : Promise.resolve(true));
  if (!ok) {
    note('Payment declined.');
    return { log, ui: { title: 'Mutant Prophet', outcome: log } };
  }

  // Spirit dice count
  let spiritDice = readSpiritDice(hero);
  if (!spiritDice || spiritDice <= 0) {
    // ask user
    const raw = await ui?.promptNumber?.({
      title: 'Prophet – Spirit Test',
      message: 'How many Spirit dice does this hero roll?',
      min: 1, max: 10, defaultValue: 2,
    });
    spiritDice = Math.max(1, Math.min(10, safeNum(raw, 1)));
  }
  const TN = 5;

  // Roll Spirit 5+ test
  const rolls = ui?.roll ? await ui.roll(spiritDice, 6, `Spirit ${TN}+ Test (${spiritDice}d6)`) : Array.from({ length: spiritDice }, d6);
  const successes = rolls.filter((r) => r >= TN).length;
  note(`Spirit test: [${rolls.join(', ')}] → ${successes} successes.`);

  const patch = {};
  const actions = [];

  if (successes >= 1) {
    const xp = successes * 10;
    // add XP and grant blessing tag
    actions.push({ type: 'update', xp: safeNum(hero?.xp, 0) + xp });

    // Add a temporary condition/tag so your UI shows the tip clearly
    const blessing = {
      id: `mq_prophetic_blessing_${Date.now()}`,
      name: 'Prophetic Blessing',
      type: 'temporary',
      effect: 'Once during the next Adventure: Heal D6 Health/Sanity (any mix).',
      expires: 'nextAdventure',
      active: true,
      addedAt: Date.now(),
      source: 'Mutant Prophet',
    };

    // Merge into conditions.temporary
    const cond = hero?.conditions || {};
    const temp = Array.isArray(cond.temporary) ? cond.temporary.slice() : [];
    temp.push(blessing);
    patch.conditions = { ...cond, temporary: temp };

    note(`Passed — +${xp} XP. Granted Prophetic Blessing (heal D6 Health/Sanity any mix once next Adventure).`);
  } else {
    // Fail: D6 Horror Hits, Willpower saves per hit
    const hits = await roll1d6(ui, 'Prophet – Horror Hits (1d6)');
    const wpTN = (() => {
      // let player confirm their Willpower TN (default from hero or 5)
      const defTN = readWillpowerTN(hero);
      return defTN;
    })();

    note(`Failed — ${hits} Horror Hit(s). Willpower ${wpTN}+ vs each hit.`);
    let failed = 0;

    for (let i = 0; i < hits; i++) {
      const [r] = ui?.roll ? await ui.roll(1, 6, `Willpower save (${i + 1}/${hits})`) : [d6()];
      const save = r >= wpTN;
      note(`  • WP roll: ${r} → ${save ? 'saved' : 'fail'}`);
      if (!save) failed++;
    }

    // Each failed Horror Hit: take D3 Sanity damage
    if (failed > 0) {
      let totalSanityDmg = 0;
      for (let i = 0; i < failed; i++) totalSanityDmg += d3();
      const curSan = Number(hero?.sanity?.current ?? hero?.currentSanity ?? 0);
      const nextSan = Math.max(0, curSan - totalSanityDmg);
      actions.push({
        type: 'update',
        sanity: { ...(hero?.sanity || {}), current: nextSan, max: hero?.sanity?.max ?? hero?.maxSanity ?? 0 },
        currentSanity: nextSan, // keep both in sync
      });
      note(`Took ${totalSanityDmg} Sanity Damage.`);
    } else {
      note('No Sanity damage (all saves succeeded).');
    }
  }

  return {
    log,
    actions,
    patch: mergePatch(hero, patch),
    ui: { title: 'Mutant Prophet', outcome: log },
  };
}

/**
 * performMqAid / performMqRevolutionaries
 * Gate: requires ≥3 total Mutations among ALL heroes currently visiting Mutant Quarter.
 * Grants 2 readable temporary “items” (party flags) on the acting hero.
 */
export async function performMqAid({ hero, ui, posseApi, shopId = 'mutantQuarter' }) {
  const log = [];
  const note = (m) => { log.push(String(m)); try { ui?.toast?.(m); } catch {} };

  // compute total mutations among all heroes at this shop
  let total = 0;
  if (posseApi?.getHeroesAtShop && posseApi?.getHero) {
    const ids = posseApi.getHeroesAtShop(shopId) || [];
    const heroes = ids.map((id) => posseApi.getHero(id)).filter(Boolean);
    total = countMutationsOnHeroes(heroes);
  } else {
    // fallback: current hero only
    total = countMutationsOnHeroes([hero]);
  }

  if (total < 3) {
    note(`Requires at least 3 total Mutations among heroes here. Found: ${total}.`);
    return { log, ui: { title: 'Mutant Revolutionaries', outcome: log } };
  }

  // Grant two readable temp flags
  const inv = Array.isArray(hero?.inventory) ? hero.inventory.slice() : [];

  const daily = {
    id: `mq_flag_daily_${Date.now()}`,
    name: 'Cancel & Re-draw a Town Event (Mutant Quarter)',
    type: 'Temporary',
    expires: 'thisTownStay',
    effect: 'Once this Town Stay, when a Daily Event is drawn, you may cancel it and re-draw.',
    source: 'Mutant Revolutionaries',
  };
  const darkness = {
    id: `mq_flag_darkness_${Date.now()}`,
    name: 'Cancel first Darkness card next Adventure (Mutant Quarter)',
    type: 'Temporary',
    expires: 'nextAdventure',
    effect: 'During the next Adventure, cancel the first Darkness card drawn.',
    source: 'Mutant Revolutionaries',
  };

  inv.push(daily, darkness);

  note('Granted: Cancel & Re-draw a Town Event (Mutant Quarter).');
  note('Granted: Cancel first Darkness card next Adventure (Mutant Quarter).');

  return {
    log,
    patch: mergePatch(hero, { inventory: inv }),
    ui: { title: 'Mutant Revolutionaries', outcome: log },
  };
}

// Backward/alias export to satisfy both import styles
export const performMqRevolutionaries = performMqAid;

export default {
  performMqSurgeon,
  performMqProphet,
  performMqAid,
  performMqRevolutionaries,
};
