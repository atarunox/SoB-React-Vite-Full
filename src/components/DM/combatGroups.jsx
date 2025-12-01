// src/data/localCombatGroups.js

export const combatGroups = [
  {
    name: "Void Spider",
    amount: 3,
    keywords: ["Void", "Beast"],
    eliteAbilities: ["+1 Move", "Fear Aura"],
    traits: ["Spiked"],
    modifiers: {
      defense: 1,
      initiative: -1
    }
  },
  {
    name: "Night Terror",
    amount: 2,
    keywords: ["Mutant", "Large"],
    eliteAbilities: ["+1 Damage", "Immune to Horror Hits"],
    traits: ["Slippery"],
    modifiers: {}
  }
];
