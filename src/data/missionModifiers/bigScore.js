// src/data/missionModifiers/bigScore.js
// "The Next Big Score" adventure modifier (Promo 1122 + 1131–1135).
// Requires at least one Outlaw or Performer Hero in the party.
// Activated in Town before the Adventure starts.

// ── Eligibility ────────────────────────────────────────────────────────────────
export const BIG_SCORE_ELIGIBILITY = {
  requiredKeywords: ['Outlaw', 'Performer'],
  note: 'At least one Hero in the party must have the Outlaw or Performer keyword.',
};

// ── Core Rules ─────────────────────────────────────────────────────────────────
export const BIG_SCORE_RULES = {
  bigScoreEncounters:
    'Whenever the Heroes draw one or more Encounters, also draw one Big Score Encounter.',
  bigScoreRoles:
    'At the start of the Adventure draw a number of Big Score Role cards equal to the number of Heroes +1. In Initiative order (highest to lowest — roll off if tied), each Hero must choose one of those Roles. Discard the last Role not chosen.',
  scoreTokens:
    'At the end of the Adventure, Heroes may spend Score Tokens they have collected to draw 1 extra Loot card for each (reshuffle the Loot deck for each Hero).',
};

// ── Complications Chart (roll D6 when a Clue is found, re-roll if already active) ──
export const BIG_SCORE_COMPLICATIONS = [
  {
    roll: 1,
    name: 'Recognized',
    effect: 'Draw a Threat and add it as an Ambush Attack to this Room.',
  },
  {
    roll: 2,
    name: '"They Moved the Loot!"',
    effect: 'Each Hero loses 1 Score Token. May trigger more than once.',
  },
  {
    roll: 3,
    name: 'High Alert',
    effect: 'All Enemies now gain a free Elite Ability.',
  },
  {
    roll: 4,
    name: 'Hidden Traps',
    effect:
      'From now on, whenever a Hero rolls a 6+ for Movement, they trigger a Hidden Trap! Before moving, a Dynamite explodes in the Hero\'s space (D6 Damage, ignoring Defense, to models in the same and adjacent spaces).',
  },
  {
    roll: 5,
    name: 'Uninvited Guests',
    effect: 'All Heroes now roll one less die on all Skill Tests (minimum 1).',
  },
  {
    roll: 6,
    name: 'Extra Guards',
    effect: 'All Threat cards are now one Threat Level higher than normal.',
  },
];

// ── Big Score Encounter Cards ──────────────────────────────────────────────────
export const BIG_SCORE_ENCOUNTERS = [
  {
    id: 'patrolling_sentry',
    name: 'Patrolling Sentry',
    promoId: 'Promo-1131',
    type: 'Encounter',
    tags: ['Active', 'Outlaw', 'Heist', 'Attack'],
    flavor:
      '"Quiet, someone\'s coming!" You hug the wall, keeping to the shadows, and hold your breath as a sentry guard walks into the room, looking around suspiciously.',
    test: { stat: 'Luck', target: '6+' },
    success:
      'Gain 30 XP as you remain undetected and the Sentry moves on.',
    fail:
      '"You\'re not supposed to be in here!" Make a Cunning 5+ test to talk your way out.',
    failFollowUp: {
      test: { stat: 'Cunning', target: '5+' },
      success:
        'Move the Darkness 1 space forward as the Sentry screams before you silence him. With at least 2 successes, instead gain 50 XP and 1 Score Token.',
      fail:
        'Move the Darkness 3 spaces forward on the Depth Track as the Sentry escapes to warn the others.',
    },
  },
  {
    id: 'reinforced_gate',
    name: 'Reinforced Gate',
    promoId: 'Promo-1132',
    type: 'Encounter',
    tags: ['Active', 'Outlaw', 'Heist'],
    flavor:
      "A locked gate blocks your path forward. This wasn't supposed to be here. They must have increased their security around here to keep out intruders. If this changed, what else may be different?",
    test: { stat: 'Strength', target: '5+' },
    success:
      'Gain 25 XP then put a Sanity marker here for each 5+ rolled.',
    fail:
      'Move the Darkness marker forward 1 space on the Depth Track as you make a lot of noise trying to get through.',
    afterAll:
      'After all Heroes have made this test, if there are fewer Sanity markers here than the number of Heroes, add a Growing Dread card to the Stack.',
  },
  {
    id: 'sleeping_guard',
    name: 'Sleeping Guard',
    promoId: 'Promo-1133',
    type: 'Encounter',
    tags: ['Active', 'Outlaw', 'Heist', 'Stranger'],
    flavor:
      'Turning the corner, you skid to a halt. Across the room is a large, scruffy-looking ruffian, asleep in a chair. Clearly he is supposed to be on guard duty. Best not wake him as there are likely others nearby.',
    test: { stat: 'Agility', target: '5+' },
    success: 'Gain 15 XP as you sneak past.',
    failGroup:
      'If half or more of the Heroes failed this test, the guard wakes and sounds the alarm! Draw a Threat. Any Hero that failed this test is −1 Defense during the first Turn of the Fight.',
  },
  {
    id: 'inside_job',
    name: 'Inside Job',
    promoId: 'Promo-1134',
    type: 'Encounter',
    tags: ['Active', 'Outlaw', 'Heist', 'Stranger'],
    flavor:
      'Stepping out of the shadows, a rough-looking outlaw brandishes his shotgun. "It\'s about time you showed up. I expect to be well-paid for my…cooperation." It would seem that the tip of having someone on the inside has paid off, if you\'re willing to pay up.',
    choices: [
      {
        label: 'Pay Up',
        effect:
          'The Heroes must collectively discard 2 Score Tokens (or 3 Score Tokens if 4 or more Heroes). During this Adventure, the Heroes may now cancel a single result rolled on the Complications chart when finding a Clue.',
      },
      {
        label: '"Have it Your Way"',
        effect: 'Move the Darkness marker D3+1 spaces forward on the Depth Track.',
      },
    ],
  },
  {
    id: 'tripwire',
    name: 'Tripwire',
    promoId: 'Promo-1135',
    type: 'Encounter',
    tags: ['Active', 'Outlaw', 'Heist', 'Trap'],
    flavor:
      'You stop dead in your tracks as you feel a sharp tug against your leading leg. Looking down, you see a long wire stretched across the passage at shin height …a trip wire! Before you can say anything, you turn to see your companions walking right into the same trap!',
    test: { stat: 'Cunning', target: '6+' },
    success: 'Gain 25 XP as you spot the wire and avoid the trap.',
    fail:
      'D3 Dynamite Tokens immediately Bounce twice each, starting in your space (D6 Damage, ignoring Defense, to any models in/adjacent to the final spaces they land in).',
  },
];

export const BIG_SCORE_ROLES = [
  {
    id: 'the_lookout',
    name: 'The Lookout',
    promoId: 'Promo-1123',
    effect: 'At the start of an Attack, use 1 Grit to give all Heroes +2 Initiative until the end of the Turn and gain 1 Score Token (or 2 Score Tokens if an Ambush Attack).',
  },
  {
    id: 'smooth_talker',
    name: 'Smooth Talker',
    promoId: 'Promo-1124',
    effect: 'Whenever a Random Hero would need to be selected for a Skill test, you may choose to take that test yourself instead. Once per Turn, when you pass a Skill Test on an Encounter, gain 1 Score Token.',
  },
  {
    id: 'brawler',
    name: 'Brawler',
    promoId: 'Promo-1125',
    effect: 'Once per Turn, when you kill an Enemy with a Melee Attack, gain 1 Score Token.',
  },
  {
    id: 'distraction',
    name: 'Distraction',
    promoId: 'Promo-1126',
    effect: "Once per Fight, at the start of an Enemy Group's Activation, use 1 Grit to cause all of those Enemies to only target you this Turn. Those Enemies may move through other models and are +3 Move this Turn. Gain 1 Score Token for each of those Enemies that makes an Attack against you this Turn (up to 3 Score).",
  },
  {
    id: 'sabotage',
    name: 'Sabotage',
    promoId: 'Promo-1127',
    effect: 'Once per Turn, when a card is about to be drawn from a Deck, use 1 Grit to draw 2 cards and choose which to use. As long as the 2 cards do not have the same card title, gain 1 Score Token. If the 2 cards do have the same card title, move the Darkness D3 spaces forward on the Depth Track.',
  },
  {
    id: 'triggerman',
    name: 'Triggerman',
    promoId: 'Promo-1128',
    effect: 'Once per Turn, when you kill an Enemy with a Ranged Attack, gain 1 Score Token.',
  },
  {
    id: 'the_getaway',
    name: 'The Getaway',
    promoId: 'Promo-1129',
    effect: 'Once per Fight, use 1 Grit to gain 1 Score Token and let all Heroes on your Map Tile automatically pass Escape tests until the end of the Turn. Once per Adventure, you may Re-roll a Complication to gain 1 Score Token.',
  },
  {
    id: 'the_brains',
    name: 'The Brains',
    promoId: 'Promo-1130',
    effect: 'At the start of each Turn, roll a D6. On the roll of 5+ you may choose a Hero to Recover a Grit. Whenever a Clue is found, gain D3 Score Tokens.',
  },
];

export const BIG_SCORE_MODIFIER = {
  id: 'big_score',
  name: 'The Next Big Score',
  promoId: 'Promo-1122',
  eligibility: BIG_SCORE_ELIGIBILITY,
  rules: BIG_SCORE_RULES,
  complications: BIG_SCORE_COMPLICATIONS,
  encounters: BIG_SCORE_ENCOUNTERS,
  roles: BIG_SCORE_ROLES,
};

export default BIG_SCORE_MODIFIER;
