export const scannedEnemies = [
  {
    name: "Egg Sacks",
    keywords: ["Void", "Beast"],
    Size: "Medium",
    initiative: 0,
    move: "0",
    escape: "2+",
    meleeToHit: "-",
    rangedToHit: "-",
    normalCombat: 0, normalDamage: 0, normalDefense: 2, normalHealth: 15, normalXp: "5+5",
    brutalCombat: 0, brutalDamage: 0, brutalDefense: 0, brutalHealth: 0, brutalXp: "0",
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
    ],
    brutalEliteAbilities: []
  },
  {
    name: "Seeker Drones",
    keywords: ["Robot", "Targa"],
    Size: "Medium",
    initiative: 6,
    move: "8",
    escape: "3+",
    meleeToHit: "-",
    rangedToHit: "3+",
    normalCombat: 0, normalDamage: 0, normalDefense: 4, normalHealth: 5, normalXp: "10+5",
    brutalCombat: 0, brutalDamage: 0, brutalDefense: 0, brutalHealth: 0, brutalXp: "0",
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
    ],
    brutalEliteAbilities: []
  },
  {
    name: "Void Spiders",
    keywords: ["Beast", "Void"],
    Size: "Medium",
    initiative: 6,
    move: "8",
    escape: "4+",
    meleeToHit: "4+",
    rangedToHit: null,
    normalCombat: 2, normalDamage: 2, normalDefense: 0, normalHealth: 3, normalXp: "10",
    brutalCombat: 0, brutalDamage: 0, brutalDefense: 0, brutalHealth: 0, brutalXp: "0",
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
    ],
    brutalEliteAbilities: []
  },
  {
    name: "Ancient Spiders",
    keywords: ["Beast", "Void", "Targa"],
    Size: "Medium",
    initiative: 6,
    move: "8",
    escape: "4+",
    meleeToHit: "3+",
    rangedToHit: null,
    normalCombat: 2, normalDamage: 2, normalDefense: 0, normalHealth: 3, normalXp: "20",
    brutalCombat: 0, brutalDamage: 0, brutalDefense: 0, brutalHealth: 0, brutalXp: "0",
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
    ],
    brutalEliteAbilities: []
  },
  {
    name: "Trench Spiders",
    keywords: ["Beast", "Void", "Trederra"],
    Size: "Medium",
    initiative: 6,
    move: "8",
    escape: "4+",
    meleeToHit: "4+",
    rangedToHit: null,
    normalCombat: 2, normalDamage: 2, normalDefense: 0, normalHealth: 3, normalXp: "20",
    brutalCombat: 0, brutalDamage: 0, brutalDefense: 0, brutalHealth: 0, brutalXp: "0",
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
    ],
    brutalEliteAbilities: []
  },
  {
    name: "Nightshade Spiders",
    keywords: ["Beast", "Void", "Forest of the Dead"],
    Size: "Medium",
    initiative: 6,
    move: "8",
    escape: "4+",
    meleeToHit: "4+",
    rangedToHit: null,
    normalCombat: 2, normalDamage: 2, normalDefense: 0, normalHealth: 3, normalXp: "15",
    brutalCombat: 0, brutalDamage: 0, brutalDefense: 0, brutalHealth: 0, brutalXp: "0",
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
    ],
    brutalEliteAbilities: []
  },
  {
    name: "Hungry Dead",
    keywords: ["Undead"],
    Size: "Medium",
    initiative: 1,
    move: "2",
    escape: "4+",
    meleeToHit: "4+",
    rangedToHit: null,
    normalCombat: 1, normalDamage: 3, normalDefense: 4, normalHealth: 1, normalXp: "20",
    brutalCombat: 0, brutalDamage: 0, brutalDefense: 0, brutalHealth: 0, brutalXp: "0",
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
    ],
    brutalEliteAbilities: []
  },
  {
    name: "Hell Vermin",
    keywords: ["Mutant", "Beast"],
    Size: "Medium",
    initiative: 6,
    move: "8",
    escape: "4+",
    meleeToHit: "4+",
    rangedToHit: null,
    normalCombat: 3, normalDamage: 4, normalDefense: 2, normalHealth: 13, normalXp: "10+5",
    brutalCombat: 0, brutalDamage: 0, brutalDefense: 0, brutalHealth: 0, brutalXp: "0",
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
    ],
    brutalEliteAbilities: []
  },
  {
    name: "The Undead Gunslinger",
    keywords: ["Undead", "Outlaw"],
    Size: "Medium",
    initiative: 8,
    move: "6",
    escape: "3+",
    meleeToHit: "5+",
    rangedToHit: "3+",
    normalCombat: 4, normalDamage: 4, normalDefense: 4, normalHealth: 10, normalXp: "15+5",
    brutalCombat: 0, brutalDamage: 0, brutalDefense: 0, brutalHealth: 0, brutalXp: "0",
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
    ],
    brutalEliteAbilities: []
  },
  {
    name: "The Lost Army",
    keywords: ["Undead", "Soldier", "Lost Army"],
    Size: "Medium",
    initiative: 2,
    move: "2",
    escape: "4+",
    meleeToHit: "3+",
    rangedToHit: "5+",
    normalCombat: 1, normalDamage: 6, normalDefense: 4, normalHealth: 3, normalXp: "30",
    brutalCombat: 0, brutalDamage: 0, brutalDefense: 0, brutalHealth: 0, brutalXp: "0",
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
    ],
    brutalEliteAbilities: []
  },
  {
    name: "Swamp Raptor",
    keywords: ["Beast", "Jargano"],
    Size: "Medium",
    initiative: 5,
    move: "10",
    escape: "3+",
    meleeToHit: "3+",
    rangedToHit: null,
    normalCombat: 3, normalDamage: 5, normalDefense: 3, normalHealth: 40, normalXp: "10+5",
    brutalCombat: 0, brutalDamage: 0, brutalDefense: 0, brutalHealth: 0, brutalXp: "0",
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
    ],
    brutalEliteAbilities: []
  },
  {
    name: "Hellfire Succubi",
    keywords: ["Demon", "Cynder"],
    Size: "Medium",
    initiative: 8,
    move: "7",
    escape: "5+",
    meleeToHit: "3+",
    rangedToHit: null,
    normalCombat: 3, normalDamage: 2, normalDefense: 3, normalHealth: 7, normalXp: "35",
    brutalCombat: 0, brutalDamage: 0, brutalDefense: 0, brutalHealth: 0, brutalXp: "0",
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
    ],
    brutalEliteAbilities: []
  },
  {
    name: "Hell Cannon",
    keywords: ["Undead", "Artillery", "Lost Army"],
    Size: "Medium",
    initiative: 1,
    move: "2",
    escape: "2+",
    meleeToHit: "4+",
    rangedToHit: "5+",
    normalCombat: 0, normalDamage: 0, normalDefense: 4, normalHealth: 15, normalXp: "15+5",
    brutalCombat: 0, brutalDamage: 0, brutalDefense: 0, brutalHealth: 0, brutalXp: "0",
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
    ],
    brutalEliteAbilities: []
  },
  {
    name: "Undead Outlaws",
    keywords: ["Undead", "Outlaw"],
    Size: "Medium",
    initiative: 2,
    move: "4",
    escape: "3+",
    meleeToHit: "4+",
    rangedToHit: "4+",
    normalCombat: 1, normalDamage: 3, normalDefense: 4, normalHealth: 5, normalXp: "45",
    brutalCombat: 0, brutalDamage: 0, brutalDefense: 0, brutalHealth: 0, brutalXp: "0",
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
    ],
    brutalEliteAbilities: []
  },
  {
    name: "HellBats",
    keywords: ["Demon", "Void"],
    Size: "Medium",
    initiative: 6,
    move: "12",
    escape: "3+",
    meleeToHit: "3+",
    rangedToHit: null,
    normalCombat: 3, normalDamage: 1, normalDefense: 2, normalHealth: 1, normalXp: "10",
    brutalCombat: 0, brutalDamage: 0, brutalDefense: 0, brutalHealth: 0, brutalXp: "0",
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
    ],
    brutalEliteAbilities: []
  },
  {
    name: "Harbinger",
    keywords: ["Demon"],
    Size: "Medium",
    initiative: 4,
    move: "12",
    escape: "3+",
    meleeToHit: "4+",
    rangedToHit: "-",
    normalCombat: 3, normalDamage: 4, normalDefense: 3, normalHealth: 18, normalXp: "10+5",
    brutalCombat: 0, brutalDamage: 0, brutalDefense: 0, brutalHealth: 0, brutalXp: "0",
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
    ],
    brutalEliteAbilities: []
  },
  {
    name: "Serpentmen Shaman",
    keywords: ["Serpentmen", "Tribal", "Magic", "Argono"],
    Size: "Medium",
    initiative: 7,
    move: "10",
    escape: "4+",
    meleeToHit: "4+",
    rangedToHit: "4+",
    normalCombat: 3, normalDamage: 4, normalDefense: 3, normalHealth: 18, normalXp: "10+5",
    brutalCombat: 0, brutalDamage: 0, brutalDefense: 0, brutalHealth: 0, brutalXp: "0",
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
    ],
    brutalEliteAbilities: []
  },
  {
    name: "Magma Giant",
    keywords: ["Construct", "Cynder"],
    Size: "Medium",
    initiative: 3,
    move: "6",
    escape: "3+",
    meleeToHit: "4+",
    rangedToHit: "6+",
    normalCombat: 3, normalDamage: 3, normalDefense: 3, normalHealth: 25, normalXp: "15+5",
    brutalCombat: 0, brutalDamage: 0, brutalDefense: 0, brutalHealth: 0, brutalXp: "0",
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
    ],
    brutalEliteAbilities: []
  },
  {
    name: "Lava Men",
    keywords: ["Construct", "Cynder"],
    Size: "Medium",
    initiative: 3,
    move: "6",
    escape: "3+",
    meleeToHit: "4+",
    rangedToHit: "4+",
    normalCombat: 4, normalDamage: 3, normalDefense: 3, normalHealth: 10, normalXp: "10+5",
    brutalCombat: 0, brutalDamage: 0, brutalDefense: 0, brutalHealth: 0, brutalXp: "0",
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
      "Lava Eruption - At the start of their Activation, roll a D6 for each Lava Man. On the roll of 1 or 2, it will immediately make an extra Ranged Attack (Range 8, Shots 1, Damage D6+2) against a Random Hero within Range, before activating as normal.",
      "Searing Heat - +2 Damage on all Attacks."
    ],
    brutalEliteAbilities: []
  },
  {
    name: "Serpentmen Warriors",
    keywords: ["Serpentmen", "Tribal", "Argono"],
    Size: "Medium",
    initiative: 5,
    move: "10",
    escape: "5+",
    meleeToHit: "4+",
    rangedToHit: null,
    normalCombat: 2, normalDamage: 3, normalDefense: 2, normalHealth: 6, normalXp: "35",
    brutalCombat: 0, brutalDamage: 0, brutalDefense: 0, brutalHealth: 0, brutalXp: "0",
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
    ],
    brutalEliteAbilities: []
  },
  {
    name: "Corpse Pile",
    keywords: ["Undead"],
    Size: "Medium",
    initiative: 0,
    move: "0",
    escape: "1+",
    meleeToHit: "-",
    rangedToHit: "-",
    normalCombat: 0, normalDamage: 0, normalDefense: 2, normalHealth: 6, normalXp: "10+5",
    brutalCombat: 0, brutalDamage: 0, brutalDefense: 0, brutalHealth: 0, brutalXp: "0",
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
    ],
    brutalEliteAbilities: []
  },
];
