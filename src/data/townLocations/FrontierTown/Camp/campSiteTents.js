// src/data/townLocations/campSiteTents.js
// Consolidates campItems, campChurchTent, and campDocsTent

const campSiteTents = {
  // Shop Items (token purchases)
  items: [
    {
      id: 'camp_bandages_token',
      name: 'Bandages',
      type: 'Gear',
      tags: ['Bandages', 'Tokens'],
      cost: 50,
      effect: 'Gain 1 Bandages Token',
      grantsToken: { type: 'Bandages', amount: 1 },
      purchaseLimitPerVisit: 2,
    },
    {
      id: 'camp_whiskey_token',
      name: 'Whiskey',
      type: 'Gear',
      tags: ['Whiskey', 'Tokens'],
      cost: 50,
      effect: 'Gain 1 Whiskey Token',
      grantsToken: { type: 'Whiskey', amount: 1 },
      purchaseLimitPerVisit: 2,
    },
  ],

  // Services grouped by tent
  services: {
    churchTent: [
      {
        id: 'camp_exorcism',
        name: 'Exorcism',
        category: 'Service',
        cost: 250, // auto-deducted by TownTab Perform handler
        limit: 'One Exorcism attempt per Visit',
        tags: ['Service', 'Church', 'Purification'],
        effect:
          'Remove one Madness or Curse. If a Curse is chosen, –1 to the roll.',
        resultTable: {
          0: 'Dead! – Your Hero dies in the tent as a Demon rips you apart from within!',
          1: 'Tormented – Not healed, lose 1 Health permanently.',
          '2-3': 'Failed – Not healed.',
          '4-6': 'Success! – Madness/Curse is healed.',
        },
        rules: {
          removes: ['Madness', 'Curse'],
          rollDie: 'D6',
          curseRollModifier: -1,
          purchaseLimitPerVisit: 1,
        },
      },
    ],

    docsTent: [
      {
        id: 'camp_surgery',
        name: 'Surgery',
        category: 'Service',
        cost: 250, // auto-deducted by TownTab Perform handler
        limit: 'One Surgery attempt per Visit',
        tags: ['Service', 'Medical'],
        effect:
          'Remove one Injury, Mutation, or Parasite. Roll a D6 and apply result.',
        resultTable: {
          0: 'Dead!',
          1: 'Butchered – Not healed, lose 1 Health permanently.',
          '2-3': 'Failed – Not healed.',
          '4-6': 'Success! – Healed.',
        },
        rules: {
          removes: ['Injury', 'Mutation', 'Parasite'],
          rollDie: 'D6',
          purchaseLimitPerVisit: 1,
        },
      },
    ],
  },
};

export default campSiteTents;
