// src/utils/locationEventContext.js

import { getLocationEvents } from '../data/townLocations/index.js';
import { calculateCurrentStats } from './calculateStats';

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

  // --- Hero update (handlers call ctx.updateHero) ----------------
  const updateHero = (id, patchOrFn) => posseApi.updateHero?.(id, patchOrFn);

  // --- UI shims --------------------------------------------------
  const toast = (msg) => uiApi.toast?.(msg);
  const promptChoice = (title, options) => uiApi.promptChoice?.(title, options);
  const promptNumber = (msg, opts) => uiApi.promptNumber?.(msg, opts);
  const promptYesNo = (msg, def) => uiApi.promptYesNo?.(msg, def);

  // Dice roller that *prompts* when available; otherwise auto-rolls
  const roll = async (n, sides, label) => {
    if (typeof uiApi.roll === 'function') {
      const r = await uiApi.roll(n, sides, label);
      if (Array.isArray(r) && r.length === n) return r.map((v) => Number(v) || 1);
    }
    // fallback auto-roll
    return Array.from({ length: n }, () => Math.floor(Math.random() * sides) + 1);
  };

  // --- Skill check (roll dice equal to hero's stat, any >= target passes) ---
  const doSkillCheck = async (heroId, { stat, target = 5, prompt = true } = {}) => {
    const hero = getHeroById(heroId);
    // Get effective stat value from calculated stats
    let statVal = 1;
    if (hero) {
      try {
        const { stats: merged = {} } = calculateCurrentStats(hero);
        statVal = Number(merged[stat] ?? hero?.stats?.[stat] ?? 0) || 1;
      } catch {
        statVal = Number(hero?.stats?.[stat] ?? 0) || 1;
      }
    }
    const dice = Math.max(1, statVal);
    const label = `${stat} ${target}+ test (${dice}d6) — ${stat}: ${statVal}`;
    const rolls = await roll(dice, 6, label);
    const arr = Array.isArray(rolls) ? rolls : [rolls];
    return arr.some((r) => r >= target);
  };

  // Ability test (uses UI hook if provided; else stat-based dice)
  const test = async ({ hero, key, target = 4, label }) => {
    if (typeof uiApi.test === 'function') {
      return !!(await uiApi.test({ hero, key, target, label }));
    }
    // Use stat-based dice if we have a hero
    if (hero) {
      let statVal = 1;
      try {
        const { stats: merged = {} } = calculateCurrentStats(hero);
        statVal = Number(merged[key] ?? hero?.stats?.[key] ?? 0) || 1;
      } catch {
        statVal = Number(hero?.stats?.[key] ?? 0) || 1;
      }
      const dice = Math.max(1, statVal);
      const d = await roll(dice, 6, label || `${key} ${target}+ test`);
      const arr = Array.isArray(d) ? d : [d];
      return arr.some((r) => r >= target);
    }
    const d = await roll(1, 6, label || `${key} test`);
    return (Array.isArray(d) ? d[0] : d) >= target;
  };

  // Choice picker -> use your numeric list prompt if present
  const selectChoice = async ({ title, message, choices }) => {
    // If your UI has a "promptChoice(title, options)" that returns an index:
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

  // --- Missing method stubs that handlers call without optional chaining ---
  // enqueueChartRoll: some handlers call this directly (not ?.); provide a safe fallback
  const enqueueChartRoll = async (heroId, chartType) => {
    if (typeof posseApi.enqueueChartRoll === 'function') {
      return posseApi.enqueueChartRoll(heroId, chartType);
    }
    const hero = getHeroById(heroId);
    const name = hero?.name || 'Hero';
    toast(`${name}: Roll on the ${chartType} chart.`);
  };

  // addToken: some handlers call without ?.
  const addToken = (heroId, tokenName) => {
    if (typeof posseApi.addToken === 'function') {
      return posseApi.addToken(heroId, tokenName);
    }
    // Fallback: add to sidebag
    updateHero(heroId, (h) => {
      const sb = h.sideBag || h.sidebags || { capacity: 5, items: [] };
      const items = Array.isArray(sb.items) ? [...sb.items] : [];
      const existing = items.find((i) => i.name === tokenName);
      if (existing) {
        existing.qty = (existing.qty || 1) + 1;
      } else {
        items.push({ id: `token_${Date.now()}`, name: tokenName, qty: 1 });
      }
      return { ...h, sideBag: { ...sb, items } };
    });
    toast(`Added ${tokenName} token.`);
  };

  // addCondition: some handlers call with ?.
  const addCondition = (heroId, payload) => {
    if (typeof posseApi.addCondition === 'function') {
      return posseApi.addCondition(heroId, payload);
    }
    // minimal fallback for UnwantedAttention
    if (payload?.type === 'UnwantedAttention') {
      const delta = Number(payload.delta || 1);
      updateHero(heroId, (h) => ({
        ...h,
        unwantedAttention: (h.unwantedAttention || 0) + delta,
      }));
    }
  };

  // addKeyword: called with ?. so safe, but provide stub
  const addKeyword = (heroId, keyword) => {
    if (typeof posseApi.addKeyword === 'function') {
      return posseApi.addKeyword(heroId, keyword);
    }
    updateHero(heroId, (h) => {
      const kw = Array.isArray(h.keywords) ? [...h.keywords] : [];
      if (!kw.includes(keyword)) kw.push(keyword);
      return { ...h, keywords: kw };
    });
    toast(`Added keyword: ${keyword}`);
  };

  // getEffectiveStat: used by gambling hall
  const getEffectiveStat = (heroId, stat) => {
    const hero = getHeroById(heroId);
    if (!hero) return 0;
    try {
      const { stats: merged = {} } = calculateCurrentStats(hero);
      return Number(merged[stat] ?? hero?.stats?.[stat] ?? 0) || 0;
    } catch {
      return Number(hero?.stats?.[stat] ?? 0) || 0;
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
    getHero: getHeroById,      // alias — many handlers call ctx.getHero
    getActiveHero,
    getHeroesAtShop,
    listAllTownHeroes,
    updateHero,                // handlers call ctx.updateHero(id, patchOrFn)
    doSkillCheck,              // handlers call ctx.doSkillCheck(id, { stat, target })
    enqueueChartRoll,          // handlers call ctx.enqueueChartRoll(id, chartType)
    addToken,                  // handlers call ctx.addToken(id, tokenName)
    addCondition,              // handlers call ctx.addCondition(id, payload)
    addKeyword,                // handlers call ctx.addKeyword(id, keyword)
    getEffectiveStat,          // handlers call ctx.getEffectiveStat(id, stat)
    toast,
    promptChoice,
    promptNumber,
    promptYesNo,
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
