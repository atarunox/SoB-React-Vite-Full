// src/utils/locationHandlers/locationEventHandler.js
//
// Unified engine for ALL Town Location Event rolls.
// This module guarantees consistent output for:
//    - Frontier Town shops
//    - Blasted Wastes towns
//    - Forbidden Fortress towns (future)
//    - Adventures towns (future)
//
// Outputs:
// {
//   shopId,
//   roll,
//   name,
//   effect,
//   type: "Location Event",
//   log: ["..."],
// }
//
// This is the ONLY event-roller TownEngine ever calls.
//

import { rollD6 } from '../../utils/diceHelpers';
import townStateAccess from '../townStateAccess';

// ===========================
// IMPORT EVENT CHARTS
// ===========================

// Frontier Town charts (your existing data)
import blacksmithEvents from '../../data/townLocations/FrontierTown/Blacksmith/blacksmithEvents.js';
import churchEvents from '../../data/townLocations/FrontierTown/Church/churchEvents.js';
import docsOfficeEvents from '../../data/townLocations/FrontierTown/DocsOffice/docsOfficeEvents.js';
import saloonEvents from '../../data/townLocations/FrontierTown/Saloon/saloonEvents.js';
import generalStoreEvents from '../../data/townLocations/FrontierTown/GeneralStore/generalStoreEvents.js';
import streetMarketEvents from '../../data/townLocations/FrontierTown/StreetMarket/streetMarketEvents.js';
import sheriffsOfficeEvents from '../../data/townLocations/FrontierTown/SheriffsOffice/sheriffsOfficeEvents.js';
import gamblingHallEvents from '../../data/townLocations/FrontierTown/GamblingHall/gamblingHallEvents.js';
import frontierOutpostEvents from '../../data/townLocations/FrontierTown/FrontierOutpost/frontierOutpostEvents.js';
import smugglersDenEvents from '../../data/townLocations/FrontierTown/SmugglersDen/smugglersDenEvents.js';
import mutantQuarterEvents from '../../data/townLocations/FrontierTown/MutantQuarter/mutantQuarterEvents.js';

// Add other campaigns as you build them:
const blastedWastesTownEvents = {};
const forbiddenFortressTownEvents = {};
const adventuresTownEvents = {};


// ===========================
// CHART LOOKUP TABLE
// ===========================

const EVENT_TABLES = {
  // Frontier Town
  blacksmith: blacksmithEvents,
  church: churchEvents,
  docsOffice: docsOfficeEvents,
  saloon: saloonEvents,
  generalStore: generalStoreEvents,
  streetMarket: streetMarketEvents,
  sheriffsOffice: sheriffsOfficeEvents,
  gamblingHall: gamblingHallEvents,
  frontierOutpost: frontierOutpostEvents,
  smugglersDen: smugglersDenEvents,
  mutantQuarter: mutantQuarterEvents,

  // Future campaigns
  blastedWastes: blastedWastesTownEvents,
  forbiddenFortress: forbiddenFortressTownEvents,
  adventures: adventuresTownEvents,
};


// ===========================
// ROLL CHART HELPER
// ===========================

function getChartForShop(shopId) {
  return EVENT_TABLES[shopId] || null;
}

function resolveEventFromChart(chart, roll) {
  if (!chart) return null;

  // Each chart is expected to export something like:
  // {
  //   2: {...}, 3: {...}, ..., 12: {...}
  // }
  return chart[roll] || null;
}


// ===========================
// MAIN ENTRY POINT
// ===========================

export function rollLocationEvent(shopId, ctx) {
  const chart = getChartForShop(shopId);

  // Missing chart?
  if (!chart) {
    return {
      ok: false,
      shopId,
      roll: null,
      name: 'No Event Table',
      type: 'Location Event',
      log: [`No event chart exists for location '${shopId}'.`],
    };
  }

  // Standard 2d6 roll
  const roll = rollD6() + rollD6();

  const baseEvent = resolveEventFromChart(chart, roll);

  if (!baseEvent) {
    return {
      ok: false,
      shopId,
      roll,
      name: 'Undefined Event',
      type: 'Location Event',
      log: [`No event defined for roll ${roll} at ${shopId}.`],
    };
  }

  // Build output
  const out = {
    ok: true,
    shopId,
    roll,
    type: 'Location Event',
    name: baseEvent.name || `Event ${roll}`,
    effect: baseEvent.effect || null,
    log: [],
  };

  // Collect logs (for UI scrolling)
  if (baseEvent.log) out.log.push(...baseEvent.log);
  if (baseEvent.description) out.log.push(baseEvent.description);

  // ---------- Modifier Example: UA Flag ----------
  // The UA check is NOT done here. TownEngine does it on the result:
  // if roll === 7    → trigger UA test later
  // Good separation of concerns.

  return out;
}

export default rollLocationEvent;
