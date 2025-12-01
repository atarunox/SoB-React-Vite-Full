// Saloon — Purchasable items & class-locked gear
// Tags drive which tab they appear on via tabsByShop.js:
//  - 'Everyone' -> Items
//  - 'SaloonGirlOnly' or 'Troupe' -> Saloon Girl Troupe tab

export default [
  // ---------------- Everyone: Purchases ----------------
  {
    id: 'saloon_whiskey',
    name: 'Whiskey',
    type: 'item',
    cost: { gold: 50 },
    tags: ['Everyone', 'Whiskey', 'Token'],
    effects: ['Gain 1 Whiskey Token.'],
    limit: 2, // common house rule cap; remove if you don’t want a limit here
  },
  {
    id: 'saloon_cask',
    name: 'Cask',
    type: 'Gear',
    slot: 'Container',
    cost: { gold: 300 },
    weight: 1,
    upgradeSlots: 1,
    tags: ['Everyone', 'Container'],
    effects: ['Holds up to 3 Whiskey Tokens.'],
    capacity: { whiskeyTokens: 3 },
  },
  {
    id: 'saloon_gamblers_deck',
    name: "Gambler's Deck of Cards",
    type: 'Gear',
    slot: 'Charm',
    cost: { gold: 850 },
    weight: 1,
    upgradeSlots: 0,
    tags: ['Everyone', 'Charm'],
    effects: [
      '+1 Cunning',
      'Once per Adventure, you may cancel and re-draw a Darkness card just drawn. (Limit one.)',
    ],
  },
  {
    id: 'saloon_lucky_dice',
    name: 'Lucky Dice',
    type: 'Gear',
    slot: 'Charm',
    cost: { gold: 1000 },
    weight: 1,
    upgradeSlots: 1,
    tags: ['Everyone', 'Charm'],
    effects: [
      '+1 Luck',
      'Once per Adventure, you may add +1 to any single die roll.',
    ],
  },

  // ---------------- Saloon Girl Troupe (class-locked) ----------------
  {
    id: 'saloon_perfume',
    name: 'Perfume',
    type: 'Gear',
    slot: 'Boost',
    cost: { gold: 200 },
    weight: 0,
    upgradeSlots: 0,
    tags: ['SaloonGirlOnly', 'Troupe'],
    effects: [
      'During the next Adventure, gain +5 XP for every Wound/Sanity you Heal with your Comforting Presence.',
    ],
  },
  {
    id: 'saloon_dark_stone_shiv',
    name: 'Dark Stone Shiv',
    type: 'Gear',
    slot: 'Hand Weapon',
    cost: { gold: 0 },
    weight: 0,
    upgradeSlots: 0,
    darkStone: true,
    contains: { darkStone: 1 }, // per your spec
    tags: ['SaloonGirlOnly', 'Troupe', 'Dark Stone', 'Weapon'],
    effects: [
      'Free Attack — Discard to do D6 Wounds to an adjacent Enemy, ignoring Defense.',
    ],
  },
  {
    id: 'saloon_boned_corset',
    name: 'Boned Corset',
    type: 'Gear',
    slot: 'Torso',
    cost: { gold: 1200 },
    weight: 1,
    upgradeSlots: 1,
    tags: ['SaloonGirlOnly', 'Troupe', 'Clothing'],
    effects: ['Armor 6+'],
  },
  {
    id: 'saloon_dark_stone_corset',
    name: 'Dark Stone Corset',
    type: 'Gear',
    slot: 'Torso',
    cost: { gold: 3200 },
    weight: 1,
    upgradeSlots: 0,
    darkStone: true,
    contains: { darkStone: 1 }, // per your spec (note: card shows more, but honoring your request)
    tags: ['SaloonGirlOnly', 'Troupe', 'Clothing', 'Dark Stone'],
    effects: ['Armor 5+', '+1 Max Grit'],
  },
  {
    id: 'saloon_tiny_hat',
    name: 'Tiny Hat',
    type: 'Gear',
    slot: 'Head',
    cost: { gold: 2450 },
    weight: 0,
    upgradeSlots: 1,
    tags: ['SaloonGirlOnly', 'Troupe', 'Clothing', 'Hat'],
    effects: ['Once per Adventure, you may remove 1 Corruption point.'],
  },
];
