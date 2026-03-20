// src/utils/locationEventText.js

// Import the data modules that contain the .events arrays
import campSite           from '../data/townLocations/campSite.js';
import frontierOutpost    from '../data/townLocations/frontierOutpost.js';
import gamblingHall       from '../data/townLocations/gamblingHall.js';
import generalStore       from '../data/townLocations/generalStore.js';
import indianTradingPost  from '../data/townLocations/indianTradingPost.js';
import mutantQuarter      from '../data/townLocations/mutantQuarter.js';
import sheriffsOffice     from '../data/townLocations/sheriffsOffice.js';
import docsOffice         from '../data/townLocations/docsOffice.js';
import church             from '../data/townLocations/church.js';

// NEW: add these four
import blacksmith         from '../data/townLocations/blacksmith.js';
import saloon             from '../data/townLocations/saloon.js';
import smugglersDen       from '../data/townLocations/smugglersDen.js';
import streetMarket       from '../data/townLocations/streetMarket.js';

// Blasted Wastes Town
import miningOperation   from '../data/townLocations/miningOperation.js';
import wastelandWorkshop from '../data/townLocations/wastelandWorkshop.js';
import desertMarketplace from '../data/townLocations/desertMarketplace.js';
import temple            from '../data/townLocations/temple.js';
import gladiatorArena    from '../data/townLocations/gladiatorArena.js';
import scavengerDoc      from '../data/townLocations/scavengerDoc.js';

// Map by id so getEventDisplay(shopId, roll) can find events easily
const DATA = {
  [campSite.id]: campSite,
  [frontierOutpost.id]: frontierOutpost,
  [gamblingHall.id]: gamblingHall,     // data id is 'gambling'
  [generalStore.id]: generalStore,
  [indianTradingPost.id]: indianTradingPost,
  [mutantQuarter.id]: mutantQuarter,
  [sheriffsOffice.id]: sheriffsOffice,
  [docsOffice.id]: docsOffice,
  [church.id]: church,
  // NEW:
  [blacksmith.id]: blacksmith,
  [saloon.id]: saloon,
  [smugglersDen.id]: smugglersDen,
  [streetMarket.id]: streetMarket,
  // Blasted Wastes Town
  [miningOperation.id]: miningOperation,
  [wastelandWorkshop.id]: wastelandWorkshop,
  [desertMarketplace.id]: desertMarketplace,
  [temple.id]: temple,
  [gladiatorArena.id]: gladiatorArena,
  [scavengerDoc.id]: scavengerDoc,
};

// Common UI ↔ data id mismatches (extend as needed)
const ALIASES = {
  gamblingHall: 'gambling',
  sheriff: 'sheriffsOffice',
  sheriffs: 'sheriffsOffice',
  docs: 'docsOffice',
  doc: 'docsOffice',
  outpost: 'frontierOutpost',
  tradingPost: 'indianTradingPost',
  // convenience
  smith: 'blacksmith',
  market: 'streetMarket',
  smugglers: 'smugglersDen',
  // Blasted Wastes aliases
  mining: 'miningOperation',
  workshop: 'wastelandWorkshop',
};

function _resolveShopIdInternal(id) {
  if (!id) return id;
  if (DATA[id]) return id;
  const lowered = String(id).toLowerCase();
  for (const [k, v] of Object.entries(ALIASES)) {
    if (k.toLowerCase() === lowered && DATA[v]) return v;
  }
  if (lowered === 'gamblinghall') return 'gambling';
  if (lowered === 'sheriffsoffice') return 'sheriffsOffice';
  return id;
}

// Exported so other modules can normalize ids
export function resolveShopId(id) {
  return _resolveShopIdInternal(id);
}

// Regex for “2: Title – Effect” or “4–5: Title – Effect” style
// Accept leading quote and hyphen/en dash/em dash in the range header.
const RANGE_RE = /^\s*["']?\s*(\d{1,2})(?:\s*[-–—]\s*(\d{1,2}))?\s*:\s*(.*)$/u;

// Split on spaced hyphen/en dash/em dash between title and effect.
const TITLE_SPLIT_RE = /\s[–—-]\s/u;

/**
 * Split a single event line into {title, effect, lore}.
 * Supports optional trailing "Lore: ..." on the same or next line.
 */
function splitTitleEffect(text) {
  const raw = String(text).trim();

  // Extract optional Lore: ... (greedy to end; supports multi-line)
  const loreMatch = raw.match(/\bLore:\s*([\s\S]+)$/i);
  const lore = loreMatch ? loreMatch[1].trim() : '';

  // Main portion without the Lore: segment
  const main = loreMatch ? raw.slice(0, loreMatch.index).trim() : raw;

  // Split main into Title — Effect
  const parts = main.split(TITLE_SPLIT_RE);
  if (parts.length >= 2) {
    const title = parts.shift().trim();
    const effect = parts.join(' - ').trim();
    return { title, effect, lore };
  }
  // If no delimiter, treat whole main as effect
  return { title: '', effect: main, lore };
}

function buildEventIndex(events) {
  // Handle object-form events: [{ roll, name, lore, effect }, ...]
  if (Array.isArray(events) && events.length && typeof events[0] === 'object') {
    return events.map((e) => ({
      range: [Number(e.roll) || 2, Number(e.roll) || 2],
      raw: '',
      title: e.name ?? null,
      effect: e.effect ?? null,
      lore: e.lore ?? null,
    }));
  }

  // String-form events (legacy)
  const arr = Array.isArray(events) ? events.map(String) : [];
  const allHavePrefix = arr.every((s) => RANGE_RE.test(s));

  // 11-entry linear map (index 0→roll 2, …, 10→roll 12)
  if (!allHavePrefix && arr.length === 11) {
    return arr.map((raw, i) => ({
      range: [2 + i, 2 + i],
      raw,
      ...splitTitleEffect(raw),
    }));
  }

  // Prefix map ("2:" or "4–5:")
  return arr.map((raw) => {
    const m = raw.match(RANGE_RE);
    if (!m) return { range: [2, 12], raw, ...splitTitleEffect(raw) };
    const a = Number(m[1]);
    const b = m[2] ? Number(m[2]) : a;
    return { range: [Math.min(a, b), Math.max(a, b)], raw, ...splitTitleEffect(m[3] || '') };
  });
}

function matchByRoll(index, roll) {
  const i = index.findIndex((e) => roll >= e.range[0] && roll <= e.range[1]);
  if (i >= 0) return i;
  // fallback for linear tables
  return Math.max(0, Math.min(10, roll - 2));
}

function clampRoll(n) {
  const r = Number(n);
  if (!Number.isFinite(r)) return 2;
  return Math.max(2, Math.min(12, r));
}

/**
 * getEventDisplay(shopId, roll) => { title, lore, effect } | null
 */
export function getEventDisplay(shopId, roll) {
  const resolved = resolveShopId(shopId);
  const data = DATA[resolved];
  const events = data?.events;
  if (!events || !Array.isArray(events) || events.length === 0) {
    if (process?.env?.NODE_ENV !== 'production') {
      console.warn('[getEventDisplay] No events for', shopId, '(resolved:', resolved, ')');
    }
    return null;
  }

  const index = buildEventIndex(events);
  const r = clampRoll(roll);
  const idx = matchByRoll(index, r);
  const entry = index[idx];
  if (!entry) return null;

  return {
    title: entry.title || '',
    lore: entry.lore || '',
    effect: entry.effect || '',
  };
}

/** Optional: meta variant */
export function getEventDisplayWithMeta(shopId, roll) {
  const resolved = resolveShopId(shopId);
  const data = DATA[resolved];
  const events = data?.events;
  if (!events || !Array.isArray(events) || events.length === 0) return null;

  const index = buildEventIndex(events);
  const r = clampRoll(roll);
  const idx = matchByRoll(index, r);
  const entry = index[idx];
  if (!entry) return null;

  return {
    title: entry.title || '',
    lore: entry.lore || '',
    effect: entry.effect || '',
    index: idx,
    range: entry.range,
    raw: entry.raw,
  };
}

/** Convenience: always returns an object (never null) */
export function getEventDisplaySafe(shopId, roll) {
  return getEventDisplay(shopId, roll) || { title: 'Location Event', lore: '', effect: '' };
}
