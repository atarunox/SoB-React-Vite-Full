// src/utils/locationHandlers/indianTradingPostServices.js
import { calculateCurrentStats } from '../calculateStats';

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
function addXp(hero, amt) {
  const xp0 = asNumber(hero?.xp, 0);
  return { ...hero, xp: xp0 + Math.max(0, asNumber(amt, 0)) };
}

// Spirit Guide name lookup
function getSpiritGuideName(roll) {
  const map = {
    1: 'Beaver',
    2: 'Wolf',
    3: 'Eagle',
    4: 'Mouse',
    5: 'Crow',
    6: 'Snake',
  };
  return map[roll] || 'Unknown';
}

// Create Spirit Guide buff (for 1 use during next adventure)
function createSpiritGuideBuff(guideRoll) {
  const animal = getSpiritGuideName(guideRoll);
  const effects = {};

  // Each guide has specific buff effects
  if (guideRoll === 1) {
    // Beaver: Do not Discard a Sidebag Token just used
    effects.sideBagProtection = true;
  } else if (guideRoll === 2) {
    // Wolf: Roll 5 Extra Dice for a Scavenge Test
    effects.scavengeDiceBonus = 5;
  } else if (guideRoll === 3) {
    // Eagle: Discard and Re-draw a Threat or Darkness card
    effects.redrawCard = true;
  } else if (guideRoll === 4) {
    // Mouse: Reveal 2 extra Exploration Tokens and choose which to use
    effects.explorationTokensBonus = 2;
  } else if (guideRoll === 5) {
    // Crow: All Heroes are +3 Initiative in the first turn of an Ambush
    effects.ambushInitiativeBonus = 3;
  } else if (guideRoll === 6) {
    // Snake: Gain one additional Starting Upgrade for your Hero Class for one turn
    effects.extraStartingUpgrade = true;
  }

  return {
    id: `spiritGuide_${animal.toLowerCase()}_${Date.now()}`,
    type: 'buff',
    name: `Spirit Guide: ${animal}`,
    active: true,
    removable: false,
    effects,
    usesRemaining: 1,
    maxUses: 1,
    source: 'Indian Trading Post - Vision Quest',
    createdAt: Date.now(),
  };
}

// ==========================================================
// ===============  PUBLIC SERVICE HANDLERS  ================
// ==========================================================

/**
 * Spirit Cleansing — pay D6 Dark Stone and roll 1d6 for the outcome
 * Uses io object for prompts
 */
export async function performSpiritCleansing({
  posseApi,
  hero: heroInput,
  heroId,
  io, // {roll, promptChoice, notify}
} = {}) {
  const hero0 = heroInput ?? (heroId ? posseApi?.getHero?.(heroId) : null);
  if (!hero0) return { ok: false, log: 'Hero not found' };

  // Prompt for target ailment
  const targetIdx = await io?.promptChoice?.(
    'Spirit Cleansing — Choose one ailment to attempt to heal:',
    [{ label: 'Madness' }, { label: 'Curse' }, { label: 'Mutation' }]
  );
  if (targetIdx < 0) return { ok: false, log: 'Cancelled' };
  const targets = ['Madness', 'Curse', 'Mutation'];
  const target = targets[targetIdx];

  // Roll for Dark Stone cost
  const costRolls = await io?.roll?.(1, 6, 'Spirit Cleansing Cost — Roll D6 for Dark Stone cost (or blank to auto-roll)');
  const cost = costRolls?.[0] || DICE.d6();
  let hero = spendDarkStone(hero0, cost);

  // Roll for outcome
  const outcomeRolls = await io?.roll?.(1, 6, 'Spirit Cleansing Outcome — Roll D6 for result (1=gain mutations, 2-3=not healed, 4-5=healed, 6=healed+bonus) (or blank to auto-roll)');
  const r = outcomeRolls?.[0] || DICE.d6();

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

  // Notify user
  if (io?.notify) {
    io.notify(log.join(' '));
  }

  return { ok: true, log: log.join(' '), hero };
}

/**
 * Vision Quest — proper flow with Spirit Guide system
 * 1. Determine Spirit Guide animal (first time only, stored permanently)
 * 2. Do Spirit 5+ test (roll dice equal to Spirit stat)
 * 3. If pass: grant 25 XP + Spirit Guide buff (1 use)
 */
export async function performVisionQuest({
  posseApi,
  hero: heroInput,
  heroId,
  io, // {roll, promptChoice, notify}
} = {}) {
  const hero0 = heroInput ?? (heroId ? posseApi?.getHero?.(heroId) : null);
  if (!hero0) return { ok: false, log: 'Hero not found' };

  let hero = { ...hero0 };
  const logs = [];

  // STEP 1: Determine Spirit Guide FIRST (before Spirit test)
  let guideValue;
  const existingGuide = hero?.spiritGuide;

  if (!existingGuide) {
    // First time: Roll for permanent Spirit Guide (stored even if test fails)
    const guideRolls = await io?.roll?.(1, 6, 'Spirit Guide — Roll D6 to determine your Spirit Guide animal (1=Beaver, 2=Wolf, 3=Eagle, 4=Mouse, 5=Crow, 6=Snake) (or blank to auto-roll)');
    guideValue = guideRolls?.[0] || DICE.d6();

    hero.spiritGuide = {
      animal: getSpiritGuideName(guideValue),
      roll: guideValue,
      gainedAt: Date.now(),
      source: 'Indian Trading Post - Vision Quest'
    };
    logs.push(`The ${getSpiritGuideName(guideValue)} has chosen you! This is your permanent Spirit Guide.`);
  } else {
    // Already has guide
    guideValue = existingGuide.roll;
    logs.push(`Your Spirit Guide: ${existingGuide.animal}`);
  }

  // STEP 2: Do Spirit 5+ test (roll dice equal to Spirit stat value)
  const currentStats = calculateCurrentStats(hero);
  const spiritValue = currentStats.Spirit || 2;

  const spiritRolls = await io?.roll?.(spiritValue, 6, `Vision Quest Spirit Test — Roll ${spiritValue}D6 for Spirit 5+ test (need at least one 5+) (or blank to auto-roll)`);
  const passed = spiritRolls?.some(roll => roll >= 5);

  if (!passed) {
    logs.push('[Vision Quest] Spirit 5+ test failed. No rewards this time, but your Spirit Guide awaits.');
    if (posseApi?.updateHero) {
      const id = heroId || hero0.id || hero0.localId;
      posseApi.updateHero(id, hero);
    }

    if (io?.notify) {
      io.notify(logs.join(' '));
    }

    return { ok: false, log: logs.join(' '), hero };
  }

  // STEP 3: Spirit test PASSED - grant rewards
  logs.push('[Vision Quest] Spirit 5+ passed!');
  hero = addXp(hero, 25);
  logs.push('Gained 25 XP.');

  // Grant 1 use of Spirit Guide bonus for next adventure
  const guideBuff = createSpiritGuideBuff(guideValue);
  hero = addCondition(hero, guideBuff);
  logs.push(`Granted: ${guideBuff.name} (1 use during next Adventure)`);

  if (posseApi?.updateHero) {
    const id = heroId || hero0.id || hero0.localId;
    posseApi.updateHero(id, hero);
  }

  if (io?.notify) {
    io.notify(logs.join(' '));
  }

  return { ok: true, log: logs.join(' '), spiritGuide: guideValue, hero };
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
      1: 'Not healed; gain D3 Mutations as you are possessed by a corrupted Spirit.',
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
    description: 'Spirit 5+ test. If you lack a Spirit Guide, roll to gain one. On success of the Spirit Test, obtain the listed Bonus to use Once during the next Adventure.',
    requirement: 'Pass Spirit 5+.',
    resultTable: {
      1: 'Beaver: Do not Discard a Sidebag Token just used.',
      2: 'Wolf: Roll 5 Extra Dice for a Scavenge Test.',
      3: 'Eagle: Discard and Re-draw a Threat or Darkness card.',
      4: 'Mouse: Reveal 2 extra Exploration Tokens and choose which to use.',
      5: 'Crow: All Heroes are +3 Initiative in the first turn of an Ambush',
      6: 'Snake: Gain one additional Starting Upgrade for your Hero Class for one turn. (do not gain/change Starting Gear from it)',
    },
  },
];

/** Optional aura list (leave empty if you don't have them yet) */
export const medManAuras = [];
