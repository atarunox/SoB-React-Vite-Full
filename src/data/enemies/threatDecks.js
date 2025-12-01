// Threat decks for all supported worlds, structure: world -> threatLevel -> array of cards

export const THREAT_DECKS = {
  Mines: {
    low: [
      { name: "3x Tentacles", enemies: [{ name: "Tentacles", count: 3 }] },
      { name: "2x Void Swarm", enemies: [{ name: "Void Swarm", count: 2 }] },
      { name: "3x Sand Crabs", enemies: [{ name: "Sand Crabs", count: 3 }] }
    ],
    medium: [
      { name: "4x Ancient Spiders", enemies: [{ name: "Ancient Spiders", count: 4 }] },
      { name: "2x Mutant Brutes", enemies: [{ name: "Mutant Brute", count: 2 }] },
      { name: "Captain Burns + 2x Scaffold", enemies: [
          { name: "Captain Burns", count: 1 },
          { name: "Silver Back Pa Scaffold", count: 2 }
        ]
      }
    ],
    high: [
      { name: "3x Lava Men + Void Hound", enemies: [
          { name: "Lava Men", count: 3 },
          { name: "Void Hounds", count: 1 }
        ]
      },
      { name: "Coffin Breakers + 2x Tentacles", enemies: [
          { name: "Coffin Breakers", count: 1 },
          { name: "Tentacles", count: 2 }
        ]
      },
      { name: "4x Acidic Tentacles", enemies: [{ name: "Acidic Tentacles", count: 4 }] }
    ],
    epic: [
      { name: "Captain Burns + Silver Back Pa + 2x Void Hounds", enemies: [
          { name: "Captain Burns", count: 1 },
          { name: "Silver Back Pa Scaffold", count: 1 },
          { name: "Void Hounds", count: 2 }
        ]
      },
      { name: "6x Coffin Breakers", enemies: [{ name: "Coffin Breakers", count: 6 }] },
      { name: "4x Lava Men + Void Swarm", enemies: [
          { name: "Lava Men", count: 4 },
          { name: "Void Swarm", count: 1 }
        ]
      }
    ]
  }
  // Add additional worlds below as needed!
};

// Aliases for other official Mines-based worlds
THREAT_DECKS["City of the Ancients"] = THREAT_DECKS["Mines"];
THREAT_DECKS["Derelict Ship"] = THREAT_DECKS["Mines"]; // Example if you need it

// Utility: Flatten to a single array (for when you want to draw from all levels randomly)
export function getAllThreatsForWorld(world) {
  const worldDeck = THREAT_DECKS[world];
  if (!worldDeck) return [];
  return Object.values(worldDeck).flat();
}

// Utility: Get threats for a given world and level
export function getThreatDeck(world, threatLevel = "low") {
  if (THREAT_DECKS[world] && Array.isArray(THREAT_DECKS[world][threatLevel])) {
    return THREAT_DECKS[world][threatLevel];
  }
  if (THREAT_DECKS[world]) {
    return Object.values(THREAT_DECKS[world]).flat();
  }
  return [];
}

