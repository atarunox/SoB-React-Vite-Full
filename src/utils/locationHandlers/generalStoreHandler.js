// src/logic/handlers/generalStoreHandler.js

/**
 * General Store (2d6) event handler
 * -------------------------------------------------------------
 * Pure logic; no UI. Returns:
 *  - actions[]  : intents for your reducers/effects
 *  - townState  : updated with stayMods/dayMods as needed
 *  - log[]      : human-readable steps
 *
 * Expected/used action types (examples your app should support):
 *  - { type: 'CLOSE_LOCATION', locationId, reason }
 *  - { type: 'FLAG_STAY_MOD', key, value, reason }                 // persists for Town Stay
 *  - { type: 'MODIFY_GOLD', heroId, delta, reason }
 *  - { type: 'ROLL_ON_CHART', heroId, chart: 'injury', die: 1, reason }
 *  - { type: 'REQUEST_CHOICE', heroId, key, choices, message }      // optional UI hook
 *  - { type: 'DRAW_GEAR_CHOICES', heroId, count, offer: { priceOverride }, reason }
 *  - { type: 'DRAW_WORLD_ARTIFACT_OFFER', heroId, price, reason }   // price is special offer ($100)
 */

import { d6 as D6, rollND, sum, roll2d6, idxFrom2d6 } from '../../utils/diceHelpers';
export { roll2d6, idxFrom2d6 };

/**
 * Optional I/O hooks (all optional):
 *  io = {
 *    roll: (n, sides, label) => number[] | Promise<number[]>,
 *    notify: (msg) => void | Promise<void>,
 *    test: ({ hero, key, target, label }) => boolean | Promise<boolean>,  // e.g., Agility 5+
 *    selectChoice: ({ title, message, choices }) => key | Promise<key>,   // for Robbery choice
 *  }
 */

export async function handleGeneralStoreEvent({
  hero,
  townState,
  io = {},
  forcedRoll = null,
}) {
  const log = [];
  const actions = [];
  const hId = hero?.id || hero?.localId;
  const locationId = 'generalStore';

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
    const die = D6(); // RNG fallback
    return die >= target;
  };
  const choose = async ({ title, message, choices }) => {
    if (typeof io.selectChoice === 'function') return io.selectChoice({ title, message, choices });
    return choices?.[0]?.key; // default to first
  };

  const putStayMod = (key, value, reason) => {
    const stayMods = { ...(townState?.stayMods || {}), [key]: value };
    townState = { ...(townState || {}), stayMods };
    actions.push({ type: 'FLAG_STAY_MOD', key, value, reason });
  };

  // Helper: price modifiers for the General Store
  // - Cost Increase: +$50 to items (min unaffected)
  // - Fire Sale: -$50 to items (min $25)
  // These cancel each other.
  const setCostIncrease = () => {
    const mods = { ...(townState?.stayMods || {}) };
    delete mods.generalStoreFireSale;         // cancel Fire Sale
    mods.generalStorePriceDelta = 50;         // +$50
    mods.generalStoreMinPrice = undefined;    // no special min
    townState = { ...(townState || {}), stayMods: mods };
    actions.push({ type: 'FLAG_STAY_MOD', key: 'generalStorePriceDelta', value: 50, reason: 'Cost Increase' });
    actions.push({ type: 'FLAG_STAY_MOD', key: 'generalStoreMinPrice', value: undefined, reason: 'Cost Increase' });
  };

  const setFireSale = () => {
    const mods = { ...(townState?.stayMods || {}) };
    delete mods.generalStorePriceDelta;       // cancel Cost Increase
    mods.generalStoreFireSale = true;
    mods.generalStorePriceDelta = -50;        // -$50
    mods.generalStoreMinPrice = 25;           // min $25
    townState = { ...(townState || {}), stayMods: mods };
    actions.push({ type: 'FLAG_STAY_MOD', key: 'generalStorePriceDelta', value: -50, reason: 'Fire Sale' });
    actions.push({ type: 'FLAG_STAY_MOD', key: 'generalStoreMinPrice', value: 25, reason: 'Fire Sale' });
    actions.push({ type: 'FLAG_STAY_MOD', key: 'generalStoreFireSale', value: true, reason: 'Fire Sale' });
  };

  // --- Roll event
  const roll = forcedRoll ?? (await safeRoll(2, 6, 'General Store Event')).reduce((a, b) => a + b, 0);
  const idx = idxFrom2d6(roll);
  await note(`General Store Event Roll: ${roll}`);

  switch (roll) {
    // 2: Closed – No Heroes may visit until after the next Adventure.
    case 2: {
      actions.push({ type: 'CLOSE_LOCATION', locationId, reason: 'Closed (until after the next Adventure)' });
      putStayMod('generalStoreClosed', true, 'General Store Closed');
      await note('Closed — The General Store is closed for this entire Town Stay.');
      break;
    }

    // 3: Robbery – Pay D6×$10 OR Agility 5+ to stop robbery for $100. Fail = Injury Chart.
    case 3: {
      if (!hId) break;
      const decision = await choose({
        title: 'Robbery!',
        message: 'Pay D6×$10 to safely stop it and claim $100, or attempt Agility 5+ (on fail, Injury chart)?',
        choices: [
          { key: 'pay', label: 'Pay D6×$10 and claim $100' },
          { key: 'test', label: 'Attempt Agility 5+' },
        ],
      });

      if (decision === 'pay') {
        const die = (await safeRoll(1, 6, 'Robbery fee'))[0];
        const fee = die * 10;
        actions.push({ type: 'MODIFY_GOLD', heroId: hId, delta: -fee, reason: 'Robbery (fee)' });
        actions.push({ type: 'MODIFY_GOLD', heroId: hId, delta: +100, reason: 'Robbery reward' });
        await note(`Robbery — you pay $${fee} and receive a $100 reward (net +$${100 - fee}).`);
      } else {
        const ok = await doTest({ hero, key: 'Agility', target: 5, label: 'Robbery' });
        if (ok) {
          actions.push({ type: 'MODIFY_GOLD', heroId: hId, delta: +100, reason: 'Robbery reward' });
          await note('Robbery — Agility 5+ success! You gain $100.');
        } else {
          actions.push({
            type: 'ROLL_ON_CHART',
            heroId: hId,
            chart: 'injury',
            die: 1,
            reason: 'General Store: Robbery (failed)',
          });
          await note('Robbery — you fail the Agility test. Roll 1D6 on the Injury chart.');
        }
      }
      break;
    }

    // 4–5: Cost Increase – All prices +$50. Cancels out Fire Sale.
    case 4:
    case 5: {
      setCostIncrease();
      await note('Cost Increase — All General Store prices are +$50 for this Town Stay (cancels Fire Sale).');
      break;
    }

    // 6–8: No Event
    case 6:
    case 7:
    case 8: {
      await note('Flies are a’ Buzzing — No Event.');
      break;
    }

    // 9–10: Fire Sale – All prices –$50 (min $25). Cancels Cost Increase.
    case 9:
    case 10: {
      setFireSale();
      await note('Fire Sale — All General Store prices are -$50 (min $25) for this Town Stay (cancels Cost Increase).');
      break;
    }

    // 11: New Items in Stock – Draw 3 Gear cards. Buy one at price or $25.
    case 11: {
      if (!hId) break;
      actions.push({
        type: 'DRAW_GEAR_CHOICES',
        heroId: hId,
        count: 3,
        offer: { priceOverride: 25 }, // UI: allow purchasing one of the three for $25 (or at listed price)
        reason: 'General Store: New Items in Stock',
      });
      await note('New Items in Stock — Draw 3 Gear cards; you may buy one for $25 (or at listed price).');
      break;
    }

    // 12: Artifact for Sale – Draw a World + Artifact card. Buy at price or $100.
    case 12: {
      if (!hId) break;
      actions.push({
        type: 'DRAW_WORLD_ARTIFACT_OFFER',
        heroId: hId,
        price: 100, // special offer
        reason: 'General Store: Artifact for Sale',
      });
      await note('Artifact for Sale — Draw a World + Artifact; you may buy it for $100 (or at listed price).');
      break;
    }

    default:
      await note('No matching event branch.');
  }

  return { actions, townState, log, eventRoll: roll, eventIndex: idx };
}
