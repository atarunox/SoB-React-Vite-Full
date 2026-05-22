// src/data/missionModifiers/warrants.js
// "Warrants" adventure modifier (Promo 975–988, 980, 981–983, 992).
// Requires at least one Law Hero in the party.

export const WARRANTS_ELIGIBILITY = {
  requiredKeywords: ['Law'],
  note: 'At least one Hero in the party must have the Law keyword.',
};

export const WARRANTS_RULES = {
  warrantEncounters:
    'Whenever the Heroes draw one or more Encounters, also draw one Warrants Encounter.',
  warrantCard:
    'Before the Adventure begins, draw 1 Warrant card. Its effects are active for the entire Adventure.',
  onTheRun:
    'The DM may apply the "On the Run" Enemy Trait to any Enemy group, granting them the Outlaw keyword, +1 Initiative, +2 Move, Cover 5+, and a Bounty reward when defeated.',
};

// ── Warrant Cards ─────────────────────────────────────────────────────────────
export const WARRANT_CARDS = [
  {
    id: 'stolen_goods',
    name: 'Stolen Goods',
    promoId: 'Promo-975',
    type: 'Warrant',
    tags: ['Law'],
    effects: [
      'Whenever a Clue is found, each Law Hero confiscates (gains) D3 starting Side Bag Tokens and may Recover a Grit.',
      'During this Adventure, whenever the Darkness marker crosses into a new Stage of the Depth Track, draw a Growing Dread card and add it to the stack.',
    ],
  },
  {
    id: 'for_questioning',
    name: 'For Questioning',
    promoId: 'Promo-976',
    type: 'Warrant',
    tags: ['Law'],
    effects: [
      'Whenever a Law Hero defeats an Enemy with a Combat Hit, they gain +10 XP and $25 as the enemy is arrested and bound up to take back for questioning or study.',
    ],
  },
  {
    id: 'search_and_seizure',
    name: 'Search and Seizure',
    promoId: 'Promo-977',
    type: 'Warrant',
    tags: ['Law'],
    effects: [
      'Whenever a Law Hero successfully Scavenges a Map Tile, also place a Sanity marker here.',
      'Once per Turn, a Law Hero may discard up to 3 markers here to gain +1 Combat each for an Attack.',
      'At the end of the Adventure, every Law Hero gains $50 for each marker still here.',
      'During this Adventure, whenever the Darkness marker crosses into a new Stage of the Depth Track, draw a Darkness card.',
    ],
    tracksMarkers: true,
  },
  {
    id: 'dead_or_alive',
    name: 'Dead or Alive',
    promoId: 'Promo-978',
    type: 'Warrant',
    tags: ['Law'],
    effects: [
      'All Attacks by and against Law Heroes are +1 Damage.',
      'At the end of any Fight, every Law Hero that is not KO\'d may draw an extra Loot card.',
    ],
  },
  {
    id: 'wanted_in_3_worlds',
    name: 'Wanted in 3 Worlds',
    promoId: 'Promo-979',
    type: 'Warrant',
    tags: ['Law'],
    effects: [
      'Draw an Epic Threat (or a High Threat for 1-2 Heroes). One Enemy on that card with the highest Health (or any Legendary Enemy if there is one) becomes the Warrant Target. That Enemy gains Legendary and is +3 Damage on its Attacks.',
      'Also draw a Mine Artifact and another Artifact from 2 different Random Worlds. The Enemy gets +2 Health for every $100 of the combined Gold value of these 3 Artifacts (rounding up).',
      'When defeated, the Warrant Target is worth a Bounty of Peril Die {P} × $100 to each Hero. The 3 Artifacts may be distributed between the Heroes by whichever Hero landed the killing blow (no single Hero may take more than one of the Artifacts).',
      'The first time an Epic Threat would be drawn during this Adventure, use this Epic Threat card instead of drawing (or High Threat if 1-2 Heroes).',
    ],
    tracksTarget: true,
  },
];

// ── Warrant Encounters ────────────────────────────────────────────────────────
export const WARRANTS_ENCOUNTERS = [
  {
    id: 'taunting_message',
    name: 'Taunting Message',
    promoId: 'Promo-984',
    type: 'Encounter',
    tags: ['Active', 'Outlaw'],
    test: { stat: 'Spirit', target: '6+' },
    effects: [
      'Each Law Hero makes a Spirit 6+ test. Success: Recover Grit to Max. Fail: advance the Darkness marker 1 space.',
      'If there are no Law Heroes in the party, advance the Darkness marker D3 spaces instead.',
    ],
  },
  {
    id: 'rigged_trap',
    name: 'Rigged Trap',
    promoId: 'Promo-986',
    type: 'Encounter',
    tags: ['Active', 'Trap', 'Outlaw'],
    test: { stat: 'Cunning', target: '6+' },
    effects: [
      'Each Hero makes a Cunning 6+ test (roll 2 extra dice if you have the Law or Tribal keyword).',
      'Success: Gain 30 XP.',
      'Fail: All Heroes take D6+2 Wounds ignoring Defense.',
    ],
  },
  {
    id: 'doubled_back',
    name: 'Doubled Back',
    promoId: 'Promo-987',
    type: 'Encounter',
    tags: ['Active', 'Outlaw'],
    effects: [
      'A number of Bandits equal to 2× the number of Heroes appear for a Shootout.',
      'Each Hero makes a Ranged Attack against the Bandits. Each Hit eliminates 1 Bandit (gain 10 XP per Bandit). Explosives eliminate D6 or D3 Bandits.',
      'If all Bandits are eliminated: each Hero draws a Loot card.',
      'If any Bandits remain: each Hero takes 2D6 minus their Cunning stat in Wounds, ignoring Defense.',
    ],
  },
  {
    id: 'dying_bandit',
    name: 'Dying Bandit',
    promoId: 'Promo-988',
    type: 'Encounter',
    tags: ['Active', 'Stranger', 'Outlaw'],
    test: { stat: 'Cunning', target: '5+' },
    effects: [
      'Make a Cunning 5+ test.',
      'Success: Gain 20 XP. With 6+: this also counts as finding a Clue.',
    ],
  },
];

// ── New Gear ──────────────────────────────────────────────────────────────────
export const WARRANTS_GEAR = [
  {
    id: 'frontier_deputy_badge',
    name: 'Frontier Deputy Badge',
    promoId: 'Promo-981',
    type: 'Gear',
    tags: ['Law', 'Icon'],
    value: 450,
    slot: 'Extra 1',
    effects: [
      'You gain Keyword Law.',
      'Once per Adventure, Re-roll a Hold Back the Darkness roll, or cancel and Re-draw a Darkness card just drawn.',
      'Limit 1 Badge.',
    ],
  },
  {
    id: 'outlaw_shackles',
    name: 'Outlaw Shackles',
    promoId: 'Promo-992',
    type: 'Gear',
    tags: ['Law'],
    value: 325,
    slot: 'Hands',
    effects: [
      'Once per Fight, at the start of a Turn, choose an adjacent XL or smaller Enemy and make a Strength test based on the size of the Enemy — Small 5+, Medium 4+, Large 5+, XL 6+.',
      'If successful, that Enemy loses its Activation this turn.',
    ],
  },
  {
    id: 'long_arm_of_the_law',
    name: 'Long Arm of the Law',
    promoId: 'Promo-983',
    type: 'Gear',
    tags: ['Gun', 'Shotgun', 'Law'],
    value: 825,
    slot: 'Main Hand',
    range: 8,
    shots: 2,
    upgradeSlots: 0,
    restrictions: ['Law Only'],
    effects: [
      'Range 8, Shots 2.',
      'Uses the D8 To Hit and for Damage.',
      'Once per Turn when you kill an Enemy with this Shotgun, you gain +1 Shot.',
      'Law Only.',
    ],
  },
];

// ── On the Run — Enemy Trait ───────────────────────────────────────────────────
export const ON_THE_RUN_TRAIT = {
  id: 'on_the_run',
  name: 'On the Run',
  promoId: 'Promo-980',
  type: 'Enemy Trait',
  effects: [
    'This Trait can be applied to any Enemy. They gain Keyword Outlaw.',
    'Hard to Handle: +1 Initiative and +2 Move. Always has Cover 5+ (each Hit it would take is prevented on the D6 roll of 5+).',
    'Bounty: These Enemies are worth $25 when killed, or $100 to all Heroes if Large size or bigger.',
  ],
};

export const WARRANTS_MODIFIER = {
  id: 'warrants',
  name: 'Warrants',
  eligibility: WARRANTS_ELIGIBILITY,
  rules: WARRANTS_RULES,
  warrantCards: WARRANT_CARDS,
  encounters: WARRANTS_ENCOUNTERS,
  gear: WARRANTS_GEAR,
  onTheRunTrait: ON_THE_RUN_TRAIT,
};

export default WARRANTS_MODIFIER;
