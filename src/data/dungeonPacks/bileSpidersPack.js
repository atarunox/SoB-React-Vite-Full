// Bile Spiders Extra Spawning Pack (ESP) — Belly of the Beast

export const BILE_SPIDERS_THREAT_CARDS = [
  {
    id: 'bile_spiders_egg_sacks',
    name: 'Bile Spiders and Egg Sacks',
    tier: 'low',
    spawn: 'Scaled by Hero count (see card)',
    heroScaling: [
      { heroes: '1–2', spawn: '{P}+3 Bile Spiders and 2 Egg Sacks' },
      { heroes: '3–4', spawn: '{P}+6 Bile Spiders and D3+1 Egg Sacks' },
      { heroes: '5–6', spawn: '{P}+9 Bile Spiders and D3+3 Egg Sacks' },
    ],
    effects: [],
  },
];

export const BILE_SPIDERS_ENCOUNTERS = [
  {
    id: 'webbed_egg_sacks_belly',
    name: 'Webbed Egg Sacks',
    tags: ['Belly of the Beast', 'Encounter', 'Environment', 'Attack'],
    world: 'Belly of the Beast',
    flavor: 'The walls and floor are dotted with large, leathery egg sacks, covered in sticky webs. As you lean in close for a better look, the surface of the closest sack starts to deform and stretch; something is churning inside.',
    test: { stat: 'Cunning', target: '6+' },
    effects: [
      'Success: Gain 25 XP as you carefully step between the pulsing Egg Sacks.',
      'Fail: Gain D3−1 Webbed markers as several of the egg sacks peel open with long spidery legs stretching out from within.',
      'Then... If half or more of the Heroes failed this test, Attack! — {P}{P} Bile Spiders and 2 Egg Sacks.',
    ],
  },
];

export const BILE_SPIDERS_PACK = {
  id: 'bileSpiders',
  name: 'Bile Spiders ESP',
  world: 'Belly of the Beast',
  description: 'Extra Spawning Pack — adds Bile Spider and Egg Sack threat cards to the Belly of the Beast threat deck. Spawn counts scale with Hero count.',
  threatCards: BILE_SPIDERS_THREAT_CARDS,
  encounters: BILE_SPIDERS_ENCOUNTERS,
};

export default BILE_SPIDERS_PACK;
