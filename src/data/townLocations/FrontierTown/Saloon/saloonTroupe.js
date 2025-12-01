// src/data/townLocations/saloonTroupe.js
const saloonTroupe = {
  id: 'saloonTroupe',
  name: 'Saloon Girl Troupe (Saloon Girl Heroes Only)',
  type: 'service',
  items: [],
  services: [
    {
      id: 'troupe_entertain',
      name: 'Entertain',
      price: 0,
      tags: ['SaloonGirlOnly', 'LimitOncePerVisit'],
      rules: {
        text:
          'Choose Performance (Agility) or Storytelling (Lore). Roll a number of dice equal to that Skill. For each 4–5, gain $25; for each 6, gain $100. Rolls of 1–3 earn nothing.',
        limitPerVisit: 1,
      },
    },
    {
      id: 'troupe_pickpocket',
      name: 'Pickpocket',
      price: 0,
      tags: ['SaloonGirlOnly', 'LimitOncePerVisit'],
      rules: {
        text:
          'Take D3 Corruption Hits. Make an Agility 4+ test. For each 4 or 5, gain $10. For each 6, draw a Gear card.',
        limitPerVisit: 1,
      },
    },
    {
      id: 'troupe_perfume',
      name: 'Perfume (Boost & Appeal)',
      price: 200,
      tags: ['SaloonGirlOnly', 'LimitOne'],
      rules: {
        text:
          'During the next Adventure, gain +5 XP for every Wound/Sanity you Heal with your Comforting Presence. Limit one.',
        locationScopedCost: true,
      },
    },
  ],
};

export default saloonTroupe;
