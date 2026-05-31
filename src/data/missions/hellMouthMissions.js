// Hell Mouth Terrain & Mission Pack

export const HELL_MOUTH_MISSIONS = [
  {
    id: 'hell_mouth_through_the_mouth_of_madness',
    name: 'Through the Mouth of Madness',
    pack: 'Hell Mouth Terrain Pack',
    packId: 'hell_mouth',
    missionNumber: 1,
    description:
      'Heroes are drawn into a disturbing, dreamlike scenario involving the Hell Mouth — a gaping abyss where the Darkness has torn through the fabric of reality. Sent on assignment to the Zimmer Mine, the Heroes must navigate tunnels twisted by dark forces, uncover the fate of those who came before, and find a way back before the madness consumes them.',

    setup:
      'Heroes start on the Zimmer Mine Starting Tile and set up as normal. When the first tile beyond the Starting Tile is explored, place the Hell Mouth terrain tile at that location.',

    heroScaling: [
      { heroes: '2–3', text: 'Place 1 Hell Mouth in the dungeon' },
      { heroes: '4+',  text: 'Place up to 2 Hell Mouths in the dungeon' },
    ],

    specialRules: [
      {
        name: 'No Gates',
        text: 'There are no OtherWorld Gates in this Mission. Heroes may not cross through to the OtherWorld during this Adventure.',
      },
      {
        name: 'Hell Mouth',
        text: 'The Hell Mouth acts as a Spawner for enemies native to the OtherWorld it connects to. At the end of each Hero Turn, if there are fewer enemies on the board than the current Threat Level, spawn a new enemy from the Hell Mouth\'s location. Any Hero adjacent to the Hell Mouth must make a Corruption test at the start of their activation or take 1 Corruption Hit. The Hell Mouth counts as Difficult Terrain (double movement cost to cross).',
      },
      {
        name: 'Prophet of the Darkness',
        text: 'Whenever Heroes explore a new tile and draw an Attack Encounter result, the Prophet of the Darkness is spawned instead. It has elevated stats and pursues Heroes aggressively.',
      },
      {
        name: 'Loss in a Dream',
        text: 'If a Hero is KO\'d near the Hell Mouth, they suffer a Madness Hit and may be moved to an unexpected location on the board.',
      },
    ],

    objectives: [
      'Clue 1 — Entrance of the Hell Mouth: Find and interact with the Hell Mouth entrance in the first explored room beyond the Starting Tile.',
      'Clue 2 — The Writer\'s Fate: Find the old journal deeper in the dungeon that reveals the fate of previous explorers.',
      'Clue 3 — A Way Out: Locate the exit route past the Hell Mouth. Once all 3 clues are gathered, the Hell Mouth becomes fully active — escape before it consumes you.',
      'Story Come to Life: Collecting all 3 clues triggers a full escalation event. Defeat or evade the final threat and escape.',
    ],

    reward:
      'Each surviving Hero gains 1 Story Token and $50. All Heroes roll once on the Madness Table.',

    failure:
      'All Heroes roll once on the Hell Mouth Madness/Explore table.',
  },
];

export default HELL_MOUTH_MISSIONS;
