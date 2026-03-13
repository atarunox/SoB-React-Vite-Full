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

  // 2: Assassination Attempt – Choose: Spirit 5+ to sense it OR Luck 6+ to duck
  if (roll === 2) {
    const lore2 = `ASSASSINATION ATTEMPT\n${info.lore}`;
    const testChoice = await ctx.promptChoice?.(
      `ASSASSINATION ATTEMPT\n${info.lore}\n\nChoose how to react:`,
      [
        { label: 'Sense it coming (Spirit 5+ test)' },
        { label: 'Duck at the last second (Luck 6+ test)' },
      ]
    );
    let passed = false;
    if (testChoice === 1) {
      passed = await ctx.doSkillCheck(id, {
        stat: 'Luck', target: 6,
        message: `${lore2}\nYou try to duck at the last second!`,
      });
    } else {
      passed = await ctx.doSkillCheck(id, {
        stat: 'Spirit', target: 5,
        message: `${lore2}\nYou try to sense the danger before it strikes!`,
      });
    }
    if (passed) {
      log.push('Your instincts save your life! You dodge the shot just in time. No further effect.');
      ctx.toast?.('Assassination Attempt avoided!');
    } else {
      log.push('The shot catches you off guard! Roll once on the Injury Chart using only a single D6 (instead of 2D6).');
      ctx.toast?.('Hit! Roll on the Injury Chart (single D6).');
      await ctx.enqueueChartRoll(id, 'injury');
    }
    return { log };
  }

  // 3: Cheatin – Choose: Cunning 6+ to talk your way out OR Agility 4+ to escape
  if (roll === 3) {
    const lore3 = `"YOU A'CHEATIN' US?!"\n${info.lore}`;
    const testChoice = await ctx.promptChoice?.(
      `"YOU A'CHEATIN' US?!"\n${info.lore}\n\nThe mob closes in. Choose how to handle it:`,
      [
        { label: 'Talk your way out (Cunning 6+ test)' },
        { label: 'Make a run for it (Agility 4+ test)' },
      ]
    );
    let passed = false;
    const usedAgility = testChoice === 1;
    if (usedAgility) {
      passed = await ctx.doSkillCheck(id, {
        stat: 'Agility', target: 4,
        message: `${lore3}\nYou shove a chair into the crowd and bolt for the door!`,
      });
    } else {
      passed = await ctx.doSkillCheck(id, {
        stat: 'Cunning', target: 6,
        message: `${lore3}\nYou raise your hands and try to calm the angry mob...`,
      });
    }
    if (passed) {
      if (usedAgility) {
        log.push('You burst through the saloon doors and disappear into the night! You escape, but your Saloon visit ends.');
        ctx.toast?.('You escaped the mob! Visit ends.');
      } else {
        log.push('Smooth talking saves your hide. The mob grumbles but backs down.');
        ctx.toast?.('You talked your way out of it!');
      }
    } else {
      log.push('The mob drags you outside and roughs you up good. Roll once on the Injury Chart. Your Saloon visit ends immediately.');
      ctx.toast?.('The mob throws you out! Roll on the Injury Chart. Visit ends.');
      await ctx.enqueueChartRoll(id, 'injury');
      ctx.updateHero?.(id, (h) => ({ ...h, isDone: true }));
    }
    return { log };
  }

  // 4: Spilled Drink – Leave or pay D6x$25
  if (roll === 4) {
    const cost = d6() * 25;
    const idx = await ctx.promptChoice?.(
      `SPILLED DRINK\n${info.lore}\n\nHe squares up to you, fists clenched. What do you do?`,
      [
        { label: 'Walk away and leave Town at the end of the day' },
        { label: `Buy him and his friends a round of drinks ($${cost})` },
      ]
    );
    if (idx === 0) {
      ctx.updateHero?.(id, (h) => ({ ...h, isDone: true }));
      log.push('You tip your hat and walk away before things get ugly. You leave Town at the end of the day.');
      ctx.toast?.('Spilled Drink: leaving Town at end of day.');
    } else if (idx === 1) {
      ctx.updateHero?.(id, (h) => ({ ...h, gold: Math.max(0, (h.gold || 0) - cost) }));
      log.push(`You buy a round for the offended patron and his rowdy friends. The tension fades into laughter. -$${cost}.`);
      ctx.toast?.(`Bought a round: -$${cost}.`);
    }
    return { log };
  }

  // 5: Bar Fight – Strength 5+ else D6 Wounds
  if (roll === 5) {
    const lore5 = `BAR FIGHT\n${info.lore}`;
    const okStr = await ctx.doSkillCheck(id, { stat: 'Strength', target: 5, message: lore5 });
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
    const lore8 = `A TALL TALE\n${info.lore}`;
    const result = await ctx.doSkillCheck(id, { stat: 'Lore', target: 5, returnDetails: true, message: lore8 });
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
    const lore10 = `SONG AND DANCE\n${info.lore}`;
    const okLuck = await ctx.doSkillCheck(id, { stat: 'Luck', target: 5, message: lore10 });
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
