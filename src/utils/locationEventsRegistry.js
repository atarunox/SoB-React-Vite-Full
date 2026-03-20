// src/utils/locationEventsRegistry.js

// Individual location handlers
import { handleCampSiteVisit }            from './locationHandlers/campSiteHandler';
import { handleFrontierOutpostEvent }     from './locationHandlers/frontierOutpostHandler';
import { handleGamblingHallEvent }        from './locationHandlers/gamblingHallHandler';
import { handleGeneralStoreEvent }        from './locationHandlers/generalStoreHandler';
import { handleIndianTradingPostEvent }   from './locationHandlers/indianTradingPostHandler';
import { handleMutantQuarterEvent }       from './locationHandlers/mutantQuarterHandler';
import { handleSheriffsOfficeEvent }      from './locationHandlers/sheriffsOfficeHandler';
import { handleDocsOfficeEvent }          from './locationHandlers/docsOfficeHandler';
import { handleChurchEvent }              from './locationHandlers/churchHandler';

// NEW
import { handleBlacksmithEvent }          from './locationHandlers/blacksmithHandler';
import { handleSaloonEvent }              from './locationHandlers/saloonHandler';
import { handleSmugglersDenEvent }        from './locationHandlers/smugglersDenHandler';
import { handleStreetMarketEvent }        from './locationHandlers/streetMarketHandler';
import { handleScavengerDocEvent }       from './locationHandlers/scavengerDocHandler';
import { handleMiningOperationEvent }    from './locationHandlers/miningOperationHandler';

// Context + display helpers
import { makeLocEventCtx } from './locationEventContext';
import { getEventDisplay } from './locationEventText';

/**
 * Prepare a handler context.
 * We keep this small since `makeLocEventCtx` already builds defensive shims.
 */
function prepareCtx(rawCtx = {}) {
  const posseApi = rawCtx.posseApi || {};
  const uiApi = rawCtx.uiApi || {};
  return makeLocEventCtx({ posseApi, uiApi });
}

/**
 * Run a single handler in a safe, consistent way.
 * - Always returns { actions: [], townState?, ui: {title,lore,effect,range?,index?,raw?}, log: [] }
 * - If the handler returns title/lore/effect, we keep them; otherwise we fill from data.
 * - `forcedRoll` will be read from ctx (if present) to keep UI/logic in sync.
 */
async function runHandlerInternal(locKey, fn, roll, ctx) {
  const context = prepareCtx(ctx);

  // Let the handler know the roll we’re using (UI may have set/forced it)
  const forcedRoll = Number.isFinite(ctx?.forcedRoll) ? ctx.forcedRoll : roll;

  let result = null;
  let error = null;
  try {
    result = await fn({ ...context, forcedRoll, roll: forcedRoll });
  } catch (e) {
    error = e;
  }

  // Pull text from handler if provided, else from data tables
  const fromHandler = result && typeof result === 'object'
    ? { title: result.title, lore: result.lore, effect: result.effect }
    : null;

  const fromData = getEventDisplay(locKey, forcedRoll) || { title: 'Location Event', lore: '', effect: '' };

  const ui = {
    title: fromHandler?.title ?? fromData.title ?? 'Location Event',
    lore: fromHandler?.lore ?? fromData.lore ?? '',
    effect: fromHandler?.effect ?? fromData.effect ?? '',
  };

  // Normalize the final envelope
  const payload = {
    actions: Array.isArray(result?.actions) ? result.actions : [],
    townState: result?.townState, // handler may return a next state (optional)
    ui,
    log: [],
  };

  if (error) {
    payload.log.push(`[${locKey}] handler error: ${error?.message || error}`);
  } else if (Array.isArray(result?.log)) {
    payload.log.push(...result.log);
  }

  return payload;
}

/**
 * Public helper the registry entries will call.
 * This signature matches your existing use in other files.
 */
export function runHandler(locKey, fn, roll, ctx) {
  return runHandlerInternal(locKey, fn, roll, ctx);
}

// ---------------------------------------------------------------------------
// Exported map used by engines/UI to resolve a shopId → handler
// ---------------------------------------------------------------------------

export const locationEventHandlers = {
  campSite:         { apply: (roll, ctx) => runHandler('campSite', handleCampSiteVisit, roll, ctx) },
  frontierOutpost:  { apply: (roll, ctx) => runHandler('frontierOutpost', handleFrontierOutpostEvent, roll, ctx) },
  gambling:         { apply: (roll, ctx) => runHandler('gambling', handleGamblingHallEvent, roll, ctx) },
  generalStore:     { apply: (roll, ctx) => runHandler('generalStore', handleGeneralStoreEvent, roll, ctx) },
  indianTradingPost:{ apply: (roll, ctx) => runHandler('indianTradingPost', handleIndianTradingPostEvent, roll, ctx) },
  mutantQuarter:    { apply: (roll, ctx) => runHandler('mutantQuarter', handleMutantQuarterEvent, roll, ctx) },
  sheriffsOffice:   { apply: (roll, ctx) => runHandler('sheriffsOffice', handleSheriffsOfficeEvent, roll, ctx) },
  docsOffice:       { apply: (roll, ctx) => runHandler('docsOffice', handleDocsOfficeEvent, roll, ctx) },
  church:           { apply: (roll, ctx) => runHandler('church', handleChurchEvent, roll, ctx) },

  // NEW
  blacksmith:       { apply: (roll, ctx) => runHandler('blacksmith', handleBlacksmithEvent, roll, ctx) },
  saloon:           { apply: (roll, ctx) => runHandler('saloon', handleSaloonEvent, roll, ctx) },
  smugglersDen:     { apply: (roll, ctx) => runHandler('smugglersDen', handleSmugglersDenEvent, roll, ctx) },
  streetMarket:     { apply: (roll, ctx) => runHandler('streetMarket', handleStreetMarketEvent, roll, ctx) },
  scavengerDoc:     { apply: (roll, ctx) => runHandler('scavengerDoc', handleScavengerDocEvent, roll, ctx) },
  miningOperation:  { apply: (roll, ctx) => runHandler('miningOperation', handleMiningOperationEvent, roll, ctx) },

  // Aliases
  gamblingHall:     { apply: (roll, ctx) => runHandler('gambling', handleGamblingHallEvent, roll, ctx) },
  sheriff:          { apply: (roll, ctx) => runHandler('sheriffsOffice', handleSheriffsOfficeEvent, roll, ctx) },
  sheriffs:         { apply: (roll, ctx) => runHandler('sheriffsOffice', handleSheriffsOfficeEvent, roll, ctx) },
  docs:             { apply: (roll, ctx) => runHandler('docsOffice', handleDocsOfficeEvent, roll, ctx) },
  doc:              { apply: (roll, ctx) => runHandler('docsOffice', handleDocsOfficeEvent, roll, ctx) },
  outpost:          { apply: (roll, ctx) => runHandler('frontierOutpost', handleFrontierOutpostEvent, roll, ctx) },
  tradingPost:      { apply: (roll, ctx) => runHandler('indianTradingPost', handleIndianTradingPostEvent, roll, ctx) },

  // Convenience aliases
  smith:            { apply: (roll, ctx) => runHandler('blacksmith', handleBlacksmithEvent, roll, ctx) },
  market:           { apply: (roll, ctx) => runHandler('streetMarket', handleStreetMarketEvent, roll, ctx) },
  smugglers:        { apply: (roll, ctx) => runHandler('smugglersDen', handleSmugglersDenEvent, roll, ctx) },
  mining:           { apply: (roll, ctx) => runHandler('miningOperation', handleMiningOperationEvent, roll, ctx) },
};
