// Crab Spiders Extra Spawning Pack (ESP) — Sunken City of Pharrox

export const CRAB_SPIDERS_THREAT_CARDS = [
  {
    id: 'crab_spiders',
    name: 'Crab Spiders',
    tier: 'low',
    spawn: 'Scaled by Hero count (see card)',
    heroScaling: [
      { heroes: '1–2', spawn: '{P} Crab Spiders' },
      { heroes: '3–4', spawn: '6 Crab Spiders' },
      { heroes: '5–6', spawn: '{P}{P} Crab Spiders' },
    ],
    effects: [
      'A Crab Spider is a Void Spider with the following:',
      'Deep Sea Exoskeleton — Armor 4+.',
      'XP: +5',
    ],
  },
  {
    id: 'crab_spiders_egg_sacks',
    name: 'Crab Spiders and Egg Sacks',
    tier: 'low',
    spawn: 'Scaled by Hero count (see card)',
    heroScaling: [
      { heroes: '1–2', spawn: '{P}{P} Crab Spiders and 2 Egg Sacks' },
      { heroes: '3–4', spawn: '{P}{P}{P} Crab Spiders and D3+1 Egg Sacks' },
      { heroes: '5–6', spawn: '{P}{P}{P}{P} Crab Spiders and D3+3 Egg Sacks' },
    ],
    effects: [],
  },
];

export const CRAB_SPIDERS_ENCOUNTERS = [
  {
    id: 'webbed_egg_sacks_pharrox',
    name: 'Webbed Egg Sacks',
    tags: ['Pharrox', 'Encounter', 'Environment', 'Attack'],
    world: 'Sunken City of Pharrox',
    flavor: 'The walls and floor are dotted with large, leathery egg sacks, covered in sticky webs. As you lean in close for a better look, the surface of the closest sack starts to deform and stretch; something is churning inside.',
    test: { stat: 'Cunning', target: '6+' },
    effects: [
      'Success: Gain 25 XP as you carefully step between the pulsing Egg Sacks.',
      'Fail: Gain D3−1 Webbed markers as several of the egg sacks peel open with long spidery legs stretching out from within.',
      'Then... If half or more of the Heroes failed this test, Attack! — {P}{P} Crab Spiders and 2 Egg Sacks.',
    ],
  },
];

export const CRAB_SPIDERS_PACK = {
  id: 'crabSpiders',
  name: 'Crab Spiders ESP',
  world: 'Sunken City of Pharrox',
  description: 'Extra Spawning Pack — adds Crab Spider threat cards to the Pharrox threat deck. Crab Spiders are Void Spiders with Deep Sea Exoskeleton (Armor 4+).',
  threatCards: CRAB_SPIDERS_THREAT_CARDS,
  encounters: CRAB_SPIDERS_ENCOUNTERS,
};

export default CRAB_SPIDERS_PACK;
