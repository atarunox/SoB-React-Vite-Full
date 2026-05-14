// src/utils/calculateStats.js
import { flattenConditions } from './mergeConditions';

// Treat Empty Slot etc as non-items
const isPlaceholder = (it) =>
  !it ||
  it.name === 'Empty Slot' ||
  /^empty-/i.test(String(it?.id || ''));

const toNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

// Canonicalize stat keys so "melee", "Melee To-Hit", "spiritarmor" etc line up
const canonStatKey = (raw = '') => {
  const s = String(raw).trim();
  const low = s.toLowerCase();
  const compact = low.replace(/[\s_-]+/g, '');

  // Common aliases / compact forms
  if (compact === 'melee' || compact === 'meleetohit') return 'Melee To-Hit';
  if (compact === 'ranged' || compact === 'rangedtohit') return 'Ranged To-Hit';
  if (compact === 'spiritarmor') return 'Spirit Armor';
  if (compact === 'maxcorruption') return 'Max Corruption';

  // Fallback: title-case words
  return s
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
};

// Threshold stats (X+ style, lower is better)
const THRESH_KEYS = new Set([
  'Melee To-Hit',
  'Ranged To-Hit',
  'Defense',
  'Willpower',
  'Armor',
  'Spirit Armor',
]);

// Default thresholds if we have nothing else
const defaultThresholds = {
  'Melee To-Hit': '4+',
  'Ranged To-Hit': '4+',
  Defense: '4+',
  Willpower: '5+',
  Armor: '—',
  'Spirit Armor': '—',
};

// Base stats merged from hero + hero.stats
function mergeBaseStats(hero = {}) {
  const s = hero.stats || {};

  const base = {
    // Core 6
    Agility: s.Agility ?? s.agility ?? 2,
    Cunning: s.Cunning ?? s.cunning ?? 2,
    Spirit: s.Spirit ?? s.spirit ?? 2,
    Strength: s.Strength ?? s.strength ?? 2,
    Lore: s.Lore ?? s.lore ?? 2,
    Luck: s.Luck ?? s.luck ?? 2,

    // Initiative / Move / Combat
    Initiative: s.Initiative ?? s.initiative ?? hero.initiative ?? 4,
    Move: s.Move ?? s.move ?? hero.move ?? 0,
    Combat: s.Combat ?? s.combat ?? hero.combat ?? 1,

    // Pools
    Health:
      hero.maxHealth ??
      hero.health ??
      s.Health ??
      s.health ??
      0,
    Sanity:
      hero.maxSanity ??
      hero.sanity ??
      s.Sanity ??
      s.sanity ??
      0,
    Grit: hero.maxGrit ?? s.Grit ?? s.grit ?? 0,

    // Max Corruption (numeric)
    'Max Corruption':
      hero.maxCorruption ??
      s['Max Corruption'] ??
      s.MaxCorruption ??
      5,
  };

  // Threshold-type stats (X+ format)
  base['Melee To-Hit'] =
    hero.toHit?.melee ??
    s['Melee To-Hit'] ??
    s.melee ??
    defaultThresholds['Melee To-Hit'];

  base['Ranged To-Hit'] =
    hero.toHit?.ranged ??
    s['Ranged To-Hit'] ??
    s.ranged ??
    defaultThresholds['Ranged To-Hit'];

  base.Defense =
    s.Defense ??
    s.defense ??
    hero.defense ??
    defaultThresholds.Defense;

  base.Willpower =
    s.Willpower ??
    s.willpower ??
    hero.willpower ??
    defaultThresholds.Willpower;

  base.Armor =
    s.Armor ??
    s.armor ??
    hero.armor ??
    defaultThresholds.Armor;

  base['Spirit Armor'] =
    s['Spirit Armor'] ??
    s.spiritArmor ??
    hero.spiritArmor ??
    defaultThresholds['Spirit Armor'];

  return base;
}

// Parse ["Armor +1", "Defense -1"] style arrays into { Armor: 1, Defense: -1 }
function parseEffectsList(effects = []) {
  const out = {};
  if (!Array.isArray(effects)) return out;

  for (const line of effects) {
    if (!line || typeof line !== 'string') continue;
    // e.g. "Armor +1", "Melee To-Hit +1"
    const m = line.match(/^\s*(.+?)\s*([+-]\d+)\s*$/);
    if (!m) continue;
    const stat = canonStatKey(m[1]);
    const delta = parseInt(m[2], 10);
    if (!Number.isFinite(delta)) continue;
    out[stat] = (out[stat] || 0) + delta;
  }

  return out;
}

function addMod(bucket, rawKey, delta) {
  const key = canonStatKey(rawKey);

  // Handle threshold string values like '5+' for Armor / Spirit Armor etc.
  if (typeof delta === 'string' && /^\d+\+$/.test(delta.trim())) {
    const newThresh = parseInt(delta, 10);
    const existing = bucket[key];
    if (typeof existing === 'string' && /^\d+\+$/.test(existing)) {
      // Keep the better (lower number) threshold
      const exNum = parseInt(existing, 10);
      if (newThresh < exNum) bucket[key] = delta.trim();
    } else {
      bucket[key] = delta.trim();
    }
    return;
  }

  const v = toNumber(delta, 0);
  if (!v) return;
  // Don't overwrite a threshold string with a numeric delta
  const existing = bucket[key];
  if (typeof existing === 'string' && /^\d+\+$/.test(existing)) return;
  bucket[key] = (toNumber(existing, 0)) + v;
}

/* ---------------------- collectors: gear/skills/conditions ---------------------- */

function collectGearMods(gearObj = {}) {
  const bucket = {};
  for (const it of Object.values(gearObj || {})) {
    if (!it || isPlaceholder(it)) continue;

    // Explicit mods object (preferred)
    if (it.mods && typeof it.mods === 'object' && !Array.isArray(it.mods)) {
      for (const [k, v] of Object.entries(it.mods)) {
        addMod(bucket, k, v);
      }
    }

    // effects as array of strings
    if (Array.isArray(it.effects)) {
      const eff = parseEffectsList(it.effects);
      for (const [k, v] of Object.entries(eff)) {
        addMod(bucket, k, v);
      }
    }

    // effects as object { Stat: +1, ... }
    if (it.effects && !Array.isArray(it.effects) && typeof it.effects === 'object') {
      for (const [k, v] of Object.entries(it.effects)) {
        addMod(bucket, k, v);
      }
    }
  }
  return bucket;
}

function collectSkillMods(hero = {}) {
  const bucket = {};
  const list = Array.isArray(hero.upgradeTree) ? hero.upgradeTree : [];

  for (const skill of list) {
    if (!skill || typeof skill !== 'object') continue;

    if (skill.mods && typeof skill.mods === 'object' && !Array.isArray(skill.mods)) {
      for (const [k, v] of Object.entries(skill.mods)) {
        addMod(bucket, k, v);
      }
    }

    if (Array.isArray(skill.effects)) {
      const eff = parseEffectsList(skill.effects);
      for (const [k, v] of Object.entries(eff)) {
        addMod(bucket, k, v);
      }
    }

    if (skill.effects && !Array.isArray(skill.effects) && typeof skill.effects === 'object') {
      for (const [k, v] of Object.entries(skill.effects)) {
        addMod(bucket, k, v);
      }
    }
  }

  return bucket;
}

function collectConditionMods(hero = {}) {
  const bucket = {};
  let list = [];

  // New bucketed conditions object
  if (hero.conditions) {
    if (Array.isArray(hero.conditions)) {
      list = list.concat(hero.conditions);
    } else {
      // Flatten { injury:[], madness:[], ... } into one list
      try {
        list = list.concat(
          flattenConditions(hero.conditions, { includeRemoved: false })
        );
      } catch {
        // ignore
      }
    }
  }

  // Legacy arrays (injury/madness/mutations top-level)
  const extraArrays = [
    hero.injury,
    hero.injuries,
    hero.madness,
    hero.mutation,
    hero.mutations,
  ];
  for (const arr of extraArrays) {
    if (Array.isArray(arr)) list = list.concat(arr);
  }

  // Extra keys that may hold numeric stat deltas on a condition
  const COND_MOD_KEYS = [
    'modifiers',
    'statMods',
    'statModifiers',
    'statChanges',
    'stat_changes',
    'stats',
  ];

  for (const c of list) {
    if (!c || typeof c !== 'object') continue;
    if (c.removed || c.active === false) continue;

    // Explicit mods
    if (c.mods && typeof c.mods === 'object' && !Array.isArray(c.mods)) {
      for (const [k, v] of Object.entries(c.mods)) {
        addMod(bucket, k, v);
      }
    }

    // Other possible mod containers
    for (const key of COND_MOD_KEYS) {
      if (c[key] && typeof c[key] === 'object' && !Array.isArray(c[key])) {
        for (const [k, v] of Object.entries(c[key])) {
          addMod(bucket, k, v);
        }
      }
    }

    // effects as array of strings
    if (Array.isArray(c.effects)) {
      const eff = parseEffectsList(c.effects);
      for (const [k, v] of Object.entries(eff)) {
        addMod(bucket, k, v);
      }
    }

    // effects as object { Stat: +1, ... }
    if (c.effects && !Array.isArray(c.effects) && typeof c.effects === 'object') {
      for (const [k, v] of Object.entries(c.effects)) {
        addMod(bucket, k, v);
      }
    }
  }

  return bucket;
}

/* --------------------------- apply deltas onto base --------------------------- */

function applyDeltas(base, { gear = {}, skills = {}, conditions = {} }) {
  const out = { ...base };

  const buckets = [
    { name: 'gear', data: gear },
    { name: 'skills', data: skills },
    { name: 'conditions', data: conditions },
  ];

  const parseThreshNum = (txt) => {
    if (typeof txt !== 'string') return null;
    const m = txt.trim().match(/^(\d+)\+$/);
    if (!m) return null;
    return Number(m[1]);
  };

  for (const { data } of buckets) {
    for (const [rawKey, rawVal] of Object.entries(data || {})) {
      const key = canonStatKey(rawKey);
      const v = toNumber(rawVal, 0);

      if (THRESH_KEYS.has(key)) {
        // Check if rawVal is an absolute threshold string like '5+'
        const rawThresh = parseThreshNum(typeof rawVal === 'string' ? rawVal : '');

        const current = out[key] ?? defaultThresholds[key] ?? '—';
        const curText = typeof current === 'string' ? current : String(current);
        const curNum = parseThreshNum(curText);

        if (rawThresh != null) {
          // Absolute threshold from gear/skill/condition (e.g. Armor '5+')
          // Take the better (lower number) of current and new
          if (curNum != null) {
            out[key] = `${Math.min(curNum, rawThresh)}+`;
          } else {
            out[key] = `${rawThresh}+`;
          }
        } else if (curNum != null) {
          // v is a delta: +1 makes 4+ -> 3+
          const improved = Math.max(2, curNum - v);
          out[key] = `${improved}+`;
        } else {
          // No base threshold yet.
          if (Number.isFinite(v) && v >= 2 && v <= 6) {
            // Treat as an absolute threshold (e.g. Armor: 4 => "4+")
            out[key] = `${v}+`;
          } else if (Number.isFinite(v) && v !== 0) {
            // Treat as improvement from a 6+ worst-case base
            const improved = Math.max(2, 6 - v);
            out[key] = `${improved}+`;
          } else if (typeof rawVal === 'string') {
            out[key] = rawVal;
          }
        }
      } else {
        // Normal numeric stat: add deltas
        const cur = toNumber(out[key], 0);
        out[key] = cur + v;
      }
    }
  }

  return out;
}

/* ----------------------------- public entry point ---------------------------- */

// Backwards-compatible calculateCurrentStats:
// - Returns a flat object with stat totals: result.Defense, result.Armor, etc.
// - Also provides result.stats (same map) and result.breakdown (base/gear/skills/conditions).
export function calculateCurrentStats(hero = {}) {
  const base = mergeBaseStats(hero);
  const gear = collectGearMods(hero.gear || {});
  const skills = collectSkillMods(hero);
  const conditions = collectConditionMods(hero);

  const stats = applyDeltas(base, { gear, skills, conditions });
stats.CurrentGrit = hero.currentGrit ?? stats.Grit;

  const breakdown = { base, gear, skills, conditions };

  // Make it usable both as "totals map" and as { stats, breakdown }
  const result = {
    ...stats,
    stats,
    breakdown,
  };

  return result;
}

export default calculateCurrentStats;
