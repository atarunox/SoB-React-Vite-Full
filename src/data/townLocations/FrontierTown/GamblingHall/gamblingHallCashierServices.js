// src/utils/locationHandlers/gamblingHallCashierServices.js
// Gambling Hall cashier: Cash in Dark Stone @ $50 per shard (flat).
export async function performGamblingHallCashInDarkStone({ hero, posseApi, io }) {
  const heroId = hero?.id || hero?.localId;
  const toNum = (v, d = 0) => (Number.isFinite(+v) ? +v : d);

  const currentDS = toNum(hero?.darkStone, 0);
  if (currentDS <= 0) {
    io?.toast?.('No Dark Stone shards to sell.');
    return {
      log: ['[GamblingHall] No shards to sell.'],
      actions: [],
      ui: {
        title: 'Cash in Dark Stone',
        description: ['Sell Dark Stone shards to the Gambling Hall for $50 each.'],
        outcome: ['No shards to sell.'],
      },
    };
  }

  const raw = (typeof window !== 'undefined' && window.prompt)
    ? window.prompt(`How many Dark Stone shards to sell? (0–${currentDS})`, String(currentDS))
    : String(currentDS);

  const toSell = Math.max(0, Math.min(currentDS, toNum(raw, currentDS)));
  const payout = toSell * 50;

  const actions = [];
  if (posseApi?.updateHero && heroId) {
    actions.push(
      posseApi.updateHero(heroId, (h) => ({
        ...h,
        gold: toNum(h?.gold, 0) + payout,
        darkStone: Math.max(0, toNum(h?.darkStone, 0) - toSell),
      }))
    );
  } else if (heroId) {
    actions.push({
      type: 'HERO_UPDATE',
      heroId,
      patch: { $inc: { gold: payout }, $dec: { darkStone: toSell } },
    });
  }

  io?.toast?.(`Sold ${toSell} shard(s) for $${payout}.`);
  return {
    log: [`[GamblingHall] Sold ${toSell} @ $50 = $${payout}.`],
    actions,
    ui: {
      title: 'Cash in Dark Stone',
      description: ['Sell Dark Stone shards to the Gambling Hall for $50 each.'],
      outcome: [`Shards sold: ${toSell}`, `Payout: $${payout}`],
    },
  };
}

export async function performGamblingHallService(ctx) {
  const { serviceId } = ctx || {};
  if (serviceId === 'cash_in_dark_stone') {
    return performGamblingHallCashInDarkStone(ctx);
  }
  return {
    log: ['[GamblingHall] Service not implemented.'],
    actions: [],
    ui: { title: 'Gambling Hall', description: [], outcome: ['Not implemented.'] },
  };
}
