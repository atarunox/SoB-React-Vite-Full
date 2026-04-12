// src/utils/locationHandlers/docsOfficeHandler.js
//
// Doc's Office Location Events (2d6)
// Canonical ctx-pattern handler (no window.prompt usage).

import { appendTemporary } from '../mergeConditions';
import { normalizeConditionsObject } from '../mergeConditions';
import { loadTownState, saveTownState } from '../../utils/townState';
import { d6 as _d6, d3 as _d3 } from '../../utils/diceHelpers';
import { getEventDisplay } from '../locationEventText';

// Use ctx.d6/ctx.d3 when available (respects manual roll mode); fallback to auto-roll
const ctxD6 = async (ctx, label) => (typeof ctx?.d6 === 'function') ? ctx.d6(label) : _d6();
const ctxD3 = async (ctx, label) => (typeof ctx?.d3 === 'function') ? ctx.d3(label) : _d3();

const shopId = 'docsOffice';

// ---------- townState helpers ----------
function patchShopMods(patch) {
  const s = loadTownState();
  const cur = s.shopMods?.[shopId] || {};
  const next = { ...cur, ...patch };
  saveTownState({ ...s, shopMods: { ...(s.shopMods || {}), [shopId]: next } });
}

function patchDayMods(patch) {
  const s = loadTownState();
  const next = { ...(s.dayMods || {}), ...patch };
  saveTownState({ ...s, dayMods: next });
}

// ---------- result formatting helper ----------
function formatCheckResult(result, stat, target) {
  if (result && typeof result === 'object' && Array.isArray(result.rolls)) {
    const diceStr = result.rolls.join(', ');
    const sCount = result.successes ?? result.rolls.filter(r => r >= target).length;
    return `Rolled [${diceStr}] — ${result.passed ? 'PASSED' : 'FAILED'} (${stat} ${target}+, ${sCount} success${sCount !== 1 ? 'es' : ''})`;
  }
  return null;
}

/**
 * Shows a result prompt so the player can see the outcome before continuing.
 */
async function showResult(ctx, title, lines) {
  const body = Array.isArray(lines) ? lines.join('\n') : lines;
  await ctx.promptChoice?.(`${title}\n\n${body}`, [{ label: 'Continue' }]);
}

// ---------- display (title / lore / effect) ----------
export function display(roll) {
  return getEventDisplay(shopId, roll) || { title: "Doc's Office Event", lore: '', effect: 'No Event.' };
}

// ---------- mechanics (apply) ----------
export async function apply(roll, ctx) {
  const id = ctx.getActiveHeroId?.();
  if (!id) return { log: [] };

  const info = display(roll);
  const log = [];

  // Every event starts with its title and lore/flavor text
  log.push(`[Doc's Office] (${roll}) ${info.title} — ${info.lore}`);
  log.push(`Effect: ${info.effect}`);

  // 2: The "Good" Doctor — Doc's Office closed for this Town Stay
  if (roll === 2) {
    patchShopMods({ destroyed: true });
    const outcome = "The Doc has been performing late-night experiments on the locals. Catching him in the act, he runs off. Doc's Office is closed for the rest of this Town Stay.";
    log.push(outcome);
    await showResult(ctx, "THE 'GOOD' DOCTOR — Result", [outcome]);
    ctx.toast?.("The 'Good' Doctor — Doc's Office is closed for this Town Stay.");
    return { log };
  }

  // 3: Plague Tent — Luck 5+ test. Fail: D3 Corruption (no saves) + Shaken Nerves
  if (roll === 3) {
    const lore3 = `PLAGUE TENT\n${info.lore}\nThe demonic plague threatens to overwhelm you!`;
    const result = await ctx.doSkillCheck(id, {
      stat: 'Luck', target: 5, returnDetails: true,
      message: `${lore3}\nMake a Luck 5+ test to avoid the plague.`,
    });
    const checkLine = formatCheckResult(result, 'Luck', 5);
    if (checkLine) log.push(checkLine);
    const passed = result?.passed ?? result;

    if (passed) {
      const outcome = 'You manage to avoid the worst of the plague. No effect.';
      log.push(outcome);
      await showResult(ctx, 'PLAGUE TENT — Result', [checkLine, '', outcome]);
      ctx.toast?.('Plague Tent: Luck test passed — no effect.');
    } else {
      const corruptionRoll = await ctxD3(ctx, 'Plague Tent — Roll D3 for Corruption Hits');
      const corruptionLine = `Rolled [${corruptionRoll}] for Corruption Hits (D3).`;
      log.push(corruptionLine);

      // Willpower saves per Corruption Hit
      const hRef = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? null;
      const wpStr = String(hRef?.willpower ?? hRef?.stats?.Willpower ?? '5+');
      const wpTarget = Number(String(wpStr).match(/\d+/)?.[0]) || 5;
      const saveRolls = await ctx.roll?.(corruptionRoll, 6, `Willpower ${wpTarget}+ saves vs ${corruptionRoll} Corruption Hits`) || [];
      const wpArr = Array.isArray(saveRolls) ? saveRolls : [saveRolls];
      const wpBlocks = wpArr.filter(n => n >= wpTarget).length;
      const unblockedCorruption = Math.max(0, corruptionRoll - wpBlocks);
      const wpLine = `Willpower [${wpArr.join(', ')}] vs ${wpTarget}+ — ${wpBlocks} blocked, ${unblockedCorruption} corruption taken.`;
      log.push(wpLine);

      if (unblockedCorruption > 0) {
        ctx.updateHero?.(id, (h) => {
          const maxCor = Number(h.maxCorruption ?? h.stats?.['Max Corruption'] ?? 5) || 5;
          const cur = Math.max(0, Number(h.currentCorruption ?? 0));
          let next = cur + unblockedCorruption;

          // Overflow -> Mutations
          const overflow = Math.floor(next / maxCor);
          next = next % maxCor;

          const nextMut = Array.isArray(h.mutations) ? [...h.mutations] : [];
          for (let i = 0; i < overflow; i++) nextMut.push({ name: 'Mutation — Roll Needed' });

          return {
            ...h,
            currentCorruption: next,
            mutations: nextMut,
          };
        });
      }

      // Shaken Nerves: Max Grit capped at 1 next Adventure (always applied on fail)
      ctx.updateHero?.(id, (h) => {
        const tmp = {
          id: `gritcap_nextadv_${Date.now()}`,
          type: 'Temporary',
          temporary: true,
          name: 'Shaken Nerves',
          effectText: 'Max Grit is capped at 1 for the next Adventure.',
          effects: {},
          gritCap: 1,
          duration: 'nextAdventure',
          active: true,
          addedAt: Date.now(),
        };
        const mergedConds = appendTemporary(h.conditions, tmp);
        return { ...h, conditions: mergedConds };
      });

      const mutNote = unblockedCorruption > 0 ? ' Corruption overflow may trigger Mutations.' : '';
      const outcome = `Failed! ${corruptionRoll} Corruption Hit${corruptionRoll !== 1 ? 's' : ''} — ${unblockedCorruption} after Willpower saves.${mutNote} Added "Shaken Nerves" (Max Grit cap 1 next Adventure).`;
      log.push(outcome);
      await showResult(ctx, 'PLAGUE TENT — Result', [checkLine, corruptionLine, wpLine, '', outcome]);
      ctx.toast?.(`Plague Tent: +${unblockedCorruption} Corruption, Shaken Nerves added.`);
    }
    return { log };
  }

  // 4-5: Dirty Tools — Surgery rolls today are -1
  if (roll === 4 || roll === 5) {
    patchDayMods({ docsOfficeSurgeryRollMod: { add: -1, minBeforeClamp: 0 } });
    const outcome = "The Doc is using dirty tools for operating. All Surgery rolls at Doc's Office today are -1 (min 0).";
    log.push(outcome);
    await showResult(ctx, 'DIRTY TOOLS — Result', [outcome]);
    ctx.toast?.('Dirty Tools: Surgery rolls today are -1 (min 0).');
    return { log };
  }

  // 6-8: The Smell of Death — No Event
  if (roll >= 6 && roll <= 8) {
    const outcome = "Too familiar at the Doc's Office. No event.";
    log.push(outcome);
    await showResult(ctx, 'THE SMELL OF DEATH — Result', [outcome]);
    ctx.toast?.('The Smell of Death — No event.');
    return { log };
  }

  // 9-10: Expert Surgeon — Surgery rolls today are +1
  if (roll === 9 || roll === 10) {
    patchDayMods({ docsOfficeSurgeryRollMod: { add: +1 } });
    const outcome = "The Doc is an expert surgeon today. All Surgery rolls at Doc's Office today are +1.";
    log.push(outcome);
    await showResult(ctx, 'EXPERT SURGEON — Result', [outcome]);
    ctx.toast?.('Expert Surgeon: Surgery rolls today are +1.');
    return { log };
  }

  // 11: Special Mission — Each hero here gains 1 Specimen Jar
  if (roll === 11) {
    // Give the active hero a Specimen Jar
    const hero = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? null;
    const heroName = hero?.name || 'Hero';

    ctx.updateHero?.(id, (prev) => {
      const inv = Array.isArray(prev.inventory) ? [...prev.inventory] : [];
      if (!inv.some(it => (it?.name || '').toLowerCase() === 'specimen jar')) {
        inv.push({
          id: `doc_specimen_jar_${Date.now()}_${id}`,
          name: 'Specimen Jar',
          type: 'Gear',
          source: "Doc's Office",
          tags: ['Glass', 'Science'],
          description: 'Fill in Other Worlds (Cunning test) then sell to the Doc for D6x$100.',
          limitOne: true,
        });
      }
      return { ...prev, inventory: inv };
    });

    const outcome = `The Doc gives you a free Specimen Jar and asks you to recover a sample from another world. ${heroName} received a Specimen Jar.`;
    log.push(outcome);
    await showResult(ctx, 'SPECIAL MISSION — Result', [outcome]);
    ctx.toast?.(`Special Mission: ${heroName} received a Specimen Jar.`);
    return { log };
  }

  // 12: Medical Miracle — Roll D6 per injury/mutation/parasite. 4+ removes it. 1 = +1 Corruption Hit.
  if (roll === 12) {
    const hero = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? null;
    if (!hero) {
      const outcome = 'Medical Miracle — no hero present.';
      log.push(outcome);
      await showResult(ctx, 'MEDICAL MIRACLE — Result', [outcome]);
      ctx.toast?.(outcome);
      return { log };
    }

    // Build target list from conditions
    const obj = normalizeConditionsObject(hero.conditions);
    const buckets = ['injury', 'mutation', 'parasite'];
    const targets = [];
    for (const b of buckets) {
      const arr = Array.isArray(obj[b]) ? obj[b] : [];
      arr.forEach((c, i) => {
        const active = c && c.active !== false && c.removed !== true;
        if (active) targets.push({ bucket: b, idx: i, name: c?.name || c?.type || b });
      });
    }

    if (!targets.length) {
      const outcome = 'Medical Miracle — no qualifying conditions (injuries, mutations, or parasites) to roll for.';
      log.push(outcome);
      await showResult(ctx, 'MEDICAL MIRACLE — Result', [outcome]);
      ctx.toast?.(outcome);
      return { log };
    }

    // Roll D6 for each condition
    const results = [];
    for (const t of targets) {
      const label = `${t.bucket.charAt(0).toUpperCase() + t.bucket.slice(1)}: ${t.name}`;
      const dieRoll = await ctxD6(ctx, `Medical Miracle — ${label}`);
      const removed = dieRoll >= 4;
      const corruption = dieRoll === 1;

      const rollLine = `${label}: Rolled [${dieRoll}] — ${removed ? 'REMOVED!' : corruption ? 'No effect + Corruption Hit' : 'No effect'}`;
      log.push(rollLine);
      results.push({ ...t, roll: dieRoll, removed, corruption });
    }

    // Tally natural 1s for corruption hits
    const ones = results.filter(r => r.corruption).length;

    // Willpower saves for Corruption Hits from natural 1s
    let unblockedCorruption = ones;
    let wpLine = '';
    if (ones > 0) {
      const hRef = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? null;
      const wpStr = String(hRef?.willpower ?? hRef?.stats?.Willpower ?? '5+');
      const wpTarget = Number(String(wpStr).match(/\d+/)?.[0]) || 5;
      const saveRolls = await ctx.roll?.(ones, 6, `Willpower ${wpTarget}+ saves vs ${ones} Corruption Hits`) || [];
      const wpArr = Array.isArray(saveRolls) ? saveRolls : [saveRolls];
      const wpBlocks = wpArr.filter(n => n >= wpTarget).length;
      unblockedCorruption = Math.max(0, ones - wpBlocks);
      wpLine = `Willpower [${wpArr.join(', ')}] vs ${wpTarget}+ — ${wpBlocks} blocked, ${unblockedCorruption} corruption taken.`;
      log.push(wpLine);
    }

    // Apply changes to hero
    ctx.updateHero?.(id, (h) => {
      const cur = normalizeConditionsObject(h.conditions);
      const next = { ...cur };

      for (const r of results) {
        const arr = Array.isArray(next[r.bucket]) ? [...next[r.bucket]] : [];
        if (arr[r.idx] && r.removed) {
          arr[r.idx] = { ...arr[r.idx], removed: true, active: false };
        }
        next[r.bucket] = arr;
      }

      const nextCorruption = Math.max(0, Number(h.currentCorruption ?? h.corruption ?? 0)) + unblockedCorruption;
      return { ...h, conditions: next, currentCorruption: nextCorruption };
    });

    // Build summary for display
    const summaryLines = results.map(r => {
      const label = `${r.bucket.charAt(0).toUpperCase() + r.bucket.slice(1)}: ${r.name}`;
      return `  ${label}: Rolled [${r.roll}] — ${r.removed ? 'Removed' : r.corruption ? 'Kept + Corruption' : 'Kept'}`;
    });
    const corruptionNote = ones > 0
      ? `\nNatural 1s: ${ones} — ${unblockedCorruption} Corruption after Willpower saves.`
      : '\nNo natural 1s — no extra Corruption.';

    const outcome = `Medical Miracle results:\n${summaryLines.join('\n')}${corruptionNote}`;
    log.push(outcome);
    await showResult(ctx, 'MEDICAL MIRACLE — Result', [outcome]);
    ctx.toast?.(`Medical Miracle: ${results.filter(r => r.removed).length} removed, ${unblockedCorruption} Corruption.`);
    return { log };
  }

  // Default fallback
  ctx.toast?.("Doc's Office — No matching event branch.");
  return { log };
}

// --------- Dispatcher compatible with locationEventsEngine ---------------
export async function handleDocsOfficeEvent(ctx = {}) {
  const roll = ctx.forcedRoll ?? (_d6() + _d6());
  const result = await apply(roll, ctx);
  return {
    actions: [],
    townState: ctx.townState,
    log: result?.log || [`Doc's Office Event Roll: ${roll}`],
    eventRoll: roll,
    eventIndex: Math.max(0, roll - 2),
  };
}

export const docsOfficeHandler = { display, apply };
export default docsOfficeHandler;
