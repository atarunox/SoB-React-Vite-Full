// src/components/DM/assignConditionsToHero.jsx

/**
 * Append a condition to a hero immutably.
 * @param {object} hero - current hero object
 * @param {object|string} condition - either a string ("Injury") or
 *   an object like { type, result, effect, roll, at }
 * @returns {object} new hero object with updated conditions
 */
export function assignConditionToHero(hero = {}, condition) {
  const existing = Array.isArray(hero.conditions) ? hero.conditions : [];

  // Normalize input condition to a consistent shape
  const normalized =
    typeof condition === "string"
      ? { type: condition, at: Date.now() }
      : {
          type: condition?.type ?? "Condition",
          result: condition?.result ?? condition?.name ?? undefined,
          effect: condition?.effect ?? undefined,
          roll: typeof condition?.roll === "number" ? condition.roll : undefined,
          at: condition?.at ?? Date.now(),
        };

  // Guard against empty or invalid
  if (!normalized.type) return { ...hero };

  // Prevent identical duplicates
  const isDuplicate = existing.some(
    (c) =>
      c.type === normalized.type &&
      (c.result ?? "") === (normalized.result ?? "") &&
      (c.effect ?? "") === (normalized.effect ?? "") &&
      (c.roll ?? null) === (normalized.roll ?? null)
  );
  if (isDuplicate) return { ...hero, conditions: existing };

  return {
    ...hero,
    conditions: [...existing, normalized],
  };
}
