// Surgery ritual (Docs Office) — mirrors Exorcism of Madness behavior
// Outcomes (single D6 used for BOTH cost and result):
// 1: Dead!
// 2: Too severe here → mark surgeryLocked on the target
// 3: Failed → refund 50%
// 4-5: Success → remove Injury/Mutation
// 6+: Remarkable Recovery → remove target +2 Max Health
//
// Cost: D6 × $50 (deducted up-front; half refunded on a 3)

function coerceD6(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 1 + Math.floor(Math.random() * 6);
  return Math.min(6, Math.max(1, Math.floor(n)));
}

// ----- Condition collectors with source mapping -----
function buildInjuryWithSources(hero) {
  const out = [];
  if (!hero) return out;

  // nested modern
  if (Array.isArray(hero?.conditions?.injury)) {
    hero.conditions.injury.forEach((c, i) => out.push({
      cond: c, src: { kind: 'nested', root: 'conditions', key: 'injury', idx: i }
    }));
  }
  // legacy arrays
  if (Array.isArray(hero?.injury)) {
    hero.injury.forEach((c, i) => out.push({
      cond: c, src: { kind: 'legacy', root: 'injury', idx: i }
    }));
  }
  if (Array.isArray(hero?.injuries)) {
    hero.injuries.forEach((c, i) => out.push({
      cond: c, src: { kind: 'legacy', root: 'injuries', idx: i }
    }));
  }
  // flat bag
  if (Array.isArray(hero?.conditions)) {
    hero.conditions.forEach((c, i) => {
      if (String(c?.type).toLowerCase() === 'injury') {
        out.push({ cond: c, src: { kind: 'flat', root: 'conditions', idx: i } });
      }
    });
  }
  return out;
}

function buildMutationWithSources(hero) {
  const out = [];
  if (!hero) return out;

  if (Array.isArray(hero?.conditions?.mutation)) {
    hero.conditions.mutation.forEach((c, i) => out.push({
      cond: c, src: { kind: 'nested', root: 'conditions', key: 'mutation', idx: i }
    }));
  }
  if (Array.isArray(hero?.mutation)) {
    hero.mutation.forEach((c, i) => out.push({
      cond: c, src: { kind: 'legacy', root: 'mutation', idx: i }
    }));
  }
  if (Array.isArray(hero?.mutations)) {
    hero.mutations.forEach((c, i) => out.push({
      cond: c, src: { kind: 'legacy', root: 'mutations', idx: i }
    }));
  }
  if (Array.isArray(hero?.conditions)) {
    hero.conditions.forEach((c, i) => {
      if (String(c?.type).toLowerCase() === 'mutation') {
        out.push({ cond: c, src: { kind: 'flat', root: 'conditions', idx: i } });
      }
    });
  }
  return out;
}

// ----- writers -----
function writeRemoveAtSource(hero, src) {
  if (!src) return {};

  if (src.kind === 'nested') {
    const bag = { ...(hero[src.root] || {}) };
    const arr = Array.isArray(bag[src.key]) ? [...bag[src.key]] : [];
    arr.splice(src.idx, 1);
    bag[src.key] = arr;
    return { [src.root]: bag };
  }

  if (src.kind === 'legacy') {
    const arr = Array.isArray(hero[src.root]) ? [...hero[src.root]] : [];
    arr.splice(src.idx, 1);
    return { [src.root]: arr };
  }

  if (src.kind === 'flat') {
    const arr = Array.isArray(hero[src.root]) ? [...hero[src.root]] : [];
    arr.splice(src.idx, 1);
    return { [src.root]: arr };
  }

  return {};
}

function writeLockAtSource(hero, src) {
  if (!src) return {};

  if (src.kind === 'nested') {
    const bag = { ...(hero[src.root] || {}) };
    const arr = Array.isArray(bag[src.key]) ? [...bag[src.key]] : [];
    const cur = { ...(arr[src.idx] || {}) };
    arr[src.idx] = { ...cur, surgeryLocked: true };
    bag[src.key] = arr;
    return { [src.root]: bag };
  }

  if (src.kind === 'legacy') {
    const arr = Array.isArray(hero[src.root]) ? [...hero[src.root]] : [];
    const cur = { ...(arr[src.idx] || {}) };
    arr[src.idx] = { ...cur, surgeryLocked: true };
    return { [src.root]: arr };
  }

  if (src.kind === 'flat') {
    const arr = Array.isArray(hero[src.root]) ? [...hero[src.root]] : [];
    const cur = { ...(arr[src.idx] || {}) };
    arr[src.idx] = { ...cur, surgeryLocked: true };
    return { [src.root]: arr };
  }

  return {};
}

function readMaxHealth(hero) {
  return hero?.maxHealth ?? hero?.max_health ?? hero?.HealthMax ?? null;
}

export async function applyDocsSurgery(ctx) {
  const { posseApi, uiApi, heroId } = ctx || {};
  const id = heroId || posseApi?.getActiveHeroId?.();
  const hero = posseApi?.getHero?.(id);
  if (!id || !hero) {
    window.alert?.('[Surgery] Missing hero/posseApi context.');
    return;
  }

  // assemble targets
  const injuries = buildInjuryWithSources(hero);
  const mutations = buildMutationWithSources(hero);
  if (!injuries.length && !mutations.length) {
    window.alert?.('No Injury or Mutation to operate on.');
    return;
  }

  // choose type
  let poolName = '';
  let pool = [];
  if (injuries.length && !mutations.length) {
    poolName = 'Injury';
    pool = injuries;
  } else if (!injuries.length && mutations.length) {
    poolName = 'Mutation';
    pool = mutations;
  } else {
    const idx = await (uiApi?.promptChoice?.(
      'Operate on which type?',
      ['Injury', 'Mutation']
    ) ?? 0);
    if (idx === 0) {
      poolName = 'Injury';
      pool = injuries;
    } else {
      poolName = 'Mutation';
      pool = mutations;
    }
  }

  // choose target from selected pool
  const opts = pool.map((x, i) => {
    const n = x?.cond?.name || x?.cond?.title || x?.cond?.effect || String(x?.cond || 'Condition');
    return `${i + 1}. ${n}`;
  });
  const pickStr = window.prompt(
    `Choose a ${poolName} to operate on (enter a number):\n\n${opts.join('\n')}`,
    '1'
  );
  if (pickStr == null) return;
  const pickIdx = Math.max(0, Math.min(pool.length - 1, (Number(pickStr) | 0) - 1));
  const chosen = pool[pickIdx];

  if (chosen?.cond?.surgeryLocked) {
    window.alert?.('This was previously deemed too severe for Surgery here.');
    return;
  }

  // single D6: cost + outcome
  const rollStr = window.prompt('Enter D6 result (1–6) or leave blank to auto-roll:', '');
  const roll = coerceD6(rollStr);
  const cost = roll * 50;

  if ((hero.gold ?? 0) < cost) {
    window.alert?.(`Not enough gold for Surgery (need $${cost}).`);
    return;
  }

  // deduct
  let gold = (hero.gold ?? 0) - cost;

  // outcomes
  if (roll === 1) {
    posseApi?.updateHero?.(id, { gold, isDead: true });
    window.alert?.('Rolled 1: Botched Surgery — your Hero dies on the table.');
    return;
  }

  if (roll === 2) {
    const patch = writeLockAtSource(hero, chosen.src);
    posseApi?.updateHero?.(id, { gold, ...patch });
    window.alert?.('Rolled 2: Too severe — cannot be treated by Surgery here (locked).');
    return;
  }

  if (roll === 3) {
    gold += Math.floor(cost / 2);
    posseApi?.updateHero?.(id, { gold });
    window.alert?.('Rolled 3: Operation failed. You get half your money back.');
    return;
  }

  // success (remove)
  const removePatch = writeRemoveAtSource(hero, chosen.src);

  if (roll === 4 || roll === 5) {
    posseApi?.updateHero?.(id, { gold, ...removePatch });
    window.alert?.('Rolled 4–5: Success! The condition is healed.');
    return;
  }

  // 6+: success +2 Max Health
  let maxHealth = readMaxHealth(hero);
  if (maxHealth == null) {
    posseApi?.updateHero?.(id, { gold, ...removePatch });
  } else {
    maxHealth = Number(maxHealth) + 2;
    // try to preserve original key
    const key =
      ('maxHealth' in hero) ? 'maxHealth' :
      ('max_health' in hero) ? 'max_health' :
      ('HealthMax' in hero) ? 'HealthMax' : 'maxHealth';
    posseApi?.updateHero?.(id, { gold, ...removePatch, [key]: maxHealth });
  }
  window.alert?.('Rolled 6+: Remarkable Recovery! Condition healed and +2 Max Health.');
}
