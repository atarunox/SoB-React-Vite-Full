// src/utils/statusMarkers.js
//
// Status marker tracking for Shadows of Brimstone.
// Handles Bleeding, Snare, Poison, Noise, and other combat markers
// that enemies can inflict on heroes during combat.
//
// Markers are stored on hero.markers = { bleeding: 0, snare: 0, poison: 0, noise: 0, ... }

/* ==================== Marker Definitions ==================== */

/**
 * All recognized marker types and their rules.
 */
export const MARKER_TYPES = {
  bleeding: {
    name: 'Bleeding',
    description: 'At the start of each activation, suffer 1 Wound per Bleeding marker (ignores Defense/Armor).',
    applyAtActivation: true,
    effect: 'wound',
  },
  poison: {
    name: 'Poison',
    description: 'At the start of each activation, roll D6 per Poison token. On 1-3, suffer 1 Wound (ignores Defense/Armor). On 4+, remove the token.',
    applyAtActivation: true,
    effect: 'poison',
  },
  snare: {
    name: 'Snare',
    description: 'Hero must pass a Strength test at the start of their activation to act. Failure means losing that activation.',
    applyAtActivation: true,
    effect: 'immobilize',
  },
  noise: {
    name: 'Noise',
    description: 'Increases the chance of ambush. During Growing Dread, add +1 to the roll per Noise marker on the party.',
    applyAtDread: true,
    effect: 'dread',
  },
  fire: {
    name: 'Fire',
    description: 'At the start of each activation, suffer D6 Wounds (ignores Defense). Roll D6: on 4+, the fire goes out.',
    applyAtActivation: true,
    effect: 'fire',
  },
  web: {
    name: 'Web',
    description: 'Hero cannot move until freed. Pass Strength 5+ to escape, or another hero in the same space can free you.',
    applyAtActivation: true,
    effect: 'immobilize',
  },
};

/* ==================== Marker Management ==================== */

/**
 * Get current marker count for a hero.
 * @param {object} hero - Hero object
 * @param {string} type - Marker type key (e.g., 'bleeding', 'poison')
 * @returns {number}
 */
export function getMarkerCount(hero, type) {
  return Number(hero?.markers?.[type]) || 0;
}

/**
 * Get all markers for a hero as { type, count, definition } entries.
 * @param {object} hero
 * @returns {Array<{ type: string, count: number, definition: object }>}
 */
export function getAllMarkers(hero) {
  const markers = hero?.markers;
  if (!markers || typeof markers !== 'object') return [];
  return Object.entries(markers)
    .filter(([, count]) => Number(count) > 0)
    .map(([type, count]) => ({
      type,
      count: Number(count),
      definition: MARKER_TYPES[type] || { name: type, description: 'Unknown marker.' },
    }));
}

/**
 * Add markers to a hero. Returns an updater function for use with updateHero.
 * @param {string} type  - Marker type key
 * @param {number} count - Number to add (default 1)
 * @returns {function} Updater: (hero) => patchedHero
 */
export function addMarkerUpdater(type, count = 1) {
  return (h) => ({
    ...h,
    markers: {
      ...(h.markers || {}),
      [type]: Math.max(0, (Number(h.markers?.[type]) || 0) + Math.abs(count)),
    },
  });
}

/**
 * Remove markers from a hero. Returns an updater function.
 * @param {string} type  - Marker type key
 * @param {number} count - Number to remove (default 1). Pass Infinity to clear all.
 * @returns {function} Updater: (hero) => patchedHero
 */
export function removeMarkerUpdater(type, count = 1) {
  return (h) => ({
    ...h,
    markers: {
      ...(h.markers || {}),
      [type]: Math.max(0, (Number(h.markers?.[type]) || 0) - (count === Infinity ? Infinity : Math.abs(count))),
    },
  });
}

/**
 * Clear all markers of a given type. Returns an updater function.
 * @param {string} type
 * @returns {function}
 */
export function clearMarkerUpdater(type) {
  return removeMarkerUpdater(type, Infinity);
}

/**
 * Clear ALL markers (all types). Returns an updater function.
 * @returns {function}
 */
export function clearAllMarkersUpdater() {
  return (h) => ({
    ...h,
    markers: {},
  });
}


/* ==================== Activation-Phase Marker Resolution ==================== */

/**
 * Resolve all start-of-activation marker effects for a hero.
 * Call this at the beginning of a hero's activation during combat.
 *
 * @param {object} opts
 * @param {object}   opts.ui         - UI callbacks: { roll, promptNumber, promptChoice, toast }
 * @param {object}   opts.hero       - Hero object
 * @param {function} opts.getStat    - (hero, statName) => value
 * @param {function} opts.updateHero - (heroId, patchOrFn) => void
 * @param {string}   opts.heroId
 *
 * @returns {object} { wounds, lostActivation, markersRemoved, log }
 */
export async function resolveActivationMarkers({ ui, hero, getStat, updateHero, heroId }) {
  const log = [];
  let totalWounds = 0;
  let lostActivation = false;
  const markersRemoved = {};

  const markers = getAllMarkers(hero);
  if (markers.length === 0) return { wounds: 0, lostActivation: false, markersRemoved: {}, log };

  log.push(`Start of Activation — resolving markers: ${markers.map(m => `${m.count}× ${m.definition.name}`).join(', ')}`);

  for (const m of markers) {
    const { type, count, definition } = m;

    switch (definition.effect) {
      case 'wound': {
        // Bleeding: 1 Wound per marker, ignores Defense/Armor
        const wounds = count;
        totalWounds += wounds;
        log.push(`${definition.name}: ${count} marker(s) → ${wounds} Wound(s) (ignores Defense/Armor).`);
        break;
      }

      case 'poison': {
        // Poison: roll D6 per token. 1-3 = 1 wound, 4+ = remove token
        let poisonWounds = 0;
        let removed = 0;
        const rolls = await ui.roll(count, 6, `Poison — ${count}d6 (1-3: Wound, 4+: remove token)`);
        const arr = Array.isArray(rolls) ? rolls : [rolls];
        for (const r of arr) {
          if (r <= 3) {
            poisonWounds += 1;
          } else {
            removed += 1;
          }
        }
        totalWounds += poisonWounds;
        if (removed > 0) {
          markersRemoved.poison = (markersRemoved.poison || 0) + removed;
          if (typeof updateHero === 'function' && heroId) {
            updateHero(heroId, removeMarkerUpdater('poison', removed));
          }
        }
        log.push(`Poison: Rolled [${arr.join(', ')}] → ${poisonWounds} Wound(s), ${removed} token(s) removed.`);
        break;
      }

      case 'fire': {
        // Fire: D6 Wounds, then 4+ = fire goes out
        const dmgRoll = (await ui.roll(1, 6, 'Fire Damage — D6'))?.[0] ?? 1;
        totalWounds += dmgRoll;
        const extRoll = (await ui.roll(1, 6, 'Fire Extinguish — D6 (4+ = out)'))?.[0] ?? 1;
        if (extRoll >= 4) {
          markersRemoved.fire = count;
          if (typeof updateHero === 'function' && heroId) {
            updateHero(heroId, clearMarkerUpdater('fire'));
          }
          log.push(`Fire: ${dmgRoll} Wound(s). Extinguish roll: ${extRoll} — fire goes out!`);
        } else {
          log.push(`Fire: ${dmgRoll} Wound(s). Extinguish roll: ${extRoll} — still burning.`);
        }
        break;
      }

      case 'immobilize': {
        // Snare/Web: Strength test to escape
        if (type === 'snare' || type === 'web') {
          const statTarget = type === 'web' ? 5 : 4;
          const statName = 'Strength';

          // Simple single-die check here; full skill checks handled elsewhere
          const testRoll = (await ui.roll(1, 6, `${definition.name} Escape — ${statName} ${statTarget}+ test`))?.[0] ?? 1;
          if (testRoll >= statTarget) {
            markersRemoved[type] = count;
            if (typeof updateHero === 'function' && heroId) {
              updateHero(heroId, clearMarkerUpdater(type));
            }
            log.push(`${definition.name}: Escape roll ${testRoll} — FREED!`);
          } else {
            lostActivation = true;
            log.push(`${definition.name}: Escape roll ${testRoll} — FAILED. Hero loses this activation.`);
          }
        }
        break;
      }

      default:
        // Unknown/informational markers (noise, etc.) — no activation effect
        break;
    }
  }

  if (totalWounds > 0) {
    log.push(`Total marker wounds this activation: ${totalWounds}`);
    await ui.toast?.(`Markers dealt ${totalWounds} wound(s)!`);
  }

  return { wounds: totalWounds, lostActivation, markersRemoved, log };
}
