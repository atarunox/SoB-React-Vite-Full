// src/utils/locationHandlers/saloonHandler.js
import { loadTownState, saveTownState } from '../../utils/townState';

import { d6, d3 } from '../../utils/diceHelpers';

const shopId = 'saloon';

// ---------- townState helpers ----------
function patchGlobalRules(patch) {
  const s = loadTownState() || {};
  const next = { ...(s.globalRules || {}), ...patch };
  saveTownState({ ...s, globalRules: next });
}

// ---------- display (title / lore / effect) ----------
export function display(roll) {
  switch (roll) {
    case 2:
      return {
        title: 'Assassination Attempt',
        lore: 'A rival takes a shot while your back is turned.',
        effect:
          'Make a Spirit 5+ test to sense it coming or a Luck 6+ test to duck at the last second. If failed, roll on the Injury chart with only a single D6 (instead of 2D6).',
      };
    case 3:
      return {
        title: '“You a’Cheatin’ Us?!”',
        lore: 'An angry mob forms, with you in their sights.',
        effect:
          'Cunning 6+ to diffuse the situation or Agility 4+ to escape (leaving the Saloon). If failed, roll on the Injury chart.',
      };
    case 4:
      return {
        title: 'Spilled Drink',
        lore: 'A drunken patron blames his spilled drink on you.',
        effect:
          'Choose: Leave Town at the end of the day, OR buy him and his friends another round of drinks (cost D6×$25).',
      };
    case 5:
      return {
        title: 'Bar Fight',
        lore: 'A nasty bar fight has broken out.',
        effect:
          'Make a Strength 5+ test to push through to safety. If failed, take D6 Wounds (carry over to the next Adventure).',
      };
    case 6:
      return {
        title: 'Dark Tidings',
        lore: 'A sullen mood fills the bar.',
        effect:
          'Start the next Adventure with one less Grit than normal (–1 Grit).',
      };
    case 7:
      return {
        title: 'A Good Time',
        lore: 'A round of drinks makes you forget about the dark world outside.',
        effect: 'Pay $10 and Recover 1 Grit for use in Town.',
      };
    case 8:
      return {
        title: 'A Tall Tale',
        lore: 'Inspired to tell a story of your own.',
        effect: 'Make a Lore 5+ test and gain 10 XP for every 5+ rolled.',
      };
    case 9:
      return {
        title: 'Aces and Eights',
        lore: 'This seems to be your lucky night.',
        effect:
          'Gain +2 Luck and +2 Cunning during this Location Visit (temporary).',
      };
    case 10:
      return {
        title: 'Song and Dance',
        lore: 'One of the saloon girls catches your eye and leads you to a back room.',
        effect:
          'Make a Luck 5+ test. If passed, regain D3 Health. If failed, you are knocked out and lose D6×$25; your Saloon visit ends immediately.',
      };
    case 11:
      return {
        title: 'A Catchy Tune',
        lore: 'The song lingers in your mind, long into the night.',
        effect: 'Start the next Adventure with Max Grit (+1 Grit).',
      };
    case 12:
      return {
        title: 'Hero of the People',
        lore: 'You’re riding high tonight! The locals cheer you on.',
        effect:
          'All Gambling winnings are doubled during this visit, and the locals buy you a few drinks. Gain 2 Whiskey Tokens.',
      };
    default:
      return { title: 'Quiet Night', lore: '', effect: 'No Event.' };
  }
}

// ---------- mechanics (Resolve) ----------
/**
 * ctx methods:
 * - getActiveHeroId()
 * - updateHero(id, patchOrFn)
 * - addToken(id, tokenName)
 * - enqueueChartRoll(id, chartName)
 * - doSkillCheck(id, { stat, target })
 * - promptChoice(title, options[])   // {label}
 * - toast(msg)
 */
export async function apply(roll, ctx) {
  const id = ctx.getActiveHeroId?.();
  if (!id) return;

  // 2: Assassination Attempt – Spirit 5+ or Luck 6+ else Injury
  if (roll === 2) {
    const okSpirit = await ctx.doSkillCheck(id, { stat: 'Spirit', target: 5 });
    const okLuck = okSpirit || (await ctx.doSkillCheck(id, { stat: 'Luck', target: 6 }));
    if (!okLuck) {
      await ctx.enqueueChartRoll(id, 'injury');
      ctx.toast?.('Assassination Attempt: roll on the Injury chart (single D6).');
    }
    return;
  }

  // 3: “You a’Cheatin’ Us?!” – Cunning 6+ or Agility 4+ else Injury
  if (roll === 3) {
    const okCun = await ctx.doSkillCheck(id, { stat: 'Cunning', target: 6 });
    const okAgi = okCun || (await ctx.doSkillCheck(id, { stat: 'Agility', target: 4 }));
    if (!okAgi) {
      await ctx.enqueueChartRoll(id, 'injury');
      ctx.toast?.('Mob roughs you up — roll on the Injury chart.');
    }
    return;
  }

  // 4: Spilled Drink – Leave or pay D6×$25
  if (roll === 4) {
    const cost = d6() * 25;
    const idx = await ctx.promptChoice?.('Spilled Drink', [
      { label: 'Leave (end your visit at day’s end)' },
      { label: `Buy drinks for $${cost}` },
    ]);
    if (idx === 0) {
      ctx.updateHero?.(id, (h) => ({ ...h, isDone: true }));
      ctx.toast?.('You decide to leave it be. Your visit ends at the end of the day.');
    } else if (idx === 1) {
      ctx.updateHero?.(id, (h) => ({ ...h, gold: Math.max(0, (h.gold || 0) - cost) }));
      ctx.toast?.(`You buy a round: -$${cost}.`);
    }
    return;
  }

  // 5: Bar Fight – Strength 5+ else D6 Wounds
  if (roll === 5) {
    const okStr = await ctx.doSkillCheck(id, { stat: 'Strength', target: 5 });
    if (!okStr) {
      const wounds = d6();
      ctx.updateHero?.(id, (h) => ({ ...h, wounds: (h.wounds || 0) + wounds }));
      ctx.toast?.(`Bar Fight: take ${wounds} Wounds (carry over).`);
    }
    return;
  }

  // 6: Dark Tidings – Next Adventure –1 Grit
  if (roll === 6) {
    const s = loadTownState() || {};
    const cur = Number(s.globalRules?.nextAdventureMinusGrit || 0);
    patchGlobalRules({ nextAdventureMinusGrit: cur + 1 });
    ctx.toast?.('Dark Tidings: Next Adventure starts with –1 Grit.');
    return;
  }

  // 7: A Good Time – pay $10, recover 1 Grit (to max)
  if (roll === 7) {
    ctx.updateHero?.(id, (h) => {
      if ((h.gold || 0) < 10) return h; // cannot afford; quietly ignore
      const mg = h.maxGrit ?? 2;
      const next = Math.min(mg, (h.grit ?? 0) + 1);
      return { ...h, gold: (h.gold || 0) - 10, grit: next };
    });
    ctx.toast?.('A Good Time: -$10, recover 1 Grit (if not at max).');
    return;
  }

  // 8: A Tall Tale – Lore 5+: +10 XP
  if (roll === 8) {
    const okLore = await ctx.doSkillCheck(id, { stat: 'Lore', target: 5 });
    if (okLore) {
      ctx.updateHero?.(id, (h) => ({ ...h, xp: (h.xp || 0) + 10 }));
      ctx.toast?.('Tall Tale: +10 XP.');
    } else {
      ctx.toast?.('Your story falls flat.');
    }
    return;
  }

  // 9: Aces and Eights – +2 Luck & +2 Cunning this visit (flag)
  if (roll === 9) {
    const s = loadTownState() || {};
    const buffs = { ...(s.saloonVisitBuffs || {}) };
    buffs[id] = { luck: 2, cunning: 2 };
    saveTownState({ ...s, saloonVisitBuffs: buffs });
    ctx.toast?.('Aces and Eights: +2 Luck and +2 Cunning this visit.');
    return;
  }

  // 10: Song and Dance – Luck 5+: heal D3; fail: lose D6×$25 and visit ends
  if (roll === 10) {
    const okLuck = await ctx.doSkillCheck(id, { stat: 'Luck', target: 5 });
    if (okLuck) {
      const heal = d3();
      ctx.updateHero?.(id, (h) => {
        const max = h.maxHealth ?? h.max_health ?? 10;
        const cur = h.currentHealth ?? h.health ?? max;
        const hp = Math.min(max, cur + heal);
        return { ...h, health: hp, currentHealth: hp };
      });
      ctx.toast?.(`Song and Dance: regain ${heal} Health.`);
    } else {
      const cost = d6() * 25;
      ctx.updateHero?.(id, (h) => ({
        ...h,
        isDone: true,
        gold: Math.max(0, (h.gold || 0) - cost),
      }));
      ctx.toast?.(`Knocked out: lose $${cost} and your visit ends.`);
    }
    return;
  }

  // 11: A Catchy Tune – Next Adventure +1 Grit
  if (roll === 11) {
    const s = loadTownState() || {};
    const cur = Number(s.globalRules?.nextAdventurePlusGrit || 0);
    patchGlobalRules({ nextAdventurePlusGrit: cur + 1 });
    ctx.toast?.('A Catchy Tune: Next Adventure starts with +1 Grit.');
    return;
  }

  // 12: Hero of the People – double gambling & 2 Whiskey tokens
  if (roll === 12) {
    const s = loadTownState() || {};
    const flags = { ...(s.saloonVisitFlags || {}) };
    flags.doubleGambling = true;
    saveTownState({ ...s, saloonVisitFlags: flags });

    await ctx.addToken?.(id, 'Whiskey');
    await ctx.addToken?.(id, 'Whiskey');
    ctx.toast?.('Hero of the People: Double gambling this visit and +2 Whiskey tokens.');
  }
}

// --------- Dispatcher compatible with locationEventsEngine ---------------
export async function handleSaloonEvent(ctx = {}) {
  const roll = ctx.forcedRoll ?? (d6() + d6());
  await apply(roll, ctx);
  return {
    actions: [],
    townState: ctx.townState,
    log: [`Saloon Event Roll: ${roll}`],
    eventRoll: roll,
    eventIndex: Math.max(0, roll - 2),
  };
}

export const saloonHandler = { display, apply };
export default saloonHandler;
