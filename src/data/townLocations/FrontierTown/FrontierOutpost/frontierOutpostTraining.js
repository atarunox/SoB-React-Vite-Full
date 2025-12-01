// Training & Bounties — services
export default [
  {
    id: 'fo_train_with_soldiers',
    kind: 'Service',
    name: 'Train with Soldiers',
    price: 500,
    tags: ['Training', 'Limit Once per Town Stay'],
    rules: {
      text: ['Training with the soldiers is a good way to hone your skills. **Gain D6×25 XP**.'],
      ui: { requiresRoll: 'D6' },
      grant: { xpPerDie: 25 },
    },
  },
  {
    id: 'fo_bounty_board',
    kind: 'Service',
    name: 'Bounty',
    price: 0,
    tags: ['Bounty', 'Limit Once per Town Stay (All Heroes)'],
    rules: {
      text: ['Roll a **D6** to see the current Bounty available at the Outpost.'],
      ui: { requiresRoll: 'D6' },
      table: [
        { roll: 1, result: 'No Bounty — no current Bounty available.' },
        { roll: 2, result: 'Tentacles — **$10** for each killed.' },
        { roll: 3, result: 'HellBats — **$25** for each killed.' },
        { roll: 4, result: 'Stranglers — **$50** for each killed.' },
        { roll: 5, result: 'Night Terrors — **$150 to every Hero** for each killed.' },
        { roll: 6, result: 'Slashers — **$200 to every Hero** for each killed.' },
      ],
    },
  },
];
