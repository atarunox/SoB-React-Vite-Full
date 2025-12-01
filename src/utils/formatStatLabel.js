/**
 * Turn a stat key into a human-readable label.
 * E.g. "SpiritArmor" → "Spirit Armor", "grit" → "Grit", etc.
 */
export default function formatStatLabel(label) {
  // If already contains a space, just capitalize each word
  if (label.includes(' ')) {
    return label
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  // Insert spaces before capitals, then capitalize first letter
  const withSpaces = label
    .replace(/([A-Z])/g, ' $1')   // e.g. "SpiritArmor" → "Spirit Armor"
    .trim();
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}
