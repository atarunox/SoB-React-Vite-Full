// src/data/townLocations/BlastedWastesTown/DesertMarketplace/desertMarketplaceItems.js
// Purchase Items: Alien Clothing & Equipment

export default [
  {
    id: 'dm_alien_chow',
    name: 'Alien Chow',
    type: 'gear',
    cost: { gold: 50 },
    slot: 'Consumable',
    tags: ['Gear', 'Plant'],
    limit: '1',
    effects: [
      'Discard and take 1 Corruption Hit to Heal 5 Sanity.',
    ],
    rules: { consumesOnUse: true },
  },

  {
    id: 'dm_scavengers_goggles',
    name: "Scavenger's Goggles",
    type: 'gear',
    cost: { gold: 100 },
    slot: 'Eyes',
    tags: ['Gear', 'Clothing', 'Eyes'],
    effects: [
      'Any time you draw a Scavenge card, other than while Mining or at Locations in the Blasted Wastes, you also find 1 Scrap Token.',
    ],
  },

  {
    id: 'dm_wasteland_head_wrap',
    name: 'Wasteland Head Wrap',
    type: 'gear',
    cost: { gold: 400 },
    slot: 'Face',
    tags: ['Gear', 'Clothing', 'Face'],
    effects: [
      'You may ignore Corruption Hits from Hold Back the Darkness tokens in the Blasted Wastes.',
      '+2 Sanity.',
    ],
    modifiers: { sanity: 2 },
  },

  {
    id: 'dm_water_finder',
    name: 'Water Finder',
    type: 'gear',
    cost: { gold: 925 },
    slot: 'Gear',
    tags: ['Gear', 'Tech'],
    effects: [
      'Once per Adventure, you may Heal 3D6 Wounds from every Hero on your Map Tile (except while in a Fight).',
    ],
  },
];
