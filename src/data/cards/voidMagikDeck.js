// src/data/cards/voidMagikDeck.js
// Void Magik spell deck — used by Void Spellcasters (e.g. Void Sorcerers, Void Hive).
// Each spell has 4 Spell Levels; the caster's current Spell Level determines which row applies.
// Void Chant (Remains in Play) escalates the next non-Chant spell by 1 level.

export const VOID_MAGIK_CARDS = [
  {
    id: 'void_chant_1',
    name: 'Void Chant',
    type: 'Void Magik',
    tags: ['Spell', 'Magik', 'Void', 'Chant'],
    remainsInPlay: true,
    flavor: 'Swaying back and forth, the sorcerer chants in a rhythmic tone of void speech, building in intensity and pitch towards something sinister!',
    effects: [
      'Remains in Play. Discard this card when the next non-Chant Void Spell is cast — that Spell is cast at 1 higher Spell Level than normal.',
      'If the Spell would already be cast at max Spell Level, then an additional Spell is cast with it at its normal Spell Level.',
    ],
  },
  {
    id: 'void_chant_2',
    name: 'Void Chant',
    type: 'Void Magik',
    tags: ['Spell', 'Magik', 'Void', 'Chant'],
    remainsInPlay: true,
    flavor: 'Swaying back and forth, the sorcerer chants in a rhythmic tone of void speech, building in intensity and pitch towards something sinister!',
    effects: [
      'Remains in Play. Discard this card when the next non-Chant Void Spell is cast — that Spell is cast at 1 higher Spell Level than normal.',
      'If the Spell would already be cast at max Spell Level, then an additional Spell is cast with it at its normal Spell Level.',
    ],
  },
  {
    id: 'void_chant_3',
    name: 'Void Chant',
    type: 'Void Magik',
    tags: ['Spell', 'Magik', 'Void', 'Chant'],
    remainsInPlay: true,
    flavor: 'Swaying back and forth, the sorcerer chants in a rhythmic tone of void speech, building in intensity and pitch towards something sinister!',
    effects: [
      'Remains in Play. Discard this card when the next non-Chant Void Spell is cast — that Spell is cast at 1 higher Spell Level than normal.',
      'If the Spell would already be cast at max Spell Level, then an additional Spell is cast with it at its normal Spell Level.',
    ],
  },
  {
    id: 'persecution',
    name: 'Persecution',
    type: 'Void Magik',
    tags: ['Spell', 'Magik', 'Void', 'Hate'],
    spellLevels: {
      1: 'Every Hero immediately takes 1 Wound for each Corruption Point they have and 2 Wounds for each Mutation they have, ignoring Defense.',
      2: 'Every Hero also takes 3 Horror Hits.',
      3: 'Instead, 2 Wounds for each Corruption Point and 3 for each Mutation. Every Hero also takes 3 Horror Hits.',
      4: 'Instead, 2 Wounds for each Corruption Point and 3 for each Mutation. Every Hero also takes D6 Horror Hits.',
    },
    effects: [
      'Level 1: Every Hero immediately takes 1 Wound for each Corruption Point they have and 2 Wounds for each Mutation they have, ignoring Defense.',
      'Level 2: Every Hero also takes 3 Horror Hits.',
      'Level 3: Instead, 2 Wounds for each Corruption Point and 3 for each Mutation. Every Hero also takes 3 Horror Hits.',
      'Level 4: Instead, 2 Wounds for each Corruption Point and 3 for each Mutation. Every Hero also takes D6 Horror Hits.',
    ],
  },
  {
    id: 'disintegration',
    name: 'Disintegration',
    type: 'Void Magik',
    tags: ['Spell', 'Magik', 'Void', 'Destruction'],
    spellLevels: {
      1: 'One Random Hero must instantly discard 1 Dark Stone, a Side Bag Token, or an Item of their choice.',
      2: 'Instead, that Hero must choose all Side Bag Tokens or an Item.',
      3: 'Instead, that Hero must choose an Item that has 1 Weight or a Dark Stone attached.',
      4: 'Instead, that Hero must choose any Item.',
    },
    effects: [
      'Level 1: One Random Hero must instantly discard 1 Dark Stone, a Side Bag Token, or an Item of their choice.',
      'Level 2: Instead, that Hero must choose all Side Bag Tokens or an Item.',
      'Level 3: Instead, that Hero must choose an Item that has 1 Weight or a Dark Stone attached.',
      'Level 4: Instead, that Hero must choose any Item.',
    ],
  },
  {
    id: 'wave_of_mutation',
    name: 'Wave of Mutation',
    type: 'Void Magik',
    tags: ['Spell', 'Magik', 'Void', 'Corruption'],
    spellLevels: {
      1: 'Every Hero on a Map Tile with one or more Void Spellcasters immediately takes D3 Corruption Hits.',
      2: 'D6 Corruption Hits instead.',
      3: 'Peril Die {P} Corruption Hits instead.',
      4: 'D3 Corruption Points instead, ignoring Willpower.',
    },
    effects: [
      'Level 1: Every Hero on a Map Tile with one or more Void Spellcasters immediately takes D3 Corruption Hits.',
      'Level 2: D6 Corruption Hits instead.',
      'Level 3: Peril Die {P} Corruption Hits instead.',
      'Level 4: D3 Corruption Points instead, ignoring Willpower.',
    ],
  },
  {
    id: 'summoning_ritual',
    name: 'Summoning Ritual',
    type: 'Void Magik',
    tags: ['Spell', 'Magik', 'Void', 'Summon'],
    spellLevels: {
      1: 'Immediately add D3 Tentacles to the Fight as an Ambush. These new Enemies gain the Initiative bonus for Ambush, but do not Activate until next turn. This does NOT end the current turn.',
      2: 'Add Peril Die {P} Tentacles instead.',
      3: 'Add 6 Tentacles instead.',
      4: 'Add a Threat Card instead.',
    },
    effects: [
      'Level 1: Immediately add D3 Tentacles to the Fight as an Ambush. These new Enemies gain the Initiative bonus for Ambush, but do not Activate until next turn. This does NOT end the current turn.',
      'Level 2: Add Peril Die {P} Tentacles instead.',
      'Level 3: Add 6 Tentacles instead.',
      'Level 4: Add a Threat Card instead.',
    ],
  },
  {
    id: 'regeneration_aura',
    name: 'Regeneration Aura',
    type: 'Void Magik',
    tags: ['Spell', 'Magik', 'Void', 'Heal'],
    spellLevels: {
      1: 'All Enemies immediately Heal 2 Wounds.',
      2: 'Enemies Heal 3 Wounds instead.',
      3: 'Enemies Heal 5 Wounds instead.',
      4: 'Enemies Heal 5 Wounds instead, and all Enemies currently in play gain +2 to their Health.',
    },
    effects: [
      'Level 1: All Enemies immediately Heal 2 Wounds.',
      'Level 2: Enemies Heal 3 Wounds instead.',
      'Level 3: Enemies Heal 5 Wounds instead.',
      'Level 4: Enemies Heal 5 Wounds instead, and all Enemies currently in play gain +2 to their Health.',
    ],
  },
  {
    id: 'reading_from_the_book_of_tarn',
    name: 'Reading From the Book of Tarn',
    type: 'Void Magik',
    tags: ['Spell', 'Magik', 'Void', 'Book'],
    spellLevels: {
      1: 'Every Hero must instantly roll a D6 for each Grit they currently have, discarding it on the roll of 1 or 2 (Grit may not be used to Re-roll this).',
      2: 'Also, draw a Growing Dread card and add it to the stack.',
      3: 'Grit is now discarded on rolls of 1, 2, or 3 instead, and draw a Growing Dread card.',
      4: 'Grit is now discarded on rolls of 1, 2, or 3 instead, and draw a Growing Dread card and a Darkness card.',
    },
    effects: [
      'Level 1: Every Hero must instantly roll a D6 for each Grit they currently have, discarding it on the roll of 1 or 2 (Grit may not be used to Re-roll this).',
      'Level 2: Also, draw a Growing Dread card and add it to the stack.',
      'Level 3: Grit is now discarded on rolls of 1, 2, or 3 instead, and draw a Growing Dread card.',
      'Level 4: Grit is now discarded on rolls of 1, 2, or 3 instead, and draw a Growing Dread card and a Darkness card.',
    ],
  },
  {
    id: 'torment',
    name: 'Torment',
    type: 'Void Magik',
    tags: ['Spell', 'Magik', 'Void', 'Hate'],
    spellLevels: {
      1: 'All Heroes immediately take D6 Horror Hits.',
      2: 'D8 Horror Hits instead.',
      3: 'One Random Hero takes 2D6 Horror Hits instead.',
      4: 'All Heroes take 2D6 Horror Hits instead.',
    },
    effects: [
      'Level 1: All Heroes immediately take D6 Horror Hits.',
      'Level 2: D8 Horror Hits instead.',
      'Level 3: One Random Hero takes 2D6 Horror Hits instead.',
      'Level 4: All Heroes take 2D6 Horror Hits instead.',
    ],
  },
  {
    id: 'shimmering_aura',
    name: 'Shimmering Aura',
    type: 'Void Magik',
    tags: ['Spell', 'Magik', 'Void', 'Shield'],
    spellLevels: {
      1: 'All Enemies are +1 Defense for the rest of this turn, and until the end of next turn.',
      2: '+2 Defense instead.',
      3: '+3 Defense instead.',
      4: '+4 Defense instead.',
    },
    effects: [
      'Level 1: All Enemies are +1 Defense for the rest of this turn, and until the end of next turn.',
      'Level 2: +2 Defense instead.',
      'Level 3: +3 Defense instead.',
      'Level 4: +4 Defense instead.',
    ],
  },
  {
    id: 'voice_of_hate',
    name: 'Voice of Hate',
    type: 'Void Magik',
    tags: ['Spell', 'Magik', 'Void', 'Hate'],
    spellLevels: {
      1: 'All Enemy Ranged and Melee Attacks are +1 Damage during their next Activation.',
      2: '+2 Damage instead.',
      3: '+3 Damage instead.',
      4: '+4 Damage instead.',
    },
    effects: [
      'Level 1: All Enemy Ranged and Melee Attacks are +1 Damage during their next Activation.',
      'Level 2: +2 Damage instead.',
      'Level 3: +3 Damage instead.',
      'Level 4: +4 Damage instead.',
    ],
  },
];

export default VOID_MAGIK_CARDS;
