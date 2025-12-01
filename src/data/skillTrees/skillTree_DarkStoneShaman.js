const darkStoneShamanUpgradeChart = [
  [
    { name: "War Shaman", description: "New Spirit Magik Battle or Protection Spell." },
    { name: "Call of the Wild", description: "New Spirit Magik Shapeshifting Spell." },
    { name: "Harmony", description: "You no longer need to roll for Corruption from Dark Stone at the end of each Adventure.", effects: { "Grit": 1 } },
    { name: "Storytelling", description: "", effects: { Lore: 1, "Spirit Magik": 1 } }
  ],
  [
    { name: "Spirit Sacrifice", description: "Once per turn, when you kill an Enemy, you may use 2 Magik to Recover a Grit.", effects: { Agility: 1 } },
    { name: "Tribal Dance", description: "While in an Animal Form, you may Re-roll 1 Defense roll or 1 To Hit roll per turn.", effects: { Initiative: 1 } },
    { name: "Attuned", description: "Dark Stone used to enhance your Spells now add 3 extra casting dice each instead." },
    { name: "Wisdom of Ages", description: "New Spirit Magik Battle or Protection or Shapeshifting Spell.", effects: { Cunning: 1 } }
  ],
  [
    { name: "Battle Chant", description: "New Spirit Magik Battle or Protection Spell.", effects: { "Spirit Magik": 1 } },
    { name: "Animal Nature", description: "New Spirit Magik Shapeshifting Spell.", effects: { "Spirit Magik": 1 } },
    { name: "Void Strength", description: "You are +1 Health for each unique Item you carry that has a Dark Stone icon on it.", effects: { Strength: 1 } },
    { name: "Ancestral Guide", description: "Once per turn, you may use 2 Dark Stone to prevent the Darkness from moving on the Depth Track on the D6 roll of 3+." }
  ],
  [
    { name: "Spirit Champion", description: "", effects: { "Grit": 1, Defense: "3+" } },
    { name: "One with the Spirits", description: "You may now cast other Spirit Magik, even while in Animal Form.", effects: { Combat: 1 } },
    { name: "Light as a Feather", description: "Items you carry that have a Dark Stone icon count as having 1 less Weight.", effects: { Move: 1 } },
    { name: "Tribal Elder", description: "Once per turn, you may add an extra Power Level to a single Spell you are casting.", effects: { "Spirit Magik": 1 } }
  ]
];

export default darkStoneShamanUpgradeChart;

