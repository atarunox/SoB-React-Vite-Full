// Trench Spiders Extra Spawning Pack (ESP) — Trederra

export const TRENCH_SPIDERS_THREAT_CARDS = [
  {
    id: 'trench_spiders_egg_sacks',
    name: 'Trench Spiders and Egg Sacks',
    tier: 'low',
    spawn: 'Scaled by Hero count (see card)',
    heroScaling: [
      { heroes: '1–2', spawn: '{P}+3 Trench Spiders and 2 Egg Sacks' },
      { heroes: '3–4', spawn: '{P}+6 Trench Spiders and D3+1 Egg Sacks' },
      { heroes: '5–6', spawn: '{P}+9 Trench Spiders and D3+3 Egg Sacks' },
    ],
    effects: [],
  },
];

export const TRENCH_SPIDERS_ENCOUNTERS = [
  {
    id: 'webbed_egg_sacks_trederra',
    name: 'Webbed Egg Sacks',
    tags: ['Trederra', 'Encounter', 'Environment', 'Attack'],
    world: 'Trederra',
    flavor: 'The walls and floor are dotted with large, leathery egg sacks, covered in sticky webs. As you lean in close for a better look, the surface of the closest sack starts to deform and stretch; something is churning inside.',
    test: { stat: 'Cunning', target: '6+' },
    effects: [
      'Success: Gain 25 XP as you carefully step between the pulsing Egg Sacks.',
      'Fail: Gain D3−1 Webbed markers as several of the egg sacks peel open with long spidery legs stretching out from within.',
      'Then... If half or more of the Heroes failed this test, Attack! — {P}{P} Trench Spiders and 2 Egg Sacks.',
    ],
  },
];

export const TRENCH_SPIDERS_PACK = {
  id: 'trenchSpiders',
  name: 'Trench Spiders ESP',
  world: 'Trederra',
  description: 'Extra Spawning Pack — adds Trench Spider and Egg Sack threat cards to the Trederra threat deck. Spawn counts scale with Hero count.',
  threatCards: TRENCH_SPIDERS_THREAT_CARDS,
  encounters: TRENCH_SPIDERS_ENCOUNTERS,
};

export default TRENCH_SPIDERS_PACK;
