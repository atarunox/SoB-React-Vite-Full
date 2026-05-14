// src/utils/diceHelpers.js
// Consolidated dice & math utilities — import from here instead of redefining locally.
import { loadTownState } from './townState';

/* ---------------- Basic dice helpers ---------------- */
export const d6 = () => Math.floor(Math.random() * 6) + 1;
export const rollD6 = d6;
export const d3 = () => Math.ceil(d6() / 2);
export const rollD3 = d3;
export const rollND = (n, s = 6) => Array.from({ length: n }, () => Math.floor(Math.random() * s) + 1);
export const sum = (arr) => (Array.isArray(arr) ? arr.reduce((a, b) => a + b, 0) : 0);

/* ---------------- 2d6 helpers ---------------- */
export const roll2d6 = () => d6() + d6();
export const idxFrom2d6 = (roll) => Math.max(0, Math.min(10, (roll ?? 2) - 2));

/* ---------------- Clamp helpers ---------------- */
export const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
export const clamp2to12 = (n) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return null;
  return Math.max(2, Math.min(12, Math.floor(v)));
};
export const clampFloor = (v, floor) => (floor == null ? v : Math.max(floor, v));

/* ---------------- Peril die: 3,3,4,4,5,6 ---------------- */
/**
 * Peril die distribution is fixed: [3,3,4,4,5,6].
 * This returns one of those faces with equal 1/6 probability.
 */
export function rollPeril() {
  const faces = [3, 3, 4, 4, 5, 6];
  return faces[Math.floor(Math.random() * faces.length)];
}

/* ---------------- Reroll flex (±1) helpers ---------------- */
/**
 * Apply ±1 flex to a rerolled die result when the global rule flag is on.
 *
 * Backward compatible signature:
 *   applyRerollFlex(result, isReroll)
 *
 * Enhanced usage (optional):
 *   applyRerollFlex(result, isReroll, {
 *     dieSides?: number,             // default 6
 *     target?: number | null,        // if provided, auto-bias toward meeting/exceeding target
 *     prefer?: 'up'|'down'|'auto',   // default 'auto' (use target if present)
 *     chooser?: (opts) => Promise<-1|0|1> | (-1|0|1), // UI hook to ask player
 *   })
 */
export function applyRerollFlex(result, isReroll, opts = {}) {
  if (!isReroll) return result;

  const flag = !!loadTownState().globalRules?.rerollFlexPlusMinus1;
  if (!flag) return result;

  const {
    dieSides = 6,
    target = null,
    prefer = 'auto',
    chooser = null,
  } = opts || {};

  const clamp = (n) => Math.max(1, Math.min(dieSides, n));
  const can = (adj) => {
    const v = result + adj;
    return v >= 1 && v <= dieSides;
  };

  if (typeof chooser === 'function') {
    try {
      const choice = chooser({
        result,
        dieSides,
        target,
        allowed: [-1, 0, 1].filter(can),
      });
      if (choice && typeof choice.then === 'function') {
        // If awaited elsewhere, fine; otherwise we fall through to auto logic.
      } else if (choice === -1 || choice === 0 || choice === 1) {
        return clamp(result + (can(choice) ? choice : 0));
      }
    } catch {}
  }

  if (typeof target === 'number' && Number.isFinite(target)) {
    if (result < target && can(1)) return clamp(result + 1);
    if (result > target && can(-1)) return clamp(result - 1);
    return result;
  }

  if (prefer === 'up' && can(1)) return clamp(result + 1);
  if (prefer === 'down' && can(-1)) return clamp(result - 1);
  return result;
}

/**
 * Async variant that truly awaits a UI chooser if provided.
 */
/**
 * Offer the player a chance to spend Grit to reroll dice from a skill check.
 * Returns { rolls, rerolled } where rolls is the (possibly updated) array
 * and rerolled is true if a grit was spent.
 *
 * @param {number[]} rolls     - The original dice results
 * @param {object}   hero      - Hero object (needs currentGrit/grit)
 * @param {object}   opts
 * @param {Function} opts.promptChoice - async (title, options) => index
 * @param {Function} opts.updateHero   - (id, patchOrFn) => void
 * @param {string}   opts.heroId       - Hero ID for updateHero
 * @param {number}   [opts.sides=6]    - Die sides (default 6)
 */
export async function offerGritReroll(rolls, hero, { promptChoice, updateHero, heroId, sides = 6 } = {}) {
  if (!rolls || !rolls.length || !hero || typeof promptChoice !== 'function') {
    return { rolls, rerolled: false };
  }

  const curGrit = Number(hero.currentGrit ?? hero.grit ?? 0);
  if (curGrit <= 0) return { rolls, rerolled: false };

  // Ask if they want to spend a grit
  const spendIdx = await promptChoice(
    `Spend a Grit to reroll?\nCurrent Grit: ${curGrit}\n\nDice: [${rolls.join(', ')}]`,
    [{ label: 'Yes — spend 1 Grit to reroll' }, { label: 'No — keep these dice' }]
  );

  if (spendIdx !== 0) return { rolls, rerolled: false };

  // Build options for which dice to reroll
  const diceOptions = rolls.map((v, i) => ({ label: `Die ${i + 1}: [${v}]` }));
  diceOptions.push({ label: 'Reroll ALL dice' });

  const pickIdx = await promptChoice(
    'Which die to reroll? (pick one, or reroll all)',
    diceOptions
  );

  if (pickIdx < 0) return { rolls, rerolled: false };

  const newRolls = [...rolls];
  if (pickIdx === rolls.length) {
    // Reroll all
    for (let i = 0; i < newRolls.length; i++) {
      newRolls[i] = Math.floor(Math.random() * sides) + 1;
    }
  } else if (pickIdx >= 0 && pickIdx < rolls.length) {
    // Reroll single die
    newRolls[pickIdx] = Math.floor(Math.random() * sides) + 1;
  }

  // Deduct grit
  const newGrit = Math.max(0, curGrit - 1);
  if (typeof updateHero === 'function' && heroId) {
    updateHero(heroId, (h) => ({ ...h, currentGrit: newGrit }));
  }

  return { rolls: newRolls, rerolled: true };
}

export async function applyRerollFlexAsync(result, isReroll, opts = {}) {
  if (!isReroll) return result;

  const flag = !!loadTownState().globalRules?.rerollFlexPlusMinus1;
  if (!flag) return result;

  const {
    dieSides = 6,
    target = null,
    prefer = 'auto',
    chooser = null,
  } = opts || {};

  const clamp = (n) => Math.max(1, Math.min(dieSides, n));
  const can = (adj) => {
    const v = result + adj;
    return v >= 1 && v <= dieSides;
  };

  if (typeof chooser === 'function') {
    try {
      const allowed = [-1, 0, 1].filter(can);
      const choice = await chooser({ result, dieSides, target, allowed });
      if (choice === -1 || choice === 0 || choice === 1) {
        return clamp(result + (can(choice) ? choice : 0));
      }
    } catch {}
  }

  if (typeof target === 'number' && Number.isFinite(target)) {
    if (result < target && can(1)) return clamp(result + 1);
    if (result > target && can(-1)) return clamp(result - 1);
    return result;
  }

  if (prefer === 'up' && can(1)) return clamp(result + 1);
  if (prefer === 'down' && can(-1)) return clamp(result - 1);
  return result;
}
