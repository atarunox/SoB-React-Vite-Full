export const fortressEnemies = [
  {
    name: "Oni Ravager",
    keywords: ["Demon", "OtherWorld"],
    initiative: 3,
    Size: "Large",
    health: 16,
    defense: 4,
    move: 5,
    escape: "4+",
    xp: 30,
    melee: { toHit: "3+", damage: 6 },
    ranged: null,
    abilities: [
      "Kanabo Strike: Hits knock the target back 2 spaces. If the Hero is knocked into a wall or another model, they take 2 additional Wounds.",
      "Demon Fury: Gains +1 Combat for each Wound marker on this enemy (max +3).",
      "Terrifying Visage: At the start of the Enemy Phase, all Heroes within 3 spaces take 2 Horror Hits.",
      "Thick Hide: Reduce all Damage taken by 1 (minimum 1)."
    ],
    eliteChart: [
      "Iron Kanabo – +2 Damage; Hits destroy 1 piece of the target's equipped Gear on a D6 roll of 6.",
      "Warlord's Rage – +4 Health and +1 Combat.",
      "Blood Frenzy – May make 1 additional Attack against an adjacent Hero after killing a target.",
      "Demon's Resilience – Armor 5+; immune to Bleeding and Poison effects.",
      "Ground Slam – Once per turn, instead of a normal Attack, all Heroes within 2 spaces must pass Agility 4+ or take D6 Wounds.",
      "Oni Lord – All other Demon enemies on the board gain +1 Damage while this enemy is alive."
    ]
  },
  {
    name: "Takobake",
    keywords: ["Demon", "Beast", "OtherWorld"],
    initiative: 4,
    Size: "Large",
    health: 12,
    defense: 4,
    move: 5,
    escape: "4+",
    xp: 20,
    melee: { toHit: "4+", damage: 4 },
    ranged: null,
    abilities: [
      "Grasping Tentacles: May Attack up to 2 different adjacent Heroes each turn, splitting Combat dice between them.",
      "Constrict: Heroes Hit must pass Strength 5+ or be Grappled. Grappled Heroes cannot Move and take -1 to all To Hit rolls.",
      "Ink Cloud: Once per fight, all Heroes within 3 spaces must re-roll successful To Hit rolls until end of next turn.",
      "Slippery Body: May disengage and move freely without triggering Escape rolls from adjacent Heroes."
    ],
    eliteChart: [
      "Monstrous Growth – +4 Health and +1 Combat.",
      "Venomous Suckers – Hits cause 1 Poison token. Heroes with 3+ Poison tokens take 1 Wound at the start of each Activation.",
      "Regenerating Limbs – Heals 2 Wounds at the start of each Enemy turn.",
      "Crushing Grip – Grappled Heroes take 2 automatic Wounds at the start of each Enemy Phase, ignoring Defense.",
      "Camouflage – Cannot be targeted by Ranged Attacks until it has been Hit at least once.",
      "Thrashing Fury – When reduced to half Health or below, gains +2 Combat and +1 Damage."
    ]
  },
  {
    name: "Harionago",
    keywords: ["Undead", "Spirit", "Void"],
    initiative: 5,
    Size: "Medium",
    health: 10,
    defense: 5,
    move: 6,
    escape: "3+",
    xp: 25,
    melee: { toHit: "3+", damage: 4 },
    ranged: null,
    abilities: [
      "Barbed Hair: May Attack targets up to 3 spaces away. Hits cause Bleeding Marker.",
      "Haunting Laughter: At the start of the Enemy Phase, all Heroes on the board must pass Willpower 4+ or take 2 Sanity Damage.",
      "Ethereal Grace: May move through walls and models. Heroes must re-roll 6s on To Hit rolls against this enemy.",
      "Life Drain: For each Wound dealt, the attacking Hero loses 1 Grit (minimum 0)."
    ],
    eliteChart: [
      "Vengeful Spirit – +2 Health; gains +1 Damage against Heroes with Bleeding Markers.",
      "Hair Snare – Heroes Hit at range must pass Agility 4+ or be pulled adjacent to this enemy.",
      "Wailing Shriek – Once per fight, all Heroes take D3 Horror Hits and must discard 1 Grit.",
      "Ghostly Form – Armor 5+ against all Attacks. Immune to Critical Hits from non-magical weapons.",
      "Cursed Beauty – Heroes adjacent must pass Willpower 5+ at the start of their Activation or forfeit their Attack action.",
      "Undying Grudge – When killed, roll D6: on 4+, returns with half Health (rounded up) in a random adjacent space."
    ]
  },
  {
    name: "Fallen Samurai",
    keywords: ["Undead", "Spirit"],
    initiative: 5,
    Size: "Medium",
    health: 9,
    defense: 4,
    move: 5,
    escape: "4+",
    xp: 20,
    melee: { toHit: "3+", damage: 5 },
    ranged: null,
    abilities: [
      "Katana Mastery: To Hit rolls of 6 cause double Damage.",
      "Spectral Armor: Armor 5+. Non-magical Ranged Attacks suffer -1 To Hit against this enemy.",
      "Bushido Code: Always moves toward and targets the Hero with the highest Combat value.",
      "Death Before Dishonor: When reduced to 0 Health, makes one final Melee Attack against an adjacent Hero before being removed."
    ],
    eliteChart: [
      "Blade of the Ancestors – +1 Damage; Hits ignore 1 point of the target's Armor.",
      "Unyielding Will – +3 Health; immune to Horror Hits and Sanity Damage.",
      "Iaijutsu Strike – On the first round of combat, gains +2 Combat and +1 To Hit.",
      "Phantom Guard – +1 Defense; adjacent allied Undead enemies also gain +1 Defense.",
      "Relentless Swordsman – May re-roll 1 missed To Hit roll each turn.",
      "Honorbound Fury – Gains +1 Combat and +1 Damage for each Fallen Samurai that has been killed this fight."
    ]
  },
  {
    name: "Kitsune Trickster",
    keywords: ["Demon", "Spirit", "Void"],
    initiative: 7,
    Size: "Medium",
    health: 8,
    defense: 5,
    move: 7,
    escape: "2+",
    xp: 25,
    melee: { toHit: "4+", damage: 3 },
    ranged: null,
    abilities: [
      "Foxfire: At the end of the Enemy Phase, each Hero within 3 spaces takes 1 Wound and 1 Corruption Hit.",
      "Shapeshifter: At the start of each Enemy turn, roll D6: on 4+, swap this enemy's position with any Hero within 6 spaces.",
      "Illusion: Heroes targeting this enemy must roll D6 before attacking: on 1-2, the Attack targets a random adjacent Hero instead.",
      "Elusive: This enemy may not be targeted if there is another enemy model adjacent to the attacking Hero."
    ],
    eliteChart: [
      "Nine Tails – +2 Health; gains +1 Combat for each tail (starts with D3+1 tail tokens, max 4).",
      "Bewitching Gaze – Heroes within 2 spaces cannot use Grit abilities until end of turn.",
      "Spirit Flames – Foxfire damage increases to 2 Wounds and 2 Corruption Hits.",
      "Vanishing Act – Once per fight, when Hit, may negate all Damage and teleport to any unoccupied space on the board.",
      "Curse of Confusion – Heroes Hit must pass Willpower 5+ or Attack a random adjacent Hero on their next Activation.",
      "Ancient Yokai – +1 Defense and +1 Initiative. Immune to all effects that reduce Move or Initiative."
    ]
  }
];

export default function Placeholder() { return null; }
