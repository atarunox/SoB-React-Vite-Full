// src/data/townLocations/streetMarketBackAlleys.js
const streetMarketBackAlleys = [
  // --- Bath House -----------------------------------------------------------
  {
    id: 'sm_bath_house',
    name: 'Bath House',
    type: 'Service',
    cost: { gold: 50 },
    tags: ['Service'],
    limit: 'Once per Visit',
    rules: {
      limitPerVisit: 1,
    },
    effects: [
      'Heal Wounds/Sanity (any mix) and gain 10 XP.',
      'You may also spend 1 Grit in an attempt to remove any Parasites you have. Roll 2D6 for each Parasite. On the roll of 10+, it detaches from you in the warm water and moves on (discard).',
    ],
  },

  // --- Sell Dark Stone ------------------------------------------------------
  {
    id: 'sm_sell_dark_stone',
    name: 'Sell Dark Stone',
    type: 'Service',
    tags: ['Service', 'Dark Stone'],
    // presentation only — actual gold is computed per shard
    cost: { note: 'Sell shards for $20 each' },
    rules: {
      ui: {
        action: 'sellDarkStone',
        // Prompt like you asked: number entry or auto if blank
        prompt: 'How many Dark Stone do you want to sell? (Leave blank to sell all)',
        autorollIfBlank: true,
      },
      pricePerShard: 20,
    },
    effects: [
      'You may sell Dark Stone shards on the Streets for $20 each.',
      'Roll for each shard individually as they vary in size, weight, and value.',
    ],
  },

  // --- Street Gambling ------------------------------------------------------
  {
    id: 'sm_street_gambling',
    name: 'Street Gambling',
    type: 'Service',
    cost: { gold: 25 },
    tags: ['Service', 'Gambling'],
    limit: 'Limit 2 times per Visit',
    rules: {
      limitPerVisit: 2,
      gambling: {
        baseDice: 4,
        firstRerollCost: 25,   // may pay $25 to re-roll any number of those dice
        extraRerollsMax: 3,    // up to 3 more re-rolls at $50 each
        extraRerollCost: 50,
        note:
          'Exception to the usual rule: the same die may be re-rolled more than once for this game.',
        payouts: {
          straight4: { type: 'fixed', gold: 300, label: 'Straight (4 in a Row) — $300' },
          set4: { type: 'variable', formula: '100 * number', label: 'Set (4 of a Kind) — $100 × the number rolled' },
        },
      },
    },
    effects: [
      'Roll 4 dice to try and get a Straight or a Set. You may then pay an extra $25 to Re-roll any number of those dice.',
      'After that, you may Re-roll up to 3 more times at a cost of $50 each (plus any free Re-rolls using Grit). Note that this is an exception to the rule that prevents the same die from being Re-rolled more than once.',
      'When finished rolling, if you have a Straight or Set of numbers, gain the following:',
      'Straight (4 in a Row) — $300',
      'Set (4 of a Kind) — $100 × The Number Rolled',
      'Otherwise, you lose and walk away wondering if those dice were rigged.',
    ],
  },
];

export default streetMarketBackAlleys;
