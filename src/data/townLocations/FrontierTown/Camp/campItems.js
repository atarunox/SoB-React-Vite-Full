// src/data/townLocations/campItems.js

const campItems = [
  {
    id: 'camp_bandages_token',
    name: 'Bandages',
    type: 'Gear',
    tags: ['Bandages', 'Tokens'],
    cost: 50,
    effect: 'Gain 1 Bandages Token',
    grantsToken: { type: 'Bandages', amount: 1 },
    purchaseLimitPerVisit: 2
  },
  {
    id: 'camp_whiskey_token',
    name: 'Whiskey',
    type: 'Gear',
    tags: ['Whiskey', 'Tokens'],
    cost: 50,
    effect: 'Gain 1 Whiskey Token',
    grantsToken: { type: 'Whiskey', amount: 1 },
    purchaseLimitPerVisit: 2
  }
];

export default campItems;
