export const trederraEnemies = [
  {
    name: "Void Troopers",
    keywords: ["Void", "Tech", "OtherWorld"],
    initiative: 4,
    Size: "Medium",
    health: 8,
    defense: 4,
    move: 5,
    escape: "4+",
    xp: 25,
    melee: { toHit: "4+", damage: 3 },
    ranged: { toHit: "4+", damage: 4 },
    abilities: [
      "Void Rifles – Ranged Attack: Range 10, Shots 2, Damage 4.",
      "Tactical Formation – Gains +1 Defense for each other Void Trooper within 2 spaces (max +2).",
      "Dark Stone Ammo – Ranged Hits of 6 cause 1 Corruption Hit in addition to Damage.",
      "Suppressive Fire – At Initiative 1, if not adjacent to a Hero, each Hero in Range must pass Agility 5+ or lose 1 Move next turn."
    ],
    eliteChart: [
      "Hardened Plating – Armor 5+; +2 Health.",
      "Squad Leader – All Void Troopers on the board gain +1 Shot.",
      "Phase Rounds – Ranged Attacks ignore Armor.",
      "Entrenched – While not adjacent to any Hero, gains +2 Defense.",
      "Overcharge Cells – +1 Ranged Damage; on a To Hit roll of 1, this enemy takes 1 Wound.",
      "Kill Protocol – Re-roll all failed Ranged To Hit rolls against the Hero with the lowest Health."
    ]
  },
  {
    name: "Mutant War Beast",
    keywords: ["Mutant", "Beast", "OtherWorld"],
    initiative: 3,
    Size: "Large",
    health: 14,
    defense: 4,
    move: 6,
    escape: "4+",
    xp: 30,
    melee: { toHit: "3+", damage: 5 },
    ranged: null,
    abilities: [
      "Savage Charge – If this enemy moves 3 or more spaces before Attacking, gains +2 Damage on its first Hit.",
      "Armored Hide – Reduce all Damage taken by 1 (minimum 1).",
      "Feral Rage – Gains +1 Combat for each Wound it has taken (max +3).",
      "Terrifying Howl – At start of its Activation, all Heroes within 3 spaces take 2 Horror Hits."
    ],
    eliteChart: [
      "Alpha Predator – +2 Health, +1 Combat, +1 Damage.",
      "Void-Touched Claws – To Hit rolls of 6 cause 1 Corruption Hit in addition to Damage.",
      "Berserk Frenzy – When reduced to half Health or below, gains +2 Combat and +1 Move.",
      "Toxic Blood – When this enemy takes a Wound from a Melee Attack, the attacker takes 1 Wound ignoring Defense.",
      "Thick Scales – Armor 5+; immune to Critical Hits from Ranged Attacks.",
      "Pack Alpha – All Beast keyword enemies on the board gain +1 Damage while this enemy is alive."
    ]
  },
  {
    name: "Corrupted Legionnaires",
    keywords: ["Mutant", "Void", "Tech"],
    initiative: 5,
    Size: "Medium",
    health: 7,
    defense: 5,
    move: 5,
    escape: "4+",
    xp: 20,
    melee: { toHit: "4+", damage: 4 },
    ranged: { toHit: "5+", damage: 3 },
    abilities: [
      "Corroded Blasters – Ranged Attack: Range 6, Shots 1, Damage 3. Hits cause a Corroded Marker; Hero with a Corroded Marker has -1 Defense.",
      "Dark Stone Fused – Immune to Corruption Hits; gains +1 Damage while in an OtherWorld.",
      "Broken Discipline – At start of each turn, roll a D6: on 1-2, this enemy does not make a Ranged Attack this turn but gains +2 Melee Damage."
    ],
    eliteChart: [
      "Veteran Survivors – +3 Health; +1 Defense.",
      "Void Bayonets – May make both a Ranged Attack and a Melee Attack in the same Activation.",
      "Corroded Shells – Ranged Hits ignore Armor.",
      "Fanatical Loyalty – While another Corrupted Legionnaire is on the board, re-roll failed Escape rolls.",
      "Dark Stone Overload – On death, all Heroes within 2 spaces take D3 Corruption Hits.",
      "War-Scarred – Reduce all Damage taken by 1 (minimum 1); +1 Health."
    ]
  },
  {
    name: "Dark Stone Construct",
    keywords: ["Tech", "Void", "OtherWorld"],
    initiative: 2,
    Size: "Large",
    health: 18,
    defense: 3,
    move: 3,
    escape: "5+",
    xp: 35,
    melee: { toHit: "3+", damage: 6 },
    ranged: { toHit: "4+", damage: 5 },
    abilities: [
      "Void Cannon – Ranged Attack: Range 8, Shots 1, Damage 5. Target and all models adjacent to the target take Damage.",
      "Reinforced Chassis – Armor 4+; immune to Critical Hits.",
      "Grinding Treads – Any model this enemy moves through takes 2 Wounds ignoring Defense.",
      "Power Core – When destroyed, roll a D6: on 5-6, explodes dealing D6 Wounds to all models within 2 spaces, ignoring Defense."
    ],
    eliteChart: [
      "Siege Mode – +2 Ranged Damage; cannot Move this turn when using Siege Mode.",
      "Adaptive Plating – After taking Damage from a specific Damage type, gains +2 Defense against that type for the rest of the fight.",
      "Overcharged Core – +4 Health; Void Cannon gains +1 Shot.",
      "Targeting Array – Re-roll 1 failed Ranged To Hit roll per turn.",
      "Dark Stone Regeneration – At the start of each turn, heals 2 Wounds.",
      "Annihilation Protocol – At half Health or below, gains +1 Combat, +1 Damage, and +1 Move."
    ]
  },
  {
    name: "Void Rift Spawn",
    keywords: ["Void", "OtherWorld", "Demon"],
    initiative: 6,
    Size: "Medium",
    health: 6,
    defense: 3,
    move: 7,
    escape: "3+",
    xp: 20,
    melee: { toHit: "4+", damage: 3 },
    ranged: null,
    abilities: [
      "Phase Shift – May move through walls, models, and terrain as if not there.",
      "Void Drain – Each Hit causes 1 Corruption Hit in addition to Damage.",
      "Unstable Form – At the end of each turn, roll a D6: on 1, this enemy is removed from the board; on 6, place a new Void Rift Spawn adjacent to this one.",
      "Reality Tear – Heroes adjacent to this enemy cannot use Grit abilities."
    ],
    eliteChart: [
      "Flickering Presence – All To Hit rolls against this enemy are at -1.",
      "Void Surge – +2 Move; +1 Initiative.",
      "Entropic Touch – Hits destroy 1 piece of the target Hero's Gear (Hero's choice) on a To Hit roll of 6.",
      "Rift Echo – When this enemy is destroyed, place a new Void Rift Spawn in the same space on a roll of 4+ on D6.",
      "Maddening Whispers – At start of its Activation, all Heroes within 2 spaces take 2 Horror Hits.",
      "Dark Collapse – On death, all adjacent Heroes take D3 Wounds and D3 Corruption Hits ignoring Defense."
    ]
  }
];
export default function Placeholder() { return null; }
