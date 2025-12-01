// src/utils/diceHelpers.js
import { loadTownState } from './townState';

/* ---------------- Basic dice helpers ---------------- */
export const rollD6 = () => Math.floor(Math.random() * 6) + 1;
export const rollND = (n, s = 6) => Array.from({ length: n }, () => Math.floor(Math.random() * s) + 1);
export const sum = (arr) => arr.reduce((a, b) => a + b, 0);

/* ---------------- NEW: true D3 ---------------- */
export const rollD3 = () => Math.ceil((Math.floor(Math.random() * 6) + 1) / 2);

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
