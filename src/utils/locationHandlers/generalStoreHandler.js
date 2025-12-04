// src/logic/handlers/generalStoreHandler.js

import { otherWorldArtifacts } from '../../data/items/otherWorldArtifacts.js';
import { gearCards } from '../../data/items/gearCards.js';

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
  console.log('[GeneralStore Handler] CALLED with:', { hero, townState, io, forcedRoll, posseApi, uiApi });

  const log = [];
  const actions = [];
  const hId = hero?.id || hero?.localId;
  const locationId = 'generalStore';

  // Get all heroes at the general store
  const getHeroesAtShop = posseApi?.getHeroesAtShop || io?.posseApi?.getHeroesAtShop || (() => []);
  const heroesAtStore = getHeroesAtShop('generalStore'); // Use camelCase to match shopDataByID

  console.log('[GeneralStore Handler] getHeroesAtShop function:', getHeroesAtShop);
  console.log('[GeneralStore Handler] heroesAtStore:', heroesAtStore);

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
      console.log('[Event #3 Robbery] heroesAtStore:', heroesAtStore);
      if (!heroesAtStore || heroesAtStore.length === 0) {
        await note('Robbery! But no heroes are currently in the General Store to respond.');
        break;
      }

      await note(`Robbery! Masked gunmen burst into the shop. Every hero in the General Store must respond.`);

      // Process each hero at the store
      for (const heroId of heroesAtStore) {
        const currentHero = posseApi?.getHero?.(heroId) || posseApi?.getHeroById?.(heroId) || null;
        console.log('[Event #3 Robbery] Processing hero:', heroId, currentHero);
        if (!currentHero) {
          console.warn('[Event #3 Robbery] Could not find hero:', heroId);
          continue;
        }

        await note(`\n--- ${currentHero.name} ---`);

        console.log('[Event #3 Robbery] Showing choice prompt for', currentHero.name);
        const decision = await choose({
          title: `Robbery! (${currentHero.name})`,
          message: `${currentHero.name} must either hand over D6×$10 (or as much as they have), or make an Agility 5+ test. Pass: turn them off and the shop owner rewards you with $100. Fail: you are shot; roll once on the Injury Chart.`,
          choices: [
            { key: 'pay', label: 'Pay D6×$10' },
            { key: 'test', label: 'Attempt Agility 5+' },
          ],
        });
        console.log('[Event #3 Robbery] Decision for', currentHero.name, ':', decision);

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
      await note("Flies are a' Buzzing — No Event.");
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
      if (!gearCards || gearCards.length === 0) {
        await note('New Items in Stock — No Gear cards found in data; resolve manually.');
        break;
      }

      // Draw 3 random gear cards from the deck
      const drawnCards = [];
      const availableCards = [...gearCards]; // Copy so we can draw without replacement

      for (let i = 0; i < 3 && availableCards.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availableCards.length);
        const card = availableCards.splice(randomIndex, 1)[0];

        // Format the gear card with all its properties
        drawnCards.push({
          ...card,
          id: card.id || `event_gear_${i + 1}`,
          name: card.name || `Gear Item ${i + 1}`,
          cost: card.value || 25, // Use value as cost, or $25 if no value
          slot: card.slot || 'Gear',
          effects: card.effects || [], // Array of effect strings
          twoHanded: card.twoHanded || false,
          darkStone: card.darkStone || false,
          upgradeSlots: card.upgradeSlots || 0,
          restrictions: card.restrictions || [],
          tags: [...(card.tags || []), 'Event Item', 'New Stock'],
        });
      }

      // Store the gear cards in townState so all heroes at the store can see them
      const dayMods = { ...(townState?.dayMods || {}) };
      dayMods.generalStoreNewItems = {
        items: drawnCards,
        createdAt: Date.now(),
      };

      townState = { ...(townState || {}), dayMods };
      actions.push({
        type: 'SET_DAY_MOD',
        key: 'generalStoreNewItems',
        value: dayMods.generalStoreNewItems,
        reason: 'General Store: New Items in Stock',
      });

      const itemNames = drawnCards.map(c => c.name).join(', ');
      await note(`New Items in Stock — 3 new Gear cards drawn: ${itemNames}. Any hero in the General Store may purchase them for $25 each (or at listed price). Check the "Event Items" tab.`);
      break;
    }

    // 12: Artifact for Sale – Draw a World + Artifact card. Anyone in the General Store may purchase.
    case 12: {
      // Group artifacts by world
      const byWorld = otherWorldArtifacts.reduce((acc, art) => {
        const w = art.world || 'Unknown';
        if (!acc[w]) acc[w] = [];
        acc[w].push(art);
        return acc;
      }, {});

      const worlds = Object.keys(byWorld);
      if (!worlds.length) {
        await note('Artifact for Sale — No OtherWorld Artifacts found in data; resolve manually.');
      } else {
        // Draw a random world
        const world = worlds[Math.floor(Math.random() * worlds.length)];
        const pool = byWorld[world] || [];
        const artifact = pool[Math.floor(Math.random() * pool.length)] || pool[0];

        // Store the artifact in townState so all heroes at the store can see it
        const dayMods = { ...(townState?.dayMods || {}) };

        dayMods.generalStoreArtifact = {
          id: 'gs_world_artifact',
          world,
          artifact: {
            ...artifact,
            id: artifact.id || 'event_artifact_1',
            name: artifact.name || 'Mystery Artifact',
            cost: artifact.cost || artifact.value || 100,
            slot: 'Artifact',
            weight: artifact.weight,
            upgradeSlots: artifact.upgradeSlots,
            darkStone: artifact.darkStone,
            tags: artifact.tags || ['Artifact', 'Other World'],
            effects: artifact.effects,
            lore: artifact.lore || 'Brought back from a recent expedition.',
          },
          // Allow purchase at listed price or $100 if no price
          price: artifact.cost || artifact.value || 100,
          createdAt: Date.now(),
        };

        townState = { ...(townState || {}), dayMods };
        actions.push({
          type: 'SET_DAY_MOD',
          key: 'generalStoreArtifact',
          value: dayMods.generalStoreArtifact,
          reason: 'General Store: Artifact for Sale',
        });

        await note(`Artifact for Sale — World Card drawn: ${world}. Artifact: ${artifact.name}. Any hero in the General Store may purchase it for $${dayMods.generalStoreArtifact.price} (or at listed price). Check the "Event Items" tab.`);
      }
      break;
    }

    default:
      await note('No matching event branch.');
  }

  return { actions, townState, log, eventRoll: roll, eventIndex: idx };
}
