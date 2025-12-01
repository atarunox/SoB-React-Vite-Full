const skillTree_Cowboy = [
  [
    {
      id: 'spiritualWarrior',
      name: 'Spiritual Warrior',
      description: 'Tribal Resilience',
      effects: { health: 1 }
    },
    {
      id: 'savageGrit',
      name: 'Savage Grit',
      description: '+1 Grit',
      effects: { maxGrit: 1 }
    },
    {
      id: 'jungleInstincts',
      name: 'Jungle Instincts',
      description: '+1 Spirit',
      effects: { Spirit: 1 }
    },
    {
      id: 'stalkingHunter',
      name: 'Stalking Hunter',
      description: '+1 Initiative',
      effects: { Initiative: 1 }
    }
  ],
  [
    {
      id: 'transformation',
      name: 'Transformation',
      description: 'Thick Hide\n+1 Defense',
      effects: { defense: 1 }
    },
    {
      id: 'battleHardened',
      name: 'Battle Hardened',
      description: '+1 Grit recovery per turn',
      effects: { gritRegen: 1 }
    },
    {
      id: 'ancestralGuidance',
      name: 'Ancestral Guidance',
      description: '+1 Lore',
      effects: { Lore: 1 }
    },
    {
      id: 'skirmisher',
      name: 'Skirmisher',
      description: '+1 Agility',
      effects: { Agility: 1 }
    }
  ],
  [
    {
      id: 'darkStoneMastery',
      name: 'Dark Stone Mastery',
      description: 'Tough as Nails\n+2 Max Health',
      effects: { health: 2 }
    },
    null,
    null,
    null
  ],
  [null, null, null, null]
];
export default skillTree_Cowboy;
