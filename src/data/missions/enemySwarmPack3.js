// Enemy Swarm Pack 3: Void Spiders — Mission Sheets

export const ESP3_MISSIONS = [
  {
    id: 'esp3_burn_em_out',
    name: "Burn 'Em Out",
    pack: 'Enemy Swarm Pack 3: Void Spiders',
    packId: 'esp3',
    missionNumber: 1,
    description:
      "If you ever reach that land-time down, you can't help but notice the skittering sounds in the darkness. Sometimes those sounds escalate, a flood of noise descending out of the shadows like a tide. Void Spiders. In moments the whole space is crawling with them, their pale bodies weaving around your ankles, between your boots, climbing the walls. And there's only one way to clear them out... fire.",

    setup:
      "The Heroes set up at one end of a series of connected Tiles/Rooms. Place the Entrance at the entry end and set up as normal. Void Spiders are placed in the Inner Rooms/Tiles of the map. Egg Sacks are also placed in the Inner Rooms.",

    heroScaling: [
      { heroes: '1–2', text: '1 Egg Sack to destroy' },
      { heroes: '3–4', text: '3 Egg Sacks to destroy' },
      { heroes: '5–6', text: '5 Egg Sacks to destroy' },
    ],

    specialRules: [
      {
        name: 'No Grit',
        text: 'Heroes cannot spend Grit for Rerolls during this Mission. (Grit can still be recovered and spent for other purposes.)',
      },
      {
        name: 'Dread Passage',
        text: 'At the start of every Hero Activation, a Hero on a Passage (corridor) tile suffers a Ranged Attack from the Void Spiders.',
      },
      {
        name: 'Webbed Passages',
        text: 'Any Hero Moving through a Passage must pass an Agility test or become Webbed.',
      },
      {
        name: 'Ancient Void Spider Attack',
        text: 'An Ancient Void Spider may Ambush Attack as a Normal attack when first Activated, using standard Void Spider combat stats.',
      },
      {
        name: 'Dreaded Spawning',
        text: 'Once per Turn, when a Hero fails an Ambush Attack roll, one new Void Spider is added to the nearest group as a free Spawn action.',
      },
    ],

    objectives: [
      'Destroy all Egg Sacks (see hero-count above).',
      'Defeat enough Void Spiders to clear the infestation (see DM for total based on party size).',
      'Once all Egg Sacks are destroyed and the kill quota is met, the Mission is successfully complete.',
    ],

    reward:
      'Each surviving Hero draws 1 Loot card, gains 300 XP, and recovers +3 Health. Heroes gain 1 Reward point per Egg Sack and Void Spider eliminated.',

    failure:
      'If all Heroes are KO\'d or flee, the Void Spiders overrun the area. The Darkness claims another stretch of territory and the Heroes are forced to move on to their next Adventure.',
  },
];

export default ESP3_MISSIONS;
