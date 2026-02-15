export const targaEnemies = [
  {
    name: "Ice Walkers",
    keywords: ["Alien", "Ice", "OtherWorld"],
    initiative: 4,
    Size: "Medium",
    health: 7,
    defense: 4,
    move: 5,
    escape: "4+",
    xp: 15,
    melee: { toHit: "4+", damage: 4 },
    ranged: null,
    abilities: [
      "Frozen Assault: After moving, if the Ice Walker ends adjacent to a Hero, that Hero must pass an Agility 4+ test or be Frozen (cannot Move on their next Activation).",
      "Bitter Cold Aura: Heroes adjacent to an Ice Walker at the start of their Activation suffer -1 to all To Hit rolls until the end of the turn.",
      "Ice Shards: When an Ice Walker takes a Critical Hit, all Heroes adjacent take 1 Wound from shattering ice, ignoring Armor.",
      "Glacial Endurance: Reduce all Fire and Explosive Damage by 2 (minimum 1)."
    ],
    eliteChart: [
      "Permafrost Armor -- Armor 5+; immune to Critical Hits.",
      "Howling Blizzard -- At the start of each Enemy turn, all Heroes within 3 spaces take 1 Horror Hit.",
      "Frozen Talons -- +1 Combat; To Hit rolls of 6 cause Bleeding Marker.",
      "Avalanche Charge -- +2 Move on the first turn of each Fight; gains +2 Damage on that turn's Attack.",
      "Cryo Shell -- +4 Health; reduce all Damage taken by 1 (minimum 1).",
      "Flash Freeze -- Once per fight, all adjacent Heroes must pass Strength 5+ or be Frozen for 2 turns (cannot Move or Attack)."
    ]
  },
  {
    name: "Cryo-Beasts",
    keywords: ["Beast", "Ice", "Alien"],
    initiative: 3,
    Size: "Large",
    health: 14,
    defense: 4,
    move: 5,
    escape: "4+",
    xp: 25,
    melee: { toHit: "3+", damage: 5 },
    ranged: null,
    abilities: [
      "Rending Claws: Ignore Armor on To Hit rolls of 5 or 6.",
      "Thick Ice Hide: Reduce all Damage taken by 1 (minimum 1). Immune to all Ice and Cold effects.",
      "Savage Pounce: If the Cryo-Beast moves 3 or more spaces before Attacking, it gains +2 Damage on that Attack.",
      "Territorial Roar: Once per Fight, all Heroes must take 2 Horror Hits. Heroes within 2 spaces also suffer -1 Initiative for the rest of the Fight."
    ],
    eliteChart: [
      "Alpha Predator -- +2 Combat; re-roll 1 missed To Hit roll each turn.",
      "Frost Breath -- At the end of each Enemy turn, all Heroes within 2 spaces take 1 Wound ignoring Defense.",
      "Glacial Bulk -- +6 Health; Endurance (2) (max 2 Wounds per Hit).",
      "Ice Blood -- When wounded, the attacking Hero must pass Agility 4+ or take 1 Wound from spraying frozen blood.",
      "Den Mother -- While on the board, all other Ice keyword enemies gain +1 Move and +1 Damage.",
      "Frozen Rage -- When reduced below half Health, gains +2 Combat and +2 Damage for the rest of the Fight."
    ]
  },
  {
    name: "Frozen Sentinels",
    keywords: ["Alien", "Ice", "Tech"],
    initiative: 5,
    Size: "Large",
    health: 16,
    defense: 3,
    move: 4,
    escape: "5+",
    xp: 30,
    melee: { toHit: "3+", damage: 5 },
    ranged: { toHit: "4+", damage: 4 },
    abilities: [
      "Cryo Cannon -- Ranged Attack: Range 8, Shots 2, Damage 4. Any Hero Hit must pass Agility 4+ or be Frozen (cannot Move next Activation).",
      "Sentinel Protocol: The Frozen Sentinel always targets the Hero with the most Wounds remaining.",
      "Reinforced Plating: Armor 5+. Immune to Critical Hits.",
      "Power Core: When killed, roll D6: on a 1-2, the core detonates and all models within 2 spaces take D6 Wounds ignoring Defense."
    ],
    eliteChart: [
      "Overcharged Core -- +4 Health; Cryo Cannon gains +1 Shot and +1 Damage.",
      "Adaptive Targeting -- May switch between Ranged and Melee each turn without penalty; gains +1 To Hit on both.",
      "Ice Shield Generator -- Once per turn, negate 1 Hit against the Sentinel automatically.",
      "Targa Alloy -- Reduce all Damage taken by 2 (minimum 1).",
      "Cryo Pulse -- Once per fight, all Heroes within 3 spaces must pass Strength 5+ or be Stunned and Frozen.",
      "Relentless Machine -- Immune to Horror, Sanity, Corruption, and Poison effects. Cannot be Stunned."
    ]
  },
  {
    name: "Void Scarabs",
    keywords: ["Void", "Alien", "Vermin"],
    initiative: 6,
    Size: "Small",
    health: 3,
    defense: 3,
    move: 7,
    escape: "3+",
    xp: 10,
    melee: { toHit: "5+", damage: 2 },
    ranged: null,
    abilities: [
      "Swarm Tactics: For every 2 Void Scarabs adjacent to the same target, all Void Scarabs attacking that target gain +1 Damage.",
      "Void Corrosion: Each Hit also causes 1 Corruption Hit.",
      "Skittering Mass: May move through other models and ignore terrain penalties.",
      "Hard Carapace: All Ranged Attacks against Void Scarabs suffer -1 Damage (minimum 1)."
    ],
    eliteChart: [
      "Burrowing Swarm -- May appear from any doorway or pit on the map instead of the normal entry point.",
      "Phase Carapace -- Armor 6+; Heroes must re-roll Critical Hits against Void Scarabs.",
      "Void Leech -- Each successful Hit drains 1 Grit from the target Hero (if available).",
      "Chittering Horde -- +2 Health; gains +1 Move for each other Void Scarab on the board.",
      "Toxic Ichor -- When killed, the Hero that killed it takes 1 Corruption Hit and 1 Wound ignoring Defense.",
      "Feeding Frenzy -- If a Hero is reduced to 0 Wounds while adjacent to a Void Scarab, all Void Scarabs on the board heal to full Health."
    ]
  },
  {
    name: "Targa Constructs",
    keywords: ["Tech", "Alien", "OtherWorld"],
    initiative: 5,
    Size: "Large",
    health: 18,
    defense: 3,
    move: 4,
    escape: "5+",
    xp: 35,
    melee: { toHit: "3+", damage: 6 },
    ranged: { toHit: "3+", damage: 5 },
    abilities: [
      "Plasma Barrage -- Ranged Attack: Range 10, Shots 3, Damage 5. May target different Heroes with each Shot.",
      "Heavy Chassis: Armor 4+. Cannot be pushed, pulled, or moved by any Hero ability.",
      "Auto-Repair: At the start of each Enemy turn, the Targa Construct heals 2 Wounds.",
      "Threat Analysis: Gains +1 To Hit against any Hero that attacked it in the previous turn."
    ],
    eliteChart: [
      "War Machine -- +2 Combat; Plasma Barrage gains +2 Shots.",
      "Ablative Plating -- The first 3 Wounds dealt to the Construct each Fight are negated.",
      "Targa Override -- Once per fight, the Construct takes two full Activations in a single turn.",
      "EMP Pulse -- At Initiative 1, all Heroes with Tech keyword items must pass a Luck 4+ test or those items are disabled for 1 turn.",
      "Siege Mode -- May forfeit all Move to gain +3 Damage and +2 Shots on Ranged Attacks for that turn.",
      "Self-Destruct Protocol -- When killed, all models within 3 spaces take 2D6 Wounds ignoring Defense and Armor."
    ]
  }
];

export default function Placeholder() { return null; }
