// src/data/townLocations/blacksmithItems.js
export default [
  {
    id: 'bs_tomb_chest',
    name: 'Tomb Chest',
    type: 'gear',
    cost: { gold: 600 },
    darkStone: 0,
    slot: 'Container',
    tags: ['Container'],
    weight: 1,
    effects: [
      'Holds up to 8 Dark Stone.',
      'Dark Stone inside does not cause Corruption Hits.',
    ],
  },

  {
    id: 'bs_dark_stone_bullets',
    name: 'Dark Stone Bullets',
    type: 'gear',
    cost: { gold: 200 },
    darkStone: 1,
    slot: 'Ammo',
    tags: ['Dark Stone', 'Ammo'],
    effects: [
      'Lasts one Adventure (replaces current Ammo).',
      'All Gun Hits are +1 Damage.',
    ],
    rules: { consumesOnUse: true },
  },

  {
    id: 'bs_dark_stone_buckle',
    name: 'Dark Stone Buckle',
    type: 'gear',
    cost: { gold: 450 },
    darkStone: 3,
    slot: 'Belt',
    tags: ['Dark Stone', 'Clothing'],
    effects: [
      'When rolling Mutation Chart, roll twice and choose one.',
    ],
  },

  {
    id: 'bs_void_plate',
    name: 'Void Plate',
    type: 'gear',
    cost: { gold: 3800 },
    darkStone: 12,
    slot: 'Torso',
    tags: ['Dark Stone', 'Clothing', 'Void', 'Armor'],
    weight: 2,
    effects: ['-1 Agility', 'Armor 4+'],
    modifiers: { agility: -1, armor: '4+' },
  },

  {
    id: 'bs_void_hammer',
    name: 'Void Hammer',
    type: 'gear',
    cost: { gold: 4800 },
    darkStone: 24,
    slot: 'Hand Weapon',
    tags: ['Dark Stone', 'Void', 'Melee'],
    twoHanded: true,
    weight: 2,
    effects: [
      '+3 Damage with Combat Hits.',
      'Adjacent Enemies take 1 automatic Wound (ignores Defense).',
    ],
    modifiers: {
      combatDamageBonus: 3,
      splashAutoWoundAdjacent: 1,
      ignoreDefense: true,
    },
  },
];
