const wanderingSamuraiLevelingChart = {
  2: {
    name: "Honorable Vendetta",
    description: "Choose an Enemy Keyword (Demon, Undead, etc). From now on, any time you collect XP from those Enemies, collect an extra +10 XP."
  },
  3: { bonus: "+1 Max Fury" },
  4: { bonus: "+1 Move" },
  5: { bonus: "+1 Strength and +1 Lore", extra: "+D6 Sanity" },
  6: { bonus: "+1 Cunning or +1 Spirit", extra: "+D6 Health/Sanity (any mix)" },
  7: { bonus: "+D6 Health and +D6 Sanity" },
  8: { bonus: "+1 Agility or +1 Luck", extra: "+D6 Health/Sanity (any mix)" },
  9: { bonus: "+2 Side Bag Token Capacity", extra: "+D6 Health" },
  10: { bonus: "+1 Grit" },
  11: { bonus: "+1 Initiative" },
  12: {
    name: "Dark Stone Resistance",
    description: "You can now hold 2 more Corruption Points before getting a Mutation."
  }
};

export default wanderingSamuraiLevelingChart;
