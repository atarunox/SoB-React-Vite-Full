// utils/buildEnemyBonuses.js

export function buildEnemyBonuses(enemy = {}, modifiers = {}, eliteBonuses = []) {
  const bonusTotals = {};

  // 1. Apply elite ability bonuses (assume each is { stat, value })
  eliteBonuses.forEach(elite => {
    if (elite?.stat && typeof elite.value === 'number') {
      bonusTotals[elite.stat] = (bonusTotals[elite.stat] || 0) + elite.value;
    }
  });

  // 2. Apply keyword-based global modifiers
  const allKeywords = [...(enemy.keywords || []), '__ALL__'];
  allKeywords.forEach(keyword => {
    const mods = modifiers.enemyModifiers?.[keyword];
    if (!mods) return;
    Object.entries(mods).forEach(([stat, value]) => {
      bonusTotals[stat] = (bonusTotals[stat] || 0) + value;
    });
  });

  // 3. Optional: apply modifiers from traits, if traits store bonuses like { stat, value }
  (enemy.traits || []).forEach(trait => {
    if (trait?.bonus && trait?.stat) {
      bonusTotals[trait.stat] = (bonusTotals[trait.stat] || 0) + trait.bonus;
    }
  });

  // Done!
  return bonusTotals;
}

export default function Placeholder() { return null; }
