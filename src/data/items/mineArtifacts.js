export const mineArtifacts = [
  // --- Batch 1 originals ---------------------------------------------------
  {
    id: 'mine_scroll_of_flames',
    name: "Scroll of Flames",
    type: "Artifact - Scroll - Magik",
    slot: "None",
    value: 400,
    weight: 1,
    upgradeSlots: 0,
    effects: [
      "Discard to gain a Free Attack.",
      "Place 4 Hellfire markers in any spaces within Range 8 (limit 1 per space).",
      "All Hellfire markers must form a single continuous chain.",
      "Hellfire markers do 1 Hit with 2D6 Damage to anything in their space, then are removed."
    ],
    requires: "Spirit 3 or higher to use",
    tags: ["Artifact", "Scroll", "Magik"]
  },
  {
    id: 'mine_life_water',
    name: "Life Water",
    type: "Artifact - Tonic",
    slot: "None",
    value: 400,
    weight: 1,
    upgradeSlots: 0,
    effects: [
      "Discard to fully heal your Health.",
      "Or discard to heal a single Injury, Madness, Mutation, or Curse."
    ],
    tags: ["Artifact", "Tonic"]
  },
  {
    id: 'mine_book_of_the_mad_king',
    name: "Book of the Mad King",
    type: "Artifact - Book - Occult",
    slot: "None",
    value: 725,
    weight: 1,
    upgradeSlots: 0,
    effects: [
      "Once per Fight, you may read from the book.",
      "Choose an Enemy on your Map Tile to take D6 Wounds with no Defense.",
      "You then take either D6 Corruption Hits or 2D6 Horror Hits (your choice)."
    ],
    tags: ["Artifact", "Book", "Occult"]
  },
  {
    id: 'mine_void_catcher',
    name: "Void Catcher",
    type: "Artifact - Void - Tribal - Charm",
    slot: "Charm",
    value: 725,
    weight: 1,
    upgradeSlots: 1,
    effects: ["Whenever a Darkness card is played, you may recover 1 Grit."],
    tags: ["Artifact", "Void", "Tribal", "Charm"]
  },
  {
    id: 'mine_dead_man_s_iron',
    name: "Dead Man’s Iron",
    type: "Artifact - Gun - Pistol - Occult",
    slot: "Hand Weapon",
    value: 350,
    weight: 1,
    upgradeSlots: 1,
    effects: [
      "Range 6, Shots 3.",
      "+1 Damage to Undead."
    ],
    tags: ["Artifact", "Gun", "Pistol", "Occult"]
  },
  {
    id: 'mine_book_of_the_occult',
    name: "Book of the Occult",
    type: "Artifact - Book - Occult",
    slot: "None",
    value: 725,
    weight: 1,
    upgradeSlots: 0,
    effects: [
      "+1 Lore.",
      "Once per Adventure, prevent the Darkness from moving on the Depth Track."
    ],
    tags: ["Artifact", "Book", "Occult"]
  },
  {
    id: 'mine_mole_s_foot_amulet',
    name: "Mole’s Foot Amulet",
    type: "Artifact - Magik - Charm",
    slot: "Charm",
    value: 350,
    weight: 1,
    upgradeSlots: 1,
    effects: [
      "+1 Spirit.",
      "Once per Adventure, you may cancel a Growing Dread card on the D6 roll of 3+."
    ],
    tags: ["Artifact", "Magik", "Charm"]
  },
  {
    id: 'mine_book_of_gom_jaharii',
    name: "Book of Gom’Jaharii",
    type: "Artifact - Book - Ancient",
    slot: "None",
    value: 550,
    weight: 1,
    upgradeSlots: 0,
    effects: [
      "Once per Adventure, you may take D3 Corruption Hits to recover up to your Max Grit."
    ],
    tags: ["Artifact", "Book", "Ancient"]
  },
  {
    id: 'mine_liquid_sunlight',
    name: "Liquid Sunlight",
    type: "Artifact - Glass - Light",
    slot: "None",
    value: 550,
    weight: 1,
    upgradeSlots: 0,
    effects: [
      "Discard to immediately do D3 Wounds to every Undead model on the same and adjacent Map Tiles, ignoring Defense, Armor, and Endurance.",
      "Or discard to re-roll a Hold Back the Darkness roll just rolled."
    ],
    tags: ["Artifact", "Glass", "Light"]
  },

  // --- Batch 2 (deduped: removed duplicate Life Water) ----------------------
  {
    id: 'mine_void_lantern',
    name: "Void Lantern",
    type: "Artifact - Light Source - Void",
    slot: "Light Source",
    value: 750,
    weight: 1,
    upgradeSlots: 0,
    effects: [
      "Use the Peril Die for Hold Back the Darkness tests.",
      "If doubles are rolled, you take D6 Horror Hits and every other Hero takes 1 Horror Hit.",
      "Limit one Light Source in the Hero Posse."
    ],
    tags: ["Artifact", "Light Source", "Void"]
  },
  {
    id: 'mine_amulet_of_trondo',
    name: "Amulet of Trondo",
    type: "Artifact - Magik - Amulet",
    slot: "Amulet",
    value: 650,
    weight: 1,
    upgradeSlots: 1,
    effects: ["Spirit Armor 5+."],
    tags: ["Artifact", "Magik", "Amulet"]
  },
  {
    id: 'mine_phase_dagger',
    name: "Phase Dagger",
    type: "Artifact - Hand Weapon - Void",
    slot: "Hand Weapon",
    value: 675,
    weight: 1,
    upgradeSlots: 1,
    effects: [
      "Take 1 Corruption Hit to use.",
      "Free Attack (once per Fight).",
      "+1 Combat.",
      "Ignores Defense.",
      "Uses the Peril Die for Damage."
    ],
    tags: ["Artifact", "Hand Weapon", "Void"]
  },
  {
    id: 'mine_otherworld_artifact_targa_plateau',
    name: "Otherworld Artifact (Targa Plateau)",
    type: "Artifact",
    slot: "None",
    value: null,
    weight: 1,
    upgradeSlots: 0,
    effects: ["Draw an Artifact from the Targa Plateau Artifacts Deck."],
    tags: ["Artifact", "Otherworld"]
  },
  {
    id: 'mine_soul_shard',
    name: "Soul Shard",
    type: "Artifact - Container - Lost Army",
    slot: "Container",
    value: 200,
    weight: 1,
    upgradeSlots: 0,
    effects: [
      "Whenever you would take a Corruption Point, you may place it on Soul Shard instead (up to 6).",
      "Counts as having a Void icon for every 2 Corruption Points on it.",
      "Use 2 Grit at any time to remove D3 Corruption Points from here.",
      "Limit 1."
    ],
    tags: ["Artifact", "Container", "Lost Army", "Void"]
  },
  {
    id: 'mine_lost_army_hell_musket',
    name: "Lost Army Hell Musket",
    type: "Artifact - Gun - Pistol - Lost Army",
    slot: "Hand Weapon",
    value: 900,
    weight: 1,
    upgradeSlots: 1,
    effects: [
      "Range 10; Shots 1.",
      "Uses the D8 for Damage.",
      "+1 Damage.",
      "You may take up to 3 Corruption Hits to add +1 Shot for each.",
      "While equipped, gain +2 Combat."
    ],
    tags: ["Artifact", "Gun", "Pistol", "Lost Army"]
  },
  {
    id: 'mine_vampire_fang',
    name: "Vampire Fang",
    type: "Artifact - Charm - Vampire",
    slot: "Charm",
    value: 700,
    weight: 1,
    upgradeSlots: 1,
    effects: [
      "Whenever you kill an Enemy, you may Heal 2 Wounds.",
      "You are immune to the Vampiric Bite Enemy ability."
    ],
    tags: ["Artifact", "Charm", "Vampire"]
  },
  {
    id: 'mine_tome_of_ro_kal',
    name: "Tome of Ro’kal",
    type: "Artifact - Book - Magik - Occult",
    slot: "None",
    value: 625,
    weight: 1,
    upgradeSlots: 0,
    effects: [
      "+1 Lore.",
      "Once per turn, you may take D6 Corruption Hits to Recover a Grit."
    ],
    requires: "Spirit 4 or higher to use",
    tags: ["Artifact", "Book", "Magik", "Occult"]
  },

  // --- Batch 3 --------------------------------------------------------------
  {
    id: 'mine_black_fang_hatchet',
    name: "Black Fang Hatchet",
    type: "Artifact - Hand Weapon - Tribal",
    slot: "Hand Weapon",
    value: 425,
    weight: 1,
    upgradeSlots: 1,
    effects: [
      "+1 Combat.",
      "Use 1 Dark Stone to add +3 Damage to one of your Combat Hits."
    ],
    tags: ["Artifact", "Hand Weapon", "Tribal", "Frontier/Traveler/Tribal Only"]
  },
  {
    id: 'mine_dark_stone_gloves',
    name: "Dark Stone Gloves",
    type: "Artifact - Dark Stone - Clothing - Gloves",
    slot: "Gloves",
    value: 575,
    weight: 1,
    upgradeSlots: 1,
    effects: [
      "+1 Strength.",
      "Your Combat Hits are +1 Damage."
    ],
    tags: ["Artifact", "Dark Stone", "Clothing", "Gloves"]
  },
  {
    id: 'mine_otherworld_artifact_blasted_wastes',
    name: "Otherworld Artifact (Blasted Wastes)",
    type: "Artifact",
    slot: "None",
    value: null,
    weight: 1,
    upgradeSlots: 0,
    effects: ["Draw an Artifact from the Blasted Wastes Deck."],
    tags: ["Artifact", "Otherworld"]
  },
  {
    id: 'mine_vial_of_brimstone_ash',
    name: "Vial of Brimstone Ash",
    type: "Artifact - Void",
    slot: "None",
    value: 125,
    weight: 1,
    upgradeSlots: 0,
    effects: [
      "Free Attack: Discard to do 1 Wound to every adjacent Enemy, ignoring Defense."
    ],
    tags: ["Artifact", "Void"]
  },
  {
    id: 'mine_crushed_dark_stone',
    name: "Crushed Dark Stone",
    type: "Artifact - Dark Stone",
    slot: "None",
    value: 150,
    weight: 1,
    upgradeSlots: 0,
    effects: [
      "Consume (discard) to heal 2D6 Wounds and double your Combat until the end of the turn.",
      "Gain 1 Corruption Point, ignoring Willpower."
    ],
    tags: ["Artifact", "Dark Stone"]
  },
  {
    id: 'mine_healing_stone',
    name: "Healing Stone",
    type: "Artifact - Magik",
    slot: "None",
    value: 150,
    weight: 1,
    upgradeSlots: 0,
    effects: [
      "Once per Adventure, heal 2D6 Wounds/Sanity (any mix) from a single Hero."
    ],
    tags: ["Artifact", "Magik"]
  },
  {
    id: 'mine_ring_of_zu',
    name: "Ring of Zu",
    type: "Artifact - Ring - Ancient - Magik",
    slot: "Ring",
    value: 850,
    weight: 1,
    upgradeSlots: 1,
    effects: [
      "+1 Lore.",
      "+1 Strength.",
      "While carrying this Item, take D3 Corruption Hits at the start of each Adventure."
    ],
    quote: "“It’s a little tight, but hey… Ring of Zu!”",
    tags: ["Artifact", "Ring", "Ancient", "Magik"]
  },
  {
    id: 'mine_hell_bullets',
    name: "Hell Bullets",
    type: "Artifact - Demonic - Ammo",
    slot: "Ammo",
    value: 150,
    weight: 1,
    upgradeSlots: 0,
    effects: [
      "Discard to use.",
      "Until end of the Adventure, all your Gun To Hit rolls of 1 count as Critical Hits, but also cause 1 Corruption Hit to you.",
      "Limit 1 Ammo at a time."
    ],
    tags: ["Artifact", "Demonic", "Ammo"]
  },
  {
    id: 'mine_hunter',
    name: "Hunter's Spike",
    type: "Artifact - Hand Weapon - Holy",
    slot: "Hand Weapon",
    value: 850,
    weight: 1,
    upgradeSlots: 1,
    effects: [
      "+1 Combat.",
      "+1 Initiative.",
      "You are +1 Damage against Undead and Beast Enemies (or +3 Damage against Vampires)."
    ],
    requires: "Cunning 4+ to use",
    tags: ["Artifact", "Hand Weapon", "Holy"]
  },

  // --- Batch 4 --------------------------------------------------------------
  {
    id: 'mine_ornate_mask',
    name: "Ornate Mask",
    type: "Artifact - Clothing - Face - Cult",
    slot: "Face",
    value: 450,
    weight: 1,
    upgradeSlots: 1,
    effects: [
      "-2 Sanity.",
      "+2 Health.",
      "Any time you would take a Corruption Point, ignore it on the D6 roll of 4+."
    ],
    tags: ["Artifact", "Clothing", "Face", "Cult"]
  },
  {
    id: 'mine_inquisitor',
    name: "Inquisitor's Helmet",
    type: "Artifact - Clothing - Face - Hat",
    slot: "Hat",
    value: 750,
    weight: 1,
    upgradeSlots: 1,
    effects: [
      "+1 Lore.",
      "+3 Sanity.",
      "While equipped, your Corruption Resistance is increased by 3."
    ],
    tags: ["Artifact", "Clothing", "Face", "Hat"]
  },
  {
    id: 'mine_jeweled_blade',
    name: "Jeweled Blade",
    type: "Artifact - Hand Weapon",
    slot: "Hand Weapon",
    value: 450,
    weight: 1,
    upgradeSlots: 1,
    effects: [
      "+1 Combat.",
      "Once per Fight, you may ignore an Enemy's Tough and Endurance abilities for your Combat Hits until the end of the turn."
    ],
    tags: ["Artifact", "Hand Weapon"]
  },
  {
    id: 'mine_masterclass_revolver',
    name: "Masterclass Revolver",
    type: "Artifact - Gun - Pistol",
    slot: "Hand Weapon",
    value: 550,
    weight: 1,
    upgradeSlots: 1,
    effects: [
      "Range 8; Shots 2.",
      "If equipped as Off-hand, +1 Shot, +1 Damage, and ignores Armor."
    ],
    tags: ["Artifact", "Gun", "Pistol"]
  },
  {
    id: 'mine_divine_scroll_of_protection',
    name: "Divine Scroll of Protection",
    type: "Artifact - Holy - Scroll",
    slot: "None",
    value: 150,
    weight: 1,
    upgradeSlots: 0,
    effects: [
      "When drawn, place 2 Holy markers here.",
      "Once per turn, discard a Holy marker (or this card) to cancel a Darkness card on the D6 roll of 3+."
    ],
    tags: ["Artifact", "Holy", "Scroll"]
  },
  {
    id: 'mine_brace_of_dark_stone_pistols',
    name: "Brace of Dark Stone Pistols",
    type: "Artifact - Gun - Pistol - Dark Stone",
    slot: "Hand Weapon",
    value: 1250,
    weight: 1,
    upgradeSlots: 1,
    effects: [
      "Range 6; Shots 4.",
      "Uses the Peril Die for Damage.",
      "Frontier or Outlaw Only."
    ],
    tags: ["Artifact", "Gun", "Pistol", "Dark Stone", "Frontier/Outlaw Only"]
  },
  {
    id: 'mine_otherworld_artifact_caverns_of_cynder',
    name: "Otherworld Artifact (Caverns of Cynder)",
    type: "Artifact",
    slot: "None",
    value: null,
    weight: 1,
    upgradeSlots: 0,
    effects: ["Draw an Artifact from the Caverns of Cynder Artifacts Deck."],
    tags: ["Artifact", "Otherworld"]
  },
  {
    id: 'mine_shadow_shard',
    name: "Shadow Shard",
    type: "Artifact - Magik - Darkness",
    slot: "None",
    value: 650,
    weight: 1,
    upgradeSlots: 0,
    effects: [
      "Use 1 Grit to cancel a Darkness card just drawn and place it here.",
      "Whenever the Darkness moves one or more spaces on the Depth Track, take Horror Hits equal to the number of Darkness cards here (2 Sanity Damage each).",
      "At end of the Adventure, discard any Darkness cards here."
    ],
    tags: ["Artifact", "Magik", "Darkness"]
  },
  {
    id: 'mine_lost_army_pistol',
    name: "Lost Army Pistol",
    type: "Artifact - Gun - Pistol - Lost Army",
    slot: "Hand Weapon",
    value: 700,
    weight: 1,
    upgradeSlots: 1,
    effects: [
      "Range 7; Shots 1.",
      "Uses the D8 for Damage.",
      "You may take up to 3 Corruption Hits to add +1 Shot for each.",
      "While equipped, gain +1 Combat."
    ],
    tags: ["Artifact", "Gun", "Pistol", "Lost Army"]
  },

  // --- Batch 5 --------------------------------------------------------------
  {
    id: 'mine_dark_stone_prism',
    name: "Dark Stone Prism",
    type: "Artifact - Dark Stone",
    slot: "None",
    value: 800,
    weight: 1,
    upgradeSlots: 0,
    effects: [
      "You may focus the lantern’s light through the Prism.",
      "Free Attack (once per Fight): While in the same or adjacent space as the Lantern, use 1 Grit to count out a straight-line 'beam' from your space a number of spaces equal to the Hold Back the Darkness roll.",
      "Any model in a beam space takes 3D3 Wounds, ignoring Defense."
    ],
    tags: ["Artifact", "Dark Stone"]
  },
  {
    id: 'mine_otherworld_artifact_derelict_ship',
    name: "Otherworld Artifact (Derelict Ship)",
    type: "Artifact",
    slot: "None",
    value: null,
    weight: 1,
    upgradeSlots: 0,
    effects: ["Draw an Artifact from the Derelict Ship Artifacts Deck."],
    tags: ["Artifact", "Otherworld"]
  },
  {
    id: 'mine_hell_pistol',
    name: "Hell Pistol",
    type: "Artifact - Gun - Pistol - Demonic",
    slot: "Hand Weapon",
    value: 650,
    weight: 1,
    upgradeSlots: 1,
    effects: [
      "Range 6; Shots 2.",
      "On each Hit with the Hell Pistol, you may take up to 3 Corruption Hits to do +1 Damage each.",
      "Any Hero may use this Item, regardless of class restrictions."
    ],
    tags: ["Artifact", "Gun", "Pistol", "Demonic"]
  },
  {
    id: 'mine_angel',
    name: "Angel's Tears",
    type: "Artifact - Glass - Holy",
    slot: "None",
    value: 500,
    weight: 1,
    upgradeSlots: 0,
    effects: [
      "Discard to immediately do D3 Wounds, ignoring Defense, Armor, and Endurance, to every Demon model on the same and adjacent Map Tiles to you.",
      "Or discard to re-roll a Hold Back the Darkness roll just rolled."
    ],
    tags: ["Artifact", "Glass", "Holy"]
  },
  {
    id: 'mine_bone_dominoes',
    name: "Bone Dominoes",
    type: "Artifact - Charm",
    slot: "Charm",
    value: 425,
    weight: 1,
    upgradeSlots: 1,
    effects: [
      "Once per Adventure, you may add or subtract 1 from a single one of your Dice Rolls."
    ],
    tags: ["Artifact", "Charm"]
  },
  {
    id: 'mine_hell_sword',
    name: "Hell Sword",
    type: "Artifact - Hand Weapon - Blade - Demonic",
    slot: "Hand Weapon",
    value: 550,
    weight: 1,
    upgradeSlots: 1,
    effects: [
      "On each Combat Hit with the Hell Sword, you may take up to 3 Corruption Hits to do +1 Damage each.",
      "Any Hero may use this Item, regardless of class restrictions."
    ],
    tags: ["Artifact", "Hand Weapon", "Blade", "Demonic"]
  },
  {
    id: 'mine_soul_parasite',
    name: "Soul Parasite",
    type: "Artifact - Void - Creature",
    slot: "None",
    value: 600,
    weight: 1,
    upgradeSlots: 0,
    effects: [
      "+1 Initiative.",
      "+2 Lore.",
      "Any time you roll a 1 for Move, take 2 Sanity Damage ignoring Willpower.",
      "MAY NOT be sold, traded, or discarded."
    ],
    tags: ["Artifact", "Void", "Creature"]
  },
  {
    id: 'mine_void_scroll',
    name: "Void Scroll",
    type: "Artifact - Void - Scroll - Magik",
    slot: "None",
    value: 250,
    weight: 1,
    upgradeSlots: 0,
    effects: [
      "Discard for the following Free Attack:",
      "Range 12; Shots 2.",
      "Any Hits count as Critical Hits."
    ],
    tags: ["Artifact", "Void", "Scroll", "Magik"]
  },

  // --- Batch 6 --------------------------------------------------------------
  {
    id: 'mine_jewel_of_the_void',
    name: "Jewel of the Void",
    type: "Artifact - Void",
    slot: "None",
    value: 250,
    weight: 1,
    upgradeSlots: 0,
    effects: [
      "+1 Spirit.",
      "Discard to heal a Mutation or to remove a Parasite."
    ],
    tags: ["Artifact", "Void"]
  },
  {
    id: 'mine_ring_of_corruption',
    name: "Ring of Corruption",
    type: "Artifact - Ring - Magik",
    slot: "Ring",
    value: 400,
    weight: 1,
    upgradeSlots: 1,
    effects: [
      "Once per Adventure, you may take D3 Corruption Hits to change any single die just rolled to a 1 or 6.",
      "You can now hold one more Corruption Point before getting a Mutation."
    ],
    tags: ["Artifact", "Ring", "Magik"]
  },
  {
    id: 'mine_horrific_statue',
    name: "Horrific Statue",
    type: "Artifact - Dark Stone - Statue",
    slot: "None",
    value: 275,
    weight: 1,
    upgradeSlots: 0,
    effects: [
      "+1 Lore.",
      "You may break the Statue (discard) to cancel every Darkness card currently in play on the D6 roll of 3+ each."
    ],
    tags: ["Artifact", "Dark Stone", "Statue"]
  },
  {
    id: 'mine_void_hood',
    name: "Void Hood",
    type: "Artifact - Void - Clothing - Hat",
    slot: "Hat",
    value: 550,
    weight: 1,
    upgradeSlots: 1,
    effects: [
      "You always get your normal Defense/Willpower saves, even against things that would ignore them.",
      "Gain +1 Spirit for every 2 Mutations you have (limit +3)."
    ],
    tags: ["Artifact", "Void", "Clothing", "Hat"]
  },

  // --- Batch 7 (deduped: removed duplicate Void Scroll) ---------------------
  {
    id: 'mine_journal_from_the_alamo',
    name: "Journal from the Alamo",
    type: "Artifact - Book - Relic",
    slot: "None",
    value: 850,
    weight: 1,
    upgradeSlots: 0,
    effects: [
      "+1 Lore.",
      "Once per Adventure, all Heroes may Recover 1 Grit."
    ],
    tags: ["Artifact", "Book", "Relic"]
  },
  {
    id: 'mine_otherworld_artifact_swamps_of_jargono',
    name: "Otherworld Artifact (Swamps of Jargono)",
    type: "Artifact",
    slot: "None",
    value: null,
    weight: 1,
    upgradeSlots: 0,
    effects: ["Draw an Artifact from the Swamps of Jargono Artifacts Deck."],
    tags: ["Artifact", "Otherworld"]
  },
  {
    id: 'mine_void_hound_tooth',
    name: "Void Hound Tooth",
    type: "Artifact - Void - Charm",
    slot: "Charm",
    value: 375,
    weight: 1,
    upgradeSlots: 1,
    effects: [
      "You take 1 less Damage from each Hit done to you by a Void Enemy (minimum of 1)."
    ],
    tags: ["Artifact", "Void", "Charm"]
  },
  {
    id: 'mine_amulet_of_b_lorn',
    name: "Amulet of Bālorn",
    type: "Artifact - Magik - Amulet",
    slot: "Amulet",
    value: 425,
    weight: 1,
    upgradeSlots: 1,
    effects: [
      "+1 Strength.",
      "Use 1 Grit to make all your Attacks +1 Damage until the end of the turn."
    ],
    tags: ["Artifact", "Magik", "Amulet"]
  },
  {
    id: 'mine_axe_of_savagery',
    name: "Axe of Savagery",
    type: "Artifact - Hand Weapon - Tribal",
    slot: "Hand Weapon",
    value: 725,
    weight: 1,
    upgradeSlots: 1,
    effects: [
      "+1 Combat.",
      "+1 Lore.",
      "When you do one or more Wounds to an Enemy with your Combat Hits, roll a D6. On 5+, also add a Bleeding Marker to that Enemy."
    ],
    tags: ["Artifact", "Hand Weapon", "Tribal"]
  },
  {
    id: 'mine_hellfire_ring',
    name: "Hellfire Ring",
    type: "Artifact - Ring - Magik",
    slot: "Ring",
    value: 425,
    weight: 1,
    upgradeSlots: 1,
    effects: [
      "Once per Adventure, you may make the following Free Attack:",
      "Choose any space on your Map Tile. Every model in an adjacent space takes a Hit causing 2D6 Damage."
    ],
    tags: ["Artifact", "Ring", "Magik"]
  },
  {
    id: 'mine_void_ring',
    name: "Void Ring",
    type: "Artifact - Ring - Magik - Void",
    slot: "Ring",
    value: 200,
    weight: 1,
    upgradeSlots: 1,
    effects: [
      "+1 Spirit.",
      "Once per Adventure, prevent the Darkness from moving on the Depth Track."
    ],
    tags: ["Artifact", "Ring", "Magik", "Void"]
  },

  // --- Batch 8 (deduped: removed duplicate Hell Bullets, Jewel refs) -------
  {
    id: 'mine_trederran_trench_pistol',
    name: "Trederran Trench Pistol",
    type: "Artifact - Gun - Pistol - Trederran",
    slot: "Hand Weapon",
    value: 500,
    weight: 1,
    upgradeSlots: 1,
    effects: [
      "Take 1 Corruption Hit to fire.",
      "Range 5; Shots 3; Damage +1."
    ],
    tags: ["Artifact", "Gun", "Pistol", "Trederran"]
  },
  {
    id: 'mine_olde_bell',
    name: "Olde Bell",
    type: "Artifact - Icon",
    slot: "None",
    value: 850,
    weight: 1,
    upgradeSlots: 0,
    effects: [
      "Once per Adventure, you may ring the Olde Bell to cancel a Darkness or Growing Dread card.",
      "Then choose another Darkness or Growing Dread card and cancel it on the D6 roll of 4+.",
      "You may continue to choose and cancel cards like this until you fail one of these rolls."
    ],
    requires: "Lore 4+ to use",
    tags: ["Artifact", "Icon"]
  },
  {
    id: 'mine_cross_of_kandor',
    name: "Cross of Kandor",
    type: "Artifact - Hand Weapon - Holy",
    slot: "Hand Weapon",
    value: 825,
    weight: 1,
    upgradeSlots: 1,
    effects: [
      "+1 Combat.",
      "All Undead Enemies adjacent to you (or on your Map Tile, if you are Holy) are -1 Defense."
    ],
    requires: "Spirit 3+ to use",
    tags: ["Artifact", "Hand Weapon", "Holy"]
  },
  {
    id: 'mine_amulet_of_hein_ghal',
    name: "Amulet of Hein’ghal",
    type: "Artifact - Magik - Amulet",
    slot: "Amulet",
    value: 225,
    weight: 1,
    upgradeSlots: 1,
    effects: ["Once per Adventure, add an extra D6 Damage to a single Hit."],
    tags: ["Artifact", "Magik", "Amulet"]
  },
  // Adding the OW pulls here once for completeness (not duplicated above):
  {
    id: 'mine_otherworld_artifact_caverns_of_cynder_2',
    name: "Otherworld Artifact (Caverns of Cynder)",
    type: "Artifact",
    slot: "None",
    value: null,
    weight: 1,
    upgradeSlots: 0,
    effects: ["Draw an Artifact from the Caverns of Cynder Artifacts Deck."],
    tags: ["Artifact", "Otherworld"]
  },
  {
    id: 'mine_otherworld_artifact_targa_plateau_2',
    name: "Otherworld Artifact (Targa Plateau)",
    type: "Artifact",
    slot: "None",
    value: null,
    weight: 1,
    upgradeSlots: 0,
    effects: ["Draw an Artifact from the Targa Plateau Artifacts Deck."],
    tags: ["Artifact", "Otherworld"]
  },
  {
    id: 'mine_cross_of_hidalgo',
    name: "Cross of Hidalgo",
    type: "Artifact - Hand Weapon - Holy",
    slot: "Hand Weapon",
    value: 625,
    weight: 1,
    upgradeSlots: 0,
    effects: [
      "+1 Combat.",
      "+1 Lore.",
      "Once per turn, you may use 1 Grit to add +D6 Damage to one of your Combat Hits against a Demon or Ghost."
    ],
    requires: "Spirit 3 or higher to use",
    tags: ["Artifact", "Hand Weapon", "Holy"]
  },
  {
    id: 'mine_otherworld_artifact_canyons',
    name: "Otherworld Artifact (Canyons)",
    type: "Artifact",
    slot: "None",
    value: null,
    weight: 1,
    upgradeSlots: 0,
    effects: ["Draw an Artifact from the Canyon Deck."],
    tags: ["Artifact", "Otherworld"]
  }
];
export default mineArtifacts;
