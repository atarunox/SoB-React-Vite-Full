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
// Prompt per-condition with manual/autoroll options (and "auto all" shortcut)
async function resolveMedicalMiracleForTargets(api, targets) {
  const results = [];
  let autoAll = false;

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];

    // If user chose "auto all", just roll silently for the rest
    if (autoAll) {
      const [die] = typeof api.roll === 'function' ? await api.roll(1, 6, `Medical Miracle — ${t.name}`) : [d6()];
      results.push({ ...t, roll: Number(die) || 1, removed: (Number(die) || 1) >= 3, auto: true });
      continue;
    }

    // Show the per-condition choice
    const choice = await (async () => {
      if (typeof api.promptChoice === 'function') {
        return api.promptChoice(
          `Medical Miracle — ${t.name}`,
          [
            { label: 'Auto-roll (1d6)',            value: 'auto' },
            { label: 'Mark Removed (manual 3+)',   value: 'manual_removed' },
            { label: 'Mark Kept (manual 1–2)',     value: 'manual_kept' },
            { label: 'Auto-roll ALL remaining',    value: 'auto_all' },
          ]
        );
      }
      if (typeof api.prompt === 'function') {
        return api.prompt({
          type: 'select',
          title: `Medical Miracle — ${t.name}`,
          options: [
            { label: 'Auto-roll (1d6)',            value: 'auto' },
            { label: 'Mark Removed (manual 3+)',   value: 'manual_removed' },
            { label: 'Mark Kept (manual 1–2)',     value: 'manual_kept' },
            { label: 'Auto-roll ALL remaining',    value: 'auto_all' },
          ]
        });
      }
      // very simple fallback (window.prompt)
      const raw = window?.prompt?.(
        `Medical Miracle — ${t.name}\n1) Auto-roll (1d6)\n2) Mark Removed (manual 3+)\n3) Mark Kept (manual 1–2)\n4) Auto-roll ALL remaining`,
        '1'
      );
      const idx = Math.max(1, Math.min(4, Number(raw) || 1));
      return { value: ['auto','manual_removed','manual_kept','auto_all'][idx - 1] };
    })();

    const v = choice?.value;
    if (v === 'auto_all') {
      autoAll = true;
      const [die] = typeof api.roll === 'function' ? await api.roll(1, 6, `Medical Miracle — ${t.name}`) : [d6()];
      results.push({ ...t, roll: Number(die) || 1, removed: (Number(die) || 1) >= 3, auto: true });
      continue;
    }

    if (v === 'auto') {
      const [die] = typeof api.roll === 'function' ? await api.roll(1, 6, `Medical Miracle — ${t.name}`) : [d6()];
      results.push({ ...t, roll: Number(die) || 1, removed: (Number(die) || 1) >= 3, auto: true });
      continue;
    }

    if (v === 'manual_removed') {
      results.push({ ...t, roll: null, removed: true, auto: false });
      continue;
    }

    // default: kept
    results.push({ ...t, roll: null, removed: false, auto: false });
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
      const { id: targetId, hero } = await resolveTargetHeroForShop(ctx, { title: "Plague Tent — choose a hero" });
      if (!targetId || !hero) {
        toast?.('Plague Tent — no hero present.');
        return { ui: { index: 1, title: 'Plague Tent', effect: 'No hero present.' } };
      }

      // Default dice = current Luck (merged)
      const merged = getMergedStats?.(hero) || {};
      const luckDice = Number(merged.stats?.Luck ?? hero.Luck ?? 0) || 0;

      const choice = await uiChoice(api,
        `Plague Tent — Luck test for ${hero.name || 'Hero'} (5+ on any die).`,
        [
          { label: 'Passed (manual)', value: 'pass' },
          { label: 'Failed (manual)', value: 'fail' },
          { label: `Auto-roll (${luckDice || 0} dice)`, value: 'auto' },
        ]
      );

      let success = false;
      if (choice === 'pass') {
        success = true;
      } else if (choice === 'fail') {
        success = false;
      } else {
        // Auto-roll path (allow override)
        const diceCount = await uiAskNumber(api, {
          title: 'Plague Tent — Auto-roll Luck Test (5+)',
          message: `Enter number of dice to roll (Default = current Luck: ${luckDice})`,
          min: 0,
          max: 12,
          def: luckDice
        });

        let rolls = [];
        if (diceCount > 0) {
          if (typeof api.roll === 'function') {
            rolls = await api.roll(diceCount, 6, 'Luck Test (5+)');
          } else {
            rolls = Array.from({ length: diceCount }, () => d6());
          }
        }
        success = (rolls || []).some(x => Number(x) >= 5);
        toast?.(
          `[Doc's #3] ${hero.name || 'Hero'} Luck rolls: [${(rolls||[]).join(', ')}] → ${success ? 'Success' : 'Fail'}`
        );
      }

      if (!success) {
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

          // TEMPORARY condition: merge safely into existing conditions (object or flat)
          const tmp = {
            id: `gritcap_nextadv_${Date.now()}`,
            type: 'Temporary',
            temporary: true,
            name: 'Shaken Nerves',
            effectText: 'Max Grit is capped at 1 for the next Adventure.',
            effects: {},
            gritCap: 1,
            duration: 'nextAdventure',
            active: true,
            addedAt: Date.now(),
          };
          const mergedConds = appendTemporary(h.conditions, tmp);

          return {
            ...h,
            currentCorruption: next,
            mutations: nextMut,
            conditions: mergedConds
          };
        });

        toast?.(`[Doc's #3] ${hero.name || 'Hero'} failed: +${add} Corruption (no saves). Added “Shaken Nerves” (Max Grit cap 1 next Adventure).`);
      } else {
        toast?.(`[Doc's #3] ${hero.name || 'Hero'} succeeded: no effect.`);
      }

      return {
        ui: {
          index: 1,
          title: 'Plague Tent',
          effect: success ? 'No effect.' : 'Gain D3 Corruption; add Shaken Nerves (Max Grit cap 1 next Adventure).'
        }
      };
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

  // NEW: Prompt per condition with option to autoroll (and auto-all)
  const results = await resolveMedicalMiracleForTargets(api2, targets);

  // Tally natural 1s only for autorolled entries
  const ones = results.reduce((acc, r) => acc + ((r.auto && Number(r.roll) === 1) ? 1 : 0), 0);

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

    const nextHits = Math.max(0, Number(h.corruptionHits ?? 0)) + ones;
    return { ...h, conditions: next, corruptionHits: nextHits };
  });

  // Build a readable summary
  const summaryLines = results.map(r => {
    const tag = r.auto ? (r.roll != null ? `rolled ${r.roll}` : 'auto') : 'manual';
    return `• ${r.name}: ${tag} → ${r.removed ? 'Removed' : 'Kept'}`;
  });

  api2.toast?.(
    `Medical Miracle — Results:\n${summaryLines.join('\n')}\n` +
    (ones > 0 ? `Natural 1s: ${ones} → +${ones} Corruption Hit${ones === 1 ? '' : 's'}.` : 'No natural 1s on autorolls.')
  );

  return {
    ui: {
      index: 10,
      title: 'Medical Miracle',
      effect: 'Pick per condition: Auto-roll (1d6) or mark manually. Remove on 3+, each auto-rolled 1 adds a Corruption Hit.'
    }
  };
}



    default:
      A(ctx).toast?.("Doc's Office — No matching event branch.");
      return { ui: { title: "Doc's Office", effect: 'No matching event branch.' } };
  }
}

export default handleDocsOfficeEvent;
