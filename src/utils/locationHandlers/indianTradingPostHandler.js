// src/utils/locationHandlers/indianTradingPostHandler.js
import { loadTownState, saveTownState } from '../../utils/townState';
import indianTradingPostData from '../../data/townLocations/FrontierTown/IndianTradingPost/indianTradingPost.js';

const shopId = indianTradingPostData?.id || 'indian_trading_post';

// dice
const d6 = () => Math.floor(Math.random() * 6) + 1;
const d3 = () => Math.ceil(Math.random() * 3);
const roll2d6 = () => d6() + d6();

// ---------- townState helpers ----------
function patchGlobalRules(patch) {
  const s = loadTownState() || {};
  const next = { ...(s.globalRules || {}), ...patch };
  saveTownState({ ...s, globalRules: next });
}

function patchStayMods(patch) {
  const s = loadTownState() || {};
  const next = { ...(s.stayMods || {}), ...patch };
  saveTownState({ ...s, stayMods: next });
}

// ---------- display (title / lore / effect) ----------
export function display(roll) {
  const idx = Math.max(0, Math.min(10, roll - 2));
  const ev = indianTradingPostData?.events?.[idx];
  if (!ev) {
    return { title: 'Trading Post Event', lore: '', effect: 'No Event.' };
  }
  return {
    title: ev.name || 'Trading Post Event',
    lore: ev.lore || '',
    effect: ev.effect || 'No Event.',
  };
}

// ---------- mechanics (Resolve) ----------
/**
 * ctx methods:
 * - getActiveHeroId()
 * - getHero(id)
 * - getHeroesAtShop(shopId)
 * - updateHero(id, patchOrFn)
 * - addToken(id, tokenName)
 * - enqueueChartRoll(id, chartName)
 * - doSkillCheck(id, { stat, target })
 * - promptChoice(title, options[])   // {label}
 * - promptYesNo(message)
 * - toast(msg)
 */
export async function apply(roll, ctx) {
  const id = ctx.getActiveHeroId?.();
  if (!id) return;

  // 2: Spirits Running Amok – Move Darkness D3 forward, all heroes take 2D6 Hits
  if (roll === 2) {
    const darknessMove = d3();

    // Move Darkness marker on Town Event Track
    const s = loadTownState() || {};
    const currentDarkness = s.townEventTrack?.darkness || 1;
    const newDarkness = Math.min(12, currentDarkness + darknessMove);
    saveTownState({
      ...s,
      townEventTrack: { ...(s.townEventTrack || {}), darkness: newDarkness },
    });

    // All heroes in town take 2D6 Hits
    const heroesAtShop = ctx.getHeroesAtShop?.(shopId) || [id];
    const damage = roll2d6();

    for (const heroId of heroesAtShop) {
      ctx.updateHero?.(heroId, (h) => {
        const currentHealth = h.health ?? h.maxHealth ?? 10;
        return { ...h, health: Math.max(0, currentHealth - damage) };
      });
    }

    ctx.toast?.(
      `Spirits Running Amok! Darkness moves +${darknessMove}. All heroes take ${damage} Hits!`
    );
    return;
  }

  // 3: Possessed Shaman – Services disabled, Lore 3+ heroes can attempt Lore 6+ test
  if (roll === 3) {
    // Disable Spirit Cleansing and Vision Quests
    patchStayMods({
      indianTradingPostServicesDisabled: ['Spirit Cleansing', 'Vision Quest'],
    });

    // Check if active hero has Lore 3+
    const hero = ctx.getHero?.(id);
    const lore = hero?.stats?.Lore || hero?.lore || 0;

    if (lore >= 3) {
      const attemptHelp = await ctx.promptYesNo?.(
        'Possessed Shaman: You have Lore 3+. Attempt to help drive out the demon? (Lore 6+ test)'
      );

      if (attemptHelp) {
        // Make Lore 6+ test - need to count individual die results
        let successes = 0;
        let ones = 0;

        for (let i = 0; i < lore; i++) {
          const die = d6();
          if (die >= 6) successes++;
          if (die === 1) ones++;
        }

        if (successes > 0) {
          // Success: Recover 1 Grit and gain 25 XP per 6+
          const xpGain = successes * 25;
          ctx.updateHero?.(id, (h) => {
            const maxGrit = h.maxGrit ?? 2;
            const newGrit = Math.min(maxGrit, (h.grit ?? 0) + 1);
            return {
              ...h,
              grit: newGrit,
              xp: (h.xp || 0) + xpGain,
            };
          });
          ctx.toast?.(
            `Success! ${successes} successes: Recover 1 Grit and gain ${xpGain} XP.`
          );
        }

        if (ones > 0) {
          // Take D6 Horror Hits per 1 rolled
          let totalHorrorHits = 0;
          for (let i = 0; i < ones; i++) {
            totalHorrorHits += d6();
          }
          ctx.updateHero?.(id, (h) => {
            const currentSanity = h.sanity ?? h.maxSanity ?? 6;
            return { ...h, sanity: Math.max(0, currentSanity - totalHorrorHits) };
          });
          ctx.toast?.(
            `Rolled ${ones} ones! Take ${totalHorrorHits} Horror Hits (Sanity damage).`
          );
        }

        if (successes === 0 && ones === 0) {
          ctx.toast?.('The ritual had no effect.');
        }
      } else {
        ctx.toast?.(
          'You decline to help. Spirit Cleansing and Vision Quests unavailable today.'
        );
      }
    } else {
      ctx.toast?.(
        'Possessed Shaman: Spirit Cleansing and Vision Quests unavailable today.'
      );
    }
    return;
  }

  // 4-5: Unfriendly Welcome – +$50 prices for non-Tribal heroes
  if (roll === 4 || roll === 5) {
    const hero = ctx.getHero?.(id);
    const keywords = hero?.keywords || [];
    const isTribal = keywords.some((k) =>
      String(k).toLowerCase().includes('tribal')
    );

    if (!isTribal) {
      patchStayMods({ indianTradingPostPriceIncrease: 50 });
      ctx.toast?.(
        'Unfriendly Welcome: All prices +$50 for non-Tribal heroes (including normally free services).'
      );
    } else {
      ctx.toast?.('Unfriendly Welcome: You are Tribal, so prices are normal.');
    }
    return;
  }

  // 6-8: Drumming, Dancing, and a Bonfire – No Event
  if (roll >= 6 && roll <= 8) {
    ctx.toast?.(
      'Drumming, Dancing, and a Bonfire: A good time for everyone. No Event.'
    );
    return;
  }

  // 9-10: Trade Opportunities – Extra sell value for Gear/Artifacts/Dark Stone
  if (roll === 9 || roll === 10) {
    patchStayMods({
      indianTradingPostTradeBonus: true,
      indianTradingPostDarkStoneSellPrice: 100,
    });
    ctx.toast?.(
      'Trade Opportunities: Sell Gear/Artifacts for extra D6×$25 each. Sell Dark Stone for $100/shard today!'
    );
    return;
  }

  // 11: Animal Messenger – Gain Spirit Armor 5+ and first KO protection for next Adventure
  if (roll === 11) {
    patchGlobalRules({
      animalMessengerSpiritArmor: true,
      animalMessengerKOProtection: true,
    });
    ctx.updateHero?.(id, (h) => {
      const flags = { ...(h.nextAdventureFlags || {}) };
      flags.spiritArmor5 = true;
      flags.firstKONoRoll = true;
      return { ...h, nextAdventureFlags: flags };
    });
    ctx.toast?.(
      'Animal Messenger: Next Adventure you gain Spirit Armor 5+ and first KO has no Injury/Madness roll!'
    );
    return;
  }

  // 12: One With the Spirits – Gain Tribal keyword OR Spirit 4+ test for Sanity
  if (roll === 12) {
    const hero = ctx.getHero?.(id);
    const keywords = hero?.keywords || [];
    const isTribal = keywords.some((k) =>
      String(k).toLowerCase().includes('tribal')
    );

    if (!isTribal) {
      const accept = await ctx.promptYesNo?.(
        'One With the Spirits: You are offered entry into the tribe. Gain the Tribal keyword?'
      );
      if (accept) {
        ctx.updateHero?.(id, (h) => {
          const kws = [...(h.keywords || [])];
          if (!kws.some((k) => String(k).toLowerCase().includes('tribal'))) {
            kws.push('Tribal');
          }
          return { ...h, keywords: kws };
        });
        ctx.toast?.('You are now one with the tribe! Gained Keyword: Tribal.');
      }
    } else {
      // Already Tribal - make Spirit 4+ test
      const spirit = hero?.stats?.Spirit || hero?.spirit || 0;
      let successes = 0;

      for (let i = 0; i < spirit; i++) {
        const die = d6();
        if (die >= 4) successes++;
      }

      if (successes > 0) {
        ctx.updateHero?.(id, (h) => {
          const maxSanity = h.maxSanity ?? 6;
          const newSanity = Math.min(maxSanity, (h.sanity ?? maxSanity) + successes);
          return { ...h, sanity: newSanity };
        });
        ctx.toast?.(
          `One With the Spirits: ${successes} successes! Gain +${successes} Sanity.`
        );
      } else {
        ctx.toast?.('One With the Spirits: No successes, no Sanity gained.');
      }
    }
    return;
  }
}

// --------- Dispatcher compatible with locationEventsEngine ---------------
export async function handleIndianTradingPostEvent(ctx = {}) {
  const roll = ctx.forcedRoll ?? roll2d6();
  await apply(roll, ctx);
  return {
    actions: [],
    townState: ctx.townState,
    log: [`Indian Trading Post Event Roll: ${roll}`],
    eventRoll: roll,
    eventIndex: Math.max(0, roll - 2),
  };
}

export const indianTradingPostHandler = { display, apply };
export default indianTradingPostHandler;
