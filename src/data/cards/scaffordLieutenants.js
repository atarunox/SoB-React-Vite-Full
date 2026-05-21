// src/data/cards/scaffordLieutenants.js
// The Scafford Gang — Scafford Lieutenants deck
// Each card represents a named lieutenant drawn when a threat card calls for one.

export const SCAFFORD_LIEUTENANT_CARDS = [
  {
    id: 'sgt_bunker',
    name: 'Sgt. Bunker',
    type: 'Scafford Lieutenant',
    flavor: 'Tasked with leading the roughest and rowdiest of the gang, Sargent Bunker is a master of whipping his men into a frenzy. If the job calls for a charge into the jaws of death... his men will follow him through the very gates of Hell!',
    stats: {
      health: 15,
      bonusShotsOrCombat: '+1 Shot/Combat',
      xp: '10 +5 each',
    },
    abilities: [
      {
        name: 'Rebel Yell',
        effect: "Roll a D6 at the start of the Scafford Gang's Activation. On the roll of 4+, they ignore Shootout and their Ranged Attacks this turn, moving and targeting normally for Melee Attacks. They also gain +5 Move and +2 Combat for this Activation.",
      },
    ],
    tags: ['Scafford', 'Lieutenant', 'Outlaw'],
  },
  {
    id: 'ol_one_eye_jackson',
    name: "Ol 'One Eye' Jackson",
    type: 'Scafford Lieutenant',
    flavor: "Colonel Scafford's son, Jackson, is by far the most mutated of the gang, now nearly unrecognizable as his former self. As such, he is tasked with leading the most mutated and wretchedly mangled members of the gang, taking on missions none of the others would be willing to touch.",
    stats: {
      health: 10,
      defense: '+1',
      xp: '15 +5 each',
    },
    abilities: [
      {
        name: 'Void Eye',
        effect: "At the start of each turn, one Random Hero in Ol 'One Eye' Jackson's Line of Sight takes D6 Corruption Hits.",
      },
      {
        name: 'Band of Misfit Mutants',
        effect: "All other Scafford Gang models in this Fight are +2 Health and +2 Combat. This effect persists even if Ol 'One Eye' Jackson is killed.",
      },
    ],
    tags: ['Scafford', 'Lieutenant', 'Outlaw', 'Mutant'],
  },
  {
    id: 'stone_face_mccoy',
    name: "'Stone Face' McCoy",
    type: 'Scafford Lieutenant',
    flavor: "When his head, neck, and arm fused with rock, it also froze an angry grimace onto his face; his mouth open just wide enough to chew on his cigar. Now 'Stone Face' Harry McCoy is one of the most ruthless poker players and toughest outlaws in the West. He leads his band of men with a rocky fist!",
    stats: {
      health: 15,
      xp: '10 +5 each',
    },
    abilities: [
      {
        name: 'Stone Cold Stare',
        effect: 'Heroes on the same Map Tile may not Recover Grit.',
      },
      {
        name: 'Tough',
        effect: 'Immune to Critical Hits.',
      },
      {
        name: 'Ruthless Ways',
        effect: "Scafford Gang To Hit rolls of 6 ignore the target's Defense.",
      },
    ],
    tags: ['Scafford', 'Lieutenant', 'Outlaw'],
  },
  {
    id: 'captain_burns',
    name: 'Captain Burns',
    type: 'Scafford Lieutenant',
    flavor: 'During the war, Captain Burns made a name for himself as an expert skirmisher, leading raids into enemy territory and campsites! Now he uses that skill to rob trains and towns for his own gain. His infamous battlecry inspires his men to unleash a brutal hit and run attack.',
    stats: {
      health: 12,
      bonusShotsOrCombat: '+2 Shots',
      xp: '10 +5 each',
    },
    abilities: [
      {
        name: '"Give \'em Hell Boys!"',
        effect: 'All Scafford Gang models (including himself) gain +2 Shots while using their Firefight Ability.',
      },
    ],
    tags: ['Scafford', 'Lieutenant', 'Outlaw'],
  },
  {
    id: 'fast_draw_jeb_scafford',
    name: "'Fast Draw' Jeb Scafford",
    type: 'Scafford Lieutenant',
    flavor: "The fastest gun in the gang, Jeb Scafford is famous for his nimble fingers and his Dead Eye shot, despite the fact that his eyes have grown over making him blind! It's said that he smells his opponents on the wind and hears their heart beat faster and faster... that is until he stops it, with a bullet.",
    stats: {
      health: 10,
      rangeToHit: '3+',
      xp: '10 +5 each',
    },
    abilities: [
      {
        name: 'Supernatural Senses',
        effect: 'All Scafford Gang models (including himself) are +2 Initiative.',
      },
      {
        name: 'Dead Eye',
        effect: "'Fast Draw' Jeb Scafford's To Hit rolls of 6 do an additional +D6 Damage.",
      },
    ],
    tags: ['Scafford', 'Lieutenant', 'Outlaw'],
  },
  {
    id: 'silver_back_pa_scafford',
    name: "'Silver Back' Pa Scafford",
    type: 'Scafford Lieutenant',
    flavor: "Old beyond reckoning, 'Silver Back' Pa Scafford is the great grandfather of the Colonel. Though he's got a hunched back and his eye sight is all but gone, he smokes a Dark Stone pipe and is as tough and ornery as they come, refusing to die. He may not be able to see you, but if he can hear you, you'll regret ever setting foot on his land.",
    stats: {
      health: 7,
      xp: '10 +5 each',
    },
    abilities: [
      {
        name: "'Ol Sum Bit'",
        effect: 'Pa Scafford has Tough (Immune to Critical Hits) and Endurance (1) (takes no more than 1 Wound per Hit).',
      },
      {
        name: 'Ear Horn',
        effect: 'While Pa Scafford is on the board, Heroes collect Noise Markers. Only targets Heroes with 1 or more Noise.',
      },
      {
        name: 'Blunderbuss',
        effect: 'Replaces Scafford Pistols with the following Ranged Attack: Range 5, Shots * (equal to the number of Noise markers on the target), Damage D8. Uses the D8 To Hit.',
      },
    ],
    tags: ['Scafford', 'Lieutenant', 'Outlaw', 'Promo'],
    promoId: 'Promo-486',
  },
];

export default SCAFFORD_LIEUTENANT_CARDS;
