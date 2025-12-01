// src/utils/shopAccess.js
//
//   SHOP ACCESS LAYER (Town Core)
//   ---------------------------------
//   Every Town location runs through this layer.
//   Responsible for:
//     - price calculation
//     - filters / restrictions
//     - visit tracking
//     - item limits per visit/per stay
//     - sold-out state
//     - safe item purchases
//     - service execution routing
//

import {
  addGold,
  payGold,
  addToInventory,
  addCondition,
  spendDarkStone,
  getDerivedStats,
} from './heroAccess';

import { normalizeConditionsObject } from './mergeConditions';

///////////////////////////////////////////////////////////////////////////////
// Helpers
///////////////////////////////////////////////////////////////////////////////

const safeNum = (n, d = 0) =>
  Number.isFinite(Number(n)) ? Number(n) : d;

const now = () => Date.now();

///////////////////////////////////////////////////////////////////////////////
// Price Modifier Pipeline
///////////////////////////////////////////////////////////////////////////////

export function applyPriceModifiers(item, hero, ctx = {}) {
  let price = { ...(item.cost || { gold: 0 }) };

  // Rare Find discount
  if (ctx.townState?.rareFind) {
    if (price.gold) price.gold = Math.floor(price.gold * 0.75);
  }

  // Indian Trading Post Tribal Tent
  if (
    ctx.currentShopId === 'indianTradingPost' &&
    hero?.keywords?.includes?.('TribalTent')
  ) {
    if (price.gold) price.gold = Math.floor(price.gold * 0.5);
  }

  // Outlaw-only discounts or penalties
  if (item.tags?.includes('OutlawOnly')) {
    // Example: give a small discount to Outlaws
    if (hero?.keywords?.includes('Outlaw')) {
      if (price.gold) price.gold = Math.floor(price.gold * 0.9);
    }
  }

  // You can extend this with more world-specific price mods:
  // - Blasted Wastes scarcity
  // - Forbidden Fortress availability
  // - Adventures campaign conditions

  return price;
}

///////////////////////////////////////////////////////////////////////////////
// Restriction Checks
///////////////////////////////////////////////////////////////////////////////

export function canHeroBuyItem(hero, item, ctx = {}) {
  if (!hero || !item) return false;

  const tags = item.tags || [];

  // Outlaw-only
  if (tags.includes('OutlawOnly') && !hero.keywords?.includes('Outlaw'))
    return false;

  // Holy-only
  if (tags.includes('HolyOnly') && !hero.keywords?.includes('Holy'))
    return false;

  // Showman-only
  if (tags.includes('ShowmanOnly') && !hero.keywords?.includes('Showman'))
    return false;

  // Performer-only
  if (tags.includes('PerformerOnly') && !hero.keywords?.includes('Performer'))
    return false;

  // Faction checks for future campaigns

  return true;
}

///////////////////////////////////////////////////////////////////////////////
// Sold-Out State (per Town Stay)
///////////////////////////////////////////////////////////////////////////////

export function isItemSoldOut(itemId, townState) {
  return Boolean(townState?.soldOut?.[itemId]);
}

export function markItemSoldOut(itemId, ctx) {
  ctx.updateTownState?.((s) => ({
    ...s,
    soldOut: { ...(s.soldOut || {}), [itemId]: true },
  }));
}

///////////////////////////////////////////////////////////////////////////////
// Limiters (1 per visit, 2 per stay, etc.)
///////////////////////////////////////////////////////////////////////////////

export function getItemPurchaseCount(heroId, itemId, townState) {
  return safeNum(townState?.purchases?.[heroId]?.[itemId], 0);
}

function recordPurchase(heroId, itemId, ctx) {
  ctx.updateTownState?.((s) => {
    const base = s.purchases || {};
    const heroPurch = base[heroId] || {};
    return {
      ...s,
      purchases: {
        ...base,
        [heroId]: {
          ...heroPurch,
          [itemId]: safeNum(heroPurch[itemId], 0) + 1,
        },
      },
    };
  });
}

export function respectsPurchaseLimits(heroId, item, townState) {
  if (!item || !item.limit) return true;

  const bought = getItemPurchaseCount(heroId, item.id, townState);

  return bought < item.limit;
}

///////////////////////////////////////////////////////////////////////////////
// Hero Money Check
///////////////////////////////////////////////////////////////////////////////

export function heroCanAfford(hero, price) {
  const goldNeeded = safeNum(price.gold ?? 0, 0);
  const dsNeeded = safeNum(price.darkStone ?? 0, 0);

  const hasGold = safeNum(hero.gold, 0) >= goldNeeded;
  const hasDS = safeNum(hero.darkStone, 0) >= dsNeeded;

  return hasGold && hasDS;
}

///////////////////////////////////////////////////////////////////////////////
// Perform Purchase — FULL ENGINE
///////////////////////////////////////////////////////////////////////////////

export function performPurchase(heroId, item, ctx = {}) {
  const hero = ctx.getHeroById?.(heroId);
  if (!hero) return { ok: false, reason: 'NoHero' };

  // Sold out
  if (isItemSoldOut(item.id, ctx.townState)) {
    return { ok: false, reason: 'SoldOut' };
  }

  // Restrictions
  if (!canHeroBuyItem(hero, item, ctx)) {
    return { ok: false, reason: 'Restricted' };
  }

  // Limiters
  if (!respectsPurchaseLimits(heroId, item, ctx.townState)) {
    return { ok: false, reason: 'LimitReached' };
  }

  // Price mods
  const price = applyPriceModifiers(item, hero, ctx);

  // Afford check
  if (!heroCanAfford(hero, price)) {
    return { ok: false, reason: 'CantAfford' };
  }

  // Pay
  if (price.gold) ctx.payGold?.(heroId, price.gold);
  if (price.darkStone) ctx.spendDarkStone?.(heroId, price.darkStone);

  // Add to inventory
  ctx.addToInventory?.(heroId, item);

  // Track purchases
  recordPurchase(heroId, item.id, ctx);

  // If item is unique → mark sold out
  if (item.unique === true) {
    markItemSoldOut(item.id, ctx);
  }

  return { ok: true, price };
}

///////////////////////////////////////////////////////////////////////////////
// Service Executor Router
///////////////////////////////////////////////////////////////////////////////

export async function performService(heroId, service, ctx = {}) {
  if (!service || typeof service.exec !== 'function') {
    return { ok: false, log: ['Invalid service'] };
  }

  const hero = ctx.getHeroById?.(heroId);
  if (!hero) return { ok: false, log: ['Hero not found'] };

  try {
    const result = await service.exec(hero, ctx, ctx.uiApi);
    return { ok: true, ...result };
  } catch (e) {
    console.error('Service exec failed:', e);
    return { ok: false, log: ['Service failed'] };
  }
}

///////////////////////////////////////////////////////////////////////////////
// Visit Tracking
///////////////////////////////////////////////////////////////////////////////

export function markVisited(shopId, heroId, ctx) {
  ctx.updateTownState?.((s) => {
    const visited = s.visited || {};
    const shopSet = new Set(visited[shopId] || []);
    shopSet.add(heroId);

    return {
      ...s,
      visited: {
        ...visited,
        [shopId]: Array.from(shopSet),
      },
    };
  });
}

export function hasVisited(shopId, heroId, townState) {
  return Boolean(townState?.visited?.[shopId]?.includes(heroId));
}

///////////////////////////////////////////////////////////////////////////////
// Shop Access API
///////////////////////////////////////////////////////////////////////////////

export function makeShopApi(ctx = {}) {
  return {
    // Availability
    canHeroBuyItem: (h, item) => canHeroBuyItem(h, item, ctx),
    heroCanAfford: (h, p) => heroCanAfford(h, p),
    applyPriceModifiers: (item, h) => applyPriceModifiers(item, h, ctx),
    isItemSoldOut: (id) => isItemSoldOut(id, ctx.townState),

    // Purchases
    performPurchase: (heroId, item) => performPurchase(heroId, item, {
      ...ctx,
      payGold: (id, n) => ctx.payGold?.(id, n),
      addToInventory: (id, it) => ctx.addToInventory?.(id, it),
      spendDarkStone: (id, n) => ctx.spendDarkStone?.(id, n),
    }),

    // Services
    performService: (heroId, service) =>
      performService(heroId, service, ctx),

    // Visit tracking
    markVisited: (shopId, heroId) => markVisited(shopId, heroId, ctx),
    hasVisited: (shopId, heroId) =>
      hasVisited(shopId, heroId, ctx.townState),
  };
}

export default {
  makeShopApi,
  applyPriceModifiers,
  performPurchase,
  performService,
  canHeroBuyItem,
  heroCanAfford,
  isItemSoldOut,
  markItemSoldOut,
  getItemPurchaseCount,
  respectsPurchaseLimits,
  markVisited,
  hasVisited,
};
