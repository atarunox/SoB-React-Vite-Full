// Void Spiders Extra Spawning Pack (ESP) — Mines
// Add these threat cards to the Mine threat deck when the pack is active.

export const VOID_SPIDERS_STATUS_EFFECTS = [
  {
    id: 'webbed_marker',
    name: 'Webbed Markers',
    type: 'Status Effect',
    effects: [
      'For each Webbed marker a model has, they are −1 Move (min. 0) and take +1 Damage from every Enemy Hit they take.',
      'At the start of the model\'s Activation, it may make a Strength 5+ test. For each 5+ rolled, remove 1 Webbed marker.',
      'Adjacent friendly models may give up an Attack to make a Strength 5+ test to help remove markers from this model.',
    ],
  },
  {
    id: 'void_venom_marker',
    name: 'Void Venom Markers',
    type: 'Status Effect',
    effects: [
      'The Hero is −1 on all of their To Hit rolls during their next Activation.',
      'Natural To Hit rolls of 6+ still count as Critical Hits.',
      'Discard all Void Venom Markers from a Hero at the end of their next Activation, at the end of the Adventure, or if KO\'d.',
    ],
  },
];

export const VOID_SPIDERS_THREAT_CARDS = [
  { id: 'void_spiders_pp',   name: 'Void Spiders',                    tier: 'low',  spawn: '{P}{P} Void Spiders',                        effects: [] },
  { id: 'void_spiders_ppp6', name: 'Void Spiders (+6)',               tier: 'low',  spawn: '{P}{P}{P}+6 Void Spiders',                   effects: [] },
  { id: 'void_spiders_pp12', name: 'Void Spiders (+12)',              tier: 'high', spawn: '{P}{P}+12 Void Spiders',                     effects: [] },
  { id: 'void_spiders_eggs2',  name: 'Void Spiders and 2 Egg Sacks',       tier: 'low',  spawn: '{P}{P} Void Spiders and 2 Egg Sacks',       effects: [] },
  { id: 'void_spiders_eggs_d3p1', name: 'Void Spiders and D3+1 Egg Sacks', tier: 'low',  spawn: '{P}{P}{P} Void Spiders and D3+1 Egg Sacks', effects: [] },
  { id: 'void_spiders_eggs_d3p3', name: 'Void Spiders and D3+3 Egg Sacks', tier: 'high', spawn: '{P}{P}{P}{P} Void Spiders and D3+3 Egg Sacks', effects: [] },
];

export const VOID_SPIDERS_ENCOUNTERS = [
  {
    id: 'webbed_egg_sacks_mines',
    name: 'Webbed Egg Sacks',
    tags: ['Encounter', 'Environment', 'Attack'],
    world: 'Mines',
    flavor: 'The walls and floor are dotted with large, leathery egg sacks, covered in sticky webs. As you lean in close for a better look, the surface of the closest sack starts to deform and stretch; something is churning inside.',
    test: { stat: 'Cunning', target: '6+' },
    effects: [
      'Success: Gain 25 XP as you carefully step between the pulsing Egg Sacks.',
      'Fail: Gain D3−1 Webbed markers as several of the egg sacks peel open with long spidery legs stretching out from within.',
      'Then... If half or more of the Heroes failed this test, Attack! — Void Spiders and 2 Egg Sacks.',
    ],
  },
];

export const VOID_SPIDERS_PACK = {
  id: 'voidSpiders',
  name: 'Void Spiders ESP',
  world: 'Mines',
  description: 'Extra Spawning Pack — adds Void Spider and Egg Sack threat cards to the Mine threat deck. Introduces Webbed and Void Venom status effects.',
  threatCards: VOID_SPIDERS_THREAT_CARDS,
  encounters: VOID_SPIDERS_ENCOUNTERS,
  statusEffects: VOID_SPIDERS_STATUS_EFFECTS,
};

export default VOID_SPIDERS_PACK;
