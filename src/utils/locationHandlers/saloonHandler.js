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
        effect: 'Start the next Adventure with Max Grit.',
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
  if (!id) return { log: [] };

  const info = display(roll);
  const log = [];

  // Every event starts with its title and lore/flavor text
  log.push(`[Saloon] (${roll}) ${info.title} — ${info.lore}`);
  log.push(`Effect: ${info.effect}`);

  // 2: Assassination Attempt – Spirit 5+ or Luck 6+ else Injury
  if (roll === 2) {
    const okSpirit = await ctx.doSkillCheck(id, { stat: 'Spirit', target: 5 });
    const okLuck = okSpirit || (await ctx.doSkillCheck(id, { stat: 'Luck', target: 6 }));
    if (okLuck) {
      log.push('You sense the danger just in time and dodge the attack. No further effect.');
      ctx.toast?.('Assassination Attempt avoided!');
    } else {
      await ctx.enqueueChartRoll(id, 'injury');
      log.push('The shot catches you off guard. Roll on the Injury chart with only a single D6 (instead of 2D6).');
      ctx.toast?.('Assassination Attempt: roll on the Injury chart (single D6).');
    }
    return { log };
  }

  // 3: Cheatin – Cunning 6+ or Agility 4+ else Injury & thrown out
  if (roll === 3) {
    const okCun = await ctx.doSkillCheck(id, { stat: 'Cunning', target: 6 });
    const okAgi = okCun || (await ctx.doSkillCheck(id, { stat: 'Agility', target: 4 }));
    if (okAgi) {
      log.push(okCun
        ? 'You talk your way out of it, calming the mob down.'
        : 'You slip out the door before the mob can grab you. You leave the Saloon.');
      ctx.toast?.(okCun ? 'You diffused the situation.' : 'You escaped the mob!');
    } else {
      await ctx.enqueueChartRoll(id, 'injury');
      ctx.updateHero?.(id, (h) => ({ ...h, isDone: true }));
      log.push('The mob roughs you up and throws you out the door. Roll on the Injury chart. Your visit ends.');
      ctx.toast?.('Mob roughs you up and throws you out. Roll on Injury chart. Visit ends.');
    }
    return { log };
  }

  // 4: Spilled Drink – Leave or pay D6x$25
  if (roll === 4) {
    const cost = d6() * 25;
    const idx = await ctx.promptChoice?.('Spilled Drink', [
      { label: 'Leave Town at the end of the day' },
      { label: `Buy him and his friends drinks for $${cost}` },
    ]);
    if (idx === 0) {
      ctx.updateHero?.(id, (h) => ({ ...h, isDone: true }));
      log.push('You decide to leave rather than deal with the drunken patron. Your visit ends at the end of the day.');
      ctx.toast?.('Spilled Drink: leaving Town at end of day.');
    } else if (idx === 1) {
      ctx.updateHero?.(id, (h) => ({ ...h, gold: Math.max(0, (h.gold || 0) - cost) }));
      log.push(`You buy a round for the offended patron and his friends: -$${cost}.`);
      ctx.toast?.(`You buy a round: -$${cost}.`);
    }
    return { log };
  }

  // 5: Bar Fight – Strength 5+ else D6 Wounds
  if (roll === 5) {
    const okStr = await ctx.doSkillCheck(id, { stat: 'Strength', target: 5 });
    if (okStr) {
      log.push('You push your way through the brawl to safety. No injuries.');
      ctx.toast?.('Bar Fight: you push through safely!');
    } else {
      const wounds = d6();
      ctx.updateHero?.(id, (h) => ({ ...h, wounds: (h.wounds || 0) + wounds }));
      log.push(`You take ${wounds} Wounds from the bumps and bruises (these carry over to the next Adventure).`);
      ctx.toast?.(`Bar Fight: take ${wounds} Wounds (carry over).`);
    }
    return { log };
  }

  // 6: Dark Tidings – Next Adventure -1 Grit
  if (roll === 6) {
    const s = loadTownState() || {};
    const cur = Number(s.globalRules?.nextAdventureMinusGrit || 0);
    patchGlobalRules({ nextAdventureMinusGrit: cur + 1 });
    log.push('A gloomy patron tells you of a stagecoach torn to pieces by a swarm of HellBats. Start the next Adventure with one less Grit than normal.');
    ctx.toast?.('Dark Tidings: Next Adventure starts with -1 Grit.');
    return { log };
  }

  // 7: A Good Time – pay $10, recover 1 Grit (to max)
  if (roll === 7) {
    const hero = typeof ctx.getHero === 'function' && id ? ctx.getHero(id) : null;
    const heroGold = Number(hero?.gold ?? 0);
    if (heroGold < 10) {
      log.push('Not enough gold to buy a round ($10 needed).');
      ctx.toast?.('A Good Time: Not enough gold to buy a round ($10 needed).');
      return { log };
    }
    ctx.updateHero?.(id, (h) => {
      const mg = h.maxGrit ?? 2;
      const next = Math.min(mg, (h.grit ?? 0) + 1);
      return { ...h, gold: (h.gold || 0) - 10, grit: next };
    });
    log.push('A round of drinks and good company lifts your spirits. Pay $10, recover 1 Grit for use in Town.');
    ctx.toast?.('A Good Time: -$10, recover 1 Grit.');
    return { log };
  }

  // 8: A Tall Tale – Lore 5+: gain 10 XP for every 5+ rolled
  if (roll === 8) {
    const result = await ctx.doSkillCheck(id, { stat: 'Lore', target: 5, returnDetails: true });
    let successes = 0;
    if (result && typeof result === 'object' && Number.isFinite(result.successes)) {
      successes = result.successes;
    } else if (result && typeof result === 'object' && Array.isArray(result.rolls)) {
      successes = result.rolls.filter(r => r >= 5).length;
    } else if (ctx.promptNumber) {
      const n = await ctx.promptNumber?.('How many 5+ did you roll on the Lore test?', 'successes');
      successes = Math.max(0, Number(n || 0));
    } else {
      successes = result ? 1 : 0;
    }

    if (successes > 0) {
      const xpGain = successes * 10;
      ctx.updateHero?.(id, (h) => ({ ...h, xp: (h.xp || 0) + xpGain }));
      log.push(`Inspired by tales of deadly adventure, you tell a story of your own! ${successes} success(es) on Lore 5+ test: +${xpGain} XP.`);
      ctx.toast?.(`Tall Tale: ${successes} success(es) — +${xpGain} XP.`);
    } else {
      log.push('You try to tell a story of your own, but it falls flat. No XP gained.');
      ctx.toast?.('Your story falls flat.');
    }
    return { log };
  }

  // 9: Aces and Eights – +2 Luck & +2 Cunning this visit (flag)
  if (roll === 9) {
    const s = loadTownState() || {};
    const buffs = { ...(s.saloonVisitBuffs || {}) };
    buffs[id] = { luck: 2, cunning: 2 };
    saveTownState({ ...s, saloonVisitBuffs: buffs });
    log.push('This seems to be your lucky night! You gain +2 Luck and +2 Cunning during this Location Visit.');
    ctx.toast?.('Aces and Eights: +2 Luck and +2 Cunning this visit.');
    return { log };
  }

  // 10: Song and Dance – Luck 5+: heal D3; fail: lose D6x$25 and visit ends
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
      log.push(`You are reinvigorated by her comforting presence. Gain ${heal} Health.`);
      ctx.toast?.(`Song and Dance: regain ${heal} Health.`);
    } else {
      const cost = d6() * 25;
      ctx.updateHero?.(id, (h) => ({
        ...h,
        isDone: true,
        gold: Math.max(0, (h.gold || 0) - cost),
      }));
      log.push(`You are knocked over the head and wake hours later to find your wallet gone. Lose $${cost} and your visit to the Saloon ends immediately.`);
      ctx.toast?.(`Knocked out: lose $${cost} and your visit ends.`);
    }
    return { log };
  }

  // 11: A Catchy Tune – Next Adventure starts with Max Grit
  if (roll === 11) {
    patchGlobalRules({ nextAdventureMaxGrit: true });
    log.push('The song from the piano warms your heart and lingers in your mind, long into the night. Start the next Adventure with Max Grit.');
    ctx.toast?.('A Catchy Tune: Next Adventure starts with Max Grit.');
    return { log };
  }

  // 12: Hero of the People – double gambling & 2 Whiskey tokens
  if (roll === 12) {
    const s = loadTownState() || {};
    const flags = { ...(s.saloonVisitFlags || {}) };
    flags.doubleGambling = true;
    saveTownState({ ...s, saloonVisitFlags: flags });

    await ctx.addToken?.(id, 'Whiskey');
    await ctx.addToken?.(id, 'Whiskey');
    log.push('Great luck at the poker table! The locals have recognized you as a true hero, cheering you on for your efforts to clean up the West! All of your Gambling winnings are doubled during this Location Visit. The locals buy you a few drinks: gain 2 Whiskey Tokens.');
    ctx.toast?.('Hero of the People: Double gambling this visit and +2 Whiskey tokens.');
    return { log };
  }

  return { log };
}

// --------- Dispatcher compatible with locationEventsEngine ---------------
export async function handleSaloonEvent(ctx = {}) {
  const roll = ctx.forcedRoll ?? (d6() + d6());
  const result = await apply(roll, ctx);
  return {
    actions: [],
    townState: ctx.townState,
    log: result?.log || [`Saloon Event Roll: ${roll}`],
    eventRoll: roll,
    eventIndex: Math.max(0, roll - 2),
  };
}

export const saloonHandler = { display, apply };
export default saloonHandler;
