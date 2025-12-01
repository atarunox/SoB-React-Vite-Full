// Street Market — Charms, Hats, Weapons, Injection
const streetMarketItems = [
 {
    id: 'sm_chew',
    name: 'Chew',
    type: 'Gear',
    tags: ['Gear', 'Plant'],
    cost: { gold: 50 },
    limits: ['Limit 1'],
    effects: ['Discard and take 1 Corruption Hit to Heal 5 Sanity.'],
  },
  {
    id: 'sm_silk_sash',
    name: 'Silk Sash',
    type: 'Gear',
    slot: 'Belt',
    tags: ['Gear', 'Clothing', 'Belt', 'Showman or Performer Only'],
    restrictions: ['Showman or Performer Only'],
    cost: { gold: 450 },
	weight:1,
    effects: ['Once per Adventure, Heal 5 Wounds.'],
  },
  {
    id: 'sm_ornate_case',
    name: 'Ornate Case',
    type: 'Gear',
    tags: ['Gear', 'Container'],
    cost: { gold: 1250 },
    effects: [
      'Choose one Item you have. Between Adventures or while that Item is not Equipped, it counts as having no Dark Stone.',
    ],
  },
  {
    id: 'sm_dark_stone_bracelet',
    name: 'Dark Stone Bracelet',
    type: 'Gear',
    tags: ['Gear', 'Charm'],
    cost: { gold: 1000 },
    weight: 1,
    darkStone: 1, // contains 1 DS
    effects: ['Once per Adventure, cancel an Enemy model’s Attack (before dice are rolled).'],
  },

  // ----- Red Dragon Injection (Boost • Injection) -----
  {
    id: 'sm_red_dragon_injection',
    name: 'Red Dragon Injection',
    type: 'Gear',
    slot: 'Injection',
    category: 'Injection',
    tags: ['Boost', 'Injection'],
    cost: { gold: 100 },
    limits: ['Limit One Injection at a time.'],
    effects: [
      'For the next Adventure, you are +1 Initiative and have Spirit Armor 5+.',
      'Any time the Hold Back the Darkness roll is failed, take 1 Corruption Hit.',
    ],
    lore: [
      'Made from a potent formula of opium, crushed Dark Stone, and Scourge Bile, this mix is not to be taken lightly.',
    ],
  },
];

export default streetMarketItems;
