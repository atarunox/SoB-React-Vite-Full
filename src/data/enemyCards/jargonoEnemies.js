export const jargonoEnemies = [
  {
    name: "Swamp Fiends",
    keywords: ["Beast", "Swamp", "OtherWorld"],
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
      "Bog Ambush: At the start of a Fight, Swamp Fiends may be placed adjacent to any Hero instead of at the entry point.",
      "Murky Hide: All Ranged Attacks against Swamp Fiends suffer -1 To Hit.",
      "Drowning Grasp: Any Hero Hit by a Swamp Fiend must pass a Strength 5+ test or lose their next Move Action.",
      "Territorial Fury: Gains +1 Combat when fighting in OtherWorld or Swamp map tiles."
    ],
    eliteChart: [
      "Festering Claws -- To Hit rolls of 6 cause a Poison token; Hero takes 1 Wound at start of each turn until removed with a Spirit 5+ test.",
      "Thick Swamp Hide -- Armor 5+; +3 Health.",
      "Camouflaged Hunter -- Heroes must re-roll successful Ranged To Hit rolls against this enemy.",
      "Mire Dweller -- +2 Move; may move through any terrain without penalty.",
      "Frenzied Lunge -- +1 Combat and +1 Damage on the first Attack each turn.",
      "Putrid Stench -- Heroes starting their Activation adjacent take 1 Horror Hit and 1 Corruption Hit."
    ]
  },
  {
    name: "Bog Zombies",
    keywords: ["Undead", "Swamp"],
    initiative: 2,
    Size: "Medium",
    health: 6,
    defense: 5,
    move: 4,
    escape: "5+",
    xp: 10,
    melee: { toHit: "5+", damage: 3 },
    ranged: null,
    abilities: [
      "Shambling Horde: For every 3 Bog Zombies on the board, all Bog Zombies gain +1 Combat.",
      "Risen from the Muck: When a Bog Zombie is killed, roll a D6: on a 5+, it returns to play with 1 Health in the same space.",
      "Grave Rot: Heroes Hit by a Bog Zombie must pass a Spirit 4+ test or gain a Poison token.",
      "Fearless Dead: Immune to all Horror and Sanity effects."
    ],
    eliteChart: [
      "Waterlogged Flesh -- Reduce all Damage taken by 1 (minimum 1).",
      "Endless Rising -- The Risen from the Muck ability now triggers on a 4+ instead of 5+.",
      "Grasping Hands -- Adjacent Heroes suffer -1 to all Escape rolls.",
      "Swamp Gas -- At the end of each Enemy turn, all Heroes within 2 spaces take 1 Wound, ignoring Defense.",
      "Bloated Corpse -- +4 Health; on death, all adjacent Heroes take D3 Wounds ignoring Armor.",
      "Relentless Advance -- +2 Move; Bog Zombies ignore Rough terrain."
    ]
  },
  {
    name: "Voodoo Shamans",
    keywords: ["Spirit", "Swamp", "OtherWorld"],
    initiative: 5,
    Size: "Medium",
    health: 8,
    defense: 3,
    move: 5,
    escape: "3+",
    xp: 25,
    melee: { toHit: "5+", damage: 2 },
    ranged: { toHit: "3+", damage: 4 },
    abilities: [
      "Spirit Bolt -- Ranged Attack: Range 6, Shots 2, Damage 4. Ignores Armor.",
      "Hex Curse: At the start of each Enemy turn, the Shaman targets the closest Hero. That Hero must pass a Spirit 5+ test or suffer -1 to all To Hit rolls until the end of the turn.",
      "Dark Ritual: While any Voodoo Shaman is on the board, all other Swamp keyword enemies gain +1 Health.",
      "Spirit Ward: The first Hit against a Voodoo Shaman each turn is automatically negated."
    ],
    eliteChart: [
      "Soul Drain -- Each Ranged Hit heals the Shaman for 1 Wound.",
      "Voodoo Doll -- Once per turn, redirect 1 Hit against the Shaman to the nearest Hero instead.",
      "Swamp Caller -- At the start of each turn, roll D6: on a 6, place 1 Bog Zombie adjacent to the Shaman.",
      "Bone Fetishes -- +2 Defense; gains Armor 6+.",
      "Ancestral Wrath -- Spirit Bolt gains +2 Damage and +1 Shot.",
      "Death Curse -- When killed, all Heroes take 2 Horror Hits and 1 Corruption Hit."
    ]
  },
  {
    name: "Giant Leeches",
    keywords: ["Beast", "Swamp", "Vermin"],
    initiative: 3,
    Size: "Small",
    health: 4,
    defense: 3,
    move: 6,
    escape: "3+",
    xp: 10,
    melee: { toHit: "4+", damage: 2 },
    ranged: null,
    abilities: [
      "Blood Drain: Each successful Hit heals the Giant Leech for 1 Wound.",
      "Latch On: If a Giant Leech Hits a Hero, it attaches. While attached, the Hero takes 1 automatic Wound at the start of each turn. The Hero may spend an Action and pass a Strength 4+ test to remove it.",
      "Slippery Body: All melee To Hit rolls against Giant Leeches suffer -1.",
      "Swarm Instinct: Gains +1 Move for each other Giant Leech within 3 spaces."
    ],
    eliteChart: [
      "Engorged -- +3 Health; gains +1 Damage for each Wound it has healed this fight.",
      "Toxic Blood -- When killed, the Hero that killed it takes 1 Corruption Hit.",
      "Razor Maw -- To Hit rolls of 6 cause Bleeding Marker in addition to normal Damage.",
      "Burrowing Parasite -- Latch On now requires Strength 5+ to remove.",
      "Swarming Tide -- +2 Move; may move through other models freely.",
      "Numbing Bite -- Heroes Hit must pass a Spirit 4+ test or lose their next Attack Action."
    ]
  },
  {
    name: "Mire Stalkers",
    keywords: ["Void", "Swamp", "Spirit"],
    initiative: 6,
    Size: "Large",
    health: 12,
    defense: 4,
    move: 5,
    escape: "4+",
    xp: 25,
    melee: { toHit: "3+", damage: 5 },
    ranged: null,
    abilities: [
      "Shadow Step: At the start of each Enemy turn, the Mire Stalker may teleport to any space within 4 spaces of its current position.",
      "Void Chill: Heroes adjacent to the Mire Stalker at the start of their Activation take 2 Horror Hits.",
      "Phantasmal: Immune to Critical Hits. All Ranged Attacks against the Mire Stalker have -1 Damage (minimum 1).",
      "Predator's Mark: At the start of the Fight, the Mire Stalker marks the Hero with the lowest Health. It gains +2 Combat against that Hero."
    ],
    eliteChart: [
      "Void Hunger -- Each successful Hit also causes 1 Corruption Hit.",
      "Between Worlds -- Once per turn, may ignore all Damage from a single Attack by phasing out of existence.",
      "Soul Reaver -- When it kills or KOs a Hero, the Mire Stalker heals D6 Wounds and gains +1 Damage for the rest of the fight.",
      "Creeping Dread -- All Heroes within 3 spaces suffer -1 Initiative.",
      "Mist Form -- +2 Move; may move through walls and terrain as if not there.",
      "Abyssal Roar -- Once per fight, all Heroes must pass a Spirit 5+ test or be Stunned (lose next Action)."
    ]
  }
];

export default function Placeholder() { return null; }
