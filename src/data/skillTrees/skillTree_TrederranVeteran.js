const trederranVeteranUpgradeChart = [
  [
    {
      name: "Trench Scout",
      description: "You may now roll 2 dice for Escape tests, and choose which to use.",
      effects: { Move: 2 }
    },
    {
      name: "Soldier's Satchel",
      description: "At the start of every Adventure, gain 1 of the following Side Bag Tokens for free: Bandages, Whiskey (Snake), Shatter Grenade",
      effects: { "Side Bag Capacity": 2 }
    },
    {
      name: "Dark Stone Shots",
      description: "Once per turn, discard a Dark Stone to add extra Damage to one of your Gun Hits, equal to the number of Upgrade Slots the Gun has."
    },
    {
      name: "Ruthless",
      description: "Once per Fight, you may take 1 Corruption Hit to add +D3 Damage to one of your Hits."
    }
  ],
  [
    {
      name: "Adrenaline Rush",
      description: "At the start of any Fight, you may Heal D6 Wounds/Sanity (any mix)."
    },
    {
      name: "Battle Gear",
      description: "You are +1 Health for each Clothing Item you have equipped.",
      effects: { Strength: 1 }
    },
    {
      name: "Weapons Training",
      description: "When using any Gun, add +2 Range. When using any Gun, add +1 Shot."
    },
    {
      name: "Dark Stone Greed",
      description: "You are +1 Sanity for each Dark Stone and Dark Stone icon on Items that you are carrying. This includes Dark Stone that is 'Hidden' (max +10)."
    }
  ],
  [
    {
      name: "Keen Eyes",
      description: "Whenever you draw one or more Loot or Scavenge cards, you may draw one extra (this may increase beyond the normal limit of 3 Loot per Fight)."
    },
    {
  name: "Unflinching",
  description: "Willpower 3+",
  effects: { "Willpower": "3+" }
},

    {
      name: "Firefight",
      description: "Once per turn, when you kill an Enemy with a Ranged Attack, make a Cunning 6+ test to Recover 1 Grit for each 6+ rolled."
    },
    {
      name: "Watch the World Burn",
      description: "Any time the Darkness moves 1 or more spaces forward on the Depth Track, you may Recover a Grit.",
      effects: { Lore: 1 }
    }
  ],
  [
    {
      name: "Winds of Change",
      description: "Once per turn, you may make a Luck 6+ test to cancel and re-draw a Darkness, Growing Dread, Encounter, or Threat card just drawn. Gain 20 XP.",
      effects: { "Corruption Resistance": 2 }
    },
    {
      name: "Trederran Sunset",
      description: "Any time you are KO'd, you may do 2D6 Wounds to every adjacent model, ignoring Defense. You now have unlimited Grit."
    },
    {
      name: "Death Machine",
      description: "Once per turn, use 2 Grit to make an extra Ranged Attack.",
      effects: { "Grit": 1 }
    },
    {
      name: "Frenzy",
      description: "You are +1 Combat for each Mutation you have (Limit +3). Free Attack (Once per Fight): Use 1 Grit to make an extra Melee Attack."
    }
  ]
];

export default trederranVeteranUpgradeChart;

