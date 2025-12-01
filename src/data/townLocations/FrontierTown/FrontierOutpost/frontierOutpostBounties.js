// src/data/townLocations/frontierOutpostBounties.js
const frontierOutpostBounties = {
  id: 'frontierOutpostBounties',
  name: 'Bounty Board',
  type: 'service',
  items: [],
  services: [
    {
      id: 'bounty_roll',
      name: 'Bounty (roll a D6)',
      price: 0,
      tags: ['Bounty', 'OncePerTownStay', 'AllHeroes'],
      rules: {
        text:
          'Limit once per Town Stay for all Heroes. Roll a D6 to see the current Bounty at the Outpost.',
        oncePerTownStay: true,
        table: {
          1: { name: 'No Bounty', reward: null, note: 'No current Bounty available.' },
          2: { name: 'Tentacles', reward: '$10 per kill' },
          3: { name: 'HellBats', reward: '$25 per kill' },
          4: { name: 'Stranglers', reward: '$50 per kill' },
          5: { name: 'Night Terrors', reward: '$150 to every Hero per kill' },
          6: { name: 'Slashers', reward: '$200 to every Hero per kill' },
        },
      },
    },
  ],
};

export default frontierOutpostBounties;
