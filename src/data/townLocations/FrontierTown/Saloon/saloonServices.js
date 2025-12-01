// src/data/townLocations/saloonServices.js
// DATA FILE consumed by tabsByShop.js (expects a default array export).
// Saloon services are split into two logical tabs via tags:
//  - 'Entertainment' → Entertainment tab
//  - 'SaloonGirlOnly'/'Troupe' → Saloon Girl Troupe tab
import { performSaloonService, performSaloonServiceObj } from '../../../../utils/locationHandlers/saloonServices.js';

export default [
  // ---------------- Entertainment / Gambling (limit once per visit) ----------------
  {
    id: 'saloon_casual_poker',
    name: 'Casual Poker',
    type: 'Service',
    cost: { gold: 50 },
    tags: ['Entertainment', 'Gambling'],
    limit: 'oncePerVisit',
    rules: {
      text: [
        'Make a Cunning 5+ test (roll a number of dice equal to your Cunning).',
        'Gain $50 for every 5+ rolled. On failure, you leave with nothing.',
      ],
    },
  },
  {
    id: 'saloon_brimstone_craps',
    name: 'Brimstone Craps',
    type: 'Service',
    cost: { gold: 100 },
    tags: ['Entertainment', 'Gambling'],
    limit: 'oncePerVisit',
    rules: {
      text: [
        'Make a Luck 5+ test (roll a number of dice equal to your Luck).',
        'Gain $100 for every 5+ rolled. On failure, you leave with nothing.',
      ],
    },
  },
  {
    id: 'saloon_girl_performance',
    name: 'Saloon Girl Performance',
    type: 'Service',
    cost: { gold: 50 },
    tags: ['Entertainment'],
    limit: 'oncePerVisit',
    rules: {
      text: [
        'Gain 10 XP and roll a D6.',
        'On a 4, 5, or 6, Recover 1 Grit for use in Town (up to your cap).',
      ],
    },
  },

  // ---------------- Saloon Girl Troupe (class-locked actions) ----------------
  {
    id: 'saloon_troupe_entertain',
    name: 'Entertain',
    type: 'Service',
    cost: { gold: 0 },
    tags: ['SaloonGirlOnly', 'Troupe'],
    limit: 'oncePerVisit',
    rules: {
      text: [
        'Choose Performance (Agility) or Storytelling (Lore).',
        'Roll a number of dice equal to that stat (shown in the prompt).',
        '4–5: +$25 each. 6: +$100 each. 1–3: no reward.',
      ],
    },
  },
  {
    id: 'saloon_troupe_pickpocket',
    name: 'Pickpocket',
    type: 'Service',
    cost: { gold: 0 },
    tags: ['SaloonGirlOnly', 'Troupe'],
    limit: 'oncePerVisit',
    rules: {
      text: [
        'Make an Agility test (roll dice equal to your Agility).',
        'For each 4 or 5: gain $10. If any die is a 6: draw one Gear card to your inventory.',
      ],
    },
  },
];

export { performSaloonService, performSaloonServiceObj };