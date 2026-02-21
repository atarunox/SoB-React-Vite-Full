// src/data/townLocations/BlastedWastesTown/DesertMarketplace/desertMarketplaceTransports.js
// Transports — Limit one Transport

export default [
  {
    id: 'dm_desert_karuuto',
    name: "Desert Karu'uto",
    type: 'gear',
    cost: { gold: 950 },
    slot: 'Transport',
    tags: ['Transport', 'Mount', 'Alien'],
    limit: '1 Transport',
    effects: [
      'Gain 1 XP each time you Travel.',
      'Once per Traveling to Town, you may Recover 1 Grit.',
    ],
  },

  {
    id: 'dm_wild_karuuto',
    name: "Wild Karu'uto",
    type: 'gear',
    cost: { gold: 1250 },
    slot: 'Transport',
    tags: ['Transport', 'Animal', 'Alien'],
    limit: '1 Transport',
    effects: [
      'Gain 1 XP each time you Travel.',
      'Once per Travel, you may re-roll 1 Travel Hazard die.',
    ],
  },

  {
    id: 'dm_rust_cycle',
    name: 'Rust Cycle',
    type: 'gear',
    cost: { gold: 1850 },
    slot: 'Transport',
    tags: ['Transport', 'Vehicle', 'Tech', 'Rust'],
    limit: '1 Transport',
    effects: [
      'When Traveling, you may take D6 fewer Travel Hazard rolls (minimum 0).',
    ],
  },

  {
    id: 'dm_scrap_wagon',
    name: 'Scrap Wagon',
    type: 'gear',
    cost: { gold: 3500 },
    slot: 'Transport',
    tags: ['Transport', 'Vehicle', 'Pack', 'Rust'],
    limit: '1 Transport',
    effects: [
      'Can carry up to 5 Heroes.',
      'When your Posse Travels, each Hero in the Scrap Wagon gains 1 XP and may roll one fewer Travel Hazard than normal.',
      'Also, when setting up a Town, you may discard and re-draw one of the Random Town Locations placed.',
    ],
  },
];
