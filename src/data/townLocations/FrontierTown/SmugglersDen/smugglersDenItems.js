const smugglersDenItems = [
  // ---------- Illegal Ammo / Token ----------
  {
    id: 'ammo_inferno_shot',
    name: 'Inferno Shot',
    type: 'Gear',
    slot: 'Ammo',
    cost: { gold: 100 },
    tags: ['Ammo', 'ShotgunOnly', 'Illegal'],
    effects: [
      '(Shotgun only) Critical Hits do +1 Damage, including Splash from the Sawed-Off Shotgun. (One Adventure.)',
    ],
  },
  {
    id: 'ammo_blood_rounds',
    name: 'Blood Rounds',
    type: 'Gear',
    slot: 'Ammo',
    cost: { gold: 200 },
    tags: ['Ammo', 'Illegal'],
    effects: [
      'Any time you kill an Enemy with a Critical Hit, you get +1 Shot with that Gun (limit +2 Shots per turn). (One Adventure.)',
    ],
  },
  {
    id: 'ammo_hell_bullets',
    name: 'Hell Bullets',
    type: 'Gear',
    slot: 'Ammo',
    cost: { gold: 250 },
    tags: ['Ammo', 'Illegal'],
    effects: [
      'All your Gun To-Hit rolls of 1 count as Critical Hits, but also cause 1 Corruption Hit to you. (One Adventure.)',
    ],
  },
  {
    id: 'tequila_token',
    name: 'Tequila',
    type: 'Gear',
    slot: 'Token',
    cost: { gold: 125 },
    tags: ['Tequila', 'TokenPurchase'],
    effects: ['Gain 1 Tequila Token.'],
  },

  // ---------- Smuggler’s Hold-Out Pistol (anyone, but restrictive tags noted) ----------
  {
    id: 'smugglers_hold_out_pistol',
    name: "Smuggler's Hold-Out Pistol",
    type: 'Gear',
    slot: 'Gun',
    cost: { gold: 3000 },
    upgradeSlots: 2,
    weight: 1,
    twoHanded: false,
    tags: ['Gun', 'Pistol', 'Light', 'PerformerOrOutlawOrShowmanOnly', 'Limit1'],
    effects: [
      'Free Attack (Once per Fight).',
      'Range: 3  |  Shots: 3',
      'Critical Hit on 5 or 6.',
    ],
  },
];

export default smugglersDenItems;
