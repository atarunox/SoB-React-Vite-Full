// src/utils/townState.js
//
// Town-wide state for the current "stay in town".
// Local-only (Firestore temporarily disabled).
//
// Responsibilities:
// - Persist the town "day" counter and per-day flags.
// - Track which shops are available today.
// - Ensure each location triggers ONE Location Event roll per town stay.
// - Track per-hero daily lodging (Hotel vs Camp) and visits (one location per day).
// - Hold the drawn Town Daily Event for a given day.
// - Provide small helper updaters used by TownTab and DM panels.

const STORAGE_KEY = 'sob_town_state_v3';

// ---- Default / Init -------------------------------------------------------

function newState() {
  const now = Date.now();
  return {
    version: 3,
    startedAt: now,      // timestamp when this town stay began
    day: 1,              // starts at Day 1

    // Town stay management
    townStayActive: true,       // false when heroes have left town
    darknessTrack: 1,           // starts at 1; roll D6 ≤ track → Town Event + reset to 1
    darknessMax: 6,             // track goes up to 6
    darknessLog: [],            // [{day, roll, advanced, reason}]

    // Debug mode: bypasses day limits, allows resetting location events
    debugMode: false,

    // Global rules used by handlers / reroll options, etc.
    globalRules: {
      rerollFlexPlusMinus1: true, // set to false if you want it opt-in instead
    },

    // World snapshot (optional mirror of current world for DM/Town usage)
    worldSnapshot: null,

    // Shops available for THIS day only (checkboxes in DM/Town panels)
    // e.g., { blacksmith: true, saloon: true, ... }
    shopsAvailable: {},

    // Per-day per-hero visit log: one visit per hero per day
    // visitByDay[day][heroId] = { shopId, at: timestamp }
    visitByDay: {},

    // Lodging chosen last night (applies to TODAY restrictions):
    // lodgingByDay[day][heroId] = 'Hotel' | 'Camp'
    lodgingByDay: {},

    // Location Events: one roll per location per town stay
    // locationEvents[shopId] = {
    //   rolled: boolean,
    //   result: { name, effect, roll, resolved?, resolvedAt? },
    //   rollerId: string|null,
    //   dayRolled: number,
    // }
    locationEvents: {},

    // Town Daily Event per day
    // dailyEventByDay[day] = { drawn: boolean, card: { name, effect, type }, drawerId, at }
    dailyEventByDay: {},

    // Per-day modifiers/flags (discounts, alerts, etc.)
    dayMods: {},

    // Shop modifiers used by handlers (price/sale/closed/etc.)
    // e.g. { blacksmith: { priceDelta, destroyed, saleActive, ... } }
    shopMods: {},

    // Per-stay modifiers (persist for the current town stay)
    // e.g. { churchClosed: true, churchRitualExtraDarkStone: 1 }
    stayMods: {},

    // Global per-stay flags (Frontier Outpost closures, once-per-stay markers, etc.)
    // Example flags we use:
    // - fo_closed: true
    // - fo_training_disabled: true
    // - fo_bounty_board_selected: true
    // - fo_train_soldiers_<heroId>: true
    flags: {},

    // Frontier Outpost bounty payload (set by Bounty Board)
    // { roll, target, perKill, toEveryHero, text }
    outpostBounty: null,

    // Heroes forced to leave town for the rest of the stay (e.g., failed heist escape)
    // ejectedHeroes[heroId] = true
    ejectedHeroes: {},
  };
}

// ---- Storage --------------------------------------------------------------

export function loadTownState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return newState();
    const parsed = JSON.parse(raw);

    // light migration guard
    let s = (!parsed.version || parsed.version < 3)
      ? { ...newState(), ...parsed, version: 3 }
      : parsed;

    // ensure keys exist after migration
    if (!s.dayMods || typeof s.dayMods !== 'object') s.dayMods = {};
    if (!s.shopMods || typeof s.shopMods !== 'object') s.shopMods = {};
    if (!s.globalRules || typeof s.globalRules !== 'object') s.globalRules = { rerollFlexPlusMinus1: true };
    if (!s.stayMods || typeof s.stayMods !== 'object') s.stayMods = {};
    if (!s.locationEvents || typeof s.locationEvents !== 'object') s.locationEvents = {};
    if (!s.dailyEventByDay || typeof s.dailyEventByDay !== 'object') s.dailyEventByDay = {};
    if (!s.visitByDay || typeof s.visitByDay !== 'object') s.visitByDay = {};
    if (!s.lodgingByDay || typeof s.lodgingByDay !== 'object') s.lodgingByDay = {};
    if (!s.shopsAvailable || typeof s.shopsAvailable !== 'object') s.shopsAvailable = {};
    if (!s.flags || typeof s.flags !== 'object') s.flags = {};
    if (!('outpostBounty' in s)) s.outpostBounty = null;
    if (!s.ejectedHeroes || typeof s.ejectedHeroes !== 'object') s.ejectedHeroes = {};
    if (!('townStayActive' in s)) s.townStayActive = true;
    if (!Number.isFinite(s.darknessTrack) || s.darknessTrack < 1) s.darknessTrack = 1;
    if (!Number.isFinite(s.darknessMax)) s.darknessMax = 6;
    if (!Array.isArray(s.darknessLog)) s.darknessLog = [];
    if (!('debugMode' in s)) s.debugMode = false;

    return s;
  } catch (e) {
    console.warn('[townState] load failed, resetting.', e);
    return newState();
  }
}

export function saveTownState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Broadcast a change so UIs can refresh derived views (prices, badges, etc.)
    try {
      window.dispatchEvent(
        new CustomEvent('sobTownStateChanged', { detail: { key: STORAGE_KEY } })
      );
    } catch {
      // no-op if CustomEvent unsupported
    }
  } catch (e) {
    console.warn('[townState] save failed.', e);
  }
}

export function resetTownState() {
  const state = newState();
  saveTownState(state);
  return state;
}

// Optional convenience for components to subscribe/unsubscribe
export function onTownStateChange(cb) {
  const handler = () => cb?.();
  window.addEventListener('sobTownStateChanged', handler);
  return () => window.removeEventListener('sobTownStateChanged', handler);
}

// ---- Day / Rollover -------------------------------------------------------

/**
 * Sets lodging (Hotel/Camp) for the upcoming day.
 * This is typically called at End of Day for each hero.
 */
export function setLodgingForTomorrow(state, heroId, choice /* 'Hotel' | 'Camp' */) {
  const nextDay = (state.day || 1) + 1;
  state.lodgingByDay[nextDay] = state.lodgingByDay[nextDay] || {};
  state.lodgingByDay[nextDay][heroId] = choice;
  return commit(state);
}

/**
 * Start a new day:
 * - Increments day
 * - Clears per-day visits
 * - Resets dayMods
 * - Preps dailyEventByDay for the new day
 * - Leaves locationEvents as-is (still one per stay)
 * - Shops availability typically re-ticked by DM each day
 */
export function startNewDay(state) {
  const nextDay = (state.day || 1) + 1;
  state.day = nextDay;

  // reset per-day things
  state.dayMods = {};

  // Prepare per-day structures
  state.visitByDay[nextDay] = state.visitByDay[nextDay] || {};
  state.dailyEventByDay[nextDay] = state.dailyEventByDay[nextDay] || {
    drawn: false,
    card: null,
    drawerId: null,
    at: null,
  };

  return commit(state);
}

// ---- Shops availability ----------------------------------------------------

export function setShopAvailable(state, shopId, available) {
  state.shopsAvailable = state.shopsAvailable || {};
  state.shopsAvailable[shopId] = !!available;
  return commit(state);
}

export function getShopAvailable(state, shopId) {
  return !!(state.shopsAvailable && state.shopsAvailable[shopId]);
}

// ---- Shop modifiers (price/sale/closed) -----------------------------------

export function getShopMods(state, shopId) {
  const s = state || loadTownState();
  return s.shopMods?.[shopId] || { priceDelta: 0, destroyed: false, saleActive: false };
}

// ---- Visits ---------------------------------------------------------------

export function getVisitForToday(state, heroId) {
  // Backward-compatible: return ONE hero's visit record
  const day = state.day || 1;
  if (!heroId) return null;
  return state.visitByDay?.[day]?.[heroId] || null;
}

export function getVisitMapForToday(state) {
  // New explicit helper if callers want the whole map for the day
  const day = state.day || 1;
  return state.visitByDay?.[day] || {};
}

export function recordVisit(state, heroId, shopId) {
  const day = state.day || 1;
  state.visitByDay[day] = state.visitByDay[day] || {};
  state.visitByDay[day][heroId] = { shopId, at: Date.now() };
  return commit(state);
}

// ---- Daily Event ----------------------------------------------------------

export function setDailyEventForToday(state, card, drawerId = null) {
  const day = state.day || 1;
  state.dailyEventByDay[day] = {
    drawn: true,
    card: card ? { ...card } : null,
    drawerId: drawerId || null,
    at: Date.now(),
  };
  return commit(state);
}

export function getDailyEventForToday(state) {
  const day = state.day || 1;
  return state.dailyEventByDay?.[day] || { drawn: false, card: null, drawerId: null, at: null };
}

// ---- Location Events (one per location per town stay) ---------------------

/**
 * Update helper used by TownTab to set or mutate one location's event record.
 * Example:
 * updateLocationEvent('blacksmith', (ev) => ({ ...ev, rolled: true, result, rollerId, dayRolled: state.day }))
 */
export function updateLocationEvent(shopId, updater) {
  const state = loadTownState(); // ensure we operate on freshest snapshot
  const prev = state.locationEvents?.[shopId] || { rolled: false, result: null, rollerId: null, dayRolled: null };
  const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
  state.locationEvents = state.locationEvents || {};
  state.locationEvents[shopId] = sanitizeLocationEvent(next, state.day || 1);
  saveTownState(state);
  return state;
}

export function getLocationEvent(state, shopId) {
  return state.locationEvents?.[shopId] || { rolled: false, result: null, rollerId: null, dayRolled: null };
}

function sanitizeLocationEvent(rec, currentDay) {
  // Accept both shapes:
  // 1) normalized: { rolled, result: {...}, rollerId?, dayRolled? }
  // 2) legacy/flat: { roll, title, lore, effect, ... }
  const isFlat =
    rec &&
    typeof rec === 'object' &&
    'roll' in rec &&
    !('result' in rec);

  const normalized = isFlat
    ? { rolled: true, result: { ...rec } } // wrap flat record once
    : rec || {};

  return {
    rolled: !!normalized.rolled,
    result: normalized.result ? { ...normalized.result } : null,
    rollerId: normalized.rollerId || null,
    dayRolled: Number.isFinite(normalized.dayRolled) ? normalized.dayRolled : currentDay,
  };
}

// ---- Convenience: World snapshot / shops / visits -------------------------

export function setWorldSnapshot(state, worldName) {
  state.worldSnapshot = worldName || null;
  return commit(state);
}

export function clearShopsForToday(state) {
  state.shopsAvailable = {};
  return commit(state);
}

export function clearVisitsForToday(state) {
  const day = state.day || 1;
  state.visitByDay[day] = {};
  return commit(state);
}

// ---- Convenience: Day Mods (per-day flags/modifiers) ----------------------

export function getDayMods(state) {
  return state?.dayMods || {};
}

export function setDayMods(state, mods) {
  state.dayMods = { ...(state.dayMods || {}), ...(mods || {}) };
  return commit(state);
}

/**
 * Flexible patcher for dayMods:
 * - patchDayMods(fn) where fn(prev) -> next
 * - patchDayMods({ ...partial })
 * - patchDayMods('key', value)
 * Returns the updated full state (after save).
 */
export function patchDayMods(arg1, arg2) {
  const state = loadTownState();
  const prev = state.dayMods || {};
  let next = prev;

  if (typeof arg1 === 'function') {
    next = arg1(prev) || prev;
  } else if (arg1 && typeof arg1 === 'object') {
    next = { ...prev, ...arg1 };
  } else if (typeof arg1 === 'string') {
    next = { ...prev, [arg1]: arg2 };
  }

  state.dayMods = next;
  saveTownState(state);
  return state;
}

export function clearDayMods() {
  const state = loadTownState();
  state.dayMods = {};
  return commit(state);
}

// ---- Stay Mods (town-wide until leaving town) ------------------------------
// Used by Church, Blacksmith, etc. to flag long-term effects like
// "churchClosed" or "churchRitualExtraDarkStone" that persist for the current stay.

export function getStayMods(state) {
  return state?.stayMods || {};
}

export function setStayMods(state, mods) {
  state.stayMods = { ...(state.stayMods || {}), ...(mods || {}) };
  return commit(state);
}

/**
 * Flexible patcher for stayMods:
 * - patchStayMods(fn) where fn(prev) -> next
 * - patchStayMods({ ...partial })
 * - patchStayMods('key', value)
 * Returns the updated full state (after save).
 */
export function patchStayMods(arg1, arg2) {
  const state = loadTownState();
  const prev = state.stayMods || {};
  let next = prev;

  if (typeof arg1 === 'function') {
    next = arg1(prev) || prev;
  } else if (arg1 && typeof arg1 === 'object') {
    next = { ...prev, ...arg1 };
  } else if (typeof arg1 === 'string') {
    next = { ...prev, [arg1]: arg2 };
  }

  state.stayMods = next;
  saveTownState(state);
  return state;
}

export function clearStayMods() {
  const state = loadTownState();
  state.stayMods = {};
  return commit(state);
}

// ---- Shop price helpers ---------------------------------------------------

/**
 * Apply shop-level price modifiers (priceDelta from events) to a base gold cost.
 * Returns the adjusted price (never below minFloor, default 0).
 */
export function applyShopPriceMods(baseGold, shopId, opts = {}) {
  const s = loadTownState();
  const mods = s.shopMods?.[shopId] || {};
  const delta = Number(mods.priceDelta) || 0;
  const minFloor = typeof opts.minFloor === 'number' ? opts.minFloor : 0;
  return Math.max(minFloor, baseGold + delta);
}

/**
 * Check if a location has been destroyed (closed) for this town stay.
 */
export function isLocationDestroyed(shopId) {
  const s = loadTownState();
  return !!(s.shopMods?.[shopId]?.destroyed);
}

// ---- Commit ---------------------------------------------------------------

function commit(state) {
  saveTownState(state);
  return state;
}

// ---- Darkness Track -------------------------------------------------------

/**
 * End-of-day Town Event Track check (per rulebook):
 * - Roll D6. If roll ≤ current track number → Town Event triggers, track resets to 1.
 * - If roll > track number → no event, track advances +1.
 * - No Grit may be used on this roll.
 * Returns { roll, townEvent, newLevel, trackWas }.
 */
export function rollTownEventCheck(state) {
  const trackWas = state.darknessTrack || 1;
  const roll = Math.floor(Math.random() * 6) + 1;
  const townEvent = roll <= trackWas;

  if (townEvent) {
    // Town Event triggers — reset track to 1
    state.darknessTrack = 1;
  } else {
    // No event — advance track by 1
    state.darknessTrack = Math.min(trackWas + 1, state.darknessMax || 6);
  }

  const entry = { day: state.day, roll, trackWas, townEvent, newLevel: state.darknessTrack, reason: 'daily' };
  state.darknessLog = [...(state.darknessLog || []), entry];
  commit(state);
  return { roll, townEvent, newLevel: state.darknessTrack, trackWas };
}

// Legacy alias
export function rollDarknessAdvance(state) {
  return rollTownEventCheck(state);
}

/**
 * Manually advance darkness by a given amount (from events, cards, etc.).
 */
export function advanceDarkness(state, amount = 1, reason = 'manual') {
  state.darknessTrack = Math.min((state.darknessTrack || 0) + amount, state.darknessMax || 6);
  const entry = { day: state.day, amount, reason };
  state.darknessLog = [...(state.darknessLog || []), entry];
  return commit(state);
}

/**
 * Reset darkness track to 0.
 */
export function resetDarkness(state) {
  state.darknessTrack = 1;
  state.darknessLog = [];
  return commit(state);
}

/**
 * Check if darkness has reached max (heroes forced to leave).
 */
export function isDarknessFull(state) {
  return (state.darknessTrack || 0) >= (state.darknessMax || 6);
}

// ---- Town Stay Management -------------------------------------------------

/**
 * End the town stay. Heroes are leaving town.
 */
export function endTownStay(state) {
  state.townStayActive = false;
  return commit(state);
}

/**
 * Start a fresh town stay (resets everything).
 */
export function startNewTownStay() {
  const state = newState();
  saveTownState(state);
  return state;
}

/**
 * Check if the town stay is still active.
 */
export function isTownStayActive(state) {
  return state?.townStayActive !== false;
}

// ---- Debug Mode -----------------------------------------------------------

export function setDebugMode(state, enabled) {
  state.debugMode = !!enabled;
  return commit(state);
}

export function isDebugMode(state) {
  return !!state?.debugMode;
}

/**
 * Reset a single location event (debug only).
 */
export function resetLocationEvent(shopId) {
  const state = loadTownState();
  if (state.locationEvents?.[shopId]) {
    delete state.locationEvents[shopId];
    saveTownState(state);
  }
  return state;
}

/**
 * Reset ALL location events (debug only).
 */
export function resetAllLocationEvents() {
  const state = loadTownState();
  state.locationEvents = {};
  saveTownState(state);
  return state;
}

/**
 * Reset visits for today (debug only — allows re-visiting).
 */
export function resetVisitsForToday() {
  const state = loadTownState();
  const day = state.day || 1;
  state.visitByDay[day] = {};
  saveTownState(state);
  return state;
}

// ---- Debug / Dev Helpers (no-ops in prod ok) ------------------------------

export function _debugDump() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

export function _debugSet(rawObject) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rawObject));
  } catch (e) {
    console.warn('[townState] _debugSet failed', e);
  }
}
