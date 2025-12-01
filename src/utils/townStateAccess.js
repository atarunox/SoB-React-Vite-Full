// src/utils/townStateAccess.js
//
// TOWN STATE ENGINE — Frontier Town / Blasted Wastes / FoFo / Adventures
// ----------------------------------------------------------------------
// This engine controls the lifecycle of a Town Stay:
//   • Day advancement
//   • Shop access limits
//   • Event roll flags
//   • Lodging (Hotel / Camp)
//   • Daily Events
//   • Camp Events
//   • Shared shop event results (stored in Firestore or local)
//   • Unwanted Attention management
//

import { rollD6 } from './diceHelpers';

///////////////////////////////////////////////////////////////////////////////
//  SAFETY HELPERS
///////////////////////////////////////////////////////////////////////////////

const safeObj = (v) => (v && typeof v === 'object' ? v : {});
const now = () => Date.now();

///////////////////////////////////////////////////////////////////////////////
//  INITIAL STATE (if missing)
///////////////////////////////////////////////////////////////////////////////

export function makeInitialTownState() {
  return {
    day: 1,
    visited: {},             // shopId → [heroIds]
    shopEvents: {},          // shopId → eventResult (shared)
    lodging: {},             // heroId → 'hotel' | 'camp'
    purchases: {},           // heroId → { itemId → count }
    soldOut: {},             // itemId → true
    unwantedAttention: {},   // heroId → number
    rareFind: false,
    highStakesActive: false, // Gambling Hall event 12
    timestamp: now(),
  };
}

///////////////////////////////////////////////////////////////////////////////
//  LOAD / SAVE WRAPPERS
///////////////////////////////////////////////////////////////////////////////

export function loadTownState(ctx) {
  return safeObj(ctx?.townState) || makeInitialTownState();
}

export function saveTownState(ctx, next) {
  ctx?.updateTownState?.(next);
}

///////////////////////////////////////////////////////////////////////////////
//  DAY PROGRESSION
///////////////////////////////////////////////////////////////////////////////

export function endOfDay(ctx) {
  const state = loadTownState(ctx);

  const next = {
    ...state,
    day: state.day + 1,
    visited: {},   // reset visits
  };

  saveTownState(ctx, next);

  return next;
}

///////////////////////////////////////////////////////////////////////////////
//  LODGING SYSTEM
///////////////////////////////////////////////////////////////////////////////

export function setLodging(heroId, lodging, ctx) {
  const state = loadTownState(ctx);

  const next = {
    ...state,
    lodging: {
      ...(state.lodging || {}),
      [heroId]: lodging,
    },
  };

  saveTownState(ctx, next);
}

export function getLodging(heroId, ctx) {
  return loadTownState(ctx).lodging?.[heroId] ?? null;
}

///////////////////////////////////////////////////////////////////////////////
//  CAMP EVENTS
///////////////////////////////////////////////////////////////////////////////

export function rollCampEvent(heroId, ctx) {
  const r = rollD6();

  const log = [];

  switch (r) {
    case 1:
      log.push('Camp Event: Rustlers steal D3×$50! Lose money.');
      break;

    case 2:
      log.push('Camp Event: Ambushed in the night! Take a Hit (Defense allowed).');
      break;

    case 3:
      log.push('Camp Event: Lose 1 Grit.');
      break;

    case 4:
      log.push('Camp Event: Find a small stash → gain $25.');
      break;

    case 5:
      log.push('Camp Event: You sleep soundly. Recover 1 Health and 1 Sanity.');
      break;

    case 6:
      log.push('Camp Event: A traveling merchant gives you +1 Whiskey.');
      break;
  }

  return { roll: r, log };
}

///////////////////////////////////////////////////////////////////////////////
//  SHOP EVENT ROLLS (only once per stay)
///////////////////////////////////////////////////////////////////////////////

export function hasShopRolledEvent(shopId, ctx) {
  return loadTownState(ctx).shopEvents?.[shopId] != null;
}

export function storeShopEventResult(shopId, result, ctx) {
  const state = loadTownState(ctx);

  const next = {
    ...state,
    shopEvents: {
      ...(state.shopEvents || {}),
      [shopId]: result,
    },
  };

  saveTownState(ctx, next);
}

export function getShopEventResult(shopId, ctx) {
  return loadTownState(ctx).shopEvents?.[shopId] ?? null;
}

///////////////////////////////////////////////////////////////////////////////
//  VISIT LIMITS
///////////////////////////////////////////////////////////////////////////////

export function markVisited(shopId, heroId, ctx) {
  const state = loadTownState(ctx);

  const prev = new Set(state.visited?.[shopId] || []);

  prev.add(heroId);

  const next = {
    ...state,
    visited: {
      ...(state.visited || {}),
      [shopId]: [...prev],
    },
  };

  saveTownState(ctx, next);
}

export function hasVisited(shopId, heroId, ctx) {
  return Boolean(loadTownState(ctx).visited?.[shopId]?.includes(heroId));
}

///////////////////////////////////////////////////////////////////////////////
//  RARE FIND (shop discount state)
///////////////////////////////////////////////////////////////////////////////

export function setRareFind(value, ctx) {
  const state = loadTownState(ctx);

  saveTownState(ctx, { ...state, rareFind: Boolean(value) });
}

export function isRareFind(ctx) {
  return Boolean(loadTownState(ctx).rareFind);
}

///////////////////////////////////////////////////////////////////////////////
//  UNWANTED ATTENTION
///////////////////////////////////////////////////////////////////////////////

export function addUnwantedAttention(heroId, n, ctx) {
  const state = loadTownState(ctx);

  const current = state.unwantedAttention?.[heroId] ?? 0;

  const next = {
    ...state,
    unwantedAttention: {
      ...(state.unwantedAttention || {}),
      [heroId]: current + n,
    },
  };

  saveTownState(ctx, next);
}

export function clearUnwantedAttention(ctx) {
  const state = loadTownState(ctx);

  saveTownState(ctx, { ...state, unwantedAttention: {} });
}

export function getUnwantedAttention(heroId, ctx) {
  return safeObj(loadTownState(ctx).unwantedAttention)[heroId] ?? 0;
}

///////////////////////////////////////////////////////////////////////////////
//  UNWANTED ATTENTION TRIGGERS
///////////////////////////////////////////////////////////////////////////////
//
// Triggered on:
//   • Location Event roll == 7
//   • Gambling winnings >= $500
//

export function checkUnwantedAttentionTriggers(heroId, ctx, triggerSource) {
  const ua = getUnwantedAttention(heroId, ctx);

  if (ua <= 0) return null;

  const r = rollD6();
  const success = r >= 5;

  return {
    triggered: true,
    success,
    roll: r,
    triggerSource,
    log: success
      ? `UA Trigger (${triggerSource}): Luck test passed — no attack.`
      : `UA Trigger (${triggerSource}): Luck fail — ambushed! Take Hits.`,
  };
}

///////////////////////////////////////////////////////////////////////////////
//  RESET TOWN STAY (on leaving town)
///////////////////////////////////////////////////////////////////////////////

export function resetTownState(ctx) {
  saveTownState(ctx, makeInitialTownState());
}

///////////////////////////////////////////////////////////////////////////////
//  EXPORT API
///////////////////////////////////////////////////////////////////////////////

export const townStateAccess = {
  loadTownState,
  saveTownState,
  endOfDay,
  setLodging,
  getLodging,
  hasVisited,
  markVisited,
  rollCampEvent,
  hasShopRolledEvent,
  storeShopEventResult,
  getShopEventResult,
  setRareFind,
  isRareFind,
  addUnwantedAttention,
  getUnwantedAttention,
  clearUnwantedAttention,
  checkUnwantedAttentionTriggers,
  resetTownState,
};

export default townStateAccess;
