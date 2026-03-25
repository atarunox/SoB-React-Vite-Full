// src/utils/TownEngine.js
//
// MASTER TOWN ENGINE
// ---------------------------------------------------------------------------
// Provides high-level control for the entire Town Phase.
//
// Public API example:
//
//   const town = useTownEngine(ctx);
//   town.visitShop(heroId, 'blacksmith');
//   town.performPurchase(heroId, item);
//   town.performService(heroId, service);
//   town.advanceDay();
//   town.drawDailyEvent();
//   town.rollCampEvents();
//   town.getTabsForShop('blacksmith');
//
// Every TownTab screen will use ONLY this module.
//

import tabsByShopRaw, { makeTabsByShop } from '../data/townLocations/tabsByShop.js';
import townStateAccess from './townStateAccess.js';
import { rollD6 } from './diceHelpers';

// Dark Stone / Conditions / Keywords imports may be added as required

// =======================
// EVENT CHART IMPORTS
// =======================
import { rollLocationEvent } from './locationHandlers/locationEventHandler';     // unified location events
import { dailyEventDeck } from '../data/townLocations/townDailyEvents.js';         // daily event card deck

// =======================
// SERVICE EXECUTORS
// =======================
import { performOutpostBankService } from './locationHandlers/frontierOutpostBankServices';
import { performOutpostTraining } from './locationHandlers/frontierOutpostTrainingServices';
import { performGamblingService } from './locationHandlers/gamblingHallServiceExecutors';
import { performSmugglersService } from './locationHandlers/smugglersDenServices';

// Add Saloon services, Doc services, Church rituals etc as you add handlers


///////////////////////////////////////////////////////////////////////////////
// TABS ACCESSOR
///////////////////////////////////////////////////////////////////////////////

function getTabsForShop(shopId, ctx) {
  const tabsByShop = makeTabsByShop(ctx);
  return tabsByShop[shopId] || [];
}

///////////////////////////////////////////////////////////////////////////////
// PURCHASE LOGIC
///////////////////////////////////////////////////////////////////////////////

function performPurchase(heroId, item, ctx) {
  const { loadTownState, saveTownState } = townStateAccess;
  const state = loadTownState(ctx);

  const cost = item?.cost?.gold || 0;
  const canAfford = ctx.getHero?.(heroId)?.gold >= cost;

  if (!canAfford) {
    return {
      ok: false,
      log: [`Cannot afford ${item?.name}: cost $${cost}.`],
    };
  }

  // Deduct gold & add item to inventory
  ctx.updateHero?.(heroId, (h) => ({
    ...h,
    gold: h.gold - cost,
    inventory: [...(h.inventory || []), item],
  }));

  // Mark as purchased in townState
  const next = {
    ...state,
    purchases: {
      ...(state.purchases || {}),
      [heroId]: {
        ...(state.purchases?.[heroId] || {}),
        [item.id]: (state.purchases?.[heroId]?.[item.id] || 0) + 1,
      },
    },
  };

  saveTownState(ctx, next);

  return {
    ok: true,
    log: [`Purchased ${item.name} for $${cost}.`],
  };
}

///////////////////////////////////////////////////////////////////////////////
// SERVICE EXECUTION
///////////////////////////////////////////////////////////////////////////////

function performService(heroId, service, shopId, ctx) {
  const id = service?.id;
  if (!id) return { ok: false, log: ['Missing service id.'] };

  // === Gambling Hall ===
  if (shopId === 'gamblingHall') {
    return performGamblingService(heroId, service, ctx);
  }

  // === Frontier Outpost Bank ===
  if (shopId === 'frontierOutpost' && id.startsWith('fo_bank_')) {
    return performOutpostBankService(heroId, service, ctx);
  }

  // === Frontier Outpost Training ===
  if (shopId === 'frontierOutpost' && id.startsWith('fo_training_')) {
    return performOutpostTraining(heroId, service, ctx);
  }

  // === Smuggler's Den ===
  if (shopId === 'smugglersDen') {
    return performSmugglersService(heroId, service, ctx);
  }

  // Default fallback for services that only provide text/log output
  return {
    ok: true,
    log: service.effects || ['Service completed.'],
  };
}

///////////////////////////////////////////////////////////////////////////////
// LOCATION VISIT
///////////////////////////////////////////////////////////////////////////////

function visitShop(heroId, shopId, ctx) {
  const {
    hasVisited,
    markVisited,
    hasShopRolledEvent,
    storeShopEventResult,
    checkUnwantedAttentionTriggers,
  } = townStateAccess;

  const logs = [];

  // Check if hero visited already today
  if (hasVisited(shopId, heroId, ctx)) {
    return { ok: false, log: [`Already visited ${shopId} today.`] };
  }

  // Mark visit
  markVisited(shopId, heroId, ctx);
  logs.push(`Visited ${shopId}.`);

  // If shop needs event roll (once per stay)
  if (!hasShopRolledEvent(shopId, ctx)) {
    const eventResult = rollLocationEvent(shopId, ctx);
    storeShopEventResult(shopId, eventResult, ctx);

    logs.push(`Location Event: ${eventResult.name}`);
    if (eventResult.log) logs.push(...eventResult.log);

    // UA Trigger?
    if (eventResult.roll === 7) {
      const uaCheck = checkUnwantedAttentionTriggers(heroId, ctx, `LocationEvent(${shopId})`);
      if (uaCheck?.triggered) logs.push(uaCheck.log);
    }
  }

  return { ok: true, log: logs };
}

///////////////////////////////////////////////////////////////////////////////
// DAILY EVENT CARD
///////////////////////////////////////////////////////////////////////////////

function drawDailyEvent(ctx) {
  const index = Math.floor(Math.random() * dailyEventDeck.length);
  return dailyEventDeck[index];
}

///////////////////////////////////////////////////////////////////////////////
// CAMP EVENTS FOR ALL CAMPERS
///////////////////////////////////////////////////////////////////////////////

function rollCampEvents(ctx) {
  const { loadTownState, rollCampEvent } = townStateAccess;

  const state = loadTownState(ctx);
  const logs = [];

  for (const heroId of Object.keys(state.lodging || {})) {
    if (state.lodging[heroId] === 'camp') {
      const result = rollCampEvent(heroId, ctx);
      logs.push(`Camp Event for ${heroId}: Roll ${result.roll}`);
      logs.push(...result.log);
    }
  }

  return logs;
}

///////////////////////////////////////////////////////////////////////////////
// DAY ADVANCEMENT
///////////////////////////////////////////////////////////////////////////////

function advanceDay(ctx) {
  return townStateAccess.endOfDay(ctx);
}

///////////////////////////////////////////////////////////////////////////////
// TOWN ENGINE FACTORY
///////////////////////////////////////////////////////////////////////////////

export function useTownEngine(ctx) {
  return {
    getTabsForShop: (shopId) => getTabsForShop(shopId, ctx),

    visitShop: (heroId, shopId) => visitShop(heroId, shopId, ctx),

    performPurchase: (heroId, item) => performPurchase(heroId, item, ctx),

    performService: (heroId, service, shopId) =>
      performService(heroId, service, shopId, ctx),

    advanceDay: () => advanceDay(ctx),

    drawDailyEvent: () => drawDailyEvent(ctx),

    rollCampEvents: () => rollCampEvents(ctx),

    state: () => townStateAccess.loadTownState(ctx),

    reset: () => townStateAccess.resetTownState(ctx),
  };
}

export default useTownEngine;
