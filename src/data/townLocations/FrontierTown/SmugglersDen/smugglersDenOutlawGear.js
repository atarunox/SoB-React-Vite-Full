// “Smugglers & Thieves” tab — restricted to heroes with the Outlaw keyword
const smugglersDenOutlawGear = [
  // ---------- Guns ----------
  {
    id: 'outlaw_pistol',
    name: 'Outlaw Pistol',
    type: 'Gear',
    slot: 'Gun',
    cost: { gold: 300 },
    upgradeSlots: 3,
    weight: 1,
    twoHanded: false, // 1-handed
    tags: ['Gun', 'Pistol', 'OutlawOnly'],
    effects: [
      'Range: 5  |  Shots: 3',
      'May only get Critical Hits against adjacent targets.',
    ],
  },
  {
    id: 'sawed_off_shotgun',
    name: 'Sawed-Off Shotgun',
    type: 'Gear',
    slot: 'Gun',
    cost: { gold: 850 },
    upgradeSlots: 1,
    weight: 1,
    twoHanded: true, // 2-handed
    tags: ['Gun', 'Shotgun', 'OutlawOnly'],
    effects: [
      'Range: 3  |  Shots: 1',
      'Uses the D8 for To-Hit and Damage (6/7/8 are Critical).',
      'Splash Damage — a Critical Hit also does 1 Wound to every adjacent Enemy to the target, ignoring Defense.',
    ],
  },

  // ---------- Clothing & Equipment ----------
  {
    id: 'bandana_face',
    name: 'Bandana',
    type: 'Gear',
    slot: 'Face',
    cost: { gold: 100 },
    tags: ['Clothing', 'Face', 'OutlawOnly'],
    effects: ['Once per turn, you may re-roll an Escape test.'],
  },
  {
    id: 'shaped_charge',
    name: 'Shaped Charge',
    type: 'Gear',
    slot: 'Token',
    cost: { gold: 325 },
    tags: ['Explosive', 'Consumable', 'Limit1', 'OutlawOnly'],
    effects: [
      'Discard for a Free Attack against an adjacent Enemy.',
      'Target and each model in the 3 spaces directly behind it take D6 Wounds (ignores Defense).',
    ],
  },
  {
    id: 'black_gunbelt',
    name: 'Black Gunbelt',
    type: 'Gear',
    slot: 'Belt',
    cost: { gold: 600 },
    weight: 1,
    twoHanded: false,
    tags: ['Clothing', 'Belt', 'OutlawOnly'],
    effects: ['Once per Adventure, gain +2 Shots with a Gun.'],
  },
  {
    id: 'gunmans_poncho',
    name: 'Gunman’s Poncho',
    type: 'Gear',
    slot: 'Shoulders',
    cost: { gold: 750 },
    weight: 1,
    twoHanded: false,
    tags: ['Clothing', 'Poncho', 'OutlawOnly'],
    effects: [
      '+1 Initiative in the first turn of a Fight.',
      'You may ignore Weather effects.',
    ],
  },
];

export default smugglersDenOutlawGear;
