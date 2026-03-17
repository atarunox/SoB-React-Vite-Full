// Law-only services/items shown under "Law and Order".
const sheriffsOfficeLawOnly = [
  {
    id: 'so_law_supplies',
    name: 'Law-Issued Supplies',
    type: 'Gear',
    slot: 'Misc',
    cost: { gold: 0 },
    tags: ['LawOnly', 'Gear'],
    effects: ['Once per Town stay, take 1 Bandages and 1 Whiskey token from the Sheriff.'],
  },
  {
    id: 'so_call_in_favor',
    type: 'Service',
    name: 'Call In a Favor',
    cost: { gold: 0 },
    tags: ['LawOnly', 'Service'],
    rules: {
      text: [
        'Make a Lore 4+ test.',
        'If successful, cancel one town event result for a hero at the Sheriff\'s Office this day.',
      ],
      requiresRollPrompt: true,
    },
  },
];

export default sheriffsOfficeLawOnly;
