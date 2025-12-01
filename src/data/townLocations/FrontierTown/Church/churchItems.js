// src/data/townLocations/churchItems.js

const churchItems = [
  // --- Gear / Consumable ---
  {
    id: 'ch_vial_brimstone_ash',
    name: 'Vial of Brimstone Ash',
    type: 'Gear',
    slot: 'Extra',
    cost: { gold: 250 },
    tags: ['Gear', 'Consumable', 'Void'],
    upgradeSlots: 0,
    weight: 0,
    effects: [
      'Free Attack – 1 Wound to all adjacent enemies, ignores Defense.'
    ],
    rules: {
      consumable: true,
      freeAttack: true,
      aoeAdjacentEnemies: true,
      autoWounds: 1,
      ignoreDefense: true,
    },
  },

  // --- Service / Blessing (not available to Holy Heroes) ---
  {
    id: 'ch_conversion',
    name: 'Conversion (Not available to Holy Heroes)',
    category: 'Service',
    cost: { gold: 500 },
    tags: ['Blessing', 'Holy'],
    note: 'Not available to Holy Heroes.',
    effect:
      '+1 Spirit and gain the Holy keyword. Each time you visit the Saloon, roll a D6; on 1–2, lose this bonus.',
    restrictions: {
      disallowKeywords: ['Holy'], // heroes already Holy cannot purchase
    },
    rules: {
      grantsKeyword: 'Holy',
      statBonus: { Spirit: 1 },
      saloonVisitLossCheck: { die: 'D6', loseOn: [1, 2] },
    },
  },
];

export default churchItems;
