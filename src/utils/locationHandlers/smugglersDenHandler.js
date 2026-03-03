// src/utils/locationHandlers/smugglersDenHandler.js
import { loadTownState, saveTownState, patchDayMods } from '../../utils/townState';
import { hasKeyword } from '../keywords';

import { d6, roll2d6 as d2d6 } from '../../utils/diceHelpers';

const shopId = 'smugglersDen';

// ---- shopMods helpers (flags for this town stay) --------------------------
function getShopMods() {
  const s = loadTownState();
  return s.shopMods?.[shopId] || { priceDelta: 0, destroyed: false };
}
function patchShopMods(patch) {
  const s = loadTownState();
  const cur = getShopMods();
  const next = { ...cur, ...patch };
  const updated = { ...s, shopMods: { ...(s.shopMods || {}), [shopId]: next } };
  saveTownState(updated);
}

// ---- small hero helpers ---------------------------------------------------
function ensureStatuses(h) {
  const list = Array.isArray(h.statuses) ? [...h.statuses] : [];
  return list;
}
function addWanted(h) {
  const next = ensureStatuses(h);
  if (!next.some(s => String(s).toLowerCase() === 'wanted')) next.push('Wanted');
  return { ...h, statuses: next };
}
function hasWanted(h) {
  return ensureStatuses(h).some(s => String(s).toLowerCase() === 'wanted');
}

function heroHasTransport(hero) {
  // gear is an object keyed by slot name (e.g. { transport: {...} })
  const gear = hero?.gear;
  if (gear && typeof gear === 'object' && !Array.isArray(gear)) {
    const transportItem = gear.transport || gear.Transport;
    if (transportItem) return true;
    // Also check all gear slots for transport tags
    for (const item of Object.values(gear)) {
      if (!item) continue;
      const tags = (item.tags || []).map(t => String(t).toLowerCase());
      if (tags.includes('transport')) return true;
      if (String(item.type || '').toLowerCase() === 'transport') return true;
    }
  }
  // Also check inventory
  const inv = Array.isArray(hero?.inventory) ? hero.inventory : [];
  return inv.some(it => {
    if (!it) return false;
    const tags = (it.tags || []).map(t => String(t).toLowerCase());
    return tags.includes('transport') || String(it.type || '').toLowerCase() === 'transport';
  });
}

// ---- UI text (lore/effect) -----------------------------------------------
function display(roll) {
  switch (roll) {
    case 2:
      return {
        title: 'He Arrived in Town Just Before You Did',
        lore: 'A grizzled US Marshal that\u2019s been hunting you for months has finally caught up.',
        effect:
          'If you are an Outlaw, this is it! Your Location Visit is over and you must play the Solo Town Adventure \u201CHigh Noon Duel\u201D or use 1 Grit to flee Town and become Wanted! If you are not an Outlaw, you must pay D6\u00D7$100 or flee Town and become Wanted!'
      };
    case 3:
      return {
        title: '\u201CIt\u2019s a Raid!\u201D',
        lore: 'Nobody move! U.S. Marshals! Marshals raid the Smuggler\u2019s Den, having a small shootout with the outlaws and arresting those with warrants.',
        effect:
          'The Smuggler\u2019s Den is closed for the rest of this Town Stay. In addition, any Hero at the Smuggler\u2019s Den that is Wanted! must pass a Luck 6+ test to sneak out the back in the confusion. If failed, you are arrested and thrown in jail! Make a Cunning 3+ test to escape and flee Town (gain 20 XP but your Town Stay is over). If failed, you are hung at dawn\u2026 your Hero is killed (though your Hero Posse may play the Hanging High Town Adventure to rescue you).'
      };
    case 4:
    case 5:
      return {
        title: '\u201CWhat\u2019chu Lookin\u2019 at, Boy?\u201D',
        lore: 'A large, nasty-looking thug turns his attention to you.',
        effect:
          'Lose 1 Grit as you stare down the thug. If you do not have a Grit, you quickly make your way to the door and your visit to the Smuggler\u2019s Den is over.'
      };
    case 6:
    case 7:
    case 8:
      return {
        title: 'Drunken Debauchery and Veiled Threats',
        lore: 'The scruffy, smelly, and downright vile scum that reside here barely notice your arrival amongst the revelry. Probably for the best.',
        effect: 'No Event.'
      };
    case 9:
    case 10:
      return {
        title: 'A Big Haul',
        lore: 'More illicit items have found their way into the Black Market this afternoon. I\u2019m sure they just fell off the back of a wagon.',
        effect:
          'Roll for and draw an extra 2 Items for the Black Market Goods.'
      };
    case 11:
      return {
        title: 'Honor Among Thieves',
        lore: 'Sometimes it\u2019s good to be bad!',
        effect:
          'Gain D6\u00D7$25 and 10 XP. If you are an Outlaw, also Recover 1 Grit. If you are Wanted!, Recover Grit up to your Max Grit.'
      };
    case 12:
      return {
        title: 'One Last Job',
        lore: 'You are approached by a swarthy bandido with information on a train heist that could make you rich, but you have to act fast! This could be the big ticket, the one you\u2019ve been waiting for!',
        effect:
          'If you accept the train heist job, your Town Stay is over. Make a Cunning 5+ test to plan out the heist. For every 5+ rolled, you are +2 Agility when robbing the train. Then make an Agility 6+ test to ride out and board the train (for this test, you are also +2 Agility if you have a Transport Item). For every 6+ rolled gain $500 and take 1 Corruption Hit. Once the train heist is complete, make a Luck 5+ test. If passed, you have gotten away without a hitch. If failed, the swarthy bandido sold you out \u2014 Lose half the $ you earned and you become Wanted!'
      };
    default:
      return {
        title: 'Quiet Corners',
        lore: 'Cards slap, glasses clink. The river keeps on flowing.',
        effect: 'No Event.'
      };
  }
}

// ---- mechanics ------------------------------------------------------------
/**
 * ctx methods (same interface as other handlers):
 * - getActiveHeroId()
 * - getHeroById(id)                    // returns hero object
 * - getHeroesAtShop(shopId?)           // optional; used for multi-hero effects
 * - updateHero(id, patchOrFn)
 * - enqueueChartRoll(id, chartName)    // e.g. 'injury', 'madness', 'hangingHigh'
 * - doSkillCheck(id, { stat, target }) // returns boolean
 * - promptChoice(title, options[])     // returns selected index (or key)
 * - toast(msg)
 */
async function apply(roll, ctx) {
  const id = ctx.getActiveHeroId();

  // 2: He Arrived in Town Just Before You Did
  //    Outlaw → High Noon Duel OR spend 1 Grit to flee (become Wanted). Visit ends.
  //    Non-Outlaw → Pay D6×$100 OR flee Town and become Wanted.
  if (roll === 2) {
    const hero = ctx.getHeroById?.(id) || {};
    const isOutlaw = hasKeyword(hero, 'Outlaw');

    if (isOutlaw) {
      const choice = await ctx.promptChoice?.(
        'A relentless US Marshal has tracked you down. Your visit ends here.',
        [
          'Face the High Noon Duel (2D6 quickdraw contest)',
          'Spend 1 Grit to flee Town (become Wanted)',
        ]
      );
      const duel = choice === 0 || choice === '0';

      if (duel) {
        // High Noon Duel — 2D6 vs 2D6; winner +25 XP, loser becomes Wanted
        const you = d2d6();
        const them = d2d6();
        if (you >= them) {
          ctx.updateHero(id, h => ({ ...h, xp: (h.xp || 0) + 25 }));
          ctx.toast?.(`High Noon Duel: You drew faster (${you} vs ${them})! +25 XP.`);
        } else {
          ctx.updateHero(id, h => addWanted(h));
          ctx.toast?.(`High Noon Duel: Outdrawn (${you} vs ${them}). You are now Wanted.`);
        }
      } else {
        // Spend 1 Grit to flee
        ctx.updateHero(id, h => {
          const wanted = addWanted(h);
          return { ...wanted, grit: Math.max(0, (h.grit ?? 0) - 1) };
        });
        ctx.toast?.('You spend 1 Grit and flee Town. You are now Wanted.');
      }
      // Visit ends for outlaws
      ctx.updateHero(id, h => ({ ...h, isDone: true }));
    } else {
      // Non-Outlaw: pay D6×$100 or flee and become Wanted
      const cost = d6() * 100;
      const choice = await ctx.promptChoice?.(
        `A US Marshal storms into the Den. You can pay $${cost} to slip away quietly, or flee Town and become Wanted.`,
        [
          `Pay $${cost} to avoid trouble`,
          'Flee Town and become Wanted',
        ]
      );
      const pay = choice === 0 || choice === '0';
      if (pay) {
        ctx.updateHero(id, h => ({ ...h, gold: Math.max(0, (h.gold || 0) - cost) }));
        ctx.toast?.(`You pay $${cost} to avoid trouble.`);
      } else {
        ctx.updateHero(id, h => ({ ...addWanted(h), isDone: true }));
        ctx.toast?.('You flee Town. You are now Wanted.');
      }
    }
    return;
  }

  // 3: “It's a Raid!” — Den is closed for rest of Town Stay.
  //    Wanted heroes: Luck 6+ to slip away. Fail → arrested → Cunning 3+ to escape
  //    (+20 XP, Town Stay over). Fail that → hanged (Hanging High chart).
  //    Non-Wanted heroes: just the Den closing.
  if (roll === 3) {
    // Close the Smuggler's Den for the rest of this Town Stay
    patchShopMods({ destroyed: true });
    ctx.toast?.('Nobody move! U.S. Marshals! Marshals raid the Smuggler\u2019s Den, having a small shootout with the outlaws and arresting those with warrants. The Smuggler\u2019s Den is closed for the rest of this Town Stay!');

    const hero = ctx.getHeroById?.(id) || {};
    if (hasWanted(hero)) {
      // Wanted hero must try to escape the raid
      const okLuck = await ctx.doSkillCheck(id, { stat: 'Luck', target: 6 });
      if (okLuck) {
        ctx.toast?.('You slip out the back just as the badges pour in. Safe — for now.');
      } else {
        // Arrested — try Cunning 3+ to escape
        ctx.toast?.('Caught! You are arrested and thrown in jail.');
        const okCunning = await ctx.doSkillCheck(id, { stat: 'Cunning', target: 3 });
        if (okCunning) {
          ctx.updateHero(id, h => ({
            ...h,
            xp: (h.xp || 0) + 20,
            isDone: true,
          }));
          ctx.toast?.('You pick the lock and escape! +20 XP. Your Town Stay is over — flee Town.');
        } else {
          // Hanged — Hanging High chart may save
          ctx.toast?.('Escape failed. You are sentenced to hang. The Hanging High chart may yet save you...');
          await ctx.enqueueChartRoll?.(id, 'hangingHigh');
          ctx.updateHero(id, h => ({ ...h, isDone: true }));
        }
      }
    }
    return;
  }

  // 4–5: “What'chu Lookin' at, Boy?” — Lose 1 Grit. No Grit → visit ends.
  if (roll === 4 || roll === 5) {
    const hero = ctx.getHeroById?.(id) || {};
    const curGrit = hero.grit ?? 0;
    if (curGrit > 0) {
      ctx.updateHero(id, h => ({ ...h, grit: Math.max(0, (h.grit ?? 0) - 1) }));
      ctx.toast?.('A large, nasty-looking thug turns his attention to you. You stare down the thug and lose 1 Grit.');
    } else {
      // No Grit: removed from the Smuggler's Den for the day
      ctx.updateHero(id, h => ({ ...h, isDone: true }));
      ctx.toast?.('A large, nasty-looking thug turns his attention to you. You do not have a Grit \u2014 you quickly make your way to the door. Your visit to the Smuggler\u2019s Den is over.');
    }
    return;
  }

  // 6–8: No event
  if (roll >= 6 && roll <= 8) {
    ctx.toast?.('No Event.');
    return;
  }

  // 9–10: A Big Haul — add 2 extra items to the Black Market Goods rolls
  if (roll === 9 || roll === 10) {
    const extra = 2;
    try {
      patchDayMods({ smugglersBigHaulExtra: extra });
    } catch {
      patchShopMods({ bigHaulExtra: extra });
    }
    ctx.toast?.(`A Big Haul: +${extra} extra items added to the Black Market Goods this visit.`);
    return;
  }

  // 11: Honor Among Thieves — Gain D6×$25 and 10 XP.
  //     Outlaw keyword → Recover 1 Grit.
  //     Wanted marker → Recover to Max Grit instead.
  if (roll === 11) {
    const cash = d6() * 25;
    const hero = ctx.getHeroById?.(id) || {};
    const isOutlaw = hasKeyword(hero, 'Outlaw');
    const isWanted = hasWanted(hero);

    ctx.updateHero(id, h => {
      const maxGrit = h.maxGrit ?? 2;
      let grit = h.grit ?? 0;

      if (isWanted) {
        // Wanted marker: recover to Max Grit
        grit = maxGrit;
      } else if (isOutlaw) {
        // Outlaw keyword: recover 1 Grit
        grit = Math.min(maxGrit, grit + 1);
      }

      return {
        ...h,
        gold: (h.gold || 0) + cash,
        xp: (h.xp || 0) + 10,
        grit,
      };
    });

    let gritMsg = '';
    if (isWanted) gritMsg = ' Wanted — recover to Max Grit!';
    else if (isOutlaw) gritMsg = ' Outlaw — recover 1 Grit.';
    ctx.toast?.(`Honor Among Thieves: +$${cash}, +10 XP.${gritMsg}`);
    return;
  }

  // 12: One Last Job — multi-phase train heist. Town Stay ends.
  if (roll === 12) {
    const accept = await ctx.promptChoice?.(
      'You are approached by a swarthy bandido with information on a train heist that could make you rich, but you have to act fast! This could be the big ticket, the one you\u2019ve been waiting for! If you accept, your Town Stay is over. Cunning 5+ to plan (+2 Agility per success), Agility 6+ to rob the train (+2 if you have Transport; $500 and 1 Corruption per success), then Luck 5+ to get away clean or lose half and become Wanted!',
      [
        'Accept the Job',
        'Decline',
      ]
    );
    const accepted = accept === 0 || accept === '0';
    if (!accepted) {
      ctx.toast?.('You wisely decline the offer.');
      return;
    }

    // Town Stay ends regardless of outcome
    ctx.updateHero(id, h => ({ ...h, isDone: true }));
    ctx.toast?.('You accept the job — your Town Stay ends after this.');

    // Phase 1: Cunning 5+ — each success grants +2 Agility for the robbery
    const okCun = await ctx.doSkillCheck(id, { stat: 'Cunning', target: 5 });
    const agiBonus = okCun ? 2 : 0;
    if (okCun) {
      ctx.toast?.(`Phase 1 — Cunning test passed: +${agiBonus} Agility bonus for the robbery.`);
    } else {
      ctx.toast?.('Phase 1 — Cunning test failed: no Agility bonus for the robbery.');
    }

    // Phase 2: Agility 6+ — check if hero has Transport for +2 bonus
    // Each 6+ earns $500 and 1 Corruption Hit
    const hero = ctx.getHeroById?.(id) || {};
    const hasTransportItem = heroHasTransport(hero);
    const transportBonus = hasTransportItem ? 2 : 0;
    const totalAgiBonus = agiBonus + transportBonus;

    if (totalAgiBonus > 0) {
      ctx.toast?.(`Phase 2 — Agility 6+ test with +${totalAgiBonus} bonus (${agiBonus} planning, ${transportBonus} Transport).`);
    } else {
      ctx.toast?.('Phase 2 — Agility 6+ test for the robbery.');
    }

    const okAgi = await ctx.doSkillCheck(id, { stat: 'Agility', target: 6 });
    let earnings = 0;
    let corruption = 0;
    if (okAgi) {
      earnings = 500;
      corruption = 1;
      ctx.toast?.(`Robbery success: +$${earnings}, +${corruption} Corruption Hit.`);
    } else {
      ctx.toast?.('The robbery doesn\'t go as planned \u2014 no loot from the heist.');
    }

    // Phase 3: Luck 5+ — keep loot or lose half + Wanted
    if (earnings > 0) {
      const okLuck = await ctx.doSkillCheck(id, { stat: 'Luck', target: 5 });
      if (okLuck) {
        ctx.updateHero(id, h => ({
          ...h,
          gold: (h.gold || 0) + earnings,
          corruption: (h.corruption || 0) + corruption,
        }));
        ctx.toast?.(`Phase 3 — Luck test passed! You keep $${earnings} (and take ${corruption} Corruption).`);
      } else {
        const halfEarnings = Math.floor(earnings / 2);
        ctx.updateHero(id, h => {
          const wanted = addWanted(h);
          return {
            ...wanted,
            gold: (h.gold || 0) + halfEarnings,
            corruption: (h.corruption || 0) + corruption,
          };
        });
        ctx.toast?.(`Phase 3 — Luck test failed! You only keep $${halfEarnings}, take ${corruption} Corruption, and become Wanted.`);
      }
    } else {
      ctx.updateHero(id, h => addWanted(h));
      ctx.toast?.('The heist was a bust \u2014 you become Wanted.');
    }
    return;
  }
}

// --------- Named wrapper so the registry can call like others ---------------
export async function handleSmugglersDenEvent(ctx = {}) {
  const roll = ctx.forcedRoll ?? d2d6();
  const disp = display(roll);
  await apply(roll, ctx);
  return {
    actions: [],
    townState: ctx.townState,
    log: [`Smuggler's Den Event Roll: ${roll}`],
    eventRoll: roll,
    eventIndex: Math.max(0, roll - 2),
    title: disp.title,
    lore: disp.lore,
    effect: disp.effect,
  };
}

// Keep the original object export (if used elsewhere)
export const smugglersDenHandler = { display, apply };
