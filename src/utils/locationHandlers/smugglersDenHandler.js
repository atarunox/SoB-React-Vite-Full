// src/utils/locationHandlers/smugglersDenHandler.js
import { loadTownState, saveTownState, patchDayMods } from '../../utils/townState';
import { hasKeyword } from '../keywords';

import { d6 as _d6, roll2d6 as d2d6 } from '../../utils/diceHelpers';

// Use ctx.d6 when available (respects manual roll mode); fallback to auto-roll
const ctxD6 = async (ctx, label) => (typeof ctx?.d6 === 'function') ? ctx.d6(label) : _d6();

const shopId = 'smugglersDen';

// ---------- result formatting helpers ----------
function formatCheckResult(result, stat, target) {
  if (result && typeof result === 'object' && Array.isArray(result.rolls)) {
    const diceStr = result.rolls.join(', ');
    const sCount = result.successes ?? result.rolls.filter(r => r >= target).length;
    return `Rolled [${diceStr}] — ${result.passed ? 'PASSED' : 'FAILED'} (${stat} ${target}+, ${sCount} success${sCount !== 1 ? 'es' : ''})`;
  }
  return null;
}

async function showResult(ctx, title, lines) {
  const body = Array.isArray(lines) ? lines.join('\n') : lines;
  await ctx.promptChoice?.(`${title}\n\n${body}`, [{ label: 'Continue' }]);
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
  const gear = hero?.gear;
  if (gear && typeof gear === 'object' && !Array.isArray(gear)) {
    const transportItem = gear.transport || gear.Transport;
    if (transportItem) return true;
    for (const item of Object.values(gear)) {
      if (!item) continue;
      const tags = (item.tags || []).map(t => String(t).toLowerCase());
      if (tags.includes('transport')) return true;
      if (String(item.type || '').toLowerCase() === 'transport') return true;
    }
  }
  const inv = Array.isArray(hero?.inventory) ? hero.inventory : [];
  return inv.some(it => {
    if (!it) return false;
    const tags = (it.tags || []).map(t => String(t).toLowerCase());
    return tags.includes('transport') || String(it.type || '').toLowerCase() === 'transport';
  });
}

// ---- UI text (lore/effect) -----------------------------------------------
export function display(roll) {
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
export async function apply(roll, ctx) {
  const id = ctx.getActiveHeroId?.();
  if (!id) return { log: [] };

  const info = display(roll);
  const log = [];

  log.push(`[Smuggler's Den] (${roll}) ${info.title} — ${info.lore}`);
  log.push(`Effect: ${info.effect}`);

  // 2: He Arrived in Town Just Before You Did
  if (roll === 2) {
    const hero = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? {};
    const isOutlaw = hasKeyword(hero, 'Outlaw');

    if (isOutlaw) {
      const choice = await ctx.promptChoice?.(
        `HE ARRIVED IN TOWN JUST BEFORE YOU DID\n\n${info.lore}\n\nYou are an Outlaw — this is it! Your Location Visit is over.\n\nChoose:`,
        [
          { label: 'Play the \u201CHigh Noon Duel\u201D Solo Town Adventure' },
          { label: 'Use 1 Grit to flee Town (become Wanted!)' },
        ]
      );
      const duel = choice === 0;

      if (duel) {
        const you = d2d6();
        const them = d2d6();
        if (you >= them) {
          ctx.updateHero?.(id, h => ({ ...h, xp: (h.xp || 0) + 25 }));
          const outcome = `High Noon Duel: You drew faster (${you} vs ${them})! +25 XP.`;
          log.push(outcome);
          await showResult(ctx, 'HIGH NOON DUEL — Result', [outcome]);
          ctx.toast?.(outcome);
        } else {
          ctx.updateHero?.(id, h => addWanted(h));
          const outcome = `High Noon Duel: Outdrawn (${you} vs ${them}). You are now Wanted!`;
          log.push(outcome);
          await showResult(ctx, 'HIGH NOON DUEL — Result', [outcome]);
          ctx.toast?.(outcome);
        }
      } else {
        ctx.updateHero?.(id, h => {
          const wanted = addWanted(h);
          const curGrit = h.currentGrit ?? h.grit ?? 0;
          return { ...wanted, currentGrit: Math.max(0, curGrit - 1), grit: Math.max(0, curGrit - 1) };
        });
        const outcome = 'You spend 1 Grit and flee Town. You are now Wanted!';
        log.push(outcome);
        await showResult(ctx, 'HE ARRIVED IN TOWN — Result', [outcome]);
        ctx.toast?.(outcome);
      }
      ctx.updateHero?.(id, h => ({ ...h, isDone: true }));
    } else {
      const cost = await ctxD6(ctx, 'Marshal Shakedown — Roll 1d6 for cost (\u00D7$100)') * 100;
      const costLine = `Cost rolled: D6\u00D7$100 = $${cost}.`;
      log.push(costLine);
      const choice = await ctx.promptChoice?.(
        `HE ARRIVED IN TOWN JUST BEFORE YOU DID\n\n${info.lore}\n\nYou are not an Outlaw, so you must pay or flee.\n\n${costLine}\n\nChoose:`,
        [
          { label: `Pay $${cost} to avoid trouble` },
          { label: 'Flee Town and become Wanted!' },
        ]
      );
      const pay = choice === 0;
      if (pay) {
        ctx.updateHero?.(id, h => ({ ...h, gold: Math.max(0, (h.gold || 0) - cost) }));
        const outcome = `You pay $${cost} to slip away quietly.`;
        log.push(outcome);
        await showResult(ctx, 'HE ARRIVED IN TOWN — Result', [costLine, '', outcome]);
        ctx.toast?.(outcome);
      } else {
        ctx.updateHero?.(id, h => ({ ...addWanted(h), isDone: true }));
        const outcome = 'You flee Town. You are now Wanted!';
        log.push(outcome);
        await showResult(ctx, 'HE ARRIVED IN TOWN — Result', [outcome]);
        ctx.toast?.(outcome);
      }
    }
    return { log };
  }

  // 3: "It's a Raid!"
  if (roll === 3) {
    patchShopMods({ destroyed: true });
    const hero = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? {};
    const heroName = hero?.name || 'Hero';

    await showResult(ctx, '\u201CIT\u2019S A RAID!\u201D', [
      info.lore,
      '',
      'The Smuggler\u2019s Den is closed for the rest of this Town Stay.',
    ]);
    log.push('The Smuggler\u2019s Den is closed for the rest of this Town Stay.');

    if (hasWanted(hero)) {
      const luckResult = await ctx.doSkillCheck(id, {
        stat: 'Luck', target: 6, returnDetails: true,
        message: `IT\u2019S A RAID!\n${heroName} is Wanted!\nYou must pass a Luck 6+ test to sneak out the back in the confusion.`,
      });
      const luckLine = formatCheckResult(luckResult, 'Luck', 6);
      if (luckLine) log.push(luckLine);
      const luckPassed = luckResult?.passed ?? luckResult;

      if (luckPassed) {
        const outcome = 'You slip out the back in the confusion. Safe \u2014 for now.';
        log.push(outcome);
        await showResult(ctx, 'IT\u2019S A RAID! — Luck Test', [luckLine, '', outcome]);
        ctx.toast?.(`${heroName} escaped the raid!`);
      } else {
        const cunResult = await ctx.doSkillCheck(id, {
          stat: 'Cunning', target: 3, returnDetails: true,
          message: `IT\u2019S A RAID!\n${heroName} is arrested and thrown in jail!\nMake a Cunning 3+ test to escape and flee Town.\n(Gain 20 XP but your Town Stay is over.)`,
        });
        const cunLine = formatCheckResult(cunResult, 'Cunning', 3);
        if (cunLine) log.push(cunLine);
        const cunPassed = cunResult?.passed ?? cunResult;

        if (cunPassed) {
          ctx.updateHero?.(id, h => ({
            ...h,
            xp: (h.xp || 0) + 20,
            isDone: true,
          }));
          const outcome = 'You pick the lock and escape, fleeing Town! +20 XP. Your Town Stay is over.';
          log.push(outcome);
          await showResult(ctx, 'IT\u2019S A RAID! — Jail Escape', [luckLine, cunLine, '', outcome]);
          ctx.toast?.(`${heroName} escaped jail! +20 XP. Town Stay over.`);
        } else {
          const outcome = 'Escape failed\u2026 you are hung at dawn. Your Hero is killed (though your Hero Posse may play the Hanging High Town Adventure to rescue you).';
          log.push(outcome);
          await showResult(ctx, 'IT\u2019S A RAID! — Hung at Dawn', [luckLine, cunLine, '', outcome]);
          await ctx.enqueueChartRoll?.(id, 'hangingHigh');
          ctx.updateHero?.(id, h => ({ ...h, isDone: true }));
        }
      }
    }
    return { log };
  }

  // 4-5: "What'chu Lookin' at, Boy?"
  if (roll === 4 || roll === 5) {
    const hero = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? {};
    const curGrit = hero.currentGrit ?? hero.grit ?? 0;
    if (curGrit > 0) {
      ctx.updateHero?.(id, h => {
        const g = h.currentGrit ?? h.grit ?? 0;
        return { ...h, currentGrit: Math.max(0, g - 1), grit: Math.max(0, g - 1) };
      });
      const outcome = 'A large, nasty-looking thug turns his attention to you. Lose 1 Grit as you stare down the thug.';
      log.push(outcome);
      await showResult(ctx, '\u201CWHAT\u2019CHU LOOKIN\u2019 AT, BOY?\u201D', [outcome]);
      ctx.toast?.('Lose 1 Grit staring down a thug.');
    } else {
      ctx.updateHero?.(id, h => ({ ...h, isDone: true }));
      const outcome = 'A large, nasty-looking thug turns his attention to you. You do not have a Grit \u2014 you quickly make your way to the door and your visit is over.';
      log.push(outcome);
      await showResult(ctx, '\u201CWHAT\u2019CHU LOOKIN\u2019 AT, BOY?\u201D', [outcome]);
      ctx.toast?.('No Grit — visit to Smuggler\u2019s Den is over.');
    }
    return { log };
  }

  // 6-8: Drunken Debauchery and Veiled Threats
  if (roll >= 6 && roll <= 8) {
    log.push('Drunken Debauchery and Veiled Threats — No Event.');
    await showResult(ctx, 'DRUNKEN DEBAUCHERY AND VEILED THREATS', [info.lore, '', 'No Event.']);
    return { log };
  }

  // 9-10: A Big Haul
  if (roll === 9 || roll === 10) {
    const extra = 2;
    try {
      patchDayMods({ smugglersBigHaulExtra: extra });
    } catch {
      patchShopMods({ bigHaulExtra: extra });
    }
    const outcome = `Roll for and draw an extra ${extra} Items for the Black Market Goods.`;
    log.push(outcome);
    await showResult(ctx, 'A BIG HAUL', [info.lore, '', outcome]);
    ctx.toast?.(`A Big Haul: +${extra} extra Black Market items.`);
    return { log };
  }

  // 11: Honor Among Thieves
  if (roll === 11) {
    const cash = await ctxD6(ctx, 'Honor Among Thieves — Roll 1d6 for gold (\u00D7$25)') * 25;
    const cashLine = `Rolled D6\u00D7$25 = $${cash}.`;
    log.push(cashLine);
    const hero = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? {};
    const isOutlaw = hasKeyword(hero, 'Outlaw');
    const isWanted = hasWanted(hero);

    ctx.updateHero?.(id, h => {
      const maxGrit = h.maxGrit ?? h.stats?.Grit ?? 2;
      let grit = h.currentGrit ?? h.grit ?? 0;

      if (isWanted) {
        grit = maxGrit;
      } else if (isOutlaw) {
        grit = Math.min(maxGrit, grit + 1);
      }

      return {
        ...h,
        gold: (h.gold || 0) + cash,
        xp: (h.xp || 0) + 10,
        currentGrit: grit,
        grit,
      };
    });

    let gritMsg = '';
    if (isWanted) gritMsg = '\nYou are Wanted! \u2014 Recover Grit up to your Max Grit.';
    else if (isOutlaw) gritMsg = '\nYou are an Outlaw \u2014 also Recover 1 Grit.';
    const outcome = `Gain $${cash} and 10 XP.${gritMsg}`;
    log.push(outcome);
    await showResult(ctx, 'HONOR AMONG THIEVES', [info.lore, '', cashLine, '', outcome]);
    ctx.toast?.(`Honor Among Thieves: +$${cash}, +10 XP.${gritMsg}`);
    return { log };
  }

  // 12: One Last Job
  if (roll === 12) {
    const hero = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? {};
    const heroName = hero?.name || 'Hero';

    const acceptChoice = await ctx.promptChoice?.(
      `ONE LAST JOB\n\n${info.lore}\n\nIf you accept, your Town Stay is over.\nThe heist has 3 phases:\n  1. Cunning 5+ \u2014 plan the heist (+2 Agility per success)\n  2. Agility 6+ \u2014 rob the train ($500 + 1 Corruption per success)\n  3. Luck 5+ \u2014 get away clean or lose half and become Wanted!`,
      [
        { label: 'Accept the Job' },
        { label: 'Decline' },
      ]
    );
    if (acceptChoice === 1) {
      const outcome = `${heroName} wisely declines the bandido\u2019s offer.`;
      log.push(outcome);
      await showResult(ctx, 'ONE LAST JOB — Declined', [outcome]);
      return { log };
    }

    ctx.updateHero?.(id, h => ({ ...h, isDone: true }));

    // Phase 1: Cunning 5+ — plan the heist
    const cunResult = await ctx.doSkillCheck(id, {
      stat: 'Cunning', target: 5, returnDetails: true,
      message: `ONE LAST JOB — Phase 1: Planning\nMake a Cunning 5+ test to plan the heist.\nFor every 5+ rolled, you are +2 Agility when robbing the train.`,
    });
    const cunLine = formatCheckResult(cunResult, 'Cunning', 5);
    if (cunLine) log.push(`Phase 1: ${cunLine}`);

    let cunSuccesses = 0;
    if (cunResult && typeof cunResult === 'object' && Number.isFinite(cunResult.successes)) {
      cunSuccesses = cunResult.successes;
    } else if (cunResult && typeof cunResult === 'object' && Array.isArray(cunResult.rolls)) {
      cunSuccesses = cunResult.rolls.filter(r => r >= 5).length;
    } else {
      cunSuccesses = (cunResult?.passed ?? cunResult) ? 1 : 0;
    }

    const agiBonus = cunSuccesses * 2;
    const planOutcome = cunSuccesses > 0
      ? `${cunSuccesses} success(es) — +${agiBonus} Agility bonus for the robbery!`
      : 'No successes — no Agility bonus for the robbery.';
    log.push(planOutcome);
    await showResult(ctx, 'ONE LAST JOB — Phase 1 Result', [cunLine, '', planOutcome]);

    // Apply temporary Agility buff for Phase 2
    const hasTransportItem = heroHasTransport(hero);
    const transportBonus = hasTransportItem ? 2 : 0;
    const totalBonus = agiBonus + transportBonus;

    if (totalBonus > 0) {
      ctx.updateHero?.(id, (h) => ({
        ...h,
        locationVisitBuffs: {
          ...(h.locationVisitBuffs || {}),
          Agility: ((h.locationVisitBuffs?.Agility) || 0) + totalBonus,
        },
      }));
    }

    // Phase 2: Agility 6+ — rob the train
    let bonusDesc = '';
    if (agiBonus > 0 && transportBonus > 0) bonusDesc = ` (+${agiBonus} from planning, +${transportBonus} from Transport item)`;
    else if (agiBonus > 0) bonusDesc = ` (+${agiBonus} from planning)`;
    else if (transportBonus > 0) bonusDesc = ` (+${transportBonus} from Transport item)`;

    const agiResult = await ctx.doSkillCheck(id, {
      stat: 'Agility', target: 6, returnDetails: true,
      message: `ONE LAST JOB — Phase 2: Robbing the Train\nMake an Agility 6+ test to ride out and board the train${bonusDesc}.\nFor every 6+ rolled, gain $500 and take 1 Corruption Hit.`,
    });
    const agiLine = formatCheckResult(agiResult, 'Agility', 6);
    if (agiLine) log.push(`Phase 2: ${agiLine}`);

    let agiSuccesses = 0;
    if (agiResult && typeof agiResult === 'object' && Array.isArray(agiResult.rolls)) {
      agiSuccesses = agiResult.rolls.filter(r => r >= 6).length;
    } else {
      agiSuccesses = (agiResult?.passed ?? agiResult) ? 1 : 0;
    }

    const earnings = agiSuccesses * 500;
    const corruption = agiSuccesses;
    const robberyOutcome = agiSuccesses > 0
      ? `${agiSuccesses} success(es) — Robbery haul: $${earnings}, Corruption Hits: ${corruption}.`
      : 'The robbery doesn\u2019t go as planned \u2014 no loot from the heist.';
    log.push(robberyOutcome);
    await showResult(ctx, 'ONE LAST JOB — Phase 2 Result', [agiLine, '', robberyOutcome]);

    // Remove temporary Agility buff
    if (totalBonus > 0) {
      ctx.updateHero?.(id, (h) => {
        const buffs = { ...(h.locationVisitBuffs || {}) };
        const cur = (buffs.Agility || 0) - totalBonus;
        if (cur <= 0) delete buffs.Agility;
        else buffs.Agility = cur;
        return { ...h, locationVisitBuffs: buffs };
      });
    }

    // Phase 3: Luck 5+ — the getaway
    const luckResult = await ctx.doSkillCheck(id, {
      stat: 'Luck', target: 5, returnDetails: true,
      message: `ONE LAST JOB — Phase 3: The Getaway\nMake a Luck 5+ test.\nPass: you got away clean. Fail: lose half your earnings and become Wanted!${earnings > 0 ? `\n\nCurrent haul: $${earnings}` : ''}`,
    });
    const luckLine = formatCheckResult(luckResult, 'Luck', 5);
    if (luckLine) log.push(`Phase 3: ${luckLine}`);
    const luckPassed = luckResult?.passed ?? luckResult;

    if (luckPassed) {
      ctx.updateHero?.(id, h => ({
        ...h,
        gold: (h.gold || 0) + earnings,
        corruption: (h.corruption || 0) + corruption,
      }));
      const outcome = earnings > 0
        ? `You got away without a hitch! +$${earnings}, +${corruption} Corruption Hit(s).`
        : 'The robbery was a bust, but at least you got away without a hitch.';
      log.push(outcome);
      await showResult(ctx, 'ONE LAST JOB — Getaway Result', [luckLine, '', outcome]);
      ctx.toast?.(outcome);
    } else {
      const halfEarnings = Math.floor(earnings / 2);
      ctx.updateHero?.(id, h => {
        const wanted = addWanted(h);
        return {
          ...wanted,
          gold: (h.gold || 0) + halfEarnings,
          corruption: (h.corruption || 0) + corruption,
        };
      });
      const outcome = earnings > 0
        ? `The swarthy bandido sold you out! You keep only $${halfEarnings} (half of $${earnings}), take ${corruption} Corruption Hit(s), and become Wanted!`
        : 'The swarthy bandido sold you out! The robbery was a bust and you become Wanted!';
      log.push(outcome);
      await showResult(ctx, 'ONE LAST JOB — Getaway Result', [luckLine, '', outcome]);
      ctx.toast?.(outcome);
    }
    return { log };
  }

  return { log };
}

// --------- Named wrapper so the registry can call like others ---------------
export async function handleSmugglersDenEvent(ctx = {}) {
  const roll = ctx.forcedRoll ?? d2d6();
  const result = await apply(roll, ctx);
  return {
    actions: [],
    townState: ctx.townState,
    log: result?.log || [`Smuggler's Den Event Roll: ${roll}`],
    eventRoll: roll,
    eventIndex: Math.max(0, roll - 2),
  };
}

export const smugglersDenHandler = { display, apply };
export default smugglersDenHandler;
