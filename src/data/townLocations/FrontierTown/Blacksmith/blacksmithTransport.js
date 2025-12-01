// src/data/townLocations/blacksmithTransport.js
export default [
  {
    id: 'bs_fast_horse',
    name: 'Fast Horse',
    type: 'gear',
    slot: 'Transport',
    cost: { gold: 600 },
    weight: 0,
    tags: ['Animal', 'Transport'],
    limit: 'One Transport per hero',
    effects: [
      'Gain 10XP each time you Travel.',
      '+2 Agility while Traveling.',
    ],
    transport: { type: 'Horse' },
    rules: { text: ['Limit: one Transport per hero.'] },
  },

  {
    id: 'bs_cavalry_horse',
    name: 'Cavalry Horse',
    type: 'gear',
    slot: 'Transport',
    cost: { gold: 600 },
    weight: 0,
    tags: ['Animal', 'Transport'],
    limit: 'One Transport per hero',
    effects: [
      'Gain 10XP each time you Travel.',
      '+2 Strength while Traveling.',
    ],
    transport: { type: 'Horse' },
  },

  {
    id: 'bs_work_horse',
    name: 'Work Horse',
    type: 'gear',
    slot: 'Transport',
    cost: { gold: 600 },
    weight: 0,
    tags: ['Animal', 'Transport'],
    limit: 'One Transport per hero',
    effects: [
      'Gain 10XP each time you Travel.',
      '+2 Spirit while Traveling.',
    ],
    transport: { type: 'Horse' },
  },

  {
    id: 'bs_spitfire_horse',
    name: 'Spitfire Horse',
    type: 'gear',
    slot: 'Transport',
    cost: { gold: 800 },
    weight: 0,
    tags: ['Animal', 'Transport'],
    restrictions: ['Performer', 'Showman'],
    limit: 'One Transport per hero',
    effects: [
      'Gain 10XP each time you Travel.',
      'Roll one extra die on all Skill tests while Traveling.',
    ],
    transport: { type: 'Horse' },
  },

  {
    id: 'bs_mustang',
    name: 'Mustang',
    type: 'gear',
    slot: 'Transport',
    cost: { gold: 1200 },
    weight: 0,
    tags: ['Animal', 'Transport'],
    limit: 'One Transport per hero',
    effects: [
      'Gain 10XP each time you Travel.',
      '+1 Grit while Traveling / in Town.',
    ],
    transport: { type: 'Horse' },
  },

  {
    id: 'bs_stage_coach',
    name: 'Stage Coach',
    type: 'gear',
    slot: 'Transport',
    cost: { gold: 3200 },
    weight: 0,
    tags: ['Cart', 'Transport'],
    limitPerPosse: 1,
    effects: [
      'Can carry up to 6 Heroes.',
      'Each Hero gains 15XP when the Posse Travels.',
      'Once per Travel: cancel a result on the Hazard Chart before resolving it.',
    ],
    transport: { type: 'Stage Coach', capacity: 6, posseWide: true },
    rules: {
      text: [
        'Limit: one Stage Coach per posse.',
        'Stored in purchasing hero’s Inventory.',
      ],
    },
  },
];
