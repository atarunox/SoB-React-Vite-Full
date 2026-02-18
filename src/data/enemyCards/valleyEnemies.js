export const valleyEnemies = [
  {
    name: "Serpent Warriors",
    keywords: ["Serpent", "Ancient"],
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
      "Scaled Hide – Reduce all Damage by 1 (minimum 1).",
      "Serpent Reflexes – May re-roll 1 Defense roll per turn.",
      "Forked Blade – To Hit rolls of 6 cause an additional Wound ignoring Armor.",
      "Hiss of the Kings – At start of their Activation, each Hero within 2 spaces takes 1 Horror Hit."
    ],
    eliteChart: [
      "Venomtipped Blades – Each Hit that causes a Wound also inflicts 1 Corruption Hit.",
      "Royal Guard – +2 Health, +1 Defense.",
      "Coiling Strike – Gains +1 Combat and may Attack before or after Moving.",
      "Ancient Fury – +1 Damage for each other Serpent keyword model adjacent to the target.",
      "Shed Skin – Once per fight, ignore all Wounds from a single Attack.",
      "Serpent King's Blessing – Immune to Critical Hits; Armor 6+."
    ]
  },
  {
    name: "Lizardfolk Hunters",
    keywords: ["Beast", "Serpent"],
    initiative: 5,
    Size: "Medium",
    health: 5,
    defense: 5,
    move: 6,
    escape: "3+",
    xp: 10,
    melee: { toHit: "4+", damage: 3 },
    ranged: { toHit: "5+", damage: 2 },
    abilities: [
      "Jungle Ambush – On the first turn of combat, gains +2 Combat and +1 Damage.",
      "Poisoned Darts – Ranged Attack: Range 6, Shots 2, Damage 2. Each Hit causes a Poison Marker; Hero takes 1 Wound at start of each turn until passing a Strength 5+ roll.",
      "Camouflage – All Ranged To Hit rolls against Lizardfolk Hunters are at -1.",
      "Pack Tactics – Gains +1 To Hit for each other Lizardfolk Hunter adjacent to the same target."
    ],
    eliteChart: [
      "Blowgun Mastery – Ranged Attacks gain +1 Shot and +1 Damage.",
      "Jungle Stalkers – +2 Move; may ignore terrain effects while Moving.",
      "Ritual Scars – +2 Health and Armor 6+.",
      "Frenzied Assault – On To Hit rolls of 6, makes 1 additional Attack against the same target.",
      "Venomous Coating – Poison Markers now deal 2 Wounds instead of 1 at start of turn.",
      "Alpha Hunter – +1 Initiative; all other Lizardfolk Hunters on the board gain +1 Move."
    ]
  },
  {
    name: "Jungle Stalker",
    keywords: ["Beast", "OtherWorld"],
    initiative: 6,
    Size: "Large",
    health: 10,
    defense: 4,
    move: 7,
    escape: "3+",
    xp: 20,
    melee: { toHit: "3+", damage: 5 },
    ranged: null,
    abilities: [
      "Pounce – If the Jungle Stalker moves 3 or more spaces before Attacking, gains +2 Damage on the first Hit.",
      "Rending Claws – Ignore Armor on To Hit rolls of 5 or 6.",
      "Predator's Senses – Cannot be Hidden from; always targets the Hero with the lowest Health.",
      "Terrifying Roar – Once per fight, all Heroes within 4 spaces take 3 Horror Hits."
    ],
    eliteChart: [
      "Apex Predator – +2 Combat, +1 Damage.",
      "Thick Scales – Reduce all Damage by 1; +3 Health.",
      "Lightning Reflexes – Heroes must re-roll successful To Hit rolls of 6 against this enemy.",
      "Blood Frenzy – Gains +1 Damage for each Wound already dealt this fight (max +3).",
      "Shadow Prowler – May move through models and walls during its Move.",
      "Deathgrip – Heroes Hit must pass Strength 5+ or lose their next Move action."
    ]
  },
  {
    name: "Temple Guardian",
    keywords: ["Ancient", "OtherWorld", "Construct"],
    initiative: 2,
    Size: "Large",
    health: 14,
    defense: 3,
    move: 4,
    escape: "5+",
    xp: 25,
    melee: { toHit: "3+", damage: 6 },
    ranged: null,
    abilities: [
      "Stone Body – Immune to Poison, Bleeding, and Corruption Hits.",
      "Crushing Slam – Hits push the target 1 space away; if the target cannot be pushed, it takes 2 additional Wounds.",
      "Sentinel – Cannot be moved by any Hero ability or effect.",
      "Eternal Vigil – At the end of each Enemy Phase, heals 1 Wound."
    ],
    eliteChart: [
      "Reinforced Stone – Armor 4+; +4 Health.",
      "Serpent King's Wrath – +2 Damage; To Hit rolls of 6 cause D6 Damage instead of normal.",
      "Tremor Stomp – At start of Activation, all Heroes within 2 spaces must pass Agility 4+ or fall Prone and lose 1 Action.",
      "Ancient Runes – Immune to Critical Hits; reduce all Damage by 1.",
      "Awakened Fury – Gains +1 Combat for each Wound it has taken (max +3).",
      "Crumbling Vengeance – On death, all adjacent Heroes take D6+2 Wounds ignoring Defense."
    ]
  },
  {
    name: "Serpent Shaman",
    keywords: ["Serpent", "Ancient", "Magik"],
    initiative: 3,
    Size: "Medium",
    health: 8,
    defense: 5,
    move: 5,
    escape: "4+",
    xp: 20,
    melee: { toHit: "5+", damage: 3 },
    ranged: { toHit: "3+", damage: 4 },
    abilities: [
      "Serpent's Curse – Ranged Attack: Range 8, Shots 1, Damage 4. Target must also take 2 Corruption Hits.",
      "Ritual of Scales – At the start of each Enemy Phase, all Serpent keyword enemies on the board heal 1 Wound.",
      "Venom Cloud – All Heroes within 3 spaces take -1 to all To Hit rolls.",
      "Spirit Ward – Immune to Horror Hits and Sanity Damage."
    ],
    eliteChart: [
      "Master of Venom – Serpent's Curse now causes 3 Corruption Hits instead of 2.",
      "Blood Ritual – Once per fight, sacrifice 3 Health to give all Serpent keyword enemies +2 Damage until end of turn.",
      "Ancestral Power – +1 Ranged To Hit; gains an additional Shot.",
      "Scaled Barrier – Armor 5+; Heroes adjacent take 1 Wound at end of each turn ignoring Defense.",
      "Eyes of the Serpent King – Fear (4): A Hero starting their Activation adjacent takes 4 Horror Hits.",
      "Dark Resurrection – When killed, roll a D6: on 5+, returns with D6 Health at the end of the next Enemy Phase."
    ]
  }
];

export default function Placeholder() { return null; }
