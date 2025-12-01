// src/data/levelingCharts/jargononativeLevelingChart.js

export const upgradeTree = [
  [
    {
      name: "Stealth Strike",
      description: "Your Critical Hits are +1 Damage and you are +1 to all Escape rolls.",
      bonus: "+1 Agility",
      effects: { Agility: 1 }
    },
    {
      name: "Battle Stance",
      description: "Whenever one or more Enemy groups are placed in Ambush, Recover 1 Grit.",
      bonus: "+1 Strength",
      effects: { Strength: 1 }
    },
    {
      name: "Jumping Attack",
      description: "Once per Fight, you may spend un-used movement points from your Move to add Damage to one of your Combat Hits. Every 2 Move = +1 Damage.",
      bonus: "",
      effects: {}
    },
    {
      name: "Enemy Tracks",
      description: "Once per Adventure, use 1 Grit to switch Attack (or Ambush) on an Exploration Token into 2x Encounters instead. The rest of the Token remains the same.",
      bonus: "",
      effects: {}
    }
  ],
  [
    {
      name: "Fungus Grower",
      description: "You gain 1 Swamp Fungus Side Bag Token at the start of each Adventure.",
      bonus: "",
      effects: {}
    },
    {
      name: "Shield Bash",
      description: "While you have a Shield equipped, you are +1 Combat.",
      bonus: "+1 Grit",
      effects: { "Grit": 1 }
    },
    {
      name: "Spinning Slash",
      description: "While you have a Two-Handed Weapon equipped, you are +1 Damage with Combat Hits.",
      bonus: "+1 Initiative",
      effects: { Initiative: 1 }
    },
    {
      name: "Quick Shot",
      description: "You may add +1 Shot to any Bow you are using.",
      bonus: "+1 Initiative and +1 Agility",
      effects: { Initiative: 1, Agility: 1 }
    }
  ],
  [
    {
      name: "Tribal Warrior",
      description: "You are +2 Health for each Tribal Item you have (max +10).",
      bonus: "+1 Strength",
      effects: { Strength: 1 }
    },
    {
      name: "Shield Charge",
      description: "Use 1 Grit, while you have a Shield equipped, to move through other models this turn. Each model moved through takes 2 Wounds, ignoring Defense (limit once per model).",
      bonus: "",
      effects: {}
    },
    {
      name: "Mighty Swing",
      description: "",
      bonus: "+1 Combat and +1 Strength",
      effects: { Combat: 1, Strength: 1 }
    },
    {
      name: "Deep Cuts",
      description: "You may double the Endurance value of any Enemy while Attacking it.",
      bonus: "+1 Strength",
      effects: { Strength: 1 }
    }
  ],
  [
    {
      name: "Ancestor’s Favor",
      description: "Whenever you kill a Large (or bigger) Enemy, you may move the Darkness back one space on the Depth Track (does not trigger special spaces moved back through).",
      bonus: "+1 Spirit",
      effects: { Spirit: 1 }
    },
    {
      name: "Honored Champion",
      description: "",
      bonus: "Melee To Hit 3+",
      effects: { "Melee": "3+" }
    },
    {
      name: "Fury of Jargono",
      description: "Once per Fight, use 2 Grit to make an extra Attack this Activation.",
      bonus: "+2 Grit",
      effects: { "Grit": 2 }
    },
    {
      name: "Master of the Hunt",
      description: "You gain +2 Combat and +2 Shots with any Bow you are using, while there are one or more Extra Large (or bigger) Enemies on the board.",
      bonus: "",
      effects: {}
    }
  ]
];

export const levelChart = {
  2: {
    name: "Vendetta",
    description: "Choose a specific Enemy Type (Tentacles, Stranglers, etc). From now on, any time you collect XP from that Enemy Type, collect an extra +10 XP."
  },
  3: { bonus: "+D6 Health" },
  4: { bonus: "+1 Move" },
  5: { bonus: "+1 Strength or +1 Initiative", extra: "+D6 Sanity" },
  6: { bonus: "+1 Cunning or +1 Spirit", extra: "+D6 Sanity" },
  7: { bonus: "+2 Health and +2 Sanity" },
  8: { bonus: "+1 Lore or +1 Luck", extra: "+D6 Sanity" },
  9: { bonus: "+1 Side Bag Token Capacity", extra: "+D6 Sanity" },
  10: { bonus: "+1 Grit" },
  11: { bonus: "+D6 Health" },
  12: {
    name: "Dark Stone Resistance",
    description: "You can now hold 2 more Corruption Points before getting a Mutation."
  }
};

export default { upgradeTree, levelChart };

