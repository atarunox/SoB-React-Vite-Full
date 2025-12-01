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

export default function Placeholder() { return null; }
