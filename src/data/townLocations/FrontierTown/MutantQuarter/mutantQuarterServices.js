// Services for the Mutant Quarter (NOT the event chart)
// Import this file from tabsByShop to render on the shop page.

const mutantQuarterServices = [
  {
    id: 'mq_mutant_surgeon',
    name: 'Mutant Surgeon',
    type: 'Service',
    // Shown on the card
    rules: {
      text: [
        'Choose one Injury or Mutation (not marked “Too Far Gone”).',
        'Roll 2D6 on the Surgeon’s Table below to determine the outcome.',
      ],
      // Keep the table open by default on the card
      showTableOpen: true,
    },
    // This is what TownTab will render as the “Result Table”
    resultTable: {
      '2':  'Surgery fails horribly. Take D6 Wounds and the condition becomes “Too Far Gone.”',
      '3':  'Complications. Take 3 Wounds; surgery fails.',
      '4':  'Complications. Take 2 Wounds; surgery fails.',
      '5':  'Setback. The operation fails this time.',
      '6':  'No change. Try again another time.',
      '7':  'Minor success. Reduce penalties of the chosen condition (if any) by 1.',
      '8':  'Success. Remove one chosen Injury/Mutation.',
      '9':  'Clean success. Remove one chosen Injury/Mutation and recover D3 Health.',
      '10': 'Excellent work. Remove the condition and gain 20 XP.',
      '11': 'Masterful. Remove the condition, recover to full Health/Sanity.',
      '12': 'Remarkable breakthrough. Remove the condition and gain a permanent +1 Max Health.',
    },
    tags: ['Service', 'Surgery'],
  },
  {
    id: 'mq_visit_prophet',
    name: 'Visit the Prophet',
    type: 'Service',
    rules: {
      text: [
        'Make a Spirit 5+ test (roll a number of dice equal to your Spirit; each 5+ is a success).',
        'On success, receive a cryptic boon (see handler outcome).',
        'On failure, nothing happens (or you may gain unsettling visions at GM discretion).',
      ],
    },
    tags: ['Service', 'Test', 'Spirit'],
  },
  {
    id: 'mq_meet_revolutionaries',
    name: 'Meet the Revolutionaries',
    type: 'Service',
    rules: {
      text: [
        'You make connections with the underground movement.',
        'Gain a one-use item to cancel a Town Daily Event this stay.',
        'Gain a one-use item to cancel the first Darkness card next Adventure.',
      ],
    },
    tags: ['Service', 'Revolutionaries', 'One-Use'],
  },
];

export default mutantQuarterServices;
