// src/utils/locationHandlers/indianTradingPostHandler.js

/**
 * Indian Trading Post (2d6) event handler
 * -------------------------------------------------------------
 * Pure logic; no UI. Returns:
 *  - actions[]  : intents for your reducers/effects
 *  - townState  : updated with stayMods/dayMods as needed
 *  - log[]      : human-readable steps
 */

import { resolveDefensePerHitThenArmorPerWound } from '../combatResolution.js';

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
    console.log('[IndianTradingPost] doTest called:', { hero: hero?.name, key, target, label, hasTest: typeof io.test });
    if (typeof io.test === 'function') {
      const result = await io.test({ hero, key, target, label });
      console.log('[IndianTradingPost] test returned:', result);
      return !!result;
    }
    console.log('[IndianTradingPost] test not available, using RNG fallback');
    const die = D6(); // RNG fallback
    return die >= target;
  };

  const choose = async ({ title, message, choices }) => {
    console.log('[IndianTradingPost] choose called:', { title, message, choices, hasSelectChoice: typeof io.selectChoice });
    if (typeof io.selectChoice === 'function') {
      const result = await io.selectChoice({ title, message, choices });
      console.log('[IndianTradingPost] selectChoice returned:', result);
      return result;
    }
    console.log('[IndianTradingPost] selectChoice not available, using default');
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
      // Auto-roll D3 for darkness (no prompt needed)
      const d3Roll = Math.floor(Math.random() * 3) + 1;

      actions.push({
        type: 'ADVANCE_DARKNESS',
        steps: d3Roll,
        reason: 'Indian Trading Post: Spirits Running Amok',
      });

      await note(`\n=== SPIRITS RUNNING AMOK ===`);
      await note(`The Darkness marker advances ${d3Roll} steps forward (rolled D3: ${d3Roll}).`);
      await note('');

      // All heroes in town take 2D6 hits
      // Try multiple ways to get heroes
      let allHeroesInTown = posseApi?.getAllHeroes?.() || [];
      console.log('[Event #2] getAllHeroes returned:', allHeroesInTown);
      console.log('[Event #2] getAllHeroes count:', allHeroesInTown.length);

      // Fallback 1: Try listAllTownHeroes
      if (allHeroesInTown.length === 0 && typeof posseApi?.listAllTownHeroes === 'function') {
        allHeroesInTown = posseApi.listAllTownHeroes() || [];
        console.log('[Event #2] listAllTownHeroes returned:', allHeroesInTown.length, 'heroes');
      }

      // Fallback 2: Try getting from io context
      if (allHeroesInTown.length === 0 && io?.posseApi?.getAllHeroes) {
        allHeroesInTown = io.posseApi.getAllHeroes() || [];
        console.log('[Event #2] io.posseApi.getAllHeroes returned:', allHeroesInTown.length, 'heroes');
      }

      // Fallback 3: Get heroes directly from the hero IDs we found at the location
      if (allHeroesInTown.length === 0 && heroesAtLocation && heroesAtLocation.length > 0) {
        console.log('[Event #2] Using heroes at location as fallback:', heroesAtLocation);
        allHeroesInTown = heroesAtLocation
          .map(id => posseApi?.getHero?.(id) || posseApi?.getHeroById?.(id))
          .filter(Boolean);
        console.log('[Event #2] Resolved heroes from location:', allHeroesInTown.length, 'heroes');
      }

      if (allHeroesInTown.length === 0) {
        await note('No heroes found in town to take damage.');
        console.warn('[Event #2] Could not find any heroes through any method!');
      }

      // Helper function to get stat values
      const getStat = (hero, statKey) => {
        const heroId = hero?.id || hero?.localId;
        const totals = posseApi?.getTotalsForHero?.(heroId);
        return totals?.[statKey] || hero?.stats?.[statKey] || hero?.[statKey.toLowerCase()] || 0;
      };

      for (const heroData of allHeroesInTown) {
        const heroId = heroData?.id || heroData?.localId;
        console.log('[Event #2] Processing hero:', heroId, heroData?.name);
        if (!heroId) {
          console.log('[Event #2] Skipping hero - no ID found');
          continue;
        }

        // Auto-roll 2D6 for incoming hits (each hero gets different roll)
        const damageRolls = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
        const totalHits = damageRolls[0] + damageRolls[1];

        await note(`\n--- ${heroData.name || 'Unknown Hero'} ---`);
        await note(`Rolled 2D6 for damage: [${damageRolls[0]}, ${damageRolls[1]}] = ${totalHits} Hits incoming`);

        // Use the combat resolution system for Defense and Armor
        // This will prompt the player to either manually enter results or auto-roll
        const finalWounds = await resolveDefensePerHitThenArmorPerWound({
          ui: uiApi,
          hero: heroData,
          hits: totalHits,
          woundsPerHit: 1, // Each hit that gets through Defense becomes 1 wound
          getStat,
        });

        console.log('[Event #2]', heroData.name, 'takes', finalWounds, 'wounds after defense/armor');

        if (finalWounds > 0) {
          actions.push({
            type: 'TAKE_WOUNDS',
            heroId,
            wounds: finalWounds,
            damageType: 'physical', // Physical damage to Health
            reason: 'Spirits Running Amok',
          });
          await note(`${heroData.name} takes ${finalWounds} wound(s) to Health!`);
        } else {
          await note(`${heroData.name} blocked all damage!`);
        }
      }
      await note('');
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
              message: `${currentHero.name} has Lore ${lore}. Do you want to attempt to help banish the demon?\n\nMake a Lore 6+ test.\n• For each 6+ rolled: Gain 25XP\n• For each 1 rolled: Take D6 Horror Hits\n\nAfter all 1s are resolved, if you rolled at least one 6+, Recover 1 Grit.`,
              choices: [
                { key: 'help', label: 'Attempt to help (Lore 6+ test)' },
                { key: 'skip', label: 'Do not help' },
              ],
            });

            if (decision === 'help') {
              const testResult = await doTest({ hero: currentHero, key: 'Lore', target: 6, label: 'Banish Demon' });

              // After the test, ask for the count of 1s and 6s if it was a manual roll
              // The test function returns true/false, but we need the actual dice counts
              // So we'll prompt for them
              let ones = 0;
              let sixes = 0;

              if (typeof uiApi?.promptNumber === 'function') {
                // Ask for counts
                ones = await uiApi.promptNumber(`How many 1s did ${currentHero.name} roll on the Lore test?`, {
                  min: 0,
                  max: lore,
                  initial: 0,
                  title: 'Count Natural 1s',
                });
                ones = ones === -1 ? 0 : ones; // -1 means auto-roll was chosen, treat as 0

                sixes = await uiApi.promptNumber(`How many 6s did ${currentHero.name} roll on the Lore test?`, {
                  min: 0,
                  max: lore,
                  initial: testResult ? 1 : 0,
                  title: 'Count Natural 6s',
                });
                sixes = sixes === -1 ? (testResult ? 1 : 0) : sixes; // Default based on pass/fail
              } else {
                // Fallback: estimate based on pass/fail
                sixes = testResult ? 1 : 0;
                ones = testResult ? 0 : 1;
              }

              await note(`${currentHero.name} rolled ${ones} natural 1s and ${sixes} natural 6s.`);

              // Handle each natural 1 - take D6 Horror Hits with Willpower/Spirit Armor resolution
              for (let i = 0; i < ones; i++) {
                const horrorRoll = Math.floor(Math.random() * 6) + 1;
                await note(`Natural 1 #${i + 1}: Rolling D6 for Horror Hits... rolled ${horrorRoll}`);

                // Use combat resolution for Horror Hits (Willpower, then Spirit Armor)
                const getStat = (hero, statKey) => {
                  const heroId = hero?.id || hero?.localId;
                  const totals = posseApi?.getTotalsForHero?.(heroId);
                  return totals?.[statKey] || hero?.stats?.[statKey] || hero?.[statKey.toLowerCase()] || 0;
                };

                const finalHorrorHits = await resolveDefensePerHitThenArmorPerWound({
                  ui: uiApi,
                  hero: currentHero,
                  hits: horrorRoll,
                  woundsPerHit: 1,
                  getStat,
                  damageType: 'horror', // This will make it use Willpower and Spirit Armor
                });

                if (finalHorrorHits > 0) {
                  actions.push({
                    type: 'TAKE_HORROR_HITS',
                    heroId,
                    hits: finalHorrorHits,
                    reason: 'Possessed Shaman - Failed banishment',
                  });
                  await note(`${currentHero.name} takes ${finalHorrorHits} Horror Hit(s) to Sanity!`);
                } else {
                  await note(`${currentHero.name} blocked all Horror damage!`);
                }
              }

              // Handle each natural 6 - gain 25XP
              if (sixes > 0) {
                const totalXP = sixes * 25;
                actions.push({ type: 'ADD_XP', heroId, amount: totalXP, reason: 'Banished Demon' });
                await note(`${currentHero.name} gains ${totalXP} XP (${sixes} × 25 XP)!`);

                // If at least one 6 was rolled, also recover Grit
                actions.push({ type: 'ADD_GRIT', heroId, amount: 1, reason: 'Banished Demon' });
                await note(`${currentHero.name} successfully helped banish the demon and recovers 1 Grit!`);
              } else {
                await note(`${currentHero.name} did not roll any 6s - no Grit recovery.`);
              }
            }
          }
        }
      }
      break;
    }

    // 4-5: Unfriendly Welcome – Prices +$50 for non-Tribal heroes (for entire stay)
    case 4:
    case 5: {
      // Set stay-wide price increase (only affects non-Tribal heroes)
      putStayMod('indianTradingPostPriceDelta', 50, 'Unfriendly Welcome');
      putStayMod('indianTradingPostTribalExempt', true, 'Unfriendly Welcome - Tribal heroes exempt');
      await note('Unfriendly Welcome — All prices at the Indian Trading Post are +$50 for any Hero that does NOT have the Keyword: Tribal (including normally Free items) for the rest of your town stay. Heroes with Keyword: Tribal are not affected.');
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
      putDayMod('indianTradingPostTradeActive', true, 'Trade Opportunities');
      putDayMod('indianTradingPostGearSellPrice', 'D6x25', 'Trade - Gear/Artifacts sell for D6×$25');
      putDayMod('indianTradingPostDarkStoneSellPrice', 100, 'Trade - Dark Stone sells for $100/shard');

      await note('=== TRADE OPPORTUNITIES ===');
      await note('The local tribe is gearing up for a major hunt!');
      await note('');
      await note('Today only, heroes at the Indian Trading Post may:');
      await note('• Sell Gear cards for D6 × $25 each');
      await note('• Sell Artifact cards for D6 × $25 each');
      await note('• Sell Dark Stone for $100 per shard');
      await note('');
      await note('(Check the shop UI for selling options)');
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
            id: `animal_messenger_blessing_${heroId}_${Date.now()}`,
            name: 'Animal Messenger Blessing',
            type: 'temporary',
            effectText: 'Spirit Armor 5+. First time KO\'d, do not roll Injury/Madness.',
            expires: 'nextAdventure',
            duration: 'nextAdventure',
            addedAt: Date.now(),
            active: true,
            temporary: true,
            // Structured effects for stats calculation (use canonical stat names)
            effects: {
              'Spirit Armor': 5, // This will give Spirit Armor 5+ in stats
            },
            // Store KO protection as a separate field, not in effects
            koProtection: true,
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
            // Add Tribal keyword
            actions.push({
              type: 'ADD_KEYWORD',
              heroId,
              keyword: 'Tribal',
              reason: 'One With the Spirits',
            });

            // Add permanent +1 Max Sanity condition
            actions.push({
              type: 'GRANT_PERMANENT_CONDITION',
              heroId,
              condition: {
                id: `tribal_blessing_${heroId}_${Date.now()}`,
                name: 'Tribal Blessing',
                type: 'permanent',
                effectText: '+1 Max Sanity',
                permanent: true,
                active: true,
                addedAt: Date.now(),
                // Structured effects for stats calculation (use proper stat name)
                effects: {
                  Sanity: 1, // This adds +1 to Max Sanity
                },
              },
              reason: 'One With the Spirits - Tribal Blessing',
            });

            await note(`${currentHero.name} accepts and gains the Keyword: Tribal and +1 Max Sanity (permanent)!`);
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

            // Ask how many 4+s were rolled
            let successes = 0;
            if (typeof uiApi?.promptNumber === 'function') {
              successes = await uiApi.promptNumber(`How many 4+s did ${currentHero.name} roll on the Spirit test?`, {
                min: 0,
                max: spirit,
                initial: passed ? 1 : 0,
                title: 'Count Successes (4+)',
              });
              successes = successes === -1 ? (passed ? 1 : 0) : successes;
            } else {
              successes = passed ? 1 : 0;
            }

            if (successes > 0) {
              // Gain +1 Sanity per 4+ rolled (healing, not max increase)
              actions.push({
                type: 'HEAL_SANITY',
                heroId,
                amount: successes,
                reason: 'One With the Spirits - Spirit Connection',
              });
              await note(`${currentHero.name} rolled ${successes} successes (4+) and heals ${successes} Sanity!`);
            } else {
              await note(`${currentHero.name} did not roll any 4+s.`);
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
