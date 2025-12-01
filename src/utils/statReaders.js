// src/utils/statReaders.js
//
// PURE stat readers and calculators used across TownTab, DMTab,
// shop executors, service handlers, and character sheet.
//
// This file contains **NO UI**, **NO townState**, **NO context**,
// and **NO side-effects**.
//
// Everything here is safe, predictable, and reusable.

////////////////////////////////////////////////////////////////////////////////
// Basic Helpers
////////////////////////////////////////////////////////////////////////////////

// Normalize a stat key into consistent internal format
export function normalizeStatName(name = "") {
  return String(name)
    .replace(/[_-]/g, " ")
    .trim()
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
}

// Ensure a value is a usable number
export function safeNumber(x, fallback = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

////////////////////////////////////////////////////////////////////////////////
// Threshold Helpers: "4+", "3+", etc.
////////////////////////////////////////////////////////////////////////////////

// Is something in X+ threshold format?
export function isThresholdString(v) {
  return typeof v === "string" && /^[1-6]\+$/.test(v.trim());
}

// Convert "4+" → 4
export function thresholdToNumber(v) {
  if (!isThresholdString(v)) return null;
  return Number(v[0]);
}

// Convert number → "4+"
export function numberToThreshold(n) {
  const v = safeNumber(n, null);
  if (v === null) return null;
  return `${v}+`;
}

// Choose the *better* threshold. Smaller is better.
// Example: betterThreshold("4+", "5+") → "4+"
export function betterThreshold(a, b) {
  const na = thresholdToNumber(a);
  const nb = thresholdToNumber(b);
  if (na === null && nb === null) return null;
  if (na === null) return b;
  if (nb === null) return a;
  return na <= nb ? a : b;
}

////////////////////////////////////////////////////////////////////////////////
// Stat Bucket Access
////////////////////////////////////////////////////////////////////////////////

// Extract raw base stats from hero. Handles multiple naming styles:
// hero.stats, hero.baseStats, hero.totals, etc.
function getRawBaseStats(hero = {}) {
  if (hero.stats && typeof hero.stats === "object") return hero.stats;
  if (hero.baseStats && typeof hero.baseStats === "object")
    return hero.baseStats;
  if (hero.totals && typeof hero.totals === "object") return hero.totals;
  return {};
}

// Get the starting value of a stat before modifiers
export function getBaseValue(hero, stat) {
  const key = normalizeStatName(stat);
  const raw = getRawBaseStats(hero);
  return safeNumber(raw[key], raw[key] || 0);
}

////////////////////////////////////////////////////////////////////////////////
// Apply Gear Effects
////////////////////////////////////////////////////////////////////////////////

function applyGearModifiers(hero, results) {
  const gear = hero.gear || [];
  for (const item of gear) {
    if (!item?.effects) continue;

    // Example effect formats supported:
    // { Defense: "+1" }, { Cunning: 1 }, { "Spirit Armor": -1 }
    for (const [stat, mod] of Object.entries(item.effects)) {
      const normalized = normalizeStatName(stat);

      // Threshold-style upgrade (e.g., "4+")
      if (isThresholdString(mod)) {
        results[normalized] = betterThreshold(results[normalized], mod);
        continue;
      }

      // Numeric mod
      const n = safeNumber(mod, null);
      if (n !== null) {
        const current = safeNumber(results[normalized], 0);
        results[normalized] = current + n;
      }
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// Apply Skill Effects
////////////////////////////////////////////////////////////////////////////////

function applySkillModifiers(hero, results) {
  const skills = hero.skills || [];
  for (const sk of skills) {
    if (!sk?.effects) continue;
    for (const [stat, mod] of Object.entries(sk.effects)) {
      const normalized = normalizeStatName(stat);

      if (isThresholdString(mod)) {
        results[normalized] = betterThreshold(results[normalized], mod);
        continue;
      }

      const n = safeNumber(mod, null);
      if (n !== null) {
        const current = safeNumber(results[normalized], 0);
        results[normalized] = current + n;
      }
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// Apply Condition Effects (injuries, madness, mutations)
////////////////////////////////////////////////////////////////////////////////

function applyConditionModifiers(hero, results) {
  const all = hero.conditions || {};
  const buckets = Object.values(all).flat();

  for (const c of buckets) {
    if (!c?.effects) continue;

    for (const [stat, mod] of Object.entries(c.effects)) {
      const normalized = normalizeStatName(stat);

      if (isThresholdString(mod)) {
        results[normalized] = betterThreshold(results[normalized], mod);
        continue;
      }

      const n = safeNumber(mod, null);
      if (n !== null) {
        const current = safeNumber(results[normalized], 0);
        results[normalized] = current + n;
      }
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// Derived Stats: Defense, Spirit Armor, Willpower, To-Hit, etc.
////////////////////////////////////////////////////////////////////////////////

// Derived logic that mirrors how calculateCurrentStats works.
// You can expand this later to add new derived stat conversions.

function applyDerivedStats(hero, results) {
  // Armor / Spirit Armor: lower threshold is better
  const armor = results["Armor"];
  const spiritArmor = results["Spirit Armor"];

  if (armor != null && !isThresholdString(armor)) {
    results["Armor"] = numberToThreshold(armor);
  }
  if (spiritArmor != null && !isThresholdString(spiritArmor)) {
    results["Spirit Armor"] = numberToThreshold(spiritArmor);
  }

  // To-Hit conversion: ensure threshold format
  const melee = results["Melee"];
  const ranged = results["Ranged"];

  if (melee != null && !isThresholdString(melee)) {
    results["Melee"] = numberToThreshold(melee);
  }
  if (ranged != null && !isThresholdString(ranged)) {
    results["Ranged"] = numberToThreshold(ranged);
  }

  return results;
}

////////////////////////////////////////////////////////////////////////////////
// Public: getTotals(hero)
////////////////////////////////////////////////////////////////////////////////

export function getTotals(hero = {}) {
  const stats = {};

  // Base
  for (const [key, value] of Object.entries(getRawBaseStats(hero))) {
    const normalized = normalizeStatName(key);
    stats[normalized] = value;
  }

  // Gear
  applyGearModifiers(hero, stats);

  // Skills
  applySkillModifiers(hero, stats);

  // Conditions
  applyConditionModifiers(hero, stats);

  // Derived
  applyDerivedStats(hero, stats);

  return stats;
}

////////////////////////////////////////////////////////////////////////////////
// Public: getStat(hero, name)
////////////////////////////////////////////////////////////////////////////////

export function getStat(hero = {}, statName) {
  const key = normalizeStatName(statName);
  const totals = getTotals(hero);
  return totals[key] ?? null;
}

////////////////////////////////////////////////////////////////////////////////
// Convenience API for external consumers
////////////////////////////////////////////////////////////////////////////////

export default {
  normalizeStatName,
  safeNumber,
  isThresholdString,
  thresholdToNumber,
  numberToThreshold,
  betterThreshold,
  getBaseValue,
  getTotals,
  getStat,
};
