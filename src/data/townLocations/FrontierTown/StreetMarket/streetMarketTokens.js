// Street Market — Potions & Spices
// Format matches your other token-purchase modules.

const streetMarketTokens = [
  {
    id: 'sm_far_eastern_potion',
    name: 'Far Eastern Potion',
    type: 'Gear',
    category: 'TokenPurchase',
    cost: { gold: 75 },
    tags: ['Gear', 'Potion', 'Tokens'],
    effects: ['Gain 1 Potion Token.'],
    grantsToken: { type: 'Potion', amount: 1 },
  },
  {
    id: 'sm_rare_spices',
    name: 'Rare Spices',
    type: 'Gear',
    category: 'TokenPurchase',
    cost: { gold: 50 },
    tags: ['Gear', 'Plant', 'Tokens'],
    effects: ['Gain 1 Spice Token.'],
    grantsToken: { type: 'Spice', amount: 1 },
  },
  {
    id: 'sm_exotic_herbs',
    name: 'Exotic Herbs',
    type: 'Gear',
    category: 'TokenPurchase',
    cost: { gold: 200 },
    tags: ['Gear', 'Plant', 'Tokens'],
    effects: ['Gain 1 Exotic Herbs Token.'],
    grantsToken: { type: 'Exotic Herbs', amount: 1 },
  },
  {
    id: 'sm_refined_lantern_oil',
    name: 'Refined Lantern Oil',
    type: 'Gear',
    category: 'TokenPurchase',
    cost: { gold: 200 },
    tags: ['Gear', 'Oil', 'Tokens'],
    effects: ['Gain 1 Lantern Oil Token.'],
    grantsToken: { type: 'Lantern Oil', amount: 1 },
  },
];

export default streetMarketTokens;
