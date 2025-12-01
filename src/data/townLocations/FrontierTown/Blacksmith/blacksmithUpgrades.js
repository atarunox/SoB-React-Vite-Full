// src/data/townLocations/blacksmithUpgrades.js
export default [
  {
    id: 'bs_upg_dark_stone_inlay',
    name: 'Dark Stone Inlay',
    type: 'upgrade',
    cost: { gold: 700 },
    darkStone: 3,
    tags: ['Dark Stone', 'Upgrade'],
    attachTo: ['Gun', 'Hand Weapon'],
    effects: [
      'Once per Attack with this Weapon, you may Re-roll one To Hit roll.',
    ],
    rules: { uniquePerItem: true },
  },

  {
    id: 'bs_upg_dark_stone_grip',
    name: 'Dark Stone Grip',
    type: 'upgrade',
    cost: { gold: 1200 },
    darkStone: 8,
    tags: ['Dark Stone', 'Upgrade'],
    attachTo: ['Gun', 'Hand Weapon'],
    effects: ['Gun: +1 Shot.', 'Hand Weapon: +1 Combat.'],
    rules: { uniquePerItem: true },
  },

  {
    id: 'bs_upg_dark_stone_barrel',
    name: 'Dark Stone Barrel',
    type: 'upgrade',
    cost: { gold: 225 },
    darkStone: 3,
    tags: ['Dark Stone', 'Upgrade'],
    attachTo: ['Gun'],
    effects: ['Gun gains +4 Range.'],
    rules: { uniquePerItem: true },
  },

  {
    id: 'bs_upg_void_assembly',
    name: 'Void Assembly',
    type: 'upgrade',
    cost: { gold: 2200 },
    darkStone: 15,
    tags: ['Dark Stone', 'Void', 'Upgrade'],
    attachTo: ['Gun'],
    effects: [
      'Once per Fight, add a Peril Die of Damage to a single Hit from this Gun.',
    ],
    rules: { uniquePerItem: true },
  },

  {
    id: 'bs_upg_dark_stone_horseshoes',
    name: 'Dark Stone Horse Shoes',
    type: 'upgrade',
    cost: { gold: 800 },
    darkStone: 4,
    tags: ['Dark Stone', 'Upgrade'],
    attachTo: ['Transport:Animal'],
    effects: [
      'Roll twice on the Traveling Hazard chart and choose one result.',
    ],
    rules: { uniquePerItem: true },
  },

  {
    id: 'bs_rune_protection',
    name: 'Rune of Protection',
    type: 'upgrade',
    cost: { gold: 600 },
    darkStone: 10,
    tags: ['Rune', 'Upgrade'],
    attachTo: ['Any'],
    effects: [
      'Once per Adventure: automatically pass a Defense roll.',
    ],
    rules: { uniquePerItem: true, rune: true, oncePerAdventure: true },
  },

  {
    id: 'bs_rune_fortitude',
    name: 'Rune of Fortitude',
    type: 'upgrade',
    cost: { gold: 600 },
    darkStone: 10,
    tags: ['Rune', 'Upgrade'],
    attachTo: ['Any'],
    effects: [
      'Once per Adventure: automatically pass a Willpower roll.',
    ],
    rules: { uniquePerItem: true, rune: true, oncePerAdventure: true },
  },

  {
    id: 'bs_rune_regeneration',
    name: 'Rune of Regeneration',
    type: 'upgrade',
    cost: { gold: 1800 },
    darkStone: 20,
    tags: ['Rune', 'Upgrade'],
    attachTo: ['Any'],
    effects: [
      'Heal 1 Wound at the start of each turn (unless KO’d).',
      'Destroy this Rune to Heal an Injury or Mutation.',
    ],
    rules: { uniquePerItem: true, rune: true },
  },
];
