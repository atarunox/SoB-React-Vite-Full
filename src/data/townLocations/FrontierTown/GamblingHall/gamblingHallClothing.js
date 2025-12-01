// src/data/townLocations/gamblingHallClothing.js

export default [

  {
    id: 'gh_black_tie',
    type: 'gear',
    name: 'Black Tie',
    slot: 'Neck',
    cost: { gold: 200 },
    tags: ['Clothing', 'Fancy'],
    weight: 0,
    effects: ['While in Town, you are +1 Cunning.'],
  },

  {
    id: 'gh_fancy_bowler',
    type: 'gear',
    name: 'Fancy Bowler',
    slot: 'Head',
    cost: { gold: 450 },
    tags: ['Clothing', 'Fancy', 'Hat'],
    weight: 1,
    effects: [
      'While in Town, Recover a Grit any time you roll doubles on a Location Event Chart.',
    ],
  },

  {
    id: 'gh_top_hat',
    type: 'gear',
    name: 'Top Hat',
    slot: 'Head',
    cost: { gold: 850 },
    tags: ['Clothing', 'Fancy', 'Hat', 'Showman'],
    weight: 1,
    upgradeSlots: 1,
    effects: ['+2 Sanity', 'Gain the Keyword Showman'],
  },

  {
    id: 'gh_gamblers_jacket',
    type: 'gear',
    name: "Gambler's Jacket",
    slot: 'Coat',
    cost: { gold: 1250 },
    tags: ['Clothing', 'Fancy'],
    weight: 1,
    effects: ['Once per Adventure/Town Stay, Recover D3 Grit.'],
  },

  {
    id: 'gh_red_sash',
    type: 'gear',
    name: 'Red Sash',
    slot: 'Belt',
    cost: { gold: 1850 },
    tags: ['Clothing', 'Fancy', 'PerformerOnly', 'ShowmanOnly'],
    weight: 0,
    effects: [
      '+1 Move',
      'Once per Adventure, you may change any die you just rolled into a 6.',
    ],
  },

  {
    id: 'gh_gold_ring',
    type: 'gear',
    name: 'Gold Ring',
    slot: 'Ring',
    cost: { gold: 2750 },
    tags: ['Clothing', 'Fancy', 'ShowmanOnly'],
    weight: 1,
    effects: [
      'Once per Adventure/Town Stay, change any single die you rolled into a 6.',
    ],
  },

];
