const trederranVeteranLevelingChart = {
  2: {
    name: "Dark Stone Hunter",
    description: "Any time you gain 1 or more Dark Stone, you may gain 1 extra."
  },
  3: {
    effects: { "Corruption Resistance": 1 }
  },
  4: {
    effects: { Move: 1 }
  },
  5: {
    effects: { Strength: 1, Cunning: 1, Sanity: "D6" }
  },
  6: {
    effects: { Lore: 1, Spirit: 1, Sanity: "D6" }
  },
  7: {
    effects: { Health: 3, Sanity: 3 }
  },
  8: {
    effects: { Agility: 1, Spirit: 1, Health: "D6" }
  },
  9: {
    effects: { Initiative: 1 }
  },
  10: {
    effects: { Grit: 1 }
  },
  11: {
    effects: { "Side Bag Capacity": 2 }
  },
  12: {
    name: "Personalized Gear",
    description: "Choose any Item – you have to gain an extra Upgrade Slot (Limit once per Item)."
  }
};

export default trederranVeteranLevelingChart;

