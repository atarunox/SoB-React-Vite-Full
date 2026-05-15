// src/utils/levelingUtils.js

export const XP_THRESHOLDS = [null, null, 500, 1000, 2000, 3000, 4500, 6000, 8000];

export function isDrifter(hero) {
  return /drifter/i.test(hero?.heroClass || hero?.class || '');
}

export function xpForLevel(targetLevel, hero) {
  const base = XP_THRESHOLDS[targetLevel] ?? null;
  if (base === null) return null;
  return isDrifter(hero) ? base * 2 : base;
}

export function getNextLevelXP(hero) {
  const level = Number(hero?.level ?? 1);
  const nextLevel = level + 1;
  if (nextLevel > 8) return null;
  return xpForLevel(nextLevel, hero);
}

export function canLevelUp(hero) {
  const nextXP = getNextLevelXP(hero);
  if (nextXP === null) return false;
  return Number(hero?.xp ?? 0) >= nextXP;
}
