const docsOfficeInjections = [
  {
    id: 'inj_anti_venom',
    name: 'Anti-Venom Injection',
    description: 'Made from samples of Void Spider venom recovered from the mines.',
    cost: 10,
    type: 'Boost',
    slot: 'Injection',
    tags: ['Injection'],
    effect: 'Immune to Poison and Venom for next Adventure. Limit one Injection.'
  },
  {
    id: 'inj_void_vapor',
    name: 'Void Vapor Injection',
    description: 'A potent serum distilled from the hefty mucus often found near portals to Other Worlds.',
    cost: 500,
    type: 'Boost',
    slot: 'Injection',
    tags: ['Injection', 'Void'],
    effect: '+1 Max Grit, start Adventure with Max Grit. Gain 1 Corruption. Limit one Injection.'
  },
  {
    id: 'inj_sycorrath',
    name: 'Sycorrath Injection',
    description: "Extracted from the third sack of a Hellbat’s lower abdomen, this intense liquid speeds response time and heightens awareness. It can also, however, be powerfully addictive.",
    cost: 250,
    type: 'Boost',
    slot: 'Injection',
    tags: ['Injection'],
    effect: '+1 Initiative and +1 Move for next Adventure. Gain 1 Corruption. Following Adventure without taking a Sycorrath Injection: -1 Initiative as you suffer from withdrawals. Limit one Injection'
  },
  {
    id: 'inj_dark_stone',
    name: 'Dark Stone Injection',
    description: 'A vaccine of sorts, made from tiny particles of Dark Stone.',
    cost: 100,
    type: 'Boost',
    slot: 'Injection',
    tags: ['Injection', 'Dark Stone'],
    effect: 'Once per turn, Re-roll 1 failed Willpower roll to avoid Corruption. Limit one Injection.'
  }
];

export default docsOfficeInjections;
