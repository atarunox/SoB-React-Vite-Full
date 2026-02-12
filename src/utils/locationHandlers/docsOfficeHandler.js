/* FIXME: Unbalanced braces/parens detected: braces=0 parens=-4 brackets=0. Review this file. */
// src/utils/locationHandlers/docsOfficeHandler.js
//
// Doc's Office Location Events (2d6)
// Event #3 asks: Passed / Failed / Auto-roll (default dice = current Luck).

import { appendTemporary } from '../mergeConditions';
import { normalizeConditionsObject } from '../mergeConditions';

const shopId = 'docsOffice';

// Dice
const d6 = () => Math.floor(Math.random() * 6) + 1;
const d3 = () => Math.ceil(d6() / 2);
const clamp2to12 = (n) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return null;
  return Math.max(2, Math.min(12, Math.floor(v)));
};

// ---- accessors: support ctx.fn OR ctx.posseApi/uiApi shapes
function A(ctx) {
  const p = ctx?.posseApi || {};
  const u = ctx?.uiApi || {};
  return {
    // posse
    getHero:           ctx.getHero           || p.getHero,
    getPosse:          ctx.getPosse          || p.getPosse,
    getHeroesAtShop:   ctx.getHeroesAtShop   || p.getHeroesAtShop,
    getActiveHeroId:   ctx.getActiveHeroId   || p.getActiveHeroId,
    updateHero:        ctx.updateHero        || p.updateHero,
    getMergedStats:    ctx.getMergedStats    || p.getMergedStats,

    // town state
    getTownState:      ctx.getTownState      || p.getTownState,
    setTownState:      ctx.setTownState      || p.setTownState,

    // ui
    toast:             ctx.toast             || u.toast,
    roll:              ctx.roll              || u.roll,
    promptNumber:      ctx.promptNumber      || u.promptNumber,
    promptChoice:      ctx.promptChoice      || u.promptChoice,
    promptConfirm:     ctx.promptConfirm     || u.promptConfirm,
    prompt:            ctx.prompt            || u.prompt,
  };
}

/* UI helpers */
async function uiChoice(api, title, options) {
  if (typeof api.promptChoice === 'function') {
    const res = await api.promptChoice(title, options);
    if (res && res.value) return res.value;
  }
  if (typeof api.prompt === 'function') {
    const res = await api.prompt({ type: 'select', title, options });
    if (res && res.value) return res.value;
  }
  if (typeof window !== 'undefined' && typeof window.prompt === 'function') {
    const lines = options.map((o, i) => `${i + 1}. ${o.label}`).join('\n');
    const raw = window.prompt(`${title}\n${lines}`, '1');
    const idx = Math.max(1, Math.min(options.length, Number(raw) || 1)) - 1;
    return options[idx].value;
  }
  A({}).toast?.('[UI] No choice UI available; defaulting to first option.');
  return options[0]?.value;
}

async function uiAskNumber(api, { title, message, min = 0, max = 12, def = 0 }) {
  if (typeof api.promptNumber === 'function') {
    try {
      let n = await api.promptNumber(title ?? message, { min, max, def, message });
      if (typeof n === 'object' && n && 'value' in n) n = n.value;
      n = Number(n);
      if (Number.isFinite(n)) return Math.max(min, Math.min(max, Math.floor(n)));
    } catch {}
    try {
      let n = await api.promptNumber({ title, message, min, max, def });
      if (typeof n === 'object' && n && 'value' in n) n = n.value;
      n = Number(n);
      if (Number.isFinite(n)) return Math.max(min, Math.min(max, Math.floor(n)));
    } catch {}
  }
  if (typeof api.prompt === 'function') {
    try {
      let res = await api.prompt({ type: 'number', title, message, min, max, def });
      if (typeof res === 'object' && res && 'value' in res) res = res.value;
      const n = Number(res);
      if (Number.isFinite(n)) return Math.max(min, Math.min(max, Math.floor(n)));
    } catch {}
  }
  if (typeof window !== 'undefined' && typeof window.prompt === 'function') {
    const raw = window.prompt(`${title || 'Enter a number'}\n${message || ''}\n(min ${min}, max ${max})`, String(def));
    const n = Number(raw);
    if (Number.isFinite(n)) return Math.max(min, Math.min(max, Math.floor(n)));
  }
  return Math.max(min, Math.min(max, Math.floor(def)));
}

// ------- Town-state modifiers -------
function putDayMod(ctx, key, value, reason) {
  const { getTownState, setTownState } = A(ctx);
  try {
    const ts = getTownState?.() || {};
    const dayMods = { ...(ts.dayMods || {}), [key]: value };
    const next = { ...ts, dayMods };
    setTownState?.(next, reason || key);
  } catch {}
}
function putStayMod(ctx, key, value, reason) {
  const { getTownState, setTownState } = A(ctx);
  try {
    const ts = getTownState?.() || {};
    const stayMods = { ...(ts.stayMods || {}), [key]: value };
    const next = { ...ts, stayMods };
    setTownState?.(next, reason || key);
  } catch {}
}

// ------- Hero selection safety net -------
async function resolveTargetHeroForShop(ctx, { title = 'Choose a hero' } = {}) {
  const api = A(ctx);
  const { getHero, getHeroesAtShop, getActiveHeroId, promptChoice, getPosse } = api;

  let candidateIds = Array.isArray(ctx?.targetHeroIds) ? ctx.targetHeroIds.filter(Boolean) : [];
  if (!candidateIds.length && typeof getHeroesAtShop === 'function') {
    const keys = [ctx.shopId, shopId, 'docsOffice', 'docs', 'doc'].filter(Boolean);
    for (const k of keys) {
      const got = getHeroesAtShop(k) || [];
      candidateIds.push(...got);
    }
  }
  if (!candidateIds.length && typeof getActiveHeroId === 'function') {
    const a = getActiveHeroId();
    if (a) candidateIds.push(a);
  }
  if (!candidateIds.length && typeof getPosse === 'function') {
    const posse = getPosse() || [];
    candidateIds = posse.map(h => h.id || h.localId).filter(Boolean);
  }

  candidateIds = Array.from(new Set(candidateIds)).filter(id => !!getHero?.(id));
  if (!candidateIds.length) return { id: null, hero: null };
  if (candidateIds.length === 1 || typeof promptChoice !== 'function') {
    const id = candidateIds[0];
    return { id, hero: getHero(id) };
  }

  const options = candidateIds.map(id => ({ label: getHero(id)?.name || id, value: id }));
  const choice = await promptChoice(title, options);
  const chosenId = choice?.value || candidateIds[0];
  return { id: chosenId, hero: getHero(chosenId) };
}

export async function handleDocsOfficeEvent(ctx = {}) {
  const api = A(ctx);
  const { toast, roll: rollDice, getMergedStats, updateHero } = api;

  // Resolve 2d6
  let r = clamp2to12(Number.isFinite(ctx.forcedRoll) ? ctx.forcedRoll : ctx.roll);
  if (r == null) {
    if (typeof rollDice === 'function') {
      const dice = await rollDice(2, 6, "Doc's Office — Event Roll (2d6)");
      r = clamp2to12((Array.isArray(dice) ? dice : []).reduce((a, b) => a + b, 0));
    } else {
      r = d6() + d6();
    }
  }
// Prompt per-condition: Auto-roll / Enter roll result / Auto-roll ALL
// On 4+: removed. On 1: kept + corruption. On 2–3: kept.
async function resolveMedicalMiracleForTargets(api, targets) {
  const results = [];
  let autoAll = false;

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];

    // Auto-all path: roll silently
    if (autoAll) {
      const [die] = typeof api.roll === 'function' ? await api.roll(1, 6, `Medical Miracle — ${t.name}`) : [d6()];
      const rollVal = Number(die) || 1;
      results.push({ ...t, roll: rollVal, removed: rollVal >= 4, corruption: rollVal === 1, auto: true });
      continue;
    }

    // Per-condition choice
    const choice = await uiChoice(api,
      `Medical Miracle — ${t.name} (4+ removes, 1 = Corruption hit)`,
      [
        { label: 'Auto-roll (1d6)',        value: 'auto' },
        { label: 'Enter roll result',      value: 'manual' },
        { label: 'Auto-roll ALL remaining', value: 'auto_all' },
      ]
    );

    if (choice === 'auto_all') {
      autoAll = true;
      const [die] = typeof api.roll === 'function' ? await api.roll(1, 6, `Medical Miracle — ${t.name}`) : [d6()];
      const rollVal = Number(die) || 1;
      results.push({ ...t, roll: rollVal, removed: rollVal >= 4, corruption: rollVal === 1, auto: true });
      continue;
    }

    if (choice === 'manual') {
      // Single prompt: enter the roll result (1–6)
      const raw = window?.prompt?.(`Medical Miracle — ${t.name}\nEnter your roll result (1–6):`, '');
      const rollVal = Math.max(1, Math.min(6, Math.floor(Number(raw) || 0)));
      results.push({ ...t, roll: rollVal, removed: rollVal >= 4, corruption: rollVal === 1, auto: false });
      continue;
    }

    // Auto-roll
    const [die] = typeof api.roll === 'function' ? await api.roll(1, 6, `Medical Miracle — ${t.name}`) : [d6()];
    const rollVal = Number(die) || 1;
    results.push({ ...t, roll: rollVal, removed: rollVal >= 4, corruption: rollVal === 1, auto: true });
  }

  return results;
}

  switch (r) {
    case 2: {
      putStayMod(ctx, 'docsOfficeMedicalDisabled', true, "Medical Attention unavailable");
      toast?.("The 'Good' Doctor — Medical Attention is unavailable to any Hero until the next town stay.");
      return { ui: { index: 0, title: "The 'Good' Doctor", effect: 'Medical Attention is unavailable to any Hero until after the next Adventure.' } };
    }

    case 3: {
      // Use the active hero directly — no hero-selection prompt
      const targetId = api.getActiveHeroId?.();
      const hero = targetId ? api.getHero?.(targetId) : null;
      if (!targetId || !hero) {
        toast?.('Plague Tent — no hero present.');
        return { ui: { index: 1, title: 'Plague Tent', effect: 'No hero present.' } };
      }

      // ONE prompt: Luck test — dice from Stats tab
      const merged = getMergedStats?.(hero) || {};
      const luckDice = Number(merged.stats?.Luck ?? hero.Luck ?? 0) || 0;

      const choice = await uiChoice(api,
        `Plague Tent — ${hero.name || 'Hero'}: Luck test (5+ on any die). Luck = ${luckDice}d6.`,
        [
          { label: 'Passed', value: 'pass' },
          { label: 'Failed', value: 'fail' },
          { label: `Auto-roll (${luckDice}d6)`, value: 'auto' },
        ]
      );

      let success = false;
      if (choice === 'pass') {
        success = true;
      } else if (choice === 'fail') {
        success = false;
      } else {
        const d = Math.max(0, luckDice);
        const rolls = d > 0
          ? (typeof api.roll === 'function'
              ? await api.roll(d, 6, 'Plague Tent — Luck Test (5+)')
              : Array.from({ length: d }, () => d6()))
          : [];
        success = rolls.some(x => Number(x) >= 5);
        // no intermediate toast — result handled below
      }

      if (!success) {
        // Auto-roll D3 corruption — no Willpower save, no extra prompt
        const add = d3();

        updateHero(targetId, (h) => {
          const merged2 = getMergedStats?.(h) || {};
          const maxCor = Number(merged2.stats?.['Max Corruption'] ?? h.maxCorruption ?? 5) || 5;
          const cur = Math.max(0, Number(h.currentCorruption ?? 0));
          let next = cur + add;

          // Overflow → Mutations
          const overflow = Math.floor(next / maxCor);
          next = next % maxCor;
          const nextMut = Array.isArray(h.mutations) ? [...h.mutations] : [];
          for (let i = 0; i < overflow; i++) nextMut.push({ name: 'Mutation — Roll Needed' });

          // Temporary condition: Max Grit capped at 1 for next Adventure
          const tmp = {
            id: `gritcap_nextadv_${Date.now()}`,
            type: 'Temporary',
            temporary: true,
            name: 'Shaken Nerves (Plague Tent)',
            effectText: 'Max Grit is capped at 1 for the next Adventure.',
            effects: { maxGritCap: 1 },
            gritCap: 1,
            duration: 'nextAdventure',
            active: true,
            addedAt: Date.now(),
          };
          const mergedConds = appendTemporary(h.conditions, tmp);

          return { ...h, currentCorruption: next, mutations: nextMut, conditions: mergedConds };
        });

        // Single result notification
        const pts = add === 1 ? '1 Corruption point' : `${add} Corruption points`;
        toast?.(`${hero.name || 'Hero'} has received ${pts} ignoring Willpower saves and is reduced to 1 Max Grit for the next Adventure.`);
        return {
          ui: {
            index: 1,
            title: 'Plague Tent',
            effect: `Failed: +${add} Corruption (no Willpower saves). Max Grit = 1 for next Adventure.`,
          }
        };
      }

      toast?.(`Plague Tent — ${hero.name || 'Hero'} passed: no effect.`);
      return { ui: { index: 1, title: 'Plague Tent', effect: 'Passed: no effect.' } };
    }

    case 4:
    case 5: {
      putDayMod(ctx, 'docsOfficeSurgeryRollMod', { add: -1, minBeforeClamp: 0 }, 'Dirty Tools');
      toast?.('Dirty Tools — all Surgery rolls at Doc’s today are -1 (min 0).');
      return { ui: { index: r - 2, title: 'Dirty Tools', effect: 'Surgery rolls today are -1 (min 0).' } };
    }

    case 6:
    case 7:
    case 8: {
      toast?.('The Smell of Death — No event.');
      return { ui: { index: r - 2, title: 'The Smell of Death', effect: 'No event.' } };
    }

    case 9:
    case 10: {
      putDayMod(ctx, 'docsOfficeSurgeryRollMod', { add: +1 }, 'Expert Surgeon');
      toast?.('Expert Surgeon — all Surgery rolls at Doc’s today are +1.');
      return { ui: { index: r - 2, title: 'Expert Surgeon', effect: 'Surgery rolls today are +1.' } };
    }

    case 11: {
      const api2 = A(ctx);
      const ids =
        (typeof api2.getHeroesAtShop === 'function' && api2.getHeroesAtShop(shopId)) ||
        (typeof api2.getActiveHeroId === 'function' ? [api2.getActiveHeroId()] : []);
      for (const id of (ids || [])) {
        const h = api2.getHero?.(id);
        if (!id || !h) continue;

        const item = {
          id: `doc_specimen_jar_${Date.now()}_${id}`,
          name: 'Specimen Jar',
          type: 'Gear',
          source: "Doc's Office",
          tags: ['Glass', 'Science'],
          description: 'Fill in Other Worlds (Cunning test) then sell to the Doc for D6×$100.',
          limitOne: true
        };

        api2.updateHero?.(id, (prev) => {
          const inv = Array.isArray(prev.inventory) ? [...prev.inventory] : [];
          if (!inv.some(it => (it?.name || '').toLowerCase() === 'specimen jar')) inv.push(item);
          return { ...prev, inventory: inv };
        });

        api2.toast?.(`Special Mission — ${h.name || 'Hero'} received a Specimen Jar.`);
      }
      return { ui: { index: 9, title: 'Special Mission', effect: 'Each hero here gains 1 Specimen Jar.' } };
    }

case 12: {
  const api2 = A(ctx);
  const { id: targetId, hero } = await resolveTargetHeroForShop(ctx, { title: 'Medical Miracle — choose a hero' });
  if (!targetId || !hero) {
    api2.toast?.('Medical Miracle — no hero present.');
    return { ui: { index: 10, title: 'Medical Miracle', effect: 'No hero present.' } };
  }

  // Build target list from bucketed conditions
  const obj = normalizeConditionsObject(hero.conditions);
  const buckets = ['injury', 'mutation', 'parasite'];
  const targets = [];
  for (const b of buckets) {
    const arr = Array.isArray(obj[b]) ? obj[b] : [];
    arr.forEach((c, i) => {
      const active = c && c.active !== false && c.removed !== true;
      if (active) targets.push({ bucket: b, idx: i, name: c?.name || c?.type || b });
    });
  }

  if (!targets.length) {
    api2.toast?.('Medical Miracle — no qualifying conditions to roll.');
    return { ui: { index: 10, title: 'Medical Miracle', effect: 'No qualifying conditions.' } };
  }

  const results = await resolveMedicalMiracleForTargets(api2, targets);

  // Count 1s across all entries (auto and manual) — each adds 1 Corruption
  const corruptionHits = results.reduce((acc, r) => acc + (r.corruption ? 1 : 0), 0);

  api2.updateHero?.(targetId, (h) => {
    const cur = normalizeConditionsObject(h.conditions);
    const next = { ...cur };

    for (const r of results) {
      const arr = Array.isArray(next[r.bucket]) ? next[r.bucket] : [];
      if (arr[r.idx] && r.removed) {
        arr[r.idx] = { ...arr[r.idx], removed: true, active: false };
      }
      next[r.bucket] = arr;
    }

    // Apply corruption from rolled 1s to currentCorruption
    const nextCor = Math.max(0, Number(h.currentCorruption ?? 0)) + corruptionHits;
    return { ...h, conditions: next, currentCorruption: nextCor };
  });

  // Build a readable summary
  const summaryLines = results.map(r => {
    const rollTag = r.roll != null ? `rolled ${r.roll}` : (r.auto ? 'auto' : 'manual');
    const outcomeTag = r.removed ? 'Removed' : (r.corruption ? 'Kept (+1 Corruption)' : 'Kept');
    return `• ${r.name}: ${rollTag} → ${outcomeTag}`;
  });

  api2.toast?.(
    `Medical Miracle — Results:\n${summaryLines.join('\n')}` +
    (corruptionHits > 0 ? `\n+${corruptionHits} Corruption from rolled 1s.` : '')
  );

  return {
    ui: {
      index: 10,
      title: 'Medical Miracle',
      effect: `Per condition: Auto-roll or enter result. 4+ removes, 1 = +1 Corruption. Removed: ${results.filter(r => r.removed).length}/${results.length}.`,
    }
  };
}



    default:
      A(ctx).toast?.("Doc's Office — No matching event branch.");
      return { ui: { title: "Doc's Office", effect: 'No matching event branch.' } };
  }
}

export default handleDocsOfficeEvent;
