export const HEROES = {
  Western: {
    "Bandida": {
      stats: { Agility: 4, Cunning: 3, Spirit: 2, Strength: 2, Lore: 1, Luck: 3, Initiative: 6 },
      combat: 2,
      maxGrit: 2,
      toHit: { ranged: "4+", melee: "5+" },
      health: 10,
      sanity: 12,
      defense: "4+",
      willpower: "5+",
      special: 0,
      abilities: [
        "Start with: Dynamite and 2 Bandages.",
        "Outlaw: Ignore the penalties for having the Wanted status.",
        "Agile: Once per turn, you may move through enemy models as if they were not there.",
        "Boom!: Once per Fight, you may re-roll a failed Dynamite damage roll."
      ],
      startingItems: ["Dynamite", "Bandages x2"]
    },
    "Gunslinger": {
      stats: { Agility: 3, Cunning: 2, Spirit: 2, Strength: 3, Lore: 1, Luck: 3, Initiative: 5 },
      combat: 2,
      maxGrit: 2,
      toHit: { ranged: "3+", melee: "5+" },
      health: 12,
      sanity: 10,
      defense: "4+",
      willpower: "4+",
      special: 0,
      abilities: [
        "Six-Shooter: Once per turn, you may make 1 extra ranged attack with a Pistol.",
        "Fan the Hammer: Once per Fight, double the number of shots with one Pistol attack.",
        "Guns Blazing: May use 2 Pistols at once. If so, -1 To Hit on all shots this turn.",
        "Showdown: +1 Initiative and +1 Damage on the first turn of each fight."
      ],
      startingItems: ["Pistol", "Pistol"]
    },
    "Saloon Girl": {
      stats: { Agility: 4, Cunning: 3, Spirit: 2, Strength: 2, Lore: 2, Luck: 3, Initiative: 5 },
      combat: 2,
      maxGrit: 2,
      toHit: { ranged: "5+", melee: "4+" },
      health: 10,
      sanity: 12,
      defense: "4+",
      willpower: "4+",
      special: 0,
      abilities: [
        "Distract: Once per Fight, you may prevent an enemy from attacking for 1 turn.",
        "Charm: Once per Adventure, cancel a Town Event or Enemy Elite Ability.",
        "Graceful: May re-roll failed Agility tests.",
        "Nimble: When you roll a 1 for Move, you may re-roll that die."
      ],
      startingItems: ["Perfume", "Dagger"]
    },
    "US Marshal": {
      stats: { Agility: 2, Cunning: 2, Spirit: 3, Strength: 3, Lore: 2, Luck: 2, Initiative: 4 },
      combat: 3,
      maxGrit: 2,
      toHit: { ranged: "4+", melee: "4+" },
      health: 14,
      sanity: 10,
      defense: "3+",
      willpower: "3+",
      special: 0,
      abilities: [
        "Lawman: May arrest Wanted Heroes in Town.",
        "Fury of the Badge: Once per Fight, take an extra attack against adjacent enemies.",
        "Intimidate: Enemies adjacent to you have -1 Damage on their attacks.",
        "Justice: +10 XP when killing Enemies with the Wanted keyword."
      ],
      startingItems: ["Pistol", "Badge"]
    },
    "Wandering Samurai": {
      stats: { Agility: 3, Cunning: 2, Spirit: 3, Strength: 4, Lore: 1, Luck: 2, Initiative: 5 },
      combat: 3,
      maxGrit: 2,
      toHit: { ranged: "5+", melee: "3+" },
      health: 14,
      sanity: 10,
      defense: "4+",
      willpower: "4+",
      special: 5,
      abilities: [
        "Bushido: Once per Adventure, ignore all damage from one Hit.",
        "Precision Strike: May re-roll 1 failed Melee roll per turn.",
        "Kiai: Once per Fight, double the number of hits from one melee attack.",
        "Wanderer: +1 Corruption Resistance."
      ],
      startingItems: ["Katana", "Light Armor"]
    },
    "Cowboy": {
      stats: { Agility: 3, Cunning: 2, Spirit: 2, Strength: 3, Lore: 1, Luck: 4, Initiative: 5 },
      combat: 2,
      maxGrit: 2,
      toHit: { ranged: "4+", melee: "4+" },
      health: 12,
      sanity: 10,
      defense: "4+",
      willpower: "5+",
      special: 0,
      abilities: [
        "Cowpoke: May re-roll 1 failed attack roll per turn.",
        "Quick Reflexes: +1 Initiative on the first turn of combat.",
        "Lucky Shot: Once per Fight, one Hit is automatically Critical.",
        "Sidearm Master: May dual-wield Pistols without penalty."
      ],
      startingItems: ["Pistol", "Whiskey"]
    },
    "Frontier Doc": {
      stats: { Agility: 2, Cunning: 2, Spirit: 3, Strength: 2, Lore: 3, Luck: 2, Initiative: 4 },
      combat: 2,
      maxGrit: 2,
      toHit: { ranged: "5+", melee: "5+" },
      health: 10,
      sanity: 12,
      defense: "5+",
      willpower: "3+",
      special: 2,
      abilities: [
        "Medical Training: May use Bandages on adjacent Heroes without spending an action.",
        "Sawbones: +1 Healing from all sources.",
        "Experimentation: Once per Adventure, create a Potion (random effect).",
        "Surgeon: Treat Madness as Injuries when rolling for conditions."
      ],
      startingItems: ["Doctor’s Bag", "Bandages"]
    },
    "Jargono Native": {
      stats: { Agility: 3, Cunning: 2, Spirit: 3, Strength: 3, Lore: 2, Luck: 2, Initiative: 4 },
      combat: 2,
      maxGrit: 2,
      toHit: { ranged: "5+", melee: "4+" },
      health: 12,
      sanity: 10,
      defense: "4+",
      willpower: "4+",
      special: 0,
      abilities: [
        "Jungle Lore: Immune to Jungle Hazards.",
        "Tribal Weapons: Spears and Bows gain +1 Damage.",
        "Warrior’s Dance: Once per Fight, may make a free Move and Attack.",
        "Native Knowledge: +1 to Navigation rolls while in Jargono."
      ],
      startingItems: ["Spear", "Tribal Charm"]
    },
    "Orphan": {
      stats: { Agility: 4, Cunning: 3, Spirit: 2, Strength: 2, Lore: 2, Luck: 3, Initiative: 6 },
      combat: 2,
      maxGrit: 2,
      toHit: { ranged: "4+", melee: "5+" },
      health: 10,
      sanity: 12,
      defense: "5+",
      willpower: "5+",
      special: 0,
      abilities: [
        "Scavenge: +1 to all Scavenge rolls.",
        "Quick Fingers: May use Side Bag items without using an action.",
        "Streetwise: +1 to all Town Event rolls.",
        "Resilient: Immune to the first Injury or Madness each Adventure."
      ],
      startingItems: ["Lantern Oil", "Bandages"]
    },
    "Prospector": {
      stats: { Agility: 2, Cunning: 2, Spirit: 3, Strength: 3, Lore: 2, Luck: 3, Initiative: 4 },
      combat: 2,
      maxGrit: 2,
      toHit: { ranged: "4+", melee: "4+" },
      health: 12,
      sanity: 12,
      defense: "4+",
      willpower: "3+",
      special: 0,
      abilities: [
        "Gold Sense: May re-roll 1 Mine Loot result per Adventure.",
        "Greedy: May take an extra Loot card if others agree.",
        "Hardy: +1 Health and +1 Sanity.",
        "Cave-In Survivor: Immune to Rockfall and Mine Collapse hazards."
      ],
      startingItems: ["Pickaxe", "Lantern"]
    },
    "Dark Stone Shaman": {
      stats: { Agility: 2, Cunning: 3, Spirit: 4, Strength: 2, Lore: 2, Luck: 2, Initiative: 3 },
      combat: 2,
      maxGrit: 2,
      toHit: { ranged: "5+", melee: "4+" },
      health: 10,
      sanity: 14,
      defense: "5+",
      willpower: "3+",
      special: 3,
      abilities: [
        "Dark Rituals: Starts with 3 Spirit Magik powers.",
        "Mystic Resistance: Ignore the first Corruption hit each turn.",
        "Shadow Channeling: May spend a Grit to add +1 to casting rolls.",
        "Dark Pact: Once per Adventure, draw a Darkness card and gain +1 Grit."
      ],
      startingItems: ["Totem", "Scroll"]
    },
    "Trederran Veteran": {
      stats: { Agility: 2, Cunning: 3, Spirit: 2, Strength: 3, Lore: 1, Luck: 4, Initiative: 4 },
      combat: 2,
      maxGrit: 2,
      toHit: { ranged: "3+", melee: "4+" },
      health: 11,
      sanity: 11,
      defense: "4+",
      willpower: "4+",
      special: 0,
      abilities: [
        "Trederran Faction: Starts with a Trederran Artifact.",
        "Resourceful: Once per Fight, may use an item without consuming it.",
        "Adaptable: When leveling up, may choose stat or skill from another class.",
        "Battle Hardened: -1 Damage from all sources."
      ],
      startingItems: ["Trederran Artifact"]
    },
	"Drifter": {
  stats: { Agility: 2, Cunning: 3, Spirit: 3, Strength: 2, Lore: 4, Luck: 1, Initiative: 5 },
  combat: 2,
  maxGrit: 3,
  toHit: { ranged: "3+", melee: "4+" },
  health: 10,
  sanity: 12,
  defense: "4+",
  willpower: "3+",
  special: 0,
  abilities: [
    "Long Years Experience: Not restricted to targeting adjacent enemies first with Ranged Attacks. Starts with 2 Personal Items. At the start of each Fight, every other non-Drifter Hero may Recover 1 Grit.",
    "Distrustful: -1 Initiative for every Hero adjacent at the start of the turn (minimum 1).",
    "Danger Magnet: All Enemies gain 1 Elite ability for free. When traveling to Town, always adds an extra D3 Traveling Hazards."
  ],
  startingItems: ["Trusty Pistol", "Starting Upgrade - Drifter’s Secret"]
}
  }
};

export default HEROES;


