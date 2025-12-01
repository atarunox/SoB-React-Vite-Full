// Street Market — Clothing & Equipment
const streetMarketEquipment = [
 // ----- Hats (Gear • Clothing • Hat) -----
  {
    id: 'sm_hat_scavengers',
    name: "Scavenger's Hat",
    type: 'Gear',
    slot: 'Hat',
    cost: { gold: 150 },
    tags: ['Gear', 'Clothing', 'Hat'],
    upgradeSlots: 1,
	weight:1,
    effects: ['Any time you successfully Scavenge, Heal 1 Wound.'],
  },
  {
    id: 'sm_hat_explorers',
    name: "Explorer's Hat",
    type: 'Gear',
    slot: 'Hat',
    cost: { gold: 425 },
    tags: ['Gear', 'Clothing', 'Hat'],
    upgradeSlots: 1,
	weight:1,
    effects: ['Once per Adventure, look at the top 2 Darkness cards, discard one, and put the other back.'],
  },
  {
    id: 'sm_hat_badlands',
    name: 'Badlands Hat',
    type: 'Gear',
    slot: 'Hat',
    cost: { gold: 1200 },
    tags: ['Gear', 'Clothing', 'Hat'],
    upgradeSlots: 1,
	weight:1,
    effects: ['+2 Health', '+1 Sanity'],
  },
  {
    id: 'sm_hat_miners',
    name: "Miner's Hat",
    type: 'Gear',
    slot: 'Hat',
    cost: { gold: 1850 },
    tags: ['Gear', 'Clothing', 'Hat'],
    upgradeSlots: 1,
	weight:1,
    effects: [
      'Once per Adventure, when drawing Loot, you may take 1 Corruption Hit to discard and re-draw a Loot card.',
    ],
  },
  {
    id: 'sm_hat_drifters',
    name: "Drifter's Hat",
    type: 'Gear',
    slot: 'Hat',
    cost: { gold: 3000 },
    tags: ['Gear', 'Clothing', 'Hat'],
    upgradeSlots: 1,
	weight:1,
    effects: [
      'Any time the Hero Posse enters a new Stage on the Depth Track, Recover up to your Max Grit.',
    ],
  },

  // ----- Ornate Pistol -----
  {
    id: 'sm_ornate_pistol',
    name: 'Ornate Pistol',
    type: 'Gear',
    slot: 'Gun',
    tags: ['Gear', 'Gun', 'Pistol'],
    cost: { gold: 1600 },
	twoHanded: false,
    upgradeSlots: 1,
	weight:1,
    effects: ['Range: 7  |  Shots: 2', 'Once per Fight, add +2 Damage to a Hit with this Pistol.'],
  },

  // ----- Butcher’s Blade -----
  {
    id: 'sm_butchers_blade',
    name: "Butcher's Blade",
    type: 'Gear',
    slot: 'Hand Weapon',twoHanded: false,
    tags: ['Gear', 'Hand Weapon', 'Blade'],
    cost: { gold: 750 },
    upgradeSlots: 2,
	weight:1,
    effects: [
      'Each time you wound an Enemy with a Combat Hit, you may add +1 Damage to all of your other Combat Hits for the rest of this turn (stacks for multiple Hits).',
    ],
  },
  
  
  {
    id: 'sm_merchants_apron',
    name: "Merchant's Apron",
    type: 'Gear',
    slot: 'Torso',
    tags: ['Gear', 'Clothing', 'Torso', 'Frontier Only'],
    restrictions: ['Frontier Only'],
	weight:1,
    cost: { gold: 350 },
    effects: [
      'When you sell a Gear/Artifact card in Town, gain +10% (round up to nearest $5) and Recover 1 Grit.',
    ],
  },
  {
    id: 'sm_railworkers_jacket',
    name: "Railworker's Jacket",
    type: 'Gear',
    slot: 'Coat',
    tags: ['Gear', 'Clothing', 'Coat'],
	weight:1,
    cost: { gold: 860 },
    effects: [
      'You take 1 less Wound from all Explosives (like Dynamite) and from Falling Rubble and Cave-ins.',
    ],
  },
];

export default streetMarketEquipment;
