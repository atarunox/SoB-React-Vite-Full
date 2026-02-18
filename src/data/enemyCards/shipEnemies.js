
export const shipEnemies = [
  {
    name: "Alien Drones",
    keywords: ["Alien", "Tech"],
    initiative: 5,
    Size: "Small",
    health: 4,
    defense: 4,
    move: 6,
    escape: "3+",
    xp: 10,
    melee: { toHit: "5+", damage: 2 },
    ranged: { toHit: "4+", damage: 3 },
    abilities: [
      "Targeting Array – Ranged Attack: Range 6, Shots 2, Damage 3. Re-roll 1 missed Ranged To Hit roll per turn.",
      "Hover Flight – May ignore all terrain and models while moving.",
      "Networked Swarm – Gains +1 Shot for each other Alien Drone within 3 spaces (max +3).",
      "Self-Destruct Protocol – When killed, roll a D6: on 5+, all adjacent models take D3 Wounds ignoring Defense."
    ],
    eliteChart: [
      "Reinforced Plating – Armor 5+.",
      "Overcharged Capacitor – +1 Ranged Damage and +1 Range.",
      "Evasion Thrusters – Heroes must re-roll successful Ranged To Hit rolls against this enemy.",
      "Disruption Pulse – At start of Activation, each Hero within 3 spaces loses 1 Grit on a D6 roll of 5+.",
      "Adaptive Shielding – After taking Damage from a weapon type, gain +1 Defense vs that type for the rest of the fight.",
      "Swarm Override – All Alien Drones on the board gain +1 Move and +1 Initiative."
    ]
  },
  {
    name: "Parasitic Stalkers",
    keywords: ["Alien", "Vermin", "OtherWorld"],
    initiative: 4,
    Size: "Medium",
    health: 6,
    defense: 4,
    move: 6,
    escape: "4+",
    xp: 15,
    melee: { toHit: "4+", damage: 4 },
    ranged: null,
    abilities: [
      "Latch On – On a To Hit roll of 6, attaches to the target Hero. While attached, the Hero takes 1 automatic Wound at the start of each turn, ignoring Defense. Hero may spend 1 Action and pass Strength 5+ to remove.",
      "Pheromone Trail – After Hitting a Hero, all other Parasitic Stalkers within 6 spaces gain +2 Move toward that Hero on their next Activation.",
      "Wall Crawler – May move along walls and ceilings, ignoring terrain and elevation.",
      "Ambush Predator – If it begins its Activation out of Line of Sight of all Heroes, gains +2 Combat on its first Attack this turn."
    ],
    eliteChart: [
      "Barbed Hooks – Removing a Latched Parasitic Stalker causes D3 additional Wounds.",
      "Brood Mother – When killed, spawn 1 Parasitic Stalker with 3 Health in an adjacent space.",
      "Toxic Ichor – Heroes that kill this enemy in Melee take 1 Corruption Hit.",
      "Shadow Blend – While not adjacent to any Hero, gains Cover 4+.",
      "Frenzy Pheromones – All Parasitic Stalkers gain +1 Damage while any Hero has one Latched On.",
      "Acid Blood – Reduce all Melee Damage dealt to this enemy by 1 (minimum 1); attacker takes 1 Wound on Critical Hit."
    ]
  },
  {
    name: "Corrupted Crew",
    keywords: ["Void", "Undead", "Tech"],
    initiative: 3,
    Size: "Medium",
    health: 8,
    defense: 4,
    move: 4,
    escape: "4+",
    xp: 15,
    melee: { toHit: "4+", damage: 4 },
    ranged: { toHit: "5+", damage: 3 },
    abilities: [
      "Jury-Rigged Weapons – Ranged Attack: Range 5, Shots 1, Damage 3. On a To Hit roll of 1, the weapon jams and cannot be used for the rest of the fight.",
      "Void Madness – At the start of each Enemy Phase, roll a D6: on 1-2, the Corrupted Crew attacks the nearest model (friend or foe).",
      "Shambling Resilience – Immune to Horror Hits. Reduce all Damage from Ranged Attacks by 1 (minimum 1).",
      "Dead Man's Grip – When killed, the attacking Hero must pass Agility 4+ or be Snared for 1 turn."
    ],
    eliteChart: [
      "Void-Touched – +2 Health, +1 Combat. All Hits cause 1 additional Corruption Hit.",
      "Makeshift Armor – Armor 5+; loses this Armor if hit by an Attack that deals 4+ Damage in a single Hit.",
      "Haunted Vessel – At end of each turn, each Hero within 2 spaces takes 1 Horror Hit.",
      "Emergency Protocols – When reduced to half Health or below, gains +1 Defense and +1 Damage.",
      "Crew Quarters Ambush – At the start of the fight, may deploy within 3 spaces of any doorway instead of normal placement.",
      "Last Transmission – When killed, all other Corrupted Crew on the board gain +1 Combat and +1 Move for the remainder of the fight."
    ]
  },
  {
    name: "Security Automatons",
    keywords: ["Tech", "Construct"],
    initiative: 2,
    Size: "Large",
    health: 14,
    defense: 3,
    move: 4,
    escape: "5+",
    xp: 25,
    melee: { toHit: "3+", damage: 5 },
    ranged: { toHit: "3+", damage: 4 },
    abilities: [
      "Integrated Weapons Platform – Ranged Attack: Range 8, Shots 3, Damage 4. May make a Ranged Attack and a Melee Attack in the same Activation.",
      "Heavy Armor Plating – Armor 4+. Immune to Critical Hits.",
      "Threat Assessment – Always targets the Hero with the highest current Health.",
      "Lockdown Protocol – Once per fight, at the start of its Activation, all doors within 6 spaces are sealed. Heroes must pass Strength 5+ to open sealed doors."
    ],
    eliteChart: [
      "Overclocked Servos – +2 Move, +1 Initiative.",
      "Riot Suppression – All Ranged Attacks gain Blast: each model adjacent to the target takes 2 Wounds, ignoring Armor.",
      "Ablative Shielding – The first 3 Wounds dealt to this enemy each fight are ignored.",
      "Combat Subroutine – +1 Combat and may re-roll 1 Melee To Hit roll per turn.",
      "Emergency Repair – At the start of each Enemy Phase, heals 1 Wound on a D6 roll of 5+.",
      "Termination Directive – +2 Damage vs Heroes at half Health or below."
    ]
  },
  {
    name: "Void Spawn",
    keywords: ["Void", "OtherWorld", "Alien"],
    initiative: 6,
    Size: "Large",
    health: 16,
    defense: 3,
    move: 5,
    escape: "5+",
    xp: 30,
    melee: { toHit: "3+", damage: 5 },
    ranged: null,
    abilities: [
      "Phasing Horror – May move through walls and models. Heroes adjacent at the end of its Move take 1 Horror Hit.",
      "Void Tendrils – Attacks all adjacent Heroes simultaneously. Each Hero rolls Defense separately.",
      "Reality Tear – At the start of each Enemy Phase, place a Void Rift marker in its space. Any Hero that moves through or starts their turn on a Void Rift takes D3 Corruption Hits.",
      "Unstable Form – When this enemy takes 4+ Wounds from a single Attack, it immediately teleports to any unoccupied space within 6 spaces."
    ],
    eliteChart: [
      "Dimensional Anchor – Heroes within 3 spaces cannot use items or abilities that allow teleportation or free movement.",
      "Consuming Darkness – +2 Damage. On a To Hit roll of 6, the target Hero loses 1 Grit in addition to Damage.",
      "Warp Regeneration – At the start of each Enemy Phase, heals D3 Wounds.",
      "Nightmare Aura – All Heroes within 3 spaces suffer -1 to all To Hit rolls.",
      "Void Eruption – On death, all models within 3 spaces take D6 Wounds ignoring Defense and 2 Corruption Hits.",
      "Phase Lock – Once per fight, at the start of its Activation, choose 1 Hero within 6 spaces. That Hero is pulled adjacent and cannot move during their next Activation."
    ]
  }
];

export default function Placeholder() { return null; }
