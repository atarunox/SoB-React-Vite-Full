// src/data/townLocations/BlastedWastesTown/MiningOperation/miningOperationServices.js
// Work Down in the Tunnels — you may do 1 of the following per Location Visit.

export default [
  {
    id: 'mo_work_refinery',
    name: 'Work the Refinery',
    category: 'Service',
    type: 'Work',
    tags: ['Service', 'Work', 'Tunnels'],
    cost: 'Discard 1 Grit',
    description:
      'The machinery and scrap weapons in the Blasted Wastes need oil and fuel to keep them going. While mining operations locate and drill for these deposits, the refineries process it for sale.',
    effect:
      'Take D6 Corruption Hits and gain D6 \u00d7 $10 for a hard day\u2019s work at the Refinery. Flash Powder costs you $25 less today.',
    limit: '1 Work per Location Visit',
  },

  {
    id: 'mo_work_fungus_farms',
    name: 'Work the Fungus Farms',
    category: 'Service',
    type: 'Work',
    tags: ['Service', 'Work', 'Tunnels'],
    cost: 'Discard 1 Grit',
    description:
      'The Blasted Wastes is a barren desert landscape, toxic and deadly to the core. There is little vegetation that grows on the surface but underneath many kinds of fungus can be harvested.',
    effect:
      'Gain D6 \u00d7 $5 for a day\u2019s work in the spore-filled fungus crops. Any Fungus purchased today costs you $25 less each.',
    limit: '1 Work per Location Visit',
  },

  {
    id: 'mo_work_mines',
    name: 'Work the Mines',
    category: 'Service',
    type: 'Work',
    tags: ['Service', 'Work', 'Tunnels'],
    cost: 'Discard 1 Grit',
    description:
      'The miners run around the clock to dig through rock, sand, and hulks of old ships, searching for raw materials, Dark Stone, and any valuable artifacts swallowed by the desert sands over the eons.',
    effect:
      'Take D6 Hits and gain D6 \u00d7 $10, and roll on the Mining Chart.',
    limit: '1 Work per Location Visit',
    resultTable: {
      '1': 'Burial Hulk \u2013 Undead burst from the wreck and attack! One Random Building in Town is Destroyed!',
      '2': 'Cave In \u2013 Take D6 Wounds, ignoring Defense.',
      '3': 'Scrap Pocket \u2013 Gain D3+1 Scrap Tokens.',
      '4': 'Lost Tech \u2013 Draw a Blasted Wastes Scavenge card.',
      '5': 'Buried Escape Pod \u2013 Draw D3 Blasted Wastes Scavenge cards.',
      '6': '"What\'s This?" \u2013 Draw a World card and an Artifact from that World.',
    },
  },
];
