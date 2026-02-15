
export const bellyEnemies = [
  {
    name: "Gut Parasites",
    keywords: ["Beast", "Vermin", "Organic"],
    initiative: 5,
    Size: "Small",
    health: 3,
    defense: 5,
    move: 7,
    escape: "3+",
    xp: 10,
    melee: { toHit: "5+", damage: 2 },
    ranged: null,
    abilities: [
      "Burrowing Infestation – On a To Hit roll of 6, the Parasite burrows into the Hero. The Hero takes 1 automatic Wound at the start of each of their Activations until they spend 1 Action and pass Strength 5+ to remove it.",
      "Squirming Mass – Gains +1 Combat for each other Gut Parasite adjacent to the same target (max +3).",
      "Slippery Bodies – All To Hit rolls against Gut Parasites suffer -1 (minimum 6+).",
      "Feed Frenzy – If a Hero is at half Health or below, all Gut Parasites gain +2 Move toward that Hero."
    ],
    eliteChart: [
      "Toxic Bile – Each Hit causes 1 additional Corruption Hit.",
      "Rapid Spawning – When killed, roll a D6: on 5+, spawn 1 Gut Parasite with 2 Health in an adjacent space.",
      "Numbing Secretion – Heroes with a Burrowed Parasite suffer -1 to all To Hit rolls.",
      "Blood Gorged – +1 Health and +1 Damage for each Wound this enemy has dealt this fight (max +3 each).",
      "Thick Mucus – Armor 6+. Immune to Fire damage.",
      "Swarming Tide – All Gut Parasites on the board gain +1 Move and +1 Initiative."
    ]
  },
  {
    name: "Acidic Amoebas",
    keywords: ["Organic", "OtherWorld"],
    initiative: 2,
    Size: "Medium",
    health: 8,
    defense: 5,
    move: 3,
    escape: "3+",
    xp: 15,
    melee: { toHit: "4+", damage: 4 },
    ranged: null,
    abilities: [
      "Corrosive Touch – All Hits ignore Armor. Melee weapons used against this enemy have their Damage reduced by 1 (minimum 1) for the remainder of the fight.",
      "Amorphous Body – Immune to Critical Hits. May move through spaces occupied by other models.",
      "Acid Pool – At the end of each Enemy Phase, place an Acid marker in its space. Any Hero that moves through or starts their turn on an Acid marker takes D3 Wounds ignoring Defense.",
      "Absorb – When this enemy kills a model, it heals D6 Wounds and gains +1 to its maximum Health."
    ],
    eliteChart: [
      "Volatile Compound – On death, all models within 2 spaces take D6 Wounds ignoring Armor.",
      "Hardened Membrane – Gains Armor 5+; loses it when reduced to half Health.",
      "Splitting Mass – When reduced to half Health, split into 2 Acidic Amoebas, each with half the remaining Health (round up).",
      "Digestive Enzyme – +2 Damage vs Heroes wearing Heavy Armor.",
      "Creeping Expansion – Gains +1 Move for each Acid marker currently on the board (max +3).",
      "Caustic Fog – All Heroes within 2 spaces take 1 Wound at the start of each Enemy Phase, ignoring Defense."
    ]
  },
  {
    name: "Nerve Clusters",
    keywords: ["Beast", "Organic", "Void"],
    initiative: 1,
    Size: "Large",
    health: 12,
    defense: 4,
    move: 0,
    escape: "4+",
    xp: 20,
    melee: { toHit: "4+", damage: 3 },
    ranged: { toHit: "4+", damage: 3 },
    abilities: [
      "Psychic Shock – Ranged Attack: Range 6, Shots 2, Damage 3. This Attack targets Willpower instead of Defense.",
      "Stationary – Cannot Move. All enemies within 6 spaces gain +1 Initiative while this enemy is alive.",
      "Neural Feedback – When a Hero within 3 spaces uses Grit, roll a D6: on 4+, that Hero takes 2 Horror Hits.",
      "Synapse Web – At the start of each Enemy Phase, choose 1 enemy model within 6 spaces. That model heals D3 Wounds."
    ],
    eliteChart: [
      "Overwhelming Signal – Psychic Shock gains +1 Shot and +1 Damage.",
      "Pain Relay – When this enemy takes Damage, all Heroes within 3 spaces take 1 Horror Hit.",
      "Hardened Node – +4 Health and Armor 5+.",
      "Domination Pulse – Once per fight, at the start of the Enemy Phase, each Hero within 6 spaces must pass Willpower 5+ or lose their next Action.",
      "Regenerative Core – At the start of each Enemy Phase, heals 2 Wounds.",
      "Cascade Failure – On death, all enemy models on the board take D3 Wounds and lose their Synapse Web bonus. All Heroes within 3 spaces take 2 Corruption Hits."
    ]
  },
  {
    name: "Blood Worms",
    keywords: ["Beast", "Vermin"],
    initiative: 4,
    Size: "Medium",
    health: 6,
    defense: 4,
    move: 5,
    escape: "4+",
    xp: 15,
    melee: { toHit: "4+", damage: 3 },
    ranged: null,
    abilities: [
      "Bloodletting Bite – To Hit rolls of 5+ cause a Bleeding marker on the target Hero. A Hero with a Bleeding marker takes 1 Wound at the start of each of their Activations until they spend 1 Action to stop the bleeding.",
      "Tunneling – May move through walls and terrain as if not there.",
      "Blood Scent – Gains +2 Move toward any Hero that currently has a Bleeding marker.",
      "Constrict – If adjacent to a Hero at the end of its Move, that Hero must pass Strength 4+ or be Grappled. A Grappled Hero cannot Move and suffers -1 Combat until freed (spend 1 Action, pass Strength 5+)."
    ],
    eliteChart: [
      "Engorged – +2 Health, +1 Damage. Gains Armor 6+ while any Hero has a Bleeding marker.",
      "Hemorrhagic Venom – Bleeding markers now cause 2 Wounds instead of 1 at the start of Hero Activation.",
      "Subterranean Ambush – At the start of the fight, may be placed adjacent to any Hero instead of normal deployment.",
      "Writhing Coils – +1 Combat. Heroes Grappled by this enemy suffer -1 to all To Hit rolls.",
      "Blood Leech – Each Wound dealt by this enemy heals 1 Wound on it (may not exceed max Health).",
      "Nest Burrower – When killed, roll a D6: on 4+, place 2 Gut Parasites with 2 Health each in adjacent spaces."
    ]
  },
  {
    name: "Gastric Horror",
    keywords: ["Beast", "Organic", "OtherWorld"],
    initiative: 3,
    Size: "Large",
    health: 18,
    defense: 3,
    move: 4,
    escape: "5+",
    xp: 30,
    melee: { toHit: "3+", damage: 5 },
    ranged: null,
    abilities: [
      "Swallow Whole – On a To Hit roll of 6, the target Hero is Swallowed. A Swallowed Hero cannot Act and takes D3 Wounds at the start of each Enemy Phase, ignoring Defense. Other Heroes may attack the Gastric Horror to free the Swallowed Hero (freed when it takes 5+ Wounds in a single turn).",
      "Bile Spray – Once per fight, all Heroes within 3 spaces take D6 Wounds. Armor is reduced by 1 for each Hero Hit for the remainder of the fight.",
      "Massive Bulk – Takes up a 2x2 space. Cannot be pushed, pulled, or moved by any Hero ability.",
      "Regeneration – At the start of each Enemy Phase, heals D3 Wounds."
    ],
    eliteChart: [
      "Iron Stomach – Swallowed Heroes take D6 Wounds instead of D3 each Enemy Phase.",
      "Thick Hide – Armor 4+. Reduce all Damage from Ranged Attacks by 1.",
      "Thrashing Fury – +1 Combat. May attack two different adjacent targets each Activation.",
      "Putrid Stench – All Heroes within 2 spaces suffer -1 to all To Hit and Defense rolls.",
      "Corrosive Innards – Heroes freed from Swallow take an additional D3 Corruption Hits.",
      "Apex Predator – +4 Health, +1 Damage. Immune to Horror Hits and Snare effects."
    ]
  }
];

export default function Placeholder() { return null; }
