export const cynderEnemies = [
  {
    name: "Fire Demons",
    keywords: ["Demon", "Elemental", "OtherWorld"],
    initiative: 5,
    Size: "Medium",
    health: 9,
    defense: 4,
    move: 6,
    escape: "4+",
    xp: 25,
    melee: { toHit: "4+", damage: 4 },
    ranged: { toHit: "5+", damage: 3 },
    abilities: [
      "Hellfire Bolt – Ranged Attack: Range 8, Shots 1, Damage 3. Hits cause a Burning Marker; Hero with a Burning Marker takes 1 Wound at the start of each turn until discarded with an Agility 4+ roll.",
      "Infernal Aura – All Heroes adjacent to this enemy at the end of the Enemy Phase take 1 Wound ignoring Defense.",
      "Fire Immunity – Immune to Fire and Explosive Damage.",
      "Demonic Fury – Gains +1 Combat when at half Health or below."
    ],
    eliteChart: [
      "Hellforged Armor – Armor 5+; +2 Health.",
      "Brimstone Lash – Melee To Hit rolls of 6 cause an additional D3 Wounds ignoring Defense.",
      "Flame Vortex – At start of its Activation, all Heroes within 2 spaces take 1 Wound ignoring Armor.",
      "Cinder Trail – Each space this enemy moves through becomes Hazardous Terrain for the rest of the turn; Heroes moving through take 1 Wound.",
      "Infernal Commander – All Demon keyword enemies on the board gain +1 Damage.",
      "Soulfire – Hits cause 1 Horror Hit in addition to Damage."
    ]
  },
  {
    name: "Lava Serpents",
    keywords: ["Elemental", "Beast", "OtherWorld"],
    initiative: 4,
    Size: "Large",
    health: 12,
    defense: 4,
    move: 5,
    escape: "4+",
    xp: 25,
    melee: { toHit: "3+", damage: 5 },
    ranged: null,
    abilities: [
      "Constrict – On a To Hit roll of 6, the target Hero is Grabbed and cannot Move or Escape until they pass a Strength 5+ test at the start of their Activation.",
      "Molten Body – Any Hero that makes a Melee Attack against this enemy takes 1 Wound ignoring Defense.",
      "Burrow – May move through walls and terrain; when emerging adjacent to a Hero, that Hero must pass Agility 4+ or take 2 Wounds.",
      "Fire Immunity – Immune to Fire and Explosive Damage."
    ],
    eliteChart: [
      "Obsidian Scales – Armor 4+; reduce all Damage taken by 1 (minimum 1).",
      "Magma Blood – When this enemy takes a Wound, all adjacent Heroes take 1 Wound ignoring Defense.",
      "Crushing Coils – Grabbed Heroes take D3 Wounds at the start of each turn instead of being unable to Act.",
      "Volcanic Fury – +2 Combat; +1 Damage.",
      "Lava Spit – Gains a Ranged Attack: Range 6, Shots 1, Damage 4, To Hit 5+.",
      "Ancient Serpent – +4 Health; immune to Critical Hits."
    ]
  },
  {
    name: "Ashen Revenants",
    keywords: ["Undead", "Elemental", "OtherWorld"],
    initiative: 3,
    Size: "Medium",
    health: 7,
    defense: 5,
    move: 4,
    escape: "4+",
    xp: 20,
    melee: { toHit: "4+", damage: 4 },
    ranged: null,
    abilities: [
      "Fear (2): A Hero starting their Activation adjacent to this enemy takes 2 Horror Hits.",
      "Smoldering Grasp – Hits cause a Burning Marker; Hero with a Burning Marker takes 1 Wound at the start of each turn until discarded with an Agility 4+ roll.",
      "Ash Cloud – All Ranged Attacks targeting this enemy are at -1 To Hit.",
      "Risen from Cinders – When destroyed, roll a D6: on 5-6, this enemy returns with D3 Health at the end of the next Enemy Phase."
    ],
    eliteChart: [
      "Choking Ash – Heroes adjacent at the start of their Activation must pass Strength 4+ or lose their Attack this turn.",
      "Ember Heart – At the start of each turn, heals 1 Wound.",
      "Scorched Bones – Armor 6+; +3 Health.",
      "Undying Flames – Risen from Cinders now triggers on 3+ instead of 5-6.",
      "Wrathful Dead – +1 Combat and +1 Damage for each other Ashen Revenant that has been destroyed this fight.",
      "Searing Touch – Melee Hits ignore Armor."
    ]
  },
  {
    name: "Magma Golem",
    keywords: ["Elemental", "Void", "OtherWorld"],
    initiative: 1,
    Size: "Large",
    health: 20,
    defense: 3,
    move: 3,
    escape: "5+",
    xp: 40,
    melee: { toHit: "3+", damage: 7 },
    ranged: null,
    abilities: [
      "Massive – This enemy takes up a 2x2 space on the board. Cannot be Pushed or moved by any Hero ability.",
      "Molten Slam – All Heroes adjacent to this enemy after it completes its Move take D3 Wounds ignoring Defense.",
      "Volcanic Shell – Armor 4+; immune to Critical Hits. Reduce all Damage taken by 1 (minimum 1).",
      "Eruption – Once per fight, at the start of its Activation, every Hero within 3 spaces takes D6 Wounds ignoring Armor."
    ],
    eliteChart: [
      "Living Volcano – Eruption may now be used every other turn instead of once per fight.",
      "Obsidian Fists – +2 Melee Damage; Hits destroy 1 piece of the target Hero's Gear (Hero's choice) on a To Hit roll of 6.",
      "Lava Flow – Each space this enemy moves through becomes Lava Terrain for the rest of the fight; Heroes entering or starting in Lava take 2 Wounds ignoring Defense.",
      "Hardened Core – +6 Health; +1 Defense.",
      "Seismic Stomp – At the start of each turn, all Heroes on the board must pass Agility 4+ or be knocked Prone.",
      "Magma Regeneration – At the start of each turn, heals D3 Wounds."
    ]
  },
  {
    name: "Ember Spirits",
    keywords: ["Elemental", "Demon", "Void"],
    initiative: 6,
    Size: "Small",
    health: 4,
    defense: 3,
    move: 8,
    escape: "2+",
    xp: 15,
    melee: { toHit: "5+", damage: 2 },
    ranged: null,
    abilities: [
      "Flickering Flame – All To Hit rolls against this enemy are at -1; this enemy may move through walls and models.",
      "Burning Touch – Each Hit causes a Burning Marker; Hero with a Burning Marker takes 1 Wound at the start of each turn until discarded with an Agility 4+ roll.",
      "Swarm of Sparks – Gains +1 Damage for each other Ember Spirit adjacent to the same target.",
      "Fire Immunity – Immune to Fire and Explosive Damage."
    ],
    eliteChart: [
      "Wildfire – +2 Move; at the end of its Move, each Hero it passed through takes 1 Wound ignoring Defense.",
      "Searing Swarm – +1 Combat; gains an additional +1 Damage per adjacent Ember Spirit (stacks with Swarm of Sparks).",
      "Blinding Flash – Once per fight, all Heroes on the board must pass Willpower 5+ or lose their next Ranged Attack.",
      "Cinder Burst – On death, all adjacent Heroes take D3 Wounds ignoring Defense and gain a Burning Marker.",
      "Heat Mirage – Heroes must re-roll successful Melee To Hit rolls against this enemy.",
      "Consuming Flames – Burning Markers caused by this enemy require Agility 5+ to discard instead of 4+."
    ]
  }
];
export default function Placeholder() { return null; }
