export const mountainEnemies = [
  {
    name: "Cave Trolls",
    keywords: ["Beast", "OtherWorld"],
    initiative: 2,
    Size: "Large",
    health: 14,
    defense: 4,
    move: 4,
    escape: "5+",
    xp: 25,
    melee: { toHit: "3+", damage: 5 },
    ranged: null,
    abilities: [
      "Regeneration – At the end of each Enemy Phase, heals D3 Wounds.",
      "Massive Club – Hits push the target 2 spaces away; any model in the path takes 2 Wounds ignoring Defense.",
      "Thick Hide – Reduce all Damage by 1 (minimum 1).",
      "Savage Hunger – Gains +1 Damage against targets with half or less of their starting Health."
    ],
    eliteChart: [
      "Ancient Troll – +4 Health, +1 Defense.",
      "Boulder Toss – Gains Ranged Attack: Range 5, Shots 1, To Hit 5+, Damage D6.",
      "Regenerative Fury – Heals D6 Wounds instead of D3 at end of Enemy Phase.",
      "Bone Armor – Armor 5+; Immune to Critical Hits.",
      "Berserker Rage – When reduced to half Health or below, gains +2 Combat and +2 Damage.",
      "Territorial Roar – At start of fight, all Heroes take 2 Horror Hits and must pass Willpower 4+ or lose 1 Initiative."
    ]
  },
  {
    name: "Rock Elementals",
    keywords: ["Elemental", "OtherWorld"],
    initiative: 1,
    Size: "Large",
    health: 16,
    defense: 3,
    move: 3,
    escape: "5+",
    xp: 25,
    melee: { toHit: "4+", damage: 6 },
    ranged: null,
    abilities: [
      "Stone Form – Immune to Poison, Bleeding, and Corruption Hits. Reduce all Damage by 2 (minimum 1).",
      "Quake Slam – At start of Activation, all Heroes within 2 spaces must pass Agility 5+ or fall Prone.",
      "Crumbling Fists – Ignore Armor on To Hit rolls of 5 or 6.",
      "Earthen Resilience – Immune to Horror Hits and Sanity Damage."
    ],
    eliteChart: [
      "Obsidian Core – +4 Health; Armor 4+.",
      "Seismic Stomp – Quake Slam range increased to 3 spaces; affected Heroes also take 1 Wound.",
      "Living Mountain – +2 Damage; cannot be pushed or moved by any effect.",
      "Crystal Shards – On death, all Heroes within 3 spaces take D6 Wounds ignoring Defense.",
      "Mineral Absorption – At end of each turn, if adjacent to a wall, heals 2 Wounds.",
      "Tectonic Fury – Gains +1 Combat for each Rock Elemental on the board (max +3)."
    ]
  },
  {
    name: "Razorback Mountain Beasts",
    keywords: ["Beast"],
    initiative: 4,
    Size: "Medium",
    health: 8,
    defense: 4,
    move: 6,
    escape: "4+",
    xp: 15,
    melee: { toHit: "4+", damage: 4 },
    ranged: null,
    abilities: [
      "Razor Spines – Any Hero that Attacks this enemy in Melee takes 1 Wound on a To Hit roll of 1.",
      "Charge – If this enemy moves 3 or more spaces before Attacking, gains +2 Damage on the first Hit.",
      "Pack Frenzy – Gains +1 Combat for each other Razorback Mountain Beast adjacent to the same target.",
      "Keen Scent – Always targets the Hero with the most Wounds taken; cannot be Hidden from."
    ],
    eliteChart: [
      "Alpha Beast – +3 Health, +1 Combat, +1 Damage.",
      "Hardened Spines – Razor Spines now deal 2 Wounds instead of 1 on a roll of 1.",
      "Relentless Pursuit – +2 Move; ignores terrain effects while Moving.",
      "Bloodlust – After killing a Hero or causing 3 or more Wounds in one Attack, gains a free additional Attack.",
      "Matted Fur – Armor 5+; reduce all Ranged Damage by 1.",
      "Thundering Stampede – When 3 or more Razorback Mountain Beasts are on the board, all gain +1 Move and +1 Damage."
    ]
  },
  {
    name: "Avalanche Golem",
    keywords: ["Elemental", "Construct", "OtherWorld"],
    initiative: 1,
    Size: "Large",
    health: 20,
    defense: 3,
    move: 3,
    escape: "6+",
    xp: 35,
    melee: { toHit: "3+", damage: 7 },
    ranged: null,
    abilities: [
      "Unstoppable – Immune to Critical Hits; cannot be Snared, pushed, or moved by any effect.",
      "Avalanche Sweep – Attacks hit all Heroes adjacent to the Golem, not just the target.",
      "Frozen Armor – Armor 4+. Any Hero that Attacks this enemy in Melee must pass Strength 4+ or take -1 Damage on their Attack.",
      "Snowblind – All Ranged To Hit rolls against this enemy are at -1."
    ],
    eliteChart: [
      "Glacial Core – +6 Health; heals 2 Wounds at end of each Enemy Phase.",
      "Crushing Weight – +2 Damage; Hits push targets 2 spaces away.",
      "Permafrost Shell – Armor improved to 3+; reduce all Damage by 1.",
      "Ice Shatter – On death, all Heroes within 4 spaces take 2D6 Wounds ignoring Defense.",
      "Frozen Grip – Heroes Hit must pass Agility 5+ or lose their next Move action.",
      "Awakened Wrath – Gains +1 Combat for every 5 Wounds it has taken (max +4)."
    ]
  },
  {
    name: "Frost Wraiths",
    keywords: ["Undead", "OtherWorld", "Elemental"],
    initiative: 5,
    Size: "Medium",
    health: 6,
    defense: 5,
    move: 6,
    escape: "3+",
    xp: 15,
    melee: { toHit: "4+", damage: 3 },
    ranged: null,
    abilities: [
      "Ethereal – May move through walls and models. All Melee To Hit rolls against Frost Wraiths are at -1.",
      "Chilling Touch – Each Hit causes 1 Corruption Hit in addition to Damage.",
      "Fear (3): A Hero starting their Activation adjacent takes 3 Horror Hits.",
      "Frozen Aura – Heroes adjacent to a Frost Wraith at end of turn take -1 Move on their next Activation."
    ],
    eliteChart: [
      "Spectral Fury – +1 Combat, +1 Damage, +1 Move.",
      "Howling Blizzard – At start of each Enemy Phase, all Heroes within 3 spaces take 1 Sanity Hit and 1 Wound ignoring Defense.",
      "Frost Veil – Heroes must re-roll successful Ranged To Hit rolls against this enemy.",
      "Soul Drain – Each Wound caused heals 1 Wound on the Frost Wraith.",
      "Ice Shackles – Heroes Hit must pass Willpower 5+ or be unable to use Grit until end of their next Activation.",
      "Deathly Cold – On death, all adjacent Heroes take 2 Corruption Hits and 2 Horror Hits."
    ]
  }
];

export default function Placeholder() { return null; }
