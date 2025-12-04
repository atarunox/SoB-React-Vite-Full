// src/utils/locationHandlers/indianTradingPostEventHandler.js

/**
 * Indian Trading Post (2d6) event handler
 * -------------------------------------------------------------
 * Pure logic; no UI. Returns:
 *  - actions[]  : intents for your reducers/effects
 *  - townState  : updated with stayMods/dayMods as needed
 *  - log[]      : human-readable steps
 */

// Helper: roll ND6
const rollND = (n, sides = 6) =>
  Array.from({ length: n }, () => Math.floor(Math.random() * sides) + 1);

// Map 2d6 roll (2..12) to array index (0..10)
const idxFrom2d6 = (roll) => Math.max(0, Math.min(10, roll - 2));

const D6 = () => Math.floor(Math.random() * 6) + 1;

export async function handleIndianTradingPostEvent({
  hero,
  townState,
  io = {},
  forcedRoll = null,
  posseApi = {},
  uiApi = {},
}) {
  console.log('[IndianTradingPost Handler] CALLED with:', { hero, townState, io, forcedRoll, posseApi, uiApi });

  const log = [];
  const actions = [];
  const hId = hero?.id || hero?.localId;
  const locationId = 'indianTradingPost';

  // Get all heroes at the Indian Trading Post
  const getHeroesAtShop = posseApi?.getHeroesAtShop || io?.posseApi?.getHeroesAtShop || (() => []);
  const heroesAtLocation = getHeroesAtShop('indianTradingPost');

  console.log('[IndianTradingPost Handler] heroesAtLocation:', heroesAtLocation);

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

  const putDayMod = (key, value, reason) => {
    const dayMods = { ...(townState?.dayMods || {}), [key]: value };
    townState = { ...(townState || {}), dayMods };
    actions.push({ type: 'SET_DAY_MOD', key, value, reason });
  };

  // --- Roll event
  const roll = forcedRoll ?? (await safeRoll(2, 6, 'Indian Trading Post Event')).reduce((a, b) => a + b, 0);
  const idx = idxFrom2d6(roll);
  await note(`Indian Trading Post Event Roll: ${roll}`);

  // --- Event switch
  switch (roll) {
    // 2: Spirits Running Amok – Move Darkness D3 forward, all heroes in town take 2D6 Hits
    case 2: {
      const d3 = (await safeRoll(1, 6, 'Darkness advance (D3)'))[0];
      const darknessMove = Math.ceil(d3 / 2); // D3 = (D6+1)/2

      actions.push({
        type: 'ADVANCE_DARKNESS',
        steps: darknessMove,
        reason: 'Indian Trading Post: Spirits Running Amok',
      });

      await note(`Spirits Running Amok — The Darkness marker advances ${darknessMove} steps forward.`);

      // All heroes in town take 2D6 hits
      const allHeroesInTown = posseApi?.getAllHeroes?.() || [];
      for (const heroData of allHeroesInTown) {
        const heroId = heroData?.id || heroData?.localId;
        if (!heroId) continue;

        const hits = (await safeRoll(2, 6, `${heroData.name} Spirit Hits`)).reduce((a, b) => a + b, 0);
        actions.push({
          type: 'TAKE_HITS',
          heroId,
          hits,
          hitType: 'spirit',
          reason: 'Spirits Running Amok',
        });
        await note(`${heroData.name} takes ${hits} Hits from raging spirits!`);
      }
      break;
    }

    // 3: Possessed Shaman – Spirit Cleansing/Vision Quest not available. Heroes with Lore 3+ may help
    case 3: {
      // Disable services for this day
      putDayMod('spiritCleansingDisabled', true, 'Possessed Shaman');
      putDayMod('visionQuestDisabled', true, 'Possessed Shaman');

      await note(`Possessed Shaman — One of the shamans has been possessed! Spirit Cleansing and Vision Quests are not available today.`);

      // Check if any heroes with Lore 3+ want to help
      if (heroesAtLocation && heroesAtLocation.length > 0) {
        for (const heroId of heroesAtLocation) {
          const currentHero = posseApi?.getHero?.(heroId) || null;
          if (!currentHero) continue;

          // Check Lore stat
          const totals = posseApi?.getTotalsForHero?.(heroId);
          const lore = totals?.Lore || currentHero.stats?.Lore || currentHero.lore || 0;

          if (lore >= 3) {
            await note(`\n--- ${currentHero.name} (Lore ${lore}) ---`);

            const decision = await choose({
              title: `Possessed Shaman (${currentHero.name})`,
              message: `${currentHero.name} has Lore ${lore}. Do you want to attempt to help banish the demon? Make a Lore 6+ test. Pass: Recover Grit and gain 25XP per 6+ rolled. Fail: Take D6 Horror Hits per 1 rolled.`,
              choices: [
                { key: 'help', label: 'Attempt to help (Lore 6+ test)' },
                { key: 'skip', label: 'Do not help' },
              ],
            });

            if (decision === 'help') {
              const passed = await doTest({ hero: currentHero, key: 'Lore', target: 6, label: 'Banish Demon' });

              if (passed) {
                // Recover Grit
                actions.push({ type: 'ADD_GRIT', heroId, amount: 1, reason: 'Banished Demon' });
                await note(`${currentHero.name} passed! Recover 1 Grit.`);

                // For each 6+ rolled, gain 25XP (we need the actual rolls)
                // Since doTest doesn't return rolls, we'll give base 25XP
                actions.push({ type: 'ADD_XP', heroId, amount: 25, reason: 'Banished Demon' });
                await note(`${currentHero.name} gains 25 XP for helping banish the demon!`);
              } else {
                // Take D6 Horror Hits per 1 rolled (approximate: 1D6 Horror Hits)
                const horrorHits = (await safeRoll(1, 6, `${currentHero.name} Horror Hits`))[0];
                actions.push({
                  type: 'TAKE_HITS',
                  heroId,
                  hits: horrorHits,
                  hitType: 'horror',
                  reason: 'Failed to banish demon',
                });
                await note(`${currentHero.name} failed! Takes ${horrorHits} Horror Hits.`);
              }
            }
          }
        }
      }
      break;
    }

    // 4-5: Unfriendly Welcome – Prices +$50 for non-Tribal heroes
    case 4:
    case 5: {
      putDayMod('indianTradingPostUnfriendly', true, 'Unfriendly Welcome');
      await note('Unfriendly Welcome — All prices at the Indian Trading Post are +$50 for any Hero that is not Keyword Tribal (including normally Free items).');
      break;
    }

    // 6-8: Drumming, Dancing, and a Bonfire – No Event
    case 6:
    case 7:
    case 8: {
      await note('Drumming, Dancing, and a Bonfire — All the signs of a good time. No Event.');
      break;
    }

    // 9-10: Trade Opportunities – Sell Gear/Artifacts for D6×$25, Dark Stone for $100/shard
    case 9:
    case 10: {
      putDayMod('indianTradingPostTrade', true, 'Trade Opportunities');
      await note('Trade Opportunities — The local tribe is gearing up for a major hunt! Heroes at the Indian Trading Post may sell Gear and Artifact cards for D6×$25 each, and may sell Dark Stone for $100 per shard today.');
      break;
    }

    // 11: Animal Messenger – Gain Spirit Armor 5+ and KO protection for next Adventure
    case 11: {
      if (!heroesAtLocation || heroesAtLocation.length === 0) {
        await note('Animal Messenger — An owl flies down, but no heroes are here to receive its blessing.');
        break;
      }

      await note('Animal Messenger — An owl flies down and lands on a sign post, looking at you with knowing eyes...');

      for (const heroId of heroesAtLocation) {
        const currentHero = posseApi?.getHero?.(heroId) || null;
        if (!currentHero) continue;

        // Grant temporary buff
        actions.push({
          type: 'GRANT_TEMP_CONDITION',
          heroId,
          condition: {
            id: 'animal_messenger_blessing',
            name: 'Animal Messenger Blessing',
            type: 'temporary',
            effect: 'Spirit Armor 5+. First time KO\'d, do not roll Injury/Madness.',
            expires: 'nextAdventure',
            addedAt: Date.now(),
          },
          reason: 'Animal Messenger',
        });

        await note(`${currentHero.name} receives the owl's blessing! Gain Spirit Armor 5+ and KO protection for the next Adventure.`);
      }
      break;
    }

    // 12: One With the Spirits – Gain Tribal keyword OR make Spirit 4+ test for +1 Sanity per 4+
    case 12: {
      if (!heroesAtLocation || heroesAtLocation.length === 0) {
        await note('One With the Spirits — The tribe offers entry, but no heroes are here to accept.');
        break;
      }

      await note('One With the Spirits — You are offered entry into the local tribe for your heroic deeds!');

      for (const heroId of heroesAtLocation) {
        const currentHero = posseApi?.getHero?.(heroId) || null;
        if (!currentHero) continue;

        const hasTribal = currentHero.keywords?.some(k => String(k).toLowerCase() === 'tribal');

        if (!hasTribal) {
          // Offer Tribal keyword
          const decision = await choose({
            title: `One With the Spirits (${currentHero.name})`,
            message: `${currentHero.name}, you are offered the Keyword Tribal! Do you accept?`,
            choices: [
              { key: 'accept', label: 'Accept Keyword: Tribal' },
              { key: 'decline', label: 'Decline' },
            ],
          });

          if (decision === 'accept') {
            actions.push({
              type: 'ADD_KEYWORD',
              heroId,
              keyword: 'Tribal',
              reason: 'One With the Spirits',
            });
            await note(`${currentHero.name} accepts and gains the Keyword: Tribal!`);
          } else {
            await note(`${currentHero.name} respectfully declines.`);
          }
        } else {
          // Already Tribal: make Spirit 4+ test
          await note(`${currentHero.name} is already Tribal. You may make a Spirit 4+ test to deepen your connection.`);

          const totals = posseApi?.getTotalsForHero?.(heroId);
          const spirit = totals?.Spirit || currentHero.stats?.Spirit || currentHero.spirit || 0;

          if (spirit > 0) {
            const passed = await doTest({ hero: currentHero, key: 'Spirit', target: 4, label: 'Spirit Connection' });
            if (passed) {
              // In actual implementation, count how many 4+ were rolled
              // For now, assume 1 success = +1 Sanity
              actions.push({
                type: 'MODIFY_SANITY',
                heroId,
                delta: 1,
                reason: 'One With the Spirits',
              });
              await note(`${currentHero.name} passed the Spirit test! Gain +1 Sanity.`);
            } else {
              await note(`${currentHero.name} failed the Spirit test.`);
            }
          } else {
            await note(`${currentHero.name} has Spirit 0 and cannot attempt the test.`);
          }
        }
      }
      break;
    }

    default:
      await note('No matching event branch.');
  }

  return { actions, townState, log, eventRoll: roll, eventIndex: idx };
}
