const outlawLevelingChart = {
  2: {
    name: "Wanted Posters",
    description: "You've made a habit of collecting Wanted Posters of yourself and spreading them around to increase your legend. Once per Adventure, while in an Otherworld, use 1 Grit to pin up a Wanted Poster of yourself to gain 1 Peril and 10 XP."
  },
  3: { bonus: "+D6 Health" },
  4: { bonus: "+1 Initiative" },
  5: { bonus: "+1 Strength or +1 Luck", extra: "+D6 Sanity" },
  6: { bonus: "+1 Cunning or +1 Agility", extra: "+D6 Sanity" },
  7: { bonus: "+2 Health and +2 Sanity" },
  8: { bonus: "+1 Lore or +1 Spirit", extra: "+D6 Sanity" },
  9: { bonus: "+1 Side Bag Token Capacity", extra: "+D6 Sanity" },
  10: { bonus: "+1 Grit" },
  11: { bonus: "+D6 Health" },
  12: {
    name: "Dark Stone Resistance",
    description: "You can now hold 2 more Corruption Points before getting a Mutation."
  }
};

export default outlawLevelingChart;
