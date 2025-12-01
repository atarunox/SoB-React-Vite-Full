// src/data/townLocations/campSite.js

// Helper: map a 2–12 roll to 0–10 index (kept here for convenience; safe to ignore if you already have one)
export const idxFrom2d6 = (roll) => Math.max(0, Math.min(10, (roll ?? 2) - 2));

const campSite = {
  id: 'campSite', // <-- matches TownTab's CAMP_SHOPS
  name: 'Camp Site',
  type: 'Wilderness Outpost',
  tags: ['Camp', 'Outdoors'],
  description:
    'A temporary encampment outside of town where Heroes can heal, remove ailments, or test their luck at random events.',
  rules: [
    'Heroes may visit the Camp Site instead of a normal Town Location.',
    'Roll on the Camp Site Event Table before using tents or purchasing tokens.',
    'Only one Surgery or Exorcism may be attempted per visit.',
  ],

  /**
   * Must be an array of 11 entries (index 0 -> roll 2, ... index 10 -> roll 12).
   * These strings are kept for backwards-compatibility with existing UIs.
   */
  events: [
    // 2
    'Just My Luck – Robbery forces you to lose one item or 2D6 Dark Stone.',
    // 3
    '"My Friend Doesn’t Like You Much!" – Forced to play Solo Town Adventure "High Noon Duel" or leave Town.',
    // 4
    '"Step Right Up!" – Pay D6×$20 to gain 1 Grit.',
    // 5
    '"Step Right Up!" – Pay D6×$20 to gain 1 Grit.',
    // 6
    'A Sad Collection of the Poor and Scruffy – No Event.',
    // 7
    'A Sad Collection of the Poor and Scruffy – No Event.',
    // 8
    'A Sad Collection of the Poor and Scruffy – No Event.',
    // 9
    'Dirty Poker – Luck 4+ for $25 each 4+. Lose $50 per 1.',
    // 10
    'Dirty Poker – Luck 4+ for $25 each 4+. Lose $50 per 1.',
    // 11
    'Sober Morning – All rolls at Doc’s and Church tents +1 today.',
    // 12
    '"What Have We Here?" – You may draw 1 Gear card.',
  ],

  /**
   * Optional richer metadata for UI/tooltips. Array indices still map 0->2 ... 10->12.
   */
  eventMeta: [
    // 2
    {
      roll: 2,
      name: 'Just My Luck',
      who: 'Visiting Hero',
      effect: 'Lose one Item (your choice) OR lose 2D6 Dark Stone (your choice).',
      test: null,
      cost: null,
      notes: 'Robbery/accident at camp; resolve immediately before any tents/services.',
    },
    // 3
    {
      roll: 3,
      name: "“My Friend Doesn’t Like You Much!”",
      who: 'Visiting Hero',
      effect:
        'You must play the Solo Town Adventure "High Noon Duel" now or immediately leave Town (end visit).',
      test: null,
      cost: null,
    },
    // 4
    {
      roll: 4,
      name: '“Step Right Up!”',
      who: 'Visiting Hero',
      effect: 'Gain +1 Grit.',
      test: 'None',
      cost: 'Pay D6 × $20 before gaining the benefit.',
    },
    // 5
    {
      roll: 5,
      name: '“Step Right Up!”',
      who: 'Visiting Hero',
      effect: 'Gain +1 Grit.',
      test: 'None',
      cost: 'Pay D6 × $20 before gaining the benefit.',
    },
    // 6
    {
      roll: 6,
      name: 'A Sad Collection of the Poor and Scruffy',
      who: '—',
      effect: 'No Event.',
      test: null,
      cost: null,
    },
    // 7
    {
      roll: 7,
      name: 'A Sad Collection of the Poor and Scruffy',
      who: '—',
      effect: 'No Event.',
      test: null,
      cost: null,
    },
    // 8
    {
      roll: 8,
      name: 'A Sad Collection of the Poor and Scruffy',
      who: '—',
      effect: 'No Event.',
      test: null,
      cost: null,
    },
    // 9
    {
      roll: 9,
      name: 'Dirty Poker',
      who: 'Visiting Hero',
      effect:
        'Make a series of Luck 4+ rolls; gain $25 for each success. For each roll of 1, lose $50.',
      test: 'Luck 4+ (repeat as desired per your UI flow)',
      cost: null,
      notes: 'You can model this as N rolls declared up front, or a loop with a stop button.',
    },
    // 10
    {
      roll: 10,
      name: 'Dirty Poker',
      who: 'Visiting Hero',
      effect:
        'Make a series of Luck 4+ rolls; gain $25 for each success. For each roll of 1, lose $50.',
      test: 'Luck 4+ (repeat as desired per your UI flow)',
      cost: null,
    },
    // 11
    {
      roll: 11,
      name: 'Sober Morning',
      who: 'Party',
      effect: 'All rolls at Doc’s Tent and Church Tent are +1 today.',
      test: null,
      cost: null,
      appliesToday: {
        // Optional hint your Town system can use
        targetShops: ['campDocsTent', 'campChurchTent'],
        mod: +1,
        scope: 'rolls',
      },
    },
    // 12
    {
      roll: 12,
      name: '“What Have We Here?”',
      who: 'Visiting Hero',
      effect: 'Draw 1 Gear card.',
      test: null,
      cost: null,
    },
  ],
};

export default campSite;
