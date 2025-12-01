const saloonGirlLevelingChart = {
  2: {
    name: "Vendetta",
    description: "Choose a specific Enemy Type (Tentacles, Stranglers, etc). From now on, any time you collect XP from that Enemy Type, collect an extra +10 XP."
  },
  3: { bonus: "+1 Initiative" },
  4: { bonus: "+1 Move" },
  5: { bonus: "+1 Strength or +1 Agility", extra: "+D6 Health/Sanity (any mix)" },
  6: { bonus: "+1 Cunning or +1 Lore", extra: "+D6 Health" },
  7: { bonus: "+3 Health and +3 Sanity" },
  8: { bonus: "+1 Luck or +1 Lore", extra: "+D6 Sanity" },
  9: {
    name: "Dark Stone Resistance",
    description: "You can now hold 2 more Corruption Points before getting a Mutation."
  },
  10: { bonus: "+1 Grit" },
  11: { bonus: "+1 Initiative" },
  12: { bonus: "+1 Combat" }
};

export default saloonGirlLevelingChart;
