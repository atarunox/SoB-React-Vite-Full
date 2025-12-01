// src/utils/locationHandlers/gamblingHallServices.js
// Executors for Gambling Hall services (Entertainment + Cashier + Specials)
// Keep prompts for dice/choices; no autoroll unless user leaves blank.

import { loadTownState, saveTownState } from '../townState.js';

// ----- small dice helpers -----
const D6 = () => Math.floor(Math.random() * 6) + 1;

// ----- context helpers (mirror Saloon style) -----
const getActiveHero = (ctx = {}) => {
  const id = ctx.getActiveHeroId?.();
  return id ? (ctx.getHeroById?.(id) || ctx.getHero?.(id) || { id }) : null;
};

function effectiveStat(ctx, hero, stat) {
  if (ctx.getEffectiveStat) return ctx.getEffectiveStat(hero.id, stat);
  if (ctx.calculateStatFor) return ctx.calculateStatFor(hero.id, stat);
  return (
    hero?.[stat] ??
    hero?.[stat?.toLowerCase?.()] ??
    hero?.core?.[stat] ??
    hero?.stats?.[stat] ??
    3
  );
}

const canAffordGold = (hero, amt = 0) => (hero?.gold || 0) >= (amt || 0);

const payGold = (ctx, heroId, amt = 0) => {
  if (!amt) return;
  ctx.updateHero?.(heroId, (h) => ({
    ...h,
    gold: Math.max(0, (h.gold || 0) - amt),
  }));
};

const addGold = (ctx, heroId, amt = 0) => {
  if (!amt) return;
  ctx.updateHero?.(heroId, (h) => ({ ...h, gold: (h.gold || 0) + amt }));
};

const addXP = (ctx, heroId, amt = 0) => {
  if (!amt) return;
  ctx.updateHero?.(heroId, (h) => ({ ...h, xp: (h.xp || 0) + amt }));
};

// Convenience: add Unwanted Attention marker if your engine supports it
const addUA = (ctx, heroId, n = 1) =>
  ctx.addCondition?.(heroId, { type: 'UnwantedAttention', delta: +n });

// Saloon Event (12) doubles gambling winnings this visit
function applyGamblingMultiplier(amount) {
  const s = loadTownState() || {};
  const dbl = s?.saloonVisitFlags?.doubleGambling ? 2 : 1;
  return amount * dbl;
}

/**
 * performGamblingHallService(serviceId, params?, ctx?)
 * Returns: { log: string[], actions?: any[], ui?: any }
 *
 * Known service IDs (aligned to tabs/data):
 *  - gh_five_card_draw_poker
 *  - gh_brimstone_craps
 *  - gh_devils_wheel
 *  - gh_cash_in_dark_stone
 *  - gh_rob_cashier
 *  - gh_the_devils_own
 *  - gh_dark_stone_poker_chip
 */
export async function performGamblingHallService(serviceId, params = {}, ctx = {}) {
  const hero = getActiveHero(ctx);
  if (!hero?.id) return { log: ['[GamblingHall] No active hero.'] };

  const id = hero.id;
  const log = [];
  const toast = (m) => ctx.toast?.(m);

  // ---------- Five Card Draw Poker ----------
  if (serviceId === 'gh_five_card_draw_poker') {
    const baseCost = 50;
    if (!canAffordGold(hero, baseCost)) {
      toast?.('Not enough gold.');
      return { log: ['Insufficient gold.'] };
    }
    payGold(ctx, id, baseCost);
    log.push(`Paid $${baseCost} to sit at the table.`);

    // Extra bet prompt ($0–$250)
    let extra = 0;
    if (ctx.promptNumber) {
      const e = await ctx.promptNumber('Extra Bet ($0–$250)?', 'extraBet');
      extra = Math.max(0, Math.min(250, Number(e || 0)));
    }
    if (extra) {
      if (!canAffordGold(hero, extra)) {
        toast?.('Not enough gold for Extra Bet.');
        return { log: ['Insufficient gold for Extra Bet.'] };
      }
      payGold(ctx, id, extra);
      log.push(`Extra Bet: $${extra}.`);
    }

    // Resolve success: prompt-first (table adjudicates actual hand)
    let success = false;
    if (ctx.promptYesNo) {
      success = !!(await ctx.promptYesNo({
        message: 'Did you win the Poker hand (per hand chart)?',
        defaultValue: false,
      }));
    } else if (ctx.doSkillCheck) {
      // fallback: simple Cunning 5+ test
      success = !!(await ctx.doSkillCheck(id, { stat: 'Cunning', target: 5, prompt: true }));
    }

    if (!success) {
      toast?.('You lose the hand.');
      log.push('Poker: failed the test.');
      return { log };
    }

    // Winnings: D6×$25 + 2×Extra Bet, then multiplied by Saloon(12) if active
    const die =
      (await ctx.promptNumber?.('Poker payout roll (D6) [leave blank to auto-roll]', 'die')) ??
      D6();

    let payout = die * 25 + (extra ? extra * 2 : 0);
    payout = applyGamblingMultiplier(payout);

    addGold(ctx, id, payout);
    toast?.(`Poker win: +$${payout}.`);
    log.push(`Poker payout: D6(${die})×25 + 2×$${extra} => $${payout}.`);

    // Optional: bonus World+Artifact if some external flag is set
    const state = loadTownState() || {};
    if (state.gamblingHallFlags?.firstPokerWinAwardsArtifact && ctx.drawWorldThenArtifact) {
      await ctx.drawWorldThenArtifact(id);
      toast?.('Bonus: Draw a World, then an Artifact (event bonus).');
      log.push('Awarded bonus World+Artifact (event 12).');

      saveTownState({
        ...state,
        gamblingHallFlags: {
          ...(state.gamblingHallFlags || {}),
          firstPokerWinAwardsArtifact: false,
        },
      });
    }

    return { log };
  }

  // ---------- Brimstone Craps ----------
  if (serviceId === 'gh_brimstone_craps') {
    const cost = 100;
    if (!canAffordGold(hero, cost)) {
      toast?.('Not enough gold.');
      return { log: ['Insufficient gold.'] };
    }
    payGold(ctx, id, cost);
    log.push(`Paid $${cost} for Brimstone Craps.`);

    // Prompt: how many 5+ successes on Luck test?
    let successes = 0;
    if (ctx.promptNumber) {
      const n = await ctx.promptNumber(
        'How many 5+ successes did you roll on your Luck test?',
        'successes',
      );
      successes = Math.max(0, Number(n || 0));
    } else if (ctx.doSkillCheck) {
      const ok = await ctx.doSkillCheck(id, { stat: 'Luck', target: 5, prompt: true });
      successes = ok ? 1 : 0;
    }

    let payout = successes * 100;
    payout = applyGamblingMultiplier(payout);

    if (payout > 0) {
      addGold(ctx, id, payout);
      toast?.(`Craps: +$${payout}.`);
      log.push(`Craps: ${successes} successes, payout $${payout}.`);
    } else {
      toast?.('Craps: no winnings.');
      log.push('Craps: no payout.');
    }

    return { log };
  }

  // ---------- The Devil's Wheel ----------
  if (serviceId === 'gh_devils_wheel') {
    const cost = 25;
    if (!canAffordGold(hero, cost)) {
      toast?.('Not enough gold.');
      return { log: ['Insufficient gold.'] };
    }
    payGold(ctx, id, cost);
    log.push(`Paid $${cost} to spin The Devil's Wheel.`);

    // Let UI handle the mini-game; we just care about jackpot / side payouts
    const jackpot = !!(await ctx.promptYesNo?.({
      message: 'Did the table hit a jackpot on the Devil’s Wheel?',
      defaultValue: false,
    }));

    if (jackpot) {
      const here = ctx.getHeroesAtShop?.('gamblingHall') || [id];
      const others = here.filter((hid) => hid !== id);
      const die =
        (await ctx.promptNumber?.(
          'Jackpot payout roll for others (D6) [leave blank to auto-roll]',
          'die',
        )) ?? D6();
      const gift = die * 25;

      for (const hid of others) addGold(ctx, hid, gift);
      toast?.(`Jackpot: each other Hero here gains $${gift}.`);
      log.push(`Jackpot gift to ${others.length} others: $${gift} each (D6=${die}).`);
    }

    return { log };
  }

  // ---------- Cash in Dark Stone ----------
  if (serviceId === 'gh_cash_in_dark_stone') {
    const max = Number(hero.darkStone || 0);
    if (max <= 0) {
      toast?.('You have no Dark Stone shards.');
      return { log: ['No Dark Stone to sell.'] };
    }

    const n = await ctx.promptNumber?.(
      `How many Dark Stone shards to sell? (0–${max})`,
      'count',
    );
    const count = Math.max(0, Math.min(max, Number(n || 0)));

    if (count <= 0) return { log: ['No shards sold.'] };

    const gold = count * 50;
    addGold(ctx, id, gold);
    ctx.updateHero?.(id, (h) => ({
      ...h,
      darkStone: Math.max(0, (h.darkStone || 0) - count),
    }));

    toast?.(`Sold ${count} shard(s) for $${gold}.`);
    log.push(`Sold ${count}× Dark Stone → $${gold}.`);
    return { log };
  }

  // ---------- Rob the Cashier ----------
  if (serviceId === 'gh_rob_cashier') {
    // Ask if they passed the Cunning 6+ test
    const passed = !!(await ctx.promptYesNo?.({
      message: 'Did you pass the Cunning 6+ test to rob the cashier?',
      defaultValue: false,
    }));

    if (!passed) {
      // Arrested at dawn — Lore 4+ to escape and flee Town (end visit), +20 XP, become Wanted
      const escaped = !!(await ctx.doSkillCheck?.(id, {
        stat: 'Lore',
        target: 4,
        prompt: true,
      }));

      addXP(ctx, id, 20);
      ctx.updateHero?.(id, (h) => ({
        ...h,
        isDone: true,
        wanted: true,
        jailed: !escaped,
      }));

      toast?.(
        escaped
          ? 'You slip out of jail and flee town.'
          : 'You are jailed! Become Wanted and gain 20 XP.',
      );
      log.push(
        escaped
          ? 'Escaped and fled Town (Wanted, +20 XP).'
          : 'Jailed (Wanted, +20 XP).',
      );
      return { log };
    }

    // On success: each 6 → D6×$100 & UA; each 1 → D6 Hits
    const sixes = Number(
      (await ctx.promptNumber?.('How many 6s did you roll on the Cunning test?', 'sixes')) || 0,
    );
    const ones = Number(
      (await ctx.promptNumber?.('How many 1s did you roll on the Cunning test?', 'ones')) || 0,
    );

    for (let i = 0; i < sixes; i++) {
      const die =
        (await ctx.promptNumber?.(
          'Payout roll (D6) for each 6 [leave blank to auto-roll]',
          'die',
        )) ?? D6();
      const payout = die * 100;
      addGold(ctx, id, payout);
      addUA(ctx, id, 1);
      log.push(`Robbery: 6 → D6(${die})×$100 = $${payout} and +1 Unwanted Attention.`);
    }

    for (let i = 0; i < ones; i++) {
      const hits =
        (await ctx.promptNumber?.(
          'Shootout Hits (D6) for each 1 [leave blank to auto-roll]',
          'die',
        )) ?? D6();
      ctx.updateHero?.(id, (h) => ({
        ...h,
        wounds: (h.wounds || 0) + hits,
      }));
      log.push(`Robbery: 1 → D6(${hits}) Hits.`);
    }

    toast?.('Robbery resolved.');
    return { log };
  }

  // ---------- Purchases: The Devil's Own ----------
  if (serviceId === 'gh_the_devils_own') {
    const cost = 600;
    if (!canAffordGold(hero, cost)) {
      toast?.('Not enough gold.');
      return { log: ['Insufficient gold.'] };
    }

    payGold(ctx, id, cost);

    const state = loadTownState() || {};
    const heroFlags = { ...(state.heroFlags || {}) };
    heroFlags[id] = { ...(heroFlags[id] || {}), devilsOwnOwned: true };

    saveTownState({ ...state, heroFlags });

    toast?.("Purchased The Devil's Own.");
    log.push("Bought The Devil's Own.");
    return { log };
  }

  // ---------- Purchases: Dark Stone Poker Chip ----------
  if (serviceId === 'gh_dark_stone_poker_chip') {
    const goldCost = 800;
    const dsCost = 1;
    const ds = Number(hero.darkStone || 0);

    if (!canAffordGold(hero, goldCost) || ds < dsCost) {
      toast?.('Not enough gold or Dark Stone.');
      return { log: ['Insufficient gold/Dark Stone.'] };
    }

    payGold(ctx, id, goldCost);
    ctx.updateHero?.(id, (h) => ({
      ...h,
      darkStone: Math.max(0, (h.darkStone || 0) - dsCost),
    }));

    // +1 Luck & “+50 on Gambling Gains” flag
    ctx.updateHero?.(id, (h) => ({
      ...h,
      effects: {
        ...(h.effects || {}),
        Luck: (h.effects?.Luck || 0) + 1,
      },
    }));

    const state = loadTownState() || {};
    const heroFlags = { ...(state.heroFlags || {}) };
    heroFlags[id] = { ...(heroFlags[id] || {}), dsPokerChip: true };
    saveTownState({ ...state, heroFlags });

    toast?.('Purchased Dark Stone Poker Chip (+1 Luck; +$50 on gambling gains).');
    log.push('Bought Dark Stone Poker Chip.');
    return { log };
  }

  // ---------- Fallback ----------
  return { log: [`[GamblingHall] Unknown service: ${serviceId}`] };
}

export async function performGamblingHallServiceObj(service, params = {}, ctx = {}) {
  return performGamblingHallService(service?.id, params, ctx);
}

// ---------- High Stakes helper (used by gamblingHallHandler) ----------
export async function performGamblingHallHighStakes(ctx = {}) {
  const state = loadTownState() || {};
  const flags = { ...(state.gamblingHallFlags || {}) };

  flags.highStakesActive = true;

  saveTownState({
    ...state,
    gamblingHallFlags: flags,
  });

  const log = ['[GamblingHall] High Stakes activated for this town stay.'];
  ctx.toast?.('High Stakes are now active at the Gambling Hall!');
  return { log };
}

export default {
  performGamblingHallService,
  performGamblingHallServiceObj,
  performGamblingHallHighStakes,
};
