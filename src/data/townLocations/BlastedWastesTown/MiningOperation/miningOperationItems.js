// src/data/townLocations/BlastedWastesTown/MiningOperation/miningOperationItems.js
// Purchase Items: Mining Gear & Explosives + Excavation Equipment

export default [
  // ── Mining Gear & Explosives ──────────────────────────────────────────
  {
    id: 'mo_pick_axe',
    name: 'Pick Axe',
    type: 'gear',
    cost: { gold: 900 },
    slot: 'Hand Weapon',
    tags: ['Gear', 'Hand Weapon', 'Melee'],
    weight: 1,
    effects: [
      '+1 Combat.',
      'Any time you find Dark Stone, gain 1 extra.',
    ],
    modifiers: { combat: 1 },
  },

  {
    id: 'mo_blast_charges',
    name: 'Blast Charges',
    type: 'gear',
    cost: { gold: 200 },
    slot: 'Tokens',
    tags: ['Gear', 'Explosive', 'Tokens'],
    effects: [
      'Gain 1 Dynamite Token.',
    ],
  },

  // ── Excavation Equipment ──────────────────────────────────────────────
  {
    id: 'mo_flash_powder',
    name: 'Flash Powder',
    type: 'gear',
    cost: { gold: 75 },
    slot: 'Tokens',
    tags: ['Gear', 'Flash', 'Tokens'],
    effects: [
      'Gain 1 Flash Token.',
    ],
  },

  {
    id: 'mo_laser_drill',
    name: 'Laser Drill',
    type: 'gear',
    cost: { gold: 2250 },
    slot: 'Hand Weapon',
    tags: ['Gear', 'Hand Weapon', 'Melee'],
    weight: 1,
    effects: [
      '+1 Combat.',
      'Your Melee Attacks use the D8 To Hit and are Damage +1.',
      'Whenever you draw 1 or more Scavenge cards, you may draw 1 extra.',
    ],
    modifiers: { combat: 1, meleeDamageBonus: 1, meleeToHitDie: 'D8' },
  },

  {
    id: 'mo_scrap_thrower',
    name: 'Scrap Thrower',
    type: 'gear',
    cost: { gold: 3200 },
    slot: 'Gun',
    tags: ['Gear', 'Gun', 'Rifle', 'Rust'],
    weight: 2,
    twoHanded: true,
    range: 10,
    shots: 2,
    effects: [
      'Range: 10. Shots: 2. Damage +2.',
      'You must discard 1 Scrap Token for each Shot fired.',
      'Every model adjacent to the target also takes 1 Hit that does D6+1 Damage.',
    ],
    modifiers: { damageBonus: 2 },
  },

  {
    id: 'mo_scrap_heap',
    name: 'Buy From the Scrap Heap',
    type: 'gear',
    cost: { gold: 200 },
    slot: 'Tokens',
    tags: ['Scrap', 'Tokens'],
    effects: [
      'When mining through the rock and sand, countless tons of old scrap is unearthed and piled high in the search for valuable tech and salvage.',
      'Gain 1D6 Scrap Tokens.',
    ],
  },
];
