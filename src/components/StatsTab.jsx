// src/components/StatsTab.jsx
import React, { useRef, useState, useEffect, useMemo } from 'react';
import formatStatLabel from '../utils/formatStatLabel';
import { useHero } from '../context/HeroContext';
import { usePosse } from '../context/PosseContext';
import { useUIScale } from '../context/UIScaleContext';
import { calculateCurrentStats } from '../utils/calculateStats';

/* ------------------------------- helpers -------------------------------- */

// Title-Case normalizer (matches calculateCurrentStats’ casing tendencies)
const normalizeKey = (key = '') =>
  key
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());

// Loose class-name matcher (handles "Wandering Samurai" vs "WanderingSamurai")
const hasClass = (hero, needle) => {
  const cls = String(hero?.heroClass || hero?.class || '')
    .toLowerCase()
    .replace(/\s+/g, '');
  return cls === String(needle).toLowerCase().replace(/\s+/g, '');
};

const DISPLAY_LABELS = {
  Special: (hero) =>
    hasClass(hero, 'Wandering Samurai')
      ? 'Fury'
      : hasClass(hero, 'Dark Stone Shaman')
      ? 'Spirit Magik'
      : hasClass(hero, 'Orphan')
      ? 'Mana'
      : hasClass(hero, 'Gambler')
      ? 'Fortune'
      : 'Special',
};

// Safely turn any stat value into a displayable string
function displayVal(v) {
  if (v == null) return '—';
  if (typeof v === 'object') {
    if ('value' in v && (typeof v.value === 'number' || typeof v.value === 'string')) {
      return String(v.value);
    }
    if ('toHit' in v || 'damage' in v) {
      const th = v.toHit ?? '—';
      const dmg = v.damage ?? '—';
      return `${th}+ / D${dmg}`;
    }
    return Array.isArray(v) ? v.join(', ') : '—';
  }
  return String(v);
}

// Treat empty slots as non-items
const isPlaceholder = (it) =>
  !it || it.name === 'Empty Slot' || /^empty-/i.test(String(it?.id || ''));

// numeric coerce helper
const toNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

// ---------- detailed table helpers ----------
const isThreshold = (v) => typeof v === 'string' && /^\d+\+$/.test(v.trim());
const parseThreshold = (v) => (isThreshold(v) ? Number(v.replace('+', '')) : null);
const fmtThreshold = (n) => (Number.isFinite(n) ? `${n}+` : '—');

// compute Total from base/gear/skills/conditions
function totalOf(base, gear, skills, conditions) {
  const g = typeof gear === 'number' ? gear : 0;
  const s = typeof skills === 'number' ? skills : 0;
  const c = typeof conditions === 'number' ? conditions : 0;

  if (isThreshold(base)) {
    const b = parseThreshold(base);
    const improved = Math.max(2, b - (g + s + c)); // lower is better
    return fmtThreshold(improved);
  }
  if (typeof base === 'number') return base + g + s + c;

  // No explicit base: if we only have deltas, show their sum (when non-zero)
  const sum = g + s + c;
  return sum ? sum : '—';
}

function handleCorruptionOverflow(hero, maxCorruption) {
  const max = Number(maxCorruption ?? 5);
  const cur = Number(hero.currentCorruption ?? 0);
  if (cur >= max) {
    const overflowCount = Math.floor(cur / max);
    hero.currentCorruption = cur % max;
    hero.mutations = [...(hero.mutations || [])];
    for (let i = 0; i < overflowCount; i++) {
      hero.mutations.push({ name: 'Mutation — Roll Needed' });
    }
  }
  return hero;
}

/* -------------------------- tolerant key readers -------------------------- */

// variants for a stat key to tolerate casing/spacing/alias shapes
const keyVariants = (k = '') => {
  const alias = k === 'Melee' ? 'Melee To-Hit' : k === 'Ranged' ? 'Ranged To-Hit' : k;
  const t = normalizeKey(alias); // Title Case
  const low = alias.toLowerCase();
  const tlow = t.toLowerCase();
  const nos = alias.replace(/\s+/g, '');
  const tnos = t.replace(/\s+/g, '');
  const lowNos = low.replace(/\s+/g, '');
  const tlNos = tlow.replace(/\s+/g, '');
  return [alias, t, low, tlow, nos, tnos, lowNos, tlNos];
};

// tolerant getter over plain objects
const getProp = (obj, key) => {
  if (!obj) return undefined;
  for (const v of keyVariants(key)) {
    if (obj[v] !== undefined) return obj[v];
  }
  return undefined;
};

// slugger for loose matches
const slug = (s = '') =>
  String(s).toLowerCase().replace(/[^\w+ ]+/g, '').replace(/[_\s\-]+/g, '').trim();

// SUPER tolerant bucket reader (supports {flat, thresholds, adds, mods} or arrays)
const readBucket = (bucket, key) => {
  if (!bucket) return null;

  const candidates = keyVariants(key);

  // 1) direct keys
  for (const c of candidates) if (bucket[c] != null) return bucket[c];

  // 2) nested shapes
  const nested = ['flat', 'thresholds', 'adds', 'mods', 'list', 'entries', 'values'];
  for (const nk of nested) {
    const sub = bucket[nk];
    if (!sub) continue;

    // object map
    if (!Array.isArray(sub) && typeof sub === 'object') {
      for (const c of candidates) if (sub[c] != null) return sub[c];
      const want = slug(candidates[0]);
      for (const [kk, vv] of Object.entries(sub)) {
        if (slug(kk) === want) return vv;
      }
    }

    // array of entries
    if (Array.isArray(sub)) {
      const want = slug(candidates[0]);
      for (const entry of sub) {
        if (!entry) continue;
        const ek = entry.stat ?? entry.key ?? entry.name ?? entry.k ?? entry.id;
        if (ek && slug(ek) === want) {
          return (
            entry.amount ??
            entry.value ??
            entry.delta ??
            entry.improve ?? // threshold steps
            entry
          );
        }
      }
    }
  }

  // 3) last-chance: loose match over top-level keys
  if (typeof bucket === 'object' && !Array.isArray(bucket)) {
    const want = slug(candidates[0]);
    for (const [kk, vv] of Object.entries(bucket)) {
      if (slug(kk) === want) return vv;
    }
  }

  return null;
};

// threshold resolver using tolerant readers
const resolveThresholdFromAnySource = (statKey, merged = {}, brk = {}) => {
  const THRESH = new Set([
    'Melee To-Hit',
    'Ranged To-Hit',
    'Defense',
    'Willpower',
    'Armor',
    'Spirit Armor',
  ]);

  const isThresh = THRESH.has(statKey);

  const normalizeVal = (val) => {
    if (val == null || val === '') return null;
    if (typeof val === 'object') {
      val =
        val.value ??
        val.val ??
        val.threshold ??
        val.text ??
        null;
      if (val == null) return null;
    }
    if (isThresh && typeof val === 'number') {
      return `${val}+`;
    }
    return String(val);
  };

  const vMerged = getProp(merged, statKey);
  const direct = normalizeVal(vMerged);
  if (direct != null) return direct;

  const tryFrom = (b) => {
    const v = readBucket(b, statKey);
    return normalizeVal(v);
  };

  return (
    tryFrom(brk?.base) ??
    tryFrom(brk?.gear) ??
    tryFrom(brk?.skills) ??
    tryFrom(brk?.conditions) ??
    '—'
  );
};

/* ----------------------------- keyword helpers ---------------------------- */

const deriveKeywords = (hero) => {
  if (!hero) return [];
  const out = new Set();

  const pushMany = (src) => {
    if (!src) return;
    if (Array.isArray(src)) {
      src.forEach((v) => pushMany(v));
      return;
    }
    const parts = String(src)
      .split(/[,/;]+/g)
      .map((p) => p.trim())
      .filter(Boolean);
    for (let p of parts) {
      // Normalize casing a bit: "law" -> "Law", "outlaw hero" -> "Outlaw Hero"
      p = p
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
      out.add(p);
    }
  };

  pushMany(hero.keywords);
  pushMany(hero.keyword);
  pushMany(hero.heroKeywords);
  pushMany(hero.tags);
  pushMany(hero.traits);

  return Array.from(out);
};

/* ---------------------- default tile positions (responsive grid) ---------------------- */

const STAT_ORDER_FOR_GRID = [
  'Agility', 'Cunning', 'Spirit', 'Strength', 'Lore',
  'Luck', 'Initiative', 'Melee', 'Ranged', 'Defense',
  'Willpower', 'Armor', 'Spirit Armor', 'Health', 'Sanity',
  'Grit', 'Corruption', 'Special', 'Move', 'Combat',
];

const TILE_GAP = 8;

function computeGridLayout(containerWidth) {
  if (!containerWidth || containerWidth <= 0) {
    // Fallback for SSR / initial render
    return { cols: 5, tileW: 128, tileH: 96, colW: 140, rowH: 108 };
  }
  let cols;
  if (containerWidth < 280) cols = 3;
  else if (containerWidth < 400) cols = 4;
  else cols = 5;

  const tileW = Math.floor((containerWidth - TILE_GAP * (cols + 1)) / cols);
  const tileH = Math.floor(tileW * 0.75);
  const colW = tileW + TILE_GAP;
  const rowH = tileH + TILE_GAP;
  return { cols, tileW, tileH, colW, rowH };
}

function buildDefaultPositions(cols, colW, rowH) {
  return Object.fromEntries(
    STAT_ORDER_FOR_GRID.map((label, i) => [
      label,
      { x: TILE_GAP + (i % cols) * colW, y: TILE_GAP + Math.floor(i / cols) * rowH },
    ])
  );
}

/* -------------------------------- component -------------------------------- */

export default function StatsTab({
  heroId, // kept for compat
  dragLocked,
  setDragLocked,
  resetLayout,
  positions = {},
  setPositions,
}) {
  const { hero: activeHero, updateHero } = useHero();
  const { updateHero: updateHeroPosse } = usePosse();
  const { statsScale, setStatsScale } = useUIScale();

  // ---- Undo / Redo history for stat changes ----
  const MAX_UNDO = 30;
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  // Reset stacks when switching heroes
  const heroIdRef = useRef(activeHero?.id || activeHero?.localId);
  useEffect(() => {
    const cur = activeHero?.id || activeHero?.localId;
    if (cur !== heroIdRef.current) {
      heroIdRef.current = cur;
      setUndoStack([]);
      setRedoStack([]);
    }
  }, [activeHero?.id, activeHero?.localId]);

  // IMPORTANT: pass the hero through unchanged; let calculateCurrentStats
  // handle bucketed conditions internally.
  const normalizedHero = activeHero || {};

  // signature of only REAL equipped items (placeholders count as empty)
  const gearSig = React.useMemo(
    () =>
      Object.entries(activeHero?.gear || {})
        .map(([slot, it]) => `${slot}:${isPlaceholder(it) ? '' : it?.id || ''}`)
        .sort()
        .join('|'),
    [activeHero?.gear]
  );

  // recompute totals whenever gear signature or hero changes
  const { stats: rawMergedStats = {}, breakdown = {} } = React.useMemo(
    () => calculateCurrentStats(normalizedHero || {}),
    [gearSig, activeHero?.id, activeHero?.localId, normalizedHero]
  );

  // Apply location visit buffs (e.g., Saloon "Aces and Eights" +2 Luck/Cunning)
  const visitBuffs = activeHero?.locationVisitBuffs;
  const mergedStats = React.useMemo(() => {
    if (!visitBuffs || typeof visitBuffs !== 'object') return rawMergedStats;
    const patched = { ...rawMergedStats };
    for (const [stat, val] of Object.entries(visitBuffs)) {
      const buffVal = Number(val ?? 0);
      if (buffVal > 0 && typeof patched[stat] === 'number') {
        patched[stat] = patched[stat] + buffVal;
      }
    }
    return patched;
  }, [rawMergedStats, visitBuffs]);

  const heroKeywords = React.useMemo(
    () => deriveKeywords(activeHero),
    [activeHero]
  );

  const dragAreaRef = useRef();
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = dragAreaRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const gridLayout = useMemo(
    () => computeGridLayout(containerWidth),
    [containerWidth]
  );

  const defaultPositions = useMemo(
    () => buildDefaultPositions(gridLayout.cols, gridLayout.colW, gridLayout.rowH),
    [gridLayout.cols, gridLayout.colW, gridLayout.rowH]
  );

  const [localPositions, setLocalPositions] = useState(() => {
    const saved = activeHero?.statPositions;
    return saved && Object.keys(saved).length > 0 ? saved : {};
  });
  const [draggingLabel, setDraggingLabel] = useState(null);
  const [dragStart, setDragStart] = useState(null);

  // Per-hero persistence for "Detailed Stats"
  const detailsKey =
    activeHero?.id || activeHero?.localId
      ? `sob:stats:details:${activeHero.id || activeHero.localId}`
      : 'sob:stats:details';
  const [showDetails, setShowDetails] = useState(() => {
    try {
      const saved = localStorage.getItem(detailsKey);
      return saved ? saved === '1' : false;
    } catch {
      return false;
    }
  });

  const [showKeywordsBox, setShowKeywordsBox] = useState(false);

  useEffect(() => {
    const saved = activeHero?.statPositions;
    setLocalPositions(saved && Object.keys(saved).length > 0 ? saved : {});
  }, [activeHero?.statPositions, activeHero?.id, activeHero?.localId]);

  // Persist details toggle per hero
  useEffect(() => {
    try {
      localStorage.setItem(detailsKey, showDetails ? '1' : '0');
    } catch {}
  }, [detailsKey, showDetails]);

  // Ensure we release drag even if pointer leaves the area
  useEffect(() => {
    const onUp = () => {
      if (draggingLabel) {
        setDraggingLabel(null);
        setDragStart(null);
        updateHeroFunc({ statPositions: localPositions });
      }
    };
    window.addEventListener('pointerup', onUp);
    return () => window.removeEventListener('pointerup', onUp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggingLabel, localPositions]);

  // Update BOTH: Posse (source of truth) and HeroContext (instant UI)
  const applyHeroUpdate = (changes) => {
    if (!activeHero) return;
    const id = activeHero.id || activeHero.localId;
    const payload = { id, ...changes, updatedAt: Date.now() };
    if (typeof updateHeroPosse === 'function') updateHeroPosse(payload);
    if (typeof updateHero === 'function') updateHero(payload);
  };

  // Wrapped version that pushes an undo snapshot before applying
  const updateHeroFunc = (changes) => {
    if (!activeHero) return;
    // Capture the previous values only for the keys being changed
    const snapshot = {};
    for (const key of Object.keys(changes)) {
      if (key === 'id' || key === 'updatedAt') continue;
      snapshot[key] = activeHero[key];
    }
    setUndoStack((prev) => [...prev.slice(-(MAX_UNDO - 1)), snapshot]);
    setRedoStack([]); // clear redo on new action
    applyHeroUpdate(changes);
  };

  const handleUndo = () => {
    if (!undoStack.length || !activeHero) return;
    const snapshot = undoStack[undoStack.length - 1];
    // Save current state for redo before reverting
    const redoSnapshot = {};
    for (const key of Object.keys(snapshot)) {
      redoSnapshot[key] = activeHero[key];
    }
    setRedoStack((prev) => [...prev, redoSnapshot]);
    setUndoStack((prev) => prev.slice(0, -1));
    applyHeroUpdate(snapshot);
  };

  const handleRedo = () => {
    if (!redoStack.length || !activeHero) return;
    const snapshot = redoStack[redoStack.length - 1];
    // Save current state for undo
    const undoSnapshot = {};
    for (const key of Object.keys(snapshot)) {
      undoSnapshot[key] = activeHero[key];
    }
    setUndoStack((prev) => [...prev, undoSnapshot]);
    setRedoStack((prev) => prev.slice(0, -1));
    applyHeroUpdate(snapshot);
  };

  if (!activeHero) return <div>No hero loaded</div>;

  const handleResetLayout = () => {
    setLocalPositions({});
    updateHeroFunc({ statPositions: {} });
    if (resetLayout) resetLayout();
  };

  const handlePointerDown = (e, label) => {
    if (dragLocked) return;
    const { left, top } = e.currentTarget.getBoundingClientRect();
    // Store offset in screen space — we'll convert when moving
    setDraggingLabel(label);
    setDragStart({ x: e.clientX - left, y: e.clientY - top });
  };

  const handlePointerMove = (e) => {
    if (!draggingLabel || !dragStart) return;
    const rect = dragAreaRef.current.getBoundingClientRect();
    // Convert screen-space coordinates to local (unscaled) coordinates
    const s = statsScale || 1;
    const x = (e.clientX - rect.left - dragStart.x) / s;
    const y = (e.clientY - rect.top - dragStart.y) / s;
    setLocalPositions((pos) => ({ ...pos, [draggingLabel]: { x, y } }));
  };

  const statOrder = [
    'Agility',
    'Cunning',
    'Spirit',
    'Strength',
    'Lore',
    'Luck',
    'Initiative',
    'Melee',
    'Ranged',
    'Defense',
    'Willpower',
    'Armor',
    'Spirit Armor',
    'Health',
    'Sanity',
    'Grit',
    'Corruption',
    'Special',
    'Move',
    'Combat',
  ];

  // ---- base-from-hero fallback for details table ----
  function baseFromHero(k, hero) {
    switch (k) {
      // Core 6
      case 'Agility':
      case 'Cunning':
      case 'Spirit':
      case 'Strength':
      case 'Lore':
      case 'Luck':
        return hero?.stats?.[k] ?? hero?.stats?.[k.toLowerCase()] ?? null;

      case 'Initiative':
        return hero?.initiative ?? hero?.stats?.Initiative ?? null;
      case 'Move':
        return hero?.move ?? hero?.stats?.Move ?? null;
      case 'Combat':
        return hero?.combat ?? hero?.stats?.Combat ?? null;

      case 'Health':
        return hero?.maxHealth ?? hero?.health ?? hero?.stats?.Health ?? null;
      case 'Sanity':
        return hero?.maxSanity ?? hero?.sanity ?? hero?.stats?.Sanity ?? null;
      case 'Grit':
        return hero?.maxGrit ?? hero?.stats?.Grit ?? null;

      case 'Melee To-Hit':
        return hero?.toHit?.melee ?? hero?.stats?.melee ?? null;
      case 'Ranged To-Hit':
        return hero?.toHit?.ranged ?? hero?.stats?.ranged ?? null;

      case 'Defense':
      case 'Willpower':
      case 'Armor':
      case 'Spirit Armor':
        return resolveThresholdFromAnySource(k, mergedStats, breakdown) ?? null;

      case 'Corruption': {
        const maxCor =
          getProp(mergedStats, 'Max Corruption') ?? hero?.maxCorruption ?? null;
        return maxCor;
      }

      default:
        return null;
    }
  }

  /* --------------------------- draggable tiles --------------------------- */
  const getStatValue = (label) => {
    const keyForLookup =
      label === 'Melee'
        ? 'Melee To-Hit'
        : label === 'Ranged'
        ? 'Ranged To-Hit'
        : label;

    const fromMerged = getProp(mergedStats, keyForLookup);
    if (fromMerged !== undefined) {
      // Special handling for thresholds: if numeric, show as X+
      if (
        ['Defense', 'Willpower', 'Armor', 'Spirit Armor', 'Melee To-Hit', 'Ranged To-Hit'].includes(
          keyForLookup
        )
      ) {
        if (typeof fromMerged === 'number') return `${fromMerged}+`;
      }
      return fromMerged;
    }

    switch (label) {
      case 'Agility':
      case 'Cunning':
      case 'Spirit':
      case 'Strength':
      case 'Lore':
      case 'Luck': {
        return (
          activeHero.stats?.[label] ??
          activeHero.stats?.[label.toLowerCase()] ??
          '—'
        );
      }
      case 'Health': {
        return activeHero.maxHealth ?? activeHero.health ?? activeHero.stats?.Health ?? 0;
      }
      case 'Sanity': {
        return activeHero.maxSanity ?? activeHero.sanity ?? activeHero.stats?.Sanity ?? 0;
      }
      case 'Grit': {
        return activeHero.maxGrit ?? activeHero.stats?.Grit ?? 0;
      }
      case 'Move': {
        return activeHero.move ?? activeHero.stats?.Move ?? 0;
      }
      case 'Combat': {
        return activeHero.combat ?? activeHero.stats?.Combat ?? 0;
      }
      case 'Initiative': {
        return activeHero.initiative ?? activeHero.stats?.Initiative ?? 0;
      }
      case 'Melee': {
        const v =
          getProp(mergedStats, 'Melee To-Hit') ??
          activeHero.toHit?.melee ??
          activeHero.stats?.melee ??
          '—';
        return typeof v === 'number' ? `${v}+` : v;
      }
      case 'Ranged': {
        const v =
          getProp(mergedStats, 'Ranged To-Hit') ??
          activeHero.toHit?.ranged ??
          activeHero.stats?.ranged ??
          '—';
        return typeof v === 'number' ? `${v}+` : v;
      }
      case 'Defense': {
        return resolveThresholdFromAnySource('Defense', mergedStats, breakdown);
      }
      case 'Willpower': {
        return resolveThresholdFromAnySource('Willpower', mergedStats, breakdown);
      }
      case 'Armor': {
        return resolveThresholdFromAnySource('Armor', mergedStats, breakdown);
      }
      case 'Spirit Armor': {
        return resolveThresholdFromAnySource('Spirit Armor', mergedStats, breakdown);
      }
      case 'Corruption': {
        const maxC =
          getProp(mergedStats, 'Max Corruption') ?? activeHero.maxCorruption ?? 5;
        return `${activeHero.currentCorruption ?? 0} / ${maxC}`;
      }
      default:
        return '—';
    }
  };

  /* --------------------------------- render --------------------------------- */

  // Numeric coercions for bottom UI controls (robust fallbacks)
  const maxHealth =
    toNum(
      getProp(mergedStats, 'Health') ??
        activeHero.maxHealth ??
        activeHero.health ??
        activeHero.stats?.Health ??
        0,
      0
    );
  const curHealth = toNum(activeHero.currentHealth ?? 0, 0);

  const maxSanity =
    toNum(
      getProp(mergedStats, 'Sanity') ??
        activeHero.maxSanity ??
        activeHero.sanity ??
        activeHero.stats?.Sanity ??
        0,
      0
    );
  const curSanity = toNum(activeHero.currentSanity ?? 0, 0);

  const maxGrit =
    toNum(
      getProp(mergedStats, 'Grit') ??
        activeHero.maxGrit ??
        activeHero.stats?.Grit ??
        0,
      0
    );
  const curGrit = toNum(
    getProp(mergedStats, 'CurrentGrit') ??
      activeHero.currentGrit ??
      0,
    0
  );

  const maxCor =
    toNum(getProp(mergedStats, 'Max Corruption') ?? activeHero.maxCorruption ?? 5, 5);
  const curCor = toNum(activeHero.currentCorruption ?? 0, 0);

  const curDS = toNum(activeHero.darkStone ?? 0, 0);
  const curGold = toNum(activeHero.gold ?? 0, 0);
  const curScrap = toNum(activeHero.scrap ?? 0, 0);
  const curTech = toNum(activeHero.tech ?? 0, 0);
  const curXP = toNum(activeHero.xp ?? 0, 0);

  return (
    <div onPointerMove={handlePointerMove}>
      <div className="flex justify-end mb-2 gap-2 flex-wrap">
        <button
          className="btn btn-sm"
          onClick={handleUndo}
          disabled={undoStack.length === 0}
          title="Undo last stat change"
        >
          Undo{undoStack.length > 0 ? ` (${undoStack.length})` : ''}
        </button>
        <button
          className="btn btn-sm"
          onClick={handleRedo}
          disabled={redoStack.length === 0}
          title="Redo last undone change"
        >
          Redo
        </button>
        <button className="btn btn-sm" onClick={() => setDragLocked?.(!dragLocked)}>
          {dragLocked ? 'Unlock Drag' : 'Lock Drag'}
        </button>
        <button className="btn btn-sm" onClick={handleResetLayout}>
          Reset Layout
        </button>
        <button className="btn btn-sm" onClick={() => setShowDetails((v) => !v)}>
          {showDetails ? 'Hide Details' : 'Detailed Stats'}
        </button>
        {/* Tile scale controls */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            className="btn btn-sm px-2"
            onClick={() => setStatsScale(Math.round((statsScale - 0.1) * 100) / 100)}
            disabled={statsScale <= 0.5}
            title="Shrink stat tiles"
          >
            -
          </button>
          <span className="text-xs font-medium w-10 text-center">{Math.round(statsScale * 100)}%</span>
          <button
            className="btn btn-sm px-2"
            onClick={() => setStatsScale(Math.round((statsScale + 0.1) * 100) / 100)}
            disabled={statsScale >= 1.5}
            title="Enlarge stat tiles"
          >
            +
          </button>
        </div>
      </div>

      {/* Top panel: Detailed Breakdown (Base / Gear / Skills / Conditions / Total) */}
      {showDetails && (
        <div className="rounded-xl border border-[#8b6b46] bg-[#1e1a14] text-amber-100 p-3 mb-3 shadow-lg">
          <div className="font-bold mb-2 text-amber-200">Detailed Stat Breakdown</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-[#2a2218] text-amber-200">
                <tr className="text-left border-b border-[#8b6b46]/40">
                  <th className="py-2 pr-3">Stat</th>
                  <th className="py-2 pr-3 text-right">Base</th>
                  <th className="py-2 pr-3 text-right">Gear</th>
                  <th className="py-2 pr-3 text-right">Skills</th>
                  <th className="py-2 pr-3 text-right">Conditions</th>
                  {visitBuffs && Object.keys(visitBuffs).length > 0 && (
                    <th className="py-2 pr-3 text-right">Buffs</th>
                  )}
                  <th className="py-2 pr-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ...statOrder,
                  // Include other merged stats but skip ones we already show as aliases
                  ...Object.keys(mergedStats)
                    .filter((k) => !statOrder.includes(k))
                    .filter((k) => !['Melee To-Hit', 'Ranged To-Hit'].includes(k))
                    .sort((a, b) => a.localeCompare(b)),
                ].map((rawKey) => {
                  const displayKey = rawKey;
                  const lookupKey =
                    rawKey === 'Melee'
                      ? 'Melee To-Hit'
                      : rawKey === 'Ranged'
                      ? 'Ranged To-Hit'
                      : rawKey;

                  let base = readBucket(breakdown?.base, lookupKey);
                  let gear = readBucket(breakdown?.gear, lookupKey);
                  let skills = readBucket(breakdown?.skills, lookupKey);
                  let conditions = readBucket(breakdown?.conditions, lookupKey);
                  const buffVal = visitBuffs && typeof visitBuffs === 'object'
                    ? Number(visitBuffs[lookupKey] ?? 0) || 0
                    : 0;

                  // fallback base from hero if still null
                  if (base == null) base = baseFromHero(lookupKey, activeHero);

                  const mergedVal = getProp(mergedStats, lookupKey);
                  const hasAny =
                    base != null ||
                    gear != null ||
                    skills != null ||
                    conditions != null ||
                    buffVal > 0 ||
                    mergedVal != null;

                  const isCoreStat = statOrder.includes(rawKey);
                  if (!isCoreStat && !hasAny) return null;

                  const dash = '—';
                  const fmt = (v) => {
                    if (v == null || v === '') return dash;
                    if (typeof v === 'number' || typeof v === 'string') return String(v);
                    if (typeof v === 'object' && 'value' in v) return String(v.value);
                    return Array.isArray(v) ? v.join(', ') : dash;
                  };

                  const mergedTotal = ['Defense', 'Willpower', 'Armor', 'Spirit Armor'].includes(
                    lookupKey
                  )
                    ? mergedVal ?? totalOf(base, gear, skills, conditions)
                    : totalOf(base, gear, skills, conditions);

                  // derive a single delta bucket if none provided
                  if (gear == null && skills == null && conditions == null) {
                    const isThreshRow = [
                      'Defense',
                      'Willpower',
                      'Armor',
                      'Spirit Armor',
                      'Melee To-Hit',
                      'Ranged To-Hit',
                    ].includes(lookupKey);

                    if (!isThreshRow) {
                      const bn = Number(base);
                      const tn = Number(mergedTotal);
                      if (Number.isFinite(bn) && Number.isFinite(tn) && tn !== bn) {
                        gear = tn - bn; // assign diff to Gear as a sensible fallback
                      }
                    } else {
                      const p = (v) =>
                        typeof v === 'string' && /^\d+\+$/.test(v)
                          ? Number(v.replace('+', ''))
                          : null;
                      const b = p(base);
                      const t = p(mergedTotal);
                      if (b != null && t != null && b !== t) {
                        gear = b - t; // + means improved by steps
                      }
                    }
                  }

                  return (
                    <tr
                      key={displayKey}
                      className="border-b border-[#8b6b46]/20 align-top odd:bg-stone-900/20 even:bg-stone-900/40"
                    >
                      <td className="py-1 pr-3 font-medium">{displayKey}</td>
                      <td className="py-1 pr-3 text-right tabular-nums">{fmt(base)}</td>
                      <td className="py-1 pr-3 text-right tabular-nums text-emerald-200">
                        {fmt(gear)}
                      </td>
                      <td className="py-1 pr-3 text-right tabular-nums text-sky-200">
                        {fmt(skills)}
                      </td>
                      <td className="py-1 pr-3 text-right tabular-nums text-rose-200">
                        {fmt(conditions)}
                      </td>
                      {visitBuffs && Object.keys(visitBuffs).length > 0 && (
                        <td className="py-1 pr-3 text-right tabular-nums text-yellow-300">
                          {buffVal > 0 ? `+${buffVal}` : fmt(null)}
                        </td>
                      )}
                      <td className="py-1 pr-3 text-right tabular-nums font-semibold text-amber-200">
                        {fmt(mergedTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-amber-300/90 mt-2">
            Numeric bonuses add to <span className="font-semibold">Total</span>. For threshold
            stats (like <span className="font-semibold">4+</span>), improvements lower the number
            (e.g., +1 → <span className="font-semibold">3+</span>).
          </div>
        </div>
      )}

      {/* Keywords / Traits panel (collapsible, under the detailed stat box) */}
      {heroKeywords.length > 0 && (
        <div className="rounded-xl border border-[#8b6b46] bg-[#1e1a14] text-amber-100 p-3 mb-3 shadow-lg">
          <button
            type="button"
            className="w-full flex items-center justify-between text-sm font-semibold text-amber-200"
            onClick={() => setShowKeywordsBox((v) => !v)}
          >
            <span>Keywords &amp; Traits</span>
            <span className="text-xs">
              {showKeywordsBox ? '▲ Hide' : '▼ Show'}
            </span>
          </button>

          {showKeywordsBox && (
            <div className="mt-2 flex flex-wrap gap-2">
              {heroKeywords.map((kw) => (
                <span
                  key={kw}
                  className="px-2 py-1 rounded-full border border-[#8b6b46]/60 bg-[#2a2218] text-amber-100 text-xs"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Draggable stat tiles */}
      <div
        className="relative border-2 border-[#5C3A21] rounded-xl shadow-inner touch-none"
        ref={dragAreaRef}
        style={{
          minHeight: `${(gridLayout.rowH * Math.ceil(statOrder.length / gridLayout.cols) + TILE_GAP * 2) * statsScale}px`,
          transform: `scale(${statsScale})`,
          transformOrigin: 'top left',
          width: statsScale !== 1 ? `${100 / statsScale}%` : undefined,
        }}
      >
        {statOrder.map((label) => {
          const value = getStatValue(label);
          const pos = localPositions[label] || defaultPositions[label] || { x: 0, y: 0 };
          const displayLabel =
            label === 'Special' ? DISPLAY_LABELS.Special(activeHero) : formatStatLabel(label);

          return (
            <div
              key={label}
              className="absolute rounded-2xl bg-gradient-to-b from-[#ede2c6] to-[#d4c3a1] p-1 border border-[#8b6b46] text-center cursor-grab flex flex-col justify-center items-center transition-transform duration-200 ease-in-out shadow-[0_4px_10px_rgba(0,0,0,0.6)]"
              style={{
                left: pos.x,
                top: pos.y,
                width: `${gridLayout.tileW}px`,
                height: `${gridLayout.tileH}px`,
                touchAction: 'none',
              }}
              onPointerDown={(e) => handlePointerDown(e, label)}
            >
              <div className="font-bold text-[#3b2f1d] tracking-tight drop-shadow-sm leading-snug" style={{ fontSize: `${Math.max(9, gridLayout.tileW * 0.12)}px` }}>
                {displayLabel}
              </div>
              <div className="font-black text-[#1f1f1f] leading-tight drop-shadow" style={{ fontSize: `${Math.max(14, gridLayout.tileW * 0.22)}px` }}>
                {displayVal(value)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resource Trackers */}
      <div className="mt-6 w-full flex flex-col gap-3">
        {/* Health & Sanity */}
        <div className="grid grid-cols-2 gap-3">
          {/* Health */}
          <div className="flex-1 p-2 sm:p-3 rounded-xl border border-[#8b6b46] bg-[#f5ebd8] shadow-md text-center">
            <div className="font-bold text-[#3b2f1d] text-sm sm:text-base md:text-lg">Health</div>
            <div className="text-lg sm:text-xl md:text-2xl font-black my-1 sm:my-2 text-[#1f1f1f]">
              {toNum(activeHero.currentHealth ?? 0)} / {toNum(maxHealth)}
            </div>
            <div className="flex justify-center gap-2">
              <button
                className="btn btn-sm px-2 sm:px-3"
                onClick={() =>
                  updateHeroFunc({
                    currentHealth: Math.max(0, toNum(activeHero.currentHealth ?? 0) - 1),
                  })
                }
                disabled={toNum(activeHero.currentHealth ?? 0) <= 0}
              >
                -
              </button>
              <button
                className="btn btn-sm px-2 sm:px-3"
                onClick={() => {
                  const cur = toNum(activeHero.currentHealth ?? 0);
                  updateHeroFunc({ currentHealth: Math.min(maxHealth, cur + 1) });
                }}
                disabled={toNum(activeHero.currentHealth ?? 0) >= toNum(maxHealth)}
              >
                +
              </button>
            </div>
          </div>

          {/* Sanity */}
          <div className="flex-1 p-2 sm:p-3 rounded-xl border border-[#8b6b46] bg-[#f5ebd8] shadow-md text-center">
            <div className="font-bold text-[#3b2f1d] text-sm sm:text-base md:text-lg">Sanity</div>
            <div className="text-lg sm:text-xl md:text-2xl font-black my-1 sm:my-2 text-[#1f1f1f]">
              {toNum(activeHero.currentSanity ?? 0)} / {toNum(maxSanity)}
            </div>
            <div className="flex justify-center gap-2">
              <button
                className="btn btn-sm px-2 sm:px-3"
                onClick={() =>
                  updateHeroFunc({
                    currentSanity: Math.max(0, toNum(activeHero.currentSanity ?? 0) - 1),
                  })
                }
                disabled={toNum(activeHero.currentSanity ?? 0) <= 0}
              >
                -
              </button>
              <button
                className="btn btn-sm px-2 sm:px-3"
                onClick={() => {
                  const cur = toNum(activeHero.currentSanity ?? 0);
                  updateHeroFunc({ currentSanity: Math.min(maxSanity, cur + 1) });
                }}
                disabled={toNum(activeHero.currentSanity ?? 0) >= toNum(maxSanity)}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Grit & Corruption */}
        <div className="grid grid-cols-2 gap-3">
          {/* Grit */}
          <div className="flex-1 p-2 sm:p-3 rounded-xl border border-[#8b6b46] bg-[#f5ebd8] shadow-md text-center">
            <div className="font-bold text-[#3b2f1d] text-sm sm:text-base md:text-lg">Grit</div>
            <div className="text-lg sm:text-xl md:text-2xl font-black my-1 sm:my-2 text-[#1f1f1f]">
              {curGrit} / {toNum(maxGrit)}
            </div>
            <div className="flex justify-center gap-2">
              <button
                className="btn btn-sm px-2 sm:px-3"
                onClick={() =>
                  updateHeroFunc({
                    currentGrit: Math.max(0, toNum(activeHero.currentGrit ?? 0) - 1),
                  })
                }
                disabled={toNum(activeHero.currentGrit ?? 0) <= 0}
              >
                -
              </button>
              <button
                className="btn btn-sm px-2 sm:px-3"
                onClick={() => {
                  const cur = toNum(activeHero.currentGrit ?? 0);
                  updateHeroFunc({ currentGrit: Math.min(maxGrit, cur + 1) });
                }}
                disabled={toNum(activeHero.currentGrit ?? 0) >= toNum(maxGrit)}
              >
                +
              </button>
            </div>
          </div>

          {/* Corruption */}
          <div className="flex-1 p-2 sm:p-3 rounded-xl border border-[#8b6b46] bg-[#f5ebd8] shadow-md text-center">
            <div className="font-bold text-[#3b2f1d] text-sm sm:text-base md:text-lg">Corruption</div>
            <div className="text-lg sm:text-xl md:text-2xl font-black my-1 sm:my-2 text-[#1f1f1f]">
              {toNum(activeHero.currentCorruption ?? 0)} / {toNum(maxCor)}
            </div>
            <div className="flex justify-center gap-2">
              <button
                className="btn btn-sm px-2 sm:px-3"
                onClick={() => {
                  const newHero = handleCorruptionOverflow(
                    {
                      ...activeHero,
                      currentCorruption: Math.max(
                        0,
                        toNum(activeHero.currentCorruption ?? 0) - 1
                      ),
                    },
                    toNum(maxCor)
                  );
                  updateHeroFunc(newHero);
                }}
                disabled={toNum(activeHero.currentCorruption ?? 0) <= 0}
              >
                -
              </button>
              <button
                className="btn btn-sm px-2 sm:px-3"
                onClick={() => {
                  const newHero = handleCorruptionOverflow(
                    {
                      ...activeHero,
                      currentCorruption: toNum(activeHero.currentCorruption ?? 0) + 1,
                    },
                    toNum(maxCor)
                  );
                  updateHeroFunc(newHero);
                }}
                disabled={toNum(activeHero.currentCorruption ?? 0) >= toNum(maxCor)}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Dark Stone & Gold */}
        <div className="grid grid-cols-2 gap-3">
          {/* Dark Stone */}
          <div className="flex-1 p-2 sm:p-3 rounded-xl border border-[#535359] bg-[#ebebf2] shadow-md text-center">
            <div className="font-bold text-[#353552] text-sm sm:text-base md:text-lg">Dark Stone</div>
            <div className="text-lg sm:text-xl md:text-2xl font-black my-1 sm:my-2 text-[#222238]">{curDS}</div>
            <div className="flex justify-center gap-2">
              <button
                className="btn btn-sm px-2 sm:px-3"
                onClick={() => updateHeroFunc({ darkStone: Math.max(0, curDS - 1) })}
                disabled={curDS <= 0}
              >
                -1
              </button>
              <button
                className="btn btn-sm px-2 sm:px-3"
                onClick={() => updateHeroFunc({ darkStone: curDS + 1 })}
              >
                +1
              </button>
            </div>
          </div>

          {/* Gold */}
          <div className="flex-1 p-2 sm:p-3 rounded-xl border border-[#bfa439] bg-[#faf1da] shadow-md text-center">
            <div className="font-bold text-[#bfa439] text-sm sm:text-base md:text-lg">Gold</div>
            <div className="text-lg sm:text-xl md:text-2xl font-black my-1 sm:my-2 text-[#ad9400]">{curGold}</div>
            <div className="flex justify-center gap-2">
              <button
                className="btn btn-sm px-2 sm:px-3"
                onClick={() => updateHeroFunc({ gold: Math.max(0, curGold - 10) })}
                disabled={curGold <= 0}
              >
                -10
              </button>
              <button
                className="btn btn-sm px-2 sm:px-3"
                onClick={() => updateHeroFunc({ gold: curGold + 10 })}
              >
                +10
              </button>
            </div>
          </div>
        </div>

        {/* Scrap & Tech */}
        <div className="grid grid-cols-2 gap-3">
          {/* Scrap */}
          <div className="flex-1 p-2 sm:p-3 rounded-xl border border-[#757575] bg-[#e3e3e3] shadow-md text-center">
            <div className="font-bold text-[#474747] text-sm sm:text-base md:text-lg">Scrap</div>
            <div className="text-lg sm:text-xl md:text-2xl font-black my-1 sm:my-2 text-[#313131]">{curScrap}</div>
            <div className="flex justify-center gap-2">
              <button
                className="btn btn-sm px-2 sm:px-3"
                onClick={() => updateHeroFunc({ scrap: Math.max(0, curScrap - 1) })}
                disabled={curScrap <= 0}
              >
                -1
              </button>
              <button
                className="btn btn-sm px-2 sm:px-3"
                onClick={() => updateHeroFunc({ scrap: curScrap + 1 })}
              >
                +1
              </button>
            </div>
          </div>

          {/* Tech */}
          <div className="flex-1 p-2 sm:p-3 rounded-xl border border-[#0a5a8a] bg-[#e0f3fb] shadow-md text-center">
            <div className="font-bold text-[#0a5a8a] text-sm sm:text-base md:text-lg">Tech</div>
            <div className="text-lg sm:text-xl md:text-2xl font-black my-1 sm:my-2 text-[#145672]">{curTech}</div>
            <div className="flex justify-center gap-2">
              <button
                className="btn btn-sm px-2 sm:px-3"
                onClick={() => updateHeroFunc({ tech: Math.max(0, curTech - 1) })}
                disabled={curTech <= 0}
              >
                -1
              </button>
              <button
                className="btn btn-sm px-2 sm:px-3"
                onClick={() => updateHeroFunc({ tech: curTech + 1 })}
              >
                +1
              </button>
            </div>
          </div>
        </div>

        {/* XP */}
        <div className="flex">
          <div className="flex-1 p-2 sm:p-3 rounded-xl border border-[#8b6b46] bg-[#f5ebd8] shadow-md text-center">
            <div className="font-bold text-[#3b2f1d] text-sm sm:text-base md:text-lg">XP</div>
            <div className="text-lg sm:text-xl md:text-2xl font-black my-1 sm:my-2 text-[#1f1f1f]">{curXP}</div>
            <div className="flex justify-center gap-2">
              <button
                className="btn btn-sm px-2 sm:px-3"
                onClick={() => updateHeroFunc({ xp: Math.max(0, curXP - 5) })}
                disabled={curXP <= 0}
              >
                -5
              </button>
              <button className="btn btn-sm px-2 sm:px-3" onClick={() => updateHeroFunc({ xp: curXP + 5 })}>
                +5
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeHero.mutations?.some((m) => m.name === 'Mutation — Roll Needed') && (
        <div className="mt-6 p-4 rounded-lg bg-red-100 border border-red-500 text-red-800 text-center">
          <strong>Warning:</strong> This hero gained one or more <em>Mutations</em> from
          Corruption overflow.
          <br />
          Please roll once on the <strong>Mutation Chart</strong> for each.
        </div>
      )}
    </div>
  );
}
