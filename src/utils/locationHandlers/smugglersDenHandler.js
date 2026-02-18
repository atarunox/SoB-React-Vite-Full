// src/utils/locationHandlers/smugglersDenHandler.js
import { loadTownState, saveTownState, patchDayMods } from '../../utils/townState';

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

// ---- UI text (lore/effect) -----------------------------------------------
function display(roll) {
  switch (roll) {
    case 2:
      return {
        title: 'He Arrived in Town Just Before You Did',
        lore: 'Boot heels click. A shadow leans off the post, hand drifting to iron.',
        effect:
          'Outlaws: High Noon Duel. Others: Pay D6×$100 or become Wanted.'
      };
    case 3:
      return {
        title: '“It’s a Raid!”',
        lore: 'Badges kick the door and the lamplight dies in smoke.',
        effect:
          'Agility 6+ or become Wanted. On a failure, also roll on the Hanging High chart.'
      };
    case 4:
    case 5:
      return {
        title: '“What’chu Lookin’ at, Boy?”',
        lore: 'A room goes quiet. Eyes turn. Knuckles pop.',
        effect:
          'Lose 1 Grit (if able) to keep your head down and stay. (If you cannot, nothing further happens.)'
      };
    case 6:
    case 7:
    case 8:
      return {
        title: 'Drunken Debauchery and Veiled Threats',
        lore: 'Nothing you ain’t seen before.',
        effect: 'No Event.'
      };
    case 9:
    case 10:
      return {
        title: 'A Big Haul',
        lore: 'A hidden cache slides open—contraband stacked to the rafters.',
        effect:
          'Roll for extra Black Market items this visit.'
      };
    case 11:
      return {
        title: 'Honor Among Thieves',
        lore: 'A cut is a cut, and a favor’s a favor.',
        effect:
          'Gain D6×$25 and +10 XP. If Wanted, recover +1 Grit; otherwise recover 1 Grit (to max).'
      };
    case 12:
      return {
        title: 'One Last Job',
        lore: 'A train schedule, a map, and a promise you probably shouldn’t believe.',
        effect:
          'Cunning 5+ and Agility 6+ to succeed. Reward: cash. Fail: become Wanted.'
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
 * - getHeroesAtShop(shopId?)           // optional; used for multi-hero effects
 * - updateHero(id, patchOrFn)
 * - enqueueChartRoll(id, chartName)    // e.g. 'injury', 'madness', 'hangingHigh'
 * - doSkillCheck(id, { stat, target }) // returns boolean
 * - promptChoice(title, options[])     // returns selected index (or key)
 * - toast(msg)
 */
async function apply(roll, ctx) {
  const id = ctx.getActiveHeroId();

  // 2: Outlaw duel / others pay or Wanted
  if (roll === 2) {
    const outlawChoice = await ctx.promptChoice?.('Are you an Outlaw?', [
      'Yes (Outlaw)',
      'No',
    ]);
    const isOutlaw = outlawChoice === 0 || outlawChoice === '0';

    if (isOutlaw) {
      // High Noon Duel — quickdraw via 2D6 vs 2D6; winner +25 XP, loser becomes Wanted
      const you = d2d6();
      const them = d2d6();
      if (you >= them) {
        ctx.updateHero(id, h => ({ ...h, xp: (h.xp || 0) + 25 }));
        ctx.toast?.(`High Noon Duel: You win (${you} vs ${them})! +25 XP.`);
      } else {
        ctx.updateHero(id, h => addWanted(h));
        ctx.toast?.(`High Noon Duel: You lose (${you} vs ${them}). You are now Wanted.`);
      }
    } else {
      const cost = d6() * 100;
      const choice = await ctx.promptChoice?.('Pay up or get marked?', [
        `Pay $${cost}`,
        'Become Wanted',
      ]);
      const pay = choice === 0 || choice === '0';
      if (pay) {
        ctx.updateHero(id, h => ({ ...h, gold: Math.max(0, (h.gold || 0) - cost) }));
        ctx.toast?.(`You pay $${cost} to avoid trouble.`);
      } else {
        ctx.updateHero(id, h => addWanted(h));
        ctx.toast?.('You are now Wanted.');
      }
    }
    return;
  }

  // 3: Raid — Agility 6+ or Wanted; on fail also Hanging High
  if (roll === 3) {
    const okAgi = await ctx.doSkillCheck(id, { stat: 'Agility', target: 6 });
    if (!okAgi) {
      ctx.updateHero(id, h => addWanted(h));
      ctx.toast?.('Raid: You are Wanted!');
      await ctx.enqueueChartRoll?.(id, 'hangingHigh');
    } else {
      ctx.toast?.('You slip out the back as the badges pour in.');
    }
    return;
  }

  // 4–5: Lose 1 Grit if able
  if (roll === 4 || roll === 5) {
    ctx.updateHero(id, h => {
      const grit = Math.max(0, (h.grit ?? 0) - (h.grit > 0 ? 1 : 0));
      return { ...h, grit };
    });
    ctx.toast?.('Tense stares: Lose 1 Grit (if you had any).');
    return;
  }

  // 6–8: No event
  if (roll >= 6 && roll <= 8) {
    ctx.toast?.('No Event.');
    return;
  }

  // 9–10: Big Haul — flag extra inventory rolls for Black Market (per-day + legacy shop flag)
  if (roll === 9 || roll === 10) {
    const extra = d6(); // how many extra items to spawn/show; let UI honor this
    try {
      // Preferred: a day-scoped flag (clears automatically at end of day)
      patchDayMods({ smugglersBigHaulExtra: extra });
    } catch {
      // Fallback: legacy shopMods if dayMods helper isn’t available
      patchShopMods({ bigHaulExtra: extra });
    }
    ctx.toast?.(`A Big Haul: +${extra} extra Black Market item roll(s) available this visit.`);
    return;
  }

  // 11: Honor Among Thieves — money + XP; grit recovery (bonus if Wanted)
  if (roll === 11) {
    const cash = d6() * 25;
    ctx.updateHero(id, h => {
      const maxGrit = h.maxGrit ?? 2;
      const baseGrit = Math.min(maxGrit, (h.grit ?? 0) + 1);
      const bonus = hasWanted(h) ? 1 : 0;
      const grit = Math.min(maxGrit, baseGrit + bonus);
      return {
        ...h,
        gold: (h.gold || 0) + cash,
        xp: (h.xp || 0) + 10,
        grit,
      };
    });
    ctx.toast?.(`Honor Among Thieves: +$${cash}, +10 XP, and recover Grit (extra +1 if Wanted).`);
    return;
  }

  // 12: One Last Job — Cunning 5+ and Agility 6+; success=money, fail=Wanted
  if (roll === 12) {
    const okCun = await ctx.doSkillCheck(id, { stat: 'Cunning', target: 5 });
    const okAgi = okCun && await ctx.doSkillCheck(id, { stat: 'Agility', target: 6 });
    if (okCun && okAgi) {
      const haul = d6() * 100; // simple payout; adjust if you want bigger scores
      ctx.updateHero(id, h => ({ ...h, gold: (h.gold || 0) + haul }));
      ctx.toast?.(`One Last Job: Success! You score $${haul}.`);
    } else {
      ctx.updateHero(id, h => addWanted(h));
      ctx.toast?.('One Last Job: It goes sideways—you are now Wanted.');
    }
    return;
  }
}

// --------- Named wrapper so the registry can call like others ---------------
export async function handleSmugglersDenEvent(ctx = {}) {
  const roll = ctx.forcedRoll ?? d2d6();
  await apply(roll, ctx);
  return {
    actions: [],
    townState: ctx.townState,
    log: [`Smuggler's Den Event Roll: ${roll}`],
    eventRoll: roll,
    eventIndex: Math.max(0, roll - 2),
  };
}

// Keep the original object export (if used elsewhere)
export const smugglersDenHandler = { display, apply };
