const bandidoLevelingChart = {
  2: {
    name: "Vendetta",
    description: "Choose a specific Enemy Type (Tentacles, Stranglers, etc). From now on, any time you collect XP from that Enemy Type, collect an extra +10 XP."
  },
  3: { bonus: "+1 Combat" },
  4: { bonus: "+1 Initiative" },
  5: { bonus: "+1 Strength", extra: "+D6 Health/Sanity (any mix)" },
  6: { bonus: "+1 Cunning or +1 Agility", extra: "+D6 Health" },
  7: { bonus: "+D6 Health and +3 Sanity" },
  8: { bonus: "+1 Lore or +1 Luck", extra: "+D6 Sanity" },
  9: { bonus: "+2 Side Bag Token Capacity" },
  10: { bonus: "+1 Initiative" },
  11: { bonus: "+1 Combat" },
  12: {
    name: "Cunnin' Plan",
    description: "When Holding Up the Outpost Bank in Town, you now steal +$50 for every 5+ rolled."
  }
};

export default bandidoLevelingChart;
