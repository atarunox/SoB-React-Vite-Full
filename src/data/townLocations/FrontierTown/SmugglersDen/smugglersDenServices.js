// src/data/townLocations/smugglersDenServices.js
export default [
  {
    id: 'back_alley_doc',
    name: 'Back-Alley Doc',
    type: 'Service',
    cost: { gold: 25 },
    tags: ['Medical', 'SurgeryLike'],
    rules: {
      text: [
        'Choose an Injury or Mutation you want removed and roll a D6.',
        '1: Dead! Your Hero dies during the attempt.',
        '2–3: Failed. The Injury/Mutation is not healed and you lose 1 Max Health permanently.',
        '4: Success… Sort Of. The Injury/Mutation is healed, but you lose 1 Max Health permanently.',
        '5–6: Well Done! The Injury/Mutation is healed with no negative effects.',
      ],
      ui: { requiresRoll: true },
      handler: 'performSmugglerSurgery',
    },
  },

  {
    id: 'black_market_goods',
    name: 'Black Market Goods',
    type: 'Service',
    cost: { gold: 0 },
    tags: ['PosseWide', 'LootDraw'],
    rules: {
      text: [
        'Roll 3 dice for the posse:',
        '1–3: Draw a Mines Gear card.',
        '4–6: Draw a World card and then an Artifact from that world.',
        'All items go to the shared Black Market stock.',
        'Each item may then be purchased at a cost of D6×$25 plus the printed value.',
      ],
      ui: { autoRoll3Dice: true },
      handler: 'performBlackMarketGoods',
    },
  },

  // ---------- New services you requested on this tab ----------
  {
    id: 'buy_round_of_shots',
    name: 'Buy a Round of Shots',
    type: 'Service',
    cost: { rollCost: true }, // D6×$5 per the card
    tags: ['LimitOncePerVisit'],
    rules: {
      text: [
        'Limit Once per Visit.',
        'Pay D6×$5 for a round of Brimstone Sunrise shots for the rowdy group.',
        'Recover 1 Grit, then take D3 Wounds, ignoring Defense.',
      ],
      ui: { requiresRoll: true },
      handler: 'performBuyRoundOfShots', // (stub handler name to wire later)
    },
  },
  {
    id: 'down_a_dark_road',
    name: 'Down a Dark Road',
    type: 'Service',
    cost: { gold: 0 },
    tags: ['AllHeroes', 'PermanentBonus'],
    rules: {
      text: [
        'Gain +1 Luck (permanent) and the Outlaw keyword.',
        'Mark this on your sheet. Some locations and gear check for the Outlaw keyword.',
      ],
      handler: 'performDownDarkRoad' // <-- NEW
    }
  },
];
