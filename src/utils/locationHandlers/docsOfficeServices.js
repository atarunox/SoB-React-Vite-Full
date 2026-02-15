// utils/locationHandlers/docsOfficeServices.js

import { materializeInjuryByRoll } from '../../components/DM/charts/injuryChart';

// ---------- tiny dice helpers ----------
const d6 = () => Math.floor(Math.random() * 6) + 1;
const rollN = (n, s = 6) => Array.from({ length: n }, () => Math.floor(Math.random() * s) + 1);
const sum = (a) => a.reduce((x, y) => x + y, 0);

// Normalize a hero patch result for TownTab's posseApi.updateHero
function mergePatch(hero, patch) {
  if (!hero) return null;
  const id = hero.id || hero.localId;
  if (!id) return null;
  return { id, ...patch };
}

function safeNumber(n, def = 0) {
  const v = Number(n);
  return Number.isFinite(v) ? v : def;
}

function clamp(n, min = -1e9, max = 1e9) {
  n = Number(n);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function clampFloor(v, floor) {
  return floor == null ? v : Math.max(floor, v);
}

// ---------- robust condition removal (non-destructive to other buckets) ----------
function removeSelectedCondition(hero, pick, note) {
  if (!pick) return { patch: {}, removed: false };

  const kind = String(pick.kind || '').toLowerCase(); // 'injury' | 'mutation'
  const isInjury = kind === 'injury';
  const bucketKey = isInjury ? 'injury' : 'mutation';
  const legacySingular = isInjury ? 'injury' : 'mutation';
  const legacyPlural = isInjury ? 'injuries' : 'mutations';

  const patch = {};
  let removed = false;

  // 1) If picker provided a precise source pointer, honor it.
  if (pick.src && pick.src.kind && pick.src.path != null && Number.isFinite(pick.src.idx)) {
    const { kind: srcKind, path, idx } = pick.src;

    // NESTED bucket under hero.conditions
    if (srcKind === 'nested' && path === `conditions.${bucketKey}`) {
      const list = Array.isArray(hero?.conditions?.[bucketKey]) ? hero.conditions[bucketKey] : [];
      if (idx >= 0 && idx < list.length) {
        const next = list.filter((_, i) => i !== idx);
        patch.conditions = {
          ...(hero.conditions || {}),
          [bucketKey]: next,
        };
        removed = true;
        note?.(`[Surgery] Removed ${bucketKey} from conditions.${bucketKey}[${idx}].`);
        return { patch, removed };
      }
    }

    // LEGACY arrays
    if (srcKind === 'legacy' && (path === legacySingular || path === legacyPlural)) {
      const arr = Array.isArray(hero?.[path]) ? hero[path] : [];
      if (idx >= 0 && idx < arr.length) {
        const next = arr.filter((_, i) => i !== idx);
        patch[path] = next;
        removed = true;
        note?.(`[Surgery] Removed ${bucketKey} from ${path}[${idx}].`);
        return { patch, removed };
      }
    }

    // FLAT conditions array
    if (srcKind === 'flat' && path === 'conditions') {
      const all = Array.isArray(hero?.conditions) ? hero.conditions : [];
      if (idx >= 0 && idx < all.length) {
        const next = all.filter((_, i) => i !== idx);
        patch.conditions = next;
        removed = true;
        note?.(`[Surgery] Removed ${bucketKey} from flat conditions[${idx}].`);
        return { patch, removed };
      }
    }
  }

  // 2) No src pointer (or didn’t match): try the common shapes in a safe order.

  // 2a) Bucket under hero.conditions (preferred modern shape)
  if (!removed && hero?.conditions && Array.isArray(hero.conditions[bucketKey])) {
    const idx = Number.isFinite(pick._idx) ? pick._idx : -1;
    const list = hero.conditions[bucketKey];
    if (idx >= 0 && idx < list.length) {
      const next = list.filter((_, i) => i !== idx);
      patch.conditions = { ...(hero.conditions || {}), [bucketKey]: next };
      removed = true;
      note?.(`[Surgery] Removed ${bucketKey} from conditions.${bucketKey}[${idx}].`);
      return { patch, removed };
    }
    // If no index, try by name match for resiliency
    if (pick.name) {
      const i2 = list.findIndex(c => String(c?.name).trim() === String(pick.name).trim());
      if (i2 >= 0) {
        const next = list.filter((_, i) => i !== i2);
        patch.conditions = { ...(hero.conditions || {}), [bucketKey]: next };
        removed = true;
        note?.(`[Surgery] Removed ${bucketKey} '${pick.name}' from conditions.${bucketKey}.`);
        return { patch, removed };
      }
    }
  }

  // 2b) Legacy plural array on root (injuries[] / mutations[])
  if (!removed && Array.isArray(hero?.[legacyPlural])) {
    const idx = Number.isFinite(pick._idx) ? pick._idx : -1;
    const list = hero[legacyPlural];
    if (idx >= 0 && idx < list.length) {
      const next = list.filter((_, i) => i !== idx);
      patch[legacyPlural] = next;
      removed = true;
      note?.(`[Surgery] Removed ${bucketKey} from ${legacyPlural}[${idx}].`);
      return { patch, removed };
    }
  }

  // 2c) Legacy singular array on root (injury[] / mutation[])
  if (!removed && Array.isArray(hero?.[legacySingular])) {
    const idx = Number.isFinite(pick._idx) ? pick._idx : -1;
    const list = hero[legacySingular];
    if (idx >= 0 && idx < list.length) {
      const next = list.filter((_, i) => i !== idx);
      patch[legacySingular] = next;
      removed = true;
      note?.(`[Surgery] Removed ${bucketKey} from ${legacySingular}[${idx}].`);
      return { patch, removed };
    }
  }

  // 2d) Flat hero.conditions array by type
  if (!removed && Array.isArray(hero?.conditions)) {
    const all = hero.conditions;
    const idx = Number.isFinite(pick._idx) ? pick._idx : all.findIndex(
      c => String(c?.type || '').toLowerCase() === (isInjury ? 'injury' : 'mutation')
    );
    if (idx >= 0 && idx < all.length) {
      const next = all.filter((_, i) => i !== idx);
      patch.conditions = next;
      removed = true;
      note?.(`[Surgery] Removed ${bucketKey} from flat conditions[${idx}] (type match).`);
      return { patch, removed };
    }
  }

  return { patch, removed };
}

/**
 * performSurgery
 * - Prompts for target condition via io.promptInjuryOrMutation(hero)
 * - Cost: D6 * $50 (apply `mods.costMult` if provided)
 * - Outcome: roll D6 + (mods.outcomeDelta + mods.outcomeBonus + io.getSurgeryOutcomeMod())
 *   1–2: Fail, refund 50% of paid gold
 *   3–4: Success, remove the chosen condition
 *   5–6+: Great success, remove condition and heal D6 wounds
 *
 * `mods` may include:
 *   - costMult: number (default 1)
 *   - outcomeDelta: number (Dirty Tools -1, Expert Surgeon +1)
 *   - outcomeBonus: number (back-compat)
 *   - outcomeFloor: number | null (Dirty Tools often implies floor 0 for index tables)
 */
export async function performSurgery({ hero, townState, io = {}, mods = {} }) {
  const log = [];
  const actions = [];

  const note = (m) => {
    log.push(String(m));
    try { io.notify?.(m); } catch {}
  };

  // -- helper: where is the condition stored? (nested vs legacy)
  const resolveConditionBucket = (h, pickKind) => {
    const k = String(pickKind || '').toLowerCase();
    if (k === 'injury') {
      if (Array.isArray(h?.conditions?.injury)) return { where: 'nested', key: 'injury', list: [...h.conditions.injury] };
      if (Array.isArray(h?.injuries))         return { where: 'legacy', key: 'injuries', list: [...h.injuries] };
      if (Array.isArray(h?.injury))           return { where: 'legacy', key: 'injury',   list: [...h.injury] };
    }
    if (k === 'mutation') {
      if (Array.isArray(h?.conditions?.mutation)) return { where: 'nested', key: 'mutation', list: [...h.conditions.mutation] };
      if (Array.isArray(h?.mutations))            return { where: 'legacy', key: 'mutations', list: [...h.mutations] };
      if (Array.isArray(h?.mutation))             return { where: 'legacy', key: 'mutation',  list: [...h.mutation] };
    }
    // default/fallback empty
    return { where: 'none', key: '', list: [] };
  };

  const writeBucketPatch = (h, patchObj, bucket, nextList) => {
    if (bucket.where === 'nested') {
      patchObj.conditions = {
        ...(h.conditions || {}),
        [bucket.key]: nextList,
      };
    } else if (bucket.where === 'legacy') {
      patchObj[bucket.key] = nextList;
    } else {
      // no-op
    }
  };

  // 1) pick target condition
  const pick = await io.promptInjuryOrMutation?.(hero);
  if (!pick) {
    note('Surgery canceled — no condition selected.');
    return { actions, log };
  }

  const goldBefore = safeNumber(hero?.gold, 0);

  // 2) cost
  const costRoll = (await io.roll?.(1, 6, 'Surgery Cost'))?.[0] ?? d6();
  const baseCost = costRoll * 50;
  const effectiveCost = Math.floor(baseCost * (Number(mods.costMult ?? 1) || 1));
  const payOk = await io.pay?.(effectiveCost, `Pay $${effectiveCost} for Surgery (cost roll ${costRoll})`);
  if (!payOk) {
    note('Surgery aborted — payment declined.');
    return { actions, log };
  }

  // Deduct now; we’ll refund if outcome map says so.
  let gold = goldBefore - effectiveCost;

  // 3) outcome (compose all modifiers)
  const outcomeMod =
    Number(mods.outcomeDelta || 0) +
    Number(mods.outcomeBonus || 0) +
    (Number(io.getSurgeryOutcomeMod?.() || 0) || 0);

  const rolled = (await io.roll?.(1, 6, 'Surgery Outcome'))?.[0] ?? d6();
  let outcomeRoll = rolled + outcomeMod;

  // Some events (Dirty Tools) may allow floor 0
  if (Number.isFinite(mods.outcomeFloor)) {
    outcomeRoll = Math.max(mods.outcomeFloor, outcomeRoll);
  }

  note(`[Surgery] Cost roll=${costRoll} → $${effectiveCost} deducted.`);
  note(
    `[Surgery] Outcome roll=${outcomeRoll}` +
      (outcomeMod ? ` (mods ${outcomeMod >= 0 ? '+' : ''}${outcomeMod})` : '') +
      (Number.isFinite(mods.outcomeFloor) ? `, floor=${mods.outcomeFloor}` : '')
  );

  // Prepare access to the target list
  const bucket = resolveConditionBucket(hero, pick.kind);
  const idx = clamp(pick._idx, 0, bucket.list.length - 1);

  // --- Outcome Map ---------------------------------------------------------
  // 0: Dead
  if (outcomeRoll <= 0) {
    note('[Surgery] Catastrophic failure — the hero is dead.');
    const patch = {
      gold,
      dead: true,
      currentHealth: 0,
      // (optional) mark all temps inactive, etc. — left to your broader game flow
    };
    return { actions, patch: mergePatch(hero, patch), log };
  }

  // 1: Condition becomes permanently unhealable (lock it)
  if (outcomeRoll === 1) {
    const patch = { gold };
    if (bucket.list.length && idx >= 0) {
      const locked = { ...(bucket.list[idx] || {}), surgeryLocked: true };
      const nextList = [...bucket.list];
      nextList[idx] = locked;
      writeBucketPatch(hero, patch, bucket, nextList);
      note('[Surgery] Mishap — condition is now permanently unhealable (locked).');
    } else {
      note('[Surgery] Mishap — no condition updated (not found).');
    }
    return { actions, patch: mergePatch(hero, patch), log };
  }

  // 2–3: Fail with 50% refund
  if (outcomeRoll >= 2 && outcomeRoll <= 3) {
    const refund = Math.floor(effectiveCost / 2);
    gold += refund;
    note(`[Surgery] Failed — refunded $${refund}.`);
    return { actions, patch: mergePatch(hero, { gold }), log };
  }

  // 4–5: Success — remove the chosen condition (no refund)
  if (outcomeRoll >= 4 && outcomeRoll <= 5) {
    const patch = { gold };
    if (bucket.list.length && idx >= 0) {
      const nextList = [...bucket.list];
      nextList.splice(idx, 1);
      writeBucketPatch(hero, patch, bucket, nextList);
      note('[Surgery] Success — condition removed.');
    } else {
      note('[Surgery] Success — but no condition removed (not found).');
    }
    return { actions, patch: mergePatch(hero, patch), log };
  }

  // 6+: Healed — remove condition and grant +2 Max Health (no current healing)
if (outcomeRoll >= 6) {
  const patch = { gold };
    if (bucket.list.length && idx >= 0) {
      const nextList = [...bucket.list];
      nextList.splice(idx, 1);
      writeBucketPatch(hero, patch, bucket, nextList);
    }

    const nextMax = safeNumber(hero?.maxHealth, 0) + 2;
    patch.maxHealth = nextMax;              // ↑ do NOT heal current HP

    // Append a MaxChange note so ConditionsTab shows it alongside Exorcism
    const prevNotes = Array.isArray(hero?.conditionNotes) ? hero.conditionNotes : [];
    const maxChangeNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      kind: 'MaxChange',
      stat: 'Max Health',
      delta: +2,
      newMax: nextMax,
      source: 'Surgery (Great Success)',
      reason: 'Outcome 6+',
      ts: Date.now(),
    };
    patch.conditionNotes = [...prevNotes, maxChangeNote];

    // log
    note('[Surgery] Healed — condition removed, +2 Max Health, note added to Conditions.');
    return { actions, patch: mergePatch(hero, patch), log };
}
}

/**
 * performTreatCorruption
 * - Choose how many Corruption points to remove (0..currentCorruption).
 * - Pay $100 per point removed.
 * - Then roll a D6; on 1–3, take D6 Wounds (ignores Defense).
 * - Primary field: currentCorruption (with maxCorruption shown in UI elsewhere).
 * - Falls back to: corruption | corruptionHits | corruptionPoints if currentCorruption is absent.
 */
// Treat Corruption — auto-deduct qty×$100 and qty Corruption, then D6 backlash on 1–3
export async function performTreatCorruption({ hero, io }) {
  const log = [];
  const curCor = Math.max(0, Number(hero?.currentCorruption ?? 0));
  const gold   = Math.max(0, Number(hero?.gold ?? 0));
  const maxByGold = Math.floor(gold / 100);
  const max = Math.min(curCor, maxByGold);

  if (max <= 0) {
    log.push(`[Treat Corruption] Not enough gold or no Corruption to remove (cur=${curCor}, gold=$${gold}).`);
    return { actions: [], log };
  }

  // Ask how many to remove (caller may override promptNumber to show a nicer message)
  const qty = await (io?.promptNumber
    ? io.promptNumber('How many Corruption to remove?', { min: 0, max, defaultValue: Math.min(1, max) })
    : Promise.resolve(Math.min(1, max)));

  if (!Number.isFinite(qty) || qty <= 0) {
    log.push('[Treat Corruption] Canceled (qty not chosen).');
    return { actions: [], log };
  }

  const cost = qty * 100;
  const nextGold = Math.max(0, gold - cost);
  const nextCor  = Math.max(0, curCor - qty);

  log.push(`[Treat Corruption] Removing ${qty} Corruption for $${cost}.`);
  log.push(`[Treat Corruption] Gold: ${gold} → ${nextGold}, Corruption: ${curCor} → ${nextCor}.`);

  // Backlash roll: on 1–3, take D6 Wounds (ignores Defense)
  const rollFn = io?.roll
    ? io.roll
    : async (n, sides) => Array.from({ length: n }, () => Math.floor(Math.random() * sides) + 1);

  const [backlash] = await rollFn(1, 6, 'Treat Corruption — Backlash (1–3 takes D6 Wounds, ignores Defense)');
  log.push(`[Treat Corruption] Backlash roll: ${backlash}.`);

  // Base current HP and apply backlash wounds if any
  const curHP = Number.isFinite(Number(hero?.currentHealth))
    ? Number(hero.currentHealth)
    : Number(hero?.health ?? 0);

  let nextHealth = curHP;

  if (backlash <= 3) {
    const [w] = await rollFn(1, 6, 'Treat Corruption — Backlash Wounds (ignores Defense)');
    nextHealth = Math.max(0, curHP - w);
    log.push(`[Treat Corruption] Backlash triggers: took ${w} Wounds (ignores Defense). Health → ${nextHealth}.`);
  } else {
    log.push('[Treat Corruption] No backlash.');
  }

  // Single merged update action — caller’s applyActions merges by spreading
  const actions = [
    {
      type: 'update',
      gold: nextGold,
      currentCorruption: nextCor,
      currentHealth: nextHealth,
      health: nextHealth, // keep both in sync
    },
  ];

  return { actions, log };
}

/**
 * performInjectionPurchase
 * - Enforces cost via io.pay; applies any documented side effects on the item:
 *   - item.effects may contain strings like "+1 Max Health", "+1 Corruption", etc.
 *   - item.grantsToken can be used (rare, but supported)
 *   - item.carries.darkStone increases hero.darkStone
 * - This is intentionally simple; you can extend with item-specific logic later.
 */
export async function performInjectionPurchase({ hero, item, townState, io = {} }) {
  const log = [];
  const actions = [];
  const note = (m) => {
    log.push(String(m));
    try { io.notify?.(m); } catch {}
  };

  const name = String(item?.name || 'Injection');

  // Normalize cost
  const rawCost = item?.cost;
  const cost =
    typeof rawCost === 'number'
      ? { gold: rawCost }
      : rawCost && typeof rawCost === 'object'
      ? {
          gold: safeNumber(rawCost.gold, 0),
          darkStone: safeNumber(rawCost.darkStone, 0),
          scrap: safeNumber(rawCost.scrap, 0),
          tech: safeNumber(rawCost.tech, 0),
        }
      : { gold: 0 };

  // Confirm payment
  const parts = [];
  if (cost.gold) parts.push(`$${cost.gold}`);
  if (cost.darkStone) parts.push(`${cost.darkStone} DS`);
  if (cost.scrap) parts.push(`${cost.scrap} scrap`);
  if (cost.tech) parts.push(`${cost.tech} tech`);
  const label = `Buy ${name} (${parts.join(', ') || 'Free'})`;
  const ok = await io.pay?.(cost.gold || 0, label);
  if (!ok) {
    note(`${name} canceled — payment declined.`);
    return { actions, log };
  }

  // Apply currency effects
  const patch = {
    gold: safeNumber(hero?.gold, 0) - (cost.gold || 0),
    darkStone: safeNumber(hero?.darkStone, 0) - (cost.darkStone || 0),
    scrap: safeNumber(hero?.scrap, 0) - (cost.scrap || 0),
    tech: safeNumber(hero?.tech, 0) - (cost.tech || 0),
  };

  // Some injections add DS to carry or grant tokens/items
  const dsGrant = safeNumber(item?.grantsCurrency?.darkStone || item?.carries?.darkStone, 0);
  if (dsGrant) patch.darkStone = safeNumber(patch.darkStone, 0) + dsGrant;

  // Side effects: very light parser — extend as needed
  if (Array.isArray(item?.effects)) {
    for (const e of item.effects) {
      if (typeof e !== 'string') continue;
      const s = e.trim().toLowerCase();

      // +1 Max Health
      if (/\+?\d+\s*max\s*health/.test(s)) {
        const amt = parseInt(s, 10) || 1;
        const maxHealth = safeNumber(hero?.maxHealth, 0) + amt;
        patch.maxHealth = maxHealth;
        note(`${name} — Max Health +${amt}.`);
      }
      // +1 Corruption (Hit)
      if (/\+?\d+\s*corruption/.test(s)) {
        const amt = parseInt(s, 10) || 1;
        patch.corruption = safeNumber(hero?.corruption, 0) + amt;
        note(`${name} — +${amt} Corruption.`);
      }
    }
  }

  note(`${name} injected.`);
  return { actions, patch: mergePatch(hero, patch), log };
}

/**
 * performDocItemPurchase
 * - Generic gear/supply purchase from Doc’s Office (non-injection)
 * - Handles cost, adds the item to inventory, and respects item.carries.darkStone
 */
export async function performDocItemPurchase({ hero, item, io = {} }) {
  const log = [];
  const actions = [];
  const note = (m) => {
    log.push(String(m));
    try { io.notify?.(m); } catch {}
  };

  const name = String(item?.name || 'Item');

  // Normalize cost
  const rawCost = item?.cost;
  const cost =
    typeof rawCost === 'number'
      ? { gold: rawCost }
      : rawCost && typeof rawCost === 'object'
      ? {
          gold: safeNumber(rawCost.gold, 0),
          darkStone: safeNumber(rawCost.darkStone, 0),
          scrap: safeNumber(rawCost.scrap, 0),
          tech: safeNumber(rawCost.tech, 0),
        }
      : { gold: 0 };

  const parts = [];
  if (cost.gold) parts.push(`$${cost.gold}`);
  if (cost.darkStone) parts.push(`${cost.darkStone} DS`);
  if (cost.scrap) parts.push(`${cost.scrap} scrap`);
  if (cost.tech) parts.push(`${cost.tech} tech`);
  const ok = await io.pay?.(cost.gold || 0, `Buy ${name} (${parts.join(', ') || 'Free'})`);
  if (!ok) {
    note(`${name} purchase canceled — payment declined.`);
    return { actions, log };
  }

  const inv = Array.isArray(hero?.inventory) ? [...hero.inventory] : [];
  const withId = { ...item, id: item.id || `${Date.now()}_${Math.random().toString(36).slice(2)}` };
  inv.push(withId);

  const patch = {
    gold: safeNumber(hero?.gold, 0) - (cost.gold || 0),
    darkStone: safeNumber(hero?.darkStone, 0) - (cost.darkStone || 0),
    scrap: safeNumber(hero?.scrap, 0) - (cost.scrap || 0),
    tech: safeNumber(hero?.tech, 0) - (cost.tech || 0),
    inventory: inv,
  };

  const dsGrant = safeNumber(item?.grantsCurrency?.darkStone || item?.carries?.darkStone, 0);
  if (dsGrant) patch.darkStone = safeNumber(patch.darkStone, 0) + dsGrant;

  note(`${name} purchased.`);
  return { actions, patch: mergePatch(hero, patch), log };
}

export default {
  performSurgery,
  performTreatCorruption,
  performInjectionPurchase,
  performDocItemPurchase,
};
