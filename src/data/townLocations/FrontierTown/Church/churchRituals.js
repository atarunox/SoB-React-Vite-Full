// src/data/townLocations/churchRituals.js

// ----------------------------- tiny utils ---------------------------------
const isObj = (v) => v && typeof v === 'object';

const coerceD6 = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return 1 + Math.floor(Math.random() * 6);
  return Math.min(6, Math.max(1, Math.floor(n)));
};

const promptD6 = (msg, def = '') => {
  const raw = window.prompt(msg, def);
  if (raw == null) return null; // cancel
  return coerceD6(raw);
};

const promptNumber = (msg, def = '') => {
  const raw = window.prompt(msg, def);
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

// ---------------- Madness helpers (compatible with TownTab) ----------------
const normalizeMadness = (m) =>
  m && typeof m === 'object'
    ? (m.type ? m : { ...m, type: 'Madness' })
    : { name: String(m), type: 'Madness' };

const detectMadnessList = (hero) => {
  const out = [];

  if (Array.isArray(hero?.conditions?.madness)) {
    hero.conditions.madness.forEach((c, i) =>
      out.push({ cond: c, src: { kind: 'nested', path: 'conditions.madness', idx: i } })
    );
  }

  const byType = hero?.conditions?.byType;
  if (byType) {
    const container = byType.Madness ?? byType.madness;
    if (Array.isArray(container)) {
      container.forEach((c, i) =>
        out.push({
          cond: c,
          src: {
            kind: 'byTypeArr',
            path: 'conditions.byType',
            key: byType.Madness ? 'Madness' : 'madness',
            idx: i,
          },
        })
      );
    } else if (container && typeof container === 'object') {
      Object.values(container).forEach((c, i) =>
        out.push({
          cond: c,
          src: {
            kind: 'byTypeObj',
            path: 'conditions.byType',
            key: byType.Madness ? 'Madness' : 'madness',
            idx: i,
          },
        })
      );
    }
  }

  if (Array.isArray(hero?.madness)) {
    hero.madness.forEach((c, i) =>
      out.push({ cond: c, src: { kind: 'legacy', path: 'madness', idx: i } })
    );
  }

  if (Array.isArray(hero?.conditions)) {
    hero.conditions.forEach((c, i) => {
      const type = String(c?.type || c?.Type || '').toLowerCase();
      const cat = String(c?.category || '').toLowerCase();
      const name = String(c?.name || c?.result || '').toLowerCase();
      const tagHit =
        Array.isArray(c?.tags) && c.tags.some((t) => String(t).toLowerCase() === 'madness');
      const isMad =
        type === 'madness' ||
        cat === 'madness' ||
        tagHit ||
        /(^|\s|:|-|\/)madness(\s|$|:|-|\/)/.test(name);
      if (isMad) out.push({ cond: c, src: { kind: 'flatArr', path: 'conditions', idx: i } });
    });
  } else if (hero?.conditions && typeof hero.conditions === 'object') {
    Object.values(hero.conditions).forEach((c, i) => {
      if (!c || typeof c !== 'object') return;
      const type = String(c?.type || c?.Type || '').toLowerCase();
      const cat = String(c?.category || '').toLowerCase();
      const name = String(c?.name || c?.result || '').toLowerCase();
      const tagHit =
        Array.isArray(c?.tags) && c.tags.some((t) => String(t).toLowerCase() === 'madness');
      const isMad =
        type === 'madness' ||
        cat === 'madness' ||
        tagHit ||
        /(^|\s|:|-|\/)madness(\s|$|:|-|\/)/.test(name);
      if (isMad) out.push({ cond: c, src: { kind: 'flatObjVals', path: 'conditions', idx: i } });
    });
  }

  return out.map(({ cond, src }) => ({ cond: normalizeMadness(cond), src }));
};

const writeMadnessBack = (hero, nextMadnessArr) => {
  const normalizedNext = (Array.isArray(nextMadnessArr) ? nextMadnessArr : []).map(
    normalizeMadness
  );

  if (Array.isArray(hero?.conditions)) {
    const nonMad = hero.conditions.filter(
      (c) =>
        String(c?.type ?? c?.Type ?? '').toLowerCase() !== 'madness' &&
        String(c?.category ?? '').toLowerCase() !== 'madness'
    );
    return [...nonMad, ...normalizedNext];
  }

  if (hero?.conditions && typeof hero.conditions === 'object' && hero.conditions.byType) {
    const byType = hero.conditions.byType || {};
    const key = Object.prototype.hasOwnProperty.call(byType, 'Madness') ? 'Madness' : 'madness';
    const container = byType[key];

    if (Array.isArray(container)) {
      return { ...hero.conditions, byType: { ...byType, [key]: [...normalizedNext] } };
    }
    if (container && typeof container === 'object') {
      const mapped = {};
      normalizedNext.forEach((m, i) => {
        mapped[i] = m;
      });
      return { ...hero.conditions, byType: { ...byType, [key]: mapped } };
    }
    return { ...hero.conditions, byType: { ...byType, [key]: [...normalizedNext] } };
  }

  if (hero?.conditions && typeof hero.conditions === 'object') {
    return { ...hero.conditions, madness: normalizedNext };
  }

  return [...normalizedNext];
};

// ----------------------------- ritual runner -------------------------------
export async function applyChurchRitual(ctx, ritualId) {
  let { heroId, posseApi, uiApi } = ctx || {};
  // Back-compat: if methods were spread directly (getHero/updateHero), wrap them.
  if (
    !posseApi &&
    ctx &&
    typeof ctx.getHero === 'function' &&
    typeof ctx.updateHero === 'function'
  ) {
    posseApi = { getHero: ctx.getHero.bind(ctx), updateHero: ctx.updateHero.bind(ctx) };
  }
  // If uiApi was flattened, wrap promptChoice/toast.
  if (!uiApi && ctx && (typeof ctx.promptChoice === 'function' || typeof ctx.toast === 'function')) {
    uiApi = {
      promptChoice: ctx.promptChoice?.bind?.(ctx),
      toast: ctx.toast?.bind?.(ctx),
    };
  }

  if (!heroId || !posseApi?.getHero || !posseApi?.updateHero) {
    console.warn('[churchRituals] Missing heroId/posseApi');
    return;
  }

  const getHero = () => posseApi.getHero(heroId) || {};
  const writeHero = (patchOrFn) => posseApi.updateHero(heroId, patchOrFn);
  const toast = (msg) => {
    try {
      uiApi?.toast?.(msg);
    } catch {}
    try {
      console.log('[Church]', msg);
    } catch {}
  };

  switch (ritualId) {
    case 'ch_ritual_exorcism_of_madness':
      return await runExorcismOfMadness(getHero, writeHero, uiApi, toast);
    case 'ch_ritual_banish_corruption':
      return await runBanishCorruption(getHero, writeHero, uiApi, toast);
    case 'ch_ritual_resurrection':
      return await runResurrection(getHero, writeHero, uiApi, toast);
    default:
      toast('Unknown ritual.');
  }
}

// ----------------------- implementations ----------------------------------

// Exorcism of Madness
// Cost: D6 × $50 paid up-front. Results:
// 1  -> mark madness exorcismLocked (Too Far Gone)
// 2–3 -> refund half cost
// 4–5 -> remove madness
// 6+  -> remove madness and +2 Max Sanity
async function runExorcismOfMadness(getHero, writeHero, uiApi, toast) {
  let hero = getHero();

  const pairs = detectMadnessList(hero);
  if (!pairs.length) {
    alert('No Madness to target.');
    return;
  }

  const labels = pairs.map(({ cond }, i) => {
    const title = cond?.name || cond?.title || cond?.result || `Madness ${i + 1}`;
    const locked = cond?.exorcismLocked ? ' (Too Far Gone)' : '';
    return `${i + 1}. ${title}${locked}`;
  });

  let idx = 0;
  if (uiApi?.promptChoice) {
    idx = await uiApi.promptChoice('Choose a Madness to Exorcise:', labels);
  } else {
    const pickRaw = window.prompt(
      'Choose a Madness to Exorcise (enter a number):\n\n' + labels.join('\n'),
      '1'
    );
    if (pickRaw == null) return;
    idx = Math.max(0, Math.min(pairs.length - 1, (Number(pickRaw) | 0) - 1));
  }

  const chosen = pairs[idx]?.cond;
  if (!chosen) return;

  if (chosen.exorcismLocked) {
    alert('This Madness was previously deemed too far gone to exorcise at the Church.');
    return;
  }

  // Pay D6 × $50 up-front (capture startGold to avoid race/profit)
  const costRoll = promptD6('Enter D6 cost roll (1–6), or leave blank to auto-roll:', '');
  if (costRoll == null) return;
  const cost = costRoll * 50;

  hero = getHero();
  const startGold = Number(hero.gold ?? 0);
  if (startGold < cost) {
    alert(`Not enough gold for Exorcism (need $${cost}).`);
    return;
  }
  const goldAfterPayment = startGold - cost;
  writeHero({ gold: goldAfterPayment });

  // Result D6
  const resultRoll = promptD6('Enter Exorcism result roll (1–6), or leave blank to auto-roll:', '');
  if (resultRoll == null) return;

  hero = getHero();
  const currentMadness = detectMadnessList(hero).map((p) => p.cond);
  const keyOf = (m) => (m?.name || m?.title || m?.result || '').trim().toLowerCase();
  const chosenKey = keyOf(chosen);
  let updated = [...currentMadness];

  if (resultRoll === 1) {
    updated = updated.map((m) => {
      if (keyOf(m) === chosenKey) return { ...normalizeMadness(m), exorcismLocked: true };
      return m;
    });
    const conditions = writeMadnessBack(hero, updated);
    writeHero({ conditions });
    toast('Exorcism: Dead! Madness now locked against Church Exorcism.');
    alert('Result 1: Dead! The targeted Madness is now locked against Church Exorcism.');
    return;
  }

  if (resultRoll === 2 || resultRoll === 3) {
    const refund = Math.floor(cost / 2);
    // Deterministic refund against the same payment we just made.
    writeHero({ gold: goldAfterPayment + refund });
    toast(`Exorcism failed. Refunded $${refund}.`);
    alert(`Result ${resultRoll}: Failed. You get half your money back ($${refund}).`);
    return;
  }

  if (resultRoll === 4 || resultRoll === 5) {
    updated = updated.filter((m) => keyOf(m) !== chosenKey);
    const conditions = writeMadnessBack(hero, updated);
    writeHero({ conditions });
    toast('Exorcism success! Madness removed.');
    alert('Result 4–5: Success! Madness is healed.');
    return;
  }

  // 6+
  updated = updated.filter((m) => keyOf(m) !== chosenKey);
  const conditions = writeMadnessBack(hero, updated);
  const maxSanity =
    Number(
      hero.maxSanity ??
        hero.max_sanity ??
        hero.SanityMax ??
        hero.sanityMax ??
        0
    ) + 2;
  writeHero({ conditions, maxSanity });

  // Append a MaxChange note so Conditions tab shows this
  {
    const hLatest = getHero();
    const prevNotes = Array.isArray(hLatest?.conditionNotes) ? hLatest.conditionNotes : [];
    const maxChangeNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      kind: 'MaxChange',
      stat: 'Max Sanity',
      delta: +2,
      newMax: maxSanity,
      source: 'Exorcism (Remarkable Recovery)',
      reason: 'Result 6+',
      ts: Date.now(),
    };
    writeHero({ conditionNotes: [...prevNotes, maxChangeNote] });
  }

  toast('Exorcism remarkable recovery! Madness removed and +2 Max Sanity.');
  alert('Result 6+: Remarkable Recovery! Madness healed and +2 Max Sanity.');
}

// Banish Corruption
// Cost: $100. Remove (D6–2) Corruption; if none removed, take D6 Sanity damage (ignores Willpower).
async function runBanishCorruption(getHero, writeHero, uiApi, toast) {
  let hero = getHero();
  const cost = 100;

  if ((hero.gold ?? 0) < cost) {
    alert('Not enough gold for Banish Corruption ($100).');
    return;
  }

  // Ask for both rolls up-front
  const removalRoll = promptD6(
    'Banish Corruption: enter removal D6 (1–6), blank = auto-roll:',
    ''
  );
  if (removalRoll == null) return;
  const damageRoll = promptD6(
    'If none removed, enter damage D6 (1–6), blank = auto-roll:',
    ''
  );
  if (damageRoll == null) return;

  // Pay immediately
  writeHero({ gold: Number(hero.gold ?? 0) - cost });

  hero = getHero();

  // Use the same field the rest of the app uses (currentCorruption),
  // but keep a legacy read/write to `corruption` for older heroes.
  const current =
    Number(
      hero.currentCorruption ??
        hero.corruption ??
        hero.corruptionCurrent ??
        0
    ) || 0;

  const toRemove = Math.max(0, removalRoll - 2);

  if (toRemove > 0 && current > 0) {
    const removed = Math.min(toRemove, current);
    const next = Math.max(0, current - removed);

    // Keep both in sync so StatsTab (currentCorruption) and any legacy code see it.
    writeHero({
      currentCorruption: next,
      corruption: next,
    });

    toast(`Banish Corruption: removed ${removed} Corruption.`);
    alert(`Removed ${removed} Corruption.`);
    return;
  }

  // none removed -> take sanity damage ignoring willpower
  const curSanity =
    Number(
      hero.currentSanity ??
        hero.sanity ??
        hero.Sanity ??
        hero.sanityCurrent ??
        0
    ) || 0;

  const nextSanity = Math.max(0, curSanity - damageRoll);

  // Again, write to currentSanity (used by StatsTab) and legacy `sanity`.
  writeHero({
    currentSanity: nextSanity,
    sanity: nextSanity,
  });

  toast(
    `Banish Corruption: none removed — took ${damageRoll} Sanity damage (ignores Willpower).`
  );
  alert(`No Corruption removed. Take ${damageRoll} Sanity damage (ignores Willpower).`);
}

// Resurrection
// Cost: $500 × target level (prompt). Effect: dead -> alive at 1 Health.
async function runResurrection(getHero, writeHero, uiApi, toast) {
  let hero = getHero();
  const level =
    promptNumber(
      'Enter the hero’s Level to compute cost ($500 × level):',
      String(hero.level ?? 1)
    ) ?? 1;
  if (level == null) return;

  const cost = 500 * Math.max(1, Math.floor(level));
  if ((hero.gold ?? 0) < cost) {
    alert(`Not enough gold for Resurrection (need $${cost}).`);
    return;
  }

  writeHero({ gold: Number(hero.gold ?? 0) - cost });

  hero = getHero();

  // Prefer currentHealth for compatibility with StatsTab, but fall back gracefully.
  const healthField =
    'currentHealth' in hero
      ? 'currentHealth'
      : 'health' in hero
      ? 'health'
      : 'Health' in hero
      ? 'Health'
      : 'hp' in hero
      ? 'hp'
      : 'health';

  const patch = { isDead: false, dead: false };
  patch[healthField] = 1;

  writeHero(patch);
  toast(`Resurrection complete. –$${cost}.`);
  alert(`Resurrection complete for $${cost}. Set Health to 1.`);
}

// ----------------------- UI-facing rituals list ----------------------------
// This array is what Church UI renders as a Services tab. TownTab will detect
// the three ritual IDs below and route them through applyChurchRitual.
export const churchRituals = [
  {
    id: 'ch_ritual_exorcism_of_madness',
    name: 'Exorcism of Madness',
    type: 'Ritual',
    cost: 0, // display-only; TownTab shows "D6 × $50"
    limit: 'One Exorcism attempt per Madness',
    resultTable: {
      '1': 'Dead! (Madness becomes Too Far Gone for Church Exorcism)',
      '2-3': 'Failed (refund half cost)',
      '4-5': 'Success! Madness healed',
      '6+': 'Remarkable Recovery! Madness healed and +2 Max Sanity',
    },
    rules: {
      ui: { requiresConditionPicker: 'Madness' },
      note: 'Pay D6×$50 up-front; then roll result.',
    },
  },
  {
    id: 'ch_ritual_banish_corruption',
    name: 'Banish Corruption',
    type: 'Ritual',
    cost: 100,
    effect:
      'Remove D6–2 Corruption; if none removed, take D6 Sanity damage (ignores Willpower).',
    rules: {
      ui: { requiresRolls: ['removalD6', 'fallbackDamageD6'] },
    },
  },
  {
    id: 'ch_ritual_resurrection',
    name: 'Resurrection',
    type: 'Ritual',
    cost: 0, // display-only; TownTab shows "$500 × target level"
    effect: 'Pay $500 × target level. Return to life at 1 Health.',
    rules: {
      ui: { requiresLevelPrompt: true },
    },
  },
];

export default churchRituals;
