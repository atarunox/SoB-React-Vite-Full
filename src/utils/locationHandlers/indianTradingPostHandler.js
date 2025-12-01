// Indian Trading Post helper utilities (no services in this file).
// Exports: canUseTribalTent, normalizeINDIAN_TP_Item, clampArrowStack, applyArrowConsumption
// Optional: handleIndianTradingPostEvent (reads data file)

import indianTradingPost from '../../data/townLocations/FrontierTown/IndianTradingPost/indianTradingPost.js'; // for event reader only

const asStr = (v) => String(v ?? '').toLowerCase();
const asNum = (v, fb = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : fb);

// ---------- Tribal Tent gating ----------
export function canUseTribalTent(hero) {
  const kws = Array.isArray(hero?.keywords) ? hero.keywords.map(asStr) : [];
  return kws.includes('tribal') || kws.includes('scout');
}

// ---------- Arrow stack utilities ----------
export function clampArrowStack(stack) {
  return Math.max(0, Math.min(12, asNum(stack, 0)));
}

export function applyArrowConsumption(currentStack, consume = 1) {
  const n = clampArrowStack(currentStack);
  return clampArrowStack(n - Math.max(0, Math.min(1, consume)));
}

// ---------- Optional: normalize shop items (bows/stackables) ----------
export function normalizeINDIAN_TP_Item(item) {
  if (!item) return item;

  const slot = asStr(item.slot);
  if (slot === 'bow') {
    return {
      ...item,
      weight: item.weight ?? 1,
      twoHanded: item.twoHanded ?? true,
      upgradeSlots: item.upgradeSlots ?? 2,
      effects: [
        ...(Array.isArray(item.effects) ? item.effects : []),
        '+1 Initiative while equipped',
        'Crit on 5–6',
      ],
    };
  }
  const kws = Array.isArray(item?.keywords) ? item.keywords.map(asStr) : [];
  if (kws.includes('arrow')) {
    return { ...item, stackable: true, maxStack: 12, consumeOnHit: true };
  }
  return item;
}

// ---------- Event passthrough (optional; no side-effects here) ----------
export async function handleIndianTradingPostEvent(roll, _ctx = {}) {
  const n = Math.max(2, Math.min(12, Number.isFinite(roll) ? roll : 2));
  const idx = n - 2;
  const ev = Array.isArray(indianTradingPost?.events) ? indianTradingPost.events[idx] : null;

  if (!ev) {
    return { ok: false, roll: n, log: '[IndianTradingPost] No event data found.' };
  }
  return {
    ok: true,
    roll: n,
    name: ev.name,
    lore: ev.lore,
    effect: ev.effect,
    log: `[IndianTradingPost ${n}] ${ev.name} — ${ev.effect}`,
  };
}
