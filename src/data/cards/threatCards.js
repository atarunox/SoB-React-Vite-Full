// src/data/cards/threatCards.js
// Manually transcribed from physical Threat Deck cards.
// {P} = Peril Die (custom D6 with faces 3,3,4,4,5,6)
// heroTable = spawn varies by hero count (1-2 / 3-4 / 5-6)

// ── Standard (non-OtherWorld) cards ─────────────────────────────────────────

export const THREAT_CARDS_STANDARD = [
  // ── Simple spawns ──────────────────────────────────────────────────────────
  {
    id: '1_burrower',
    name: '1 Burrower',
    tier: 'low',
    spawn: '1 Burrower',
    effects: [],
  },
  {
    id: '1_burrower_2',
    name: '1 Burrower',
    tier: 'low',
    spawn: '1 Burrower',
    effects: [],
  },
  {
    id: '1_burrower_and_1_threat_card',
    name: '1 Burrower and 1 Threat Card',
    tier: 'low',
    spawn: '1 Burrower and 1 Threat Card',
    effects: [],
  },
  {
    id: '1_sand_kraken',
    name: '1 Sand Kraken',
    tier: 'low',
    spawn: '1 Sand Kraken',
    effects: [],
  },
  {
    id: 'the_ancient_one',
    name: 'The Ancient One',
    tier: 'low',
    spawn: '1 The Ancient One',
    effects: [],
  },
  {
    id: 'the_ancient_one_2',
    name: 'The Ancient One',
    tier: 'low',
    spawn: '1 The Ancient One',
    effects: [],
  },
  {
    id: 'the_ancient_one_and_crimson_hand',
    name: 'The Ancient One and {P} Crimson Hand',
    tier: 'low',
    spawn: '1 The Ancient One and {P} Crimson Hand',
    effects: ['Or 1 Threat Card if you do not have Crimson Hand expansion.'],
  },
  {
    id: '1_goliath_and_1_threat_card',
    name: '1 Goliath and 1 Threat Card',
    tier: 'low',
    spawn: '1 Goliath and 1 Threat Card',
    effects: [],
  },
  {
    id: '1_goliath_and_1_threat_card_2',
    name: '1 Goliath and 1 Threat Card',
    tier: 'low',
    spawn: '1 Goliath and 1 Threat Card',
    effects: [],
  },
  {
    id: '1_goliath_and_2_low_threat_cards',
    name: '1 Goliath and 2 Low Threat Cards',
    tier: 'low',
    spawn: '1 Goliath and 2 Low Threat Cards',
    effects: [],
  },
  {
    id: '1_void_magus_and_2_threat_cards',
    name: '1 Void Magus and 2 Threat Cards',
    tier: 'low',
    spawn: '1 Void Magus and 2 Threat Cards',
    effects: [],
  },
  {
    id: '3_dark_stone_brutes_and_2_threat_cards',
    name: '3 Dark Stone Brutes and 2 Threat Cards',
    tier: 'low',
    spawn: '3 Dark Stone Brutes and 2 Threat Cards',
    effects: [],
  },
  {
    id: 'heretic_preacher_and_1_threat_card',
    name: 'Heretic Preacher and 1 Threat Card',
    tier: 'low',
    spawn: '1 Heretic Preacher and 1 Threat Card',
    effects: [],
  },
  {
    id: '1_magma_giant',
    name: '1 Magma Giant',
    tier: 'low',
    spawn: '1 Magma Giant',
    effects: [],
  },

  // ── Heroes-table cards (spawn varies by hero count) ────────────────────────
  {
    id: 'feral_kin_pack_master',
    name: 'Feral Kin Pack Master and...',
    tier: 'low',
    heroTable: [
      { range: '1-2', text: '1 Threat Card' },
      { range: '3-4', text: 'D3+1 Werewolf Feral Kin and 1 Threat Card' },
      { range: '5-6', text: '{P} Werewolf Feral Kin and 1 Threat Card' },
    ],
    effects: [],
  },
  {
    id: 'death_cult',
    name: 'Death Cult',
    tier: 'low',
    heroTable: [
      { range: '1-2', text: '{P}{P} Crimson Hand' },
      { range: '3-4', text: 'Inquisitor and {P}{P} Crimson Hand' },
      { range: '5-6', text: 'Inquisitor and 12 Crimson Hand' },
    ],
    effects: [],
  },
  {
    id: 'death_cult_2',
    name: 'Death Cult',
    tier: 'low',
    heroTable: [
      { range: '1-2', text: '{P}{P} Crimson Hand' },
      { range: '3-4', text: 'Inquisitor and {P}{P} Crimson Hand' },
      { range: '5-6', text: 'Inquisitor and 12 Crimson Hand' },
    ],
    effects: [],
  },
  {
    id: 'colonel_scafford_mutations',
    name: 'Colonel Scafford and... (Mutations)',
    tier: 'low',
    heroTable: [
      { range: '1-2', text: 'D3+1 Scaffold Gang with 1 Hideous Mutation' },
      { range: '3-4', text: '{P} Scaffold Gang with 2 Hideous Mutations' },
      { range: '5-6', text: '6 Scaffold Gang with 3 Hideous Mutations' },
    ],
    effects: [],
  },
  {
    id: 'colonel_scafford_mutations_2',
    name: 'Colonel Scafford and... (Mutations)',
    tier: 'low',
    heroTable: [
      { range: '1-2', text: 'D3+1 Scaffold Gang with 1 Hideous Mutation' },
      { range: '3-4', text: '{P} Scaffold Gang with 2 Hideous Mutations' },
      { range: '5-6', text: '6 Scaffold Gang with 3 Hideous Mutations' },
    ],
    effects: [],
  },
  {
    id: 'colonel_scafford_threat_cards',
    name: 'Colonel Scafford and... (Threat Cards)',
    tier: 'low',
    heroTable: [
      { range: '1-2', text: '1 Threat Card' },
      { range: '3-4', text: 'D3+1 Scaffold Gang and 1 Threat Card' },
      { range: '5-6', text: '{P} Scaffold Gang and 1 Threat Card' },
    ],
    effects: [],
  },
  {
    id: 'werewolf_pack',
    name: 'Werewolf Pack',
    tier: 'low',
    heroTable: [
      { range: '1-2', text: '{P} Werewolf Feral Kin' },
      { range: '3-4', text: 'Feral Kin Pack Master and {P} Werewolf Feral Kin' },
      { range: '5-6', text: 'Feral Kin Pack Master and 6 Werewolf Feral Kin' },
    ],
    effects: ['Draw a Werewolf Tribal Pack card if there is not one already in play.'],
  },
  {
    id: 'feral_vampire_brood',
    name: 'Feral Vampire Brood',
    tier: 'low',
    heroTable: [
      { range: '1-2', text: '{P} Feral Vampires' },
      { range: '3-4', text: 'Feral Vampire Lord and {P} Feral Vampires' },
      { range: '5-6', text: 'Feral Vampire Lord and 6 Feral Vampires' },
    ],
    effects: [],
  },
  {
    id: 'feral_vampire_lord',
    name: 'Feral Vampire Lord and...',
    tier: 'low',
    heroTable: [
      { range: '1-2', text: '1 Threat Card' },
      { range: '3-4', text: 'D3+1 Feral Vampires and 1 Threat Card' },
      { range: '5-6', text: '{P} Feral Vampires and 1 Threat Card' },
    ],
    effects: [],
  },
  {
    id: 'black_fang_war_party',
    name: 'Black Fang War Party',
    tier: 'low',
    spawn: 'Black Fang War Shaman, 6 Black Fang Tribe, and 1 Threat Card',
    effects: [],
  },

  // ── Promo leader cards ─────────────────────────────────────────────────────
  {
    id: 'stone_face_mccoy',
    name: "'Stone Face' McCoy, {P}+1 Scaffold Gang, and 3 Dark Stone Brutes",
    tier: 'low',
    promoId: 'Promo-461',
    spawn: "{P}+1 Scaffold Gang and 3 Dark Stone Brutes (Leader: 'Stone Face' McCoy)",
    effects: ["Leader - 'Stone Face' has double Health for this Fight."],
  },
  {
    id: 'fast_draw_jeb_scafford',
    name: "'Fast Draw' Jeb Scafford, {P} Scaffold Gang, and D3 Dark Stone Brutes",
    tier: 'low',
    promoId: 'Promo-405',
    spawn: "{P} Scaffold Gang and D3 Dark Stone Brutes (Leader: 'Fast Draw' Jeb Scafford)",
    effects: ["Leader - 'Fast Draw' Jeb Scafford has double Health and +2 Shots for this Fight."],
  },
  {
    id: 'sgt_bunker',
    name: 'Sgt. Bunker, {P} Scaffold Gang, and D3 Dark Stone Brutes',
    tier: 'low',
    promoId: 'Promo-461',
    spawn: '{P} Scaffold Gang and D3 Dark Stone Brutes (Leader: Sgt. Bunker)',
    effects: ['Leader - Sgt. Bunker has double Health for this Fight.'],
  },
  {
    id: 'captain_burns',
    name: 'Captain Burns, {P}{P} Scaffold Gang, and 1 Dark Stone Brute',
    tier: 'low',
    promoId: 'Promo-473',
    spawn: '{P}{P} Scaffold Gang and 1 Dark Stone Brute (Leader: Captain Burns)',
    effects: [
      'Leader - Captain Burns has double Health and +2 Combat for this Fight.',
      'Super Brute - The Dark Stone Brute has triple its Health for this Fight.',
    ],
  },
  {
    id: 'ol_one_eye_jackson',
    name: "Ol 'One Eye' Jackson, {P}+1 Scaffold Gang, and 3 Dark Stone Brutes",
    tier: 'low',
    promoId: 'Promo-472',
    spawn: "{P}+1 Scaffold Gang and 3 Dark Stone Brutes (Leader: Ol 'One Eye' Jackson)",
    effects: ["Leader - Ol 'One Eye' has double Health for this Fight."],
  },
  {
    id: 'silver_back_pa_scafford',
    name: "'Silver Back' Pa Scafford, {P}{P} Scaffold Gang, and 1 Dark Stone Brute",
    tier: 'low',
    promoId: 'Promo-485',
    spawn: "{P}{P} Scaffold Gang and 1 Dark Stone Brute (Leader: 'Silver Back' Pa Scafford)",
    effects: [
      'Leader - Pa Scafford has double Health and +1 Shot for this Fight.',
      'Super Brute - The Dark Stone Brute has triple its Health for this Fight.',
    ],
  },
];

// ── OtherWorld threat cards ──────────────────────────────────────────────────

export const THREAT_CARDS_OTHERWORLD = [
  // Blasted Wastes ────────────────────────────────────────────────────────────
  {
    id: '1_wasteland_giant_blasted_wastes',
    name: '1 Wasteland Giant',
    tier: 'otherworld',
    world: 'Blasted Wastes',
    spawn: '1 Wasteland Giant',
    effects: [
      'A Wasteland Giant is a Magma Giant with the following: +1 Combat, +5 XP.',
      'Replaces Keyword Cynder with Blasted Wastes.',
      'All references to Burning markers are changed to Stunned markers instead.',
      'Elite Chart result 1-2) is replaced with:',
      '1) Dripping Acid — Any Hero ending their move adjacent to the Wasteland Giant takes 2 Hits that do 2 Damage each.',
      '2) Erupts From the Sand — Always starts in Ambush and is +1 Damage for each adjacent Hero.',
    ],
  },
  {
    id: '1_wasteland_giant_blasted_wastes_2',
    name: '1 Wasteland Giant',
    tier: 'otherworld',
    world: 'Blasted Wastes',
    spawn: '1 Wasteland Giant',
    effects: [
      'A Wasteland Giant is a Magma Giant with the following: +1 Combat, +5 XP.',
      'Replaces Keyword Cynder with Blasted Wastes.',
      'All references to Burning markers are changed to Stunned markers instead.',
      'Elite Chart result 1-2) is replaced with:',
      '1) Dripping Acid — Any Hero ending their move adjacent to the Wasteland Giant takes 2 Hits that do 2 Damage each.',
      '2) Erupts From the Sand — Always starts in Ambush and is +1 Damage for each adjacent Hero.',
    ],
  },
  {
    id: '1_sand_kraken_blasted_wastes',
    name: '1 Sand Kraken',
    tier: 'otherworld',
    world: 'Blasted Wastes',
    spawn: '1 Sand Kraken',
    effects: [],
  },
  {
    id: '1_sand_kraken_and_1_threat_card_blasted_wastes',
    name: '1 Sand Kraken and 1 Threat Card',
    tier: 'otherworld',
    world: 'Blasted Wastes',
    spawn: '1 Sand Kraken and 1 Threat Card',
    effects: [],
  },
  {
    id: '1_burrower_blasted_wastes',
    name: '1 Burrower',
    tier: 'otherworld',
    world: 'Blasted Wastes',
    spawn: '1 Burrower',
    effects: [],
  },
  {
    id: '3_sand_crabs_and_1_threat_card_blasted_wastes',
    name: '3 Sand Crabs and 1 Threat Card',
    tier: 'otherworld',
    world: 'Blasted Wastes',
    spawn: '3 Sand Crabs and 1 Threat Card',
    effects: [],
  },

  // Caverns of Cynder ─────────────────────────────────────────────────────────
  {
    id: '1_magma_giant_caverns_of_cynder',
    name: '1 Magma Giant',
    tier: 'otherworld',
    world: 'Caverns of Cynder',
    spawn: '1 Magma Giant',
    effects: [],
  },
  {
    id: '1_magma_giant_and_1_threat_card_caverns_of_cynder',
    name: '1 Magma Giant and 1 Threat Card',
    tier: 'otherworld',
    world: 'Caverns of Cynder',
    spawn: '1 Magma Giant and 1 Threat Card',
    effects: [],
  },
  {
    id: '1_onmorake_and_6_scourge_dead',
    name: '1 Onmorake and 6 Scourge Dead',
    tier: 'otherworld',
    world: 'Caverns of Cynder',
    spawn: '1 Onmorake and 6 Scourge Dead',
    effects: [],
  },

  // Targa Plateau ─────────────────────────────────────────────────────────────
  {
    id: '2_guardians_targa_plateau',
    name: '2 Guardians',
    tier: 'otherworld',
    world: 'Targa Plateau',
    spawn: '2 Guardians',
    effects: [],
  },
  {
    id: '1_guardian_and_1_threat_card_targa_plateau',
    name: '1 Guardian and 1 Threat Card',
    tier: 'otherworld',
    world: 'Targa Plateau',
    spawn: '1 Guardian and 1 Threat Card',
    effects: [],
  },
  {
    id: '1_guardian_and_1_threat_card_targa_plateau_2',
    name: '1 Guardian and 1 Threat Card',
    tier: 'otherworld',
    world: 'Targa Plateau',
    spawn: '1 Guardian and 1 Threat Card',
    effects: [],
  },

  // Derelict Ship ─────────────────────────────────────────────────────────────
  {
    id: '1_gastral_tyrant_derelict_ship',
    name: '1 Gastral Tyrant',
    tier: 'otherworld',
    world: 'Derelict Ship',
    spawn: '1 Gastral Tyrant',
    effects: [],
  },

  // Belly of the Beast ────────────────────────────────────────────────────────
  {
    id: '1_bile_giant_belly_of_the_beast',
    name: '1 Bile Giant',
    tier: 'otherworld',
    world: 'Belly of the Beast',
    spawn: '1 Bile Giant',
    effects: [
      'A Bile Giant is a Magma Giant with the following: -1 Combat, +1 Damage, -1 Defense.',
      'Replaces Keyword Cynder with Belly of the Beast.',
      'All references to Burning markers are changed to Bleeding markers instead.',
      'Elite Chart result 1-2) is replaced with:',
      '1-2) Spews Bile — At the start of this Enemy\'s Activation, makes a free Ranged Attack at a Random Hero using: Range 4, Shots 2, Damage {P}.',
    ],
  },
  {
    id: '1_bile_giant_belly_of_the_beast_2',
    name: '1 Bile Giant',
    tier: 'otherworld',
    world: 'Belly of the Beast',
    spawn: '1 Bile Giant',
    effects: [
      'A Bile Giant is a Magma Giant with the following: -1 Combat, +1 Damage, -1 Defense.',
      'Replaces Keyword Cynder with Belly of the Beast.',
      'All references to Burning markers are changed to Bleeding markers instead.',
      'Elite Chart result 1-2) is replaced with:',
      '1-2) Spews Bile — At the start of this Enemy\'s Activation, makes a free Ranged Attack at a Random Hero using: Range 4, Shots 2, Damage {P}.',
    ],
  },
];

// ── Combined flat list ───────────────────────────────────────────────────────

export const THREAT_CARDS = [...THREAT_CARDS_STANDARD, ...THREAT_CARDS_OTHERWORLD];

export default THREAT_CARDS;
