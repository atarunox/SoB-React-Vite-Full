// src/utils/locationHandlers/indianTradingPostServices.js
import { calculateCurrentStats } from '../calculateStats';

// ============================================================================
// INDIAN TRADING POST - IMPLEMENTATION STATUS
// ============================================================================
//
// COMPLETED:
// ✓ Spirit Cleansing service with proper flow:
//   - Choose ailment type (Madness/Curse/Mutation)
//   - Select specific ailment from active list
//   - Roll D6 for Dark Stone cost with confirmation
//   - Roll D6 for healing outcome (1=mutations, 2-3=fail, 4-5=heal, 6=heal+bonus)
//   - Finds ailments in all storage locations (conditions.madness, madness, etc.)
//   - Removes specific targeted ailment on success
//
// ✓ Vision Quest service with proper flow:
//   - Roll D6 for permanent Spirit Guide animal (first time only)
//   - Spirit 5+ test using proper skill mechanics (roll Spirit-value D6, pass if any 5+)
//   - Store permanent Spirit Guide in hero.spiritGuide
//   - Grant 25 XP + Spirit Guide buff (1 use) on success
//
// ✓ Spirit Guide system:
//   - Permanent storage: hero.spiritGuide = {animal, roll, gainedAt, source}
//   - Temporary buffs: Added to hero.conditions with usesRemaining
//   - Buffs display: ConditionsTab shows all Spirit Guide buffs with usage info
//   - Beaver: Sidebag token protection (implemented in GearTab.jsx)
//   - Crow: +3 Initiative first turn of Ambush (implemented in Buffs tab)
//   - Eagle: Redraw Threat/Darkness cards (implemented in DMDarknessDrawer & DMEnemyPanel)
//   - Snake: Starting Upgrade picker (implemented in ConditionsTab with modal dialog)
//
// ✓ Sidebag token library with 28 tokens and descriptions
// ✓ Token automation (Bandages, Whiskey, Tonic, Grit, etc.)
// ✓ Dice roll prompts for all services (TownTab promptRoll)
//
// PENDING - Spirit Guide adventure mechanics (need UI systems that don't exist):
// [ ] Wolf: +5 dice on Scavenge test (needs Scavenge test UI system)
// [ ] Mouse: +2 Exploration tokens with choice (needs Exploration token UI system)
//
// Note: Wolf and Mouse require game systems (Scavenge tests, Exploration tokens) that
// aren't implemented yet. The buffs are correctly stored and displayed - integration
// points will need to be added when those systems are built.
//
// ============================================================================

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
function removeSpecificAilment(hero, target /* 'Madness'|'Curse'|'Mutation' */, ailmentId) {
  const t = String(target || '').toLowerCase();
  let h = { ...hero };

  // Helper to remove from an array by ID
  const removeFromArray = (arr) => {
    if (!Array.isArray(arr)) return arr;
    const newArr = arr.slice();
    const idx = newArr.findIndex(a => {
      if (typeof a === 'string') return a === ailmentId;
      if (typeof a === 'object' && a) return a.id === ailmentId || a === ailmentId;
      return false;
    });
    if (idx >= 0) newArr.splice(idx, 1);
    return newArr;
  };

  if (t === 'madness') {
    // Check nested conditions.madness
    if (h.conditions?.madness) {
      h.conditions = { ...h.conditions, madness: removeFromArray(h.conditions.madness) };
    }
    // Check legacy hero.madness
    if (h.madness) {
      h.madness = removeFromArray(h.madness);
    }
    // Check flat conditions array
    if (Array.isArray(h.conditions)) {
      h.conditions = h.conditions.filter(c => !(c?.type?.toLowerCase() === 'madness' && (c.id === ailmentId || c === ailmentId)));
    }
  } else if (t === 'curse') {
    // Check nested conditions.curse
    if (h.conditions?.curse) {
      h.conditions = { ...h.conditions, curse: removeFromArray(h.conditions.curse) };
    }
    // Check legacy hero.curses
    if (h.curses) {
      h.curses = removeFromArray(h.curses);
    }
    // Check flat conditions array
    if (Array.isArray(h.conditions)) {
      h.conditions = h.conditions.filter(c => !(c?.type?.toLowerCase() === 'curse' && (c.id === ailmentId || c === ailmentId)));
    }
  } else if (t === 'mutation') {
    // Check nested conditions.mutation
    if (h.conditions?.mutation) {
      h.conditions = { ...h.conditions, mutation: removeFromArray(h.conditions.mutation) };
    }
    // Check legacy hero.mutation
    if (h.mutation) {
      h.mutation = removeFromArray(h.mutation);
    }
    // Check legacy hero.mutations
    if (h.mutations) {
      h.mutations = removeFromArray(h.mutations);
    }
    // Check flat conditions array
    if (Array.isArray(h.conditions)) {
      h.conditions = h.conditions.filter(c => !(c?.type?.toLowerCase() === 'mutation' && (c.id === ailmentId || c === ailmentId)));
    }
  }
  return h;
}

function getAilmentList(hero, target /* 'Madness'|'Curse'|'Mutation' */) {
  const t = String(target || '').toLowerCase();
  const out = [];

  // Helper to push active ailments
  const pushActive = (item) => {
    if (!item) return;
    // Convert strings/numbers to objects
    if (typeof item === 'string' || typeof item === 'number') {
      out.push(item);
    } else if (item && typeof item === 'object') {
      // Only include if not removed/inactive
      if (item.removed !== true && item.active !== false) {
        out.push(item);
      }
    }
  };

  if (t === 'madness') {
    // Check nested conditions.madness
    if (Array.isArray(hero?.conditions?.madness)) {
      hero.conditions.madness.forEach(pushActive);
    }
    // Check legacy hero.madness
    if (Array.isArray(hero?.madness)) {
      hero.madness.forEach(pushActive);
    }
    // Check flat conditions array
    if (Array.isArray(hero?.conditions)) {
      hero.conditions.forEach(c => {
        if (c?.type?.toLowerCase() === 'madness') pushActive(c);
      });
    }
  } else if (t === 'curse') {
    // Check nested conditions.curse
    if (Array.isArray(hero?.conditions?.curse)) {
      hero.conditions.curse.forEach(pushActive);
    }
    // Check legacy hero.curses
    if (Array.isArray(hero?.curses)) {
      hero.curses.forEach(pushActive);
    }
    // Check flat conditions array
    if (Array.isArray(hero?.conditions)) {
      hero.conditions.forEach(c => {
        if (c?.type?.toLowerCase() === 'curse') pushActive(c);
      });
    }
  } else if (t === 'mutation') {
    // Check nested conditions.mutation
    if (Array.isArray(hero?.conditions?.mutation)) {
      hero.conditions.mutation.forEach(pushActive);
    }
    // Check legacy hero.mutation
    if (Array.isArray(hero?.mutation)) {
      hero.mutation.forEach(pushActive);
    }
    // Check legacy hero.mutations
    if (Array.isArray(hero?.mutations)) {
      hero.mutations.forEach(pushActive);
    }
    // Check flat conditions array
    if (Array.isArray(hero?.conditions)) {
      hero.conditions.forEach(c => {
        if (c?.type?.toLowerCase() === 'mutation') pushActive(c);
      });
    }
  }

  return out;
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
 * Spirit Cleansing - Medicine Man service to heal ailments
 *
 * Flow:
 * 1. Choose ailment type (Madness/Curse/Mutation)
 * 2. Select specific ailment from active list
 * 3. Roll D6 for Dark Stone cost
 * 4. Confirm payment
 * 5. Roll D6 for healing outcome
 *
 * @param {Object} params
 * @param {Object} params.posseApi - Posse API with getHero and updateHero methods
 * @param {Object} [params.hero] - Hero object (alternative to heroId)
 * @param {string} [params.heroId] - Hero ID to look up
 * @param {Object} params.io - UI interaction object
 * @param {Function} params.io.roll - Dice roll prompt: (n, sides, label) => Promise<number[]>
 * @param {Function} params.io.promptChoice - Choice prompt: (title, options) => Promise<number>
 * @param {Function} params.io.notify - Notification: (message) => void
 * @returns {Promise<{ok: boolean, log: string, hero: Object}>}
 */
export async function performSpiritCleansing({
  posseApi,
  hero: heroInput,
  heroId,
  io, // {roll, promptChoice, notify}
} = {}) {
  const hero0 = heroInput ?? (heroId ? posseApi?.getHero?.(heroId) : null);
  if (!hero0) return { ok: false, log: 'Hero not found' };

  // STEP 1: Choose ailment type
  const targetIdx = await io?.promptChoice?.(
    'Spirit Cleansing — Choose one ailment type to attempt to heal:',
    [{ label: 'Madness' }, { label: 'Curse' }, { label: 'Mutation' }]
  );
  if (targetIdx < 0) return { ok: false, log: 'Cancelled' };
  const targets = ['Madness', 'Curse', 'Mutation'];
  const target = targets[targetIdx];

  // STEP 2: Get list of active ailments of that type
  const ailmentList = getAilmentList(hero0, target);
  if (ailmentList.length === 0) {
    const msg = `No active ${target} to heal.`;
    if (io?.notify) io.notify(msg);
    return { ok: false, log: msg };
  }

  // STEP 3: Choose specific ailment to target
  const ailmentOptions = ailmentList.map((a, i) => {
    if (typeof a === 'string') return { label: a };
    if (typeof a === 'number') return { label: `${target} (roll: ${a})` };
    return { label: a.name || a.title || `${target} ${i + 1}` };
  });

  const ailmentIdx = await io?.promptChoice?.(
    `Spirit Cleansing — Choose which ${target} to attempt to heal:`,
    ailmentOptions
  );
  if (ailmentIdx < 0) return { ok: false, log: 'Cancelled' };

  const selectedAilment = ailmentList[ailmentIdx];

  // Get ailment name and ID for removal
  let ailmentName;
  let ailmentId;

  if (typeof selectedAilment === 'string') {
    ailmentName = selectedAilment;
    ailmentId = selectedAilment;
  } else if (typeof selectedAilment === 'number') {
    ailmentName = `${target} (roll: ${selectedAilment})`;
    ailmentId = selectedAilment;
  } else {
    ailmentName = selectedAilment.name || selectedAilment.title || `${target} ${ailmentIdx + 1}`;
    ailmentId = selectedAilment.id || selectedAilment;
  }

  // STEP 4: Roll for Dark Stone cost
  const costRolls = await io?.roll?.(1, 6, 'Spirit Cleansing Cost — Roll D6 for Dark Stone cost (or blank to auto-roll)');
  const cost = costRolls?.[0] || DICE.d6();

  // STEP 5: Confirm payment
  const currentDarkStone = asNumber(hero0?.darkStone ?? hero0?.resources?.darkStone, 0);
  if (currentDarkStone < cost) {
    const msg = `Not enough Dark Stone. Need ${cost}, have ${currentDarkStone}.`;
    if (io?.notify) io.notify(msg);
    return { ok: false, log: msg };
  }

  const confirmIdx = await io?.promptChoice?.(
    `Spirit Cleansing will cost ${cost} Dark Stone (you have ${currentDarkStone}). Proceed?`,
    [{ label: 'Yes, proceed' }, { label: 'Cancel' }]
  );
  if (confirmIdx !== 0) return { ok: false, log: 'Cancelled' };

  let hero = spendDarkStone(hero0, cost);

  // STEP 6: Roll for healing outcome
  const outcomeRolls = await io?.roll?.(1, 6, `Spirit Cleansing Healing Roll — Roll D6 for healing outcome on ${ailmentName} (1=gain D3 mutations, 2-3=not healed, 4-5=healed, 6=healed+Max Sanity bonus) (or blank to auto-roll)`);
  const r = outcomeRolls?.[0] || DICE.d6();

  const log = [`[Spirit Cleansing] Targeting: ${ailmentName}. Paid ${cost} Dark Stone. Outcome roll=${r}.`];

  if (r === 1) {
    const m = DICE.d3();
    hero = addRandomMutations(hero, m);
    log.push(`Not healed; gained ${m} Mutation(s).`);
  } else if (r === 2 || r === 3) {
    log.push('Not healed.');
  } else if (r === 4 || r === 5) {
    hero = removeSpecificAilment(hero, target, ailmentId);
    log.push(`Healed: ${ailmentName} removed.`);
  } else if (r === 6) {
    hero = removeSpecificAilment(hero, target, ailmentId);
    hero = addMaxSanityBuff(hero, +1, 'Spirit Cleansing (Blessing)');
    log.push(`Healed: ${ailmentName} removed. +1 Max Sanity (shown on Conditions tab).`);
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
 * Vision Quest - Medicine Man service to gain Spirit Guide
 *
 * Flow:
 * 1. Determine Spirit Guide animal (first time only, stored permanently in hero.spiritGuide)
 * 2. Roll Spirit 5+ test (rolls dice equal to hero's Spirit stat value)
 * 3. On success: Grant 25 XP + Spirit Guide buff (1 use for next adventure)
 * 4. On failure: Spirit Guide still saved, but no rewards
 *
 * Spirit Guides:
 * - 1: Beaver (Don't discard sidebag token)
 * - 2: Wolf (+5 dice on Scavenge test)
 * - 3: Eagle (Redraw Threat/Darkness card)
 * - 4: Mouse (+2 Exploration tokens with choice)
 * - 5: Crow (+3 Initiative all heroes first turn of Ambush)
 * - 6: Snake (Gain Starting Upgrade for one turn)
 *
 * @param {Object} params
 * @param {Object} params.posseApi - Posse API with getHero and updateHero methods
 * @param {Object} [params.hero] - Hero object (alternative to heroId)
 * @param {string} [params.heroId] - Hero ID to look up
 * @param {Object} params.io - UI interaction object
 * @param {Function} params.io.roll - Dice roll prompt: (n, sides, label) => Promise<number[]>
 * @param {Function} params.io.promptChoice - Choice prompt: (title, options) => Promise<number>
 * @param {Function} params.io.notify - Notification: (message) => void
 * @returns {Promise<{ok: boolean, log: string, spiritGuide: number, hero: Object}>}
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
