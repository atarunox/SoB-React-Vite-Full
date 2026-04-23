export const forestEnemies = [
  {
    name: "Werewolf Feral Kin",
    keywords: ["Werewolf", "Beast"],
    brutal: true,
    initiative: 11,
    Size: "Large",
    health: 24,
    defense: 0,
    move: 8,
    escape: "4+",
    xp: 5,
    xpEach: 5,
    combat: "*",
    melee: { toHit: "3+", damage: 8 },
    ranged: null,
    abilities: [
      "Fear (3) - A Hero starting their Activation adjacent automatically takes 3 Horror Hits.",
      "*Ferocious Attack - This Enemy's base Combat is equal to the Target's Hero Level.",
      "Slashing Claws - This Enemy's Combat Hits ignore Armor.",
      "Werewolf's Curse - Any Hero KO'd by a Werewolf Feral Kin must roll a D6. On the roll of 1 or 2, the Hero also gains a Curse of the Werewolf card.",
    ],
    eliteChart: [
      "Howl - In addition to their Fear, Werewolf Feral Kin gain: Terror (1) - A Hero starting their Activation on the same Map Tile automatically takes 1 Horror Hit.",
      "Lightning Speed - +2 Defense and changes targets each turn.",
      "Unflinching Rage - +12 Health.",
      "Snapping Bite - Werewolf Feral Kin To Hit rolls of 6+ do +4 damage.",
      "Unstoppable - Regeneration (D6) - At the start of each turn, this Enemy Heals D6 Wounds.",
      "Once Human - Each Werewolf Feral Kin starts with a Grit Token. Any time that model would be killed, discard the Grit and prevent all damage just taken from the source that killed it.",
    ],
  },
  {
    name: "Dire Werewolf",
    keywords: ["Beast", "Cursed"],
    initiative: 6,
    Size: "Large",
    health: 14,
    defense: 4,
    move: 7,
    escape: "3+",
    xp: 25,
    melee: { toHit: "3+", damage: 5 },
    ranged: null,
    abilities: [
      "Lycanthropic Frenzy: Gains +1 Combat for each Wound it has taken (max +3).",
      "Savage Bite: To Hit rolls of 6 cause Bleeding Marker and an additional Wound ignoring Defense.",
      "Predator's Howl: At the start of the Enemy Phase, all Heroes within 4 spaces take 2 Horror Hits.",
      "Regeneration: At the start of each Enemy turn, heals 1 Wound. Silver weapons ignore this ability."
    ],
    eliteChart: [
      "Alpha of the Pack – +3 Health; all other Beast enemies on the board gain +1 Move.",
      "Moonlit Rage – +2 Damage on the first Attack each turn.",
      "Thick Fur – Armor 5+; immune to Cold and Bleeding effects.",
      "Terrifying Presence – Heroes adjacent must pass Willpower 5+ or lose 1 Action on their next Activation.",
      "Supernatural Speed – May make a free Move of 3 spaces after Attacking.",
      "Curse of the Bite – Any Hero reduced to 0 Health by this enemy gains a Lycanthropy Mutation token."
    ]
  },
  {
    name: "Blighted Treant",
    keywords: ["Nature", "Corrupted"],
    initiative: 1,
    Size: "Large",
    health: 18,
    defense: 3,
    move: 3,
    escape: "5+",
    xp: 30,
    melee: { toHit: "4+", damage: 6 },
    ranged: null,
    abilities: [
      "Crushing Limbs: Hits knock the target back 2 spaces. If blocked by a wall or model, the Hero takes 1 additional Wound.",
      "Rooted Defense: While not adjacent to any Hero, gains +2 Defense.",
      "Bark Armor: Reduce all Damage taken by 1 (minimum 1). Immune to Bleeding.",
      "Thorn Lash: At end of the Enemy Phase, each Hero within 2 spaces takes 1 Wound ignoring Armor."
    ],
    eliteChart: [
      "Ancient Growth – +4 Health and +1 Defense.",
      "Entangling Roots – Heroes adjacent must pass Agility 5+ at the start of their Activation or lose their Move action.",
      "Corrupted Sap – Hits cause 1 Corruption Hit in addition to normal Damage.",
      "Splinter Burst – When killed, all Heroes within 3 spaces take D6 Wounds ignoring Armor.",
      "Deep Roots – Cannot be moved, pushed, or knocked back by any effect. Immune to Critical Hits.",
      "Forest's Wrath – Gains +2 Combat when 2 or more Heroes are adjacent."
    ]
  },
  {
    name: "Wailing Wisp",
    keywords: ["Spirit", "Void"],
    initiative: 7,
    Size: "Small",
    health: 4,
    defense: 3,
    move: 6,
    escape: "3+",
    xp: 15,
    melee: { toHit: "4+", damage: 3 },
    ranged: null,
    abilities: [
      "Ethereal: May move through walls, models, and terrain. Heroes must re-roll successful To Hit rolls against this enemy.",
      "Soul Drain: Each Wound dealt to a Hero also causes 1 Sanity Damage.",
      "Flickering Light: At the start of each Enemy turn, roll D6: on 5+, this enemy teleports to any space within 6 spaces.",
      "Luring Glow: Heroes within 3 spaces must pass Willpower 4+ or move 1 space toward this enemy at the start of their Activation."
    ],
    eliteChart: [
      "Phantom Swarm – When this enemy is spawned, place 1 additional Wailing Wisp.",
      "Draining Touch – Hits cause the target to discard 1 Grit on a D6 roll of 4+.",
      "Spectral Wail – All Heroes on the board take 1 Horror Hit at the start of each Enemy turn.",
      "Void Shimmer – Gains Armor 5+ against Ranged Attacks.",
      "Cursed Flame – Hits ignore Armor entirely.",
      "Binding Chill – Heroes Hit must pass Strength 5+ or be Stunned (lose 1 Action next Activation)."
    ]
  },
  {
    name: "Razorclaw Stalker",
    keywords: ["Beast", "Shadow"],
    initiative: 5,
    Size: "Medium",
    health: 8,
    defense: 4,
    move: 6,
    escape: "3+",
    xp: 20,
    melee: { toHit: "3+", damage: 4 },
    ranged: null,
    abilities: [
      "Ambush Predator: On the first turn of combat, gains +2 Combat and +2 Damage.",
      "Pounce: If this enemy moves 4 or more spaces before Attacking, gains +1 To Hit.",
      "Shadow Meld: Heroes more than 4 spaces away cannot target this enemy with Ranged Attacks.",
      "Pack Tactics: Gains +1 Damage for each other Razorclaw Stalker adjacent to the same target."
    ],
    eliteChart: [
      "Silent Hunter – +2 Initiative; this enemy always activates before Heroes in the first round.",
      "Disembowel – To Hit rolls of 6 cause D3 additional Wounds ignoring Defense.",
      "Midnight Pelt – Armor 6+; gains Armor 4+ while in darkness or shadow terrain.",
      "Crippling Strike – Heroes Hit lose 1 Move for the remainder of the fight (minimum Move 2).",
      "Feral Rage – +1 Combat and +1 Health for each Razorclaw Stalker that has been killed this fight.",
      "Relentless Pursuit – After a Hero Escapes adjacent to this enemy, it may make a free Move of 3 spaces toward that Hero."
    ]
  },
  {
    name: "Shade of the Hollow",
    keywords: ["Undead", "Spirit", "Shadow"],
    initiative: 4,
    Size: "Medium",
    health: 10,
    defense: 5,
    move: 5,
    escape: "4+",
    xp: 25,
    melee: { toHit: "4+", damage: 4 },
    ranged: null,
    abilities: [
      "Fear (4): A Hero starting their Activation adjacent takes 4 Horror Hits.",
      "Death's Embrace: Hits ignore Armor. Heroes must defend using Willpower instead of Defense.",
      "Shadow Step: After Attacking, may teleport up to 3 spaces to any unoccupied space.",
      "Life Leech: For each Wound dealt, this enemy heals 1 Wound (cannot exceed starting Health)."
    ],
    eliteChart: [
      "Ancient Revenant – +4 Health and +1 Damage.",
      "Grave Chill – Heroes adjacent take -1 to all To Hit rolls.",
      "Phantom Chains – Heroes Hit must pass Agility 4+ or be unable to move on their next Activation.",
      "Soul Harvest – Each Hero killed by this enemy heals it to full Health and grants +1 permanent Combat.",
      "Dread Aura – All Heroes within 3 spaces cannot use Grit to re-roll Defense.",
      "Undying Hatred – When reduced to 0 Health, roll D6: on 5+, returns with D6 Health at the end of the next Enemy Phase."
    ]
  }
];

export default function Placeholder() { return null; }
