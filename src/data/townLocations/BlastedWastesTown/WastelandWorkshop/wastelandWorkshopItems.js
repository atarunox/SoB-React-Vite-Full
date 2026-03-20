// src/data/townLocations/BlastedWastesTown/WastelandWorkshop/wastelandWorkshopItems.js
// Purchase Items: Rust Items & Equipment

export default [
  {
    id: 'ww_junk_bomb',
    name: 'Junk Bomb',
    type: 'gear',
    cost: { scrap: 4 },
    slot: 'Tokens',
    tags: ['Gear', 'Explosive', 'Tokens'],
    effects: [
      'Gain 1 Junk Bomb Token.',
    ],
  },

  {
    id: 'ww_junk_bomb_satchel',
    name: 'Junk Bomb Satchel',
    type: 'gear',
    cost: { gold: 500 },
    slot: 'Gear',
    tags: ['Gear', 'Container'],
    weight: 1,
    limit: 1,
    effects: [
      'Holds up to 5 Junk Bomb Tokens.',
      'Limit 1.',
    ],
  },

  {
    id: 'ww_workshop_torch',
    name: 'Workshop Torch',
    type: 'gear',
    cost: { gold: 800 },
    slot: 'Gear',
    tags: ['Gear', 'Construction'],
    effects: [
      'You may discard any Item to gain 1 Scrap Token for each $50 value of that Item (note that Town Items are only worth 50% of their original sale value, rounding down to the nearest $5).',
      'If the Item has Keyword Tech, you also gain 1 Tech Token.',
    ],
  },

  {
    id: 'ww_wasteland_tomb_chest',
    name: 'Wasteland Tomb Chest',
    type: 'gear',
    cost: { scrap: 15 },
    slot: 'Gear',
    tags: ['Gear', 'Container'],
    weight: 1,
    effects: [
      'Holds up to 8 Dark Stone.',
      'Any Dark Stone inside is Hidden and does not cause Corruption Hits.',
    ],
  },
];
