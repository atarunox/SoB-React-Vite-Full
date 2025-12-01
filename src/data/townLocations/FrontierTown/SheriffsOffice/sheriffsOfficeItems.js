// Sheriff’s Office — Purchase Items (gear)
// Weight/slots and handedness per your instructions.

export default [
  // Clothing & Equipment
  {
    id: 'so_caped_overcoat',
    name: 'Caped Overcoat',
    type: 'Gear',
    slot: 'Coat',
    cost: { gold: 800 },
    weight: 1,
    upgradeSlots: 0,
    tags: ['Gear', 'Clothing', 'Coat'],
    effects: [
      'Whenever you find a Clue Icon on an Exploration token, Heal D6 Health/Sanity (any mix).',
    ],
  },
  {
    id: 'so_black_duster',
    name: 'Black Duster',
    type: 'Gear',
    slot: 'Coat',
    cost: { gold: 1650 },
    weight: 1,
    upgradeSlots: 0,
    tags: ['Gear', 'Clothing', 'Coat', 'TravelerOnly'],
    effects: ['+2 Health', 'Armor 6+'],
  },
  {
    id: 'so_hangmans_noose',
    name: "Hangman's Noose",
    type: 'Gear',
    slot: "",
    cost: { gold: 2250 },
    weight: 1,
    upgradeSlots: 0,
    tags: ['Gear', 'Clothing', 'FrontierOrLawOnly'],
    effects: [
      'Free Attack (once per Adventure): Take D3 Corruption Hits to do "Peril" Wounds to an adjacent model ignoring Defense.',
    ],
  },
  {
    id: 'so_duelists_gunbelt',
    name: "Duelist's Gunbelt",
    type: 'Gear',
    slot: 'Belt',
    cost: { gold: 5800 },
    weight: 1,
    upgradeSlots: 0,
    tags: ['Gear', 'Clothing', 'Belt'],
    effects: [
      'When Dual Wielding, each Gun gets +1 Shot.',
    ],
  },

  // Law and Order (Guns)
  {
    id: 'so_peacekeeper_pistol',
    name: 'Peacekeeper Pistol',
    type: 'Gear',
    slot: 'Gun',
    cost: { gold: 1000 },
    weight: 1,
    upgradeSlots: 1,
    twoHanded: false,
    tags: ['Gear', 'Gun', 'Pistol', 'Law'],
    effects: ['Range: 6', 'Shots: 3'],
  },
  {
    id: 'so_executioners_shotgun',
    name: "Executioner's Shotgun",
    type: 'Gear',
    slot: 'Gun',
    cost: { gold: 2400 },
    weight: 1,
    upgradeSlots: 1,
    twoHanded: true,
    darkStone: 1, // contains 1 DS
    tags: ['Gear', 'Gun', 'Shotgun', 'Law'],
    effects: [
      'Range: 3',
      'Shots: 3',
      'Uses the D8 for To Hit and Damage (6, 7, or 8 count as a Critical Hit).',
      '+1 Damage if adjacent.',
    ],
  },
  {
    id: 'so_the_punisher',
    name: 'The Punisher',
    type: 'Gear',
    slot: 'Gun',
    cost: { gold: 3000 },
    weight: 1,
    upgradeSlots: 1,
    twoHanded: true,
    tags: ['Gear', 'Gun', 'Shotgun', 'Law'],
    effects: [
      'Range: 6',
      'Shots: 2',
      'Uses the D8 for To Hit and Damage (6, 7, or 8 count as a Critical Hit).',
      'Once per turn, you may re-roll one Damage roll for a Hit with this Gun.',
    ],
  },
];
