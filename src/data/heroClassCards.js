export const HERO_CLASS_CARDS = {
  Cowboy: {
    classCards: [
      {
        id: 'daredevil',
        name: 'Daredevil',
        description: 'You are +2 Move. All of your Attacks on adjacent Large size (or bigger) Enemies are +1 Damage.',
        effects: { Move: 2, bonusDamageVsLargeAdjacent: 1 },
      },
      {
        id: 'trick_shooting',
        name: 'Trick Shooting',
        description: 'Use 1 Grit when you cause a Hit with a Gun, to immediately cause an additional D3 other Enemies in a continuous chain, starting adjacent to the target, to also take a single Hit from that Gun.',
        effects: {},
      },
      {
        id: 'watchman',
        name: 'Watchman',
        description: 'You always Activate before Enemies at your Initiative level. Also, all Heroes in your Posse gain +2 Initiative during the first turn of an Ambush Attack.',
        effects: { preemptiveActivation: true, posseInitiativeBonusAmbush: 2 },
        startingItems: ["Rider's Rifle"]
      }
    ]
  },

  Drifter: {
    classCards: [
      {
        id: 'gunfighter',
        name: 'Gunfighter',
        description: 'For every 6+ To Hit with a Pistol, gain +1 Shot (max +3).',
        effects: {},
      },
      {
        id: 'no_name',
        name: 'No Name',
        description: 'The Hero has no name. +1 Agility. Start every Adventure with Max Grit.',
        effects: { Agility: 1, startWithMaxGrit: true },
      },
      {
        id: 'resourceful',
        name: 'Resourceful',
        description: 'Any time you draw one or more Loot, Scavenge, Darkness, or Encounter cards, you may draw one extra card, then choose one of those cards to discard.',
        effects: {},
      }
    ]
  },

  DarkStoneShaman: {
    classCards: [
      {
        id: 'spirit_guardian',
        name: 'Spirit Guardian',
        description: '+1 Strength. When casting Spirit Magik - Protection Spells, you may Re-roll one of the casting dice.',
        effects: { Strength: 1 },
        startingItems: ['Ancestral Shield']
      },
      {
        id: 'spirit_hunter',
        name: 'Spirit Hunter',
        description: '+1 Initiative. When casting Spirit Magik - Battle Spells, you may Re-roll one of the casting dice.',
        effects: { Initiative: 1 },
        startingItems: ['Dark Stone Hatchet', "Warrior's Speed"]
      },
      {
        id: 'spirit_shaper',
        name: 'Spirit Shaper',
        description: '+1 Max Grit. When casting Spirit Magik - Shapeshifting Spells, you may Re-roll one of the casting dice.',
        effects: { "Max Grit": 1 },
        startingItems: ['Bear Form']
      }
    ]
  },

  Bandido: {
    classCards: [
      {
        id: 'explosives_expert',
        name: 'Explosives Expert',
        description: 'Use 2 Grit to gain a Dynamite Token.',
        effects: {},
        startingItems: ['Dynamite Satchel']
      },
      {
        id: 'swindler',
        name: 'Swindler',
        description: 'Anytime you draw a Loot card, you may discard it and draw a new one. You must keep the second card drawn. You are also +1 Combat.',
        effects: { Combat: 1 },
      },
      {
        id: 'twin_guns',
        name: 'Twin Guns',
        description: 'You may fire two Guns per turn with no penalty for the off-hand Gun.',
        effects: {},
        startingItems: ['Pistol']
      }
    ]
  },

  FrontierDoc: {
    classCards: [
      {
        id: 'battlefield_experience',
        name: 'Battlefield Experience',
        description: 'You may move through other models during your movement, and you automatically pass all Escape tests. At the start of every Fight, Recover 1 Grit.',
        effects: { canMoveThroughModels: true, autoEscape: true },
      },
      {
        id: 'expert_surgeon',
        name: 'Expert Surgeon',
        description: 'When using your Field Surgery ability, the Injury/Mutation is Healed on the D6 roll of 4+ now.',
        effects: {},
        startingItems: ["Surgeon's Saw"]
      },
      {
        id: 'field_research',
        name: 'Field Research',
        description: 'Gain 50 XP the first time you encounter a new Enemy Type. Your Attacks are +1 Damage against all Enemy Types you have encountered before.',
        effects: { bonusDamageVsKnownEnemies: 1 },
        startingItems: ['Collection Jar']
      }
    ]
  },

  Gambler: {
    classCards: [
      {
        id: 'fancy_footwork',
        name: 'Fancy Footwork',
        description: 'Roll an extra die for Move each turn and choose. On doubles, recover 1 Fortune Token.',
        effects: {},
      },
      {
        id: 'high_roller',
        name: 'High Roller',
        description: 'To Hit rolls of 6+ do +1 Damage. Recovering Grit also gives 1 Fortune Token.',
        effects: {},
      },
      {
        id: 'side_bet',
        name: 'Side Bet',
        description: '+1 Luck. On three of a kind during Skill test, recover 1 Fortune. On three 1s, lose D3 Fortune.',
        effects: { Luck: 1 },
      }
    ]
  },

  Gunslinger: {
    classCards: [
      {
        id: 'pistol_fanning',
        name: 'Pistol Fanning',
        description: 'Use 1 Grit to double Shots with a Gun (once/turn). Requires a free hand.',
        effects: {},
      },
      {
        id: 'quickdraw',
        name: 'Quickdraw',
        description: 'On new Enemies being placed, make a free Attack out of turn. Requires a free hand.',
        effects: {},
      },
      {
        id: 'reload',
        name: 'Reload',
        description: 'Use 2 Grit to re-fill D6 Shots into your Six Shooter Template.',
        effects: {},
      }
    ]
  },

  Orphan: {
    classCards: [
      {
        id: 'rage',
        name: 'Rage',
        description: 'Once per Fight, use 1 Grit to gain +2 Combat and +1 Damage on Combat Hits, or +1 Shot with a Gun.',
        effects: { Combat: 2 },
      },
      {
        id: 'vengeance',
        name: 'Need For Vengeance',
        description: 'Start each Adventure with a Revive Token only usable by your Hero.',
        effects: { selfReviveToken: true },
      },
      {
        id: 'wiley',
        name: 'Wiley',
        description: 'Armor 6+. You may move through other models during your movement.',
        effects: { Armor: '6+', canMoveThroughModels: true },
      }
    ]
  },

  Outlaw: {
    classCards: [
      {
        id: 'outlaw_charm',
        name: 'Outlaw Charm',
        description: 'Once per turn, cause D3 Corruption Hits to adjacent Hero to let them recover 1 Grit and gain 10 XP per Hit.',
        effects: {},
      },
      {
        id: 'hitman',
        name: 'Hitman',
        description: 'Move through other models. +1 Move.',
        effects: { Move: 1, canMoveThroughModels: true },
        startingItems: ['Sawed-Off Shotgun']
      },
      {
        id: 'reckless',
        name: 'Reckless',
        description: 'Ranged To Hit and Defense values are swapped. To-Hit: 4+, Defense: 5+',
        effects: { rangedHit: '4+', defense: '5+' },
      }
    ]
  },

  TrederranVeteran: {
  classCards: [
    {
      id: 'tainted_by_war',
      name: 'Tainted by War',
      description: '+1 Max Grit. Start with a Mutation. When rolling for a Mutation, always roll twice and choose one.',
      effects: { "Max Grit": 1, mutationRollBonus: true, startsWithMutation: true }
    },
    {
      id: 'veteran_reflexes',
      name: 'Veteran Reflexes',
      description: 'Once per turn, re-roll a Defense roll or To Hit roll.',
      effects: { rerollDefenseOrHitOncePerTurn: true }
    },
    {
      id: 'battle_hardened',
      name: 'Battle Hardened',
      description: '+1 Armor. Immune to Terror.',
      effects: { Armor: '1+', immuneToTerror: true }
    }
  ],
    factions: [
      {
        id: 'royal_foundry',
        name: 'Royal Foundry',
        description: '-3 Corruption Resistance, but +2 Health per Mutation. Once per Adventure, gain +2 Shots on a Ranged Attack with a Gun.',
        effects: { CorruptionResistance: 3, healthPerMutation: 2 }
      },
      {
        id: 'republic_of_tarkon',
        name: 'Republic of Tar-Kon',
        description: 'All Attacks are +1 Damage. Gain no XP from Loot cards, Scavenge cards, or from Healing other Heroes.',
        effects: { bonusDamage: 1, noXPLootScavengeHealing: true }
      },
      {
        id: 'the_union',
        name: 'The Union',
        description: 'On using Side Bag Token, roll D6. On 5+, do not discard it.',
        effects: { sideBag5PlusNoDiscard: true }
      },
      {
        id: 'kharkarus_konfederacy',
        name: 'Kharkarus Konfederacy',
        description: 'Start each Adventure with a Revive token usable only by you. Gain Level costs +100 XP per Level.',
        effects: { selfReviveToken: true, levelXPExtraMultiplier: 100 }
      },
      {
        id: 'shintaro_core',
        name: 'Shintaro Core',
        description: 'Armor 5+. -1 Initiative. -1 to all Escape tests.',
        effects: { Armor: '5+', Initiative: -1, escapePenalty: 1 }
      },
      {
        id: 'liberation_army',
        name: 'Liberation Army',
        description: 'Once per Fight, take D3+1 Wounds to gain +D6 Damage to one Hit (ignores Defense and Armor). At end of each Successful Adventure, gain 1 Health. On a Failed Adventure, lose 2 Health permanently.',
        effects: { healthGainSuccessLossFailure: true }
      }
    ]
  }
};


