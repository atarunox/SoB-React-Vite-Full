export const frontierEnemies = [
  {
    name: "Frontier Bandits",
    keywords: ["Human", "Outlaw"],
    initiative: 5,
    Size: "Medium",
    health: 5,
    defense: 4,
    move: 5,
    escape: "4+",
    xp: 20,
    melee: { toHit: "4+", damage: 3 },
    ranged: { toHit: "4+", damage: 3 },
    abilities: [
      "Six-Shooters – Ranged Attack: Range 8, Shots 2, Damage 3.",
      "Stick 'Em Up – At the start of the fight, each Hero must discard 1 Gold or 1 random Side Bag item. If a Hero cannot, they take 2 Wounds.",
      "Take Cover – While adjacent to a wall or terrain feature, this enemy gains Cover 4+ against Ranged Attacks.",
      "Outlaw Gang – Gains +1 Combat for every 2 other Frontier Bandits on the board (max +3)."
    ],
    eliteChart: [
      "Wanted Men – +2 Health; gains +1 To Hit against Heroes with the Law keyword.",
      "Dual Pistols – Six-Shooters gain +2 Shots; -1 To Hit on all Ranged Attacks.",
      "Bandit Leader – All Frontier Bandits within 3 spaces gain +1 Defense and +1 Initiative.",
      "Dirty Fighters – To Hit rolls of 6 on Melee Attacks cause Stun; the Hero loses their next Attack.",
      "Dynamite – Once per fight, may make a Ranged Attack: Range 5, all models within 2 spaces of target take D6 Wounds ignoring Cover.",
      "Slippery Scoundrels – When this enemy would be killed, roll a D6: on 5+, it escapes with 1 Health remaining and moves D6 spaces away."
    ]
  },
  {
    name: "Feral Wolves",
    keywords: ["Beast"],
    initiative: 6,
    Size: "Medium",
    health: 5,
    defense: 4,
    move: 7,
    escape: "3+",
    xp: 15,
    melee: { toHit: "4+", damage: 3 },
    ranged: null,
    abilities: [
      "Pack Tactics – Gains +1 To Hit and +1 Damage for each other Feral Wolf adjacent to the same target.",
      "Pounce – If this enemy moves 3 or more spaces in a straight line before Attacking, it gains +2 Damage on the first Hit.",
      "Savage Bite – To Hit rolls of 6 cause Bleeding Marker; the Hero takes 1 additional Wound at the end of each of their Activations until healed.",
      "Keen Senses – Heroes cannot use Stealth or Ambush abilities against this enemy. This enemy always targets the Hero with the lowest current Health."
    ],
    eliteChart: [
      "Alpha Wolf – +3 Health, +1 Combat. All other Feral Wolves on the board gain +1 Move.",
      "Rabid Frenzy – +2 Damage; at the end of each turn, this enemy takes 1 Wound (cannot be reduced).",
      "Thick Fur – Armor 6+; reduce all Ranged Damage taken by 1 (minimum 1).",
      "Blood Scent – If any Hero on the board has a Bleeding Marker, all Feral Wolves gain +2 Move and +1 To Hit.",
      "Howl of the Pack – Once per fight at the start of the Enemy Phase, all Heroes must pass Willpower 4+ or become Stunned.",
      "Relentless Pursuit – This enemy may make a free Move of up to 3 spaces at the end of the Hero Phase if not adjacent to any Hero."
    ]
  },
  {
    name: "Rattlesnake Swarms",
    keywords: ["Beast", "Vermin"],
    initiative: 4,
    Size: "Small",
    health: 4,
    defense: 3,
    move: 4,
    escape: "3+",
    xp: 15,
    melee: { toHit: "5+", damage: 2 },
    ranged: null,
    abilities: [
      "Venomous Fangs – Each Hit that causes a Wound also inflicts a Poison Marker. At the end of each turn, a Hero with a Poison Marker takes 1 Wound ignoring Defense. A Hero may spend 1 Grit to remove a Poison Marker.",
      "Rattling Warning – At the start of this enemy's Activation, all Heroes within 2 spaces take 1 Horror Hit.",
      "Slithering Mass – This enemy treats all terrain as open ground. May move through spaces occupied by other models.",
      "Hard to Hit – All Ranged Attacks against this enemy suffer -1 To Hit due to its small, scattered profile."
    ],
    eliteChart: [
      "Diamondback Kings – +2 Health; Venomous Fangs cause 2 Wounds per Poison Marker instead of 1.",
      "Coiled Strike – Gains +2 To Hit on the first Attack each Activation.",
      "Nest Swarm – When this enemy is killed, place 2 Rattlesnake Swarm tokens in adjacent spaces. Each token acts as a new enemy with Health 2 and Damage 1.",
      "Paralyzing Venom – Heroes with a Poison Marker suffer -1 to all To Hit rolls and -1 Move.",
      "Camouflage – Gains Cover 5+ at all times; Heroes must pass Awareness 4+ at the start of each turn or this enemy cannot be targeted by Ranged Attacks.",
      "Death Rattle – When this enemy is killed, all adjacent Heroes must pass Agility 4+ or take D3 Wounds from a final strike."
    ]
  },
  {
    name: "Dark Stone Prospectors",
    keywords: ["Human", "Mutant"],
    initiative: 3,
    Size: "Medium",
    health: 8,
    defense: 5,
    move: 4,
    escape: "4+",
    xp: 30,
    melee: { toHit: "3+", damage: 4 },
    ranged: null,
    abilities: [
      "Dark Stone Madness – At the start of each Enemy Phase, roll a D6. On a 1, this enemy attacks the nearest model (Hero or Enemy). On 2-6, it acts normally.",
      "Pickaxe Fury – This enemy makes 2 Melee Attacks per Activation instead of 1.",
      "Corrupted Flesh – This enemy is immune to Corruption Hits. Any Corruption Hits that would affect it instead heal 1 Wound.",
      "Unstable Aura – At the end of each turn, all Heroes within 2 spaces take 1 Corruption Hit."
    ],
    eliteChart: [
      "Motherlode Mutation – +4 Health; gains +1 Damage for each Dark Stone token held by adjacent Heroes.",
      "Dark Stone Shards – Melee Attacks gain: To Hit rolls of 5 or 6 cause 1 Corruption Hit in addition to normal Damage.",
      "Crazed Strength – +2 Damage on all Melee Attacks; this enemy always targets the Hero with the most Dark Stone.",
      "Glowing Veins – Gains Armor 5+; when the Armor save succeeds, the attacking Hero takes 1 Corruption Hit.",
      "Tunnel Rat – May move through walls; gains +2 Move when moving toward a Hero carrying Dark Stone.",
      "Final Detonation – When this enemy is killed, all models within 3 spaces take D6 Wounds ignoring Armor as the Dark Stone in its body explodes."
    ]
  },
  {
    name: "Phantom Riders",
    keywords: ["Undead", "Outlaw"],
    initiative: 5,
    Size: "Large",
    health: 9,
    defense: 4,
    move: 8,
    escape: "3+",
    xp: 40,
    melee: { toHit: "3+", damage: 5 },
    ranged: { toHit: "4+", damage: 3 },
    abilities: [
      "Ghostly Revolvers – Ranged Attack: Range 10, Shots 3, Damage 3. These attacks ignore Cover.",
      "Spectral Charge – If this enemy moves 4 or more spaces before Attacking in Melee, it gains +3 Damage and the target must pass Strength 5+ or be knocked back 2 spaces.",
      "Fear (3): A Hero starting their Activation adjacent takes 3 Horror Hits.",
      "Ethereal Mount – This enemy may move through walls, terrain, and other models freely. It does not trigger any effects from moving through spaces."
    ],
    eliteChart: [
      "Headless Horseman – +4 Health; Fear increases to (5). Heroes that fail their Willpower check also lose 1 Grit.",
      "Hellfire Revolvers – Ghostly Revolvers gain +1 Shot and +1 Damage; To Hit rolls of 6 cause the target to catch Hellfire (take 1 Wound at the start of each turn until a 4+ is rolled).",
      "Phantom Stampede – Once per fight, at the start of the Enemy Phase, all Phantom Riders may make a free Move and Attack before normal Activations.",
      "Death's Lasso – Ranged Attack: Range 6, Shots 1. Instead of Damage, the target Hero is pulled adjacent to this enemy and cannot move during their next Activation.",
      "Ghostly Resilience – This enemy may only take a maximum of 3 Wounds per Attack. Any excess Wounds are negated.",
      "Riders of the Damned – While 2 or more Phantom Riders are on the board, all Undead enemies gain +1 Move and +1 Initiative."
    ]
  }
];

export default function Placeholder() { return null; }
