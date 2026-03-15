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
    tags: ['Service', 'NotLawOrHoly'],
    limit: 'oncePerStay',
    rules: {
      text: [
        'Spend **50 XP** to gain **+1 Cunning** and the Keyword **Law**.',
        'At the end of each Adventure, roll a D6. On the roll of **1, 2, or 3**, you lose this bonus.',
        '_Not Available to Law or Holy Heroes._',
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
        'Make a **Cunning 5+** test. For each 5+ rolled, gain **20 XP**.',
        'If at least one **6** is rolled, you track down the Outlaw for a shootout! Roll **2D6** and subtract your **Initiative** for hits taken (4 Wounds each, or 8 if Hero Level 5+). Roll Defense as normal.',
        'Unless KO\'d, you capture the Outlaw: gain **25 XP** and **D6 × $100**.',
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
        'Make a **Lore 5+** test to follow the best roads.',
        'If successful, gain **D8 × $25** for a job well done.',
        'If failed, you are ambushed by the prisoner\'s gang! **Lose all Grit** you currently have and return to Town empty-handed.',
        'For **each 1** rolled as part of the Lore test, roll once on the **Travel Hazard Chart**.',
        'Ends your location visit.',
      ],
    },
  },
];
