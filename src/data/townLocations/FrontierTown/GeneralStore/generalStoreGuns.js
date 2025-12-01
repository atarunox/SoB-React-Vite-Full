// src/data/townLocations/generalStoreGuns.js
const generalStoreGuns = {
  id: 'generalStoreGuns',
  name: 'Guns',
  type: 'shop',
  items: [
    // Pistols (all 1 weight, one-handed)
    {
      id: 'light_pistol',
      name: 'Light Pistol',
      type: 'Gear',
      slot: 'Gun',
      cost: { gold: 250 },
      weight: 1,
      twoHanded: false,
      upgradeSlots: 1,
      tags: ['Gun', 'Pistol', 'Light'],
      effects: [
        'Range: 6  |  Shots: 2',
        'Cannot get Critical Hits.'
      ],
    },
    {
      id: 'pistol',
      name: 'Pistol',
      type: 'Gear',
      slot: 'Gun',
      cost: { gold: 500 },
      weight: 1,
      twoHanded: false,
      upgradeSlots: 1,
      tags: ['Gun', 'Pistol'],
      effects: [
        'Range: 6  |  Shots: 2'
      ],
    },
    {
      id: 'quickdraw_pistol',
      name: 'Quickdraw Pistol',
      type: 'Gear',
      slot: 'Gun',
      cost: { gold: 1050 },
      weight: 1,
      twoHanded: false,
      upgradeSlots: 1,
      tags: ['Gun', 'Pistol'],
      effects: [
        'Range: 6  |  Shots: 2',
        '+1 Initiative in the first turn of a Fight.'
      ],
    },
    {
      id: 'gunfighters_pistol',
      name: "Gunfighter's Pistol",
      type: 'Gear',
      slot: 'Gun',
      cost: { gold: 2450 },
      weight: 1,
      twoHanded: false,
      upgradeSlots: 2,
      tags: ['Gun', 'Pistol'],
      effects: [
        'Range: 7  |  Shots: 3'
      ],
    },

    // Special pistol (1 weight, does not take a hand; free attack)
    {
      id: 'hold_out_pistol',
      name: 'Hold-Out Pistol',
      type: 'Gear',
      slot: 'Gun',
      cost: { gold: 800 },
      weight: 1,
      twoHanded: false,
      noHandSlot: true,             // <-- does not occupy a hand
      upgradeSlots: 1,
      tags: ['Gun', 'Pistol', 'Light', 'NoHandSlot'],
      restrictions: ['Performer Only'],
      effects: [
        'Free Attack (once per Fight).',
        'Does not occupy a Hand Slot.',
        'Range: 3  |  Shots: 1',
        'Critical Hit on 5 or 6.'
      ],
    },

    // Long guns (1 weight each; Shotguns & Hunting Rifle are two-handed)
    {
      id: 'shotgun',
      name: 'Shotgun',
      type: 'Gear',
      slot: 'Gun',
      cost: { gold: 1200 },
      weight: 1,
      twoHanded: true,              // <-- per your rule
      upgradeSlots: 2,
      tags: ['Gun', 'Shotgun'],
      effects: [
        'Range: 5  |  Shots: 1',
        'Uses the D8 for To-Hit and Damage (6, 7, or 8 count as a Critical Hit).'
      ],
    },
    {
      id: 'double_barrel_shotgun',
      name: 'Double-Barrel Shotgun',
      type: 'Gear',
      slot: 'Gun',
      cost: { gold: 2800 },
      weight: 2,
      twoHanded: true,              // <-- per your rule
      upgradeSlots: 2,
      tags: ['Gun', 'Shotgun'],
      effects: [
        'Range: 4  |  Shots: 2',
        'Uses the D8 for To-Hit and Damage (6, 7, or 8 count as a Critical Hit).'
      ],
    },
    {
      id: 'hunting_rifle',
      name: 'Hunting Rifle',
      type: 'Gear',
      slot: 'Gun',
      cost: { gold: 1500 },
      weight: 1,
      twoHanded: true,              // <-- per your rule
      upgradeSlots: 1,
      tags: ['Gun', 'Rifle'],
      effects: [
        'Range: 12  |  Shots: 1',
        'Damage +2'
      ],
    },
  ],
};

export default generalStoreGuns;
