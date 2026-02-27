// src/utils/sanitizeHero.js
import getLevelingChart from '../data/getLevelingChart';
import { gearCards } from '../data/items/gearCards';
import churchBlessedAuras from '../data/townLocations/FrontierTown/Church/churchBlessedAuras.js';

// small helpers
const isEmptySlot = (x) =>
  !x || x.name === 'Empty Slot' || /^empty-/i.test(String(x?.id || ''));

const normStatThresholds = (statsObj = {}) => {
  const out = { ...statsObj };
  const ensure = (k, v) => {
    if (typeof out[k] === 'undefined' || out[k] === null || out[k] === '') out[k] = v;
  };
  ensure('Melee To-Hit', out['Melee To-Hit'] ?? '4+');
  ensure('Ranged To-Hit', out['Ranged To-Hit'] ?? '4+');
  ensure('Defense', out['Defense'] ?? '4+');
  ensure('Willpower', out['Willpower'] ?? '5+');
  ensure('Armor', out['Armor'] ?? '—');
  ensure('Spirit Armor', out['Spirit Armor'] ?? '—');
  return out;
};

export function sanitizeHero(inputHero) {
  if (!inputHero) return null;
  const hero = { ...inputHero };

  // ---------------- Core stats with safe defaults ----------------
  const stats = normStatThresholds({
    Agility:    hero.stats?.Agility    ?? 2,
    Cunning:    hero.stats?.Cunning    ?? 2,
    Spirit:     hero.stats?.Spirit     ?? 2,
    Strength:   hero.stats?.Strength   ?? 2,
    Lore:       hero.stats?.Lore       ?? 2,
    Luck:       hero.stats?.Luck       ?? 2,
    Initiative: hero.stats?.Initiative ?? hero.initiative ?? 4,

    // thresholds may already exist on hero.stats – normStatThresholds fills blanks
    'Melee To-Hit' : hero.stats?.['Melee To-Hit'],
    'Ranged To-Hit': hero.stats?.['Ranged To-Hit'],
    'Defense'      : hero.stats?.Defense,
    'Willpower'    : hero.stats?.Willpower,
    'Armor'        : hero.stats?.Armor,
    'Spirit Armor' : hero.stats?.['Spirit Armor'],
  });

  // ---------------- Gear normalization ----------------
  const standardSlots = [
    'Main Hand', 'Off Hand', 'Head', 'Torso', 'Coat',
    'Gloves', 'Hands', 'Pants', 'Feet', 'Shoulders',
    'Face', 'Extra 1', 'Extra 2'
  ];

  // Use existing gear as-is; if given as array, key by slot; do not rewrite effects/mods
  let fixedGear = {};
  if (Array.isArray(hero.gear)) {
    for (const item of hero.gear) {
      if (!item || !item.id) continue;
      const slot = item.slot || `Extra ${Object.keys(fixedGear).length + 1}`;
      fixedGear[slot] = { ...item, slot };
    }
  } else if (hero.gear && typeof hero.gear === 'object') {
    fixedGear = { ...hero.gear };
  }

  // Fill missing standard slots with explicit Empty Slot placeholders
  // BUT also preserve any extra slots (Blessed Aura, Necklace, Ring, Belt, etc.)
  const gear = {};
  for (const slot of standardSlots) {
    const item = fixedGear[slot];
    gear[slot] = item && item.id
      ? { ...item, slot }
      : {
          id: `empty-${slot.replace(/\s+/g, '').toLowerCase()}`,
          name: 'Empty Slot',
          slot,
        };
  }
  // Preserve non-standard slots that have real items (e.g. Blessed Aura, Ring, Belt, etc.)
  for (const [slot, item] of Object.entries(fixedGear)) {
    if (standardSlots.includes(slot)) continue; // already handled
    if (item && item.id && !isEmptySlot(item)) {
      gear[slot] = { ...item, slot };
    }
  }

  // ---- Fix stale Blessed Aura data: ensure mods/name match the canonical aura definition ----
  const isAuraItem = (it) =>
    it && !isEmptySlot(it) && (
      String(it.id || '').startsWith('church_aura_') ||
      (Array.isArray(it.tags) && it.tags.includes('Blessed Aura') && it.name !== 'Empty Slot')
    );

  const fixAura = (item) => {
    if (!item) return item;
    const auraList = Array.isArray(churchBlessedAuras) ? churchBlessedAuras : [];
    // Match by id first, then by name substring
    const canonical = auraList.find(a => a.id === item.id) ||
      auraList.find(a => item.name && item.name.includes(a.name.replace(/\s*\(.*\)$/, '')));
    if (canonical) {
      item.mods = canonical.mods ? { ...canonical.mods } : {};
      item.description = canonical.effect || '';
      item.name = canonical.name.replace(/\s*\(.*\)$/, '');
      item.slot = 'Blessed Aura';
      delete item.effects;
    }
    return item;
  };

  const auraInGear = gear['Blessed Aura'];
  if (isAuraItem(auraInGear)) fixAura(auraInGear);

  // ---------------- Inventory normalization ----------------
  let inventory = [];
  if (Array.isArray(hero.inventory)) {
    inventory = hero.inventory.filter(i => i && typeof i === 'object');
  } else if (hero.inventory && typeof hero.inventory === 'object') {
    inventory = Object.values(hero.inventory).filter(i => i && typeof i === 'object');
  }

  // Fix stale aura items in inventory too
  for (let i = 0; i < inventory.length; i++) {
    if (isAuraItem(inventory[i])) {
      inventory[i] = fixAura({ ...inventory[i] });
    }
  }

  // ---------------- Starting items (one-time auto-equip) ----------------
  // We *always* add starting items to inventory if missing.
  // We *only* auto-equip the first time sanitize runs (_startingGearApplied flag).
  const alreadyApplied = !!hero._startingGearApplied;
  let startingApplied = alreadyApplied;

  if (hero.classCard?.startingItems?.length) {
    for (const itemName of hero.classCard.startingItems) {
      const card = gearCards.find((g) => g.name === itemName);
      if (!card) continue;

      // ensure the item exists in inventory without duplicating
      if (!inventory.some((i) => i.name === card.name)) {
        inventory.push({ ...card });
      }

      // auto-equip only once (initial sanitize)
      if (!alreadyApplied && card.slot && isEmptySlot(gear[card.slot])) {
        gear[card.slot] = { ...card, slot: card.slot };
        startingApplied = true;
      }
    }
  }

  // ---------------- Conditions / skills / level track passthrough ----------------
  const injuries   = (hero.injuries  ?? []).filter(c => c && typeof c === 'object');
  const madness    = (hero.madness   ?? []).filter(c => c && typeof c === 'object');
  const mutations  = (hero.mutations ?? []).filter(c => c && typeof c === 'object');
  const skills     = (hero.skills    ?? []).filter(s => typeof s === 'string' || typeof s === 'object');
  const levelTrack = hero.levelTrack ?? {};

  // ---------------- Corruption overflow placeholder mutations ----------------
  let maxCorruption = hero.maxCorruption ?? 5;
  // If any equipped item supplies Max Corruption in a mods/effects-like object, try to add it
  for (const it of Object.values(gear)) {
    const mods = (it && typeof it === 'object' && it.mods && typeof it.mods === 'object') ? it.mods : null;
    const effs = (!mods && it && typeof it.effects === 'object') ? it.effects : null;
    const add = (mods?.['Max Corruption'] ?? effs?.['Max Corruption']);
    if (typeof add === 'number' && Number.isFinite(add)) maxCorruption += add;
  }

  let currentCorruption = hero.currentCorruption ?? 0;
  const newMutations = [];
  if (currentCorruption >= maxCorruption) {
    const overflowCount = Math.floor(currentCorruption / maxCorruption);
    currentCorruption = currentCorruption % maxCorruption;
    for (let i = 0; i < overflowCount; i++) {
      newMutations.push({
        name: 'Mutation — Roll Needed',
        description: 'Gained from Corruption overflow. Roll on the Mutation chart.',
        source: 'Corruption Overflow',
      });
    }
  }

  // ---------------- Final shape ----------------
  return {
    ...hero,

    // normalized
    stats,
    gear,
    inventory,
    injuries,
    madness,
    mutations: [...mutations, ...newMutations],
    skills,
    levelTrack,

    // one-time starter flag
    _startingGearApplied: startingApplied,

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
export default sanitizeHero;
