// Street Market — Horses (Transport • Animal • Limit one Transport)
const streetMarketHorses = [
  {
    id: 'sm_horse_mutant',
    name: 'Mutant Horse',
    type: 'Transport',
    tags: ['Transport', 'Animal'],
    cost: { gold: 650 },
    effects: [
      'Gain 10XP each time you Travel.',
      'Use 1 Grit to add or subtract 1 from the roll for Type of Town found.',
    ],
  },
  {
    id: 'sm_horse_wild',
    name: 'Wild Horse',
    type: 'Transport',
    tags: ['Transport', 'Animal', 'Scout Only'],
    restrictions: ['Scout Only'],
    cost: { gold: 750 },
    effects: [
      'Gain 10XP each time you Travel.',
      'Once per Town Stay, cancel and re-draw a Daily Event card.',
    ],
  },
  {
    id: 'sm_horse_trederran_stallion',
    name: 'Trederran Stallion',
    type: 'Transport',
    tags: ['Transport', 'Animal'],
    cost: { gold: 800 },
    effects: ['Use 1 Grit to personally ignore the immediate effects of a Traveling Hazard.'],
  },
  {
    id: 'sm_horse_swamp_slug',
    name: 'Swamp Slug',
    type: 'Transport',
    tags: ['Transport', 'Animal', 'Traveler Only', 'Tribal Only'],
    restrictions: ['Traveler and Tribal Only'],
    cost: { gold: 1800 },
    effects: [
      'Gain 15XP each time you Travel.',
      'When rolling a Traveling Hazard, you may Re-roll one of the dice.',
    ],
  },
];

export default streetMarketHorses;
