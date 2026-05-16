export const scannedEnemies = [
  {
    name: "Egg Sacks",
    keywords: ["Void", "Beast"],
    Size: "Medium",
    initiative: 0,
    move: 0,
    escape: "2+",
    toHit: { melee: null, ranged: null },
    stats: {
      normal: { combat: 0, damage: 0, defense: 2, health: 15, xp: "5+5" },
      brutal: null
    },
    abilities: [
      "Immobile - This Enemy cannot be moved in any way.",
      "Spawn - At the end of each turn, roll 2 dice for the Egg Sack. For each roll of 4+, place 1 new Void Spider adjacent to it. If a Void Spider cannot be placed for any reason, instead every Hero adjacent to the Egg Sack takes 1 Hit that does 4 Damage.",
      "Gooey Webbing - Whenever a Hero ends their Move on the same Map Tile as 1 or more Egg Sacks, they must make an Agility 5+ test. If failed, gain a Webbed marker.",
      "Countless Eggs - Endurance (3) - This Enemy may not take more than 3 Wounds from any Hit (extra Damage is wasted)."
    ],
    eliteAbilities: [
      "Undulating Eggs - Group Terror (2) - Heroes starting their Activation on the same Map Tile as 1 or more Egg Sacks take 2 Horror Hits.",
      "Bursting Sacks - When an Egg Sack is killed, all Heroes within 2 spaces take D6 Wounds, ignoring Defense.",
      "Void Silk - Gooey Webbing now requires Agility 6+.",
      "Leathery Shell - +6 Health",
      "Acidic Webs - At the start of each Turn, Heroes take 1 Wound, ignoring Defense, for each Webbed marker they have.",
      "Too Many Spiders - Egg Sacks now roll 3 dice for their Spawn ability."
    ]
  },
  {
    name: "Seeker Drones",
    keywords: ["Robot", "Targa"],
    Size: "Medium",
    initiative: 6,
    move: 8,
    escape: "3+",
    toHit: { melee: null, ranged: "3+" },
    stats: {
      normal: { combat: 0, damage: 0, defense: 4, health: 5, xp: "10+5" },
      brutal: null
    },
    abilities: [
      "Flight - Moves through other models and changes targets each turn.",
      "Laying Down Fire - Instead of making a Melee Attack after moving, this Enemy makes its Ranged Attack at its target.",
      "Fusion Blasters - Ranged Attack: Range 6 Shots 4 Damage 1* *Each Fusion Blaster Hit gains +X Damage where X is the number of Fusion Blaster Hits the target took during this Attack.",
      "Flicker Shielding - This Enemy's Defense may not be ignored by Explosives or Hits from adjacent Heroes."
    ],
    eliteAbilities: [
      "Ornate Craftsmanship - +3 Health",
      "Dark Stone Explosion - When destroyed, any Hero within 2 spaces of the Seeker Drone immediately takes D6 Corruption Hits.",
      "Enhanced Targeting - Seeker Drone Ranged To Hit rolls of 6+ count as 2 Hits each.",
      "Darting Hover - Now has Cover 5+ (ignores each Hit on the D6 roll of 5+).",
      "Thermal Fusion Boost - The Fusion Blasters are +2 Shots. Now Escape 4+.",
      "Seeker Killer Protocol - Seeker Drones now make their Ranged Attack at every Hero within 2 spaces instead of only at their target."
    ]
  },
  {
    name: "Void Spiders",
    keywords: ["Beast", "Void"],
    Size: "Medium",
    initiative: 6,
    move: 8,
    escape: "4+",
    toHit: { melee: "4+", ranged: null },
    stats: {
      normal: { combat: 2, damage: 2, defense: 0, health: 3, xp: "10" },
      brutal: null
    },
    abilities: [
      "Countless Swarm - Moves through other models. Up to 3 Spiders may share the same space, though they will not double-up or triple-up unless necessary to reach their target. All spaces that contain 2 or more Spiders allow those Spiders to make their full Combat Attack against all adjacent Heroes. When applying Damage from a Hit, the Hero may divide the Damage between any Spiders in the target's space as they see fit (use Defense for each as normal)."
    ],
    eliteAbilities: [
      "Drop From Above - +1 Combat. Always enters play as an Ambush (except when being placed by a spawner).",
      "Void Venom - Any Hero that takes one or more Wounds from Spider Combat Hits during the Turn gains a Void Venom marker.",
      "Thick Ichor - +2 Health.",
      "Hardened Shells - +2 Defense.",
      "Vicious Bite - Now Melee To Hit 3+.",
      "Deadly Venom - Spider Combat Hits are +2 Damage."
    ]
  },
  {
    name: "Ancient Spiders",
    keywords: ["Beast", "Void", "Targa"],
    Size: "Medium",
    initiative: 6,
    move: 8,
    escape: "4+",
    toHit: { melee: "3+", ranged: null },
    stats: {
      normal: { combat: 2, damage: 2, defense: 0, health: 3, xp: "20" },
      brutal: null
    },
    abilities: [
      "Countless Swarm - Moves through other models. Up to 3 Spiders may share the same space, though they will not double-up or triple-up unless necessary to reach their target. All spaces that contain 2 or more Spiders allow those Spiders to make their full Combat Attack against all adjacent Heroes. When applying Damage from a Hit, the Hero may divide the Damage between any Spiders in the target's space as they see fit (use Defense for each as normal).",
      "Void Bite - Spider Melee To Hit rolls of 5+ do double Damage."
    ],
    eliteAbilities: [
      "Drop From Above - +1 Combat. Always enters play as an Ambush (except when being placed by a spawner).",
      "Void Venom - Any Hero that takes one or more Wounds from Spider Combat Hits during the Turn gains a Void Venom marker.",
      "Thick Ichor - +2 Health",
      "Frosty Shells - Armor 5+",
      "Feeds on Technology - +1 Combat for every Tech Item and token the target has. +1 Initiative",
      "Deadly Venom - Spider Combat Hits are +2 Damage."
    ]
  },
  {
    name: "Trench Spiders",
    keywords: ["Beast", "Void", "Trederra"],
    Size: "Medium",
    initiative: 6,
    move: 8,
    escape: "4+",
    toHit: { melee: "4+", ranged: null },
    stats: {
      normal: { combat: 2, damage: 2, defense: 0, health: 3, xp: "20" },
      brutal: null
    },
    abilities: [
      "Countless Swarm - Moves through other models. Up to 3 Spiders may share the same space, though they will not double-up or triple-up unless necessary to reach their target. All spaces that contain 2 or more Spiders allow those Spiders to make their full Combat Attack against all adjacent Heroes. When applying Damage from a Hit, the Hero may divide the Damage between any Spiders in the target's space as they see fit (use Defense for each as normal).",
      "Tunneling Scavengers - Always has a Cover 5+ save and gets +1 Damage for each Corruption Point the target has."
    ],
    eliteAbilities: [
      "Hidden Amongst the Rubble - Always enters play as an Ambush (except when being placed by a spawner), and now Cover 4+.",
      "Void Venom - Any Hero that takes one or more Wounds from Spider Combat Hits during the Turn gains a Void Venom marker.",
      "Thick Ichor - +2 Health.",
      "Group Dark Stone Radiation (1) - Any Hero ending their move adjacent to 1 or more Spiders takes 1 Corruption Hit.",
      "Vicious Bite - Now Melee To Hit 3+.",
      "Corpse Feeding - +1 Combat. Whenever a Hero is KO'd, all Spiders gain +1 Combat until the end of the Turn."
    ]
  },
  {
    name: "Nightshade Spiders",
    keywords: ["Beast", "Void", "Forest of the Dead"],
    Size: "Medium",
    initiative: 6,
    move: 8,
    escape: "4+",
    toHit: { melee: "4+", ranged: null },
    stats: {
      normal: { combat: 2, damage: 2, defense: 0, health: 3, xp: "15" },
      brutal: null
    },
    abilities: [
      "Countless Swarm - Moves through other models. Up to 3 Spiders may share the same space, though they will not double-up or triple-up unless necessary to reach their target. All spaces that contain 2 or more Spiders allow those Spiders to make their full Combat Attack against all adjacent Heroes. When applying Damage from a Hit, the Hero may divide the Damage between any Spiders in the target's space as they see fit (use Defense for each as normal).",
      "Nightshade Toxin - Whenever a Hero rolls a 1 To Hit while adjacent to 1 or more Nightshade Spiders, they take D3 Wounds, ignoring Defense and Armor."
    ],
    eliteAbilities: [
      "Drop From Above - +1 Combat. Always enters play as an Ambush (except when being placed by a spawner).",
      "Void Venom - Any Hero that takes one or more Wounds from Spider Combat Hits during the Turn gains a Void Venom marker.",
      "Bright Colors - Once per Attack, a Hero must Re-roll their highest successful To Hit roll assigned to a Spider.",
      "Hardened Shells - +2 Defense.",
      "Forest Webbing - Spider To Hit rolls of 6+ also give the target a Webbed marker if they take any Wounds from the Hit.",
      "Deadly Venom - Spider Combat Hits are +2 Damage."
    ]
  },
  {
    name: "Hungry Dead",
    keywords: ["Undead"],
    Size: "Medium",
    initiative: 1,
    move: 2,
    escape: "4+",
    toHit: { melee: "4+", ranged: null },
    stats: {
      normal: { combat: 1, damage: 3, defense: 4, health: 1, xp: "20" },
      brutal: null
    },
    abilities: [
      "Fear (1) - A Hero starting their Activation adjacent automatically takes 1 Horror Hit."
    ],
    eliteAbilities: [
      "Bloated - +2 Health",
      "Ravenous - +2 Combat",
      "Recently Dead - Hungry Dead are now Move 3 and Initiative 3.",
      "Resilient - +1 Defense",
      "Stench of Death - All Heroes on the same Map Tile as one or more Hungry Dead or Corpse Piles are now -1 on all of their To Hit rolls (natural rolls of 6 still count as Critical Hits).",
      "Rotten Evil - All Hungry Dead are now Fear (2)."
    ]
  },
  {
    name: "Hell Vermin",
    keywords: ["Mutant", "Beast"],
    Size: "Medium",
    initiative: 6,
    move: 8,
    escape: "4+",
    toHit: { melee: "4+", ranged: null },
    stats: {
      normal: { combat: 3, damage: 4, defense: 2, health: 13, xp: "10+5" },
      brutal: null
    },
    abilities: [
      "Fear (2) - A Hero starting their Activation adjacent automatically takes 2 Horror Hits.",
      "Regeneration (2) - Heals 2 Wounds at the start of each turn.",
      "Corruption Bite - Hell Vermin Combat To Hit rolls of 6 also do 1 Corruption Hit to the Hero.",
      "Tough - Immune to Critical Hits."
    ],
    eliteAbilities: [
      "Hissing Heads - Hell Vermin Melee To Hit is now 3+.",
      "Shadow Scurry - Hell Vermin are now +2 Defense against Ranged Attacks (not including Explosives).",
      "Fleshy Boils - +5 Health.",
      "Void Fleas - Heroes on the same Map Tile cannot Recover Grit.",
      "Rancid Breath - Hell Vermin are now Fear (3).",
      "Vile Corruption - The Corruption Bite ability now causes D3 Corruption Hits."
    ]
  },
  {
    name: "The Undead Gunslinger",
    keywords: ["Undead", "Outlaw"],
    Size: "Medium",
    initiative: 8,
    move: 6,
    escape: "3+",
    toHit: { melee: "5+", ranged: "3+" },
    stats: {
      normal: { combat: 4, damage: 4, defense: 4, health: 10, xp: "15+5" },
      brutal: null
    },
    abilities: [
      "Shootout Terror (2) - A Hero starting their Activation on the same Map Tile automatically takes 2 Horror Hits",
      "Deadman's Six-Shooter - Ranged Attack: Range 8, Shots 2, Damage 2* *To Hit rolls of 6 draw a Deadman's Shot card instead of normal Damage.",
      "Fastest Dead in the West - After selecting a target and moving, places Shootout markers, split between targets within Range and Line of Sight. Each Shootout marker is a Ranged Attack with the Deadman's Six-Shooter.",
      "Endurance (3) - Cannot take more than 3 Wounds from any single Hit",
      "Regeneration (2) - Heals 2 Wounds at the start of each turn"
    ],
    eliteAbilities: [
      "Cold Stare - The Hero selected as the initial 'Target' for the Undead Gunslinger's Shootout each turn takes Horror Hits.",
      "Ruthless Outlaw - Terror (2) is replaced with: Unspeakable Terror (2) - Any Hero starting on the same or adjacent Map Tile automatically takes 2 Horror Hits.",
      "Quickdraw - The Hero selected as the initial 'Target' for the Undead Gunslinger's Shootout each turn draws an extra Deadman's Shot card, in addition to any Hits they might take.",
      "Regeneration (H) - Now Heals 1 wound at the start of each turn for every non-KO'd Hero in play. (minimum of 2).",
      "Hunger for Revenge - Deadman's Six-Shooter is +2 Shots (may be upgraded multiple times)."
    ]
  },
  {
    name: "The Lost Army",
    keywords: ["Undead", "Soldier", "Lost Army"],
    Size: "Medium",
    initiative: 2,
    move: 2,
    escape: "4+",
    toHit: { melee: "3+", ranged: "5+" },
    stats: {
      normal: { combat: 1, damage: 6, defense: 4, health: 3, xp: "30" },
      brutal: null
    },
    abilities: [
      "Fear (2) - A Hero starting their Activation adjacent automatically takes 2 Horror Hits.",
      "Battle Line - While In Formation, a Lost Army model is Armor 5+ and only makes a Retreat move on the roll of 6 (instead of the normal 4, 5, or 6).",
      "Hell Musket Volley - Ranged Attack: Range - 10 Shots - * Damage 1. *Shots equal to the number of Lost Army Soldiers in Line of Sight to the target."
    ],
    eliteAbilities: [
      "Bayonet Line - Lost Army Combat Hits are +2 Damage for each other Lost Army Enemy adjacent to them.",
      "First Company - Lost Army are now Range To Hit 4+ and +1 Health",
      "Veterans of the Alamo - +3 Health",
      "Cold Efficiency - +1 Combat, and +1 Damage with the Hell Musket Volley",
      "Siege Gear - Lost Army are now Armor 4+ while In Formation.",
      "Burning Skulls - Lost Army are now Fear (3) and, due to their terrifying cackle, any time a Hero on the same Map Tile as one or more Lost Army models would Recover a Grit, roll a D6. That Grit is not Recovered on the roll of 1, 2, or 3."
    ]
  },
  {
    name: "Swamp Raptor",
    keywords: ["Beast", "Jargano"],
    Size: "Medium",
    initiative: 5,
    move: 10,
    escape: "3+",
    toHit: { melee: "3+", ranged: null },
    stats: {
      normal: { combat: 3, damage: 5, defense: 3, health: 40, xp: "10+5" },
      brutal: null
    },
    abilities: [
      "Terror (2) - A Hero starting their Activation on the same Map Tile automatically takes 2 Horror Hits.",
      "Chomp - After making a Melee Attack, roll one extra Combat against a Random adjacent Hero as a Chomp Attack, doing 2D6 Damage. If a 6 is rolled To Hit, this Chomp ignores Defense.",
      "Enraged - Gains +2 Combat on the first turn of an Ambush. Also, when a Hero does 6 or more Wounds to the Swamp Raptor in a single Attack, immediately targets, moves through other models, and Attacks that Hero, out of turn sequence.",
      "Tough - Immune to Critical Hits."
    ],
    eliteAbilities: [
      "Primal Instinct - Swamp Raptor targets each turn and moves through other models. It also gains Regeneration (2) - Heals 2 Wounds at the start of each turn.",
      "Chomp Chomp - After each Melee Attack, makes an extra Chomp Attack.",
      "Scars of the Hunt - +5 Health per Hero and +1 Combat.",
      "Savage Jaws - All of the Swamp Raptor's Attacks are +3 Damage.",
      "Hardened Scales - Swamp Raptor is +5 Health and is now Defense 4.",
      "Whipping Tail - Heroes that are adjacent to the Swamp Raptor are -1 on all of their To Hit rolls (natural rolls of 6+ still count as Critical Hits)."
    ]
  },
  {
    name: "Hellfire Succubi",
    keywords: ["Demon", "Cynder"],
    Size: "Medium",
    initiative: 8,
    move: 7,
    escape: "5+",
    toHit: { melee: "3+", ranged: null },
    stats: {
      normal: { combat: 3, damage: 2, defense: 3, health: 7, xp: "35" },
      brutal: null
    },
    abilities: [
      "Vicious Claws - Heroes are -1 to their Defense rolls against Hellfire Succubi Combat Hits (ie - Defense 4+ would need to roll 5 or higher to save).",
      "Hellfire Demons - Hellfire Succubi are immune to Hellfire and Burning Markers.",
      "Femme Fatales - Hellfire Succubi are immune to Critical Hits from Male Heroes and are +1 Combat when targeting Female Heroes."
    ],
    eliteAbilities: [
      "Pure Evil - Hellfire Succubi Combat Hits are now +2 Damage",
      "Barbed Tail - Hellfire Succubi To Hit rolls of 5 or 6 now ignore Defense.",
      "Hypnotic Sway - +1 Defense",
      "Soulless Eyes - +5 Health",
      "Wreathed in Flame - +1 Initiative and any Hero ending their move adjacent to one or more Hellfire Succubi must pass an Agility 5+ test or immediately take D3 Burning Markers.",
      "Unholy Spite - +1 Combat and all Holy Heroes ending their Move on the same Map Tile as one or more Hellfire Succubi take D3 Corruption Hits. Also, any time a Preacher/Nun Hero successfully casts a Sermon, they take D6 Corruption Hits."
    ]
  },
  {
    name: "Hell Cannon",
    keywords: ["Undead", "Artillery", "Lost Army"],
    Size: "Medium",
    initiative: 1,
    move: 2,
    escape: "2+",
    toHit: { melee: "4+", ranged: "5+" },
    stats: {
      normal: { combat: 0, damage: 0, defense: 4, health: 15, xp: "15+5" },
      brutal: null
    },
    abilities: [
      "Fear (4) - A Hero starting their Activation adjacent takes 4 Horror Hits.",
      "Artillery - The Hell Cannon follows the rules for Ranged Enemies.",
      "Hell Cannon - Ranged Attack: Range - Any Shots - * Damage (1) - If there are adjacent Heroes, fires Grape Shot, doing D6 Wounds, ignoring Defense, to each of them. Otherwise, fires a Cannon Ball, as detailed on the Cannon reference card.",
      "Siege Weapon - If the Hell Cannon has no targets in Line of Sight for its Attack, draw a Growing Dread card and add it to the stack instead.",
      "Tough Crew - Immune to Critical Hits unless the attacker is adjacent."
    ],
    eliteAbilities: [
      "Crack Team - +2 Initiative",
      "Veteran Crew - Range To Hit is now 4+.",
      "Reinforced Carriage - +5 Health",
      "Spectral Skull Shot - Any time a Hero takes Damage from the Hell Cannon, they also take D6 Horror Hits.",
      "Bone Shards - The Hell Cannon's Grape Shot at adjacent Heroes now does * Damage instead.",
      "Back From Hell - The Hell Cannon's Cannon Balls now do * +3 Damage, ignoring Defense and Armor instead."
    ]
  },
  {
    name: "Undead Outlaws",
    keywords: ["Undead", "Outlaw"],
    Size: "Medium",
    initiative: 2,
    move: 4,
    escape: "3+",
    toHit: { melee: "4+", ranged: "4+" },
    stats: {
      normal: { combat: 1, damage: 3, defense: 4, health: 5, xp: "45" },
      brutal: null
    },
    abilities: [
      "Shootout - A Hero starting their Activation adjacent automatically takes 2 Horror Hits.",
      "Fear (2) - A Hero starting their Activation adjacent automatically takes 2 Horror Hits.",
      "Twin Irons - Ranged Attack: Range - 6 Shots - 4 Damage 2",
      "Gritty - Critical Hits only reduce an Infamous Undead Outlaw to Defense 2 (rather than 0). Infamous Undead Outlaws Only"
    ],
    eliteAbilities: [
      "Dead Eye Shots - Undead Outlaw Ranged To Hit rolls of 6+ add +3 Damage to the Hit.",
      "Ruthless Outlaws - Gains Terror (1) - Any Hero starting on the same Map Tile automatically takes 1 Horror Hit. This is in addition to their normal Fear (2) - so if adjacent, take 3 Horror Hits.",
      "Quickdraw - In their first Fight Round, Undead Outlaws are Initiative 6 and +2 Shots with their Ranged Attacks.",
      "Rotten Bodies - +4 Health and Heal 1 wound at the start of each turn.",
      "Need for Revenge - +2 Shots on all Ranged Attacks.",
      "Expert Gunfighters - Range To Hit is now 3+"
    ]
  },
  {
    name: "HellBats",
    keywords: ["Demon", "Void"],
    Size: "Medium",
    initiative: 6,
    move: 12,
    escape: "3+",
    toHit: { melee: "3+", ranged: null },
    stats: {
      normal: { combat: 3, damage: 1, defense: 2, health: 1, xp: "10" },
      brutal: null
    },
    abilities: [
      "Flight - HellBats move through other models and change targets each turn.",
      "Nightmarish - For every Hit done by a HellBat, the Hero also takes 1 Horror Hit."
    ],
    eliteAbilities: [
      "Tenacious - HellBats are now Escape 5+.",
      "Shrieking - HellBat Nightmarish Horror Hits now do 2 Damage each.",
      "Shadow Wings - +2 Defense",
      "Barbed Tail - +1 Combat.",
      "Armored Scales - +2 Health",
      "Razor Wings - HellBat Combat Hits now do 3 Damage each."
    ]
  },
  {
    name: "Harbinger",
    keywords: ["Demon"],
    Size: "Medium",
    initiative: 4,
    move: 12,
    escape: "3+",
    toHit: { melee: "4+", ranged: null },
    stats: {
      normal: { combat: 3, damage: 4, defense: 3, health: 18, xp: "10+5" },
      brutal: null
    },
    abilities: [
      "Unspeakable Terror (3) - A Hero starting their Activation on the same or adjacent Map Tile automatically takes 3 Horror Hits.",
      "Bringer of Death - At the end of each Fight Round, makes a Random Special Attack: Sweeping Strike (every adjacent Hero takes D6 Combat Hits), Summon Hellbats (immediately add D3 Hellbats to the Fight using Ambush), or Regenerate (the Harbinger Heals D6 Wounds).",
      "Flight - Moves through other models and changes targets each turn.",
      "Tough - Immune to Critical Hits."
    ],
    eliteAbilities: [
      "Pile of Skulls - The Harbinger is now Unspeakable Terror (4).",
      "Blind Terror - +1 Combat",
      "Harvester of Souls - Any time the Harbinger KOs a Hero or Ally, it Heals D6 Wounds.",
      "Claws - Harbinger Combat Hits now cause 2 Hits each.",
      "Fleshless Body - +4 Health",
      "Shriek of Command - All other Enemies are +2 Health as long as the Harbinger is alive."
    ]
  },
  {
    name: "Serpentmen Shaman",
    keywords: ["Serpentmen", "Tribal", "Magic", "Argono"],
    Size: "Medium",
    initiative: 7,
    move: 10,
    escape: "4+",
    toHit: { melee: "4+", ranged: "4+" },
    stats: {
      normal: { combat: 3, damage: 4, defense: 3, health: 18, xp: "10+5" },
      brutal: null
    },
    abilities: [
      "Retreat - If adjacent to a Hero at the start of its Activation, makes a Free Move along the shortest distance to no longer be adjacent. In the first turn of an Ambush, does not Retreat.",
      "Serpent Magik - At the start of its Activation (after any Retreat), while not adjacent to a Hero, the Shaman rolls a D6. On 1-2 it targets a Random Hero and moves to attack as normal, on 3-6 it does not move and casts a random Spell from the Serpent Magik deck.",
      "Trinkets - Starts with a Random Shaman Juju Trinket card. Instead of doing Damage, a Critical Hit on the Shaman may be used to knock away a Juju Trinket (discard) on the D6 roll of 5 or 6.",
      "Slither - Moves through other models and changes targets each turn.",
      "Dark Stone Weapons - Serpentmen Shaman To Hit rolls of 6 cause double Damage."
    ],
    eliteAbilities: [
      "Shaman Trinkets - Draws an extra Shaman Juju Trinket card (may be upgraded multiple times)",
      "Tribal Veteran - Melee and Range To Hit are now both 3+.",
      "Thanu's Chosen - Endurance (2) - Cannot take more than 2 Wounds from a single Hit (extra Damage is wasted). Replaces any other Endurance.",
      "Serpent of the Inner Circle - +6 Health",
      "Savage Warrior Priest - Loses the Retreat ability. No longer rolls for Serpent Magik. Instead, always targets a Random Hero and moves to Attack. At the end of its Move (before Attacking), also casts a Spell, even if adjacent to a Hero."
    ]
  },
  {
    name: "Magma Giant",
    keywords: ["Construct", "Cynder"],
    Size: "Medium",
    initiative: 3,
    move: 6,
    escape: "3+",
    toHit: { melee: "4+", ranged: "6+" },
    stats: {
      normal: { combat: 3, damage: 3, defense: 3, health: 25, xp: "15+5" },
      brutal: null
    },
    abilities: [
      "Unspeakable Terror (2) - A Hero starting their Activation on the same or adjacent Map Tile takes 2 Horror Hits.",
      "Hardening Surface - During each Hero's Activation, this Enemy's Defense is +1 for each successive Hit assigned to it after the first (until end of that Activation), immune to Burning Markers.",
      "Massive Fists - This Enemy uses the D8 for its To Hit rolls",
      "Burning Smash - This Enemy's Melee To Hit rolls of 7+ ignore Defense and also add a Burning marker to the target, as well as any other Heroes adjacent to it.",
      "Towering - Moves through other models.",
      "Tough - Immune to Critical Hits."
    ],
    eliteAbilities: [
      "Spews Lava - At the start of this Enemy's Activation, roll a D6. On the roll of 4+, it makes a free Ranged Attack at a Random Hero within Range 10 and Line of Sight. Roll once To Hit and for Bounce (like Dynamite). Wherever the shot lands, place a Lava Space marker in that space and D3 Random adjacent spaces. Then, every Hero in a Lava Space must pass an Agility 6+ test or take D8 Wounds, ignoring Defense. This Elite ability may be taken multiple times. If so, roll for each.",
      "Churning Core - +20 Health",
      "Burning Rage - +1 Combat and +1 Damage on Combat Hits.",
      "Swift Flow - +1 Initiative and +2 Move",
      "Sizzling Touch - The Burning Smash ability now deals D3 Burning markers to each Hero affected, instead of only 1."
    ]
  },
  {
    name: "Lava Men",
    keywords: ["Construct", "Cynder"],
    Size: "Medium",
    initiative: 3,
    move: 6,
    escape: "3+",
    toHit: { melee: "4+", ranged: "4+" },
    stats: {
      normal: { combat: 4, damage: 3, defense: 3, health: 10, xp: "10+5" },
      brutal: null
    },
    abilities: [
      "Burning Touch - Lava Men To Hit rolls of 6 also immediately add a Burning Marker to the Hero.",
      "Molten Body - Immune to Critical Hits from Ranged Attacks.",
      "Made From Lava - At the start of their Activation, Lava Men heal 1 Wound for every Lava Space adjacent to them (as well as the space they are in). Lava Men are immune to Burning Markers."
    ],
    eliteAbilities: [
      "Flaming Fists - Lava Men Melee Hits are now +3 Damage.",
      "Ambassadors of Hell - Lava Men gain +1 Combat if their target has one or more Corruption Points, and +1 Combat for each Mutation their target has.",
      "Heat Shimmer - Armor 5+",
      "Lava Explosion - When a Lava Man is killed, every adjacent Hero takes D6 Wounds, ignoring Defense.",
      "Lava Eruption - At the start of their Activation, roll a D6 for each Lava Man. On the roll of 1 or 2, it will immediately make an extra Ranged Attack (Range 8, Shots 1, Damage D6+2) against a Random Hero within Range, before activating as normal."
    ]
  },
  {
    name: "Serpentmen Warriors",
    keywords: ["Serpentmen", "Tribal", "Argono"],
    Size: "Medium",
    initiative: 5,
    move: 10,
    escape: "5+",
    toHit: { melee: "4+", ranged: null },
    stats: {
      normal: { combat: 2, damage: 3, defense: 2, health: 6, xp: "35" },
      brutal: null
    },
    abilities: [
      "Serpentmen Tribe - If there is not already a Serpentmen Tribe card in play, draw one to determine the tribal territory you are in.",
      "Slither - Moves through other models and changes targets each turn.",
      "Dark Stone Weapons - Serpentmen Warrior To Hit rolls of 6 cause double Damage.",
      "Tribal Shields - Serpentmen Warrior's Defense is doubled while adjacent to the attacker."
    ],
    eliteAbilities: [
      "Pack Hunters - Serpentmen Warriors are +1 Combat for each other Serpentmen Enemy adjacent to them.",
      "Tribal Veterans - Melee To Hit is now 3+.",
      "Tar'gut Gut Training - +4 Health",
      "Savage - +2 Combat",
      "Poisoned Weapons - Any Hero that takes one or more Wounds from Serpentmen Warrior Attacks during the turn also gains a Poison marker.",
      "Whipping Tails - Heroes that are adjacent to one or more Serpentmen Warriors are -1 on all of their To Hit rolls (natural rolls of 6+ still count as Critical Hits)."
    ]
  },
  {
    name: "Corpse Pile",
    keywords: ["Undead"],
    Size: "Medium",
    initiative: 0,
    move: 0,
    escape: "1+",
    toHit: { melee: null, ranged: null },
    stats: {
      normal: { combat: 0, damage: 0, defense: 2, health: 6, xp: "10+5" },
      brutal: null
    },
    abilities: [
      "Immobile - Corpse Piles cannot be moved in any way.",
      "Fear (1) - A Hero starting their Activation adjacent automatically takes 1 Horror Hit.",
      "Spawner - At the end of each Fight Round, roll a D6 for each Corpse Pile. On the roll of 4+, place 1 new Hungry Dead adjacent to it. If there are no empty spaces adjacent, instead every Hero adjacent to the Corpse Pile takes 1 Hit (Damage 3)."
    ],
    eliteAbilities: [
      "Heaping Pile - +4 Health",
      "Unholy Stench - Fear (1) is replaced with: Unspeakable Terror (2) - Any Hero starting on the same or adjacent Map Tile automatically takes 2 Horror Hits.",
      "Regeneration (2) - Heals 2 Wounds at the start of each turn.",
      "Bloated Remains - +1 Defense",
      "Squirming Pile - Corpse Piles now spawn a new Hungry Dead on the roll of 3+.",
      "Freshly Stacked - Corpse Piles now roll twice each turn to spawn a Hungry Dead."
    ]
  },
,
  {"name":"Ancient Horror","keywords":["Void","Ancient"],"Size":"Medium","initiative":2,"move":"**","escape":"4+","toHit":{"melee":"4+","ranged":null},"stats":{"normal":{"combat":"*","damage":3,"defense":2,"health":18,"xp":"10+5"},"brutal":null},"abilities":["Terror (1) - Any Hero on the same Map Tile takes 1 Horror Hit at the start of their Activation.","Smash - Ancient Horror To Hit rolls of 6 ignore a Hero's Defense","*Flailing Tentacles (3) - Rolls a 3 Combat Attack against every Hero within 3 spaces.","**Eruption From Below - This Enemy does not Move normally. Instead, at the start of its Activation, roll a D6. On the roll of 4+ (or automatically if there are no Heroes within 3 spaces), it is immediately re-positioned as for an Ambush Attack (though it does NOT gain +2 Initiative)."],"eliteAbilities":["Entangle - Any Hero wounded by an Ancient Horror may not move during their next Activation.","Violent Eruption - When Ancient Horror is placed as an Ambush Attack (including Eruption From Below), all adjacent Heroes immediately take D6 Hits that do 2 Damage each.","Writhing - +1 Defense and Tough (Immune to Critical Hits).","Biting Suckers - Ancient Horror Combat Hits are now +2 Damage.","Lashing Strike - Ancient Horrors are now Flailing Tentacles (5).","Rumbling Ground - +2 Initiative and +5 Health."],"threatTier":"medium"},
  {"name":"Auto Turrets","keywords":["Hazard","Derelict Ship"],"Size":"Medium","initiative":5,"move":"0","escape":"1+","toHit":{"melee":"4+","ranged":"4+"},"stats":{"normal":{"combat":0,"damage":0,"defense":3,"health":12,"xp":"10+5"},"brutal":null},"abilities":["Immobile - Auto Turrets cannot be moved in any way.","Burst Cannons - Ranged Attack: Range 12, Shots 3, Damage 2. To Hit rolls of 6 do D6 Hits each.","Explosive - When destroyed, every adjacent model takes D3 Wounds, ignoring Defense."],"eliteAbilities":["Synth-Steel Construction - +8 Health","Nano-Self Repair (2) - Heals 2 Wounds at the start of each turn.","Advanced Targeting Matrix - Auto Turret Ranged To Hit is now 3+.","Defense Shielding - Auto Turrets now have Armor 5+","Alarm - The alarm set off by the defensive Auto Turrets activating has attracted attention. Draw a Threat card to add to the fight as an Ambush.","Dark Stone Power Core - Burst Cannon Hits are now Damage 4 and when destroyed, every adjacent model takes D6 Wounds instead of D3."],"threatTier":"medium"},
  {"name":"Bandits","keywords":["Outlaw"],"Size":"Medium","initiative":5,"move":"6","escape":"3+","toHit":{"melee":"4+","ranged":"5+"},"stats":{"normal":{"combat":2,"damage":2,"defense":3,"health":3,"xp":"15"},"brutal":null},"abilities":["Shootout - ","Bandit Pistols - Ranged Attack: Range 6 Shots 3 Damage 2","Hail of Bullets - Bandit Ranged To Hit rolls of 6 cause 3 Hits each."],"eliteAbilities":["Rustlers - +5 Health","Heavy Dusters - +1 Defense and +2 Health","Thieves - +2 Initiative. Also, any Hero that takes one or more wounds from an adjacent Bandit must lose 1 Dark Stone or $100.","Dark Stone Sights - Bandits are +2 Shots with their Ranged Attack","Cutthroats - All Bandit Attacks are now Damage +1","Gunfighters - Range To Hit is now 4+"],"threatTier":"medium"},
  {"name":"Beacon Drones","keywords":["Robot","Derelict Ship"],"Size":"Medium","initiative":3,"move":"5","escape":"3+","toHit":{"melee":"4+","ranged":null},"stats":{"normal":{"combat":4,"damage":3,"defense":3,"health":18,"xp":"10+5"},"brutal":null},"abilities":["Navigators of Darkness - BEACON Drone 16 Hit rolls of 6 cause Horror Hits instead of normal Hits (Damage amount remains the same).","Energy Shielding - Immune to Critical Hits unless adjacent to attacker.","Warp Pulse - At the end of its Move, all adjacent Heroes take 1 Hit for each Sanity Damage they currently have.","Feedback Quake - When destroyed, all Heroes in the Derelict Ship OtherWorld immediately take D6 Hits that do 2 Damage each."],"eliteAbilities":["Repair Diagnostic - Regeneration (2) - Heals 2 Wounds at the start of each turn.","Void Navigators - BEACON Drones gain Void and Terror (1) - A Hero starting their Activation on the same Map Tile takes 1 Horror Hit.","Maintenance Claw - +2 Combat","Targeting Grid - Melee To Hit is now 3+","Deteriorating Memory - +4 Health and re-targets each turn.","Warp Explosion - When destroyed, all Heroes on the same Map Tile take D6 Corruption Hits (if adjacent, 2D6 Corruption Hits instead)."],"threatTier":"medium"},
  {"name":"Black Fang Tribe","keywords":["Tribal","Fanatic","Black Fang"],"Size":"Medium","initiative":6,"move":"8","escape":"4+","toHit":{"melee":"5+","ranged":null},"stats":{"normal":{"combat":3,"damage":2,"defense":2,"health":6,"xp":"40"},"brutal":null},"abilities":["Crazed from Dark Stone - Comes into play with a pool of +2 Dark Stone for the group. Any time a Black Fang Enemy rolls one or more 6s on their To Hit rolls, discard 1 Dark Stone marker from the pool and the target automatically takes an extra D6 Combat Hits from that Enemy.","Endurance (2) - This Enemy cannot take more than 2 Wounds from any single Hit (extra Damage is wasted).","Wild Attack - When Attacking, makes a full Combat Attack against each adjacent Hero."],"eliteAbilities":["Pillage - Any Hero that takes one or more Wounds during the Black Fang Tribe's Activation must roll a D6. On the roll of 1 or 2, that Hero must also lose 1 Dark Stone that is stolen and placed into the Dark Stone pool of the Black Fang Tribe.","Void-Heightened Senses - +1 Defense and Melee To Hit 4+.","Blood Hunt - Black Fang Tribe Combat Hits are +2 Damage.","Enraged - Any time a Black Fang Tribe model would be killed, roll a D6. On the roll of 4, 5, or 6, remove a Dark Stone from the pool to prevent that damage instead (if a 6 was rolled, he also Heals D6 Wounds).","Dark Stone Madness - +4 Health and +2 Combat. This may be upgraded multiple times."],"threatTier":"medium"},
  {"name":"BogBats","keywords":["Demon","Void"],"Size":"Medium","initiative":6,"move":"12","escape":"3+","toHit":{"melee":"3+","ranged":null},"stats":{"normal":{"combat":3,"damage":1,"defense":2,"health":1,"xp":"20"},"brutal":null},"abilities":["Flight - BogBats move through other models and change targets each turn.","Nightmarish - For every Hit done by a BogBat, the Hero also takes 1 Horror Hit.","Bog Venom - A hero that takes 1 or more Wounds from a BogBat Combat Hit also gains a Poison marker."],"eliteAbilities":["Tenacious - BogBats are now Escape 5+.","Shrieking - BogBats Nightmarish Horror Hits now do 2 Damage each.","Shadow Wings - +2 Defense.","Barbed Tail - +1 Combat.","Armored Scales - +2 Health.","Razor Wings - BogBats Combat Hits now do 3 Damage each."],"threatTier":"medium"},
  {"name":"Captain Burns","keywords":["Mutant","Outlaw","Scaffold"],"Size":"Medium","initiative":4,"move":"5","escape":"3+","toHit":{"melee":"4+","ranged":"4+"},"stats":{"normal":{"combat":3,"damage":2,"defense":3,"health":12,"xp":"10+5"},"brutal":null},"abilities":["Shootout - Scaffold Pistol - Ranged Attack: Range - 8 Shots - 4 Damage 2","Firefight - At Initiative 1, if this Enemy is not adjacent to a Hero, it will make an additional Ranged Attack (without moving - target using Shootout).","Give 'em Hell Boys - All Scaffold models (including himself) gain +2 Shots while using their Firefight ability.","Tough - Immune to Critical Hits"],"eliteAbilities":["Hardened Veteran of the War - +6 Health and +2 Combat","Iron Will - +1 Defense","Dark Stone Greed - Captain Burns' Attacks are +2 Damage against any Hero that is carrying one or more Artifact Items.","Bitter Feud - All Scaffold models are both +1 Health and +1 Shot/Combat for each Hero that is Keyword Law or Outlaw in the Hero Posse.","Leading from the Front - +3 Health and Melee To Hit 3+","Burns' Charge - While there are any other Scaffold models on the board, Captain Burns gains Endurance (2) (may not take more than 2 Wounds per Hit. Extra Damage is wasted)."],"threatTier":"medium"},
  {"name":"Coffin Breakers","keywords":["Undead","Outlaw"],"Size":"Medium","initiative":4,"move":"5","escape":"4+","toHit":{"melee":"4+","ranged":null},"stats":{"normal":{"combat":2,"damage":4,"defense":5,"health":2,"xp":"25"},"brutal":null},"abilities":["Fear (2) - A Hero starting their Activation adjacent takes 2 Horror Hits","Grave Shovels - Coffin Breaker his ignore Armor and Heroes may not Re-roll Defense rolls","Coffin Shields - Immune to Critical Hits from Ranged Attacks, and has a Cover 4+ save against Explosives","Unearthed - At the start of each turn, roll a D6 for this Enemy Group's behavior until the end of the turn: 1) Dead Rage +3 Combat, 2-3) Skirmish Re-targets and Moves through other models. Melee To Hit 3+, 4-5) Shield Wall While adjacent to another Coffin Breaker, gains Cover 4+, 6) Coffin Smash Coffin Breaker To Hit rolls of 6+ ignore Defense"],"eliteAbilities":["Broken Boards - Coffin Breakers now take 1 less Wound from every Hit they take. +2 Health","Bleached Bones - +1 Combat. Coffin Breakers will always try to end their move next to as many other Coffin Breakers as possible when moving to attack their target Hero","Unrelenting Hate - Coffin Breaker Combat Hits are +1 Damage for each Hero adjacent to them","Rusty Shovels - Heroes are +1 to their Defense rolls against Coffin Breaker Combat Hits","Glowing Eyes - Coffin Breaker Horror Hits do 2 Sanity Damage each","Shallow Graves - Coffin Breakers now roll twice on their Unearthed chart each turn, gaining both abilities (Re-rolling duplicates)"],"threatTier":"medium"},
  {"name":"Colonel Scaffold","keywords":["Mutant","Outlaw","Scaffold"],"Size":"Medium","initiative":7,"move":"10","escape":"3+","toHit":{"melee":"4+","ranged":"3+"},"stats":{"normal":{"combat":3,"damage":3,"defense":3,"health":15,"xp":"10+5"},"brutal":null},"abilities":["Shootout - The Colonel's Pistols - Ranged Attack: Range 8, Shots 4, Damage 2","Firefight - At Initiative 1, if this Enemy is not adjacent to a Hero, it will make an additional Ranged Attack (without moving - target using Shootout).","Southern Grit - Has 2 Grit markers (or 3 if 6 Heroes). Whenever any Scaffold model suffers 3 or more Wounds from a Single Hit, discard one Grit to give that model Armor 4+ against the Wounds from that Hit. These Grit Re-fill at the start of each turn.","Scaffold Leader - All other Scaffold Enemies gain +2 Initiative and +1 Shot/Combat for their Attacks.","Tough - Immune to Critical Hits."],"eliteAbilities":["\"You'll Never Take Me Alive!\" - Colonel Scaffold has 1 Revive Token - When killed, he is instantly healed back to 10 Health.","Ruthless Leader - Heroes may not target Colonel Scaffold with a Ranged Attack if there is another Scaffold model closer.","Dark Stone Horde - Colonel Scaffold's Attacks are +1 Damage for each Dark Stone shard or Item the target is carrying (max +3). At the end of the Fight, all Heroes gain D6 Dark Stone.","Bitter Feud - All Scaffold models are both +1 Health and +1 Shot/Combat for each Hero that is Keyword Law or Outlaw in the Hero Posse.","Mutant Sitte - Gains +3 Health for each Hero with no Mutations.","\"The South Will Rise Again!\" - All Enemies gain Regeneration (2)."],"threatTier":"medium"},
  {"name":"Creeping Shadows","keywords":["Darkness","Demon","Hazard"],"Size":"Medium","initiative":7,"move":"8","escape":"4+","toHit":{"melee":"4+","ranged":null},"stats":{"normal":{"combat":2,"damage":"D6","defense":"*","health":6,"xp":"25"},"brutal":null},"abilities":["Flowing Shape - Moves through and may be moved through by other models, and may occupy the same space as other models (limit 1 Creeping Shadow per space). Always moves the shortest distance to try and get into the same space as its target. A Creeping Shadow uses its full Combat against every Hero in the same and adjacent spaces to it. When Ambushing, appears in the same space as its target.","Dark Whisper - Each Creeping Shadow To Hit roll of 1 also triggers 'Voices in the Dark' for the Hero (Do Horror His), in addition to the normal Combat Hit (even within the Lantern's light).","* Living Darkness - A Creeping Shadow's Defense is equal to the number of spaces it is from the Light Source. If the Mission makes the Map Tile Well Lit, use Defense 2.","Tough - Immune to Critical Hits."],"eliteAbilities":["Savage Darkness - +2 Combat","Clawing Fingers - Melee To Hit is now 3+.","Swirling Black Form - +4 Health","Ambush Dead - Heroes on the same Map Tile as a Creeping Shadow may not use Ability Tokens. Heroes in the same or adjacent space as a Creeping Shadow may not use Grit Endurance (3) (May not take more than 3 Wounds per Hit).","Ethereal - Endurance (3) (May not take more than 3 Wounds per Hit).","The Power of Evil - While one or more Creeping Shadows are on the board, the Light Source only covers the Map Tile the Lantern is on (rather than the same and adjacent Map Tiles). Also, Creeping Shadows' Damage counts as 6 (instead of D6) on any turn in which the Hold Back the Darkness roll is failed."],"threatTier":"medium"},
  {"name":"Order of the Crimson Hand","keywords":["Cult","Fanatic","Crimson Hand"],"Size":"Medium","initiative":3,"move":"5","escape":"3+","toHit":{"melee":"5+","ranged":"4+"},"stats":{"normal":{"combat":2,"damage":3,"defense":2,"health":3,"xp":"30"},"brutal":null},"abilities":["Cult Rifle - Ranged Attack: Range - 10 Shots - 1 Damage 5","Zealot's Fury - This Enemy does +1 Damage on all of its Combat Hits for each Wound marker it currently has.","Endurance (3) - This Enemy cannot take more than 3 Wounds from any single Hit (extra Damage is wasted).","Sacred Artifact - At the start of the Fight, draw one Artifact card for this Enemy group. Each Crimson Hand gains +1 Health for every full $100 of value that Artifact is worth. When the Crimson Hand are defeated, roll a D6. On the roll of 5+, the Hero who killed the last model may take this Artifact."],"eliteAbilities":["Long Live the Order! Shi'Ha! - Order of the Crimson Hand now have Endurance (2) instead (no more than 2 Wounds per Hit).","Cult Veterans - Melee To Hit is now 4+.","Blessing of So'kat Kur - Tough (Immune to Critical Hits).","Repeating Rifles - Crimson Hand are now +2 Shots with Ranged Attacks.","Poisoned Weapons - Any Hero that takes one or more Wounds from Crimson Hand Combat Hits during the turn also gains a Poison marker.","Ro'kaul's Revenge - Draw 2 Artifacts for the Enemy group, gaining extra Health for each. When the Enemy group is defeated, the Hero that killed the second to last Enemy may roll for the lower value Artifact, keeping it on the roll of 5+."],"threatTier":"medium"},
  {"name":"Custodians of Targa","keywords":["Robot","Targa"],"Size":"Medium","initiative":4,"move":"10","escape":"4+","toHit":{"melee":"3+","ranged":"3+"},"stats":{"normal":{"combat":3,"damage":1,"defense":3,"health":8,"xp":"10+5"},"brutal":null},"abilities":["Assault Electro-shock - At the start of this Enemy's Activation, every adjacent Hero takes 3 Hits.","Defense Laser - Ranged Attack: Range 8, Shots 2, Damage 3","Repair (2) - At the start of this Enemy's Activation, if there are no adjacent Heroes, Heals 2 Wounds from itself and all adjacent Targa Pylon and Robot Enemies","Repair Protocol - When selecting a target, include any damaged Targa Pylons (will move to get adjacent for Repair, but targets a Random Hero with Defense Laser)."],"eliteAbilities":["Ornate Craftsmanship - +4 Health","Dark Stone Explosion - When destroyed, any Hero within 3 spaces of a Custodian of Targa immediately takes D6 Corruption Hits.","Enhanced Repair - The Repair (2) ability now Heals even if there are Heroes adjacent to the Custodian.","Power Spark - Electro-Shock now causes D6 Hits that do 2 Damage each.","Plasma Shields - Custodians of Targa are immune to Critical Hits","Multi-Laser - The Defense Laser is +2 Shots."],"threatTier":"medium"},
  {"name":"Dark Stone Brutes","keywords":["Mutant","Outlaw","Scafford"],"Size":"Medium","initiative":2,"move":"5","escape":"3+","toHit":{"melee":"4+","ranged":null},"stats":{"normal":{"combat":"3/2*","damage":4,"defense":4,"health":8,"xp":"15+5"},"brutal":null},"abilities":["Smash - Dark Stone Brute To Hit rolls of 6 ignore a Hero's Defense.","Fused with Dark Stone - Any time a Hero does one or more Wounds to a Dark Stone Brute, they may collect 1 Dark Stone on the D6 roll of 5 or 6 (limit once per turn).","*Crazed - When attacking, if there are more than one adjacent Hero, targets every adjacent Hero with Combat 2 instead.","Tough - Immune to Critical Hits."],"eliteAbilities":["Dark Stone Fist - Each Dark Stone Brute Combat Hit also causes 1 Corruption Hit (on a Smash, Willpower may still be used).","Dark Stone Rage - Combat is now 4/3*","Bounce Bullets - +1 Defense against Gun Hits.","Grapple - Escape is now 4+. Also, any time a Hero adjacent to one or more Dark Stone Brutes rolls a '1' on a To Hit roll, that Hero takes 1 automatic Combat Hit from each adjacent Dark Stone Brute (use Defense as normal).","Heavy Stone - +4 Health","Beyond Reason - Dark Stone Brute Combat Hits are now Damage +2"],"threatTier":"medium"},
  {"name":"Dark Stone Hydra","keywords":["Mutant","Beast"],"Size":"Medium","initiative":5,"move":"12","escape":"4+","toHit":{"melee":"3+","ranged":null},"stats":{"normal":{"combat":3,"damage":5,"defense":3,"health":10,"xp":"10+5"},"brutal":null},"abilities":["Fear (3) - A Hero starting their Activation adjacent automatically takes 3 Horror Hits","Dark Stone Radiation (2) - A Hero ending their Move adjacent takes 2 Corruption Hits","Slither - Moves through other models and changes targets each turn","Regeneration (D6) - Heals D6 Wounds at the start of each turn (or D3 if only 1 or 2 Heroes)","Multiple Heads - While the Dark Stone Hydra is at 20 Health or less it is -1 Combat. While at 10 Health or less it is -2 Combat","Dark Stone Scales - When killed, every Hero gains D3 Dark Stone"],"eliteAbilities":["Death Rattle - Fear (3) is replaced with Terror (3) - A Hero starting their Activation on the same Map Tile takes 3 Horror Hits","Slashing Tail - At the end of the Dark Stone Hydra's move, every adjacent Hero takes 1 Hit that is Damage 3","Crushing Gap - Any Hero that fails an Escape test adjacent to the Dark Stone Hydra takes 3 Hits that are Damage 2 each","Long Fangs - Dark Stone Hydra Combat Hits are now +2 Damage","Twisting Scales (Tough) - Immune to Critical Hits","Dark Stone Venom - Dark Stone Hydra To Hit rolls of 6 now also cause D3 Corruption Hits"],"threatTier":"medium"},
  {"name":"Dark Stone Scorpion","keywords":["Mutant","Beast"],"Size":"Medium","initiative":6,"move":"8","escape":"4+","toHit":{"melee":"4+","ranged":null},"stats":{"normal":{"combat":4,"damage":3,"defense":4,"health":12,"xp":"15+5"},"brutal":null},"abilities":["Fear (2) - A Hero starting their Activation adjacent takes 2 Horror Hits.","Dark Stone Radiation (2) - A Hero ending their Move adjacent takes 2 Corruption Hits.","Scutter - Moves through other models and changes targets each turn.","Pinching Claws - This Enemy's Melee To Hit rolls of 6+ do double Damage. If an Ally model is wounded by one of these Hits, it is cut in half (killed)!","Stinging Tail - At the start of its Activation, one Random Hero within 3 Spaces must pass an Agility 5+ test or take D6 Wounds, ignoring Defense, and gains a Potent Poison marker.","Dark Stone Spines - When killed, every Hero gains D3+1 Dark Stone."],"eliteAbilities":["Chitter - Fear (2) is replaced with Terror (2) - A Hero starting their Activation on the same Map Tile takes 2 Horror Hits.","Armored Shell - Critical Hits only reduce the Dark Stone Scorpion's Defense to 2 (instead of 0).","Rapid Sting - The Dark Stone Scorpion now uses its Stinging Tail to strike at 2 Random Heroes at the start of its Activation each turn.","Dripping Mandibles - Any Hero that takes 1 or more Wounds from Dark Stone Scorpion Attacks during the turn also gains a Poison marker.","Feisty - +2 Combat","Vicious Speed - +2 Damage on Combat Hits against Heroes with lower Initiative. +6 Health."],"threatTier":"medium"},
  {"name":"The Devil of Black Rock","keywords":["Void","Beast","Sinister"],"Size":"Medium","initiative":3,"move":"7","escape":"4+","toHit":{"melee":"3+","ranged":null},"stats":{"normal":{"combat":2,"damage":1,"defense":5,"health":40,"xp":"15+5"},"brutal":null},"abilities":["Unspeakable Terror (3) - A Hero starting their Activation on the same or adjacent Map Tile as this Enemy takes 3 Horror Hits.","Void Chitton - Always counts as having Cover 5+. Critical Hits only reduce this Enemy's Defense to 3 (rather than 0).","* Phased Time - At the start of each turn, roll 3 dice for Initiative. This Enemy Activates once at each Initiative Level rolled. For any double rolled, instead of Activating again at that Initiative Level, it Heals Wounds equal to that die's roll and has Cover 3+ this turn (instead of 5+).","Rampage - Moves through other models and re-targets at the start of each of its Activations."],"eliteAbilities":["Razor Claws - This Enemy's Combat Hits are now +2 Damage each.","Terrifying Mutations - Add an extra Beast Unleashed Trait to all Beast Enemies for this Fight.","Jagged Shell - +10 Health. Any failed Escape roll while adjacent to this Enemy does D6 Hits to that Hero (doing 2 Damage each).","Dead Eyes - All Heroes on this Enemy's Map Tile are -1 to their Willpower rolls and take 2 Horror Hits whenever they use a Grit or Ability Token.","Sweeping Slash - +1 Combat and ignores Armor.","Born of Darkness - Now roll 4 dice for Initiative each turn."],"threatTier":"medium"},
  {"name":"Feral Vampires","keywords":["Vampire","Undead"],"Size":"Medium","initiative":5,"move":"8","escape":"4+","toHit":{"melee":"4+","ranged":null},"stats":{"normal":{"combat":3,"damage":2,"defense":4,"health":8,"xp":"15+5"},"brutal":null},"abilities":["Fear (2) - A Hero starting their Activation adjacent automatically takes 2 Horror Hits.","Blood Drain - Any time this Enemy does 1 or more Wounds to a Hero with its Combat Hits, it Heals 1 Wound from itself.","Mist Form - Armor 5+","Vampiric Bite - Feral Vampire To Hit rolls of 6 ignore Defense, and roll a further D6. If this roll is also 6, the Hero gains a Bitten marker."],"eliteAbilities":["Hideous - Feral Vampires are now Fear (3) and have +1 Health.","Transfixing Stare - A Hero currently being targeted by a Feral Vampire may not use Grit.","Grave Strength - Feral Vampire Combat Hits are +2 Damage.","Flight - Feral Vampires now move through other models and change targets each turn. They are also +2 Initiative.","Masters of Mist - Mist Form is now Armor 4+.","Ancient - +2 Health, +1 Combat, and gain Keyword Ancient."],"threatTier":"medium"},
  {"name":"Ghost Warriors","keywords":["Tribal","Demon"],"Size":"Medium","initiative":7,"move":"10","escape":"4+","toHit":{"melee":"4+","ranged":null},"stats":{"normal":{"combat":2,"damage":3,"defense":3,"health":6,"xp":"50"},"brutal":null},"abilities":["From the Spirit World - Ghost Warriors always Ambush and are +2 Combat on the first turn of an Ambush.","Phase Jitter - Ghost Warriors are immune to Critical Hits and Hero Ranged Attacks will only Hit them on To Hit rolls of 5+.","Ghost Jump - Ghost Warriors move through other models and change targets each turn.","Possessed - Ghost Warriors are +2 Damage on all Hits from and against Heroes with Spirit 3 or higher."],"eliteAbilities":["Demonic Battlcry - Ghost Warriors now have Fear (2) - A Hero starting their Activation adjacent automatically takes 2 Horror Hits.","Spirit Hunters - Ghost Warriors gain an extra +1 Combat and +1 Damage against Heroes with Spirit 3 or higher.","Hateful Eyes - Ghost Warriors are +2 Damage on all Attacks.","Savage Brutality - +1 Combat and Melee To Hit 3+ now.","Hell Hatchers - Ghost Warrior Attacks now ignore Armor and every Combat Hit also causes 1 Horror Hit.","Warp Jitter - Ghost Warriors are +2 Health and may now only be Hit by Melee Attacks on To Hit rolls of 5+ as well."],"threatTier":"medium"},
  {"name":"Goliath","keywords":["Demon"],"Size":"Medium","initiative":2,"move":"6","escape":"4+","toHit":{"melee":"3+","ranged":null},"stats":{"normal":{"combat":"*","damage":3,"defense":3,"health":24,"xp":"10+5"},"brutal":null},"abilities":["Unspeakable Terror (3) - A Hero starting their Activation on the same or adjacent Map Tile automatically takes 3 Horror Hits.","* Flailing Tentacles (3) - Rolls a 3 Combat Attack against every Hero within 3 spaces.","Tough - Immune to Critical Hits."],"eliteAbilities":["Crushing Blows - The Goliath's Melee attacks are now Damage +1.","Screaming of Lost Souls - The Goliath is now Unspeakable Terror (5).","Hardened Skin - +1 Defense","Entangle - Any Hero wounded by the Goliath's Melee attacks may not move during their next Activation.","Regeneration (2) - Heals 2 Wounds at the start of each turn.","Extra Arms - The Goliath now does 4 Combat Attacks on every Hero within range."],"threatTier":"medium"},
  {"name":"Guardian","keywords":["Robot","Targa"],"Size":"Medium","initiative":2,"move":"6","escape":"2+","toHit":{"melee":"4+","ranged":"4+"},"stats":{"normal":{"combat":4,"damage":4,"defense":4,"health":40,"xp":"15+5"},"brutal":null},"abilities":["Terror (2) - A Hero starting their Activation on the same Map Tile automatically takes 2 Horror Hits.","Burning Laser - Ranged Attack: At the start of its Activation, makes a free Ranged Attack at a Random Hero.","Quake Smash - Guardian To Hit rolls of 6 ignore the target's Defense and do one Combat Hit on every other Hero within 2 spaces of the target.","Hardened Shell - Critical Hits only reduce the Guardian's Defense to 2 (instead of 0).","Control Systems - This Enemy changes targets each turn, but is -1 Combat for every full 10 Wounds it has on it."],"eliteAbilities":["Multi-Laser - The Guardian now makes 2 free Ranged Attacks every turn with its Burning Laser, each at a different target.","Dark Stone Explosion - When destroyed, any Hero within 3 spaces of the Guardian immediately takes D6 Corruption Hits.","Self Repair (2) - Heals 2 Wounds at the start of each turn (or D6 Wounds if 5 or 6 Heroes).","Blue Lasers - Guardian Burning Laser Shots are now Damage 10 with 10 symbols.","Crushing Fists - Quake Smash is now triggered on To Hit rolls of 5 or 6.","Ornate Metalwork - +20 Health and the Control Systems ability only reduces the Guardian's Combat by -1 for every full 15 Wounds now."],"threatTier":"medium"},
  {"name":"Harvesters","keywords":["Alien","Suit"],"Size":"Large","initiative":4,"move":"7","escape":"3+","toHit":{"melee":"3+","ranged":null},"stats":{"normal":{"combat":2,"damage":4,"defense":5,"health":4,"xp":"25+5"},"brutal":null},"abilities":["Tough - Immune to Critical Hits","Heavy Environment Suit - Immune to Damage from Explosives (Dynamite) and Environment or Weather sources","Grappler - Whenever a Harvester rolls doubles on its Melee To Hit rolls, it also does a free extra attack as listed below for the double rolled","Harvest - The target Hero must discard 1 Dark Stone or 1 Item with a Dark Stone icon","System Repair - Heals 1 Wound","Void Shunt - All Heroes adjacent take the 2 Wounds, ignoring Defense","Electro-Arc - These Combat Hits are +2 Damage","Bash - After resolving Hits, target Hero Bounces D3 times (like Dynamite)","Smash - These Combat Hits ignore Defense"],"eliteAbilities":["Magma Boots - +2 Health","Dimensional Recall - When killed, a portal opens and pulls the Harvester back through, spilling Void energy out. Every Hero on the Map Tile takes D3 Corruption Hits","Visions of Death - Fear (3)","Stride - +1 Initiative","Thunder Smash - Harvester To Hit rolls of 6 ignore the target's Defense and do D6 Hits to every other Hero within 2 spaces of the target","Void Gauntlets - +1 Combat. If any of the Hits roll doubles, it triggers Grapple (or triggers it twice if triples are rolled)"],"threatTier":"medium"},
  {"name":"Fast Draw Jeb Scafford","keywords":["Mutant","Outlaw","Scafford"],"Size":"Medium","initiative":6,"move":"5","escape":"3+","toHit":{"melee":"4+","ranged":"3+"},"stats":{"normal":{"combat":3,"damage":2,"defense":3,"health":10,"xp":"10+5"},"brutal":null},"abilities":["Shootout - Scafford Pistols - Ranged Attack: Range 8, Shots 2, Damage 2","Firefight - At Initiative 1, if this Enemy is not adjacent to a Hero, it will make an additional Ranged Attack (without moving - target using Shootout).","Supernatural Senses - All other Scafford models gain +2 Initiative.","Dead Eye - 'Fast Draw' Jeb Scafford's To Hit rolls of 6+ do an extra +1D6 Damage each."],"eliteAbilities":["Veteran of the War - +5 Health and +1 Initiative","Blind Vengeance - +1 Defense","Dark Stone Greed - 'Fast Draw' Jeb's Attacks are +2 Damage against any Hero that is carrying one or more Cursed Items.","Bitter Feud - All Scafford models are both +1 Health and +1 Shot/Combat for each Hero that is Keyword Low or Outlaw in the Hero Posse.","Ruthless Mutant - All of 'Fast Draw' Jeb's Attacks are now Damage +1","Ultimate Gunfighter - 'Fast Draw' Jeb now has +D6 Shots each time he makes a Ranged Attack."],"threatTier":"medium"},
  {"name":"The Lost Marshals","keywords":["Undead","Outlaw"],"Size":"Medium","initiative":2,"move":"4","escape":"3+","toHit":{"melee":"4+","ranged":"4+"},"stats":{"normal":{"combat":1,"damage":3,"defense":4,"health":5,"xp":"55+5"},"brutal":null},"abilities":["Shootout - Fear (2) - A Hero starting their Activation adjacent automatically takes 2 Horror Hits.","Gritty - Critical Hits only reduce a Lost Marshal to Defense 2 (rather than 0).","Rusty Shotguns - Ranged Attack: Range 5, Shots 1, Damage 5. Uses the D8 To Hit.","Tarnished Tin - A Lost Marshal is +1 Shot for each Wound it currently has."],"eliteAbilities":["Dead Eye Shots - Lost Marshal Ranged To Hit rolls of 6+ add +3 Damage to the Hit.","Ruthless Outlaws - Gains Terror (1) - Any Hero starting on the same Map Tile automatically takes 1 Horror Hit. This is in addition to their normal Fear (2) - so if adjacent, take 3 Horror Hits.","Quickdraw - In their first Fight Round, Lost Marshals are Initiative 6 and +2 Shots with their Ranged Attacks.","Rotten Bodies - +4 Health and Heals 1 Wound at the start of each turn.","Undead Justice - Lost Marshal Attacks are +1 Damage for each Corruption point the target currently has.","Wanted! - At the start of the Fight, mark 1 Random Hero as Wanted by the Lost Marshals. That Hero is -1 Defense against their Attacks."],"threatTier":"medium"},
  {"name":"Necronauts","keywords":["Undead","Derelict Ship"],"Size":"Medium","initiative":2,"move":"3","escape":"5+","toHit":{"melee":"4+","ranged":null},"stats":{"normal":{"combat":2,"damage":4,"defense":4,"health":5,"xp":"15+5"},"brutal":null},"abilities":["Terror (1) - A Hero starting their Activation on the same Map Tile automatically takes 1 Horror Hit.","Endurance (2) - This Enemy cannot take more than 2 Wounds from any single Hit (extra Damage is wasted).","Nightmarish - For every Hit done by a Necronaut, the Hero also takes 1 Horror Hit."],"eliteAbilities":["Cold Hunger - Necronaut Combat Hits are +1 Damage for every full 2 Sanity Damage the target had at the start of the attack.","Tangling Hoses - Adjacent Heroes cannot get Critical Hits.","Heavy Enviro-suits - +3 Health and immune to damage from Explosives.","Death Grip - Necronauts are now Escape 6+ and +1 Combat.","Jagged Helmets - Necronaut Melee To Hit rolls of 6 now cause a Bleeding Marker in addition to the normal Damage.","Forgotten Mission - Necronauts prioritize targets based on highest Hero Level followed by whoever currently has the most XP at that Hero Level. They also get +X Combat, where X is the target's Hero Level."],"threatTier":"medium"},
  {"name":"Night Terrors","keywords":["Demon"],"Size":"Medium","initiative":3,"move":"5","escape":"3+","toHit":{"melee":"5+","ranged":null},"stats":{"normal":{"combat":4,"damage":4,"defense":3,"health":12,"xp":"10+5"},"brutal":null},"abilities":["Terror (2) - A Hero starting their Activation on the same Map Tile automatically takes 2 Horror Hits."],"eliteAbilities":["Transfixing Stare - Escape 6+.","Gibbering Nightmare - Terror (2) is replaced with: Unspeakable Terror (2) - Any Hero starting on the same or adjacent Map Tile automatically takes 2 Horror Hits.","Brutes - +6 Health.","Soul Drain - All Night Terror Hits and Horror Hits are now Damage +2.","Regeneration (2) - Heals 2 wounds at the start of each turn.","Hunters - Night Terror Melee To Hit is now 4+."],"threatTier":"medium"},
  {"name":"Ol' One Eye Jackson","keywords":["Mutant","Outlaw","Scafford"],"Size":"Medium","initiative":4,"move":"5","escape":"3+","toHit":{"melee":"4+","ranged":"4+"},"stats":{"normal":{"combat":4,"damage":2,"defense":4,"health":10,"xp":"15+5"},"brutal":null},"abilities":["Shootout - Scattyford Pistol - Ranged Attack: Range - 8, Shots - 2, Damage 2","Firefight - At Initiative 1, if this Enemy is not adjacent to a Hero, it will make an additional Ranged Attack (without moving - target using Shootout).","Void Eye - At the start of each turn, one Random Hero in Ol' One Eye Jackson's Line of Sight takes D6 Corruption Hits","Band of Misfits - All other Scattyford models in this Fight are +2 Health and +2 Combat. This effect persists even if Ol' One Eye Jackson is killed."],"eliteAbilities":["Rejected Son - +5 Health and Melee To Hit rolls of 6+ do +3 Damage.","Worthing Tentacle Mass - +1 Defense and +3 Health","Need for Approval - Ol' One Eye loses Shootout but gains Assault. He now prioritizes his targets based on the Hero with the lowest current Health.","Bitter Feud - All Scattyford models are both +1 Health and +1 Shot/Combat for each Hero that is Keyword Low or Outlaw in the Hero Posse.","Unstable Mutant - At the start of each turn, draw a Hideous Mutation card to play on Ol' One Eye. The effects of that card only last until the end of the turn.","\"Look Into My EYE!!!\" - Void Eye now does 2D6 Horror Hits in addition to the Corruption Hits."],"threatTier":"medium"},
  {"name":"Silver Back' Pa Scaffold","keywords":["Mutant","Outlaw","Scaffold","Legendary"],"Size":"Medium","initiative":2,"move":"5","escape":"3+","toHit":{"melee":"3+","ranged":"4+"},"stats":{"normal":{"combat":1,"damage":"D8","defense":3,"health":7,"xp":"10+5"},"brutal":null},"abilities":["Shootout - Blunderbliss - Ranged Attack: Range - 5 Shots - * Damage D8. Uses the D8 To Hit. * Shots are equal to the number of Noise markers on the target.","Firefight - At Initiative 1, if this Enemy is not adjacent to a Hero, it will make an additional Ranged Attack (without moving - target using Shootout).","Ear Horn - While Pa Scaffold is on the board, Heroes collect Noise Markers. Only targets Heroes with 1 or more Noise markers.","'Ol Sum Bih' - Pa Scaffold has Tough (Immune to Critical Hits) and Endurance (1) (takes no more than 1 Wound per Hit. Extra Damage is wasted)."],"eliteAbilities":["\"Git off ma' Land!\" - The Blunderbliss now has 2 Shots for each Noise marker the target has.","Moonshine - Whenever the 'Hold Back the Darkness' roll is failed, Heals D6 Wounds (or D3 if only 1 or 2 Heroes).","Dark Stone Pipe - Comes into play with D6 Dark Stone shards. Whenever Pa Scaffold would take a Wound or make an Attack, remove 1 Dark Stone from him to ignore that Wound or add +2 Damage during that Attack.","Straining to Hear - At the start of each turn, every Hero gains 1 Noise marker.","Long Grey Beard - +3 Health and +1 Combat.","\"Ifs My Day...\" - All Heroes within 2 spaces of Pa Scaffold need to roll 1 higher than normal To Hit and for Defense and Willpower (6+ still succeeds)."],"threatTier":"medium"},
  {"name":"Rats Nest","keywords":["Mutant","Beast"],"Size":"Medium","initiative":0,"move":"0","escape":"1+","toHit":{"melee":"-","ranged":"-"},"stats":{"normal":{"combat":0,"damage":0,"defense":1,"health":12,"xp":"10+5"},"brutal":null},"abilities":["Immobile - Rats Nest cannot be moved in any way.","Dark Stone Radiation (1) - A Hero ending their Move adjacent to this Enemy takes 1 Corruption Hit","Spawner - At the end of each Fight Round, roll 3 dice for the Rats Nest. For each roll of 4+, place 1 new Scourge Rat adjacent to it. If there is no empty space to place the Scourge Rat, instead every Hero adjacent to the Rats Nest takes 1 Hit (Damage 3)."],"eliteAbilities":["Thick Bedding - +8 Health","Dark Stone Horde - Rats Nest is now Dark Stone Radiation (2) and at the end of the Fight, each Hero may collect D3+1 Dark Stone.","Regeneration (2) - Heals 2 Wounds at the start of each turn.","Fortified Bulk - +3 Defense against Ranged Attacks","Squirming Mass - Rats Nest now spawns new Scourge Rats on rolls of 3+.","Endless Stream - Rats Nest now rolls 4 dice each turn to spawn Scourge Rats."],"threatTier":"medium"},
  {"name":"Rifle Bandits","keywords":["Outlaw"],"Size":"Medium","initiative":5,"move":"6","escape":"3+","toHit":{"melee":"4+","ranged":"5+"},"stats":{"normal":{"combat":2,"damage":2,"defense":3,"health":3,"xp":"15"},"brutal":null},"abilities":["Shootout - Size: Medium","Bandit Rifles - Ranged Attack: Range - 12 Shots - 2 Damage 4","Hail of Bullets - Bandit Ranged To Hit rolls of 6 cause 3 Hits each."],"eliteAbilities":["Rustlers - +5 Health","Heavy Dusters - +1 Defense and +2 Health","Thieves - +2 Initiative. Also any Hero that takes one or more wounds from an adjacent Bandit must lose 1 Dark Stone or $100.","Dark Stone Sights - Bandits are +2 Shots with their Ranged Attack","Cutthroats - All Bandit Attacks are now Damage +1","Gunfighters - Range To Hit is now 4+"],"threatTier":"medium"},
  {"name":"Sand Crabs","keywords":["Beast","Blasted Wastes"],"Size":"Medium","initiative":5,"move":"6","escape":"4+","toHit":{"melee":"4+","ranged":"5+"},"stats":{"normal":{"combat":5,"damage":2,"defense":5,"health":7,"xp":"20+5"},"brutal":null},"abilities":["Fear (3) - A Hero starting their Activation adjacent automatically takes 3 Horror Hits.","Sand Tunnels - Always Attacks from Ambush and moves through other models.","Heavy Chitin Plating - Critical Hits only reduce this Enemy's Defense to 3 (rather than 0).","Pinching Claws - This Enemy's Melee To Hit rolls of 6 ignore Defense and Armor."],"eliteAbilities":["Tunnel Traps - In the first turn of an Attack, Sand Crabs are +5 Combat and erupt directly under the Heroes' Place. Sand Crabs in the Heroes' space, instead of adjacent, pushing the Hero to an adjacent empty space (if none, Hero is not a valid target).","Razor Sharp Claws - Sand Crab Combat Hits are now +2 Damage.","Crusty Shells - +3 Health (may be increased multiple times).","Regeneration (2) - Heals 2 wounds at the start of each turn.","Spitting Sulfur - Any time a Sand Crab needs to select a Target, roll a D6. On the roll of 4+, first spits boiling Sulfur at a Random Hero within Range: Range 4 Shots 2 Damage 5"],"threatTier":"medium"},
  {"name":"Scafford Gang","keywords":["Mutant","Outlaw","Scafford"],"Size":"Medium","initiative":4,"move":"5","escape":"3+","toHit":{"melee":"4+","ranged":"4+"},"stats":{"normal":{"combat":3,"damage":2,"defense":3,"health":5,"xp":"25"},"brutal":null},"abilities":["Shootout - Scafford Pistols - Ranged Attack: Range 8, Shots 2, Damage 2","Firefight - At Initiative 1, if this Enemy is not adjacent to a Hero, it will make an additional Ranged Attack (without moving - target using Shootout)."],"eliteAbilities":["Veterans of the War - +2 Health and +1 Initiative","Rocky Skin - +1 Defense","Dark Stone Greed - All Scafford Gang Attacks are +2 Damage against any Hero that is carrying one or more Loot Items","Bitter Feud - All Scafford models are both +1 Health and +1 Shot/Combat for each Hero that is Keyword Law or Outlaw in the Hero Posse","Ruthless Mutants - All Scafford Gang Attacks are now Damage +1","Gunfighters - Range To Hit is now 3+"],"threatTier":"medium"},
  {"name":"Scafford Highwaymen","keywords":["Mutant","Outlaw","Scafford"],"Size":"Medium","initiative":4,"move":"5","escape":"4+","toHit":{"melee":"4+","ranged":"4+"},"stats":{"normal":{"combat":4,"damage":2,"defense":3,"health":5,"xp":"35"},"brutal":null},"abilities":["Assault, Scafford Gang - Highwaymen Shotgun - Ranged Attack: Range 4 Shots 1 Damage. Uses the D8 To Hit","Run 'n' Gun - When making a Ranged Attack, this Enemy rolls its full Shots against the target and every other Hero adjacent to the target","Robbers - A Hero loses $5 for every Wound they take from this Enemy's Combat Hits","Heavy Dusters - Armor 5+","Slithering Tentacles (1) - Unless killed, this model heals 1 Wound at the end of every Attack that damaged it (or had at least 1 Hit assigned to it)."],"eliteAbilities":["Stagecoach Hunters - +3 Health and +1 Shot with their Ranged Attack.","Outlaw Armor - Now Armor 4+","Stretchy Tentacle Limbs - Now Slithering Tentacles (2) which Heals 2 Wounds at the end of each Attack against them instead.","Bitter Feud - All Scafford models are both +1 Health and +1 Shot/Combat for each Hero that is Keyword Law or Outlaw in the Hero Posse.","Ruthless Mutants - All Scafford Highwaymen Attacks are +1 Damage.","Deadly Accurate - Range To Hit is now 3+ and their Ranged To Hit rolls of 6+ do Damage instead."],"threatTier":"medium"},
  {"name":"Scourge Rats","keywords":["Mutant","Beast"],"Size":"Medium","initiative":8,"move":"12","escape":"3+","toHit":{"melee":"3+","ranged":null},"stats":{"normal":{"combat":1,"damage":3,"defense":1,"health":3,"xp":"15"},"brutal":null},"abilities":["Swarm - May move through other models and gains +1 Combat for each other adjacent Scourge Rat."],"eliteAbilities":["Lunge - Scourge Rat Melee To Hit is now 2+.","Shadow Scurry - Scourge Rats are now +2 Defense against Ranged Attacks (not including Explosives).","Dark Stone Radiation (1) - A Hero ending their Move adjacent to this Enemy takes 1 Corruption Hit.","Twin Tails - +2 Move and +1 Initiative.","Two Heads - +1 Combat.","Plague Bite - A Hero that takes one or more Wounds from a Scourge Rat Combat Hit also gains a Poison Marker."],"threatTier":"medium"},
  {"name":"Sgt. Bunker","keywords":["Mutant","Outlaw","Scaffold"],"Size":"Medium","initiative":4,"move":"5","escape":"3+","toHit":{"melee":"4+","ranged":"4+"},"stats":{"normal":{"combat":4,"damage":2,"defense":3,"health":15,"xp":"10+5"},"brutal":null},"abilities":["Shootout - Scaffold Pistol - Ranged Attack: Range 6 Shots 3 Damage 2","Firefight - At Initiative 1, if this Enemy is not adjacent to a Hero, it will make an additional Ranged Attack (without moving - target using Shootout). Ignore it Rebel Yell was triggered","Rebel Yell - Roll a D6 at the start of the turn. On the roll of 4+, all Scaffold models ignore Shootout and their Ranged Attacks this turn, moving and tanging normally for Melee Attacks. They also gain +5 Move and +2 Combat for this Activation."],"eliteAbilities":["Veteran of the War - +5 Health and +1 Initiative","Iron Will - +1 Defense","Dark Stone Greed - Sgt. Bunker's Attacks are +2 Damage against any Hero that is carrying one or more Items","Bitter Feud - All Scaffold models are both +1 Health and +1 Shot/Combat for each Hero that is Keyword Law or Outlaw in the Hero Posse","Ruthless Mutant - All of Sgt. Bunker's Attacks are now Damage +1","Southern Fury - Whenever Rebel Yell is triggered, all Heroes on the same Map Tile as one or more Scaffold models take D6 Horror Hits"],"threatTier":"medium"},
  {"name":"Shikarri Nomad Crusaders","keywords":["Shikarri","Soldier","Fanatic"],"Size":"Medium","initiative":4,"move":"5","escape":"4+","toHit":{"melee":"4+","ranged":"3+"},"stats":{"normal":{"combat":3,"damage":2,"defense":3,"health":4,"xp":"35"},"brutal":null},"abilities":["Snap Fire - Ranged Attack: Range 10, Shots 2, Damage 3","Nomad Armor - Armor 4+","L-23 Pulse Guns - Ranged Attack: Range 10, Shots 2, Damage 3","Hunting Corruption - Prioritizes targets (including for Snap Fire) based on most Mutations, or most Corruption Points if tied for number of Mutations","Seek and Destroy - Shikarri Nomad Attacks are +1 Damage for each Dark Stone (or Dark Stone Icon on an Item) that the target carries (max +5). If no Hero in the party has any Dark Stone, Mutations, or Corruption Points, they do not fight the Heroes. Instead, the Shikarri give each Hero a Loot card for keeping it clean, and depart peacefully."],"eliteAbilities":["Covering Fire - When making a Ranged Attack, each Shikarri Nomad gains +1 Shot for each other Shikarri Nomad model that is currently adjacent to a Hero on the same or adjacent Map Tile.","Veterans of the Void War - Shikarri Nomads are now Defense 4.","Tactical Strike - +1 Combat and +1 Shot. Also, Shikarri Nomads automatically pass their rolls for Hit and Run for Snap Fire.","Fanatical Zeal - +2 Health and +2 Initiative.","Vengeance Ammo - L-23 Pulse Guns Damage is now 4.","\"For the Fallen of Shikarri\" - Shikarri Nomads gain +2 Health for each other Shikarri Nomad that has been killed during this Fight."],"threatTier":"medium"},
  {"name":"Slashers","keywords":["Beast"],"Size":"Medium","initiative":4,"move":"5","escape":"3+","toHit":{"melee":"3+","ranged":null},"stats":{"normal":{"combat":2,"damage":"D6","defense":4,"health":6,"xp":"15+5"},"brutal":null},"abilities":["Fear (2) - A Hero starting their Activation adjacent automatically takes 2 Horror Hits.","Chiton Plating - Critical Hits only reduce a Slasher's Defense to 2 (rather than 0)."],"eliteAbilities":["Beastly Speed - +2 Initiative","Segmented Plating - +2 Health","Spiked Shell - Any failed Escape roll while adjacent to a Slasher does 3 Hits (with 2 Damage each) to that Hero.","Hateful Chitter - The Slasher's Fear (2) is replaced with Terror (2) - A Hero starting their Activation on the same Map Tile automatically takes 2 Horror Hits.","Lashing Tongue - +1 Combat","Barbed Claws - Slasher Combat Hits are now +2 Damage each."],"threatTier":"medium"},
  {"name":"Snow Terrors","keywords":["Demon"],"Size":"Medium","initiative":4,"move":"5","escape":"3+","toHit":{"melee":"5+","ranged":null},"stats":{"normal":{"combat":4,"damage":4,"defense":4,"health":12,"xp":"30+5"},"brutal":null},"abilities":["Terror (2) - A Hero starting their Activation on the same Map Tile automatically takes 2 Horror Hits.","Thick Fur - Defense 4.","Natural Habitat - Initiative 4"],"eliteAbilities":["Transpixing Stare - Escape 6+.","Gibbering Nightmare - Unspeakable Terror (2) - Any Hero starting on the same or adjacent Map Tile automatically takes 2 Horror Hits.","Brutes - +6 Health.","Soul Drain - All Snow Terror Hits and Horror Hits are now +2.","Regeneration (2) - Heals 2 Wounds at the start of each turn.","Hunters - Snow Terror Melee To Hit is now 4+."],"threatTier":"medium"},
  {"name":"Stone Face McCoy","keywords":["Mutant","Outlaw","Scafford","Legendary"],"Size":"Medium","initiative":3,"move":"4","escape":"3+","toHit":{"melee":"4+","ranged":"4+"},"stats":{"normal":{"combat":3,"damage":2,"defense":4,"health":15,"xp":"15+5"},"brutal":null},"abilities":["Shootout - Scarford Pistol - Ranged Attack: Range 8, Shots 4, Damage 2","Firefight - At Initiative 1, if this Enemy is not adjacent to a Hero, it will make an additional Ranged Attack (without moving, target using Shootout).","Stone Cold Stare - Heroes on the same Map Tile as Stone Face may not Recover Grit.","Ruthless Ways - All Scarford model To Hit rolls of 6+ ignore the target's Defense.","Tough - Immune to Critical Hits"],"eliteAbilities":["Rocky Skin - +5 Wounds per Hit. Extra Damage is wasted.","Massive Stone Fist - +1 Combat and +3 Damage on Combat Hits.","Chunky Cigar - +3 Health and Regeneration (2) - (Heals 2 Wounds at the start of each turn).","Bitter Feud - All Scaffold models are both +1 Health and +1 Shot/Combat for each Hero that is Keyword Law or Outlaw in the Hero Posse.","Poker Face - When using Firefight, Stone Face now makes an even free Ranged Attack.","Rockslide Rage - Whenever a Hero does 3 or more Wounds to Stone Face from a single Hit, Stone Face immediately makes a free move toward that Hero, and makes a free Melee Attack against them, outside of the normal turn sequence."],"threatTier":"medium"},
  {"name":"Stranglers","keywords":["Demon"],"Size":"Medium","initiative":4,"move":"6","escape":"6+","toHit":{"melee":"3+","ranged":null},"stats":{"normal":{"combat":4,"damage":1,"defense":2,"health":3,"xp":"25"},"brutal":null},"abilities":["Ensnare - Strangler To Hit rolls of 6 count as 3 Hits each."],"eliteAbilities":["Dark Stone Hunger - +2 Combat while attacking any Hero with 1 or more Dark Stone on them.","Snapping Jaws - Any Hero that starts their Activation adjacent to one or more Stranglers must pass an Agility 5+ test or take D6 Hits.","Scramble - +1 Initiative","Lashing Arms - +2 Combat.","Regeneration (2) - Heals 2 Wounds at the start of each turn.","Writhing Form - +3 Health."],"threatTier":"medium"},
  {"name":"Swamp Slashers","keywords":["Beast"],"Size":"Medium","initiative":4,"move":"8","escape":"3+","toHit":{"melee":"3+","ranged":null},"stats":{"normal":{"combat":2,"damage":"D6","defense":4,"health":6,"xp":"15+5"},"brutal":null},"abilities":["Fear (2) - A Hero starting their Activation adjacent automatically takes 2 Horror Hits.","Chiton Plating - Critical Hits only reduce a Swamp Slasher's Defense to 2 (rather than 0).","Flitting Tongues - Swamp Slashers choose their targets based on who has the most Dark Stone on them first.","Lunge - Move 8"],"eliteAbilities":["Beastly Spread - +2 Initiative.","Segmented Plating - +2 Health.","Spiked Shell - Any failed Escape roll while adjacent to a Swamp Slasher does 3 Hits (with 2 Damage each) to that Hero.","Hateful Chitter - The Swamp Slasher's Fear (2) is replaced with Terror (2) - A hero starting their Activation on the same Map Tile automatically takes 2 Horror Hits.","Lashing Tongue - +1 Combat.","Barbed Claws - Swamp Slasher Combat Hits are now +2 Damage each."],"threatTier":"medium"},
  {"name":"Targa Pylons","keywords":["Hazard"],"Size":"Medium","initiative":4,"move":"0","escape":"1+","toHit":{"melee":"4+","ranged":"3+"},"stats":{"normal":{"combat":"-","damage":"-","defense":4,"health":8,"xp":"15+5"},"brutal":null},"abilities":["Immobile - Targa Pylons cannot be moved in any way.","Stonework - Critical Hits only reduce a Targa Pylon's Defense to 2 (rather than 0).","Burning Laser - Ranged Attack: Range - 12, Shots - 1, Damage 2. Each of a Targa Pylon's Ranged Hits counts as D6 Hits."],"eliteAbilities":["Ornate Craftsmanship - +2 Health","Dark Stone Explosion - When destroyed, any Hero within 2 spaces of the Targa Pylon immediately takes D6 Corruption Hits.","Self Repair (1) - Heals 1 Wound at the start of each turn.","Blue Lasers - Targa Pylon Shots are now Damage 3","Alarm - The alarm set off by the defensive pylons activating has attracted attention. Draw a Threat card to add to the fight as an Ambush.","Multi-Laser - Targa Pylons now make 2 Ranged Attacks every turn, each at a different target."],"threatTier":"medium"},
  {"name":"Tentacles","keywords":["Void"],"Size":"Medium","initiative":2,"move":"6","escape":"4+","toHit":{"melee":"4+","ranged":null},"stats":{"normal":{"combat":3,"damage":3,"defense":2,"health":4,"xp":"30"},"brutal":null},"abilities":["Smash - Tentacle To Hit rolls of 6 ignore a Hero's Defense."],"eliteAbilities":["Entangle - Any Hero wounded by a Tentacle may not move during their next Activation.","Eruption - Tentacles move through other models and change targets each turn.","Writhing - +2 Defense.","Biting Suckers - Tentacle Melee Hits are now Damage +2","Lashing Strike - +1 Combat.","Swift - +2 Initiative"],"threatTier":"medium"},
  {"name":"Trun Hunters","keywords":["Alien","Tribal","Trun"],"Size":"Medium","initiative":3,"move":"5","escape":"3+","toHit":{"melee":"3+","ranged":"5+"},"stats":{"normal":{"combat":2,"damage":4,"defense":"*","health":12,"xp":"10+5"},"brutal":null},"abilities":["Assault","Fear (1) - A Hero starting their Activation adjacent to this Hero automatically takes 1 Horror Hit","Hunting Prowess - Defense is equal to the Hero Posse Level","Knockback - A Hero that fails one or more Defense rolls against this Enemy's Melee Attack is Bounced 2 spaces in a single direction. If this Bounce is stopped because of hitting a wall, the Hero takes an extra 2 Damage, ignoring Defense.","Trun Thud Pistol - Ranged Attack: Range 5, Shots 1, Damage D6"],"eliteAbilities":["Hearty Roar - Fear (2)","Rapid Shots - The Trun Thud Pistol is now Shots 2","Rage - Trun Hunter Combat Hits are now Damage +2","Double-Barrel Thud Pistol - Trun Thud Pistol is now Damage 1d","Targeting Sights - Range To Hit is now 4+","Savage - +1 Combat"],"threatTier":"medium"},
  {"name":"Vampire Lord","keywords":["Vampire","Undead"],"Size":"Large","initiative":5,"move":"8","escape":"4+","toHit":{"melee":"4+","ranged":null},"stats":{"normal":{"combat":6,"damage":2,"defense":4,"health":16,"xp":"15+5"},"brutal":null},"abilities":["Terror (2) - Any Hero starting their Activation on the same Map Tile takes 2 Horror Hits, dealing 2 Sanity Damage each.","Blood Drain - Any time this Enemy does 1 or more Wounds to a Hero with its Combat Hits, it Heals 1 Wound from itself.","Vampiric Bite - Vampire Lord To Hit rolls of 6 ignore Defense, and roll a further D6. If this roll is also 6, the Hero gains a Bitten Marker.","Mist Form - Armor +5.","Tough - Immune to Critical Hits."],"eliteAbilities":["Hideous - Vampire Lord is now Terror (3) and has +1 Health.","Transfixing Stare - A Hero currently being targeted by the Vampire Lord may not use Grit.","Grave Strength - Vampire Lord Combat Hits are now +2 Damage.","Flight - Vampire Lord now moves through other models and changes targets each turn. It is also +2 Initiative.","Masters of Mist - Mist Form is now Armor +4.","Ancient - +2 Health, +1 Combat, and gain Keyword Ancient."],"threatTier":"medium"},
  {"name":"Void Hive","keywords":["Void"],"Size":"Medium","initiative":0,"move":"0","escape":"2+","toHit":{"melee":"4+","ranged":null},"stats":{"normal":{"combat":0,"damage":0,"defense":2,"health":20,"xp":"5+5"},"brutal":null},"abilities":["Immobile - A Void Hive cannot be moved in any way.","Spawn - At the end of each turn, roll a D6 for the Void Hive. On the roll of 3+, place 1 new Void Swarm adjacent to it. If a Void Swarm cannot be placed for any reason, instead every Hero adjacent to the Void Hive takes 3 Hits that do 2 Damage each.","Stirring the Hive - Whenever a Hero assigns a Combat Hit to the Void Hive, immediately roll for it to Spawn a Void Swarm as above.","Void Nectar - Every Hero adjacent when destroyed may gain a Tonic Side Bar Token."],"eliteAbilities":["Terrifying Buzzing - Terror (1) (Heroes starting their Activation on the same Map Tile take 1 Horror Hit).","Void Gases - Any Hero adjacent to the Void Hive is -1 on their Defense rolls.","Sticky Combs - Regeneration (3) (Heals 3 Wounds at the start of each turn).","Mega-Hive - +10 Health and Void Nectar gives 2 Tonic Tokens.","Full Swarm - Void Hives now roll twice for Spawn at the end of each turn or when assigned a Combat Hit.","Scent of the Swarm Queen - All Void Swarms on the same Map Tile as one or more Void Hives are +2 Damage on their Combat Hits."],"threatTier":"medium"},
  {"name":"Void Hounds","keywords":["Void","Beast"],"Size":"Large","initiative":7,"move":"10","escape":"4+","toHit":{"melee":"3+","ranged":null},"stats":{"normal":{"combat":6,"damage":1,"defense":"*","health":5,"xp":"20+5"},"brutal":null},"abilities":["Laying in Wait - Always starts from Ambush and each Hero takes 3 Horror Flips at the start of the turn in which the Void Hounds appear.","*Void Phasing - A Void Hounds Defense is equal to the current Initiative Level in the turn order. Void Hounds may move through other models.","Pack Attack - At the start of the Void Hound Activation (after initial Ambush), roll a D6. On 1 or 2 all Void Hounds change targets, on 6, all Void Hounds re-target to a single random Hero."],"eliteAbilities":["Vicious Attack - Void Hound Melee To Hit is now 2+.","On the Scent - The Pack Attack ability now has all Void Hounds re-target to a single Hero on the roll of 5 or 6.","Reality Phasing - +3 Health","Nightmare Howl - At the start of each turn, as long as at least one Void Hound is alive, all Heroes take 2 Horror Hits.","Lashing Tail - +2 Combat","Snapping Jaws - Void Hound Melee attacks are now. Damage +2."],"threatTier":"medium"},
  {"name":"Void Sorcerers","keywords":["Void","Magik"],"Size":"Medium","initiative":5,"move":"7","escape":"3+","toHit":{"melee":"4+","ranged":"4+"},"stats":{"normal":{"combat":1,"damage":2,"defense":2,"health":15,"xp":"10+5"},"brutal":null},"abilities":["Shootout Void Magik - At the start of its Activation, if not adjacent to a Hero (after any Retreat move), a Void Sorcerer rolls a D6. On 1-3 it hurts a Void Bolt, targeting as per Shootout. On 4-6 it casts a random Spell from the Void Magik deck.","Void Bolt - Ranged Attack: Range 16 Shots 3 Damage 2 Ignores Defense","Phase Dagger - Void Sorcerer Combat His ignore Defense When making a Melee Attack, Void Sorcerers attack every adjacent Hero","Void Shield - Immune to Critical Hits unless adjacent to attacker."],"eliteAbilities":["Ceremonial Blades - +1 Combat","Ensnaring Face Tentacles - Void Sorcerers are now Melee To Hit 3+ and Escape 5+","Regeneration (3) - Heals 3 wounds at the start of each turn.","Void Death - When killed, a Void Sorcerer implodes! Every Hero within 2 spaces of the model immediately takes D8 Hits.","Magic Mastery - The Void Sorcerers' Void Magik Spells are cast at 1 higher level than normal. If already at max level, each Sorcerer will cast both a Spell and a Void Bolt each turn (or a Spell and Melee Attack if adjacent to one or more Heroes)."],"threatTier":"medium"},
  {"name":"Void Swarms","keywords":["Void","Beast"],"Size":"Medium","initiative":7,"move":"12","escape":"4+","toHit":{"melee":"4+","ranged":null},"stats":{"normal":{"combat":2,"damage":2,"defense":5,"health":1,"xp":"10"},"brutal":null},"abilities":["Angry Cloud - Line of Sight may not be drawn through a Void Swarm's space.","Buzzing Flight - Moves through other models. Does not change targets, but will follow its target, even if the target moves away.","Hateful Swarm - Only moves the shortest distance to reach its target. If the number of Void Swarms adjacent to a Hero is equal to or higher than that Hero's Cunning, all Void Swarms attacking that Hero this turn are +2 Combat each."],"eliteAbilities":["Chomping Jaws - Void Swarm Melee To Hit is now 3+.","Void Sting - Void Swarm To Hit rolls of 6+ ignore Defense.","Bloated Bellies - +2 Health","Glitter Wings - Critical Hits now only reduce Void Swarm Defense to 4.","Frantic Bite - +2 Combat","Eating Dark Stone - A Hero that takes one or more Wounds from Void Swarm Combat Hits must also discard 1 Dark Stone shard. If you have no Dark Stone, roll a D6, on the roll of 1 or 2, you must discard an Item with a Dark Stone Icon instead."],"threatTier":"medium"},
  {"name":"Wasteland Warlord","keywords":["Alien","Outlaw","Blasted Wastes"],"Size":"Medium","initiative":7,"move":"7","escape":"5+","toHit":{"melee":"4+","ranged":"4+"},"stats":{"normal":{"combat":4,"damage":3,"defense":3,"health":12,"xp":"10+5"},"brutal":null},"abilities":["Battle Cry - At the start of his Activation, all other Alien and Beast Enemies on his Map Tile gain +1 Combat until the end of the turn.","Swirling Attack - When making a Melee Attack, targets every Hero adjacent.","Brutal Blade - Any Hero that takes 1 or more Wounds from the Wasteland Warlord's Combat Hit must pass an Agility 5+ test or also gain 1 Bleeding marker.","Tribal Shield - The Wasteland Warlord's Defense is doubled while adjacent to the attacker."],"eliteAbilities":["Chain Axe - Wasteland Warlord To Hit rolls of 6+ ignore Defense and Armor.","Veteran of the Wastes - Melee To Hit is now 3+.","Warlord's Armor - Wasteland Warlord now has Armor 5+.","Savage - +2 Combat","Tribal Leader - +8 Health","Prized Artifact - Draw a Mine Artifact for the Wasteland Warlord. If it is a Hand Weapon, add any listed bonuses to his Melee Attacks. If it is a Ranged Weapon, he will make a Ranged Attack with it at the start of his Activation each turn, at a Random Hero in Range and Line-of-Sight. If anything else, he gains +5 Health. When killed, a Random Hero may collect the Artifact on the D6 roll of 4+."],"threatTier":"medium"}
];
