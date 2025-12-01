const usMarshalLevelingChart = {
  2: {
    name: "Vendetta",
    description: "Choose a specific Enemy Type (Tentacles, Stranglers, etc). From now on, any time you collect XP from that Enemy Type, collect an extra +10 XP."
  },
  3: { bonus: "+1 Combat" },
  4: { bonus: "+1 Move" },
  5: { bonus: "+1 Strength or +1 Agility", extra: "+D6 Health/Sanity (any mix)" },
  6: { bonus: "+1 Cunning or +1 Spirit", extra: "+D6 Health/Sanity (any mix)" },
  7: { bonus: "+D6 Health and +D6 Sanity" },
  8: { bonus: "+1 Lore or +1 Luck", extra: "+D6 Health/Sanity (any mix)" },
  9: { bonus: "+1 Side Bag Token Capacity", extra: "+D6 Health/Sanity (any mix)" },
  10: { bonus: "+1 Grit" },
  11: { bonus: "+1 Initiative" },
  12: {
    name: "Dark Stone Resistance",
    description: "You can now hold 2 more Corruption Points before getting a Mutation."
  }
};

export default usMarshalLevelingChart;
