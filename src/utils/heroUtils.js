// src/utils/sanitizeHero.js
import getLevelingChart from '../data/getLevelingChart';
import gearCards from '../data/items/gearCards';

// --- tiny helpers ---
const uid = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

const toNumberLoose = (v) => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const m = v.replace(/[, ]/g, '').match(/-?\d+(\.\d+)?/);
    return m ? Number(m[0]) : 0;
  }
  return 0;
};

// Parse a few simple "-1 Agility and Strength" style lines into { Agility:-1, Strength:-1 }
const STAT_MAP = new Map([
  ['agility', 'Agility'],
  ['strength', 'Strength'],
  ['cunning', 'Cunning'],
  ['lore', 'Lore'],
  ['spirit', 'Spirit'],
  ['luck', 'Luck'],
  ['move', 'Move'],
  ['initiative', 'Initiative'],
  ['defense', 'Defense'],
  ['willpower', 'Willpower'],
  ['armor', 'Armor'],
  ['spirit armor', 'Spirit Armor'],
  ['max grit', 'Grit'],
]);
const NUM = /([+-]?\d+)/;
function effectStringToEffects(txt = '') {
  const s = String(txt).toLowerCase();

  // pattern: "±N X and Y"
  let m = s.match(new RegExp(`${NUM.source}\\s+([a-z ]+?)\\s+and\\s+([a-z ]+?)(\\W|$)`));
  if (m) {
    const n = Number(m[1]);
    const a = STAT_MAP.get(m[2].trim());
    const b = STAT_MAP.get(m[3].trim());
    const out = {};
    if (a) out[a] = n;
    if (b) out[b] = n;
    if (Object.keys(out).length) return out;
  }
  // pattern: "±N X"
  m = s.match(new RegExp(`${NUM.source}\\s+([a-z ]+?)(\\W|$)`));
  if (m) {
    const n = Number(m[1]);
    const k = STAT_MAP.get(m[2].trim());
    if (k) return { [k]: n };
  }
  return {};
}

export function sanitizeHero(inputHero) {
  if (!inputHero) return null;
  const hero = { ...inputHero };

  // ---------------- Core stats with safe defaults ----------------
  const stats = {
    Agility:    hero.stats?.Agility    ?? 2,
    Cunning:    hero.stats?.Cunning    ?? 2,
    Spirit:     hero.stats?.Spirit     ?? 2,
    Strength:   hero.stats?.Strength   ?? 2,
    Lore:       hero.stats?.Lore       ?? 2,
    Luck:       hero.stats?.Luck       ?? 2,
    Initiative: hero.stats?.Initiative ?? hero.initiative ?? 4,
  };

  // TEMP defaults for threshold-ish tiles (until each class card fills them)
  const thresholdDefaults = {
    'Melee To-Hit' : hero.stats?.['Melee To-Hit']  ?? '4+',
    'Ranged To-Hit': hero.stats?.['Ranged To-Hit'] ?? '4+',
    'Defense'      : hero.stats?.Defense           ?? '4+',
    'Willpower'    : hero.stats?.Willpower         ?? '5+',
    'Armor'        : hero.stats?.Armor             ?? '—',
    'Spirit Armor' : hero.stats?.['Spirit Armor']  ?? '—',
  };
  for (const [k, v] of Object.entries(thresholdDefaults)) {
    if (typeof stats[k] === 'undefined') stats[k] = v;
  }

  // ---------------- Gear normalization ----------------
  const standardSlots = [
    'Main Hand', 'Off Hand', 'Head', 'Torso', 'Coat',
    'Gloves', 'Hands', 'Pants', 'Feet', 'Shoulders',
    'Face', 'Extra 1', 'Extra 2'
  ];

  // Normalize hero.gear to an object keyed by slot; ensure we use `mods` (not `effects`)
  let fixedGear = {};
  let overflowSlotItems = []; // items that collide on a slot, spill later to inventory
  if (Array.isArray(hero.gear)) {
    for (const item of hero.gear) {
      if (!item) continue;
      const slot = item.slot || `Extra ${Object.keys(fixedGear).length + 1}`;
      const mods =
        (item.mods && typeof item.mods === 'object') ? item.mods :
        (item.effects && typeof item.effects === 'object') ? item.effects :
        {};
      const id = item.id || uid();
      // if collides, stash to overflow; don't clobber the existing one
     if (fixedGear[slot]) {
       overflowSlotItems.push({ ...item, id, slot, mods });
     } else {
       fixedGear[slot] = { ...item, id, slot, mods };
     }
      delete fixedGear[slot].effects; // prevent confusion
    }
  } else if (hero.gear && typeof hero.gear === 'object') {
    for (const [slot, item] of Object.entries(hero.gear)) {
      if (!item) continue;
      const mods =
        (item.mods && typeof item.mods === 'object') ? item.mods :
        (item.effects && typeof item.effects === 'object') ? item.effects :
        {};
      const id = item.id || uid();
     if (fixedGear[slot]) {
      overflowSlotItems.push({ ...item, id, slot, mods });
     } else {
       fixedGear[slot] = { ...item, id, slot, mods };
     }
      delete fixedGear[slot].effects;
    }
  }

  // Keep every observed slot (don’t drop non-standard), plus your standards
 const gear = {};
 const allSlots = Array.from(new Set([...standardSlots, ...Object.keys(fixedGear)]));
 for (const slot of allSlots) {
    const item = fixedGear[slot];
    gear[slot] = item && item.id
      ? { ...item }
      : { id: `empty-${slot.replace(/\s+/g, '').toLowerCase()}`, name: 'Empty Slot', slot, mods: {} };
  }

  // ---------------- Inventory normalization ----------------
  let inventory = [];
  if (Array.isArray(hero.inventory)) {
    inventory = hero.inventory.filter(i => i && typeof i === 'object').map(it => {
      const mods =
        (it.mods && typeof it.mods === 'object') ? it.mods :
        (it.effects && typeof it.effects === 'object') ? it.effects :
        {};
      const id = it.id || uid();
      const clean = { ...it, id, mods };
      delete clean.effects;
      return clean;
    });
  } else if (hero.inventory && typeof hero.inventory === 'object') {
    inventory = Object.values(hero.inventory)
      .filter(i => i && typeof i === 'object')
      .map(it => {
        const mods =
          (it.mods && typeof it.mods === 'object') ? it.mods :
          (it.effects && typeof it.effects === 'object') ? it.effects :
          {};
        const id = it.id || uid();
        const clean = { ...it, id, mods };
        delete clean.effects;
        return clean;
      });
  }
  
  // Add any overflow gear (slot collisions) to inventory to avoid silent loss
 if (overflowSlotItems.length) {
   // Avoid duplicate-by-name collisions in inventory
   const invNames = new Set(inventory.map(i => (i.name || '').toLowerCase()));
   for (const it of overflowSlotItems) {
     if (!invNames.has((it.name || '').toLowerCase())) {
       inventory.push({ ...it });
       invNames.add((it.name || '').toLowerCase());
     }
   }
 }

  // ---------------- Starting items from class card ----------------
  // Only auto-equip starting items on true first-time init:
 // - no equipped gear (all standard slots empty) AND no inventory yet.
 if (hero.classCard?.startingItems?.length) {
   const hasAnyEquipped =
     Object.values(gear).some(it => it && it.name && it.name !== 'Empty Slot');
   const hasAnyInventory = Array.isArray(inventory) && inventory.length > 0;
   const firstTimeInit = !hasAnyEquipped && !hasAnyInventory;

   if (firstTimeInit) {
     for (const itemName of hero.classCard.startingItems) {
       const item = gearCards.find(g => g.name === itemName);
       if (!item) continue;
       const mods =
         (item.mods && typeof item.mods === 'object') ? item.mods :
         (item.effects && typeof item.effects === 'object') ? item.effects :
         {};
       const asItem = { ...item, id: item.id || uid(), mods };
       delete asItem.effects;
       if (item.slot && gear[item.slot]?.name === 'Empty Slot') {
         gear[item.slot] = { ...asItem, slot: item.slot };
       } else if (!inventory.some(i => (i.name || '').toLowerCase() === (asItem.name || '').toLowerCase())) {
         inventory.push(asItem);
       }
     }
   }
 }

  // ---------------- Conditions: unify injuries/madness/mutations ----------------
  const asArray = (v) => Array.isArray(v) ? v : [];
  const oldInj = asArray(hero.injuries);
  const oldMad = asArray(hero.madness);
  const oldMut = asArray(hero.mutations);

  const existingConds = asArray(hero.conditions); // if already unified
  const normalizedExisting = existingConds.map(c => {
    const id = c.id || uid();
    const type = c.type || (c.category || 'Condition');
    const name = c.name || 'Unnamed';
    const effectText = c.effectText || c.effect || '';
    const effects = (c.effects && typeof c.effects === 'object')
      ? c.effects
      : effectStringToEffects(effectText);
    const temporary = Boolean(
      c.temporary ||
      /until the end of the adventure|until the start of your next mission/i.test(effectText)
    );
    return { ...c, id, type, name, effectText, effects, temporary };
  });

  const mapLegacy = (arr, type) => arr.map((c) => {
    const id = c?.id || uid();
    const name = c?.name || 'Unnamed';
    const effectText = c?.effectText || c?.effect || '';
    const effects =
      (c?.effects && typeof c.effects === 'object') ? c.effects : effectStringToEffects(effectText);
    const temporary = Boolean(
      c?.temporary ||
      /until the end of the adventure|until the start of your next mission/i.test(effectText)
    );
    return { id, type, name, effectText, effects, temporary };
  });

  // Merge legacy arrays + existing unified conditions
  const mergedConditions = [
    ...normalizedExisting,
    ...mapLegacy(oldInj, 'Injury'),
    ...mapLegacy(oldMad, 'Madness'),
    ...mapLegacy(oldMut, 'Mutation'),
  ];

  // Deduplicate by (type+name+effectText)
  const seenKey = new Set();
  const conditions = mergedConditions.filter(c => {
    const k = `${c.type}::${c.name}::${c.effectText || ''}`.toLowerCase();
    if (seenKey.has(k)) return false;
    seenKey.add(k);
    return true;
  });

  // ---------------- Corruption overflow -> add placeholder mutations ----------------
  let maxCorruption = hero.maxCorruption ?? 5;
  // If any gear gives maxCorruption in `mods`, add it
  const corruptionItems = Object.values(gear).filter(i => i?.mods && toNumberLoose(i.mods['Max Corruption']) !== 0);
  for (const item of corruptionItems) {
    maxCorruption += toNumberLoose(item.mods['Max Corruption']);
  }

  let currentCorruption = hero.currentCorruption ?? 0;
  const overflowPlaceholders = [];
  if (currentCorruption >= maxCorruption) {
    const overflowCount = Math.floor(currentCorruption / maxCorruption);
    currentCorruption = currentCorruption % maxCorruption;
    for (let i = 0; i < overflowCount; i++) {
      overflowPlaceholders.push({
        id: uid(),
        type: 'Mutation',
        name: 'Mutation — Roll Needed',
        effectText: 'Gained from Corruption overflow. Roll on the Mutation chart.',
        effects: {},
        temporary: false,
        source: 'Corruption Overflow',
      });
    }
  }

  // ---------------- Skills / Level Track / Misc ----------------
  const skills = (hero.skills ?? [])
    .filter(s => s && (typeof s === 'string' || typeof s === 'object'));

  const levelTrack = hero.levelTrack ?? {};

  // ---------------- Final shape ----------------
  return {
    ...hero,
    stats,
    gear,
    inventory,
    skills,
    levelTrack,

    // unified conditions (legacy arrays folded in)
    conditions: [...conditions, ...overflowPlaceholders],

    // keep legacy arrays around (optional – safe to drop if you’re done migrating)
    injuries: oldInj,
    madness:  oldMad,
    mutations: oldMut, // note: display uses `conditions`; legacy kept for backwards compat

    // top-line resources / caps
    Combat: hero.Combat ?? hero.combat ?? 1,
    Move: hero.Move ?? hero.move ?? 0,
    Health: hero.Health ?? hero.health ?? 10,
    Sanity: hero.Sanity ?? hero.sanity ?? 10,
    Grit: hero.Grit ?? 2,

    maxHealth: hero.maxHealth ?? hero.health ?? 10,
    currentHealth: hero.currentHealth ?? hero.health ?? 10,
    maxSanity: hero.maxSanity ?? hero.sanity ?? 10,
    currentSanity: hero.currentSanity ?? hero.sanity ?? 10,

    maxCorruption,
    currentCorruption,
    corruption: currentCorruption,

    grit: hero.currentGrit ?? 0,
    heroClass: (hero.heroClass ?? 'Unknown').replace(/\s+/g, ''),
    name: hero.name ?? 'Unnamed Hero',
  };
}

export const loadAndSanitizeHero = sanitizeHero;
