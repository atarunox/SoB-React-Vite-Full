// C:\Users\bryan\Downloads\SoB-React-Vite-Full\src\utils\locationHandlers\mutantQuarterHandler.js

/**
 * Mutant Quarter (2d6) event handler
 * Returns: { actions, townState, log, eventRoll, eventIndex }
 *
 * Suggested/used action types your reducers should handle:
 * - { type: 'ADD_XP', heroId, amount, reason }
 * - { type: 'ADD_GRIT', heroId, amount, reason }
 * - { type: 'MODIFY_GOLD', heroId, delta, reason }
 * - { type: 'APPLY_WOUNDS', heroId, amount, ignoreDefense: true, reason }
 * - { type: 'APPLY_HITS', heroId, amount, reason }
 * - { type: 'HEAL_HEALTH', heroId, amount, reason }
 * - { type: 'HEAL_SANITY', heroId, amount, reason }
 * - { type: 'MODIFY_SANITY', heroId, delta, reason }                    // for flat +1 Sanity (9)
 * - { type: 'MODIFY_CORRUPTION_HITS', heroId, delta, reason }           // +/- corruption hits
 * - { type: 'LOSE_ALL_DARK_STONE', heroId, reason }
 * - { type: 'MODIFY_DARK_STONE', heroId, delta, reason }                // negative to lose
 * - { type: 'LOSE_SIDE_BAG_TOKENS', heroId, count, reason }             // random tokens; or implement selection UI
 * - { type: 'ADD_SIDE_BAG_TOKEN', heroId, tokenId, amount, reason }     // e.g., tequila
 * - { type: 'REQUEST_TOKEN_SELECTION', heroId, count, reason }          // to pick 1 token per mutation (10)
 * - { type: 'ROLL_ON_CHART', heroId, chart: 'mutation', die: 1, reason } // repeated for D3 results
 * - { type: 'CLOSE_LOCATION', locationId, reason }
 * - { type: 'REQUEST_TOWN_BUILDING_ROLLS', payload }                    // UI flow to roll for other buildings (2,4)
 * - { type: 'TEMP_STAT_MOD', heroId, key: 'Spirit', delta: +1, scope: 'nextAdventure', reason } // (11)
 * - { type: 'INCREMENT_MUTATION_EXTRA_USES', heroId, mutationName, amount, reason }            // (12)
 * - { type: 'FLAG_STAY_MOD', key, value, reason }                       // per-stay flags (e.g., 9 bonus once/hero)
 */

import { d6 as D6, d3 as D3, rollND, sum, roll2d6, idxFrom2d6 } from '../../utils/diceHelpers';
export { roll2d6, idxFrom2d6 };

/** Optional I/O hooks:
 * io = {
 *   roll: (n, sides, label) => number[] | Promise<number[]>,
 *   notify: (msg) => void | Promise<void>,
 *   test: ({ hero, key, target, label }) => boolean | Promise<boolean>,     // Luck/Agility/Strength/etc.
 *   selectChoice: ({ title, message, choices }) => key | Promise<key>,      // generic picker
 *   getMutationCount: (hero) => number | Promise<number>,
 *   hasMutation: (hero, name) => boolean | Promise<boolean>,
 *   getAllBuildingIds: () => string[] | Promise<string[]>,                  // for town-wide building rolls
 * }
 */

export async function handleMutantQuarterEvent({
  hero,
  townState,
  heroesHere = null,  // heroes physically at Mutant Quarter; defaults to [hero]
  io = {},
  forcedRoll = null,
}) {
  const log = [];
  const actions = [];
  const hId = hero?.id || hero?.localId;
  const here = Array.isArray(heroesHere) && heroesHere.length ? heroesHere : (hId ? [hero] : []);
  const locationId = 'mutantQuarter';

  const safeRoll = async (n, sides, label) => {
    if (typeof io.roll === 'function') {
      const r = await io.roll(n, sides, label);
      if (Array.isArray(r) && r.length === n) return r.map((x) => Number(x) || 1);
    }
    return rollND(n, sides);
  };
  const note = async (msg) => {
    log.push(msg);
    if (typeof io.notify === 'function') await io.notify(msg);
  };
  const doTest = async ({ hero, key, target, label }) => {
    if (typeof io.test === 'function') return !!(await io.test({ hero, key, target, label }));
    const die = D6(); // fallback RNG
    return die >= target;
  };
  const choose = async ({ title, message, choices }) => {
    if (typeof io.selectChoice === 'function') return io.selectChoice({ title, message, choices });
    return choices?.[0]?.key; // default to first
  };
  const getMutationCount = async (h) => {
    if (typeof io.getMutationCount === 'function') return Number(await io.getMutationCount(h)) || 0;
    const arr = Array.isArray(h?.mutations) ? h.mutations : [];
    return arr.length;
  };
  const hasMutation = async (h, name) => {
    if (typeof io.hasMutation === 'function') return !!(await io.hasMutation(h, name));
    const arr = Array.isArray(h?.mutations) ? h.mutations : [];
    return arr.some((m) => (m?.name || m) === name);
  };

  // --- Roll event
  const roll = forcedRoll ?? (await safeRoll(2, 6, 'Mutant Quarter Event')).reduce((a, b) => a + b, 0);
  const idx = idxFrom2d6(roll);
  await note(`Mutant Quarter Event Roll: ${roll}`);

  switch (roll) {
    // 2: Writhing Mass of Flesh – Lore 6+ to stop. Each 6+ = 20XP. D6 for each building: 1–2 destroyed.
    case 2: {
      if (hId) {
        const ok = await doTest({ hero, key: 'Lore', target: 6, label: 'Writhing Mass of Flesh' });
        if (ok) {
          // Bonus dice to look for 6+; default 1 die, but allow UI to choose more if desired
          const dice = await safeRoll(1, 6, 'Writhing Mass bonus dice');
          const sixes = dice.filter((d) => d >= 6).length;
          const xp = sixes * 20;
          if (xp) actions.push({ type: 'ADD_XP', heroId: hId, amount: xp, reason: 'Writhing Mass (6+ dice)' });
          await note(`Writhing Mass — success. ${sixes} successes → +${xp} XP.`);
        } else {
          await note('Writhing Mass — you fail to stop the destruction.');
        }
      }

      // Request town to roll for each building or do it here if you have IDs
      let buildingIds = [];
      try {
        if (typeof io.getAllBuildingIds === 'function') {
          buildingIds = await io.getAllBuildingIds();
        }
      } catch { /* ignore */ }

      if (buildingIds && buildingIds.length) {
        for (const bid of buildingIds) {
          const die = (await safeRoll(1, 6, `Building check: ${bid}`))[0];
          if (die <= 2) {
            actions.push({ type: 'CLOSE_LOCATION', locationId: bid, reason: 'Writhing Mass: Destroyed' });
          }
        }
        await note('Writhing Mass — buildings rolled; any 1–2 are destroyed for this Stay.');
      } else {
        actions.push({
          type: 'REQUEST_TOWN_BUILDING_ROLLS',
          payload: { source: 'Writhing Mass of Flesh', rule: 'D6 each; 1–2 destroyed' },
        });
        await note('Writhing Mass — prompt the town to roll D6 for each building (1–2 destroyed).');
      }
      break;
    }

    // 3: "One of us!" – STR 6+ or gain D3 Mutations and lose D3 Dark Stone (fallback)
    case 3: {
      if (!hId) break;
      const ok = await doTest({ hero, key: 'Strength', target: 6, label: 'One of us! One of us!' });
      if (!ok) {
        const m = D3();
        for (let i = 0; i < m; i++) {
          actions.push({ type: 'ROLL_ON_CHART', heroId: hId, chart: 'mutation', die: 1, reason: 'One of us!' });
        }
        const ds = D3(); // amount not specified in text; using D3 by default
        actions.push({ type: 'MODIFY_DARK_STONE', heroId: hId, delta: -ds, reason: 'One of us!' });
        await note(`“One of us!” — You gain ${m} mutation(s) and lose ${ds} Dark Stone.`);
      } else {
        await note('“One of us!” — You steel yourself and resist.');
      }
      break;
    }

    // 4: Railworkers’ Strike – This & 2 other buildings: D6; 1–2 closed. Escape = D6 Wounds ignoring Defense.
    case 4: {
      // Close check for current location
      const selfDie = (await safeRoll(1, 6, 'Strike (this building)'))[0];
      if (selfDie <= 2) {
        actions.push({ type: 'CLOSE_LOCATION', locationId, reason: 'Railworkers’ Strike' });
      }
      // Ask town layer to pick/roll 2 other buildings
      actions.push({
        type: 'REQUEST_TOWN_BUILDING_ROLLS',
        payload: { count: 2, rule: 'D6 each; 1–2 closed', source: 'Railworkers’ Strike' },
      });
      await note('Railworkers’ Strike — rolling for closures; this and 2 other buildings may close.');

      // Escape damage to heroes here
      const wounds = (await safeRoll(1, 6, 'Escape wounds'))[0];
      for (const h of here) {
        const id = h?.id || h?.localId;
        if (!id) continue;
        actions.push({ type: 'APPLY_WOUNDS', heroId: id, amount: wounds, ignoreDefense: true, reason: 'Railworkers’ Strike (escape)' });
      }
      await note(`Railworkers’ Strike — each present hero takes ${wounds} Wounds (ignoring Defense).`);
      break;
    }

    // 5: Little Thief – Agility 5+ or lose 3 Side Bag Tokens OR D3 Dark Stone. Pass = +20XP.
    case 5: {
      if (!hId) break;
      const ok = await doTest({ hero, key: 'Agility', target: 5, label: 'Little Thief' });
      if (ok) {
        actions.push({ type: 'ADD_XP', heroId: hId, amount: 20, reason: 'Little Thief (caught them!)' });
        await note('Little Thief — success: +20 XP.');
      } else {
        const choice = await choose({
          title: 'Little Thief (you failed)',
          message: 'Choose what you lose:',
          choices: [
            { key: 'tokens', label: 'Lose 3 Side Bag Tokens (random)' },
            { key: 'darkstone', label: 'Lose D3 Dark Stone' },
          ],
        });
        if (choice === 'tokens') {
          actions.push({ type: 'LOSE_SIDE_BAG_TOKENS', heroId: hId, count: 3, reason: 'Little Thief' });
          await note('Little Thief — you lose 3 Side Bag Tokens.');
        } else {
          const ds = D3();
          actions.push({ type: 'MODIFY_DARK_STONE', heroId: hId, delta: -ds, reason: 'Little Thief' });
          await note(`Little Thief — you lose ${ds} Dark Stone.`);
        }
      }
      break;
    }

    // 6: Street Beggers – Pay D6×$10 OR gain +1 Grit.
    case 6: {
      if (!hId) break;
      const choice = await choose({
        title: 'Street Beggars',
        message: 'Pay D6×$10 OR gain +1 Grit.',
        choices: [
          { key: 'pay', label: 'Pay D6×$10' },
          { key: 'grit', label: 'Gain +1 Grit' },
        ],
      });
      if (choice === 'pay') {
        const fee = (await safeRoll(1, 6, 'Beggars fee'))[0] * 10;
        actions.push({ type: 'MODIFY_GOLD', heroId: hId, delta: -fee, reason: 'Street Beggars' });
        await note(`Street Beggars — you pay $${fee}.`);
      } else {
        actions.push({ type: 'ADD_GRIT', heroId: hId, amount: 1, reason: 'Street Beggars' });
        await note('Street Beggars — you gain +1 Grit.');
      }
      break;
    }

    // 7: No Event
    case 7: {
      await note('Ricketty Buildings and Deformities Galore — No Event.');
      break;
    }

    // 8: Mutant Saloon – +1 Tequila; optional $25 performance: +15XP, then D6 3+ → +1 Grit & +1 Corruption Hit.
    case 8: {
      if (!hId) break;
      actions.push({ type: 'ADD_SIDE_BAG_TOKEN', heroId: hId, tokenId: 'tequila', amount: 1, reason: 'Mutant Saloon' });
      await note('Mutant Saloon — you gain 1 Tequila token.');
      const goOn = await choose({
        title: 'Mutant Saloon',
        message: 'Pay $25 to perform for +15XP? (Then roll D6; 3+ gain +1 Grit & +1 Corruption Hit.)',
        choices: [
          { key: 'yes', label: 'Pay $25 and perform' },
          { key: 'no', label: 'Skip the performance' },
        ],
      });
      if (goOn === 'yes') {
        actions.push({ type: 'MODIFY_GOLD', heroId: hId, delta: -25, reason: 'Mutant Saloon performance' });
        actions.push({ type: 'ADD_XP', heroId: hId, amount: 15, reason: 'Mutant Saloon performance' });
        const die = (await safeRoll(1, 6, 'Performance result'))[0];
        if (die >= 3) {
          actions.push({ type: 'ADD_GRIT', heroId: hId, amount: 1, reason: 'Mutant Saloon performance' });
          actions.push({ type: 'MODIFY_CORRUPTION_HITS', heroId: hId, delta: +1, reason: 'Mutant Saloon performance' });
          await note('Performance result — 3+: +1 Grit and +1 Corruption Hit.');
        } else {
          await note('Performance result — no extra effect.');
        }
      }
      break;
    }

    // 9: Party in the Streets – Luck 4+ → Heal D6 Health & D6 Sanity. If any 6 rolled, +1 Sanity (once per Stay).
    case 9: {
      if (!hId) break;
      const ok = await doTest({ hero, key: 'Luck', target: 4, label: 'Party in the Streets' });
      if (ok) {
        const h = (await safeRoll(1, 6, 'Party heal Health'))[0];
        const s = (await safeRoll(1, 6, 'Party heal Sanity'))[0];
        actions.push({ type: 'HEAL_HEALTH', heroId: hId, amount: h, reason: 'Party in the Streets' });
        actions.push({ type: 'HEAL_SANITY', heroId: hId, amount: s, reason: 'Party in the Streets' });

        // One-time +1 Sanity per Stay if any 6 was rolled on the healing dice
        const stayMods = townState?.stayMods || {};
        const onceKey = `partyBonus_${hId}`;
        if (!stayMods[onceKey] && (h === 6 || s === 6)) {
          actions.push({ type: 'MODIFY_SANITY', heroId: hId, delta: +1, reason: 'Party in the Streets (bonus)' });
          const nextStayMods = { ...stayMods, [onceKey]: true };
          townState = { ...(townState || {}), stayMods: nextStayMods };
          actions.push({ type: 'FLAG_STAY_MOD', key: onceKey, value: true, reason: 'Party bonus used' });
          await note('Party in the Streets — bonus +1 Sanity (once per Stay).');
        } else {
          await note(`Party in the Streets — healed ${h} Health and ${s} Sanity.`);
        }
      } else {
        await note('Party in the Streets — you fail the Luck test. Nothing happens.');
      }
      break;
    }

    // 10: Street Vendor – Heal D6 Health & D6 Sanity; +25XP; also get 1 token per Mutation you have.
    case 10: {
      if (!hId) break;
      const h = (await safeRoll(1, 6, 'Vendor heal Health'))[0];
      const s = (await safeRoll(1, 6, 'Vendor heal Sanity'))[0];
      actions.push({ type: 'HEAL_HEALTH', heroId: hId, amount: h, reason: 'Street Vendor' });
      actions.push({ type: 'HEAL_SANITY', heroId: hId, amount: s, reason: 'Street Vendor' });
      actions.push({ type: 'ADD_XP', heroId: hId, amount: 25, reason: 'Street Vendor' });

      const mCount = await getMutationCount(hero);
      if (mCount > 0) {
        // Let the UI decide which tokens; we just request selection count
        actions.push({ type: 'REQUEST_TOKEN_SELECTION', heroId: hId, count: mCount, reason: 'Street Vendor (per Mutation)' });
        await note(`Street Vendor — healed ${h}/${s}, +25XP, and request ${mCount} token(s) (per Mutation).`);
      } else {
        await note(`Street Vendor — healed ${h}/${s} and +25XP.`);
      }
      break;
    }

    // 11: Preaching the Faith – +1 Spirit (next Adventure) and remove 2 Corruption Hits.
    case 11: {
      if (!hId) break;
      actions.push({ type: 'TEMP_STAT_MOD', heroId: hId, key: 'Spirit', delta: +1, scope: 'nextAdventure', reason: 'Preaching the Faith' });
      actions.push({ type: 'MODIFY_CORRUPTION_HITS', heroId: hId, delta: -2, reason: 'Preaching the Faith' });
      await note('Preaching the Faith — +1 Spirit (next Adventure) and remove 2 Corruption Hits.');
      break;
    }

    // 12: A Few New Tricks – Gain D6×25XP. If you have Tentacle or Tail mutation, +1 Extra Use on it.
    case 12: {
      if (!hId) break;
      const die = (await safeRoll(1, 6, 'New Tricks XP'))[0];
      const xp = die * 25;
      actions.push({ type: 'ADD_XP', heroId: hId, amount: xp, reason: 'A Few New Tricks' });

      const hasTentacle = await hasMutation(hero, 'Tentacle');
      const hasTail = await hasMutation(hero, 'Tail');
      if (hasTentacle) {
        actions.push({ type: 'INCREMENT_MUTATION_EXTRA_USES', heroId: hId, mutationName: 'Tentacle', amount: 1, reason: 'A Few New Tricks' });
      }
      if (hasTail) {
        actions.push({ type: 'INCREMENT_MUTATION_EXTRA_USES', heroId: hId, mutationName: 'Tail', amount: 1, reason: 'A Few New Tricks' });
      }
      await note(`A Few New Tricks — +${xp} XP${hasTentacle || hasTail ? ' and +1 extra use for Tentacle/Tail.' : '.'}`);
      break;
    }

    default:
      await note('No matching event branch.');
  }

  return { actions, townState, log, eventRoll: roll, eventIndex: idx };
}
