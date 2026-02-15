// src/utils/locationHandlers/campSiteHandler.js

/**
 * Camp Site visit handler
 * ---------------------------------------------------------
 * Pure logic. No direct UI. Returns:
 *  - actions[]  : side-effect intents your app can execute (modify gold, add grit, etc.)
 *  - townState  : updated state with day flags (e.g., soberMorning)
 *  - log[]      : human-readable steps for your activity feed
 *
 * Usage:
 * const { actions, townState, log } = await handleCampSiteVisit({ hero, townState, io });
 * actions.forEach(dispatchAction) // your app applies them
 */

const D6 = () => Math.floor(Math.random() * 6) + 1;
const D = (sides) => Math.floor(Math.random() * sides) + 1;
const rollND = (n, sides) => Array.from({ length: n }, () => D(sides));
const sum = (arr) => arr.reduce((a, b) => a + b, 0);
export const roll2d6 = () => sum(rollND(2, 6));
export const idxFrom2d6 = (roll) => Math.max(0, Math.min(10, (roll ?? 2) - 2));

/**
 * Optional I/O hooks to integrate with your UI.
 * Provide any subset; missing hooks fall back to defaults.
 *
 * io = {
 *   // dice/inputs:
 *   roll: (n, sides, label) => number[] | Promise<number[]>,
 *   inputNumber: ({ title, message, min, max, defaultValue }) => number | Promise<number>,
 *   promptChoice: ({ title, message, choices }) => string | Promise<string>, // returns choices[i].key
 *   notify: (msg) => void | Promise<void>,
 *
 *   // knowledge checks (Luck, etc.)
 *   test: ({ hero, key, target, label }) => boolean | Promise<boolean>, // e.g., Luck 4+
 * }
 */

/**
 * Actions your app should handle:
 *  - { type: 'MODIFY_GOLD', heroId, delta, reason }
 *  - { type: 'ADD_GRIT', heroId, amount, reason }
 *  - { type: 'LOSE_RANDOM_ITEM', heroId, reason }
 *  - { type: 'MODIFY_DARK_STONE', heroId, delta, reason } // negative to lose
 *  - { type: 'TRIGGER_SOLO_ADVENTURE', heroId, adventureId: 'HighNoonDuel', reason }
 *  - { type: 'FORCE_LEAVE_TOWN', heroId, reason }
 *  - { type: 'DRAW_GEAR_CARD', heroId, into: 'inventory', reason }
 *  - { type: 'FLAG_DAY_MOD', key: 'soberMorning', value: { targetShops: [...], mod: +1 }, reason }
 */

export async function handleCampSiteVisit({
  hero,
  townState,
  io = {},
  forcedRoll = null, // allow injecting a predetermined 2d6 for tests
}) {
  const log = [];
  const actions = [];
  const hId = hero?.id || hero?.localId;

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

  const askChoice = async (opts) => {
    if (typeof io.promptChoice === 'function') return io.promptChoice(opts);
    // default: pick first choice
    return opts?.choices?.[0]?.key;
  };

  const askNumber = async (opts) => {
    if (typeof io.inputNumber === 'function') return io.inputNumber(opts);
    return opts?.defaultValue ?? opts?.min ?? 0;
  };

  const doTest = async ({ hero, key, target, label }) => {
    if (typeof io.test === 'function') return !!(await io.test({ hero, key, target, label }));
    // default RNG if no test hook
    const roll = D6();
    return roll >= target;
  };

  // --- 1) Roll Camp Event (2–12) ------------------------------------------
  const roll = forcedRoll ?? sum(await safeRoll(2, 6, 'Camp Site Event'));
  const idx = idxFrom2d6(roll);
  await note(`Camp Site Event Roll: ${roll}`);

  // --- 2) Resolve by band (branch on roll) --------------------------------

  // 2: Just My Luck — lose one item OR 2D6 Dark Stone
  if (roll === 2) {
    const choice = await askChoice({
      title: 'Just My Luck',
      message: 'Robbery/accident! Choose what to lose:',
      choices: [
        { key: 'item', label: 'Lose one item' },
        { key: 'darkstone', label: 'Lose 2D6 Dark Stone' },
      ],
    });

    if (choice === 'item') {
      actions.push({ type: 'LOSE_RANDOM_ITEM', heroId: hId, reason: 'Camp Site: Just My Luck' });
      await note('You lose 1 random item.');
    } else {
      const ds = sum(await safeRoll(2, 6, 'Lose Dark Stone (2D6)'));
      actions.push({
        type: 'MODIFY_DARK_STONE',
        heroId: hId,
        delta: -ds,
        reason: 'Camp Site: Just My Luck',
      });
      await note(`You lose ${ds} Dark Stone.`);
    }
  }

  // 3: “My Friend Doesn’t Like You Much!” — High Noon Duel or leave Town
  else if (roll === 3) {
    const choice = await askChoice({
      title: '“My Friend Doesn’t Like You Much!”',
      message: 'Face a Solo Town Adventure "High Noon Duel", or leave Town immediately?',
      choices: [
        { key: 'duel', label: 'Face High Noon Duel (Solo Adventure)' },
        { key: 'leave', label: 'Leave Town immediately' },
      ],
    });

    if (choice === 'duel') {
      actions.push({
        type: 'TRIGGER_SOLO_ADVENTURE',
        heroId: hId,
        adventureId: 'HighNoonDuel',
        reason: 'Camp Site',
      });
      await note('Triggered Solo Adventure: High Noon Duel.');
    } else {
      actions.push({ type: 'FORCE_LEAVE_TOWN', heroId: hId, reason: 'Camp Site: Told to leave' });
      await note('You leave Town immediately.');
    }
  }

  // 4–5: “Step Right Up!” — Pay D6×$20 to gain +1 Grit
  else if (roll === 4 || roll === 5) {
    const costDie = (await safeRoll(1, 6, 'Step Right Up cost D6'))[0];
    const cost = costDie * 20;

    // Ask user to confirm/commit if you want; here we assume they accept the pitch.
    actions.push({ type: 'MODIFY_GOLD', heroId: hId, delta: -cost, reason: 'Step Right Up!' });
    actions.push({ type: 'ADD_GRIT', heroId: hId, amount: 1, reason: 'Step Right Up!' });
    await note(`“Step Right Up!” You pay $${cost} and gain +1 Grit.`);
  }

  // 6–8: No Event
  else if (roll >= 6 && roll <= 8) {
    await note('A Sad Collection of the Poor and Scruffy — No Event.');
  }

  // 9–10: Dirty Poker — Luck 4+, +$25 per success; lose $50 per roll of 1
  else if (roll === 9 || roll === 10) {
    const nRolls = await askNumber({
      title: 'Dirty Poker',
      message:
        'How many hands will you play? (Each is a Luck 4+ test; success earns $25; a natural 1 loses $50.)',
      min: 1,
      max: 10,
      defaultValue: 3,
    });

    let wins = 0;
    let lossOnes = 0;

    for (let i = 0; i < nRolls; i++) {
      // If your test system can report natural 1s, use that; otherwise simulate with a raw D6 for the "1" penalty
      const raw = D6();
      const success = raw >= 4; // Luck 4+ baseline
      if (success) wins++;
      if (raw === 1) lossOnes++;
    }

    const delta = wins * 25 - lossOnes * 50;
    if (delta !== 0) {
      actions.push({
        type: 'MODIFY_GOLD',
        heroId: hId,
        delta,
        reason: 'Camp Site: Dirty Poker',
      });
    }
    await note(
      `Dirty Poker: ${nRolls} hands → ${wins} wins (+$${wins * 25}), ${lossOnes} ones (-$${lossOnes * 50}). Net: $${delta}.`
    );
  }

  // 11: Sober Morning — +1 to Doc’s & Church tents today
  else if (roll === 11) {
    const dayMods = {
      ...(townState?.dayMods || {}),
      soberMorning: { targetShops: ['campDocsTent', 'campChurchTent'], mod: +1 },
    };
    townState = { ...(townState || {}), dayMods };
    actions.push({
      type: 'FLAG_DAY_MOD',
      key: 'soberMorning',
      value: dayMods.soberMorning,
      reason: 'Camp Site: Sober Morning',
    });
    await note('Sober Morning — Doc’s Tent and Church Tent rolls are +1 today.');
  }

  // 12: “What Have We Here?” — draw 1 Gear
  else if (roll === 12) {
    actions.push({
      type: 'DRAW_GEAR_CARD',
      heroId: hId,
      into: 'inventory',
      reason: 'Camp Site: What Have We Here?',
    });
    await note('“What Have We Here?” — You draw 1 Gear card.');
  }

  return { actions, townState, log, eventRoll: roll, eventIndex: idx };
}

/**
 * Convenience: run handler with a specified roll (for testing or scripted outcomes).
 */
export async function handleCampSiteVisitWithRoll(args, exactRoll) {
  return handleCampSiteVisit({ ...args, forcedRoll: exactRoll });
}
