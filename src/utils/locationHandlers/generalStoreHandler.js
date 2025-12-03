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

const D6 = () => Math.floor(Math.random() * 6) + 1;
const rollND = (n, s) => Array.from({ length: n }, () => Math.floor(Math.random() * s) + 1);
const sum = (arr) => arr.reduce((a, b) => a + b, 0);

export const roll2d6 = () => sum(rollND(2, 6));
export const idxFrom2d6 = (roll) => Math.max(0, Math.min(10, (roll ?? 2) - 2));

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
  posseApi = {},
  uiApi = {},
}) {
  const log = [];
  const actions = [];
  const hId = hero?.id || hero?.localId;
  const locationId = 'generalStore';

  // Get all heroes at the general store
  const getHeroesAtShop = posseApi?.getHeroesAtShop || io?.posseApi?.getHeroesAtShop || (() => []);
  const heroesAtStore = getHeroesAtShop('general_store');

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

    // 3: Robbery – Every Hero in the General Store must either pay D6×$10 OR Agility 5+ to stop robbery for $100. Fail = Injury Chart.
    case 3: {
      if (!heroesAtStore || heroesAtStore.length === 0) break;

      await note(`Robbery! Masked gunmen burst into the shop. Every hero in the General Store must respond.`);

      // Process each hero at the store
      for (const heroId of heroesAtStore) {
        const currentHero = posseApi?.getHero?.(heroId) || posseApi?.getHeroById?.(heroId) || null;
        if (!currentHero) continue;

        await note(`\n--- ${currentHero.name} ---`);

        const decision = await choose({
          title: `Robbery! (${currentHero.name})`,
          message: `${currentHero.name} must either hand over D6×$10 (or as much as they have), or make an Agility 5+ test. Pass: turn them off and the shop owner rewards you with $100. Fail: you are shot; roll once on the Injury Chart.`,
          choices: [
            { key: 'pay', label: 'Pay D6×$10' },
            { key: 'test', label: 'Attempt Agility 5+' },
          ],
        });

        if (decision === 'pay') {
          const die = (await safeRoll(1, 6, `${currentHero.name} Robbery fee`))[0];
          const fee = die * 10;
          const heroGold = currentHero.gold || 0;
          const actualFee = Math.min(fee, heroGold);
          actions.push({ type: 'MODIFY_GOLD', heroId, delta: -actualFee, reason: 'Robbery (fee)' });
          await note(`${currentHero.name} pays $${actualFee} (rolled ${die}, would be $${fee}).`);
        } else {
          const ok = await doTest({ hero: currentHero, key: 'Agility', target: 5, label: `${currentHero.name} Robbery` });
          if (ok) {
            actions.push({ type: 'MODIFY_GOLD', heroId, delta: +100, reason: 'Robbery reward' });
            await note(`${currentHero.name} — Agility 5+ success! They turn off the robbers and gain $100 reward.`);
          } else {
            actions.push({
              type: 'ROLL_ON_CHART',
              heroId,
              chart: 'injury',
              die: 1,
              reason: 'General Store: Robbery (failed)',
            });
            await note(`${currentHero.name} — Agility test failed. They are shot! Roll 1D6 on the Injury chart.`);
          }
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

    // 11: New Items in Stock – Draw 3 Gear cards. Anyone in the General Store may purchase.
    case 11: {
      // Store the gear cards in townState so all heroes at the store can see them
      const dayMods = { ...(townState?.dayMods || {}) };

      // Create placeholder gear cards (in a real implementation, these would be drawn from a deck)
      dayMods.generalStoreNewItems = {
        items: [
          {
            id: 'event_gear_1',
            name: 'Mystery Gear Item 1',
            description: 'Draw a Gear card',
            cost: 25,
            slot: 'Gear',
            effect: 'This is a placeholder. Draw from Gear deck.',
            tags: ['Event Item', 'New Stock'],
          },
          {
            id: 'event_gear_2',
            name: 'Mystery Gear Item 2',
            description: 'Draw a Gear card',
            cost: 25,
            slot: 'Gear',
            effect: 'This is a placeholder. Draw from Gear deck.',
            tags: ['Event Item', 'New Stock'],
          },
          {
            id: 'event_gear_3',
            name: 'Mystery Gear Item 3',
            description: 'Draw a Gear card',
            cost: 25,
            slot: 'Gear',
            effect: 'This is a placeholder. Draw from Gear deck.',
            tags: ['Event Item', 'New Stock'],
          },
        ],
        createdAt: Date.now(),
      };

      townState = { ...(townState || {}), dayMods };
      actions.push({
        type: 'SET_DAY_MOD',
        key: 'generalStoreNewItems',
        value: dayMods.generalStoreNewItems,
        reason: 'General Store: New Items in Stock',
      });

      await note('New Items in Stock — 3 new Gear cards are available! Any hero in the General Store may purchase them for $25 each (or listed price). Check the "Event Items" tab.');
      break;
    }

    // 12: Artifact for Sale – Draw a World + Artifact card. Anyone in the General Store may purchase.
    case 12: {
      // Store the artifact in townState so all heroes at the store can see it
      const dayMods = { ...(townState?.dayMods || {}) };

      // Create placeholder artifact (in a real implementation, this would be drawn from World + Artifact decks)
      dayMods.generalStoreArtifact = {
        item: {
          id: 'event_artifact_1',
          name: 'Mystery Artifact',
          description: 'Draw a World Card, then draw an Artifact from that world',
          cost: 100,
          slot: 'Artifact',
          effect: 'This is a placeholder. Draw from World deck, then Artifact deck.',
          tags: ['Event Item', 'Artifact', 'Rare'],
          lore: 'Brought back from a recent expedition.',
        },
        createdAt: Date.now(),
      };

      townState = { ...(townState || {}), dayMods };
      actions.push({
        type: 'SET_DAY_MOD',
        key: 'generalStoreArtifact',
        value: dayMods.generalStoreArtifact,
        reason: 'General Store: Artifact for Sale',
      });

      await note('Artifact for Sale — A rare artifact is available! Any hero in the General Store may purchase it for $100 (or listed price). Check the "Event Items" tab.');
      break;
    }

    default:
      await note('No matching event branch.');
  }

  return { actions, townState, log, eventRoll: roll, eventIndex: idx };
}
