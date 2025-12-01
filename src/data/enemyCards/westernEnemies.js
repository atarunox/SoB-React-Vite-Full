// src/data/enemyCards/westernEnemies.js
export default {
  low: [],
  medium: [
    {
      set: "Targa Plateau",
      enemies: [
        {
          name: "Custodians of Targa",
          keywords: ["Robot", "Targa"],
          Size: "Large",
          initiative: 4,
          move: 10,
          escape: "4+",
          toHit: { melee: "3+", ranged: "3+" },
          stats: {
            normal: { combat: 3, damage: 1, defense: 3, health: 8, xp: "10+5" },
            brutal: { combat: 4, damage: 2, defense: 4, health: 10, xp: "15+10" }
          },
          abilities: [
            "Electro-Shock – Adjacent Heroes take 3 Hits at start of Activation.",
            "Defense Laser – Ranged: Range 8, Shots 2, Damage 3",
            "Repair (2) – Heals self and adjacent Robot/Targa Pylons (if no Heroes adjacent).",
            "Repair Protocol – Moves adjacent to heal allies if not in combat."
          ],
          eliteAbilities: [
            "Ornate Craftsmanship – +4 Health",
            "Dark Stone Explosion – D6 Corruption Hits within 3 spaces on death",
            "Enhanced Repair – Repair (2) ignores adjacent Hero condition",
            "Power Spark – Electro-Shock does D6 Hits for 2 Damage each",
            "Plasma Shields – Immune to Critical Hits",
            "Multi-Laser – Defense Laser has 2x Shots"
          ]
        }
      ]
    },
    {
      set: "Swamps of Jargono",
      enemies: [
        {
          name: "Feral Vampires",
          keywords: ["Vampire", "Undead"],
          Size: "Large",
          initiative: 5,
          move: 8,
          escape: "4+",
          toHit: { melee: "4+", ranged: "4+" },
          stats: {
            normal: { combat: 3, damage: 2, defense: 4, health: 8, xp: "15+5" },
            brutal: { combat: 4, damage: 3, defense: 4, health: 10, xp: "20+10" }
          },
          abilities: [
            "Fear (2) – Adjacent Heroes take 2 Horror Hits at Activation.",
            "Blood Drain – Heals 1 Wound when dealing damage.",
            "Mist Form – Armor 5+",
            "Vampiric Bite – To-Hit rolls of 6 ignore Defense and add D6 Hit. If that D6 is 6, Hero gets Bitten Marker."
          ],
          eliteAbilities: [
            "Hideous – Fear (3), +1 Health",
            "Transfixing Stare – Targeted Hero cannot use Grit",
            "Grave Strength – Hits deal +2 Damage",
            "Flight – Move through models, +2 Initiative",
            "Masters of Mist – Mist Form becomes Armor 4+",
            "Ancient – +2 Health, +1 Combat, gains Ancient keyword"
          ]
        }
      ]
    }
  ],
  high: [],
  epic: []
};

