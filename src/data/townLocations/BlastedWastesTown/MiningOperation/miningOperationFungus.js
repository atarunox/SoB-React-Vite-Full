// src/data/townLocations/BlastedWastesTown/MiningOperation/miningOperationFungus.js
// Purchase: Fungus Crops + Scrap Sack

export default [
  {
    id: 'mo_fin_plates',
    name: 'Fin Plates',
    type: 'gear',
    cost: { gold: 225 },
    slot: 'Fungus',
    tags: ['Gear', 'Fungus'],
    limit: '5 Fungus Total',
    effects: [
      'Discard to consume. Heal D6 Wounds and Recover 1 Grit.',
    ],
    rules: { consumesOnUse: true },
  },

  {
    id: 'mo_balldo_stems',
    name: 'Balldo Stems',
    type: 'gear',
    cost: { gold: 150 },
    slot: 'Fungus',
    tags: ['Gear', 'Fungus'],
    limit: '5 Fungus Total',
    effects: [
      'Discard to consume. Remove all Status Effects currently on you (Stunned, Bleeding, Fungus Effects, etc).',
    ],
    rules: { consumesOnUse: true },
  },

  {
    id: 'mo_sevorei_crumble',
    name: 'Sevorei Crumble',
    type: 'gear',
    cost: { gold: 250 },
    slot: 'Fungus',
    tags: ['Gear', 'Fungus'],
    limit: '5 Fungus Total',
    effects: [
      'Discard to consume. Until the end of the Adventure, you are +1 Health, +1 Strength, and +1 Move.',
      'Limit 1 Fungus Effect at a time.',
    ],
    rules: { consumesOnUse: true, fungusEffect: true },
    modifiers: { health: 1, strength: 1, move: 1 },
  },

  {
    id: 'mo_veya_shrooms',
    name: "Ve'Ya Shrooms",
    type: 'gear',
    cost: { gold: 250 },
    slot: 'Fungus',
    tags: ['Gear', 'Fungus'],
    limit: '5 Fungus Total',
    effects: [
      'Discard to consume. Until the end of the Adventure, you are +5 Sanity, +1 Spirit, and -2 Initiative.',
      'Limit 1 Fungus Effect at a time.',
    ],
    rules: { consumesOnUse: true, fungusEffect: true },
    modifiers: { sanity: 5, spirit: 1, initiative: -2 },
  },

  {
    id: 'mo_scrap_sack',
    name: 'Scrap Sack',
    type: 'gear',
    cost: { gold: 500 },
    slot: 'Container',
    tags: ['Gear', 'Container'],
    limit: '1',
    weight: 1,
    effects: [
      'The Scrap Sack holds up to 25 Scrap Tokens.',
      'These Scrap Tokens are Hidden and do not contribute any Weight to your Hero.',
      'Requires Strength 3 or Higher to use.',
    ],
    requires: { strength: 3 },
  },
];
