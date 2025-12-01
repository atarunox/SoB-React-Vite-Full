export default {
  id: 'saloonEntertainment',
  name: 'Entertainment',
  type: 'Service',
  entries: [
    {
      id: 'casualPoker',
      name: 'Casual Poker',
      cost: 50,
      tags: ['Gambling'],
      effect: `Cunning 5+ → Gain $50 per 5+. Fail → lose $50.`,
      purchaseLimitPerVisit: 1,
      resultTable: {},   // marks as a service for Perform button
    },
    {
      id: 'brimstoneCraps',
      name: 'Brimstone Craps',
      cost: 100,
      tags: ['Gambling'],
      effect: `Luck 5+ → Gain $100 per 5+. Fail → lose $100.`,
      purchaseLimitPerVisit: 1,
      resultTable: {},
    },
    {
      id: 'saloonGirlPerformance',
      name: 'Saloon Girl Performance',
      cost: 50,
      tags: ['XP', 'Recovery'],
      effect: `Gain 10 XP & roll 1D6 — 4+ → Recover 1 Grit.`,
      purchaseLimitPerVisit: 1,
      resultTable: {},
    },
  ],
};
