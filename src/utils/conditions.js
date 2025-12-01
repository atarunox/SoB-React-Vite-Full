// src/utils/conditions.js
//
// Normalizers and updaters for Conditions (Madness, Injury, Mutation).

export function normalizeMadnessEntry(m) {
  // Make old entries compatible with the new flow.
  return {
    type: 'madness',
    removed: false,
    permanentBlocked: false,
    active: true,
    ...m,
  };
}

export function normalizeHeroConditions(hero) {
  const h = hero || {};
  const cond = h.conditions || {};
  const madness = Array.isArray(cond.madness) ? cond.madness.map(normalizeMadnessEntry) : [];
  return {
    ...h,
    conditions: {
      ...cond,
      madness,
    },
  };
}

/**
 * Apply an Exorcism result to a hero's selected Madness entry.
 * @param {object} hero - current hero object
 * @param {string|number} targetKey - index or an id/name that matches the target madness
 * @param {number} roll - D6 roll (can be 6+)
 * @returns updated hero
 */
export function applyExorcismResult(hero, targetKey, roll) {
  const h = normalizeHeroConditions(hero);
  const arr = h.conditions.madness.slice();

  const idx = resolveMadnessIndex(arr, targetKey);
  if (idx < 0) return h; // nothing to do

  const entry = { ...arr[idx] };

  if (roll <= 0 || Number.isNaN(roll)) return h; // invalid roll

  if (roll === 1) {
    // Dead! — in our UX this means Exorcism fails so badly it permanently blocks
    // future church exorcisms for this Madness (per your spec).
    entry.permanentBlocked = true;
    // keep it active (still harmful), but can't be exorcised at church anymore
  } else if (roll === 2 || roll === 3) {
    // Failed (half refund handled by caller); no change to madness
  } else if (roll === 4 || roll === 5) {
    // Success! — Madness is healed
    entry.removed = true;
    entry.active = false;
  } else if (roll >= 6) {
    // 6+ Mental Resolve — Healed, and +2 Max Sanity (handled here for convenience)
    entry.removed = true;
    entry.active = false;
    const currentMaxSan = Number(h?.stats?.maxSanity ?? h?.maxSanity ?? 0);
    // Prefer nested stats if present
    if (h.stats && typeof h.stats === 'object') {
      h.stats = { ...h.stats, maxSanity: currentMaxSan + 2 };
    } else {
      h.maxSanity = currentMaxSan + 2;
    }
  }

  arr[idx] = entry;
  return {
    ...h,
    conditions: {
      ...h.conditions,
      madness: arr,
    },
  };
}

function resolveMadnessIndex(arr, key) {
  if (typeof key === 'number') return key >= 0 && key < arr.length ? key : -1;
  if (!key) return -1;
  const k = String(key).toLowerCase();
  return arr.findIndex(m => {
    const id = (m.id ?? '').toString().toLowerCase();
    const name = (m.name ?? '').toString().toLowerCase();
    return id === k || name === k;
  });
}
