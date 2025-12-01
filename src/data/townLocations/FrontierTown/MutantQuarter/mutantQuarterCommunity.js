// Community services for the Mutant Quarter (display + Perform)

const mutantQuarterCommunity = [
  {
    id: 'mq_mutant_surgeon',
    name: 'Mutant Surgeon',
    type: 'Service',
    cost: { gold: 50 },
    tags: ['Service', 'Medical'],
    limit: 'Limit Once per Visit',
    rules: {
      limitPerVisit: 1,
      ui: {
        action: 'chooseMutation',
        prompt: 'Choose one Mutation to attempt to remove.',
      },
      text: [
        'Choose one Mutation you want to remove and roll a D6 on the table:',
      ],
      resultTable: {
        '1–2 Butchered': 'Mutation NOT removed. Lose 1 Max Health permanently.',
        '3 Painful Success': 'Mutation removed. Lose 1 Max Sanity permanently.',
        '4 Success... Mostly': 'Mutation removed. Gain D3 Corruption Points (ignoring Willpower).',
        '5–6 Well Done!': 'Mutation removed cleanly.',
      },
    },
    effects: [
      'Pick a Mutation you have.',
      'Roll 1D6 and apply the result (see table).',
    ],
  },

  {
    id: 'mq_meet_revolutionaries',
    name: 'Meet With Mutant Revolutionaries',
    type: 'Service',
    cost: { note: 'Free' },
    tags: ['Service'],
    limit: 'Limit Once per Town Stay (party)',
    rules: {
      limitPerStay: 1,
      requiresTotalMutationsAmongVisitors: 3,
      text: [
        'Requires at least 3 total Mutations among the visiting Heroes.',
        'Gain two favors:',
        '• Cancel & re-draw one Daily Event this Town Stay.',
        '• Cancel the first Darkness card drawn in the next Adventure.',
      ],
    },
    effects: [
      'Adds two favor markers to your inventory.',
    ],
  },

  {
    id: 'mq_visit_prophet',
    name: 'Visit a Mutant Prophet',
    type: 'Service',
    tags: ['Service'],
    limit: 'Limit Once per Town Stay',
    cost: { roll: 'D6 × $10' },
    rules: {
      limitPerStay: 1,
      ui: {
        promptSpiritDice: true,
        confirmPay: true,
      },
      text: [
        'Cost: D6 × $10 (rolled at time of visit).',
        'Make a Spirit 5+ Test (roll a number of dice equal to your Spirit). If you pass:',
        ' • Gain 10XP for each 5+ rolled.',
        ' • Once during the next Adventure, you may Heal D6 Health/Sanity (split as desired).',
        'If you fail: Take D6 Horror Hits.',
      ],
    },
    effects: [
      'Roll 1D6 to determine the price and pay.',
      'Roll Spirit dice (5+ count as successes).',
      'Pass: +10XP per success & gain one-time D6 heal next Adventure.',
      'Fail: Take D6 Horror Hits.',
    ],
  },
];

export default mutantQuarterCommunity;
