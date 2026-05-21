// src/data/cards/personalItems.js
// Personal Item cards — each new hero draws 1 at random (some classes draw 2).
// These items are always active and do not occupy a standard gear slot
// unless they are Clothing items (Weathered Poncho → Shoulders, Adventure Boots → Boots).

export const PERSONAL_ITEM_CARDS = [
  {
    id: 'shackles',
    name: 'Shackles',
    type: 'Personal',
    tags: ['Personal'],
    statBonus: { Strength: 1 },
    effects: [
      '+1 Strength.',
      'Once per Adventure, cancel and Re-draw an Exploration Token.',
    ],
  },
  {
    id: 'personal_journal',
    name: 'Personal Journal',
    type: 'Personal',
    tags: ['Personal', 'Book'],
    statBonus: { Spirit: 1, Lore: 1 },
    effects: [
      '+1 Spirit, +1 Lore.',
      'Gain 50 XP at the end of every Adventure.',
    ],
  },
  {
    id: 'worn_eye_patch',
    name: 'Worn Eye Patch',
    type: 'Personal',
    tags: ['Personal'],
    statBonus: { Cunning: 1 },
    effects: [
      '+1 Cunning.',
      'Once per Adventure, Recover Grit up to your Max Grit.',
    ],
  },
  {
    id: 'locket',
    name: 'Locket',
    type: 'Personal',
    tags: ['Personal'],
    statBonus: { Spirit: 1 },
    effects: [
      '+1 Spirit.',
      'Add +1 to all of your Catch Your Breath rolls.',
    ],
  },
  {
    id: 'pocket_watch',
    name: 'Pocket Watch',
    type: 'Personal',
    tags: ['Personal', 'Time'],
    statBonus: { Initiative: 1 },
    effects: [
      '+1 Initiative.',
    ],
  },
  {
    id: 'weathered_poncho',
    name: 'Weathered Poncho',
    type: 'Personal',
    tags: ['Personal', 'Clothing'],
    slot: 'Shoulders',
    statBonus: { maxHealth: 4 },
    effects: [
      '+4 Health.',
      'Ignore Weather effects.',
    ],
  },
  {
    id: 'ace_of_spades',
    name: 'Ace of Spades',
    type: 'Personal',
    tags: ['Personal', 'Charm'],
    statBonus: { Luck: 1 },
    effects: [
      '+1 Luck.',
      'You may roll one extra die for Scavenge tests.',
    ],
  },
  {
    id: 'cigarette',
    name: 'Cigarette',
    type: 'Personal',
    tags: ['Personal', 'Fire'],
    statBonus: {},
    effects: [
      'Recover 1 Grit any time you draw one or more Loot or Scavenge cards.',
    ],
  },
  {
    id: 'ancient_coin',
    name: 'Ancient Coin',
    type: 'Personal',
    tags: ['Personal'],
    statBonus: { Lore: 1 },
    effects: [
      '+1 Lore.',
      'Once per Adventure, Fully Heal your Health.',
    ],
  },
  {
    id: 'adventure_boots',
    name: 'Adventure Boots',
    type: 'Personal',
    tags: ['Personal', 'Clothing'],
    slot: 'Feet',
    statBonus: { Agility: 1, Move: 1 },
    effects: [
      '+1 Agility, +1 Move.',
    ],
  },
  {
    id: 'hand_mirror',
    name: 'Hand Mirror',
    type: 'Personal',
    tags: ['Personal', 'Glass'],
    statBonus: { maxSanity: 4 },
    effects: [
      '+4 Sanity.',
      "'Voices in the Dark' now only does D3 Hits to you (instead of D6).",
    ],
  },
];

export default PERSONAL_ITEM_CARDS;
