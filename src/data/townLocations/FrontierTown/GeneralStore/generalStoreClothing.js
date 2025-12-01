export default [
  {
    id: 'gs_hair_grease',
    name: 'Hair Grease',
    cost: 50,
    category: 'Clothing',
    slot: 'Grooming',
    effects: ['Limit 1. Start Town Stay with +1 Grit. Discard on 1–2.'],
  },

  {
    id: 'gs_tent',
    name: 'Tent',
    cost: 1200,
    category: 'Clothing',
    slot: 'Coat',
    effects: ['+1 to Camp Site Hazard rolls.'],
  },

  {
    id: 'gs_harmonica',
    name: 'Harmonica',
    cost: 500,
    category: 'Gear',
    slot: 'Music',
    effects: ['Spend 1 Grit to Heal 1 Sanity.'],
  },

  {
    id: 'gs_jacket',
    name: 'Jacket',
    cost: 400,
    category: 'Clothing',
    slot: 'Coat',
    upgradeSlots: 1,
    weight: 1,            // ✅ updated
    effects: ['+1 Health', '+1 Sanity'],
  },

  {
    id: 'gs_long_coat',
    name: 'Long Coat',
    cost: 1500,
    category: 'Clothing',
    slot: 'Coat',
    upgradeSlots: 1,
    weight: 1,            // ✅ updated
    effects: ['+4 Health'],
  },

  {
    id: 'gs_duster',
    name: 'Duster',
    cost: 1800,
    category: 'Clothing',
    slot: 'Coat',
    upgradeSlots: 1,
    weight: 1,            // ✅ updated
    effects: ['Armor 6+.'],
  },

  {
    id: 'gs_poncho',
    name: 'Poncho',
    cost: 950,
    category: 'Clothing',
    slot: 'Shoulders',
    weight: 1,            // ✅ updated
    effects: ['Outlaw or Traveler Only.', '+2 Health.', 'Ignore Weather effects.'],
  },
];
