// utils/parsePlusStat.js

/**
 * Parses a string like "4+" and applies a modifier to it.
 * A modifier of -1 makes "4+" into "3+", etc.
 */
export function applyPlusModifier(plusStr, modifier) {
  const match = /^([1-9])\+$/.exec(plusStr);
  if (!match) return plusStr; // Fallback to original if not matchable

  const original = parseInt(match[1], 10);
  const modified = original - modifier; // Subtracting because lower is better (e.g., 3+ is better than 4+)

  // Clamp between 2 and 6
  const clamped = Math.max(2, Math.min(6, modified));
  return `${clamped}+`;
}

/**
 * Optional helper if you want to compare numeric values from string like "4+"
 */
export function parsePlusStat(plusStr) {
  const match = /^([1-9])\+$/.exec(plusStr);
  return match ? parseInt(match[1], 10) : null;
}

export default function Placeholder() { return null; }
