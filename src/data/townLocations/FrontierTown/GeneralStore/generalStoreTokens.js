// General Store — Side Bag Tokens
const tokens = [
  {
    id: 'gs_token_whiskey',
    name: 'Whiskey',
    price: 50,
    category: 'TokenPurchase',
    tags: ['Gear', 'Whiskey', 'Token'],
    grantsToken: { type: 'Whiskey', qty: 1 },
    rules: {
      text: 'Gain 1 Whiskey Token.',
    },
  },
  {
    id: 'gs_token_bandages',
    name: 'Bandages',
    price: 50,
    category: 'TokenPurchase',
    tags: ['Gear', 'Bandages', 'Token'],
    grantsToken: { type: 'Bandages', qty: 1 },
    rules: {
      text: 'Gain 1 Bandages Token.',
    },
  },
  {
    id: 'gs_token_tonic',
    name: 'Tonic',
    price: 200,
    category: 'TokenPurchase',
    tags: ['Gear', 'Tonic', 'Token'],
    grantsToken: { type: 'Tonic', qty: 1 },
    rules: {
      text: 'Gain 1 Tonic Token.',
    },
  },
  {
    id: 'gs_token_dynamite',
    name: 'Dynamite',
    price: 200,
    category: 'TokenPurchase',
    tags: ['Gear', 'Explosive', 'Token'],
    grantsToken: { type: 'Dynamite', qty: 1 },
    rules: {
      text: 'Gain 1 Dynamite Token.',
    },
  },
];

export default tokens;
