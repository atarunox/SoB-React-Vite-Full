
export const mineEnemies = [
  {
    name: "Coffin Breakers",
    keywords: ["Undead", "Outlaw"],
    initiative: 5,
    Size: "Medium",
    health: 5,
    defense: 5,
    move: 5,
    escape: "4+",
    xp: 40,
    melee: { toHit: "4+", damage: 6 },
    ranged: null,
    abilities: [
      "Fear (3): A Hero starting their Activation adjacent takes 3 Horror Hits.",
      "Grave Shovels: Ignore Armor and Heroes may not Re-roll Defense rolls.",
      "Coffin Shields: Immune to Critical Hits from Ranged Attacks; has Cover 4+ save against Explosives.",
      "Unearthed: Roll a D6 at start of each turn to gain +3 Combat, re-target, gain Cover 4+, or ignore Defense on 6s."
    ],
    eliteChart: [
      "Broken Boards – Take 1 less Wound from each Hit; +2 Health.",
      "Bleached Bones – +1 Combat. Always ends move next to as many other Coffin Breakers as possible.",
      "Unrelenting – +1 Damage for each Hero adjacent.",
      "Rusty Shovels – +1 To Hit vs Coffin Breaker targets.",
      "Glowing Eyes – +2 Sanity Damage on Defense fails.",
      "Empty Graves to Fill – At end of Move, each adjacent Hero takes 2 Wounds, ignoring Defense, if Coffin Breaker moved into them."
    ]
  },
  {
    name: "Captain Burns",
    keywords: ["Mutant", "Outlaw", "Scaffold", "Legendary"],
    initiative: 5,
    Size: "Medium",
    health: 28,
    defense: 3,
    move: 5,
    escape: "3+",
    xp: 15,
    melee: { toHit: "3+", damage: 3 },
    ranged: { toHit: "4+", damage: 3 },
    abilities: [
      "Assault: May Ranged Attack and then Move.",
      "Scaffold Pistol – Ranged Attack: Range 8, Shots 4, Damage 3.",
      "Firefight: At Initiative 1, if not adjacent, makes additional Ranged Attack using Shootout.",
      "Give ‘em Hell Boys – All Scaffold models (including himself) gain +2 Shots during Firefight.",
      "Tough – Immune to Critical Hits."
    ],
    eliteChart: [
      "Hardened Veteran – +8 Health, +2 Combat.",
      "Iron Will – +1 Defense.",
      "Dark Stone Greed – +2 Damage vs targets with 2 or more Dark Stone Icons.",
      "Bitter Feud – All Scaffold gain +1 Health and +1 Shot/Combat vs Heroes with Law or Outlaw keyword.",
      "Rebel Bite – Melee To Hit rolls of 6 cause Bleeding Marker; +3 Health; Use 1 Grit to discard and redo the Hit.",
      "Burns’ Charge – If other Scaffold models are on the board, gains Endurance (2) (max 2 Wounds per Hit)."
    ]
  },
  {
    name: "Mutant Brute",
    keywords: ["Mutant", "Beast"],
    initiative: 3,
    Size: "Large",
    health: 12,
    defense: 4,
    move: 5,
    escape: "4+",
    xp: 15,
    melee: { toHit: "4+", damage: 4 },
    ranged: null,
    abilities: [
      "Brute Force – Ignore Defense on rolls of 6.",
      "Tough Hide – Reduce all damage by 1 (minimum 1).",
      "Unstable Mutation – Gains +1 Damage for each Mutation token on it (max +3).",
      "Savage Roar – Once per Fight, all Heroes within 3 spaces take 2 Horror Hits."
    ],
    eliteChart: [
      "Mutant Rage – +1 Combat, +1 Damage.",
      "Terrorizing – All Horror Hits are +1 Sanity Damage.",
      "Giant Arms – May re-roll 1 Melee To Hit roll per turn.",
      "Dark Stone Growths – Gains Armor 6+.",
      "Thick Muck – Any Hero adjacent at start of turn must pass Strength 5+ or lose 1 Move.",
      "Twisting Flesh – Immune to Critical Hits."
    ]
  },
  {
    name: "Lava Men",
    keywords: ["Elemental"],
    initiative: 2,
    Size: "Large",
    health: 10,
    defense: 4,
    move: 4,
    escape: "4+",
    xp: 15,
    melee: { toHit: "4+", damage: 3 },
    ranged: null,
    abilities: [
      "Lava Blood – Any Hero adjacent at end of turn takes 1 Wound, ignoring Defense.",
      "Burning Aura – All adjacent Heroes take -1 Damage on all their Attacks.",
      "Flame Resistance – Immune to Fire and Explosives."
    ],
    eliteChart: [
      "Molten Core – Reduce all Damage by 1.",
      "Fiery Rage – +1 Combat, +1 Damage.",
      "Eruption – On death, all adjacent Heroes take D3 Wounds, ignoring Defense.",
      "Obsidian Skin – Armor 5+.",
      "Heat Haze – Heroes must re-roll all Ranged Hits on these enemies.",
      "Seething Hatred – Double Damage vs Heroes with Holy keyword."
    ]
  },
  {
    name: "Ancient Spiders",
    keywords: ["Beast", "Vermin"],
    initiative: 4,
    Size: "Medium",
    health: 6,
    defense: 4,
    move: 6,
    escape: "3",
    xp: 10,
    melee: { toHit: 4, damage: 3 },
    ranged: null,
    abilities: [
      "Web Spin – Adjacent Heroes treat all terrain as Rough for their Move.",
      "Poison Fangs – Every 6 To Hit causes 1 Wound ignoring Defense.",
      "Shadow Climb – May ignore walls when moving."
    ],
    eliteChart: [
      "Massive Carapace – Armor 5+.",
      "Spider Swarm – Gains +1 Move and may Re-roll 1 To Hit each turn.",
      "Venom Burst – On death, each adjacent Hero takes D6 Wounds ignoring Defense.",
      "Nest Defenders – +1 Damage and +2 Health.",
      "Wall Crawlers – May ignore terrain effects and always counts as in cover.",
      "Ancient Malice – Heroes must Re-roll 6s when making Defense rolls."
    ]
  }
,
  {
    name: "Void Swarm",
    keywords: ["Void", "Vermin"],
    initiative: 6,
    Size: "Small",
    health: 3,
    defense: 3,
    move: 8,
    escape: "2+",
    xp: 10,
    melee: { toHit: "5+", damage: 2 },
    ranged: null,
    abilities: [
      "Swarming Mass – Gains +1 Damage for each Void Swarm adjacent to the target.",
      "Piercing Screech – At start of their Activation, each Hero within 3 spaces takes 1 Sanity Hit.",
      "Flight – May ignore all terrain while moving."
    ],
    eliteChart: [
      "Void Surge – Gains +1 Move and +1 Initiative.",
      "Acidic Claws – Each Hit that causes a Wound ignores Armor.",
      "Dark Mass – Gains Armor 6+.",
      "Phase Flicker – Each turn, roll a D6: on 4+, Heroes must re-roll To Hit rolls against this enemy.",
      "Shriek Echo – Each Void Swarm Hit causes +1 Sanity Damage.",
      "Terrorcloud – Heroes adjacent cannot use once-per-fight abilities."
    ]
  }
,
  {
    name: "Sand Crabs",
    keywords: ["Beast", "OtherWorld"],
    initiative: 4,
    Size: "Medium",
    health: 5,
    defense: 3,
    move: 6,
    escape: "4+",
    xp: 10,
    melee: { toHit: "4+", damage: 3 },
    ranged: null,
    abilities: [
      "Ambush – Starts each fight with a free Move and Attack before Heroes Activate.",
      "Tunneling – May move through walls and terrain as if not there.",
      "Hard Shell – Reduce all damage by 1 (min 1)."
    ],
    eliteChart: [
      "Burrow Ambush – May move and Attack twice on the first turn.",
      "Clattering Swarm – Gains +1 Damage and +1 Move if more than 2 Sand Crabs on board.",
      "Tide Crawler – Gains +2 Initiative when in OtherWorlds.",
      "Shard Shell – Armor 5+.",
      "Bleeding Pincers – To Hit rolls of 6 cause Bleeding Marker.",
      "Scuttle Frenzy – Gains +1 Combat and may Re-roll 1 To Hit per turn."
    ]
  },
  {
    name: "Tentacles",
    keywords: ["Beast", "Void"],
    initiative: 3,
    Size: "Large",
    health: 8,
    defense: 4,
    move: 4,
    escape: "4+",
    xp: 10,
    melee: { toHit: "3+", damage: 3 },
    ranged: null,
    abilities: [
      "Snare – Every Hit causes a Snare Marker; Hero must pass Strength 4+ or lose next Action.",
      "Whip Reach – Can Attack targets up to 2 spaces away.",
      "Severed Limb – On death, roll a D6: on 6, remove the model permanently."
    ],
    eliteChart: [
      "Barbed – Hits cause an additional Wound on 6s.",
      "Void Slime – Heroes Hit by Tentacle must roll D6: on 1-2, lose their next Attack.",
      "Thrashing – May Attack two different targets each turn.",
      "Coiled Strength – Gains +2 Damage when target is Snared.",
      "Slippery – All To Hit rolls against Tentacles are -1.",
      "Grasping Doom – Heroes adjacent must pass Agility 4+ or be Snared each turn."
    ]
  }
,
  {
    name: "Acidic Tentacles",
    keywords: ["Beast", "Void"],
    initiative: 3,
    Size: "Large",
    health: 8,
    defense: 4,
    move: 4,
    escape: "4+",
    xp: 15,
    melee: { toHit: "3+", damage: 4 },
    ranged: null,
    abilities: [
      "Acid Lash – Hits cause 1 Corruption Hit in addition to Damage.",
      "Melt Flesh – Critical Hits ignore Armor and reduce Hero's Armor by 1 for remainder of fight.",
      "Slithering Strike – May Attack before or after Moving."
    ],
    eliteChart: [
      "Caustic Spray – When Tentacle dies, all adjacent Heroes take D6 Wounds ignoring Defense.",
      "Toxic Core – Reduce all Damage taken by 1.",
      "Razor Suckers – To Hit rolls of 6 cause Bleeding Marker.",
      "Oozing Slime – Heroes adjacent must re-roll successful To Hit rolls.",
      "Void Infusion – Gains +1 Damage and +1 Initiative.",
      "Seeping Acid – At end of each turn, all adjacent Heroes take 1 Corruption Hit."
    ]
  },
  {
    name: "Silver Back Pa Scaffold",
    keywords: ["Mutant", "Outlaw", "Scaffold", "Legendary"],
    initiative: 2,
    Size: "Medium",
    health: 12,
    defense: 3,
    move: 5,
    escape: "3+",
    xp: 15,
    melee: { toHit: "2+", damage: "2D6" },
    ranged: { toHit: "4+", damage: "2D6" },
    abilities: [
      "Shootout – Blunderbuss: Range 5, Shots –, Damage 2D6 (use DB To Hit).",
      "Firefight – At Initiative 1, if not adjacent, makes additional Ranged Attack using Shootout.",
      "Ear Horn – While on board, Heroes collect Noise Markers. Only targets Heroes with ≥1 Noise Marker.",
      "‘Ol Sum Bit – Tough (Immune to Critical Hits), Endurance (1) (Max 1 Wound per Hit)."
    ],
    eliteChart: [
      "Git off ma’ Land! – Blunderbuss has 2 Shots for each Noise Marker on the target.",
      "Moonshine – On failed Hold Back the Darkness roll, heals D6 Wounds (D3 if 1 or 2 Heroes).",
      "Dark Stone Pipe – Enters play with 1D6 Dark Stone. Remove 1 to ignore a Wound or add 2 Damage during that Attack.",
      "Straining to Hear – At start of each turn, every Hero gains -1 Initiative.",
      "Oldy and Wiley – +2 Defense.",
      "In My Day… – All Heroes within 2 spaces roll 1 lower on To Hit and Defense and Willpower (6+ still succeeds)."
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
    xp: 15,
    melee: { toHit: "4+", damage: 4 },
    ranged: null,
    abilities: [
      "Phase Strike – May move through models and terrain during their Move.",
      "Void Growl – At start of fight, all Heroes take 1 Horror Hit.",
      "Pack Hunt – Gains +1 Damage for each other Void Hound adjacent to the same target."
    ],
    eliteChart: [
      "Howling Madness – Heroes Hit take +1 Sanity Damage.",
      "Shadow Dash – May make a free Move at the end of the Enemy Phase.",
      "Dark Fangs – To Hit rolls of 6 cause an additional Wound.",
      "Warp Pulse – Gains Armor 5+.",
      "Crushing Maul – Gains +1 Combat and +1 Damage.",
      "Alpha Stalker – Re-roll 1 To Hit roll each turn."
    ]
  }
];


export default function Placeholder() { return null; }