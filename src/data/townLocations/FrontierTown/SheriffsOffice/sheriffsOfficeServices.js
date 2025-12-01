// Sheriff’s Office — Services

export default [
  {
    id: 'so_sheriffs_bounty',
    name: "Sheriff's Bounty",
    type: 'Service',
    cost: 0,
    tags: ['Service', 'Bounty'],
    limit: 'oncePerStay',
    rules: {
      text: [
        'Draw a **Low Threat** card; that is the bounty target.',
        'Until the end of the **next Adventure**, the printed XP on that Enemy converts to **gold** when it is killed (see Outcome for value rule).',
      ],
    },
  },
  {
    id: 'so_pay_off_warrants',
    name: 'Pay Off Your Warrants',
    type: 'Service',
    cost: { gold: 0 }, // computed at runtime
    tags: ['Service', 'Legal'],
    limit: 'oncePerStay',
    rules: {
      text: [
        // verbatim policy the user requested
        'Cost: **$500 × Hero Level**. If **Most Wanted**, the cost is **$750 × Hero Level**.',
        'Pay to remove your Wanted status.',
      ],
    },
  },
  {
    id: 'so_interrogate_prisoner',
    name: 'Interrogate Prisoner',
    type: 'Service',
    cost: { gold: 50 },
    tags: ['Service', 'Investigation'],
    limit: 'oncePerStay',
    rules: {
      text: [
        'Choose **Strength** or **Cunning** and roll that many **D6**.',
        'Each **6** grants a re-draw/cancel next Adventure; each **1** will advance Darkness by 1 (logged).',
      ],
    },
  },
  {
    id: 'so_become_deputized',
    name: 'Become Deputized',
    type: 'Service',
    cost: { xp: 50 },
    tags: ['Service', 'LawOnlyGated', 'Badge'],
    limit: 'oncePerStay',
    rules: {
      text: [
        'Spend **50 XP** to gain the **Law** keyword and a temporary **+1 Cunning**.',
      ],
    },
  },
  {
    id: 'so_join_manhunt',
    name: 'Join a Manhunt',
    type: 'Service',
    cost: 0,
    tags: ['Service', 'LawOnly', 'EndsVisit'],
    limit: 'oncePerStay',
    endsVisit: true,
    rules: {
      text: [
        'Make a **Cunning 5+** test (dice = Cunning).',
        'Gain XP for successes; on any **6**, also gain some $ (see Outcome).',
        'Ends your location visit.',
      ],
    },
  },
  {
    id: 'so_escort_prisoner',
    name: 'Escort Prisoner Transfer',
    type: 'Service',
    cost: 0,
    tags: ['Service', 'LawOnly', 'EndsVisit'],
    limit: 'oncePerStay',
    endsVisit: true,
    rules: {
      text: [
        'Make a **Lore 5+** test (dice = Lore).',
        'On success, you will be prompted for your payout (**D8 × $25**).',
        'For **each 1** rolled, you will be prompted to roll a **Travel Hazard** (DM resolves).',
        'Ends your location visit.',
      ],
    },
  },
];
