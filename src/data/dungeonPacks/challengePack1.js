// Challenge Pack #1
// Adds threat cards and an enemy trait card.
// Duplicates are intentional — they match the physical card count.

// ── Threat Cards ──────────────────────────────────────────────────────────────
export const CP1_THREAT_CARDS = [

  // LOW -----------------------------------------------------------------------
  {
    id: 'cp1_hell_swarm_low_1',
    name: 'Hell Swarm',
    tier: 'low',
    spawn: 'D3 Hell Vermin and {P} HellBats',
    effects: [],
  },
  {
    id: 'cp1_hell_swarm_low_2',
    name: 'Hell Swarm',
    tier: 'low',
    spawn: 'D3 Hell Vermin and {P} HellBats',
    effects: [],
  },
  {
    id: 'cp1_broken_pact_low',
    name: 'Broken Pact',
    tier: 'low',
    spawn: 'D3+1 Hellfire Succubi and {P} HellBats',
    effects: [],
  },
  {
    id: 'cp1_tide_of_vermin_low',
    name: 'Tide of Vermin',
    tier: 'low',
    spawn: '1 Hell Vermin, {P} Scourge Rats, and 1 Rats Nest',
    effects: [
      'Hell Nest — Any time the Rats Nest would spawn 3 or more Scourge Rats, it spawns 1 new Hell Vermin instead.',
    ],
  },
  {
    id: 'cp1_legions_of_the_damned_low',
    name: 'Legions of the Damned',
    tier: 'low',
    spawn: '1 Spectral Horde and {P} Hungry Dead',
    effects: [
      'Possessing Bodies — At the end of every turn, roll 2 dice for each Spectral Horde in play. For each roll of 5+, add 1 new Hungry Dead to an empty space adjacent to it.',
    ],
  },

  // MEDIUM --------------------------------------------------------------------
  {
    id: 'cp1_hell_swarm_medium_1',
    name: 'Hell Swarm',
    tier: 'medium',
    spawn: '3 Hell Vermin and 6 HellBats',
    effects: [],
  },
  {
    id: 'cp1_hell_swarm_medium_2',
    name: 'Hell Swarm',
    tier: 'medium',
    spawn: '3 Hell Vermin and 6 HellBats',
    effects: [],
  },
  {
    id: 'cp1_broken_pact_medium',
    name: 'Broken Pact',
    tier: 'medium',
    spawn: '{P} Hellfire Succubi and 6 HellBats',
    effects: [],
  },
  {
    id: 'cp1_tide_of_vermin_medium',
    name: 'Tide of Vermin',
    tier: 'medium',
    spawn: 'D3 Hell Vermin, 6 Scourge Rats, and 1 Rats Nest',
    effects: [
      'Hell Nest — Any time the Rats Nest would spawn 3 or more Scourge Rats, it spawns 1 new Hell Vermin instead.',
    ],
  },
  {
    id: 'cp1_legions_of_the_damned_medium',
    name: 'Legions of the Damned',
    tier: 'medium',
    spawn: 'D3 Spectral Horde and {P}{P} Hungry Dead',
    effects: [
      'Possessing Bodies — At the end of every turn, roll 2 dice for each Spectral Horde in play. For each roll of 5+, add 1 new Hungry Dead to an empty space adjacent to it.',
    ],
  },

  // HIGH ----------------------------------------------------------------------
  {
    id: 'cp1_hell_swarm_high_1',
    name: 'Hell Swarm',
    tier: 'high',
    spawn: '3 Hell Vermin and 6 HellBats',
    effects: [
      'From Hell — These Enemies have +3 Health each.',
    ],
  },
  {
    id: 'cp1_hell_swarm_high_2',
    name: 'Hell Swarm',
    tier: 'high',
    spawn: '3 Hell Vermin and 6 HellBats',
    effects: [
      'From Hell — These Enemies have +3 Health each.',
    ],
  },
  {
    id: 'cp1_legions_of_the_damned_high',
    name: 'Legions of the Damned',
    tier: 'high',
    spawn: '3 Spectral Horde and {P}+6 Hungry Dead',
    effects: [
      'Possessing Bodies — At the end of every turn, roll 2 dice for each Spectral Horde in play. For each roll of 5+, add 1 new Hungry Dead to an empty space adjacent to it.',
    ],
  },
  {
    id: 'cp1_broken_pact_high',
    name: 'Broken Pact',
    tier: 'high',
    spawn: '6 Hellfire Succubi and 6 HellBats',
    effects: [
      'Dark Bargain — At the start of each turn, every Hero takes D3 Corruption Hits and may Recover a Grit on the D6 roll of 5+.',
    ],
  },
  {
    id: 'cp1_tide_of_vermin_high',
    name: 'Tide of Vermin',
    tier: 'high',
    spawn: '3 Hell Vermin, {P}{P} Scourge Rats, and 1 Rats Nest',
    effects: [
      'Hell Nest — Any time the Rats Nest would spawn 3 or more Scourge Rats, it spawns 1 new Hell Vermin instead.',
    ],
  },
];

// ── Enemy Traits ──────────────────────────────────────────────────────────────
export const CP1_ENEMY_TRAITS = [
  {
    id: 'cp1_bound_by_darkness',
    name: 'Bound by Darkness',
    type: 'Enemy Trait',
    xpBonus: 5,
    effects: [
      'This Trait can be applied to any Enemy. They gain Keyword Unholy.',
      'Dark Power — +2 Initiative and +1 Combat/Shot.',
      'Tainted Blood — For each Wound a Hero does to this Enemy (after Defense, Armor, etc), it does 1 basic Hit back to them (these Hits are +1 Damage if the Enemy has any Elite abilities, and an extra +2 Damage if the Enemy is Brutal).',
    ],
  },
];

// ── Darkness Cards ────────────────────────────────────────────────────────────
export const CP1_DARKNESS_CARDS = [
  {
    id: 'cp1_soul_crush_1',
    name: 'Soul Crush',
    type: 'Darkness',
    remainsInPlay: false,
    effects: [
      'Each Hero takes a number of Hits equal to the current position of the Darkness marker on the Depth Track. These Hits do Damage equal to your Hero Level.',
    ],
  },
  {
    id: 'cp1_soul_crush_2',
    name: 'Soul Crush',
    type: 'Darkness',
    remainsInPlay: false,
    effects: [
      'Each Hero takes a number of Hits equal to the current position of the Darkness marker on the Depth Track. These Hits do Damage equal to your Hero Level.',
    ],
  },
  {
    id: 'cp1_in_the_grip_of_darkness',
    name: 'In the Grip of Darkness',
    type: 'Darkness',
    remainsInPlay: true,
    effects: [
      "When drawn, each Hero must Exhaust D3 items they have with a 'Once per...' ability.",
      'While in play, Exhausted items may not be Readied.',
    ],
  },
  {
    id: 'cp1_piercing_the_veil',
    name: 'Piercing the Veil',
    type: 'Darkness',
    remainsInPlay: true,
    effects: [
      'Heroes may not make Armor rolls.',
      'Each time a Hero is KO\'d, all Heroes are -2 Sanity until the end of the Adventure (to a minimum of 1).',
    ],
  },
];

export default {
  threatCards: CP1_THREAT_CARDS,
  darknessCards: CP1_DARKNESS_CARDS,
  enemyTraits: CP1_ENEMY_TRAITS,
};
