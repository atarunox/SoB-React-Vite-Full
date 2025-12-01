// src/utils/locationHandlers/streetMarketBackAlleysServices.js
// Simple executor used by TownTab. Mirrors the FO Bank/Training patterns.
const D6 = () => Math.floor(Math.random() * 6) + 1;
const rollND = (n, s = 6) => Array.from({ length: n }, () => Math.floor(Math.random() * s) + 1);

const parseIdxList = (txt = '') =>
  String(txt || '')
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 4)
    .map((n) => n - 1);

const isStraight4 = (dice) => {
  const s = [...new Set(dice)].sort((a, b) => a - b);
  if (s.length !== 4) return false;
  // 1-4, 2-5, 3-6
  return (
    (s[0] === 1 && s[1] === 2 && s[2] === 3 && s[3] === 4) ||
    (s[0] === 2 && s[1] === 3 && s[2] === 4 && s[3] === 5) ||
    (s[0] === 3 && s[1] === 4 && s[2] === 5 && s[3] === 6)
  );
};

const isFourKind = (dice) => {
  const c = {};
  dice.forEach((d) => (c[d] = (c[d] || 0) + 1));
  const face = Object.keys(c).find((k) => c[k] === 4);
  return face ? parseInt(face, 10) : 0;
};

// Exported executor
export async function performStreetMarketService({ service, hero, posseApi = {}, io = {} }) {
  const log = [];
  const actions = [];
  const pay = (amt) => actions.push({ type: 'gold', op: 'spend', heroId: hero?.id || hero?.localId, amount: amt });
  const gainGold = (amt) => actions.push({ type: 'gold', op: 'gain', heroId: hero?.id || hero?.localId, amount: amt });

  switch (service?.rules?.serviceId) {
    case 'bath_house': {
      pay(50);
      actions.push({ type: 'heal', heroId: hero?.id || hero?.localId, hp: 'all', sp: 'all' });
      actions.push({ type: 'xp', heroId: hero?.id || hero?.localId, amount: 10 });
      // Optional parasite removal (player rolls per parasite in your UI; we just flag it)
      log.push('[Bath House] Healed all Wounds/Sanity. +10 XP. You may spend 1 Grit to roll 2D6 for each Parasite; on 10+, it detaches.');
      return { log, actions, ui: null };
    }

    case 'sell_dark_stone': {
      const qty = Number(service?.ui?.responses?.qty ?? 0);
      const price = service?.rules?.pricePerShard ?? 20;
      const n = Math.max(0, Math.floor(qty));
      if (!n) return { log: ['[Sell Dark Stone] No shards sold.'], actions, ui: null };

      let total = 0;
      for (let i = 1; i <= n; i++) {
        const note = `[Shard ${i}] Sold for $${price}.`;
        log.push(note);
        total += price;
      }
      // Remove shards from inventory if you track them:
      actions.push({ type: 'darkstone', op: 'spend', heroId: hero?.id || hero?.localId, amount: n });
      gainGold(total);
      log.push(`[Sell Dark Stone] ${n} shard(s) sold → +$${total}.`);
      return { log, actions, ui: null };
    }

    case 'street_gambling': {
      // initial buy-in
      pay(25);
      let dice = rollND(4, 6);
      log.push(`[Street Gambling] Initial roll: [${dice.join(', ')}]`);

      const doReroll = (idxList, cost) => {
        if (!idxList?.length) return;
        pay(cost);
        idxList.forEach((i) => (dice[i] = D6()));
        log.push(`[Reroll $${cost}] → [${dice.join(', ')}]`);
      };

      // $25 re-roll (any dice)
      doReroll(parseIdxList(service?.ui?.responses?.first_reroll), 25);
      // Up to 3 × $50 re-rolls
      doReroll(parseIdxList(service?.ui?.responses?.reroll_1), 50);
      doReroll(parseIdxList(service?.ui?.responses?.reroll_2), 50);
      doReroll(parseIdxList(service?.ui?.responses?.reroll_3), 50);

      // Evaluate
      let payout = 0;
      if (isStraight4(dice)) {
        payout = service?.rules?.payouts?.straight ?? 300;
        log.push(`[Result] Straight! +$${payout}.`);
      } else {
        const face = isFourKind(dice);
        if (face) {
          const base = service?.rules?.payouts?.four_kind_base ?? 100;
          payout = base * face;
          log.push(`[Result] Four of a Kind (${face}s)! +$${payout}.`);
        } else {
          log.push('[Result] No win. Better luck next time.');
        }
      }
      if (payout) gainGold(payout);
      // mark usage for limit enforcement (your reducer likely handles this flag)
      actions.push({ type: 'serviceUse', heroId: hero?.id || hero?.localId, serviceId: 'sm_street_gambling' });
      return { log, actions, ui: null };
    }

    default:
      return { log: ['[Street Market] Unknown service.'], actions, ui: null };
  }
}

export default performStreetMarketService;
