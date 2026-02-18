// src/utils/locationHandlers/indianTradingPostServices.js

// ---------- tiny dice helpers ----------
const DICE = {
  d3: () => 1 + Math.floor(Math.random() * 3),
  d6: () => 1 + Math.floor(Math.random() * 6),
};
const asNumber = (v, fb = 0) => (Number.isFinite(Number(v)) ? Number(v) : fb);

// ---------- shared small helpers ----------
function addCondition(hero, cond) {
  const list = Array.isArray(hero?.conditions) ? hero.conditions.slice() : [];
  list.push(cond);
  return { ...hero, conditions: list };
}
function spendDarkStone(hero, amount) {
  const amt = Math.max(0, asNumber(amount, 0));
  const cur = asNumber(hero?.darkStone ?? hero?.resources?.darkStone, 0);
  const next = Math.max(0, cur - amt);
  if ('darkStone' in (hero || {})) {
    return { ...hero, darkStone: next };
  }
  return { ...hero, resources: { ...(hero.resources || {}), darkStone: next } };
}
function removeOneAilment(hero, target /* 'Madness'|'Curse'|'Mutation' */) {
  const t = String(target || '').toLowerCase();
  const h = { ...hero };

  if (t === 'madness') {
    const arr = Array.isArray(h.madnesses) ? h.madnesses.slice() : [];
    if (arr.length) arr.shift();
    h.madnesses = arr;
  } else if (t === 'curse') {
    const arr = Array.isArray(h.curses) ? h.curses.slice() : [];
    if (arr.length) arr.shift();
    h.curses = arr;
  } else if (t === 'mutation') {
    const arr = Array.isArray(h.mutations) ? h.mutations.slice() : [];
    if (arr.length) arr.shift();
    h.mutations = arr;
  }
  return h;
}
function addRandomMutations(hero, count) {
  const c = Math.max(0, asNumber(count, 0));
  if (!c) return hero;
  const muts = Array.isArray(hero?.mutations) ? hero.mutations.slice() : [];
  for (let i = 0; i < c; i++) {
    muts.push({ id: `mut_${Date.now()}_${i}`, name: 'Mutation (Unresolved)', pending: true });
  }
  return { ...hero, mutations: muts };
}
function addMaxSanityBuff(hero, delta, name = 'Spirit Cleansing (Blessing)') {
  const cond = {
    id: `indianTP_maxSanity_${Date.now()}`,
    type: 'buff',
    name,
    active: true,
    removable: false,
    effects: { maxSanityDelta: asNumber(delta, 0) },
    source: 'indianTradingPost',
    createdAt: Date.now(),
  };
  return addCondition(hero, cond);
}
function addTempBuff(hero, changes, label) {
  const cond = {
    id: `indianTP_temp_${Date.now()}`,
    type: 'buff',
    name: label,
    active: true,
    removable: true,
    effects: changes, // e.g. { initiativeDelta: +1 } or { spiritDelta: +1 }
    duration: { type: 'adventure', until: 'end' },
    source: 'indianTradingPost',
  };
  return addCondition(hero, cond);
}
function addXp(hero, amt) {
  const xp0 = asNumber(hero?.xp, 0);
  return { ...hero, xp: xp0 + Math.max(0, asNumber(amt, 0)) };
}
function addGrit(hero, amt) {
  const g0 = asNumber(hero?.grit, 0);
  const maxG = asNumber(hero?.maxGrit, 2);
  return { ...hero, grit: Math.min(maxG, g0 + Math.max(0, asNumber(amt, 0))) };
}
function refreshOncePerAdventure(hero) {
  const opa = Array.isArray(hero?.oncePerAdventure)
    ? hero.oncePerAdventure.map((x) => ({ ...x, used: false }))
    : [];
  return { ...hero, oncePerAdventure: opa };
}
function heroHasSpiritGuide(hero) {
  if (Array.isArray(hero?.gear) && hero.gear.some(g => String(g?.slot).toLowerCase() === 'spirit guide')) {
    return true;
  }
  return !!(hero?.flags && hero.flags.spiritGuide);
}
function grantSpiritGuide(hero, rolled = DICE.d6()) {
  const flags = { ...(hero.flags || {}), spiritGuide: { value: rolled, grantedAt: Date.now() } };
  return { ...hero, flags };
}

// ==========================================================
// ===============  PUBLIC SERVICE HANDLERS  ================
// ==========================================================

/**
 * Spirit Cleansing — pay D6 Dark Stone and roll 1d6 for the outcome
 * target: 'Madness' | 'Curse' | 'Mutation'
 */
export async function performSpiritCleansing({
  posseApi,
  hero: heroInput,   // optional: if not supplied, use heroId
  heroId,
  target,
  payRoll,           // optional 1–6
  resultRoll,        // optional 1–6
} = {}) {
  const hero0 = heroInput ?? (heroId ? posseApi?.getHero?.(heroId) : null);
  if (!hero0) return { ok: false, log: 'Hero not found' };
  if (!target) return { ok: false, log: 'Choose target: Madness / Curse / Mutation' };

  const cost = payRoll || DICE.d6();
  let hero = spendDarkStone(hero0, cost);

  const r = resultRoll || DICE.d6();
  const log = [`[Spirit Cleansing] Paid ${cost} Dark Stone. Target: ${target}. Outcome roll=${r}.`];

  if (r === 1) {
    const m = DICE.d3();
    hero = addRandomMutations(hero, m);
    log.push(`Not healed; gained ${m} Mutation(s).`);
  } else if (r === 2 || r === 3) {
    log.push('Not healed.');
  } else if (r === 4 || r === 5) {
    hero = removeOneAilment(hero, target);
    log.push('Healed.');
  } else if (r === 6) {
    hero = removeOneAilment(hero, target);
    hero = addMaxSanityBuff(hero, +1, 'Spirit Cleansing (Blessing)');
    log.push('Healed; +1 Max Sanity (shown on Conditions tab).');
  }

  if (posseApi?.updateHero) {
    const id = heroId || hero0.id || hero0.localId;
    posseApi.updateHero(id, hero);
  }
  return { ok: true, log: log.join(' '), hero };
}

/**
 * Vision Quest — must pass Spirit 5+ first.
 * If hero lacks Spirit Guide, grant one (roll d6) by default.
 * Then roll d6 for reward.
 */
export async function performVisionQuest({
  posseApi,
  hero: heroInput,
  heroId,
  spiritTestPassed,
  needsSpiritGuideRoll = true,
  guideRoll,
  rewardRoll,
} = {}) {
  const hero0 = heroInput ?? (heroId ? posseApi?.getHero?.(heroId) : null);
  if (!hero0) return { ok: false, log: 'Hero not found' };
  if (!spiritTestPassed) return { ok: false, log: '[Vision Quest] Spirit 5+ test failed.', hero: hero0 };

  let hero = { ...hero0 };
  const logs = ['[Vision Quest] Spirit 5+ passed.'];

  if (needsSpiritGuideRoll && !heroHasSpiritGuide(hero)) {
    const r = guideRoll || DICE.d6();
    hero = grantSpiritGuide(hero, r);
    logs.push(`Granted Spirit Guide (roll=${r}).`);
  }

  const r = rewardRoll || DICE.d6();
  let reward = null;
  switch (r) {
    case 1:
    case 2:
      reward = { id: 'vq_initiative', text: '+1 Initiative until end of next Adventure' };
      hero = addTempBuff(hero, { initiativeDelta: +1 }, 'Vision Quest (Initiative)');
      break;
    case 3:
      reward = { id: 'vq_spirit', text: '+1 Spirit until end of next Adventure' };
      hero = addTempBuff(hero, { spiritDelta: +1 }, 'Vision Quest (Spirit)');
      break;
    case 4:
      reward = { id: 'vq_xp', text: '+25 XP' };
      hero = addXp(hero, 25);
      break;
    case 5:
      reward = { id: 'vq_grit', text: 'Gain 1 Grit' };
      hero = addGrit(hero, 1);
      break;
    case 6:
      reward = { id: 'vq_refresh_opa', text: 'Recover one Once-per-Adventure ability' };
      hero = refreshOncePerAdventure(hero);
      break;
    default:
      reward = { id: 'vq_none', text: 'No reward' };
  }

  logs.push(`Reward roll=${r}: ${reward.text}`);

  if (posseApi?.updateHero) {
    const id = heroId || hero0.id || hero0.localId;
    posseApi.updateHero(id, hero);
  }
  return { ok: true, log: logs.join(' '), reward, hero };
}

// ==========================================================
// =================== SHOP DATA HELPERS ====================
// ==========================================================

/** UI data for the Medicine Man tab */
export const medicineManServices = [
  {
    id: 'spirit_cleansing',
    name: 'Spirit Cleansing',
    type: 'service',
    cost: { darkStone: 'D6' },
    description: 'Choose Madness, Curse, or Mutation. Pay D6 Dark Stone, roll 1d6 for the outcome.',
    requirement: 'Available to any visitor.',
    resultTable: {
      1: 'Not healed; gain D3 Mutations as you are possessed bya corrupted Spirit.',
      2: 'Not healed.',
      3: 'Not healed.',
      4: 'Healed.',
      5: 'Healed.',
      6: 'Healed; also gain +1 Max Sanity as you bond with your Spirit Guide.',
    },
  },
  {
    id: 'vision_quest',
    name: 'Vision Quest',
    type: 'service',
    cost: { gold: 0 },
    description: 'Spirit 5+ test. If you lack a Spirit Guide, roll to gain one. On success of the Spirit Test, to obtain the listed Bonus to use Once during the next Adventure.',
    requirement: 'Pass Spirit 5+.',
    resultTable: {
      1: 'Beaver: Do not Discard a Sidebag Token just used.',
	  2: 'Wolf: Roll 5 Extra Dice for a Scavenge Test.', 
      3: 'Eagle: Discard and Re-draw a Threat or Darkness card.',
      4: 'Mouse: Reveal 2 extra Exploration Toeksn and choose which to use.',
      5: 'Crow: All Heroes are +3 Initiative in the first turn of an Ambush',
      6: 'Snake: Gain one additional Starting Upgrade for your Hero Class for one turn. (do not gain/change Starting Gear from it.',
    },
  },
];

/** Optional aura list (leave empty if you don’t have them yet) */
export const medManAuras = [];
