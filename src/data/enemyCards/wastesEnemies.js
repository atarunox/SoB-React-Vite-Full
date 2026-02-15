export const wastesEnemies = [
  {
    name: "Scavenger Raiders",
    keywords: ["Mutant", "Outlaw", "Tech"],
    initiative: 5,
    Size: "Medium",
    health: 6,
    defense: 4,
    move: 5,
    escape: "4+",
    xp: 25,
    melee: { toHit: "4+", damage: 3 },
    ranged: { toHit: "5+", damage: 4 },
    abilities: [
      "Scrap Firearms – Ranged Attack: Range 6, Shots 2, Damage 4. On a To Hit roll of 1, the weapon jams and cannot be used for the rest of the fight.",
      "Looting Frenzy – If a Hero is KO'd, all Scavenger Raiders gain +1 Move and +1 Combat for the rest of the fight.",
      "Improvised Armor – Armor 6+. If the Armor save is successful, roll again: on a 6, the Armor breaks and is lost for the rest of the fight.",
      "Wasteland Cunning – At the start of their Activation, roll a D6: on 5+, this model may Ambush and take a free Move before Attacking."
    ],
    eliteChart: [
      "Hardened Survivors – +3 Health; reduce all Damage taken by 1 (minimum 1).",
      "Jury-Rigged Weapons – Scrap Firearms gain +1 Shot and +1 Damage; jam on rolls of 1 or 2.",
      "Raider Captain – All Scavenger Raiders within 3 spaces gain +1 To Hit on Ranged Attacks.",
      "Booby Traps – When a Hero moves adjacent, roll a D6: on 5+, that Hero takes D6 Wounds ignoring Defense.",
      "Desperate Charge – Gains +2 Combat and +1 Damage on Melee Attacks if below half Health.",
      "Wasteland Trophies – Each Scavenger Raider gains +1 Initiative for each KO'd Hero on the board."
    ]
  },
  {
    name: "Sand Burrowers",
    keywords: ["Beast", "OtherWorld", "Mutant"],
    initiative: 3,
    Size: "Large",
    health: 10,
    defense: 5,
    move: 4,
    escape: "5+",
    xp: 35,
    melee: { toHit: "3+", damage: 5 },
    ranged: null,
    abilities: [
      "Subterranean Ambush – This enemy starts the fight Burrowed. While Burrowed, it cannot be targeted. At the start of its Activation, it surfaces adjacent to the nearest Hero and immediately Attacks.",
      "Crushing Jaws – To Hit rolls of 5 or 6 cause an additional Wound that ignores Armor.",
      "Tremorsense – Cannot be Ambushed. Heroes cannot use Stealth abilities against this enemy.",
      "Burrowing Retreat – At the end of its Activation, roll a D6: on 6, this enemy Burrows again and cannot be targeted until its next Activation."
    ],
    eliteChart: [
      "Armored Carapace – Armor 4+; immune to Critical Hits from Ranged Attacks.",
      "Sinkhole – When surfacing, all Heroes within 2 spaces must pass Agility 4+ or fall Prone and lose their next Move.",
      "Nest Mother – +5 Health. When this enemy is killed, spawn 2 Small Sand Burrower Hatchlings (Health 3, Damage 2) in adjacent spaces.",
      "Razor Mandibles – +2 Damage on all Melee Attacks; To Hit rolls of 6 cause Bleeding Marker.",
      "Quake Tremor – At start of each Enemy Phase, all Heroes must pass Strength 5+ or be moved D3 spaces toward the nearest Sand Burrower.",
      "Thick Hide – Reduce all Damage taken by 2 (minimum 1); +2 Health."
    ]
  },
  {
    name: "Void Hounds",
    keywords: ["Void", "Beast"],
    initiative: 6,
    Size: "Medium",
    health: 7,
    defense: 4,
    move: 7,
    escape: "3+",
    xp: 30,
    melee: { toHit: "4+", damage: 4 },
    ranged: null,
    abilities: [
      "Phase Strike – May move through models and terrain during their Move.",
      "Void Growl – At the start of the fight, all Heroes take 2 Horror Hits. Heroes that fail their Willpower check take an additional 1 Sanity Damage.",
      "Pack Hunt – Gains +1 Damage for each other Void Hound adjacent to the same target.",
      "Dimensional Flicker – Each time this enemy would take a Wound from a Ranged Attack, roll a D6: on 6, the Wound is negated."
    ],
    eliteChart: [
      "Howling Madness – All Heroes Hit take +2 Sanity Damage; Heroes within 2 spaces must pass Willpower 5+ or become Stunned.",
      "Shadow Dash – May make a free Move at the end of the Enemy Phase; this Move ignores all terrain.",
      "Dark Fangs – To Hit rolls of 6 cause an additional Wound that ignores Armor and Defense.",
      "Warp Pulse – Gains Armor 5+; Ranged Attacks against this enemy suffer -1 To Hit.",
      "Alpha Stalker – Re-roll all failed To Hit rolls each turn; +2 Health.",
      "Void Rift – When this enemy is killed, all Heroes within 3 spaces take D3 Corruption Hits."
    ]
  },
  {
    name: "Junk Golems",
    keywords: ["Tech", "OtherWorld", "Mutant"],
    initiative: 2,
    Size: "Large",
    health: 14,
    defense: 6,
    move: 3,
    escape: "5+",
    xp: 45,
    melee: { toHit: "3+", damage: 6 },
    ranged: null,
    abilities: [
      "Scrap Plating – Armor 4+. When the Armor save fails, reduce all Damage taken by 1 (minimum 1).",
      "Crushing Slam – Any Hero Hit must pass Strength 5+ or be knocked back D3 spaces and fall Prone.",
      "Magnetic Pull – At the start of this enemy's Activation, each Hero within 4 spaces with any Gear that has the Tech keyword must pass Strength 4+ or be pulled 2 spaces toward this enemy.",
      "Rebuild – At the end of each Enemy Phase, this enemy recovers 1 Wound on a D6 roll of 4+."
    ],
    eliteChart: [
      "Reinforced Core – +4 Health; Armor improves to 3+.",
      "Overcharged – +2 Damage on all Melee Attacks; at the end of each turn, roll a D6: on 1, this enemy takes 2 Wounds.",
      "Shrapnel Burst – When this enemy is killed, all models within 2 spaces take D6 Wounds ignoring Armor.",
      "Dark Stone Engine – Gains +2 Move; at the start of each turn, all Heroes within 3 spaces take 1 Corruption Hit.",
      "Scrap Shield – Immune to Critical Hits; reduce all Ranged Damage taken by 2 (minimum 1).",
      "Relentless Machine – Immune to Horror Hits, Stun, and any effects that reduce Move or Initiative."
    ]
  },
  {
    name: "Dust Wraiths",
    keywords: ["Void", "Undead", "OtherWorld"],
    initiative: 4,
    Size: "Medium",
    health: 8,
    defense: 3,
    move: 6,
    escape: "3+",
    xp: 40,
    melee: { toHit: "3+", damage: 4 },
    ranged: null,
    abilities: [
      "Ethereal – This enemy can only be Wounded by attacks with the Dark Stone, Holy, or Magical keyword. All other attacks pass harmlessly through it.",
      "Life Drain – Each Wound caused by this enemy heals 1 Wound on this model. If at full Health, gain +1 Health instead (max +3).",
      "Fear (4): A Hero starting their Activation adjacent takes 4 Horror Hits.",
      "Sand Storm – At the start of the Enemy Phase, all Heroes within 3 spaces suffer -1 To Hit on all attacks until the end of the turn."
    ],
    eliteChart: [
      "Ancient Specter – +3 Health; gains Armor 5+ against non-magical attacks that can still harm it.",
      "Wailing Tempest – Fear increases to (6); Heroes that fail their Willpower check also lose their next Action.",
      "Soul Siphon – Life Drain now heals 2 Wounds per Wound caused; excess healing grants +1 Damage (max +2).",
      "Dust Devil – Gains +2 Move; may make a free Attack against each Hero it passes through during its Move.",
      "Void Anchor – While this enemy is on the board, Heroes cannot use items or abilities that allow teleportation or dimensional travel.",
      "Choking Sands – At the end of each turn, all Heroes within 2 spaces must pass Willpower 4+ or take 2 Wounds ignoring Defense."
    ]
  }
];

export default function Placeholder() { return null; }
