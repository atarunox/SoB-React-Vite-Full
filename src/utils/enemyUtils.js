// utils/enemyUtils.js

// Returns the proper Threat Deck array for given hero count
export function getThreatDeckByHeroCount(heroCount, allCards) {
  if (heroCount <= 2) return allCards.low;
  if (heroCount <= 4) return allCards.medium;
  if (heroCount <= 6) return allCards.high;
  return allCards.epic;
}

// Returns the correct enemy stats block based on highest hero level
export function getEnemyVariant(enemy, highestLevel) {
  // Brutal at 5+
  return highestLevel >= 5 ? enemy.stats?.brutal || enemy.stats?.normal : enemy.stats?.normal;
}

// Returns elite/brutal status for a group given full modifiers and rules
export function getEnemyDifficulty({
  heroLevel,
  hasDrifter = false,
  darknessPassed = false,
  growingDreadModifier = 0,
  manualExtraElite = 0,
}) {
  // Official table
  let baseElite = 0;
  let brutal = false;
  if (heroLevel === 3) baseElite = 1;
  else if (heroLevel === 4) baseElite = 2;
  else if (heroLevel === 5 || heroLevel === 6) brutal = true;
  else if (heroLevel === 7) { baseElite = 1; brutal = true; }
  else if (heroLevel === 8) { baseElite = 2; brutal = true; }

  // Modifiers
  if (hasDrifter) baseElite += 1;
  if (darknessPassed) baseElite += 1;
  if (growingDreadModifier) baseElite += growingDreadModifier;
  if (manualExtraElite) baseElite += manualExtraElite;

  return { elite: baseElite, brutal };
}

/**
 * Normalize enemy data from either schema into a flat structure.
 *
 * New schema (westernEnemies):
 *   stats: { normal: { combat, damage, defense, health, xp }, brutal: { ... } }
 *   toHit: { melee: "3+", ranged: null }
 *   eliteAbilities: [...]
 *
 * Old schema (mineEnemies, forestEnemies, etc.):
 *   health, defense, melee: { toHit, damage }, ranged, eliteChart: [...]
 */
export function normalizeEnemyData(enemyData, isBrutal) {
  if (!enemyData) return {};

  const hasNewSchema = enemyData.stats
    && (enemyData.stats.normal !== undefined || enemyData.stats.brutal !== undefined);

  if (!hasNewSchema) return { ...enemyData };

  const preferred = isBrutal ? enemyData.stats.brutal : enemyData.stats.normal;
  const fallback = isBrutal ? enemyData.stats.normal : enemyData.stats.brutal;
  const variant = preferred || fallback || {};

  const normalized = { ...enemyData };

  normalized.combat = variant.combat;
  normalized.damage = variant.damage;
  normalized.defense = variant.defense;
  normalized.health = variant.health;
  normalized.brutal = isBrutal && !!preferred;
  normalized.statVariantMissing = !preferred;

  // Parse xp "10+5" → xp: 10, xpEach: 5
  if (typeof variant.xp === 'string' && variant.xp.includes('+')) {
    const [base, each] = variant.xp.split('+').map(s => s.trim());
    normalized.xp = base;
    normalized.xpEach = each;
  } else {
    normalized.xp = variant.xp;
  }

  // Normalize toHit: { melee, ranged } → melee/ranged objects
  if (enemyData.toHit) {
    normalized.melee = enemyData.toHit.melee
      ? { toHit: enemyData.toHit.melee, damage: variant.damage }
      : null;
    normalized.ranged = enemyData.toHit.ranged
      ? { toHit: enemyData.toHit.ranged, damage: variant.damage }
      : null;
  }

  // Map eliteAbilities → eliteChart
  if (enemyData.eliteAbilities && !enemyData.eliteChart) {
    normalized.eliteChart = enemyData.eliteAbilities;
  }

  return normalized;
}

export default function Placeholder() { return null; }
