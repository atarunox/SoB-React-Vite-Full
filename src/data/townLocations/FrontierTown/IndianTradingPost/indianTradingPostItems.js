// Items for Indian Trading Post (Frontier Town)
//
// Notes from your spec:
// - Throwing Hatchet is NOT its own gear item; it grants a Side Bag token “Hatchet”.
// - All bows: weight 1, two-handed, 2 upgrade slots, +1 Initiative while equipped, crit on 5–6
// - Arrows: up to 12 carried; you may discard up to 1 per Bow hit to apply the arrow’s effect
// - Indian Hatchet: weight 1, 2 upgrade slots, Combat hits are +1 Damage, Tribal/Traveler/Frontier only
// - Feather Hatchet: weight 1, 1 upgrade slot, +1 Combat and your Combat hits are +1 Damage, Tribal/Traveler/Frontier only
// - Glyph of the Buffalo: $200 + 2 DS; carries 1 DS; Attachment (1 slot) to Any item
// - War Glyph: $500 + 5 DS; carries 1 DS; Attachment (2 slots) to Any item (limit 1)
// - Death Glyph: $1000 + 6 DS; carries 1 DS; Attachment (1 slot) to Any item (limit 1)
// - Snake Skin Belt, Cavalry Jacket: weight 1, 1 upgrade slot
// - Scout Bag: Container; lets hero carry +2 weight (items in bag can’t be equipped)
// - Medicine Bag: weight 1; once per Adventure heal 3D6 Health/Sanity split among adjacent heroes

export const indianTradingPostItems = [
  // ---------------------- Trading Post: Gear ----------------------
  {
    id: 'indian_hatchet',
    name: 'Indian Hatchet',
    slot: 'Hand Weapon',
    weight: 1,
    twoHanded: false,
    upgradeSlots: 2,
    effects: ['Your Combat hits are +1 Damage'],
    tags: ['Tribal', 'Traveler', 'Frontier'],
    restrictions:  { worlds: ['Tribal', 'Traveler', 'Frontier'] },
    value: 750,
    cost: { gold: 750 },
  },
  {
    id: 'feather_hatchet',
    name: 'Feather Hatchet',
    slot: 'Hand Weapon',
    weight: 1,
    twoHanded: false,
    upgradeSlots: 1,
    effects: ['+1 Combat', 'Your Combat hits are +1 Damage'],
    tags: ['Tribal', 'Traveler', 'Frontier'],
    restrictions: { worlds: ['Tribal', 'Traveler', 'Frontier'] },
    value: 2250,
    cost: { gold: 2250 },
  },

  // Side Bag token purchase (NOT a gear item)
  {
    id: 'throwing_hatchet_token',
    name: 'Throwing Hatchet',
    type: 'TokenPurchase',
    description: 'Grants a Side Bag token: Hatchet.',
    grantsToken: { type: 'Hatchet', amount: 1 },
    cost: { gold: 100 },
    tags: ['TokenPurchase'],
  },

  // ---------------------- Glyph Upgrades (attachments) ----------------------
  {
    id: 'glyph_buffalo',
    name: 'Glyph of the Buffalo',
    type: 'Upgrade',
    attachTo: 'Any item',
    upgradeSlots: 1,
    carries: { darkStone: 1 },
    cost: { gold: 200, darkStone: 2 },
    effects: [
      'Once per Adventure, until end of the turn: you may move through other models (not including Large or bigger), displacing them into the space you just left as you move, and automatically pass Escape tests',
    ],
    tags: ['Glyph', 'Attachment'],
  },
  {
    id: 'glyph_war',
    name: 'War Glyph',
    type: 'Upgrade',
    attachTo: 'Any item (limit 1)',
    upgradeSlots: 2,
    carries: { darkStone: 1 },
    cost: { gold: 500, darkStone: 5 },
    effects: ['Once per Adventure, gain +2 Combat until the end of the turn'],
    tags: ['Glyph', 'Attachment', 'Limit1'],
  },
  {
    id: 'glyph_death',
    name: 'Death Glyph',
    type: 'Upgrade',
    attachTo: 'Any item (limit 1)',
    upgradeSlots: 1,
    carries: { darkStone: 1 },
    cost: { gold: 1000, darkStone: 6 },
    effects: [
      'Once per Adventure/Town Stay: If you would be KO’d or Killed, roll a D6 (may not be re-rolled with Grit). On 4+, heal up to 5 Health/Sanity (any mix) and avoid being KO’d/Killed. On a 6, also destroy the Item with this upgrade.',
    ],
    tags: ['Glyph', 'Attachment', 'Limit1'],
  },

  // ---------------------- Apparel / Containers ----------------------
  {
    id: 'snake_skin_belt',
    name: 'Snake Skin Belt',
    slot: 'Belt',
    weight: 1,
    upgradeSlots: 1,
    cost: { gold: 650 },
    effects: ['Once per Adventure, you may transfer a single Enemy Hit you have just taken to another model that is adjacent to you.'],
    tags: [],
	keywords: ['restricted:TribalOrScout', 'TribalTent'],
  },
  {
    id: 'cavalry_jacket',
    name: 'Cavalry Jacket',
    slot: 'Coat',
    weight: 1,
    upgradeSlots: 1,
    cost: { gold: 2750 },
    effects: ['You may now Recover a Grit on a Move roll of 6'],
    tags: [],
	keywords: ['restricted:TribalOrScout', 'TribalTent'],
  },
  {
    id: 'scout_bag',
    name: 'Scout Bag',
    slot: 'Container',
    weight: 0,
    upgradeSlots: 0,
    effects: ['Carry +2 Weight (items inside cannot be equipped)'],
    cost: { gold: 2000 },
    tags: ['Container', 'restricted:TribalOrScout', 'TribalTent'],
    // marker to route this to Tribal Tent
    keywords: ['restricted:TribalOrScout', 'TribalTent'],
  },
  {
    id: 'medicine_bag',
    name: 'Medicine Bag',
    slot: 'Misc',
    weight: 1,
    upgradeSlots: 0,
    effects: [
      'Once per Adventure: Heal 3D6 Health/Sanity (any mix) spread between yourself and adjacent Heroes',
    ],
    cost: { gold: 3200 },
    tags: ['Frontier'],
	keywords: ['restricted:TribalOrScout', 'TribalTent'],
  },

  // ---------------------- Bows & Arrows (Tribal Tent) ----------------------
  // We keep the invariants in code via normalizeINDIAN_TP_Item, but also set here for clarity
  {
    id: 'indian_bow',
    name: 'Indian Bow',
    slot: 'Bow',
    weight: 1,
    twoHanded: true,
    upgradeSlots: 2,
    effects: ['+1 Initiative while equipped', 'Crit on 5–6', "Range 8, Shots 1."],
    cost: { gold: 400 },
    tags: ['Tribal', 'Frontier'],
    keywords: ['TribalTent'],
  },
  {
    id: 'hunter_bow',
    name: 'Hunter’s Bow',
    slot: 'Bow',
    weight: 1,
    twoHanded: true,
    upgradeSlots: 2,
    effects: ['+1 Initiative while equipped', 'Crit on 5–6', "Range 5, Shots 2."],
    cost: { gold: 1200 },
    tags: ['Frontier'],
    keywords: ['TribalTent'],
  },
  {
    id: 'long_bow',
    name: 'Long Bow',
    slot: 'Bow',
    weight: 1,
    twoHanded: true,
    upgradeSlots: 2,
    effects: ['+1 Initiative while equipped', 'Crit on 4–6', "Range 10, Shots 1."],
    cost: { gold: 2400 },
    tags: ['Frontier'],
    keywords: ['TribalTent'],
  },
  {
    id: 'war_bow',
    name: 'War Bow',
    slot: 'Bow',
    weight: 1,
    twoHanded: true,
    upgradeSlots: 2,
    effects: ['+1 Initiative while equipped', 'Crit on 5–6', "Range 8, Shots 3."],
    cost: { gold: 3800 },
    tags: ['Frontier'],
    keywords: ['TribalTent'],
  },
  {
    id: 'spirit_bow',
    name: 'Spirit Bow',
    slot: 'Bow',
    weight: 1,
    twoHanded: true,
    upgradeSlots: 2,
    effects: ['+1 Initiative while equipped', 'Crit on 5–6', "Range 10, Shots equal to Spirit."],
    cost: { gold: 5400 },
    tags: ['Frontier'],
    keywords: ['TribalTent'],
  },

  // Arrow “ammo” — stack up to 12; discard up to 1 per Bow hit to apply effect
  {
    id: 'dark_stone_arrows',
    name: 'Dark Stone Arrows',
    type: 'Ammo',
    keywords: ['Arrow', 'TribalTent'],
    effect:
      ['+D3 Damage', 'You may discard up to 1 per Bow hit to apply its effect. Stack up to 12.'],
    cost: { gold: 25 },
    tags: ['Ammo'],
  },
  {
    id: 'hunting_arrows',
    name: 'Hunting Arrows',
    type: 'Ammo',
    keywords: ['Arrow', 'TribalTent'],
    effect:
      ['+3 Damage to a Beast Enemy', 'You may discard up to 1 per Bow hit to apply its effect. Stack up to 12.'],
    cost: { gold: 25 },
    tags: ['Ammo'],
  },
  {
    id: 'spirit_arrows',
    name: 'Spirit Arrows',
    type: 'Ammo',
    keywords: ['Arrow', 'TribalTent'],
    effect:
      ['+3 Damage to a Void Enemy', 'You may discard up to 1 per Bow hit to apply its effect. Stack up to 12.'],
    cost: { gold: 25 },
    tags: ['Ammo'],
  },
  {
    id: 'blessed_arrows',
    name: 'Blessed Arrows',
    type: 'Ammo',
    keywords: ['Arrow', 'TribalTent'],
    effect:
      ['+3 Damage to a Demon Enemy', 'You may discard up to 1 per Bow hit to apply its effect. Stack up to 12.'],
    cost: { gold: 25 },
    tags: ['Ammo'],
  },
  {
    id: 'eagle_feather_arrows',
    name: 'Eagle Feather Arrows',
    type: 'Ammo',
    keywords: ['Arrow', 'TribalTent'],
    effect:
      ['Use on a Critical Hit to gain +2 Shots with the Bow', 'You may discard up to 1 per Bow hit to apply its effect. Stack up to 12.'],
    cost: { gold: 50 },
    tags: ['Ammo'],
  },
  {
    id: 'blood_arrows',
    name: 'Blood Arrows',
    type: 'Ammo',
    keywords: ['Arrow', 'TribalTent'],
    effect:
      ["This Hit ignores Cover and Tough", 
	  "You may discard up to 1 per Bow hit to apply its effect. Stack up to 12."],
    cost: { gold: 100 },
    tags: ['Ammo'],
  },
];
