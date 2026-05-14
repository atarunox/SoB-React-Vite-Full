// src/data/townLocations/BlastedWastesTown/WastelandWorkshop/wastelandWorkshopArmor.js
// Purchase Items: Wasteland Scrap Armor & Upgrades

export default [
  // ── Wasteland Scrap Armor ──────────────────────────────────────────────
  {
    id: 'ww_wasteland_scrap_armor',
    name: 'Wasteland Scrap Armor',
    type: 'gear',
    cost: { gold: 1500, scrap: 12 },
    slot: 'Clothing (Torso)',
    tags: ['Gear', 'Rust', 'Clothing', 'Torso'],
    weight: 1,
    upgradeSlots: 6,
    effects: [
      'When purchased, place 6 free Scrap Tokens on this Item as Scrap Armor Markers.',
      'Discard a Scrap Armor Marker from here at any time to prevent up to 3 Wounds you would take.',
      'From now on, whenever you visit the Wasteland Workshop or Blacksmith in Town, you may spend $100 to have him add any number of Scrap Tokens you carry to this Item as Scrap Armor Markers. Limit 6 Scrap Armor Markers at a time.',
    ],
  },

  // ── Armor Upgrades ─────────────────────────────────────────────────────
  {
    id: 'ww_extra_fittings',
    name: 'Extra Fittings',
    type: 'upgrade',
    cost: { gold: 500, scrap: 2 },
    tags: ['Upgrade', 'Rust'],
    requires: 'Wasteland Scrap Armor',
    effects: [
      'Attach to Wasteland Scrap Armor.',
      'Bonus: Your Wasteland Scrap Armor now has Limit 10 Scrap Armor Markers at a time.',
    ],
  },

  {
    id: 'ww_armor_spikes',
    name: 'Armor Spikes',
    type: 'upgrade',
    cost: { gold: 250, scrap: 4 },
    tags: ['Upgrade', 'Rust'],
    requires: 'Wasteland Scrap Armor',
    effects: [
      'Attach to Wasteland Scrap Armor.',
      'Bonus: Any time an adjacent Enemy rolls a 1 To Hit, it takes 1 Wound, ignoring Defense.',
    ],
  },

  {
    id: 'ww_socket_fittings',
    name: 'Socket Fittings',
    type: 'upgrade',
    cost: { gold: 1000 },
    tags: ['Upgrade', 'Rust'],
    requires: 'Wasteland Scrap Armor',
    effects: [
      'Attach to Wasteland Scrap Armor.',
      'Bonus: You may now use 1 Grit at any time during your Activation to add any number of Scrap Tokens you are carrying to the Armor as Scrap Armor Markers (instead of needing to return to the Wasteland Workshop or Blacksmith), up to the Armor\'s Limit.',
    ],
  },
];
