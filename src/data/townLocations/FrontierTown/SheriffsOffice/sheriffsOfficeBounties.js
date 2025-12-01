// Wanted Posters & Bounties (single list).
// The Wanted Poster is defined as a normal Gear item so it shows a "Buy" button.

const sheriffsOfficeBounties = [
  // ----- Bounties (data-only records you can mark for next Adventure) -----
  {
    id: 'so_bounty_low',
    name: 'Wanted: Low Threat',
    type: 'bounty',
    cost: { gold: 0 },
    tags: ['Bounty'],
    effects: [
      'Mark your next Adventure: +$100 per Low-Threat enemy group defeated.',
    ],
  },
  {
    id: 'so_bounty_standard',
    name: 'Wanted: Standard Threat',
    type: 'bounty',
    cost: { gold: 0 },
    tags: ['Bounty'],
    effects: [
      'Mark your next Adventure: +$150 per Standard-Threat enemy group defeated.',
    ],
  },
  {
    id: 'so_bounty_high',
    name: 'Wanted: High Threat',
    type: 'bounty',
    cost: { gold: 0 },
    tags: ['Bounty'],
    effects: [
      'Mark your next Adventure: +$200 per High-Threat enemy group defeated.',
    ],
  },

  // ----- Wanted Poster (BUY, not perform) -----
  {
    id: 'so_wanted_poster',
    name: 'Wanted Poster',
    type: 'Gear',
    slot: 'Poster',          // keeps it as a gear-like inventory item
    cost: { gold: 100 },     // $100 as printed
    weight: 0,
    upgradeSlots: 0,
    tags: ['Poster'],
    rules: {
      text: [
        'Discard when you kill an <b>Outlaw Enemy</b> to gain <b>D6 × $50</b>.',
        'If the kill was an <b>Infamous Outlaw</b>, gain <b>D6 × $100</b>.',
        'If your Posse kills a <b>Legendary Outlaw</b>, gain <b>D6 × $250</b> instead.',
      ],
      note: 'Limit 1.',
    },
  },
];

export default sheriffsOfficeBounties;
