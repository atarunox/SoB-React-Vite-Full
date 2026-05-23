// Void Spiders Extra Spawning Pack (ESP) — Spanish Fort
// Uses Void Spiders; adds only the Spanish Fort encounter.

export const SPANISH_SPIDERS_ENCOUNTERS = [
  {
    id: 'webbed_egg_sacks_spanish',
    name: 'Webbed Egg Sacks',
    tags: ['Spanish', 'Encounter', 'Environment', 'Attack'],
    world: 'Spanish Fort',
    flavor: 'The walls and floor are dotted with large, leathery egg sacks, covered in sticky webs. As you lean in close for a better look, the surface of the closest sack starts to deform and stretch; something is churning inside.',
    test: { stat: 'Cunning', target: '6+' },
    effects: [
      'Success: Gain 25 XP as you carefully step between the pulsing Egg Sacks.',
      'Fail: Gain D3−1 Webbed markers as several of the egg sacks peel open with long spidery legs stretching out from within.',
      'Then... If half or more of the Heroes failed this test, Attack! — {P}{P} Void Spiders and 2 Egg Sacks.',
    ],
  },
];

export const SPANISH_SPIDERS_PACK = {
  id: 'spanishSpiders',
  name: 'Void Spiders ESP (Spanish Fort)',
  world: 'Spanish Fort',
  description: 'Extra Spawning Pack — adds the Webbed Egg Sacks encounter to the Spanish Fort. Uses Void Spiders from the Mines ESP pack (no additional threat cards).',
  threatCards: [],
  encounters: SPANISH_SPIDERS_ENCOUNTERS,
};

export default SPANISH_SPIDERS_PACK;
