// HexCrawl Villain Stat Cards
// Each villain has Normal and Brutal versions (separate threat tiers).

export const hexcrawlVillains = [

  // ── BANDIDO ──────────────────────────────────────────────────────────
  {
    name: "Bandido",
    keywords: ["Human", "Outlaw"],
    villainCard: true,
    Size: "Medium",
    initiative: 3,
    move: 4,
    escape: "1+",
    toHit: { melee: "4+", ranged: "5+" },
    stats: {
      normal: { combat: 2, damage: 3, defense: 2, health: 16, xp: 30 },
      brutal: null
    },
    abilities: [
      "Ranged Attacker – This Enemy uses its Ranged Attack instead of Melee when able.",
      "Pistol – Ranged Attack: Range 6, Shots 2, Damage 4.",
      "Dynamite Dynamo – To Hit rolls of 6 trigger a Dynamite blast: all models within 2 spaces of target take D6 Wounds, ignoring Defense.",
    ],
    eliteAbilities: [
      "Won't Stay Dead – When this enemy would be killed, roll D6. On 4+ it survives with 1 Health.",
      "Barrage – Pistol gains +2 Shots.",
      "Accurate – Reroll all To Hit rolls of 1.",
      "Twin Guns – May make 2 Ranged Attacks per Activation instead of 1, at -1 To Hit on each.",
      "Swingin' Fists – Gains a Melee Attack: Range 1, Shots 2, Damage 4.",
      "Destruction Artist – Dynamite Dynamo now triggers on 5-6; explosion radius increases to 3 spaces.",
    ]
  },
  {
    name: "Brutal Bandido",
    keywords: ["Human", "Outlaw"],
    villainCard: true,
    brutal: true,
    Size: "Medium",
    initiative: 4,
    move: 5,
    escape: "2+",
    toHit: { melee: "4+", ranged: "4+" },
    stats: {
      normal: { combat: 3, damage: 4, defense: 3, health: 20, xp: 60 },
      brutal: null
    },
    abilities: [
      "Ranged Attacker – This Enemy uses its Ranged Attack instead of Melee when able.",
      "Dual Pistols – Ranged Attack: Range 8, Shots 4, Damage 5.",
      "Dynamite Dynamo – To Hit rolls of 5-6 trigger a Dynamite blast: all models within 2 spaces of target take D6 Wounds, ignoring Defense.",
    ],
    eliteAbilities: [
      "Won't Stay Dead – When this enemy would be killed, roll D6. On 4+ it survives with 1 Health.",
      "Barrage – Dual Pistols gains +2 Shots.",
      "Accurate – Reroll all To Hit rolls of 1.",
      "Twin Guns – May make 2 Ranged Attacks per Activation instead of 1, at -1 To Hit on each.",
      "Swingin' Fists – Gains a Melee Attack: Range 1, Shots 2, Damage 5.",
      "Destruction Artist – Dynamite Dynamo explosion radius increases to 3 spaces.",
    ]
  },

  // ── OUTLAW ───────────────────────────────────────────────────────────
  {
    name: "Outlaw",
    keywords: ["Human", "Outlaw", "Showman"],
    villainCard: true,
    Size: "Medium",
    initiative: 4,
    move: 5,
    escape: "1+",
    toHit: { melee: "4+", ranged: "5+" },
    stats: {
      normal: { combat: 2, damage: 3, defense: 2, health: 12, xp: 30 },
      brutal: null
    },
    abilities: [
      "Ranged Attacker – This Enemy uses its Ranged Attack instead of Melee when able.",
      "Outlaw Pistols – Ranged Attack: Range 5, Shots 6, Damage 2.",
      "Shadow Move – When this enemy moves, it may pass through walls and other models.",
      "Guns Blazing – To Hit rolls of 6 count as 2 Hits instead of 1.",
    ],
    eliteAbilities: [
      "Won't Shut Up – At the start of each round, the Hero with the highest Combat takes 1 Horror Hit.",
      "Wanted Man – +3 Health.",
      "Hitman – +2 Damage, -1 Combat.",
      "Reckless – Range increased to 3+; -1 Defense.",
      "Gunfighter – May reroll all To Hit rolls of 1 once per Activation.",
      "Wisecracks – Whenever a Human enemy within 3 spaces takes a Wound, this enemy Heals 1 Wound.",
    ]
  },
  {
    name: "Brutal Outlaw",
    keywords: ["Human", "Outlaw", "Showman"],
    villainCard: true,
    brutal: true,
    Size: "Medium",
    initiative: 5,
    move: 6,
    escape: "2+",
    toHit: { melee: "4+", ranged: "4+" },
    stats: {
      normal: { combat: 3, damage: 3, defense: 3, health: 16, xp: 60 },
      brutal: null
    },
    abilities: [
      "Ranged Attacker – This Enemy uses its Ranged Attack instead of Melee when able.",
      "Outlaw Pistols – Ranged Attack: Range 8, Shots 8, Damage 2.",
      "Shadow Move – When this enemy moves, it may pass through walls and other models.",
      "Guns Blazing – To Hit rolls of 5-6 count as 2 Hits instead of 1.",
    ],
    eliteAbilities: [
      "Won't Shut Up – At the start of each round, the Hero with the highest Combat takes 1 Horror Hit.",
      "Wanted Man – +3 Health.",
      "Hitman – +2 Damage, -1 Combat.",
      "Reckless – Range increased to 3+; -1 Defense.",
      "Gunfighter – May reroll all To Hit rolls of 1 once per Activation.",
      "Wisecracks – Whenever a Human enemy within 3 spaces takes a Wound, this enemy Heals 1 Wound.",
    ]
  },

  // ── RANCHER ──────────────────────────────────────────────────────────
  {
    name: "Rancher",
    keywords: ["Human", "Frontier"],
    villainCard: true,
    Size: "Medium",
    initiative: 3,
    move: 4,
    escape: "1+",
    toHit: { melee: "4+", ranged: "4+" },
    stats: {
      normal: { combat: 2, damage: 3, defense: 2, health: 14, xp: 30 },
      brutal: null
    },
    abilities: [
      "Hunting Rifle – Ranged Attack: Range 12, Shots 1, Damage 6.",
      "Dark Stone Trap – At the start of this enemy's Activation, any Hero within 4 spaces rolls D6. On 1-2, that Hero takes D6 Wounds ignoring Defense.",
    ],
    eliteAbilities: [
      "Sharpshooter – Hunting Rifle To Hit rolls of 6 deal +D6 bonus Damage.",
      "Shrugs It Off – Once per Activation, may ignore 1 source of Damage entirely.",
      "Swinging Rifle – Gains a Melee Attack using the Hunting Rifle: Range 1, Shots 2, Damage 4.",
      "Home Remedies – Heals D3 Wounds at the start of each turn.",
      "Rapid Reload – May make 2 Ranged Attacks per Activation.",
      "Sniper – Hunting Rifle ignores Cover and range penalties.",
    ]
  },
  {
    name: "Brutal Rancher",
    keywords: ["Human", "Frontier"],
    villainCard: true,
    brutal: true,
    Size: "Medium",
    initiative: 4,
    move: 5,
    escape: "2+",
    toHit: { melee: "4+", ranged: "3+" },
    stats: {
      normal: { combat: 3, damage: 4, defense: 3, health: 18, xp: 60 },
      brutal: null
    },
    abilities: [
      "Hunting Rifle – Ranged Attack: Range 12, Shots 2, Damage 8.",
      "Dark Stone Trap – At the start of this enemy's Activation, any Hero within 5 spaces rolls D6. On 1-2, that Hero takes D8 Wounds ignoring Defense.",
    ],
    eliteAbilities: [
      "Sharpshooter – Hunting Rifle To Hit rolls of 6 deal +D6 bonus Damage.",
      "Shrugs It Off – Once per Activation, may ignore 1 source of Damage entirely.",
      "Swinging Rifle – Gains a Melee Attack using the Hunting Rifle: Range 1, Shots 2, Damage 5.",
      "Home Remedies – Heals D3 Wounds at the start of each turn.",
      "Rapid Reload – May make 2 Ranged Attacks per Activation.",
      "Sniper – Hunting Rifle ignores Cover and range penalties.",
    ]
  },

  // ── PREACHER ─────────────────────────────────────────────────────────
  {
    name: "Preacher",
    keywords: ["Human", "Holy"],
    villainCard: true,
    Size: "Medium",
    initiative: 2,
    move: 4,
    escape: "1+",
    toHit: { melee: "5+", ranged: null },
    stats: {
      normal: { combat: 2, damage: 3, defense: 1, health: 12, xp: 30 },
      brutal: null
    },
    abilities: [
      "Sermon: Faith Healing – At the start of this enemy's Activation, choose a Human enemy within range. If that enemy is below half Health, it Heals D3 Wounds.",
      "Sermon: Smite – Once per Activation, all Heroes within 8 spaces take D3 Wounds ignoring Defense.",
      "Sermon: Holy Terror – All Heroes within 2 spaces take 2 Horror Hits (roll D6 for Sanity Damage each).",
    ],
    eliteAbilities: [
      "Divine Protection – Gains Armor 5+.",
      "Conviction – +2 Health; adjacent Human enemies gain +1 Defense.",
      "Devotion – Faith Healing now heals D6 Wounds.",
      "Holy Strike – Melee To Hit rolls of 6 cause the target to lose their next Action.",
      "Hardy – This enemy ignores the first source of Damage each turn.",
      "Zealot – Smite range increases to 12 spaces; damage increases to D6 Wounds.",
    ]
  },
  {
    name: "Brutal Preacher",
    keywords: ["Human", "Holy"],
    villainCard: true,
    brutal: true,
    Size: "Medium",
    initiative: 3,
    move: 5,
    escape: "2+",
    toHit: { melee: "4+", ranged: null },
    stats: {
      normal: { combat: 2, damage: 3, defense: 2, health: 16, xp: 60 },
      brutal: null
    },
    abilities: [
      "Sermon: Faith Healing – At the start of this enemy's Activation, choose a Human enemy within range. If that enemy is below half Health, it Heals D6 Wounds.",
      "Sermon: Smite – Once per Activation, all Heroes within 8 spaces take D6 Wounds ignoring Defense.",
      "Sermon: Holy Terror – All Heroes within 3 spaces take 3 Horror Hits (roll D8 for Sanity Damage each).",
    ],
    eliteAbilities: [
      "Divine Protection – Gains Armor 4+.",
      "Conviction – +2 Health; adjacent Human enemies gain +1 Defense.",
      "Devotion – Faith Healing now heals D6 Wounds.",
      "Holy Strike – Melee To Hit rolls of 6 cause the target to lose their next Action.",
      "Hardy – This enemy ignores the first source of Damage each turn.",
      "Zealot – Smite range increases to 12 spaces; damage increases to D8 Wounds.",
    ]
  },

  // ── GUNSLINGER ───────────────────────────────────────────────────────
  // TODO: Stats need verification from HexCrawl Items & Enemies PDF pp.21-22
  {
    name: "Gunslinger",
    keywords: ["Human", "Outlaw"],
    villainCard: true,
    Size: "Medium",
    initiative: 5,
    move: 5,
    escape: "1+",
    toHit: { melee: "4+", ranged: "4+" },
    stats: {
      normal: { combat: 3, damage: 4, defense: 3, health: 14, xp: 30 },
      brutal: null
    },
    abilities: [
      "Fast Draw – This enemy always acts first in Initiative order, before all other enemies and Heroes.",
      "Quick Shot – Ranged Attack: Range 6, Shots 3, Damage 4.",
      "Trick Shot – To Hit rolls of 6 may target any model on the same Map Tile.",
    ],
    eliteAbilities: [
      "Legendary Draw – This enemy wins all Initiative ties and acts before all Heroes.",
      "Deadly Aim – +1 Damage on all Ranged Attacks.",
      "Fan the Hammer – Quick Shot gains +3 Shots, -1 To Hit.",
      "Iron Nerve – Immune to Horror Hits.",
      "Notched Grip – Melee Attacks deal +2 Damage.",
      "Called Shot – Once per Activation, may target a specific Hero regardless of nearest target rule.",
    ]
  },
  {
    name: "Brutal Gunslinger",
    keywords: ["Human", "Outlaw"],
    villainCard: true,
    brutal: true,
    Size: "Medium",
    initiative: 6,
    move: 6,
    escape: "2+",
    toHit: { melee: "4+", ranged: "3+" },
    stats: {
      normal: { combat: 4, damage: 5, defense: 4, health: 18, xp: 60 },
      brutal: null
    },
    abilities: [
      "Fast Draw – This enemy always acts first in Initiative order, before all other enemies and Heroes.",
      "Quick Shot – Ranged Attack: Range 8, Shots 5, Damage 5.",
      "Trick Shot – To Hit rolls of 5-6 may target any model on the same Map Tile.",
    ],
    eliteAbilities: [
      "Legendary Draw – This enemy wins all Initiative ties and acts before all Heroes.",
      "Deadly Aim – +1 Damage on all Ranged Attacks.",
      "Fan the Hammer – Quick Shot gains +3 Shots, -1 To Hit.",
      "Iron Nerve – Immune to Horror Hits.",
      "Notched Grip – Melee Attacks deal +2 Damage.",
      "Called Shot – Once per Activation, may target a specific Hero regardless of nearest target rule.",
    ]
  },

  // ── SALOON GIRL ──────────────────────────────────────────────────────
  // TODO: Stats need verification from HexCrawl Items & Enemies PDF pp.23-24
  {
    name: "Saloon Girl",
    keywords: ["Human", "Showman"],
    villainCard: true,
    Size: "Medium",
    initiative: 4,
    move: 5,
    escape: "1+",
    toHit: { melee: "5+", ranged: "5+" },
    stats: {
      normal: { combat: 2, damage: 2, defense: 2, health: 10, xp: 25 },
      brutal: null
    },
    abilities: [
      "Distraction – At the start of this enemy's Activation, choose 1 Hero within 3 spaces. That Hero is -1 Combat until the start of their next Activation.",
      "Hidden Blade – Melee Attacks that Hit deal +D3 bonus Damage (poison).",
      "Crowd Control – While 2+ Human models are within 3 spaces of this enemy, it gains +1 Defense.",
    ],
    eliteAbilities: [
      "Double Distraction – Distraction affects all Heroes within 3 spaces.",
      "Lethal Beauty – Hidden Blade bonus damage increases to D6.",
      "Social Butterfly – May move through spaces occupied by Human models.",
      "Showstopper – Once per fight, all Heroes on the same Map Tile must pass Willpower 4+ or lose their next Action.",
      "Fan Club – Adjacent Human enemies gain +1 To Hit.",
      "Smoke and Mirrors – Once per Activation, may teleport up to 4 spaces to any unoccupied space.",
    ]
  },
  {
    name: "Brutal Saloon Girl",
    keywords: ["Human", "Showman"],
    villainCard: true,
    brutal: true,
    Size: "Medium",
    initiative: 5,
    move: 6,
    escape: "2+",
    toHit: { melee: "4+", ranged: "4+" },
    stats: {
      normal: { combat: 3, damage: 3, defense: 3, health: 14, xp: 50 },
      brutal: null
    },
    abilities: [
      "Distraction – At the start of this enemy's Activation, all Heroes within 4 spaces are -1 Combat until the start of their next Activation.",
      "Hidden Blade – Melee Attacks that Hit deal +D6 bonus Damage (poison).",
      "Crowd Control – While 2+ Human models are within 3 spaces of this enemy, it gains +2 Defense.",
    ],
    eliteAbilities: [
      "Double Distraction – Distraction affects all Heroes within 3 spaces.",
      "Lethal Beauty – Hidden Blade bonus damage increases to D6.",
      "Social Butterfly – May move through spaces occupied by Human models.",
      "Showstopper – Once per fight, all Heroes on the same Map Tile must pass Willpower 4+ or lose their next Action.",
      "Fan Club – Adjacent Human enemies gain +1 To Hit.",
      "Smoke and Mirrors – Once per Activation, may teleport up to 4 spaces to any unoccupied space.",
    ]
  },

  // ── INDIAN SCOUT ─────────────────────────────────────────────────────
  // TODO: Stats need verification from HexCrawl Items & Enemies PDF pp.25-26
  {
    name: "Indian Scout",
    keywords: ["Human", "Frontier"],
    villainCard: true,
    Size: "Medium",
    initiative: 5,
    move: 6,
    escape: "1+",
    toHit: { melee: "4+", ranged: "4+" },
    stats: {
      normal: { combat: 2, damage: 3, defense: 2, health: 12, xp: 25 },
      brutal: null
    },
    abilities: [
      "Tracker – This enemy ignores terrain movement penalties and may not be the target of Ambush abilities.",
      "Spirit Bow – Ranged Attack: Range 8, Shots 2, Damage 3. Ignores Cover.",
      "Ghost Walk – This enemy may move through walls. It cannot be targeted while more than 5 spaces from any Hero.",
    ],
    eliteAbilities: [
      "Spirit Vision – This enemy is never surprised; immune to Ambush and Stealth abilities.",
      "Poison Arrow – Spirit Bow To Hit rolls of 5+ inflict a Poison Marker.",
      "War Paint – +2 Defense; gains Armor 6+.",
      "Battle Cry – At the start of combat, all Heroes within 4 spaces take 1 Horror Hit.",
      "Wilderness Expert – +2 Move; may make a free Move at the start of each turn.",
      "Spirit Guide – Once per fight, this enemy may Heal D6 Wounds.",
    ]
  },
  {
    name: "Brutal Indian Scout",
    keywords: ["Human", "Frontier"],
    villainCard: true,
    brutal: true,
    Size: "Medium",
    initiative: 6,
    move: 7,
    escape: "2+",
    toHit: { melee: "3+", ranged: "3+" },
    stats: {
      normal: { combat: 3, damage: 4, defense: 3, health: 16, xp: 50 },
      brutal: null
    },
    abilities: [
      "Tracker – This enemy ignores terrain movement penalties and may not be the target of Ambush abilities.",
      "Spirit Bow – Ranged Attack: Range 10, Shots 3, Damage 4. Ignores Cover.",
      "Ghost Walk – This enemy may move through walls. It cannot be targeted while more than 5 spaces from any Hero.",
    ],
    eliteAbilities: [
      "Spirit Vision – This enemy is never surprised; immune to Ambush and Stealth abilities.",
      "Poison Arrow – Spirit Bow To Hit rolls of 5+ inflict a Poison Marker.",
      "War Paint – +2 Defense; gains Armor 5+.",
      "Battle Cry – At the start of combat, all Heroes within 4 spaces take 2 Horror Hits.",
      "Wilderness Expert – +2 Move; may make a free Move at the start of each turn.",
      "Spirit Guide – Once per fight, this enemy may Heal D6 Wounds.",
    ]
  },

  // ── CORRUPT MARSHAL ──────────────────────────────────────────────────
  // TODO: Stats need verification from HexCrawl Items & Enemies PDF pp.27-28
  {
    name: "Corrupt Marshal",
    keywords: ["Human", "Law", "Outlaw"],
    villainCard: true,
    Size: "Medium",
    initiative: 4,
    move: 5,
    escape: "1+",
    toHit: { melee: "4+", ranged: "4+" },
    stats: {
      normal: { combat: 3, damage: 4, defense: 3, health: 16, xp: 35 },
      brutal: null
    },
    abilities: [
      "Ranged Attacker – This Enemy uses its Ranged Attack instead of Melee when able.",
      "Marshal's Revolver – Ranged Attack: Range 7, Shots 3, Damage 4.",
      "Crooked Law – This enemy is immune to abilities referencing the Law keyword. Heroes with the Law keyword are -1 To Hit against this enemy.",
      "Badge of Corruption – Once per fight, may force 1 Hero to discard 1 Gold or 1 random Side Bag Token.",
    ],
    eliteAbilities: [
      "On the Payroll – Adjacent Human enemies gain +1 Combat.",
      "Extortion – Badge of Corruption now applies to all Heroes in range simultaneously.",
      "Corrupt Authority – All Heroes must target this enemy first if it is within range.",
      "Hired Muscle – +4 Health; gains Armor 6+.",
      "Dirty Deed – Once per fight, may negate 1 Hero's entire Activation.",
      "Bounty Hunter – Gains +1 Damage for each Gold piece on target Hero (max +4).",
    ]
  },
  {
    name: "Brutal Corrupt Marshal",
    keywords: ["Human", "Law", "Outlaw"],
    villainCard: true,
    brutal: true,
    Size: "Medium",
    initiative: 5,
    move: 5,
    escape: "2+",
    toHit: { melee: "4+", ranged: "3+" },
    stats: {
      normal: { combat: 4, damage: 5, defense: 4, health: 20, xp: 70 },
      brutal: null
    },
    abilities: [
      "Ranged Attacker – This Enemy uses its Ranged Attack instead of Melee when able.",
      "Marshal's Revolver – Ranged Attack: Range 8, Shots 4, Damage 5.",
      "Crooked Law – This enemy is immune to abilities referencing the Law keyword. Heroes with the Law keyword are -2 To Hit against this enemy.",
      "Badge of Corruption – Once per fight, may force all Heroes within 4 spaces to each discard 1 Gold or 1 random Side Bag Token.",
    ],
    eliteAbilities: [
      "On the Payroll – Adjacent Human enemies gain +1 Combat.",
      "Extortion – Badge of Corruption now applies to all Heroes in range simultaneously.",
      "Corrupt Authority – All Heroes must target this enemy first if it is within range.",
      "Hired Muscle – +4 Health; gains Armor 5+.",
      "Dirty Deed – Once per fight, may negate 1 Hero's entire Activation.",
      "Bounty Hunter – Gains +1 Damage for each Gold piece on target Hero (max +4).",
    ]
  },

  // ── CORRUPT LAWMAN ───────────────────────────────────────────────────
  // TODO: Stats need verification from HexCrawl Items & Enemies PDF pp.29-30
  {
    name: "Corrupt Lawman",
    keywords: ["Human", "Law", "Outlaw"],
    villainCard: true,
    Size: "Medium",
    initiative: 3,
    move: 4,
    escape: "1+",
    toHit: { melee: "4+", ranged: "5+" },
    stats: {
      normal: { combat: 2, damage: 3, defense: 2, health: 14, xp: 30 },
      brutal: null
    },
    abilities: [
      "Corrupt Authority – Heroes with the Law keyword are at -1 To Hit against this enemy.",
      "Lawman's Shotgun – Ranged Attack: Range 4, Shots 2, Damage 5. Hits all models in a line.",
      "False Arrest – Once per fight, immobilize 1 Hero within 3 spaces; they cannot move during their next Activation.",
    ],
    eliteAbilities: [
      "Crooked Network – Gains +1 Combat for each other Human enemy on the board (max +3).",
      "Double-Dealing – May target a different Hero with each Shot of Lawman's Shotgun.",
      "Intimidation – All Heroes within 3 spaces are -1 Willpower.",
      "Heavy Armor – Gains Armor 5+.",
      "Unjust Sentence – False Arrest also causes the Hero to lose all Grit tokens.",
      "Enforcer – +4 Health; Melee Attacks deal +1 Damage.",
    ]
  },
  {
    name: "Brutal Corrupt Lawman",
    keywords: ["Human", "Law", "Outlaw"],
    villainCard: true,
    brutal: true,
    Size: "Medium",
    initiative: 4,
    move: 5,
    escape: "2+",
    toHit: { melee: "4+", ranged: "4+" },
    stats: {
      normal: { combat: 3, damage: 4, defense: 3, health: 18, xp: 60 },
      brutal: null
    },
    abilities: [
      "Corrupt Authority – Heroes with the Law keyword are at -2 To Hit against this enemy.",
      "Lawman's Shotgun – Ranged Attack: Range 5, Shots 3, Damage 6. Hits all models in a line.",
      "False Arrest – Once per fight, immobilize all Heroes within 3 spaces; they cannot move during their next Activation.",
    ],
    eliteAbilities: [
      "Crooked Network – Gains +1 Combat for each other Human enemy on the board (max +3).",
      "Double-Dealing – May target a different Hero with each Shot of Lawman's Shotgun.",
      "Intimidation – All Heroes within 3 spaces are -1 Willpower.",
      "Heavy Armor – Gains Armor 4+.",
      "Unjust Sentence – False Arrest also causes the Hero to lose all Grit tokens.",
      "Enforcer – +4 Health; Melee Attacks deal +1 Damage.",
    ]
  },

];

export default function Placeholder() { return null; }
