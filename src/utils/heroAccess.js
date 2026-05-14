// src/utils/heroAccess.js
//
//  UNIVERSAL HERO DATA ACCESS LAYER
//  --------------------------------
//  All Town services, DM actions, Gambling Hall games, Rituals, Outlaw
//  Actions, Training, Surgeries, Bank services, etc. use this.
//  Works with: PosseContext, Firestore-linked data, or raw hero objects.
//

import { calculateCurrentStats } from './calculateStats';
import { normalizeConditionsObject } from './mergeConditions';

////////////////////////////////////////////////////////////////////////////////
// Internal helper
////////////////////////////////////////////////////////////////////////////////

const safeNum = (n, d = 0) =>
  Number.isFinite(Number(n)) ? Number(n) : d;

////////////////////////////////////////////////////////////////////////////////
// Hero Retrieval
////////////////////////////////////////////////////////////////////////////////

export function getHeroById(id, ctx = {}) {
  if (!id) return null;

  // Prefer PosseContext method
  if (ctx.getHeroById) {
    try {
      const h = ctx.getHeroById(id);
      if (h) return h;
    } catch {}
  }

  // Generic list
  if (Array.isArray(ctx.posse)) {
    return ctx.posse.find((h) => h.id === id || h.localId === id) || null;
  }

  return null;
}

export function getActiveHero(ctx = {}) {
  if (ctx.getActiveHeroId) {
    const id = ctx.getActiveHeroId();
    return getHeroById(id, ctx);
  }
  return null;
}

////////////////////////////////////////////////////////////////////////////////
// Derived Stats (with fallback)
////////////////////////////////////////////////////////////////////////////////

export function getDerivedStats(hero, ctx = {}) {
  if (!hero) return {};

  // Prefer PosseContext-provided totals
  if (ctx.getTotalsForHero) {
    try {
      const t = ctx.getTotalsForHero(hero.id || hero.localId);
      if (t) return t;
    } catch {}
  }

  // Fallback to calculateCurrentStats
  try {
    return calculateCurrentStats(hero) || {};
  } catch {
    return hero.stats || {};
  }
}

////////////////////////////////////////////////////////////////////////////////
// Money / Currency
////////////////////////////////////////////////////////////////////////////////

export function addGold(heroId, amount, ctx = {}) {
  if (!heroId || !ctx.updateHero) return;

  ctx.updateHero(heroId, (h) => ({
    ...h,
    gold: safeNum(h.gold, 0) + safeNum(amount, 0),
  }));
}

export function payGold(heroId, amount, ctx = {}) {
  addGold(heroId, -Math.abs(amount), ctx);
}

export function addDarkStone(heroId, amount, ctx = {}) {
  if (!heroId || !ctx.updateHero) return;

  ctx.updateHero(heroId, (h) => ({
    ...h,
    darkStone: safeNum(h.darkStone, 0) + safeNum(amount, 0),
  }));
}

export function spendDarkStone(heroId, amount, ctx = {}) {
  addDarkStone(heroId, -Math.abs(amount), ctx);
}

////////////////////////////////////////////////////////////////////////////////
// Core Stat Updates (HP, SP, XP, Grit, Corruption)
////////////////////////////////////////////////////////////////////////////////

export function addXP(heroId, amount, ctx = {}) {
  if (!heroId || !ctx.updateHero) return;
  ctx.updateHero(heroId, (h) => ({
    ...h,
    xp: safeNum(h.xp, 0) + safeNum(amount, 0),
  }));
}

export function adjustGrit(heroId, delta, ctx = {}) {
  if (!heroId || !ctx.updateHero) return;
  ctx.updateHero(heroId, (h) => ({
    ...h,
    currentGrit: safeNum(h.currentGrit ?? h.grit, 0) + safeNum(delta, 0),
  }));
}

export function applyWounds(heroId, amount, ctx = {}) {
  if (!heroId || !ctx.updateHero) return;
  ctx.updateHero(heroId, (h) => ({
    ...h,
    currentHealth: Math.max(0, safeNum(h.currentHealth ?? h.maxHealth, 10) - Math.abs(amount)),
  }));
}

export function healWounds(heroId, amount, ctx = {}) {
  if (!heroId || !ctx.updateHero) return;
  ctx.updateHero(heroId, (h) => {
    const max = safeNum(h.maxHealth, 10);
    const cur = safeNum(h.currentHealth, max);
    return { ...h, currentHealth: Math.min(max, cur + Math.abs(amount)) };
  });
}

export function adjustCorruption(heroId, delta, ctx = {}) {
  if (!heroId || !ctx.updateHero) return;
  ctx.updateHero(heroId, (h) => ({
    ...h,
    currentCorruption: Math.max(0, safeNum(h.currentCorruption ?? h.corruption, 0) + safeNum(delta)),
  }));
}

////////////////////////////////////////////////////////////////////////////////
// Lodging (Hotel / Camp)
////////////////////////////////////////////////////////////////////////////////

export function setLodging(heroId, lodging, ctx = {}) {
  if (!heroId || !ctx.updateHero) return;

  ctx.updateHero(heroId, (h) => ({
    ...h,
    lodging, // "Hotel" | "Camp" | null
  }));
}

////////////////////////////////////////////////////////////////////////////////
// Inventory
////////////////////////////////////////////////////////////////////////////////

export function addToInventory(heroId, item, ctx = {}) {
  if (!heroId || !ctx.updateHero) return;

  ctx.updateHero(heroId, (h) => ({
    ...h,
    inventory: [...(h.inventory || []), item],
  }));
}

export function removeFromInventory(heroId, itemId, ctx = {}) {
  if (!heroId || !ctx.updateHero) return;

  ctx.updateHero(heroId, (h) => ({
    ...h,
    inventory: (h.inventory || []).filter((i) => i.id !== itemId),
  }));
}

////////////////////////////////////////////////////////////////////////////////
// Conditions
////////////////////////////////////////////////////////////////////////////////

export function addCondition(heroId, condition, ctx = {}) {
  if (!heroId || !ctx.updateHero) return;

  ctx.updateHero(heroId, (h) => {
    const nc = normalizeConditionsObject(h.conditions);
    const bucket = condition.type || "other";
    nc[bucket] = [...nc[bucket], condition];

    return { ...h, conditions: nc };
  });
}

export function removeCondition(heroId, conditionId, ctx = {}) {
  if (!heroId || !ctx.updateHero) return;

  ctx.updateHero(heroId, (h) => {
    const nc = normalizeConditionsObject(h.conditions);

    for (const k of Object.keys(nc)) {
      nc[k] = nc[k].filter((c) => c.id !== conditionId);
    }

    return { ...h, conditions: nc };
  });
}

////////////////////////////////////////////////////////////////////////////////
// Export API Builder
////////////////////////////////////////////////////////////////////////////////

export function makeHeroApi(ctx = {}) {
  return {
    getHeroById: (id) => getHeroById(id, ctx),
    getActiveHero: () => getActiveHero(ctx),
    getDerivedStats: (h) => getDerivedStats(h, ctx),

    addGold: (id, n) => addGold(id, n, ctx),
    payGold: (id, n) => payGold(id, n, ctx),
    addDarkStone: (id, n) => addDarkStone(id, n, ctx),
    spendDarkStone: (id, n) => spendDarkStone(id, n, ctx),
    addXP: (id, n) => addXP(id, n, ctx),
    adjustGrit: (id, n) => adjustGrit(id, n, ctx),

    applyWounds: (id, n) => applyWounds(id, n, ctx),
    healWounds: (id, n) => healWounds(id, n, ctx),
    adjustCorruption: (id, n) => adjustCorruption(id, n, ctx),

    setLodging: (id, l) => setLodging(id, l, ctx),

    addToInventory: (id, item) => addToInventory(id, item, ctx),
    removeFromInventory: (id, itemId) =>
      removeFromInventory(id, itemId, ctx),

    addCondition: (id, c) => addCondition(id, c, ctx),
    removeCondition: (id, cId) => removeCondition(id, cId, ctx),
  };
}

export default {
  getHeroById,
  getActiveHero,
  getDerivedStats,
  addGold,
  payGold,
  addDarkStone,
  spendDarkStone,
  addXP,
  adjustGrit,
  applyWounds,
  healWounds,
  adjustCorruption,
  setLodging,
  addToInventory,
  removeFromInventory,
  addCondition,
  removeCondition,
  makeHeroApi,
};
