// src/data/townLocations/BlastedWastesTown/ScavengerDoc/scavengerDocItems.js
// Purchase Items — Medical Supplies at the Scavenger Doc.

const scavengerDocItems = [
  {
    id: 'scav_alien_bandages',
    name: 'Alien Bandages',
    category: 'Gear',
    type: 'Gear',
    tags: ['Gear', 'Bandages', 'Tokens'],
    cost: { gold: 75 },
    weight: 1,
    description: 'Gain 1 Bandages Token.',
    effect: 'Gain 1 Bandages Token.',
    grantsToken: 'Bandages',
  },

  {
    id: 'scav_rot_gut',
    name: 'Scavenger Rot Gut',
    category: 'Gear',
    type: 'Gear',
    tags: ['Gear', 'Whiskey', 'Tokens'],
    cost: { gold: 75 },
    weight: 1,
    description: 'Gain 1 Whiskey Token.',
    effect: 'Gain 1 Whiskey Token.',
    grantsToken: 'Whiskey',
  },

  {
    id: 'scav_wasteland_tonic',
    name: 'Wasteland Tonic',
    category: 'Gear',
    type: 'Gear',
    tags: ['Gear', 'Tonic', 'Tokens'],
    cost: { gold: 200 },
    weight: 1,
    description: 'Gain 1 Tonic Token.',
    effect: 'Gain 1 Tonic Token.',
    grantsToken: 'Tonic',
  },

  {
    id: 'scav_loodus_saw',
    name: 'Loodus Saw',
    category: 'Gear',
    type: 'Gear',
    tags: ['Gear', 'Hand Weapon'],
    cost: { gold: 1350 },
    weight: 1,
    upgradeSlots: 3,
    description:
      'Your Combat Hits are +1 Damage against Large Size or bigger Enemies. Also, your Combat Hits may do 1 more Wound per Hit than normally allowed to Enemies with the Endurance Ability.',
    effect: '+1 Damage vs Large+ Enemies. +1 Wound per Hit vs Endurance.',
  },

  {
    id: 'scav_self_sealing_stim_patch',
    name: 'Self-Sealing Stim Patch',
    category: 'Gear',
    type: 'Gear',
    tags: ['Gear', 'Medical'],
    cost: { gold: 225 },
    weight: 1,
    limit: 'Limit two.',
    description:
      'Discard to ignore the effects of any one Injury (except Death) until the start of the next Adventure.',
    effect: 'Discard to ignore one Injury (except Death) until next Adventure.',
  },

  {
    id: 'scav_gut_scrubber',
    name: 'Gut Scrubber',
    category: 'Gear',
    type: 'Gear',
    tags: ['Gear', 'Medical'],
    cost: { gold: 350 },
    weight: 1,
    description:
      'Discard Gut Scrubber and all Grit you currently have to remove a Parasite on the D6 roll of 3+.',
    effect: 'Discard + all Grit → remove 1 Parasite on D6 roll of 3+.',
  },

  {
    id: 'scav_filter_mask',
    name: 'Filter Mask',
    category: 'Gear',
    type: 'Gear',
    tags: ['Gear', 'Clothing', 'Face'],
    cost: { gold: 125 },
    weight: 1,
    description:
      'Prevent any Poison effects you would take on the D6 roll of 4+ each.',
    effect: 'Prevent Poison effects on D6 roll of 4+ each.',
  },

  {
    id: 'scav_specimen_basket',
    name: 'Specimen Basket',
    category: 'Gear',
    type: 'Gear',
    tags: ['Gear', 'Alien', 'Science'],
    cost: { gold: 200 },
    weight: 1,
    limit: 'Limit one.',
    description:
      'While in any World (except the Blasted Wastes), you may give up your Move to try and find a sample of the local flora or fauna to put into the basket. Make a Lore 5+ test. If successful, the basket is filled. Next time you visit a Scavenger Doc in a Barter Town, you can sell the filled Specimen Basket to the Doc for D6×$200.',
    effect: 'Fill in Other Worlds (Lore 5+), sell at Scavenger Doc for D6×$200.',
  },
];

export default scavengerDocItems;
