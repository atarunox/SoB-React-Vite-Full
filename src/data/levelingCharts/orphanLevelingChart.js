const orphanLevelingChart = {
  2: {
    name: "Hardened by the World",
    description: "You are now +1 Damage on your To Hit rolls of 6."
  },
  3: { bonus: "+D6 Health" },
  4: { bonus: "+1 Initiative" },
  5: { bonus: "+1 Strength or +1 Luck", extra: "+D6 Sanity" },
  6: { bonus: "+1 Cunning or +1 Agility", extra: "+D6 Sanity" },
  7: { bonus: "+2 Health and +2 Sanity" },
  8: { bonus: "+1 Lore or +1 Spirit", extra: "+D6 Sanity" },
  9: { bonus: "+1 Side Bag Token Capacity" },
  10: { bonus: "+1 Grit" },
  11: { bonus: "+D6 Health" },
  12: {
    name: "Dark Stone Resistance",
    description: "You can now hold 2 more Corruption Points before getting a Mutation."
  }
};

export default orphanLevelingChart;
