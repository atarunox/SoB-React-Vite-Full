// src/utils/locationEventsEngine.js

// --- Data imports (events come from these) ---
import campSite from '../data/townLocations/campSite.js';
import frontierOutpost from '../data/townLocations/frontierOutpost.js';
import gamblingHall from '../data/townLocations/gamblingHall.js';
import generalStore from '../data/townLocations/generalStore.js';
// 🔁 SWITCH: use the SHOP container that includes { events } as objects
import indianTradingPost from '../data/townLocations/indianTradingPost.js';
import mutantQuarter from '../data/townLocations/mutantQuarter.js';
import sheriffsOffice from '../data/townLocations/sheriffsOffice.js';
import docsOffice from '../data/townLocations/docsOffice.js';
import church from '../data/townLocations/church.js';

// NEW data-only locations (handler optional)
import blacksmith from '../data/townLocations/blacksmith.js';
import saloon from '../data/townLocations/saloon.js';
import smugglersDen from '../data/townLocations/smugglersDen.js';
import streetMarket from '../data/townLocations/streetMarket.js';
import desertMarketplace from '../data/townLocations/desertMarketplace.js';
import temple from '../data/townLocations/temple.js';
import gladiatorArena from '../data/townLocations/gladiatorArena.js';
import scavengerDoc from '../data/townLocations/scavengerDoc.js';
import miningOperation from '../data/townLocations/miningOperation.js';
import wastelandWorkshop from '../data/townLocations/wastelandWorkshop.js';

// Normalizer so 'gamblingHall' → 'gambling', etc.
import { resolveShopId } from './locationEventText';

// --- Handler imports live under utils/locationHandlers ---
import { handleCampSiteVisit } from './locationHandlers/campSiteHandler';
import { handleFrontierOutpostEvent } from './locationHandlers/frontierOutpostHandler';
import { handleGamblingHallEvent } from './locationHandlers/gamblingHallHandler';
import { handleGeneralStoreEvent } from './locationHandlers/generalStoreHandler';
import { handleIndianTradingPostEvent } from './locationHandlers/indianTradingPostHandler';
import { handleMutantQuarterEvent } from './locationHandlers/mutantQuarterHandler';
import { handleSheriffsOfficeEvent } from './locationHandlers/sheriffsOfficeHandler';
import { handleDocsOfficeEvent } from './locationHandlers/docsOfficeHandler';
import { handleChurchEvent } from './locationHandlers/churchHandler';

// NEW: wire up handlers for the extra shops so Resolve applies effects
import { handleBlacksmithEvent } from './locationHandlers/blacksmithHandler';
import { handleSaloonEvent } from './locationHandlers/saloonHandler';
import { handleSmugglersDenEvent } from './locationHandlers/smugglersDenHandler';
import { handleStreetMarketEvent } from './locationHandlers/streetMarketHandler';
import { handleDesertMarketplaceEvent } from './locationHandlers/desertMarketplaceHandler';
import { handleTempleEvent } from './locationHandlers/templeHandler';
import { handleGladiatorArenaEvent } from './locationHandlers/gladiatorArenaHandler';
import { handleScavengerDocEvent } from './locationHandlers/scavengerDocHandler';
import { handleMiningOperationEvent } from './locationHandlers/miningOperationHandler';
import { handleWastelandWorkshopEvent } from './locationHandlers/wastelandWorkshopHandler';

import { calculateCurrentStats } from './calculateStats';
import { withConditionAppended } from './mergeConditions';

// Small helpers
const D6 = () => Math.floor(Math.random() * 6) + 1;
const roll2d6 = () => D6() + D6();
const d3 = () => Math.floor(Math.random() * 3) + 1;
const clamp0 = (n) => Math.max(0, Number(n || 0));

const RANGE_RE = /^\s*(\d{1,2})(?:\s*[-–]\s*(\d{1,2}))?\s*:\s*(.*)$/u;

// Build an index able to handle either:
//   • array of objects: [{roll, name, lore, effect}, ...]
//   • array of strings: "2: Title – Effect" (optionally with "Lore: ...")
function splitTitleEffect(text) {
  const raw = String(text).trim();
  const loreMatch = raw.match(/\bLore:\s*([\s\S]+)$/i);
  const lore = loreMatch ? loreMatch[1].trim() : '';
  const main = loreMatch ? raw.slice(0, loreMatch.index).trim() : raw;
  const parts = main.split(/\s[–-]\s/u);
  if (parts.length >= 2) {
    const title = parts.shift().trim();
    const effect = parts.join(' - ').trim();
    return { title, effect, lore };
  }
  return { title: null, effect: main, lore };
}

function buildEventIndex(dataEvents) {
  if (Array.isArray(dataEvents) && dataEvents.length && typeof dataEvents[0] === 'object') {
    // Object form: { roll, name, lore, effect }
    return dataEvents.map((e) => ({
      range: [Number(e.roll) || 2, Number(e.roll) || 2],
      raw: '',
      title: e.name ?? null,
      effect: e.effect ?? null,
      lore: e.lore ?? null,
    }));
  }

  // String form (legacy)
  const arr = Array.isArray(dataEvents) ? dataEvents.map(String) : [];
  const allHavePrefix = arr.every((s) => RANGE_RE.test(String(s)));
  if (!allHavePrefix && arr.length === 11) {
    return arr.map((text, i) => ({
      range: [2 + i, 2 + i],
      raw: String(text),
      ...splitTitleEffect(String(text)),
    }));
  }
  return arr.map((line) => {
    const raw = String(line);
    const m = raw.match(RANGE_RE);
    if (!m) return { range: [2, 12], raw, ...splitTitleEffect(raw) };
    const a = Number(m[1]);
    const b = m[2] ? Number(m[2]) : a;
    return { range: [Math.min(a, b), Math.max(a, b)], raw, ...splitTitleEffect(m[3] || '') };
  });
}

function matchByRoll(index, roll) {
  let i = index.findIndex((e) => roll >= e.range[0] && roll <= e.range[1]);
  if (i === -1) i = Math.max(0, Math.min(10, roll - 2)); // fallback for 11-entry arrays
  return i;
}

// in-memory per-location event cache (normalized by canonical shop id)
const store = new Map();
/**
 * store value shape:
 * {
 *   roll: number,                  // 2..12
 *   index: number,                 // matched entry index
 *   range: [min,max],              // e.g. [4,5]
 *   title: string | null,
 *   effect: string | null,
 *   lore: string | null,
 *   raw: string,                   // original when strings were used
 * }
 */

// Map location ids → data + handler
const REGISTRY = {
  [campSite.id]:        { data: campSite,                  handler: handleCampSiteVisit },
  [frontierOutpost.id]: { data: frontierOutpost,           handler: handleFrontierOutpostEvent },
  [gamblingHall.id]:    { data: gamblingHall,              handler: handleGamblingHallEvent },
  [generalStore.id]:    { data: generalStore,              handler: handleGeneralStoreEvent },
  // 🔁 Use the SHOP container (has events as objects)
  [indianTradingPost.id]: { data: indianTradingPost, handler: handleIndianTradingPostEvent },
  [mutantQuarter.id]:   { data: mutantQuarter,             handler: handleMutantQuarterEvent },
  [sheriffsOffice.id]:  { data: sheriffsOffice,            handler: handleSheriffsOfficeEvent },
  [docsOffice.id]:      { data: docsOffice,                handler: handleDocsOfficeEvent },
  [church.id]:          { data: church,                    handler: handleChurchEvent },

  [blacksmith.id]:      { data: blacksmith,                handler: handleBlacksmithEvent },
  [saloon.id]:          { data: saloon,                    handler: handleSaloonEvent },
  [smugglersDen.id]:    { data: smugglersDen,              handler: handleSmugglersDenEvent },
  [streetMarket.id]:    { data: streetMarket,              handler: handleStreetMarketEvent },
  [desertMarketplace.id]: { data: desertMarketplace,      handler: handleDesertMarketplaceEvent },
  [temple.id]:            { data: temple,                  handler: handleTempleEvent },
  [gladiatorArena.id]:    { data: gladiatorArena,          handler: handleGladiatorArenaEvent },
  [scavengerDoc.id]:      { data: scavengerDoc,            handler: handleScavengerDocEvent },
  [miningOperation.id]:   { data: miningOperation,         handler: handleMiningOperationEvent },
  [wastelandWorkshop.id]: { data: wastelandWorkshop,       handler: handleWastelandWorkshopEvent },
};

// ---------------------------------------------------------------------------
// Alias map so various id forms ("gamblingHall", "Gambling Hall", "gambling_hall")
// all resolve to the canonical data.id used in REGISTRY.
// This is what fixes: Blacksmith, Trading Post, General Store, Mutant Quarter,
// Street Market, and Gambling Hall not finding their events.
// ---------------------------------------------------------------------------
const aliasToCanonicalId = new Map();

function addAlias(id, ...aliases) {
  if (!id) return;
  const all = [id, ...aliases];
  all.forEach((raw) => {
    if (!raw) return;
    const norm = String(raw)
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, '');
    aliasToCanonicalId.set(norm, id);
  });
}

// Base locations (we include more aliases than strictly needed for safety)
addAlias(campSite.id, 'campSite', 'camp site', 'camp');
addAlias(frontierOutpost.id, 'frontierOutpost', 'frontier outpost', 'outpost');

addAlias(gamblingHall.id, 'gamblingHall', 'gambling hall', 'gambling', 'gambling_hall');
addAlias(generalStore.id, 'generalStore', 'general store', 'general_store');

addAlias(indianTradingPost.id, 'indianTradingPost', 'indian trading post', 'trading post', 'tradingPost', 'indian_trading_post');
addAlias(mutantQuarter.id, 'mutantQuarter', 'mutant quarter', 'mutant_quarter');

addAlias(sheriffsOffice.id, 'sheriffsOffice', "sheriff's office", 'sheriff office', 'sheriffOffice');
addAlias(docsOffice.id, 'docsOffice', "doc's office", 'docs office');

addAlias(church.id, 'church');
addAlias(blacksmith.id, 'blacksmith');
addAlias(saloon.id, 'saloon');
addAlias(smugglersDen.id, 'smugglersDen', "smuggler's den");
addAlias(streetMarket.id, 'streetMarket', 'street market', 'market', 'street_market');
addAlias(desertMarketplace.id, 'desertMarketplace', 'desert marketplace', 'desert_marketplace');
addAlias(temple.id, 'temple', 'barter town temple');
addAlias(scavengerDoc.id, 'scavengerDoc', 'scavenger doc', 'scavenger_doc');
addAlias(gladiatorArena.id, 'gladiatorArena', 'gladiator arena', 'gladiator_arena');
addAlias(miningOperation.id, 'miningOperation', 'mining operation', 'mining_operation', 'mining');
addAlias(wastelandWorkshop.id, 'wastelandWorkshop', 'wasteland workshop', 'wasteland_workshop', 'workshop');

// Normalize any incoming shop key to the canonical registry id.
function normalizeShopKey(raw) {
  const original = String(raw ?? '').trim();

  // First let the older helper do whatever mapping it had:
  const resolved = resolveShopId ? resolveShopId(original) : original;

  const candidates = [original, resolved];

  for (const c of candidates) {
    if (!c) continue;
    const norm = String(c)
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, '');
    const hit = aliasToCanonicalId.get(norm);
    if (hit) return hit;
    // direct registry key match is also fine
    if (REGISTRY[c]) return c;
  }

  // Fallback: use resolved (which may still be a usable key for old callers)
  return resolved || original;
}

function clamp2d6(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return null;
  return Math.max(2, Math.min(12, v));
}

// -------------------------------------------------------------
// Frontier Outpost side-effects (roll 2/3) helpers
// -------------------------------------------------------------
function applyFrontierOutpostEventSideEffects({ townStateApi, roll }) {
  if (!townStateApi || typeof townStateApi.get !== 'function' || typeof townStateApi.set !== 'function') return;
  const state = townStateApi.get() || {};
  const flags = { ...(state.flags || {}) };

  if (roll === 2) {
    // Disable only Training with Soldiers
    flags.fo_training_disabled = true;
  } else if (roll === 3) {
    // Close the entire Frontier Outpost
    flags.fo_closed = true;
  } else {
    return; // Nothing to set for other rolls
  }

  townStateApi.set({ ...state, flags });
}

function maybeApplyFOSideEffectsOnSetRoll(shopKey, roll, context) {
  const key = resolveShopId(shopKey);
  if (key === frontierOutpost.id) {
    applyFrontierOutpostEventSideEffects({ townStateApi: context?.townStateApi, roll });
  }
}

// -------------------------------------------------------------
// Plague Tent (Doc’s Office event #3) — now appends into conditions.temporary
// -------------------------------------------------------------
async function resolveRollThree_LuckTest(shopId, ctx) {
  const { posseApi = {}, uiApi = {} } = ctx || {};
  const heroIds =
    (typeof posseApi.getHeroesAtShop === 'function'
      ? posseApi.getHeroesAtShop(shopId)
      : (typeof posseApi.getActiveHeroId === 'function' ? [posseApi.getActiveHeroId()] : [])) || [];

  for (const hid of heroIds) {
    const hero = posseApi.getHero?.(hid);
    if (!hero) continue;

    // Determine dice from merged Luck
    const { stats: merged = {} } = calculateCurrentStats(hero || {});
    const luckDice = Number(merged['Luck'] ?? hero?.stats?.Luck ?? 0) || 0;

    // Single prompt: pass / fail / autoroll
    let mode = 'auto';
    if (typeof uiApi.choose === 'function') {
      const pick = await uiApi.choose({
        title: 'Plague Tent — Luck Test (5+)',
        message: `Roll a Luck test (5+). Your Luck suggests ${luckDice}d6.`,
        options: [
          { id: 'pass', label: 'Passed' },
          { id: 'fail', label: 'Failed' },
          { id: 'auto', label: `Autoroll ${luckDice}d6` },
        ],
      });
      mode = pick?.id || 'auto';
    }

    let failed = false;
    if (mode === 'pass') {
      failed = false;
    } else if (mode === 'fail') {
      failed = true;
    } else {
      const d = Math.max(0, luckDice);
      const rolls =
        d > 0
          ? (typeof uiApi.roll === 'function'
              ? await uiApi.roll(d, 6, 'Luck 5+')
              : Array.from({ length: d }, () => Math.floor(Math.random() * 6) + 1))
          : [];
      const success = rolls.some((r) => r >= 5);
      uiApi.toast?.(
        `[Event #3] ${hero.name || 'Hero'} Luck: [${rolls.join(', ')}] → ${success ? 'Success' : 'Fail'}`
      );
      failed = !success;
    }

    if (!failed) {
      uiApi.toast?.(`[Event #3] ${hero.name || 'Hero'} succeeded: no effect.`);
      continue;
    }

    // On fail: +D3 Corruption (no saves), and add a temporary grit cap condition
    const add = d3();
    const cur = clamp0(hero.currentCorruption);
    const { stats: merged2 = {} } = calculateCurrentStats(hero || {});
    const maxCor = Number(merged2['Max Corruption'] ?? hero.maxCorruption ?? 5) || 5;

    let nextCor = cur + add;
    const overflowCount = Math.floor(nextCor / maxCor);
    nextCor = nextCor % maxCor;

    const nextMutations = Array.isArray(hero.mutations) ? [...hero.mutations] : [];
    for (let i = 0; i < overflowCount; i++) {
      nextMutations.push({ name: 'Mutation — Roll Needed' });
    }

    const tempCond = {
      id: `gritcap_nextadv_${Date.now()}`,
      type: 'Temporary',
      name: 'Plague Tent (Shaken Nerves)',
      text: 'Max Grit is capped at 1 for the next Adventure.',
      effects: {}, // cap handled in calculateStats
      gritCap: 1,
      duration: 'nextAdventure',
      active: true,
      addedAt: Date.now(),
    };

    const nextConditions = withConditionAppended(hero.conditions, 'temporary', tempCond);

    posseApi.updateHero?.(hid, {
      currentCorruption: nextCor,
      mutations: nextMutations,
      conditions: nextConditions,
      updatedAt: Date.now(),
    });

    uiApi.toast?.(
      `[Event #3] ${hero.name || 'Hero'} failed: +${add} Corruption (no saves). Temporary debuff added (Max Grit = 1 next Adventure).`
    );
  }
}

// -------------------------------------------------------------
// Tiny UI broadcaster so inputs/panels stay in sync
// -------------------------------------------------------------
function broadcastTownStateChanged() {
  try {
    window.dispatchEvent(new CustomEvent('sobTownStateChanged'));
  } catch {}
}

// -------------------------------------------------------------
// Public API
// -------------------------------------------------------------

export function ensureEventRolled(shopKey, opts = {}) {
  const key = normalizeShopKey(shopKey);
  if (store.has(key)) return store.get(key);

  const reg = REGISTRY[key];
  if (!reg) {
    const val = {
      roll: null,
      index: -1,
      range: null,
      title: null,
      effect: null,
      lore: null,
      raw: '',
    };
    store.set(key, val);
    return val;
  }

  const index = buildEventIndex(reg.data.events || []);
  const roll = Number.isFinite(opts.forcedRoll) ? opts.forcedRoll : roll2d6();
  const idx = matchByRoll(index, roll);
  const entry = index[idx] || {};
  const val = {
    roll,
    index: idx,
    range: entry.range || [2 + idx, 2 + idx],
    title: entry.title ?? null,
    effect: entry.effect ?? null,
    lore: entry.lore ?? null,
    raw: entry.raw ?? '',
  };

  store.set(key, val);
  return val;
}

export function getEventState(shopKey) {
  return store.get(normalizeShopKey(shopKey)) || null;
}

/**
 * Backward-compatible setter.
 * - Old usage: setEventRoll(shopKey, roll)
 * - New (optional): setEventRoll(shopKey, roll, context) to apply FO side-effects immediately.
 */
export function setEventRoll(shopKey, roll, context = undefined) {
  const clamped = clamp2d6(roll);
  if (clamped == null) return getEventState(shopKey);

  // Apply FO side-effects right away if possible (so UI disables immediately)
  maybeApplyFOSideEffectsOnSetRoll(shopKey, clamped, context);

  const rec = forceEventRoll(shopKey, clamped);
  broadcastTownStateChanged();
  return rec;
}

function _idsAtShop(context, shopId) {
  const ids =
    (context?.posseApi && typeof context.posseApi.getHeroesAtShop === 'function'
      ? context.posseApi.getHeroesAtShop(shopId)
      : [context?.posseApi?.getActiveHeroId?.()]) || [];
  return Array.from(new Set(ids.filter(Boolean)));
}

export async function resolveEvent(shopKey, context = {}) {
  const key = normalizeShopKey(shopKey);
  const reg = REGISTRY[key];

  const rolled = ensureEventRolled(key);
  const roll = Number(rolled.roll || 7);

  // Run Doc’s Office #3 effect early so state/UI agree
  if (roll === 3 && key === docsOffice.id) {
    try {
      await resolveRollThree_LuckTest(key, context);
    } catch (e) {
      try { console.warn(e); } catch {}
    }
  }

  // Apply Frontier Outpost side-effects (roll 2/3) when resolving
  if (key === frontierOutpost.id) {
    try {
      applyFrontierOutpostEventSideEffects({ townStateApi: context?.townStateApi, roll });
    } catch (e) {
      try { console.warn(e); } catch {}
    }
  }

  if (!reg || typeof reg.handler !== 'function') {
    // Mark resolved even without a handler
    rolled.resolved = true;
    const out = {
      actions: [],
      townState: context.townState,
      log: [`No handler for ${key}.`],
      ui: {
        title: rolled.title,
        effect: rolled.effect,
        lore: rolled.lore,
        raw: rolled.raw,
        range: rolled.range,
      },
    };
    broadcastTownStateChanged();
    return out;
  }

  let extra = {};
  if (key === blacksmith.id && ((roll >= 4 && roll <= 5) || (roll >= 9 && roll <= 10))) {
    extra.targetHeroIds = _idsAtShop(context, key);
  }

  const result = await reg.handler({ ...context, forcedRoll: roll, ...extra });

  // Mark event as resolved so the UI shows the correct status
  rolled.resolved = true;

  const out = {
    ...result,
    ui: {
      title: rolled.title,
      effect: rolled.effect,
      lore: rolled.lore,
      raw: rolled.raw,
      range: rolled.range,
    },
  };
  broadcastTownStateChanged();
  return out;
}

export function clearEvent(shopKey) {
  store.delete(normalizeShopKey(shopKey));
  broadcastTownStateChanged();
}

export function forceEventRoll(shopKey, roll) {
  const key = normalizeShopKey(shopKey);
  store.delete(key);
  return ensureEventRolled(key, { forcedRoll: roll });
}

export function resetAllEvents() {
  store.clear();
  broadcastTownStateChanged();
}
