// Nightshade Spiders Extra Spawning Pack (ESP) — Forest of the Dead

export const NIGHTSHADE_SPIDERS_THREAT_CARDS = [
  {
    id: 'nightshade_spiders',
    name: 'Nightshade Spiders',
    tier: 'low',
    spawn: 'Scaled by Hero count (see card)',
    heroScaling: [
      { heroes: '1–2', spawn: '{P} Nightshade Spiders' },
      { heroes: '3–4', spawn: '6 Nightshade Spiders' },
      { heroes: '5–6', spawn: '{P}{P} Nightshade Spiders' },
    ],
    effects: [
      'A Nightshade Spider is a Void Spider with the following:',
      'Nightshade Toxin — Whenever a Hero rolls a 1 To Hit while adjacent to one or more Nightshade Spiders, they take D3 Wounds ignoring Defense and Armor.',
      'XP: +5',
    ],
  },
  {
    id: 'nightshade_spiders_egg_sacks',
    name: 'Nightshade Spiders and Egg Sacks',
    tier: 'low',
    spawn: 'Scaled by Hero count (see card)',
    heroScaling: [
      { heroes: '1–2', spawn: '{P}+3 Nightshade Spiders and 2 Egg Sacks' },
      { heroes: '3–4', spawn: '{P}+6 Nightshade Spiders and D3+1 Egg Sacks' },
      { heroes: '5–6', spawn: '{P}+9 Nightshade Spiders and D3+3 Egg Sacks' },
    ],
    effects: [],
  },
];

export const NIGHTSHADE_SPIDERS_ENCOUNTERS = [
  {
    id: 'webbed_egg_sacks_forest',
    name: 'Webbed Egg Sacks',
    tags: ['Forest of the Dead', 'Encounter', 'Environment', 'Attack'],
    world: 'OtherWorld: Forest of the Dead',
    flavor: 'The trees and ground are dotted with large, leathery egg sacks, covered in sticky webs. As you lean in close for a better look, the surface of the closest sack starts to deform and stretch; something is churning inside.',
    test: { stat: 'Cunning', target: '6+' },
    effects: [
      'Success: Gain 25 XP as you carefully step between the pulsing Egg Sacks.',
      'Fail: Gain D3−1 Webbed markers as several of the egg sacks peel open with long spidery legs stretching out from within.',
      'Then... If half or more of the Heroes failed this test, Attack! — {P}{P} Nightshade Spiders and 2 Egg Sacks.',
    ],
  },
];

export const NIGHTSHADE_SPIDERS_PACK = {
  id: 'nightshadeSpiders',
  name: 'Nightshade Spiders ESP',
  world: 'OtherWorld: Forest of the Dead',
  description: 'Extra Spawning Pack — adds Nightshade Spider threat cards to the Forest of the Dead threat deck. Nightshade Spiders are Void Spiders with Nightshade Toxin (Hero rolls of 1 To Hit cause D3 Wounds ignoring Defense and Armor).',
  threatCards: NIGHTSHADE_SPIDERS_THREAT_CARDS,
  encounters: NIGHTSHADE_SPIDERS_ENCOUNTERS,
};

export default NIGHTSHADE_SPIDERS_PACK;
