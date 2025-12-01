// src/data/townLocations/mutantQuarterItems.js

export default [
  { 
    id: 'mq_whiskey',
    name: 'Whiskey',
    type: 'item',
    cost: { gold: 40 },
    limit: 2,
    effects: ['Gain 1 Whiskey Token (limit 2 per visit).']
  },

  { 
    id: 'mq_bandages',
    name: 'Bandages',
    type: 'item',
    cost: { gold: 40 },
    limit: 2,
    effects: ['Gain 1 Bandages Token (limit 2 per visit).']
  },

  {
    id: 'mq_dynamite',
    name: 'Dynamite',
    type: 'item',
    cost: { gold: 175 },
    limit: 2,
    effects: ['Gain 1 Dynamite Token (limit 2 per visit).']
  },

  {
    id: 'mq_hooded_cloak',
    name: 'Hooded Cloak',
    type: 'gear',
    slot: 'Shoulders',
    cost: { gold: 450 },
    upgradeSlots: 1,            // per your note
    weight: 1,                  // per your note
    effects: [
      'Ignore 2 Unwanted Attention markers.',
      'Once per Fight, move +2 spaces for free on an Escape test and choose the route.'
    ]
  },

  {
    id: 'mq_extractor',
    name: 'Extractor',
    type: 'gear',
    slot: 'Medical',
    cost: { gold: 600 },
    carries: { darkStone: 1 },  // contains 1 DS (carry)
    effects: [
      'Once per Adventure: At start of turn, use 1 Grit and take D6 Wounds ignoring Defense to remove D3 Corruption Points.'
    ]
  },

  {
    id: 'mq_rail_hammer',
    name: 'Rail Hammer',
    type: 'gear',
    slot: 'Hand Weapon',
    cost: { gold: 1350 },
    upgradeSlots: 2,            // per your note
    weight: 1,                  // per your note
    twoHanded: true,            // per your note
    effects: [
      'Once per turn, add +D6 Damage to one of your Combat Hits.'
    ]
  },

  {
    id: 'mq_void_child_pistol',
    name: 'Void Child Pistol',
    type: 'gear',
    slot: 'Gun',
    tags: ['Pistol', 'Gun'],
    cost: { gold: 1800 },
    // Requires the Mutation to *use* it
    restrictions: {
      requiresMutation: 'Child of the Void'
    },
    effects: [
      'May only be used with a Child of the Void Mutation.',
      'Free Attack once per turn.',
      'Range: 3',
      'Shots: 1',
      'Critical on 5 or 6.'
    ]
  },

  {
    id: 'mq_brace_three_pistols',
    name: 'Brace of Three Pistols',
    type: 'gear',
    slot: 'Gun',
    cost: { gold: 2100 },
    upgradeSlots: 3,            // per your note
    weight: 1,                  // per your note
    hands: 3,                   // takes 3 hands (your UI’s deriveHandsRequired should read this)
    effects: [
      'Range: 6',
      'Shots: 5'
    ]
  },

  {
    id: 'mq_rail_spike_driver',
    name: 'Rail Spike Driver',
    type: 'gear',
    slot: 'Hand Weapon',
    cost: { gold: 4800 },
    upgradeSlots: 1,            // per your note
    weight: 1,                  // per your note
    hands: 3,                   // takes 3 hands
    effects: [
      '+1 Combat for each adjacent Enemy.',
      'Uses the D8 for To Hit and Damage.'
    ]
  },
];
