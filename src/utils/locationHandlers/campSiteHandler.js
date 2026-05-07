// src/utils/locationHandlers/campSiteHandler.js
import { loadTownState, saveTownState, ejectHero } from '../../utils/townState';
import { d6 as _d6 } from '../../utils/diceHelpers';
import { getEventDisplay } from '../locationEventText';

// Use ctx.d6 when available (respects manual roll mode); fallback to auto-roll
const ctxD6 = async (ctx, label) => (typeof ctx?.d6 === 'function') ? ctx.d6(label) : _d6();

const shopId = 'campSite';

// ---------- result formatting helper ----------
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

// ---------- display (title / lore / effect) ----------
export function display(roll) {
  return getEventDisplay(shopId, roll) || { title: 'Camp Site Event', lore: '', effect: 'No Event.' };
}

// ---------- mechanics (Resolve) ----------
export async function apply(roll, ctx) {
  const id = ctx.getActiveHeroId?.();
  if (!id) return { log: [] };

  const info = display(roll);
  const log = [];

  // Every event starts with its title and lore/flavor text
  log.push(`[Camp Site] (${roll}) ${info.title} — ${info.lore}`);
  log.push(`Effect: ${info.effect}`);

  // 2: Just My Luck — Choose: lose one item OR lose 2D6 Dark Stone
  if (roll === 2) {
    const choice = await ctx.promptChoice?.(
      `JUST MY LUCK\n${info.effect}\n\nChoose what to lose:`,
      [
        { label: 'Lose one item' },
        { label: 'Lose 2D6 Dark Stone' },
      ]
    );

    if (choice === 0) {
      const outcome = 'You lose 1 item of your choice. Remove it from your inventory.';
      log.push(outcome);
      await showResult(ctx, 'JUST MY LUCK — Result', [outcome]);
      ctx.toast?.('Just My Luck: lose 1 item.');
    } else {
      const ds1 = await ctxD6(ctx, 'Just My Luck — Roll D6 #1 for Dark Stone lost');
      const ds2 = await ctxD6(ctx, 'Just My Luck — Roll D6 #2 for Dark Stone lost');
      const dsTotal = ds1 + ds2;
      const dsLine = `Rolled [${ds1}, ${ds2}] for Dark Stone lost = ${dsTotal}.`;
      log.push(dsLine);
      ctx.updateHero?.(id, (h) => ({
        ...h,
        darkStone: Math.max(0, (h.darkStone || 0) - dsTotal),
      }));
      const outcome = `You lose ${dsTotal} Dark Stone.`;
      log.push(outcome);
      await showResult(ctx, 'JUST MY LUCK — Result', [dsLine, '', outcome]);
      ctx.toast?.(`Just My Luck: lose ${dsTotal} Dark Stone.`);
    }
    return { log };
  }

  // 3: "My Friend Doesn't Like You Much!" — High Noon Duel or leave Town
  if (roll === 3) {
    const choice = await ctx.promptChoice?.(
      `"MY FRIEND DOESN'T LIKE YOU MUCH!"\n${info.effect}\n\nWhat do you do?`,
      [
        { label: 'Face High Noon Duel (Solo Adventure)' },
        { label: 'Leave Town immediately' },
      ]
    );

    if (choice === 0) {
      const outcome = 'You accept the challenge! Triggered Solo Adventure: High Noon Duel.';
      log.push(outcome);
      await showResult(ctx, '"MY FRIEND DOESN\'T LIKE YOU MUCH!" — Result', [outcome]);
      ctx.toast?.('Triggered Solo Adventure: High Noon Duel.');
    } else {
      // Eject this hero from town (can't visit locations for rest of stay)
      ejectHero(id);
      ctx.updateHero?.(id, (h) => ({ ...h, isDone: true }));
      const outcome = 'You decide discretion is the better part of valor and leave Town immediately. You are ejected from town for the rest of this stay.';
      log.push(outcome);
      await showResult(ctx, '"MY FRIEND DOESN\'T LIKE YOU MUCH!" — Result', [outcome]);
      ctx.toast?.('You leave Town immediately — ejected for this stay.');
    }
    return { log };
  }

  // 4–5: "Step Right Up!" — Pay D6×$20 to gain +1 Grit
  if (roll === 4 || roll === 5) {
    const costRoll = await ctxD6(ctx, '"Step Right Up!" — Roll D6 for cost (×$20)');
    const cost = costRoll * 20;
    const costLine = `Rolled [${costRoll}] × $20 = $${cost} cost.`;
    log.push(costLine);

    ctx.updateHero?.(id, (h) => {
      const maxGrit = Number(h.maxGrit ?? h.stats?.Grit ?? 2);
      const curGrit = Number(h.currentGrit ?? h.grit ?? 0);
      const nextGrit = Math.min(maxGrit, curGrit + 1);
      return {
        ...h,
        gold: Math.max(0, (h.gold || 0) - cost),
        currentGrit: nextGrit,
      };
    });

    const outcome = `You pay $${cost} and gain +1 Grit.`;
    log.push(outcome);
    await showResult(ctx, '"STEP RIGHT UP!" — Result', [costLine, '', outcome]);
    ctx.toast?.(`"Step Right Up!" -$${cost}, +1 Grit.`);
    return { log };
  }

  // 6–8: No Event
  if (roll >= 6 && roll <= 8) {
    const outcome = 'A sad collection of the poor and scruffy. Nothing of note happens.';
    log.push(outcome);
    await showResult(ctx, 'NO EVENT', [outcome]);
    return { log };
  }

  // 9–10: Dirty Poker — Luck 4+ test. Gain $25 per success, lose $50 per roll of 1.
  if (roll === 9 || roll === 10) {
    const lore = `DIRTY POKER\n${info.effect}\nYou sit down at a rickety table and join a game of cards...`;
    const result = await ctx.doSkillCheck(id, {
      stat: 'Luck', target: 4, returnDetails: true,
      message: `${lore}\nMake a Luck 4+ test. Gain $25 for each success, lose $50 for each natural 1.`,
    });
    const checkLine = formatCheckResult(result, 'Luck', 4);
    if (checkLine) log.push(checkLine);

    let successes = 0;
    let ones = 0;

    if (result && typeof result === 'object' && Array.isArray(result.rolls)) {
      successes = result.rolls.filter(r => r >= 4).length;
      ones = result.rolls.filter(r => r === 1).length;
    } else {
      successes = (result?.passed ?? result) ? 1 : 0;
    }

    const winnings = successes * 25;
    const losses = ones * 50;
    const net = winnings - losses;

    if (net !== 0) {
      ctx.updateHero?.(id, (h) => ({
        ...h,
        gold: Math.max(0, (h.gold || 0) + net),
      }));
    }

    const outcome = `${successes} success${successes !== 1 ? 'es' : ''} (+$${winnings}), ${ones} natural 1${ones !== 1 ? 's' : ''} (-$${losses}). Net: ${net >= 0 ? '+' : ''}$${net}.`;
    log.push(outcome);
    await showResult(ctx, 'DIRTY POKER — Result', [checkLine, '', outcome]);
    ctx.toast?.(`Dirty Poker: net ${net >= 0 ? '+' : ''}$${net}.`);
    return { log };
  }

  // 11: Sober Morning — Doc's and Church tent rolls are +1 today
  if (roll === 11) {
    const s = loadTownState() || {};
    const dayMods = { ...(s.dayMods || {}), soberMorning: { targetShops: ['campDocsTent', 'campChurchTent'], mod: +1 } };
    saveTownState({ ...s, dayMods });

    const outcome = 'A clear head this morning gives you sharper focus at the medical and spiritual tents.';
    const buff = 'Day Mod applied: All rolls at Doc\'s Tent and Church Tent are +1 today.';
    log.push(outcome);
    log.push(buff);
    await showResult(ctx, 'SOBER MORNING — Result', [outcome, '', buff]);
    ctx.toast?.('Sober Morning: Doc\'s & Church tent rolls +1 today.');
    return { log };
  }

  // 12: "What Have We Here?" — Draw 1 Gear card
  if (roll === 12) {
    const outcome = 'You rummage through some old crates at the edge of camp and find something useful! Draw 1 Gear card.';
    log.push(outcome);
    await showResult(ctx, '"WHAT HAVE WE HERE?" — Result', [outcome]);
    ctx.toast?.('"What Have We Here?" — Draw 1 Gear card.');
    return { log };
  }

  return { log };
}

// --------- Dispatcher compatible with locationEventsEngine ---------------
export async function handleCampSiteEvent(ctx = {}) {
  const roll = ctx.forcedRoll ?? (_d6() + _d6());
  const result = await apply(roll, ctx);
  return {
    actions: [],
    townState: ctx.townState,
    log: result?.log || [`Camp Site Event Roll: ${roll}`],
    eventRoll: roll,
    eventIndex: Math.max(0, roll - 2),
  };
}

// Legacy alias — locationEventsEngine imports this name
export { handleCampSiteEvent as handleCampSiteVisit };

export const campSiteHandler = { display, apply };
export default campSiteHandler;
