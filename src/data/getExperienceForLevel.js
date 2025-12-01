/**
 * Returns the XP requirement to advance from the given level to the next.
 * Special rules:
 * - "Drifter" class pays double the base cost.
 * - "Trederran Veteran" with faction "kharkarus_konfederacy" adds +100×current level.
 *
 * @param {number} level - Current hero level (1–7).
 * @param {string} heroClass - Class name of the hero (e.g. "Drifter", "Trederran Veteran").
 * @param {string} [faction] - Optional faction key (e.g. "kharkarus_konfederacy").
 * @returns {number} XP required to reach level+1.
 */
const BASE_XP = {
  1: 500,
  2: 1000,
  3: 2000,
  4: 3000,
  5: 4500,
  6: 6000,
  7: 8000
};

export default function getExperienceForLevel(level, heroClass, faction) {
  const base = BASE_XP[level] || 0;
  let xp = base;

  // Drifter: always double cost
  if (heroClass === 'Drifter') {
    xp = base * 2;
  }

  // Trederran Veteran + Kharkarus Konfederacy: add 100 × level
  if (
    heroClass === 'Trederran Veteran' &&
    faction === 'kharkarus_konfederacy'
  ) {
    xp = base + (100 * level);
  }

  return xp;
}