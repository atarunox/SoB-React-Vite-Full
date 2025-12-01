const orphanUpgradeChart = [
  [
    { name: "Small Target", description: "Once per turn, you may Re-roll a single Defense roll." },
    { name: "Running Ahead", description: "Gain 5 XP × your Hero Level any time you Look Through a Doorway.", bonus: "+2 Move" },
    { name: "Hot Temper", description: "", bonus: "+1 Combat, +1 Strength, +2 Health" },
    { name: "Grown Up Fast", description: "When rolling for Discovery on your Orphan Mission, you may roll 1 extra die, then choose one die to discard.", bonus: "+1 Grit" }
  ],
  [
    { name: "Hide", description: "Once per Fight, if there are no Enemies adjacent to you, you may Recover 1 Grit." },
    { name: "Sprint", description: "You may now roll the D8 for Move each turn and Recover a Grit on the roll of 1 or 8." },
    { name: "Toe-to-Toe", description: "While adjacent to a Large or bigger Enemy, your attacks are +1 Damage to that Enemy (or +2 on a Critical Hit).", bonus: "+1 Grit" },
    { name: "“I’m Not a Kid”", description: "Once per turn, you may take D3 Corruption Hits to Recover a Grit. May also be used once per Town Stay.", bonus: "+1 Grit" }
  ],
  [
    { name: "Dodge", description: "Once per turn, use 1 Grit to ignore a single Enemy Hit against you (before you roll for Defense)." },
    { name: "Over Your Head", description: "While there are no other Heroes on your Map Tile, you are: Defense 3+", bonus: "+1 Grit" },
    { name: "Lash Out", description: "Use 1 Grit to add 1 Damage to one of your Hits.", bonus: "+1 Strength" },
    { name: "Something to Prove", description: "Any time you kill an Enemy, gain +10 XP (or +50 XP if Large or bigger).", bonus: "+3 Health" }
  ],
  [
    { name: "Sneak Attack", description: "While there is only one Enemy adjacent to you, your attacks are +2 Damage against that Enemy.", bonus: "+1 Cunning" },
    { name: "I Can Handle it Myself!", description: "Once per turn, use 1 Grit to force any single die to be Re-rolled, even if it has already been Re-rolled." },
    { name: "Bloodlust", description: "Once per turn, when you kill an Enemy, you may Heal D6 Wounds.", bonus: "+5 Health" },
    { name: "All In", description: "Choose one of the Starting Upgrades of your secondary Hero Class to acquire. This includes any Gear that goes with it." }
  ]
];

export default orphanUpgradeChart;
