// src/components/TownTab/townTabHelpers.js
import { calculateCurrentStats } from '../../utils/calculateStats';
import { getConditionRules } from '../../utils/conditionRules';

// ---------- Small utils ----------
const isObj = (v) => v && typeof v === 'object';

export const isTokenPurchase = (item) =>
  item?.category === 'TokenPurchase' || !!item?.grantsToken;

export const isInjection = (it) => {
  if (!it) return false;
  if (it.category === 'Injection') return true;
  if (it.slot === 'Injection') return true;
  if (Array.isArray(it.tags) && it.tags.includes('Injection')) return true;
  const name = String(it.name || '').toLowerCase();
  return name.endsWith(' injection') || name.includes(' injection');
};

export const isExorcismService = (svc) =>
  svc?.id === 'ch_ritual_exorcism_of_madness' ||
  svc?.rules?.ui?.requiresConditionPicker === 'Madness';

export const isResurrectionService = (svc) =>
  String(svc?.id || '').toLowerCase().includes('resurrection') ||
  String(svc?.name || '').trim().toLowerCase() === 'resurrection';

export const isRitualService = (svc) =>
  String(svc?.type || '').trim().toLowerCase() === 'ritual';

export const isBanishCorruptionService = (svc) =>
  svc?.id === 'ch_ritual_banish_corruption';

export const isBlessedAura = (item) => {
  if (!item) return false;
  if (Array.isArray(item.tags) && item.tags.includes('Blessed Aura')) return true;
  if (String(item.id || '').startsWith('church_aura_')) return true;
  return false;
};

// Normalize ids like "Trading Post" / "trading_post" / "trading-post" / "tradingPost"
const _norm = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '');

/**
 * Robustly map a location or sub-shop object to its tab categories from tabsByShop.
 * - Direct matches (exact key or normalized)
 * - Parent fallback using parentId/locationId
 * - Heuristic fallback: if subshop id starts with a known location key (e.g., "saloonEntertainment" -> "saloon")
 * Also normalizes category entries, supporting modules that export { entries[] } OR { items[] } OR { services[] }.
 */
export function buildCategoriesForShop(shopOrSubshop, tabsMap) {
  if (!shopOrSubshop || !tabsMap) {
    return [{ id: 'none', label: 'No Entries', entries: [] }];
  }

  const rawId = String(shopOrSubshop.id || '');
  const normId = _norm(rawId);

  // 1) direct match
  let cats = tabsMap[rawId] || tabsMap[normId];

  // 2) alias scan (keys that normalize equal)
  if (!cats) {
    for (const [k, v] of Object.entries(tabsMap)) {
      if (_norm(k) === normId) { cats = v; break; }
    }
  }

  // 3) parent fallback (when tabs are grouped by location id)
  const parentKey = shopOrSubshop.parentId || shopOrSubshop.locationId || '';
  if (!cats && parentKey && tabsMap[parentKey]) {
    const parent = tabsMap[parentKey];
    if (Array.isArray(parent)) {
      cats = parent;
    } else if (parent && typeof parent === 'object') {
      cats = parent[rawId] || parent[normId];
      if (!cats) {
        for (const [k, v] of Object.entries(parent)) {
          if (_norm(k) === normId) { cats = v; break; }
        }
      }
    }
  }

  // 4) heuristic fallback: if subshop id starts with a known location key ("saloonEntertainment" -> "saloon")
  if (!cats) {
    const parentGuessKey = Object.keys(tabsMap).find((k) => normId.startsWith(_norm(k)));
    if (parentGuessKey) {
      const parent = tabsMap[parentGuessKey];
      if (Array.isArray(parent)) {
        cats = parent;
      } else if (parent && typeof parent === 'object') {
        // try exact child keys first
        cats = parent[rawId] || parent[normId];
        // then normalized match of any child key
        if (!cats) {
          for (const [k, v] of Object.entries(parent)) {
            if (_norm(k) === normId) { cats = v; break; }
          }
        }
      }
    }
  }

  if (!Array.isArray(cats) || cats.length === 0) {
    return [{ id: 'none', label: 'No Entries', entries: [] }];
  }

  // ----- turn each category into a clean { id, label, entries[] } -----

  // Prefer entries[], then items[], then services[]. If both items/services exist, merge.
  const toEntries = (c) => {
    if (Array.isArray(c?.entries)) return c.entries;
    if (Array.isArray(c?.items))   return c.items;

    const mod = c?.items ?? c?.entries;
    // The mapping packs the imported module object in c.items.
    // It might be: an array (already the entries), or an object with { entries[] | items[] | services[] }.
    if (Array.isArray(mod)) return mod;

    if (mod && typeof mod === 'object') {
      if (Array.isArray(mod.default))  return mod.default;
      const hasItems    = Array.isArray(mod.items)    ? mod.items    : null;
      const hasEntries  = Array.isArray(mod.entries)  ? mod.entries  : null;
      const hasServices = Array.isArray(mod.services) ? mod.services : null;

      if (hasEntries) return hasEntries;
      if (hasItems && hasServices) return [...hasItems, ...hasServices];
      if (hasItems)    return hasItems;
      if (hasServices) return hasServices;
    }
    return [];
  };

  // Strip placeholder if any real category exists
  const isNone = (c) =>
    String(c?.id || '').toLowerCase() === 'none' ||
    String(c?.label || '').toLowerCase() === 'no entries';

  const hasReal = cats.some((c) => c && !isNone(c));
  const cleaned = hasReal ? cats.filter((c) => c && !isNone(c)) : cats;

  let normalized = cleaned.map((c, i) => ({
    id: c.id || `cat_${i}`,
    label: c.label || 'Items',
    entries: toEntries(c),
  }));

  // Hide empty tabs if at least one has content
  const hasContent = normalized.some((c) => (c.entries?.length ?? 0) > 0);
  if (hasContent) normalized = normalized.filter((c) => (c.entries?.length ?? 0) > 0);

  return normalized.length
    ? normalized
    : [{ id: 'none', label: 'No Entries', entries: [] }];
}

// ---------- Cost helpers ----------
// Accepts number or object for either `cost` or `price`
export const getCost = (item) => {
  if (!item) return null;

  // prefer explicit cost
  if (typeof item.cost === 'number' || (item.cost && typeof item.cost === 'object')) {
    return item.cost;
  }
  // fallback to price for services/items that use it
  if (typeof item.price === 'number' || (item.price && typeof item.price === 'object')) {
    return item.price;
  }

  return null;
};


// Preserve both numeric and raw-string faces of costs (so dice like 'D6' aren't lost).
export const normalizeCostObject = (cost) => {
  if (typeof cost === 'number') {
    const s = String(cost);
    return {
      gold: cost, goldStr: s,
      darkStone: 0, darkStoneStr: '0',
      scrap: 0, scrapStr: '0',
      tech: 0, techStr: '0',
    };
  }
  if (!isObj(cost)) {
    return {
      gold: 0, goldStr: '0',
      darkStone: 0, darkStoneStr: '0',
      scrap: 0, scrapStr: '0',
      tech: 0, techStr: '0',
    };
  }
  const coerceNum = (v) => (typeof v === 'number' ? v : Number.isFinite(Number(v)) ? Number(v) : 0);
  const asStr = (v) => (v == null ? '0' : String(v));
  return {
    gold: coerceNum(cost.gold),
    goldStr: asStr(cost.gold),
    darkStone: coerceNum(cost.darkStone),
    darkStoneStr: asStr(cost.darkStone),
    scrap: coerceNum(cost.scrap),
    scrapStr: asStr(cost.scrap),
    tech: coerceNum(cost.tech),
    techStr: asStr(cost.tech),
  };
};

// Optional: cost adder that keeps raw strings for display
export const addCosts = (a, b) => {
  const A = normalizeCostObject(a);
  const B = normalizeCostObject(b);
  return {
    gold: A.gold + B.gold,
    goldStr: A.goldStr !== '0' ? A.goldStr : (A.gold ? String(A.gold) : '0'),
    darkStone: A.darkStone + B.darkStone,
    darkStoneStr: A.darkStoneStr !== '0' ? A.darkStoneStr : (A.darkStone ? String(A.darkStone) : '0'),
    scrap: A.scrap + B.scrap,
    scrapStr: A.scrapStr !== '0' ? A.scrapStr : (A.scrap ? String(A.scrap) : '0'),
    tech: A.tech + B.tech,
    techStr: A.techStr !== '0' ? A.techStr : (A.tech ? String(A.tech) : '0'),
  };
};

// Shows "each" when the item uses a per-unit price (e.g., rules.pricePerPoint or a direct { each:true } flag).
export const formatCost = (c, itemOrOpts) => {
  const hasEach =
    !!itemOrOpts &&
    typeof itemOrOpts === 'object' &&
    (
      itemOrOpts?.rules?.pricePerPoint ||     // Treat Corruption: { rules: { pricePerPoint: { gold: 100 } } }
      itemOrOpts?.each === true               // manual override if needed
    );

  const addEach = (s) => (hasEach ? `${s} each` : s);

  if (c == null) return '—';
  if (typeof c === 'string') return c; // keep dice/range strings as-is
  if (typeof c === 'number') return addEach(`$${c}`);
  if (typeof c === 'object') {
    const parts = [];
    if (c.gold) parts.push(`$${c.gold}`);
    if (c.darkStone) parts.push(`${c.darkStone} Dark Stone`);
    if (c.scrap) parts.push(`${c.scrap} Scrap`);
    if (c.tech) parts.push(`${c.tech} Tech`);
    const joined = parts.length ? parts.join(', ') : '—';
    return addEach(joined);
  }
  return String(c);
};

// ---------- Carry / capacity ----------
export const getItemWeight = (it) => Number(it?.weight || 0);

export const getCurrentLoad = (h) =>
  Array.isArray(h?.inventory)
    ? h.inventory
        .filter((it) => it && it.name !== 'Empty Slot')
        .reduce((sum, it) => sum + getItemWeight(it), 0)
    : 0;

export const getEquippedLoad = (h) =>
  h?.gear
    ? Object.values(h.gear)
        .filter(Boolean)
        .reduce((sum, it) => sum + getItemWeight(it), 0)
    : 0;

export const getTotalLoad = (h) => getEquippedLoad(h) + getCurrentLoad(h);

export const getCarryCapacityLikeGearTab = (h) => {
  const rules = getConditionRules(h);
  const { stats = {} } = calculateCurrentStats(h || {});
  const str = Number(stats['Strength']) || 0;
  const delta = Number(rules?.carryCapacityDelta || 0);
  return Math.max(0, str + 5 + delta);
};

export const willExceedCarryLikeGearTab = (h, item) =>
  getTotalLoad(h) + getItemWeight(item) > getCarryCapacityLikeGearTab(h);

// ---------- Icons ----------
export const ASSETS = {
  hand: {
    1: '/assets/1hand.jpg',
    2: '/assets/2hand.jpg',
    3: '/assets/3hand.jpg',
  },
  slot: {
    1: '/assets/1Slot.jpg',
    2: '/assets/2Slot.jpg',
    3: '/assets/3Slot.jpg',
  },
  weight: '/assets/Weight.jpg',
  ds: '/assets/DS.jpg',
};

const ICON_PX = 20;

const capCount = (n) => Math.max(0, Number(n || 0));

export function IconRowRepeat({ src, count, title, className = '', size = ICON_PX }) {
  const n = capCount(count);
  if (!n) return null;
  const max = 8;
  const shown = Math.min(n, max);
  const extra = n - shown;
  return (
    <span className={'inline-flex items-center gap-1 mr-3 ' + className} title={title}>
      {Array.from({ length: shown }).map((_, i) => (
        <span
          key={i}
          className="inline-block shrink-0 align-[-2px]"
          style={{
            width: size,
            height: size,
            backgroundImage: `url(${src})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            imageRendering: 'auto',
          }}
          aria-hidden
        />
      ))}
      {extra > 0 && <span className="text-xs text-gray-300">+{extra}</span>}
    </span>
  );
}

export function IconRowComposite({ map, count, title, className = '', size = ICON_PX }) {
  const n = capCount(count);
  if (!n) return null;
  const capped = Math.min(n, 3);
  const src = map[capped] || map[3];
  const extra = n - capped;
  return (
    <span className={'inline-flex items-center gap-1 mr-3 ' + className} title={title}>
      <span
        className="inline-block shrink-0 align-[-2px]"
        style={{
          width: size,
          height: size,
          backgroundImage: `url(${src})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          imageRendering: 'auto',
        }}
        aria-hidden
      />
      {extra > 0 && <span className="text-xs text-gray-300">+{extra}</span>}
    </span>
  );
}

// derive hands if not explicitly provided (Free Attack weapons use 0 hands)
export const deriveHandsRequired = (item) => {
  if (!item) return 0;
  // explicit override (allows 3-handed, etc.)
  if (Number.isFinite(item.hands)) return Math.max(0, item.hands);

  // classic flags / tags
  if (item.twoHanded) return 2;
  const tags = Array.isArray(item.tags) ? item.tags.map((t) => String(t).toLowerCase()) : [];
  if (tags.includes('two-handed') || tags.includes('twohanded')) return 2;

  // default heuristics
  const slot = String(item.slot || '').toLowerCase();
  if (slot === 'gun' || slot === 'hand weapon') return 1;

  return 0;
};;

// ---------- Conditions (Surgery) ----------
function lower(x) { return String(x ?? '').toLowerCase(); }

export function isConditionActiveAndOperable(c) {
  if (!c) return false;
  if (c.active === false) return false;
  if (c.removed || c.cleared || c.healed || c.resolved) return false;
  if (c.surgeryLocked) return false;
  return true;
}

function normalizeCondition(c, fallbackType) {
  const type = lower(c?.type ?? c?.kind ?? fallbackType ?? '');
  const name = String(c?.name ?? c?.title ?? '').trim() || (type ? type[0].toUpperCase() + type.slice(1) : 'Condition');
  return { ...c, type, name };
}

function conditionKey(c) {
  if (c?.id) return `id:${String(c.id)}`;
  const t = lower(c?.type ?? '');
  const n = lower(c?.name ?? c?.title ?? '');
  const txt = lower(String(c?.text ?? c?.effect ?? '').slice(0, 64));
  return `sig:${t}|${n}|${txt}`;
}

function collectCandidateArrays(hero) {
  const buckets = [];

  // Flat master array
  if (Array.isArray(hero?.conditions)) buckets.push({ type: null, list: hero.conditions });

  // Nested buckets — support singular and plural
  if (Array.isArray(hero?.conditions?.injury))     buckets.push({ type: 'injury',   list: hero.conditions.injury });
  if (Array.isArray(hero?.conditions?.injuries))   buckets.push({ type: 'injury',   list: hero.conditions.injuries });
  if (Array.isArray(hero?.conditions?.mutation))   buckets.push({ type: 'mutation', list: hero.conditions.mutation });
  if (Array.isArray(hero?.conditions?.mutations))  buckets.push({ type: 'mutation', list: hero.conditions.mutations });

  // Legacy top-level arrays — singular and plural
  if (Array.isArray(hero?.injury))     buckets.push({ type: 'injury',   list: hero.injury });
  if (Array.isArray(hero?.injuries))   buckets.push({ type: 'injury',   list: hero.injuries });
  if (Array.isArray(hero?.mutation))   buckets.push({ type: 'mutation', list: hero.mutation });
  if (Array.isArray(hero?.mutations))  buckets.push({ type: 'mutation', list: hero.mutations });

  // Map-like shapes used in some versions
  const byType = hero?.conditions?.byType || hero?.conditionsByType || hero?.conditionMap || hero?.conditionsMap;
  if (byType) {
    if (Array.isArray(byType.injury))     buckets.push({ type: 'injury',   list: byType.injury });
    if (Array.isArray(byType.injuries))   buckets.push({ type: 'injury',   list: byType.injuries });
    if (Array.isArray(byType.mutation))   buckets.push({ type: 'mutation', list: byType.mutation });
    if (Array.isArray(byType.mutations))  buckets.push({ type: 'mutation', list: byType.mutations });
  }

  // Status-style containers
  const status = hero?.status || hero?.state || hero?.states;
  if (status) {
    if (Array.isArray(status.injury))     buckets.push({ type: 'injury',   list: status.injury });
    if (Array.isArray(status.injuries))   buckets.push({ type: 'injury',   list: status.injuries });
    if (Array.isArray(status.mutation))   buckets.push({ type: 'mutation', list: status.mutation });
    if (Array.isArray(status.mutations))  buckets.push({ type: 'mutation', list: status.mutations });
  }

  return buckets.filter(Boolean);
}

function collectByType(hero, wantType /* 'injury' | 'mutation' */) {
  if (!hero) return [];
  const seen = new Set();
  const out = [];

  for (const bucket of collectCandidateArrays(hero)) {
    const { type: bucketType, list } = bucket;
    if (!Array.isArray(list)) continue;

    for (const raw of list) {
      const t = lower(raw?.type ?? raw?.kind ?? bucketType ?? '');
      if (t !== wantType) continue;

      const norm = normalizeCondition(raw, wantType);
      if (!isConditionActiveAndOperable(norm)) continue;

      const key = conditionKey(norm);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(norm);
    }
  }

  return out;
}

export const getInjuryList = (hero)   => collectByType(hero, 'injury');
export const getMutationList = (hero) => collectByType(hero, 'mutation');

// Side bag update (no underflow)
export function nextSideBag(hero, tokenType, addAmount) {
  const bag = hero.sideBag || hero.sidebag || hero.sideBagTokens || {};
  const current = Number(bag[tokenType] || 0);
  const updatedVal = Math.max(0, current + Number(addAmount || 0));
  return { ...bag, [tokenType]: updatedVal };
}

// --------- UI category helpers ----------
export const labelForCategory = (raw) => {
  if (!raw) return 'Category';
  const map = { items: 'Items', services: 'Services' };
  if (map[raw]) return map[raw];
  return String(raw)
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (s) => s.toUpperCase());
};
