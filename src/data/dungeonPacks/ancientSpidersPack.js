// Ancient Spiders Extra Spawning Pack (ESP) — Targa Plateau

export const ANCIENT_SPIDERS_THREAT_CARDS = [
  {
    id: 'ancient_spiders_egg_sacks',
    name: 'Ancient Spiders and Egg Sacks',
    tier: 'low',
    spawn: 'Scaled by Hero count (see card)',
    heroScaling: [
      { heroes: '1–2', spawn: '{P}{P} Ancient Spiders and 1 Egg Sack' },
      { heroes: '3–4', spawn: '{P}{P}{P} Ancient Spiders and D3 Egg Sacks' },
      { heroes: '5–6', spawn: '{P}{P}{P}{P} Ancient Spiders and D3+2 Egg Sacks' },
    ],
    effects: [],
  },
];

export const ANCIENT_SPIDERS_ENCOUNTERS = [
  {
    id: 'webbed_egg_sacks_targa',
    name: 'Webbed Egg Sacks',
    tags: ['Targa', 'Encounter', 'Environment', 'Attack'],
    world: 'Targa Plateau',
    flavor: 'The walls and floor are dotted with large, leathery egg sacks, covered in sticky webs. As you lean in close for a better look, the surface of the closest sack starts to deform and stretch; something is churning inside.',
    test: { stat: 'Cunning', target: '6+' },
    effects: [
      'Success: Gain 25 XP as you carefully step between the pulsing Egg Sacks.',
      'Fail: Gain D3−1 Webbed markers as several of the egg sacks peel open with long spidery legs stretching out from within.',
      'Then... If half or more of the Heroes failed this test, Attack! — {P}{P} Ancient Spiders and 2 Egg Sacks.',
    ],
  },
];

export const ANCIENT_SPIDERS_PACK = {
  id: 'ancientSpiders',
  name: 'Ancient Spiders ESP',
  world: 'Targa Plateau',
  description: 'Extra Spawning Pack — adds Ancient Spider and Egg Sack threat cards to the Targa Plateau threat deck. Spawn counts scale with Hero count.',
  threatCards: ANCIENT_SPIDERS_THREAT_CARDS,
  encounters: ANCIENT_SPIDERS_ENCOUNTERS,
};

export default ANCIENT_SPIDERS_PACK;
