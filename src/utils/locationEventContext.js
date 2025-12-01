// src/utils/locationEventContext.js

import { getLocationEvents } from '../data/townLocations/index.js';

/**
 * Build a context for Town Event handlers.
 * Exposes `io` methods the handlers expect (roll/test/selectChoice/notify/...),
 * wired to your UI prompt functions from TownTab.
 */
export function makeLocEventCtx({ posseApi = {}, uiApi = {}, townStateApi = null } = {}) {

  // --- Posse helpers (safe fallbacks) ----------------------------
  const getActiveHeroId = () => posseApi.getActiveHeroId?.();
  const getHeroById = posseApi.getHeroById || posseApi.getHero || (() => null);
  const getActiveHero = () => {
    const id = getActiveHeroId();
    return id ? (getHeroById(id) || { id }) : null;
  };
  const getHeroesAtShop = (sid) => posseApi.getHeroesAtShop?.(sid) || [];
  const listAllTownHeroes = () =>
    posseApi.listAllTownHeroes?.() || posseApi.getAllHeroes?.() || [];

  // --- UI shims --------------------------------------------------
  const toast = (msg) => uiApi.toast?.(msg);

  // Dice roller that *prompts* when available; otherwise auto-rolls
  const roll = async (n, sides, label) => {
    if (typeof uiApi.roll === 'function') {
      const r = await uiApi.roll(n, sides, label);
      if (Array.isArray(r) && r.length === n) return r.map((v) => Number(v) || 1);
    }
    // fallback auto-roll
    return Array.from({ length: n }, () => Math.floor(Math.random() * sides) + 1);
  };

  // Ability test (uses UI hook if provided; else 1d6 >= target)
  const test = async ({ hero, key, target = 4, label }) => {
    if (typeof uiApi.test === 'function') {
      return !!(await uiApi.test({ hero, key, target, label }));
    }
    const d = await roll(1, 6, label || `${key} test`);
    return (Array.isArray(d) ? d[0] : d) >= target;
  };

  // Choice picker -> use your numeric list prompt if present
  const selectChoice = async ({ title, message, choices }) => {
    // If your UI has a “promptChoice(title, options)” that returns an index:
    if (typeof uiApi.promptChoice === 'function') {
      const options = (choices || []).map((c) => ({
        label: c?.label ?? c?.key ?? String(c),
      }));
      const idx = await uiApi.promptChoice(title || message || 'Choose', options);
      const pick = (choices || [])[idx];
      return pick?.key ?? pick ?? null;
    }
    // Fallback: pick first
    const first = choices?.[0];
    return first?.key ?? first ?? null;
  };

  const notify = (msg) => {
    if (typeof uiApi.toast === 'function') uiApi.toast(msg);
    else try {
      console.log('[Event]', msg);
    } catch {}
  };

  // Optional hooks used by some handlers (Mutant Quarter, etc.)
  const getMutationCount = async (h) => {
    if (typeof uiApi.getMutationCount === 'function')
      return Number(await uiApi.getMutationCount(h)) || 0;
    const arr = Array.isArray(h?.mutations) ? h.mutations : [];
    return arr.length;
  };

  const hasMutation = async (h, name) => {
    if (typeof uiApi.hasMutation === 'function')
      return !!(await uiApi.hasMutation(h, name));
    const arr = Array.isArray(h?.mutations) ? h.mutations : [];
    return arr.some((m) => (m?.name || m) === name);
  };

  const getAllBuildingIds = async () => {
    if (typeof uiApi.getAllBuildingIds === 'function')
      return await uiApi.getAllBuildingIds();
    // Fallback: if your posseApi can enumerate, derive simple IDs from heroes' chosen locations
    try {
      const ids = new Set();
      (listAllTownHeroes() || []).forEach((h) => {
        if (h?.chosenLocation) ids.add(h.chosenLocation);
      });
      return Array.from(ids);
    } catch {
      return [];
    }
  };

   // IMPORTANT: Handlers expect this `io` object.
  const io = {
    roll,
    notify,
    test,
    selectChoice,
    getMutationCount,
    hasMutation,
    getAllBuildingIds,
    // expose these so handlers can read ctx.io.townStateApi / ctx.io.posseApi / ctx.io.uiApi
    townStateApi,
    posseApi,
    uiApi,
  };


    // Return everything; resolveLocEvent should pass ctx.io to handlers.
  return {
    posseApi,
    uiApi,
    townStateApi,
    io, // <-- the key piece that enables prompts
    // convenience for some engines/handlers:
    getActiveHeroId,
    getHeroById,
    getActiveHero,
    getHeroesAtShop,
    listAllTownHeroes,
    toast,
  };

}

/**
 * Roll and resolve a Location Event for the given location/shop id.
 * Uses the canonical townLocations registry (events arrays on each location file).
 */
export async function resolveLocationEvent(locationId, ctx) {
  const safeCtx = ctx || {};
  const io = safeCtx.io || makeLocEventCtx().io;

  const events = getLocationEvents(locationId);
  if (!events || !events.length) {
    io.notify(`No Location Event table defined for '${locationId}'.`);
    return { roll: null, dice: [], event: null };
  }

  // 2D6 roll
  const dice = await io.roll(2, 6, 'Location Event (2D6)');
  const total = (Array.isArray(dice) ? dice : [dice]).reduce(
    (sum, v) => sum + (Number(v) || 0),
    0,
  );

  // Find matching event:
  let event =
    events.find((e) => e.roll === total) ||
    events.find((e) => {
      // Support roll as "4-5" or rollRange: [4,5]
      if (Array.isArray(e.rollRange)) {
        const [lo, hi] = e.rollRange;
        return total >= lo && total <= hi;
      }
      if (typeof e.roll === 'string' && e.roll.includes('-')) {
        const [lo, hi] = e.roll.split('-').map((n) => Number(n) || 0);
        return total >= lo && total <= hi;
      }
      return false;
    });

  if (!event) {
    io.notify(`Rolled ${total}, but no matching event was found.`);
    return { roll: total, dice, event: null };
  }

  // If the event has a handler, let it do extra work
  if (typeof event.handle === 'function') {
    try {
      await event.handle(io, { roll: total, dice, event, locationId });
    } catch (err) {
      console.error('Error in event handler', err);
    }
  }

  // Basic notify so you see something even when there is no custom handler.
  const summary = event.effect || event.summary || event.name || '';
  if (summary) {
    io.notify(`Location Event (${total}): ${event.name} — ${summary}`);
  }

  return { roll: total, dice, event };
}
