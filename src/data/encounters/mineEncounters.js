export const mineEncounters = [
  {
    id: "dark_stranger",
    name: "Dark Stranger",
    tags: ["Active", "Stranger", "Demon"],
    flavor: "A cloaked figure steps from the shadows, offering a sinister bargain.",
    test: { stat: "Cunning", target: "5+",
      success: ["Gain 25 XP"],
      fail: ["Lose 1 Sanity permanently, but you may draw an Artifact card"]
    },
    notes: "You may choose to fail automatically to take the deal without rolling.",
  },
  {
    id: "whispering_widow",
    name: "The Whispering Widow",
    tags: ["Active", "Stranger", "Ghost"],
    flavor: "A veiled and ghostly woman, clad in all black, floats across the room. Taking notice of you, she changes course and flickers, appearing at your ear with a hushed and raspy whisper of a gruesome death yet to come.",
    test: { stat: "Spirit", target: "5+",
      success: ["Gain 20 XP", "+2 Initiative during the first turn of the next Fight"],
      fail: ["Draw D3 Growing Dread cards and add them to the stack"]
    },
  },
  {
    id: "gateway_to_another_world",
    name: "Gateway to Another World",
    tags: ["Environment", "Void"],
    flavor: "A shimmering portal to another world fills the room with dancing light!",
    effects: [
      "This room has one extra Door that is a Gate",
      "If all exits already have Doors, randomly choose one to become a Gate"
    ],
    followUp: { roll: "D6", table: { "1-3": "Attack! Draw a Threat card" } },
  },
  {
    id: "hell_pit",
    name: "Hell Pit",
    tags: ["Active", "Hell"],
    flavor: "In the middle of the room, a gaping pit has been torn into the floor. Hot wind and the screams of the damned wash up over you from the black depths of the Hell Pit!",
    test: { stat: "Spirit", target: "5+",
      success: ["Gain 20 XP for each 5+"],
      fail: ["Take D6 Corruption Hits"]
    },
    effects: [
      "If at least one Hero failed, Attack! Draw a Threat card",
      "Enemies from this Fight deal +1 Corruption Hit when causing Wounds"
    ],
  },
  {
    id: "chained_slave",
    name: "Chained Slave",
    tags: ["Active", "Stranger"],
    flavor: "Chained to the floor at the center of the room is an emaciated and twisted figure, offering up little more than insane ramblings and a whispered riddle.",
    test: { stat: "Cunning", target: "6+",
      success: ["Gain 30 XP", "Look at top 3 Exploration Tokens, discard one, reorder the rest"],
      fail: ["Take D8 Sanity Damage, ignoring Willpower"]
    },
  },
  {
    id: "bleeding_walls",
    name: "Bleeding Walls",
    tags: ["Active", "Blood"],
    flavor: "Thick, dark blood runs down the walls here, pooling on the floor and running into cracks in the stone.",
    test: { stat: "Cunning", target: "6+",
      success: ["Gain 25 XP"],
      fail: ["All Heroes take D6 Wounds, ignoring Defense and Armor"]
    },
  },
  {
    id: "splintered_reality",
    name: "Splintered Reality",
    tags: ["Active", "Time"],
    flavor: "Time fractures around you as reality begins to distort.",
    test: { stat: "Lore", target: "5+",
      success: ["Gain 25 XP", "Look at the top card of any deck (discard or return)"],
      fail: ["Lose the most valuable Item you possess"]
    },
  },
  {
    id: "lost_army_camp",
    name: "Lost Army Camp Site",
    tags: ["Environment", "Dread"],
    flavor: "An abandoned military encampment with rusted cannons and scattered supplies.",
    choices: [
      { label: "Sabotage the cannons",
        test: { stat: "Cunning", target: "6+",
          success: ["Gain 15 XP per success and place a Sanity token"],
          fail: ["If more than half the Heroes fail, draw 3 Growing Dread cards"]
        }
      },
      { label: "Get out fast",
        effects: ["Draw a Growing Dread card"]
      }
    ],
  },
  {
    id: "bandit_hideout",
    name: "Bandit Hideout",
    tags: ["Active", "Trap"],
    flavor: "A hidden outlaw den, rigged with traps to protect their stash.",
    test: { stat: "Cunning", target: "5+",
      success: ["Disarm the trap safely"],
      fail: ["Dynamite explodes! Take D6 Wounds ignoring Defense"]
    },
    followUp: {
      label: "Search for loot",
      test: { stat: "Luck", target: "5+",
        success: ["Draw 2 Loot cards"],
        fail: []
      }
    },
  },
  {
    id: "black_blood",
    name: "Black Blood of the Earth",
    tags: ["Environment", "Darkness"],
    flavor: "A pool of viscous black liquid bubbles and hisses in the center of the room.",
    choices: [
      { label: "Study the pool",
        test: { stat: "Lore", target: "6+",
          success: ["Gain 50 XP and discard D3 Corruption"],
          fail: ["Take D6 Hits and D6 Horror Hits"]
        }
      },
      { label: "Skirt the edges",
        test: { stat: "Spirit", target: "5+",
          success: ["Pass safely"],
          fail: ["Take D3 Corruption Hits"]
        }
      }
    ],
  },
  {
    id: "scorching_hellfire",
    name: "Scorching Hellfire",
    tags: ["Environment", "Hell"],
    flavor: "The fires of hell erupt around you, spitting gouts of flame.",
    effects: [
      "Place Hellfire markers adjacent to each Hero at start of each turn",
      "Markers bounce and deal 2D6 Damage on impact, then remove"
    ],
    remainsInPlay: true,
  },
  {
    id: "underground_waterfall",
    name: "Underground Waterfall",
    tags: ["Environment", "Water"],
    flavor: "A thundering waterfall crashes down from above, filling the passage with spray and noise.",
    effects: [
      "Heroes on this tile may not Escape",
      "Roll D6: on 1-3, waterfall noise masks enemies — Ambush Attack!"
    ],
    remainsInPlay: true,
  },
  {
    id: "a_crack_in_space",
    name: "A Crack in Space",
    tags: ["Active", "Void"],
    flavor: "A tear in space and time opens before you, crackling with void energy.",
    test: { stat: "Spirit", target: "6+",
      success: ["Gain 20 XP and Recover 1 Grit"],
      fail: ["Lose D8 Sanity ignoring Willpower"]
    },
    effects: ["Must test again each time a Hero ends movement here"],
  },
  // --- Cards from ChatGPT OCR (physical deck scan) ---
  {
    id: "martyrs_for_the_cause",
    name: "Martyrs for the Cause",
    tags: ["Active", "Death"],
    flavor: "Bodies litter the ground from a desperate last stand.",
    test: { stat: "Luck", target: "6+",
      success: ["Draw an Artifact card"],
      fail: ["All Heroes take D6 Horror Hits"]
    },
    effects: ["This Map Tile may be Scavenged up to 5 times"],
    remainsInPlay: true,
  },
  {
    id: "ghost_fire",
    name: "Ghost Fire",
    tags: ["Environment", "Fire"],
    flavor: "Burning bright green, with dancing embers of madness, a bonfire blazes at a doorway.",
    effects: [
      "Place next to a Doorway",
      "Any Hero passing through must pass Spirit 5+ or take 3 Horror Hits (2 Sanity Damage each)"
    ],
    remainsInPlay: true,
  },
  {
    id: "rail_switch",
    name: "Rail Switch",
    tags: ["Environment", "Explore"],
    flavor: "Tracks split ahead with a rusted switch box nearby.",
    test: { stat: "Strength", target: "4+",
      success: ["Gain 25 XP and roll for additional effects"],
      fail: []
    },
  },
  {
    id: "desiccated_remains",
    name: "Desiccated Remains",
    tags: ["Active", "Death"],
    flavor: "A charred corpse crumbles into dust as you approach.",
    test: { stat: "Spirit", target: "6+",
      success: ["Gain 40 XP", "May draw a Gear card"],
      fail: ["Take D6 Horror Hits"]
    },
  },
  {
    id: "a_dark_rift",
    name: "A Dark Rift",
    tags: ["Environment", "Void"],
    flavor: "A swirling tear in reality pulls at your very soul.",
    effects: [
      "All Heroes gain Spirit x 10 XP",
      "Roll per item carried or suffer losses/injury"
    ],
  },
  {
    id: "broken_skulls",
    name: "Broken Skulls",
    tags: ["Active", "Death"],
    flavor: "A mound of shattered skulls stares back at you.",
    test: { stat: "Spirit", target: "5+",
      success: ["Draw Scavenge cards per success"],
      fail: ["Take Horror Hits"]
    },
  },
  {
    id: "to_the_gates_of_hell",
    name: "To the Gates of Hell",
    tags: ["Active", "Void"],
    flavor: "A burning portal beckons you forward.",
    test: { stat: "Agility", target: "6+",
      success: ["Gain 25 XP and Recover 1 Grit"],
      fail: ["Gain D3 Burning markers"]
    },
    remainsInPlay: true,
  },
  {
    id: "voice_of_betrayal",
    name: "Voice of Betrayal",
    tags: ["Active", "Insanity"],
    flavor: "A whisper urges you to turn on your allies.",
    effects: [
      "Willpower test based on Gold carried",
      "Failures cause attacks on allies"
    ],
  },
  {
    id: "suffocating_heat",
    name: "Suffocating Heat",
    tags: ["Environment", "Heat"],
    flavor: "The air itself burns your lungs with oppressive heat.",
    effects: [
      "All Heroes lose 1 Grit",
      "While active: -1 Max Grit"
    ],
    remainsInPlay: true,
  },
  {
    id: "ancient_prophecy",
    name: "Ancient Prophecy",
    tags: ["Environment", "Omen"],
    flavor: "Cracked stone reveals ancient runes of doom.",
    test: { stat: "Lore", target: "6+",
      success: ["Gain XP per success"],
      fail: ["Draw a Darkness card"]
    },
  },
  {
    id: "lucky_find",
    name: "Lucky Find",
    tags: ["Environment", "Loot"],
    flavor: "A pile of broken scraps may hide something useful.",
    test: { stat: "Luck", target: "6+",
      success: ["Draw a Loot card"],
      fail: ["Ambush Attack! Draw a Threat card"]
    },
  },
  {
    id: "stirring_in_the_deep",
    name: "Stirring in the Deep",
    tags: ["Active", "Darkness"],
    flavor: "Something shifts beneath the surface.",
    test: { stat: "Luck", target: "5+",
      success: ["Gain XP and draw a Loot card"],
      fail: ["Draw a Growing Dread card and Attack! Draw a Threat card"]
    },
  },
  {
    id: "stand_off",
    name: "Stand-Off",
    tags: ["Active", "Outlaw"],
    flavor: "A bandit stands ready, finger on the trigger.",
    test: { stat: "Cunning", target: "5+",
      success: ["Gain 20 XP"],
      fail: ["Take D6 Hits or fight"]
    },
  },
  {
    id: "ancient_ruins",
    name: "Ancient Ruins",
    tags: ["Environment", "Ancient"],
    flavor: "A buried structure emerges from the dust.",
    test: { stat: "Lore", target: "6+",
      success: ["Gain XP"],
      fail: ["Draw a Growing Dread card"]
    },
  },
  {
    id: "hidden_stash",
    name: "Hidden Stash",
    tags: ["Environment", "Loot"],
    flavor: "A hidden panel reveals something left behind.",
    test: { stat: "Cunning", target: "5+",
      success: ["Gain XP"],
      fail: ["Take D6 Horror Hits"]
    },
  },
  {
    id: "voices_from_beyond",
    name: "Voices from Beyond",
    tags: ["Active", "Ghost"],
    flavor: "Ghostly whispers claw at your mind.",
    test: { stat: "Spirit", target: "5+",
      success: ["Gain 15 XP"],
      fail: ["Draw a Growing Dread card or take D6 Horror Hits"]
    },
  },
  {
    id: "runic_circles",
    name: "Runic Circles",
    tags: ["Environment", "Magik"],
    flavor: "Ancient markings glow beneath your feet.",
    test: { stat: "Spirit", target: "6+",
      success: ["Gain XP and gain Spirit Armor"],
      fail: ["-1 Willpower"]
    },
  },
  {
    id: "the_wretched_one",
    name: "The Wretched One",
    tags: ["Active", "Creature"],
    flavor: "A twisted creature lunges from the shadows.",
    test: { stat: "Strength", target: "6+",
      success: ["Gain 25 XP"],
      fail: ["Draw 3 Growing Dread cards"]
    },
  },
  {
    id: "explosive_charges",
    name: "Explosive Charges",
    tags: ["Active", "Explosive"],
    flavor: "Bundles of dynamite begin to spark.",
    test: { stat: "Cunning", target: "6+",
      success: ["Gain 25 XP"],
      fail: ["Take D6 Wounds ignoring Defense"]
    },
  },
  {
    id: "creaking_timbers",
    name: "Creaking Timbers",
    tags: ["Environment", "Collapse"],
    flavor: "The ceiling groans under unseen pressure.",
    test: { stat: "Luck", target: "5+",
      success: [],
      fail: ["Take D6 Hits"]
    },
    remainsInPlay: true,
  },
  {
    id: "voice_of_corruption",
    name: "Voice of Corruption",
    tags: ["Active", "Darkness"],
    flavor: "The Darkness speaks directly into your soul.",
    test: { stat: "Spirit", target: "5+",
      success: ["Heal D6 Wounds or Sanity and gain XP"],
      fail: ["Take Corruption Hits or Wounds"]
    },
  },
  {
    id: "pestilence_flies",
    name: "Pestilence Flies",
    tags: ["Active", "Plague"],
    flavor: "A swarm of diseased insects surrounds you.",
    effects: [
      "Heroes cannot use Grit while this is in play",
      "Take 3 Corruption Hits",
      "Roll for Loot or Ambush Attack"
    ],
    remainsInPlay: true,
  },
  {
    id: "falling_darkness",
    name: "Falling Darkness",
    tags: ["Active", "Darkness"],
    flavor: "The Old Lantern flickers as unnatural darkness settles in.",
    effects: [
      "Roll dice equal to Darkness track position",
      "Each 1 = draw a Darkness card"
    ],
    test: { stat: "Spirit", target: "5+",
      success: ["Gain 20 XP", "Re-roll Hold Back the Darkness once"],
      fail: ["Lantern only lights current tile"]
    },
  },
  {
    id: "void_lair",
    name: "Void Lair",
    tags: ["Environment", "Void"],
    flavor: "The passage is covered in thick, sticky webs and egg sacs.",
    effects: ["All Heroes need +1 To Hit"],
    rollTable: { dice: "D6", results: {
      "1-2": { name: "Venom Burst",
        test: { stat: "Agility", target: "5+",
          fail: ["Take D6 Wounds and D6 Sanity Damage"] }
      },
      "3-4": { name: "Hatching", effect: "Ambush Attack! — Void Spiders" },
      "5-6": { name: "Dormant", effect: "No Effect" }
    }},
    remainsInPlay: true,
  },
  {
    id: "flooded_passage",
    name: "Flooded Passage",
    tags: ["Environment", "Water"],
    flavor: "The passage is flooded with knee-deep, murky water.",
    effects: ["Movement costs +1 Move per space"],
    rollTable: { dice: "D6", results: {
      "1-2": { name: "Pulled Under",
        test: { stat: "Strength", target: "5+",
          fail: ["Take 2D6 Wounds ignoring Defense"] }
      },
      "3-4": { name: "Zombies", effect: "Ambush Attack! — Hungry Dead" },
      "5-6": { name: "Dirty Water", effect: "No Effect" }
    }},
    remainsInPlay: true,
  },
  {
    id: "dark_altar",
    name: "Dark Altar",
    tags: ["Environment", "Cult"],
    flavor: "A wicked-looking altar rests here. Clearly someone has been up to no good!",
    choices: [
      { label: "Knock the altar down",
        test: { stat: "Strength", target: "5+",
          success: ["Gain 40 XP"],
          fail: ["Attack! Draw a Threat card (Elite)"]
        }
      },
      { label: "Ignore it and move on",
        test: { stat: "Luck", target: "3+",
          success: [],
          fail: ["Draw a Darkness card"]
        }
      }
    ],
  },
  {
    id: "plague_of_locusts",
    name: "Plague of Locusts",
    tags: ["Plague", "Omen"],
    flavor: "A twisting swarm of angry locusts floods the chamber.",
    effects: [
      "Each Side Bag Token: on roll of 1-2, discard it",
      "If no tokens: take D6 Wounds ignoring Defense"
    ],
    test: { stat: "Spirit", target: "5+",
      success: ["Recover 1 Grit"],
      fail: []
    },
  },
  {
    id: "plague_of_frogs",
    name: "Plague of Frogs",
    tags: ["Plague", "Omen"],
    flavor: "A tidal wave of frogs leaps past you.",
    effects: [
      "Each Hero counts as carrying +1 Side Bag Token",
      "Must discard if over limit"
    ],
  },
  {
    id: "look_out",
    name: "Look Out!",
    tags: ["Attack"],
    flavor: "Enemies emerge from the shadows with no warning!",
    effects: ["Attack! Draw a Threat card"],
  },
  {
    id: "war_chest",
    name: "War Chest",
    tags: ["Darkness"],
    flavor: "A war room filled with maps and a rune-covered chest.",
    choices: [
      { label: "Open the Chest",
        test: { stat: "Lore", target: "5+",
          success: ["Draw Loot cards per success"],
          fail: ["Take Corruption Hits on low rolls"]
        }
      },
      { label: "Destroy the Chest",
        effects: [
          "Discard explosives to attempt destruction",
          "Roll D6 to remove Darkness or advance Depth Track"
        ]
      }
    ],
  },
  {
    id: "acid_drips",
    name: "Acid Drips",
    tags: ["Environment", "Acid"],
    flavor: "Drips of acid fall from the ceiling here, burning anything they touch.",
    effects: [
      "Start of activation: Agility 5+ or take D3 Wounds ignoring Defense",
      "Re-draw Nothing Here when scavenging"
    ],
    remainsInPlay: true,
  },
  {
    id: "smugglers_trap",
    name: "Smuggler's Trap",
    tags: ["Outlaw", "Trap"],
    flavor: "A hidden tripwire snaps tight as you step into the room.",
    test: { stat: "Luck", target: "6+",
      success: ["Gain 30 XP"],
      fail: ["Take D6 Wounds ignoring Defense"]
    },
    followUp: { roll: "D6 per doorway",
      effects: ["Block exits", "If no exits remain, advance Darkness and remove End Cap"]
    },
  },
  {
    id: "reinforced_passage",
    name: "Reinforced Passage",
    tags: ["Active", "Construction"],
    flavor: "The passage here has been reinforced with timbers and framework.",
    effects: [
      "Next Depth Event is canceled, then discard this card",
      "All models are +2 Move while in play"
    ],
    remainsInPlay: true,
  },
  {
    id: "dusty_crates",
    name: "Dusty Crates",
    tags: ["Explore"],
    flavor: "The room is filled with dusty crates and barrels.",
    choices: [
      { label: "Search the crates",
        test: { stat: "Strength", target: "5+",
          success: ["Gain 10 XP and draw a Loot card"],
          fail: ["Ambush! D3 Hungry Dead emerge"]
        }
      },
      { label: "Ignore them",
        effects: ["Each Hero takes 3 Horror Hits"]
      }
    ],
  },
];
