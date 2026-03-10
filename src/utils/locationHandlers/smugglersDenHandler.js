// src/utils/locationHandlers/smugglersDenHandler.js
import { loadTownState, saveTownState, patchDayMods } from '../../utils/townState';
import { hasKeyword } from '../keywords';
import { calculateCurrentStats } from '../calculateStats';

import { d6, roll2d6 as d2d6, rollND } from '../../utils/diceHelpers';

const shopId = 'smugglersDen';

// Resolve a hero's effective stat value (includes gear/skills/conditions)
function getEffectiveStat(hero, statName) {
  if (!hero) return 0;
  try {
    const { stats = {} } = calculateCurrentStats(hero);
    const v = Number(stats[statName]) || 0;
    if (v > 0) return v;
  } catch {}
  return Number(hero?.stats?.[statName] ?? hero?.[statName] ?? 0);
}

// Parse manual dice entry or auto-roll
function parseManualOrAutoRoll(raw, diceCount) {
  if (raw == null || raw.trim() === '') {
    return rollND(diceCount, 6);
  }
  const parts = raw.split(',').map(s => Number(s.trim()));
  if (parts.every(n => Number.isFinite(n) && n >= 1 && n <= 6)) {
    return parts;
  }
  return rollND(diceCount, 6);
}

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
  if (roll === 2) {
    const hero = ctx.getHeroById?.(id) || {};
    const isOutlaw = hasKeyword(hero, 'Outlaw');

    if (isOutlaw) {
      const choice = await ctx.promptChoice?.(
        'HE ARRIVED IN TOWN JUST BEFORE YOU DID\n\n' +
        'A grizzled US Marshal that\u2019s been hunting you for months has finally caught up. ' +
        'If you are an Outlaw, this is it! Your Location Visit is over.\n\n' +
        'Choose:',
        [
          'Play the \u201CHigh Noon Duel\u201D Solo Town Adventure',
          'Use 1 Grit to flee Town (become Wanted!)',
        ]
      );
      const duel = choice === 0 || choice === '0';

      if (duel) {
        const you = d2d6();
        const them = d2d6();
        if (you >= them) {
          ctx.updateHero(id, h => ({ ...h, xp: (h.xp || 0) + 25 }));
          ctx.toast?.(`High Noon Duel: You drew faster (${you} vs ${them})! +25 XP.`);
        } else {
          ctx.updateHero(id, h => addWanted(h));
          ctx.toast?.(`High Noon Duel: Outdrawn (${you} vs ${them}). You are now Wanted!`);
        }
      } else {
        ctx.updateHero(id, h => {
          const wanted = addWanted(h);
          return { ...wanted, grit: Math.max(0, (h.grit ?? 0) - 1) };
        });
        ctx.toast?.('You spend 1 Grit and flee Town. You are now Wanted!');
      }
      ctx.updateHero(id, h => ({ ...h, isDone: true }));
    } else {
      const cost = d6() * 100;
      const choice = await ctx.promptChoice?.(
        'HE ARRIVED IN TOWN JUST BEFORE YOU DID\n\n' +
        'A grizzled US Marshal that\u2019s been hunting you for months has finally caught up. ' +
        'You are not an Outlaw, so you must pay D6\u00D7$100 or flee Town and become Wanted!\n\n' +
        `Cost rolled: $${cost}\n\n` +
        'Choose:',
        [
          `Pay $${cost} to avoid trouble`,
          'Flee Town and become Wanted!',
        ]
      );
      const pay = choice === 0 || choice === '0';
      if (pay) {
        ctx.updateHero(id, h => ({ ...h, gold: Math.max(0, (h.gold || 0) - cost) }));
        ctx.toast?.(`You pay $${cost} to slip away quietly.`);
      } else {
        ctx.updateHero(id, h => ({ ...addWanted(h), isDone: true }));
        ctx.toast?.('You flee Town. You are now Wanted!');
      }
    }
    return;
  }

  // 3: “It's a Raid!”
  if (roll === 3) {
    patchShopMods({ destroyed: true });
    const hero = ctx.getHeroById?.(id) || {};
    const heroName = hero?.name || 'Hero';

    window.alert(
      `\u201CIT\u2019S A RAID!\u201D\n\n` +
      `Nobody move! U.S. Marshals! Marshals raid the Smuggler\u2019s Den, having a small shootout ` +
      `with the outlaws and arresting those with warrants.\n\n` +
      `The Smuggler\u2019s Den is closed for the rest of this Town Stay.`
    );

    if (hasWanted(hero)) {
      const luckVal = getEffectiveStat(hero, 'Luck');
      const luckDice = Math.max(1, luckVal);

      const luckRaw = window.prompt(
        `${heroName} is Wanted!\n\n` +
        `You must pass a Luck 6+ test to sneak out the back in the confusion.\n\n` +
        `You have ${luckVal} Luck (${luckDice}d6, need a 6+)\n\n` +
        `Enter ${luckDice} roll result(s) comma-separated (1-6 each), or leave blank to auto-roll:`,
        ''
      );
      const luckRolls = parseManualOrAutoRoll(luckRaw, luckDice);
      const luckPassed = luckRolls.some(r => r >= 6);

      if (luckPassed) {
        window.alert(
          `Luck 6+ Test PASSED!\n` +
          `Rolled ${luckDice}d6: [${luckRolls.join(', ')}] \u2014 needed a 6+\n\n` +
          `You slip out the back in the confusion. Safe \u2014 for now.`
        );
      } else {
        const cunVal = getEffectiveStat(hero, 'Cunning');
        const cunDice = Math.max(1, cunVal);

        const cunRaw = window.prompt(
          `Luck 6+ Test FAILED!\n` +
          `Rolled ${luckDice}d6: [${luckRolls.join(', ')}] \u2014 needed a 6+\n\n` +
          `You are arrested and thrown in jail!\n\n` +
          `Make a Cunning 3+ test to escape and flee Town.\n` +
          `(Gain 20 XP but your Town Stay is over.)\n\n` +
          `You have ${cunVal} Cunning (${cunDice}d6, need a 3+)\n\n` +
          `Enter ${cunDice} roll result(s) comma-separated (1-6 each), or leave blank to auto-roll:`,
          ''
        );
        const cunRolls = parseManualOrAutoRoll(cunRaw, cunDice);
        const cunPassed = cunRolls.some(r => r >= 3);

        if (cunPassed) {
          ctx.updateHero(id, h => ({
            ...h,
            xp: (h.xp || 0) + 20,
            isDone: true,
          }));
          window.alert(
            `Cunning 3+ Test PASSED!\n` +
            `Rolled ${cunDice}d6: [${cunRolls.join(', ')}] \u2014 needed a 3+\n\n` +
            `You pick the lock and escape, fleeing Town!\n` +
            `+20 XP. Your Town Stay is over.`
          );
        } else {
          window.alert(
            `Cunning 3+ Test FAILED!\n` +
            `Rolled ${cunDice}d6: [${cunRolls.join(', ')}] \u2014 needed a 3+\n\n` +
            `Escape failed\u2026 you are hung at dawn.\n` +
            `Your Hero is killed (though your Hero Posse may play the Hanging High Town Adventure to rescue you).`
          );
          await ctx.enqueueChartRoll?.(id, 'hangingHigh');
          ctx.updateHero(id, h => ({ ...h, isDone: true }));
        }
      }
    }
    return;
  }

  // 4-5: “What'chu Lookin' at, Boy?”
  if (roll === 4 || roll === 5) {
    const hero = ctx.getHeroById?.(id) || {};
    const curGrit = hero.grit ?? 0;
    if (curGrit > 0) {
      ctx.updateHero(id, h => ({ ...h, grit: Math.max(0, (h.grit ?? 0) - 1) }));
      ctx.toast?.(
        '\u201CWHAT\u2019CHU LOOKIN\u2019 AT, BOY?\u201D\n\n' +
        'A large, nasty-looking thug turns his attention to you. ' +
        'Lose 1 Grit as you stare down the thug.'
      );
    } else {
      ctx.updateHero(id, h => ({ ...h, isDone: true }));
      ctx.toast?.(
        '\u201CWHAT\u2019CHU LOOKIN\u2019 AT, BOY?\u201D\n\n' +
        'A large, nasty-looking thug turns his attention to you. ' +
        'You do not have a Grit \u2014 you quickly make your way to the door and your visit to the Smuggler\u2019s Den is over.'
      );
    }
    return;
  }

  // 6-8: Drunken Debauchery and Veiled Threats
  if (roll >= 6 && roll <= 8) {
    ctx.toast?.(
      'DRUNKEN DEBAUCHERY AND VEILED THREATS\n\n' +
      'The scruffy, smelly, and downright vile scum that reside here barely notice your arrival ' +
      'amongst the revelry. Probably for the best.\n\n' +
      'No Event.'
    );
    return;
  }

  // 9-10: A Big Haul
  if (roll === 9 || roll === 10) {
    const extra = 2;
    try {
      patchDayMods({ smugglersBigHaulExtra: extra });
    } catch {
      patchShopMods({ bigHaulExtra: extra });
    }
    ctx.toast?.(
      'A BIG HAUL\n\n' +
      'More illicit items have found their way into the Black Market this afternoon. ' +
      'I\u2019m sure they just fell off the back of a wagon.\n\n' +
      `Roll for and draw an extra ${extra} Items for the Black Market Goods.`
    );
    return;
  }

  // 11: Honor Among Thieves
  if (roll === 11) {
    const cash = d6() * 25;
    const hero = ctx.getHeroById?.(id) || {};
    const isOutlaw = hasKeyword(hero, 'Outlaw');
    const isWanted = hasWanted(hero);

    ctx.updateHero(id, h => {
      const maxGrit = h.maxGrit ?? 2;
      let grit = h.grit ?? 0;

      if (isWanted) {
        grit = maxGrit;
      } else if (isOutlaw) {
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
    if (isWanted) gritMsg = '\nYou are Wanted! \u2014 Recover Grit up to your Max Grit.';
    else if (isOutlaw) gritMsg = '\nYou are an Outlaw \u2014 also Recover 1 Grit.';
    ctx.toast?.(
      'HONOR AMONG THIEVES\n\n' +
      'Sometimes it\u2019s good to be bad!\n\n' +
      `Gain D6\u00D7$25 = $${cash} and 10 XP.${gritMsg}`
    );
    return;
  }

  // 12: One Last Job
  if (roll === 12) {
    const hero = ctx.getHeroById?.(id) || {};
    const heroName = hero?.name || 'Hero';

    const raw = window.prompt(
      `ONE LAST JOB\n\n` +
      `You are approached by a swarthy bandido with information on a train heist that could ` +
      `make you rich, but you have to act fast! This could be the big ticket, the one ` +
      `you\u2019ve been waiting for!\n\n` +
      `If you accept the train heist job, your Town Stay is over.\n\n` +
      `The heist has 3 phases:\n` +
      `  1. Cunning 5+ \u2014 plan the heist (+2 Agility per success)\n` +
      `  2. Agility 6+ \u2014 rob the train ($500 + 1 Corruption per success)\n` +
      `  3. Luck 5+ \u2014 get away clean or lose half and become Wanted!\n\n` +
      `Enter 1 to Accept the Job, or 2 to Decline:`,
      '1'
    );
    const accepted = String(raw).trim() !== '2';
    if (!accepted) {
      window.alert(`${heroName} wisely declines the bandido\u2019s offer.`);
      return;
    }

    ctx.updateHero(id, h => ({ ...h, isDone: true }));

    // Phase 1: Cunning 5+ — plan the heist
    const cunVal = getEffectiveStat(hero, 'Cunning');
    const cunDice = Math.max(1, cunVal);

    const cunRaw = window.prompt(
      `PHASE 1: PLANNING THE HEIST\n\n` +
      `Make a Cunning 5+ test to plan out the heist.\n` +
      `For every 5+ rolled, you are +2 Agility when robbing the train.\n\n` +
      `${heroName} has ${cunVal} Cunning (${cunDice}d6, need 5+)\n\n` +
      `Enter ${cunDice} roll result(s) comma-separated (1-6 each), or leave blank to auto-roll:`,
      ''
    );
    const cunRolls = parseManualOrAutoRoll(cunRaw, cunDice);
    const cunSuccesses = cunRolls.filter(r => r >= 5).length;
    const agiBonus = cunSuccesses * 2;

    if (cunSuccesses > 0) {
      window.alert(
        `Cunning 5+ Test \u2014 ${cunSuccesses} success(es)!\n` +
        `Rolled ${cunDice}d6: [${cunRolls.join(', ')}] \u2014 needed 5+\n\n` +
        `+${agiBonus} Agility bonus for the robbery!`
      );
    } else {
      window.alert(
        `Cunning 5+ Test FAILED!\n` +
        `Rolled ${cunDice}d6: [${cunRolls.join(', ')}] \u2014 needed 5+\n\n` +
        `No successes \u2014 no Agility bonus for the robbery.`
      );
    }

    // Phase 2: Agility 6+ — rob the train
    const hasTransportItem = heroHasTransport(hero);
    const transportBonus = hasTransportItem ? 2 : 0;
    const baseAgi = getEffectiveStat(hero, 'Agility');
    const totalAgi = baseAgi + agiBonus + transportBonus;
    const agiDice = Math.max(1, totalAgi);

    let bonusParts = [];
    if (agiBonus > 0) bonusParts.push(`+${agiBonus} from planning`);
    if (transportBonus > 0) bonusParts.push(`+${transportBonus} from Transport item`);
    const bonusStr = bonusParts.length ? `\nBonuses: ${bonusParts.join(', ')}` : '';

    const agiRaw = window.prompt(
      `PHASE 2: ROBBING THE TRAIN\n\n` +
      `Make an Agility 6+ test to ride out and board the train.\n` +
      `For every 6+ rolled, gain $500 and take 1 Corruption Hit.` +
      (hasTransportItem ? `\n(+2 Agility because you have a Transport item)` : '') +
      `\n\n${heroName} has ${baseAgi} Agility` +
      (bonusParts.length ? ` (${totalAgi} with bonuses)` : '') +
      ` (${agiDice}d6, need 6+)` +
      bonusStr + `\n\n` +
      `Enter ${agiDice} roll result(s) comma-separated (1-6 each), or leave blank to auto-roll:`,
      ''
    );
    const agiRolls = parseManualOrAutoRoll(agiRaw, agiDice);
    const agiSuccesses = agiRolls.filter(r => r >= 6).length;
    const earnings = agiSuccesses * 500;
    const corruption = agiSuccesses;

    if (agiSuccesses > 0) {
      window.alert(
        `Agility 6+ Test \u2014 ${agiSuccesses} success(es)!\n` +
        `Rolled ${agiDice}d6: [${agiRolls.join(', ')}] \u2014 needed 6+\n\n` +
        `Robbery haul: $${earnings}\n` +
        `Corruption Hits: ${corruption}`
      );
    } else {
      window.alert(
        `Agility 6+ Test FAILED!\n` +
        `Rolled ${agiDice}d6: [${agiRolls.join(', ')}] \u2014 needed 6+\n\n` +
        `The robbery doesn\u2019t go as planned \u2014 no loot from the heist.`
      );
    }

    // Phase 3: Luck 5+ — the getaway (always rolled, even with no earnings)
    const luckVal = getEffectiveStat(hero, 'Luck');
    const luckDice = Math.max(1, luckVal);

    const luckRaw = window.prompt(
      `PHASE 3: THE GETAWAY\n\n` +
      `Once the train heist is complete, make a Luck 5+ test.\n` +
      `If passed, you have gotten away without a hitch.\n` +
      `If failed, the swarthy bandido sold you out \u2014 Lose half the $\n` +
      `you earned and you become Wanted!\n\n` +
      (earnings > 0
        ? `Current haul: $${earnings} and ${corruption} Corruption Hit(s).\n\n`
        : `The robbery didn\u2019t go as planned \u2014 no loot from the heist.\n\n`) +
      `${heroName} has ${luckVal} Luck (${luckDice}d6, need 5+)\n\n` +
      `Enter ${luckDice} roll result(s) comma-separated (1-6 each), or leave blank to auto-roll:`,
      ''
    );
    const luckRolls = parseManualOrAutoRoll(luckRaw, luckDice);
    const luckPassed = luckRolls.some(r => r >= 5);

    if (luckPassed) {
      ctx.updateHero(id, h => ({
        ...h,
        gold: (h.gold || 0) + earnings,
        corruption: (h.corruption || 0) + corruption,
      }));
      if (earnings > 0) {
        window.alert(
          `Luck 5+ Test PASSED!\n` +
          `Rolled ${luckDice}d6: [${luckRolls.join(', ')}] \u2014 needed 5+\n\n` +
          `You got away without a hitch!\n` +
          `+$${earnings}, +${corruption} Corruption Hit(s).`
        );
      } else {
        window.alert(
          `Luck 5+ Test PASSED!\n` +
          `Rolled ${luckDice}d6: [${luckRolls.join(', ')}] \u2014 needed 5+\n\n` +
          `The robbery was a bust, but at least you got away without a hitch.`
        );
      }
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
      if (earnings > 0) {
        window.alert(
          `Luck 5+ Test FAILED!\n` +
          `Rolled ${luckDice}d6: [${luckRolls.join(', ')}] \u2014 needed 5+\n\n` +
          `The swarthy bandido sold you out!\n` +
          `You only keep $${halfEarnings} (half of $${earnings}),\n` +
          `take ${corruption} Corruption Hit(s), and become Wanted!`
        );
      } else {
        window.alert(
          `Luck 5+ Test FAILED!\n` +
          `Rolled ${luckDice}d6: [${luckRolls.join(', ')}] \u2014 needed 5+\n\n` +
          `The swarthy bandido sold you out!\n` +
          `The robbery was a bust and you become Wanted!`
        );
      }
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
