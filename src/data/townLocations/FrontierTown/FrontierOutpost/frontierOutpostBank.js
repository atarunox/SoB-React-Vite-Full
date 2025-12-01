// Outpost Bank — services
const bankServices = [
  {
    id: 'fo_bank_sell_dark_stone',
    kind: 'Service',
    name: 'Sell Dark Stone',
    price: 0,
    tags: ['Bank', 'Dark Stone'],
    rules: {
      text: [
        'You may sell Dark Stone shards at the Outpost Bank for **D6×$25** each.',
        'Roll for each shard individually as they vary in size, weight, and value.',
      ],
      ui: { requiresNumberInput: 'darkStoneCount' }, // prompt for # of shards
      payout: 'perShard:D6*25',
    },
  },
  {
    id: 'fo_bank_hold_up',
    kind: 'Service',
    name: 'Hold Up the Outpost Bank',
    price: 0,
    tags: ['Outlaw Only', 'Risky'],
    note: '(Limit Once per Town Stay)',
    rules: {
      text: [
        'Make an **Agility 5+** test to rob the Outpost Bank.',
        'If successful, gain **D6×$50** for each **5+** rolled.',
        'For each **1** rolled, take **D6 Damage** during the shootout.',
        'If failed, you are arrested and set to hang in the morning. Make a **Cunning 3+** test to escape (**gain 20 XP** and leave Town during this Town Stay).',
        'If failed, you are hung at dawn — **your Hero is killed**.',
      ],
      ui: { requiresRoll: 'Agility5+;thenCunning3+onFail' },
      limitOncePerStay: true,
    },
  },
];

export default bankServices;
