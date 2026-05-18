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

  // ── Cards from physical deck scan (2026-05-18) ────────────────────────────
  {
    id: "ominous_hole",
    name: "Ominous Hole",
    tags: ["Encounter", "Environment", "Explore"],
    flavor: "A large and forbodingly dark hole sits in the far wall of the room, beckoning you to shine your lantern's light inside.",
    effect: "Choose:\n\nLook into the dark hole — Roll a D6:\n1-2 Pulled In — Strength 5+: If failed, you are pulled into the hole by a savage tentacle! Take 2D6 Wounds with no Defense before escaping.\n3-4 Hellbats pour out of the hole! Ambush Attack! — Hellbats.\n5-6 What's this? — Draw an Artifact.\n\nIgnore it and move on — Luck 4+: If failed by any Hero, Ambush Attack! — Draw a Threat.",
  },
  {
    id: "rockslide",
    name: "Rockslide",
    tags: ["Encounter", "Active", "Collapse"],
    flavor: "Rusty metal chutes protrude into this chamber. As you pick your way through, rocks begin to roll down the chutes. LOOK OUT!!!",
    test: "Agility 5+, Strength 5+",
    effect: "If passed, gain 20 XP as you avoid the worst of it. If failed, take D8 Hits as you are pummeled by rocks.\n\nThen — If passed, you find something buried in the debris and pull it free! Draw a Loot card.",
  },
  {
    id: "pounding_of_the_guns",
    name: "Pounding of the Guns",
    tags: ["Encounter", "Active", "Dread"],
    flavor: "The ground shakes and dust falls from overhead as the thunderous guns ring out in the distance!",
    test: "Spirit 5+",
    effect: "When revealed, immediately triggers number 4 on the Depth Event chart.\n\nSpirit 5+: If successful, gain 15 XP and you may Recover a Grit as you steady yourself. If failed, draw a Growing Dread card and add it to the stack.",
  },
  {
    id: "prospector",
    name: "Prospector",
    tags: ["Encounter", "Active", "Stranger"],
    flavor: "You find an old prospector in the mines. He looks at you with a suspicious glare.",
    effect: "Cunning 5+: If successful, he uses his medical supplies to Heal D3 Wounds from each Hero. If failed, he goes crazy, doing D6 Hits to a Random Hero before being shot dead.\n\nThen — Luck 5+: If successful, on his way out, he hands you a Loot. If failed, he falls to his knees and explodes in a shower of gore as something bursts out of him! Attack — Tentacles.",
  },
  {
    id: "river_of_blood",
    name: "River of Blood",
    tags: ["Encounter", "Active", "Blood", "Plague", "Omen"],
    flavor: "Shining the light on the water, you are aghast to discover it is a river of blood! A dark object catches your eye, riding the current just below the surface.",
    test: "Agility 6+",
    effect: "If passed, you plunge your hand into the river and pull out something of value! Draw a Mine Artifact. If failed, you lean in close to get a better look...and are pulled in! Take 2D6 Sanity Damage, ignoring Willpower, as you drag yourself back out, coughing and covered in thick blood!",
  },
  {
    id: "plague_of_boils",
    name: "Plague of Boils",
    tags: ["Encounter", "Active", "Plague", "Omen"],
    flavor: "Looking down at your hand, you notice a large, puss-filled boil. That wasn't there before!",
    test: "Spirit 5+",
    effect: "If passed, gain 25 XP as you resist the worst of the plague. If failed, you are overcome with painful boils! Until the end of the Adventure, you are -D6 to your Health and -1 Strength.",
  },
  {
    id: "dark_stone_deposit",
    name: "Dark Stone Deposit",
    tags: ["Encounter", "Environment", "Dark Stone"],
    flavor: "Shards of Dark Stone protrude from the walls here, giving the room a faint purple glow.",
    test: "Strength 5+",
    effect: "For every 5+ a Hero rolls, they may collect 1 Dark Stone Shard.\n\nThen — Roll a D6. On the roll of 1, 2, or 3, creatures are attracted by the smell of the Dark Stone! Attack! — Draw a Threat.",
  },
  {
    id: "crossroads",
    name: "Crossroads",
    tags: ["Encounter", "Active", "Demon"],
    flavor: "With a flash and a smile, a shiny demon appears at the crossroads up ahead.",
    effect: "There is only 1 exit from this Map Tile and it leads to a Cross Passage. Any one Hero may make a deal with the shiny demon: Spend 100 × your current Hero Level in XP and choose any one Skill from your Skill Upgrade Chart to immediately gain (even if you do not have the one before it). From now on, at the end of every Adventure, you must roll 3D6 (this roll may not be Re-rolled or modified). If triples are rolled, the demon returns to collect, carrying you off forever!\n\nIf no Hero takes the deal, he curses you and vanishes — every Hero is reduced to 0 Grit.",
  },
  {
    id: "memory_of_misery",
    name: "Memory of Misery",
    tags: ["Encounter", "Active", "Insanity"],
    flavor: "Every step you take forward becomes painful, as you begin to feel a burning in your bones and mind!",
    test: "Spirit 6+",
    effect: "If successful, gain 25 XP as you shake off the waking nightmare. If failed, take this card. At the start of every turn, take 1 Sanity Damage, ignoring Willpower. You may discard this card by spending 2 Grit, or automatically at the end of the Adventure, or if KO'd.",
  },
  {
    id: "fallen_gunfighter",
    name: "Fallen Gunfighter",
    tags: ["Encounter", "Active", "Attack"],
    flavor: "You come across the body of a gunfighter, shot down in a duel. He is freshly dead! Hearing the familiar click of a six-shooter being cocked, his killer steps out of the shadows.",
    effect: "The Hero Posse must immediately engage in an Undead Gunslinger Challenge.\n\nQuickdraw — 6 dice\nHits to Banish — 3+ Hero Posse Level\nGain 25 XP per Hit you do.",
  },
  {
    id: "warning_from_the_grave",
    name: "Warning from the Grave",
    tags: ["Encounter", "Active", "Puzzle"],
    flavor: "A skeletal figure slumped against the passage wall seems to have scratched a warning into the stone.",
    test: "Cunning 5+",
    effect: "If successful, gain 25 XP and take this card. You may discard it at any time during this Adventure to give a Hero 3 extra dice on a skill test or to give all Heroes +3 Initiative for one Fight Round.\n\nIf failed, the warning is too late! Attack — Draw a Threat.",
  },
  {
    id: "bandits_lair",
    name: "Bandits' Lair",
    tags: ["Encounter", "Environment", "Outlaw"],
    flavor: "Crates of stolen goods and a few bed rolls line the walls, while a pile of crumpled wanted posters litter the floor.",
    effect: "Each Hero may take 1 Corruption Hit to break open a crate and pilfer the stolen goods:\n\nStrength 4+: If passed, gain 10 XP and take one of the following Side Bag Tokens for free: Whiskey or Bandages. If the Hero rolled at least one 6, they may instead choose: Dynamite.",
  },
  {
    id: "bandits_lair_2",
    name: "Bandits' Lair",
    tags: ["Encounter", "Environment", "Outlaw"],
    flavor: "Crates of stolen goods and a few bed rolls line the walls, while a pile of crumpled wanted posters litter the floor.",
    effect: "Each Hero may take 1 Corruption Hit to break open a crate and pilfer the stolen goods:\n\nStrength 4+: If passed, gain 10 XP and take one of the following Side Bag Tokens for free: Whiskey or Bandages. If the Hero rolled at least one 6, they may instead choose: Dynamite.",
  },
  {
    id: "death_ritual",
    name: "Death Ritual",
    tags: ["Encounter", "Environment", "Ghost", "Omen"],
    flavor: "Entering the room, you see a terrified townsperson, tied up on a wooden pyre. Before you can reach them, it bursts into flames and they scream, consumed by the magical fires! The whole spectacle then vanishes into thin air, a spectral echo of a dark ritual.",
    test: "Lore 5+",
    effect: "If passed, gain 10 XP and you may Recover a Grit. If failed, take 3 Horror Hits that do 2 Sanity Damage each, as you are shaken by the brutality of the vision.",
  },
  {
    id: "the_red_spectre",
    name: "The Red Spectre",
    tags: ["Encounter", "Active", "Stranger", "Ghost"],
    flavor: "The temperature in the room drops and you can see your breath hang in the air. With a shimmering red glow, an ethereal form in tattered robes rises up from the blood-stained floor and speaks directly into your mind!",
    test: "Spirit 6+",
    effect: "If passed, you gain knowledge of your own death! You get a personal Revive Token for the rest of this Adventure that only you can use, but you also take D8 Horror Hits. If failed, you are brutally burned by the shade's eternal hatred! Immediately take D6 Burning Markers.",
  },
  {
    id: "traitors_echo",
    name: "Traitor's Echo",
    tags: ["Encounter", "Active", "Treachery", "Ghost"],
    flavor: "A cold shiver floats in the air. Stepping into the dank chamber, a chorus of chilling voices echoes down the halls. \"Yooouuuuu....sooold...us ooooutttt!!\"",
    test: "Spirit 5+",
    effect: "If passed, gain 20 XP as you resist the chilling voices. If failed, take D6 Horror Hits that do 2 Sanity Damage each. Also, for every 1 or 2 rolled for this Skill test, you must discard D6 × $25, as the angry spirits steal their cut of the loot!",
  },
  {
    id: "flash_flood",
    name: "Flash Flood",
    tags: ["Encounter", "Active", "Water"],
    flavor: "A flash flood roars through the mine!",
    effect: "Randomly select a Doorway on this Map Tile (except the entrance) for the direction the flood is coming from.\n\nStrength 5+: If passed, gain 20 XP. If failed, move D6 spaces away from the flooding Doorway and roll a D6 for each Side Bag Token and Ammo you have — on 1 or 2, discard it.\n\nThen — Luck 6+: For each 6+ rolled, draw a Loot washed in by the rushing flood waters.",
  },
  {
    id: "curse_of_coronado",
    name: "Curse of Coronado",
    tags: ["Encounter", "Active", "Curse", "Lost"],
    flavor: "An echo of dark laughter rings in your mind. This chamber...that passage...it all looks...familiar.",
    effect: "Move the Hero Posse Marker D6 spaces backward on the Depth Track.\n\nFor the rest of this Adventure, the Heroes need to roll 1 higher than normal to Hold Back the Darkness.\n\nThis card may be canceled as though it were a Darkness card.",
    remainsInPlay: true,
  },
  {
    id: "shootout_massacre",
    name: "Shootout Massacre",
    tags: ["Encounter", "Environment", "Blood"],
    flavor: "The stench of death hits you long before the lantern's light illuminates the room. Massacred bodies cover the ground, riddled with bullets — the site of a bloody, outlaw shootout!",
    effect: "Choose:\n\nSearch the Bodies — Cunning 5+: Any Hero that passes may draw a Loot card. If fewer than half pass, some of the dead outlaws rise back up! Ambush Attack! — Undead Outlaws.\n\nStep Over the Gore — Luck 5+: If failed, one of the dying outlaws curses you for not stopping to help! You gain a Curse to be -1 Luck.",
  },
  {
    id: "shootout_massacre_2",
    name: "Shootout Massacre",
    tags: ["Encounter", "Environment", "Blood"],
    flavor: "The stench of death hits you long before the lantern's light illuminates the room. Massacred bodies cover the ground, riddled with bullets — the site of a bloody, outlaw shootout!",
    effect: "Choose:\n\nSearch the Bodies — Cunning 5+: Any Hero that passes may draw a Loot card. If fewer than half pass, some of the dead outlaws rise back up! Ambush Attack! — Undead Outlaws.\n\nStep Over the Gore — Luck 5+: If failed, one of the dying outlaws curses you for not stopping to help! You gain a Curse to be -1 Luck.",
  },
  {
    id: "a_warning_to_traitors",
    name: "A Warning to Traitors",
    tags: ["Encounter", "Environment", "Outlaw", "Death"],
    flavor: "As you turn the corner, you come face-to-face with...well, a face. Hanging from the wooden support beams above, are three hanged men. Flies buzz and the smell of death hangs in the air — a warning to those that would betray their gang.",
    test: "Luck 5+",
    effect: "Choose:\n\nCut them down — It takes time to give them a proper burial. Move the Darkness D3 spaces forward on the Depth Track and every Hero may Recover a Grit and Heal D6 Sanity Damage.\n\nPush your way past them — Luck 5+: If failed, you are cursed by the dead! Discard all Revive Tokens in the Posse and draw a Darkness card.",
  },
  {
    id: "army_of_the_dead",
    name: "Army of the Dead",
    tags: ["Encounter", "Active"],
    flavor: "Shhhh! Quiet! ...Listen. Marching footsteps echo down the hall and you hear the trundle of cannons coming this way. There's too many of them! Quickly, hide in the shadows before you're spotted!",
    test: "Agility 4+",
    effect: "If successful, gain 10 XP but lose 1 Grit as you hide in the darkness while the hundred-strong army of the dead marches past.\n\nIf failed, you cough from all the dust in the air. Two ghastly soldiers take notice and turn to investigate! You must either discard 1 Side Bag Token or 1 Item to distract them away, or roll once on the Injury table as they find you and stab you with their bayonets, leaving you for dead.",
  },
  {
    id: "hanging_bodies",
    name: "Hanging Bodies",
    tags: ["Encounter", "Environment", "Blood"],
    flavor: "The ceiling is covered in hanging bodies that sway in the drafty air and drip, drip, drip as a warning to those who would dare to proceed.",
    test: "Lore 5+",
    effect: "For every 5+ rolled, gain 20 XP. If failed, take D6 Horror Hits as you are overcome with visions of dread.\n\nThen — If all Heroes failed the test, add a Growing Dread card to the stack.",
  },
  {
    id: "flooded_passage_2",
    name: "Flooded Passage",
    tags: ["Encounter", "Environment", "Water"],
    flavor: "The passage is flooded with knee-deep, murky water.",
    effects: ["Movement costs +1 Move per space"],
    rollTable: { dice: "D6", results: {
      "1-2": { name: "Pulled Under",
        test: { stat: "Strength", target: "5+",
          fail: ["Take 2D6 Wounds ignoring Defense"] }
      },
      "3-4": { name: "Zombies!", effect: "Ambush Attack! — {P}{P} Hungry Dead" },
      "5-6": { name: "Dirty Water", effect: "No Effect" }
    }},
    remainsInPlay: true,
  },
  {
    id: "mind_worms",
    name: "Mind Worms",
    tags: ["Encounter", "Active", "Creature"],
    flavor: "The wriggling feeling on your neck burns as the worms burrow into your skin...and your mind!",
    test: "Agility 6+",
    effect: "If successful, gain 30 XP. Any Hero that fails must immediately pass a Spirit 4+ test, or lose D6 Sanity with no Willpower saves.\n\nThis Map Tile is infested! Any Hero ending their move on this Map Tile must encounter the Mind Worms again!",
  },
  {
    id: "collapsed_tunnel",
    name: "Collapsed Tunnel",
    tags: ["Encounter", "Environment", "Explore"],
    flavor: "A passage ahead has collapsed. As you approach, you hear voices from the other side!",
    effect: "Choose:\n\nCall Out to Them — Roll a D6:\n1 Look Out! — Ambush Attack!\n2-3 Future Echo — The voices are your own Hero Posse from another point in time! Every Hero Recovers 1 Grit and takes 1 Horror Hit.\n4-6 Turn Left! — Next time you reveal an Exploration Token, draw 2 extra and choose which to use. Discard the others.\n\nListen Closely — Luck 5+: If failed, the voices turn to screams! Every Hero takes D6 Horror Hits.",
  },
  {
    id: "rustlers_trap",
    name: "Rustler's Trap",
    tags: ["Encounter", "Active", "Outlaw", "Trap"],
    flavor: "Stepping into the room, you hear a click as your foot comes down on a pressure plate. A mechanism lifts a crude, wooden gate and you hear the growl of something big, lurking in the shadows.",
    effect: "Reveal cards from the top of the Low Threat Deck until you find one that has a Large (or bigger) Enemy listed. That is the Threat card that emerges. These Enemies are enraged from being trapped, gaining +2 Combat and are worth +5 XP. When defeated, each Hero may draw an extra Loot finding the rustler's stash.",
  },
  {
    id: "buried_loot",
    name: "Buried Loot",
    tags: ["Encounter", "Environment", "Loot"],
    flavor: "You come across a patch of recently disturbed earth. Perhaps something is buried here...or someone.",
    effect: "This Map Tile may be Scavenged up to 5 times. Scavenge cards drawn here (except Nothing Here) give you +$100 each. For each Nothing Here card drawn, roll a D6. If the result is less than the number of Scavenged Markers on this Map Tile (including the current Scavenge), something bursts from the ground! Ambush Attack! — Hungry Dead (if you do not have Hungry Dead, use Tentacles instead).",
    remainsInPlay: true,
  },
  {
    id: "buried_loot_2",
    name: "Buried Loot",
    tags: ["Encounter", "Environment", "Loot"],
    flavor: "You come across a patch of recently disturbed earth. Perhaps something is buried here...or someone.",
    effect: "This Map Tile may be Scavenged up to 5 times. Scavenge cards drawn here (except Nothing Here) give you +$100 each. For each Nothing Here card drawn, roll a D6. If the result is less than the number of Scavenged Markers on this Map Tile (including the current Scavenge), something bursts from the ground! Ambush Attack! — Hungry Dead (if you do not have Hungry Dead, use Tentacles instead).",
    remainsInPlay: true,
  },
  {
    id: "im_sooooo_thirsty",
    name: "I'm Sooooo Thirsty!",
    tags: ["Encounter", "Active", "Stranger", "Ghost"],
    flavor: "The shambling spirit of a long-dead outlaw lurches out of the shadows, his ghostly flesh rotten and falling off. \"You can spare some whiskey for an old friend can't you? I'm sooooo...thirsty!\"",
    effect: "One Random Hero must choose to either discard 1 Whiskey Token, handing it over to the thirsty spirit, or take D6+2 Sanity Damage, ignoring Willpower, as the spectral outlaw lashes out in anger before fading back into the darkness.",
  },
  {
    id: "the_telling_crow",
    name: "The Telling Crow",
    tags: ["Encounter", "Active", "Animal", "Omen"],
    flavor: "A lone crow sits here, perched atop an old, wooden support post. In your mind, it's as though you can hear its voice. \"You shouldn't have come here! Beware the Dark Omen!\" It then takes to flight, disappearing into the shadows.",
    test: "Cunning 5+",
    effect: "If passed, gain 20 XP and you may look at the top three Darkness cards. Choose one to discard and put the others back on top, in any order. For every 1 rolled during the test, draw a Growing Dread card and add it to the stack.",
  },
  {
    id: "the_chain_of_mephistopheles",
    name: "The Chain of Mephistopheles",
    tags: ["Encounter", "Active", "Hell"],
    flavor: "At the far end of the chamber stands a tall set of iron doors with a thick chain, draping onto the floor and running along the ground to the center of the room. \"Don't pull the chain!\"",
    effect: "Select one Random Exit of this room to be the Iron Doors (place an End Cap there). Any Heroes may pull the chain (Heroes with 1+ Corruption Points must pull):\n\nStrength 6+: For every 6+ rolled, add a Sanity marker to the Iron Doors and draw a Loot card. For every 1 or 2 rolled, take 1 Corruption Hit. After all pulling Heroes have made the test, if Sanity markers equal or exceed 2× the number of Heroes, the doors open — place a Gate on that exit. If not, all pulling Heroes repeat until the doors open.",
  },
  {
    id: "pestilence_flies_2",
    name: "Pestilence Flies",
    tags: ["Encounter", "Active", "Plague", "Omen"],
    flavor: "The buzzing from up ahead is nearly deafening as you get closer. The air is thick with a mass of black flies swarming around a large carcass. You begin to cough and choke as the disease-ridden insects buzz all around you.",
    effect: "Heroes on this Map Tile may not use Grit. Every Hero takes D3 Corruption Hits.\n\nThen — Roll a D6. On 5 or 6, every Hero may draw a Loot card, pulled from the rotting carcass. On 1 or 2, what you thought was a carcass begins to move and stand. Ambush Attack — Draw a Low Threat card. These Enemies are Keyword Undead and are +1 Defense.",
    remainsInPlay: true,
  },
  {
    id: "no_escape",
    name: "No Escape",
    tags: ["Encounter", "Active", "Omen"],
    flavor: "Blood is spattered across the wall here and gruesome letters spell out the words, \"No Escape.\" A bleak omen and a curse upon all those that walk this path.",
    effect: "If the Heroes decide to Flee from this Adventure, it not only counts as Failing the Mission, but each Hero is also considered to be KO'd by Sanity Damage, rolling on the Madness Table.",
    remainsInPlay: true,
  },
  {
    id: "shades_of_terror",
    name: "Shades of Terror",
    tags: ["Encounter", "Active", "Ghost"],
    flavor: "Glowing bright spectres swirl around the room, beautiful as they glimmer with an enchanted glow. As you draw closer, they sweep down around you, becoming ghastly nightmares with rotting faces of death and despair!",
    test: "Spirit 5+",
    effect: "Grit may not be used on this test.\n\nIf successful, gain 20 XP and you may Recover a Grit. If failed, immediately take a number of Horror Hits equal to your current Sanity.",
  },
  {
    id: "the_horror_of_balbarra",
    name: "The Horror of Balbarra",
    tags: ["Encounter", "Environment", "Blood", "Death"],
    flavor: "The chamber is filled with the twisted bodies of the fleshless dead, intermingled with one another in a grotesque chain of depravity and blood.",
    test: "Spirit 5+",
    effect: "If successful, gain 20 XP as you calm your mind and pass through the horrors before you.\n\nIf failed, you are overcome with horrific visions! Immediately roll once on the Madness Table, using 3 dice and discarding the lowest roll to find the result.",
  },
  {
    id: "final_resting_place",
    name: "Final Resting Place",
    tags: ["Encounter", "Environment", "Ghost"],
    flavor: "A rough grave has been dug here with a simple wooden marker showing the name of a dead traveler.",
    effect: "Choose:\n\nDig up the Grave — Each Hero may join in the morbid search. If you do, take 1 Corruption Hit and roll 3 Dice. If doubles are rolled, draw a Gear. If triples are rolled, draw an Artifact. Otherwise, take an extra D6 Corruption Hits, cursed as a grave robber by the restless spirit of the dead!\n\nTake a moment of Silence for the Dead — All Heroes may Heal up to 2 Wounds/Sanity Damage (any mix).",
  },
  {
    id: "choking_ash",
    name: "Choking Ash",
    tags: ["Encounter", "Environment", "Death"],
    flavor: "The air is filled with a grey cloud of choking ash. Trudging through the ash at your feet, you knock around more solid objects buried in the dust. Reaching down, you discover a chipped bone and a charred Human skull. This isn't just ash...",
    effect: "Every Hero immediately takes D6 Horror Hits.\n\nAny Hero that ends their move on this Map Tile takes 1 Hit that does Damage equal to their Hero Level.",
    remainsInPlay: true,
  },
  {
    id: "fire_spirit",
    name: "Fire Spirit",
    tags: ["Encounter", "Active", "Stranger", "Demon"],
    flavor: "Dancing around the walls and ceiling of the room, a fiery imp sparks and sputters with red flame, only pausing long enough to whip its tail and laugh at you with a mocking tone.",
    test: "Agility 6+",
    effect: "If successful, gain 30 XP and you may look at the top 2 cards of any deck, choosing one to discard and the other to place back on top. For each 1 rolled during this test, you are seared by the Fire Spirit, gaining a Burning marker.",
  },
  {
    id: "cursed_gold",
    name: "Cursed Gold",
    tags: ["Encounter", "Active", "Loot", "Curse"],
    flavor: "In the center of the room sits a large, open steamer trunk...overflowing with gold coins and nuggets. At the foot of the trunk sits a blood-spattered note scrawled on a piece of paper: \"This Gold is cursed! Touch it at your own peril.\"",
    effect: "Any Hero may take up to $2,000 in cursed Gold from the trunk (in increments of $100 Gold).\n\nFor every $100 you took, roll a D6 (Grit may not be used). For every 1 rolled, add a Growing Dread card to the stack. If you add 4 or more Growing Dread cards, you also lose D6 Health/Sanity (any mix) permanently.",
  },
  {
    id: "biting_mites",
    name: "Biting Mites",
    tags: ["Encounter", "Active", "Plague", "Omen"],
    flavor: "It starts as a simple itch on your neck. Scratching, scratching...then a sharp pain on your leg, then your hand. You shake yourself violently to try and get rid of the tiny mites that swarm across your skin!",
    effect: "Strength 5+: For every 5+ rolled, gain 10 XP. For every roll less than 5+, take 3 Wounds, ignoring Defense.\n\nThen — Luck 6+: If passed, draw 2 Loot cards as you uncover the body of a fallen traveler that was drained dry by the mites.",
  },
  {
    id: "blood_soaked_sand",
    name: "Blood-Soaked Sand",
    tags: ["Encounter", "Environment", "Outlaw", "Death"],
    flavor: "Five skeletons lay in this room, face down; covered in tattered clothing and resting on a patch of dark, blood-soaked sand. Their hands seem to be bound...looks like an execution.",
    effect: "Each Hero must Choose:\n\nSearch the Bodies — Make a Scavenge test. For every successful result, draw 2 Scavenge cards.\n\nTake a Moment of Silence — Spirit 6+: For every 6+ rolled, you may Heal D6 Health/Sanity (any mix).\n\nIgnore it and move on — You may move D6 spaces out of the normal turn sequence (no Exploration during this move).",
  },
  {
    id: "sign_of_the_dark_omen",
    name: "Sign of the Dark Omen",
    tags: ["Encounter", "Active", "Omen"],
    flavor: "An icy wind blows through the chamber, flickering the candles set out on makeshift altars along the walls. Black feathers and skulls adorned with beads and painted markings are piled around the room. Dark tidings of things to come.",
    test: "Spirit 5+",
    effect: "If passed, gain 25 XP and you may use 1 Grit to cancel a Growing Dread card from the top of the stack (or as it is played, this turn). If failed, add a Growing Dread card to the top of the stack.",
  },
  {
    id: "sign_of_the_dark_omen_2",
    name: "Sign of the Dark Omen",
    tags: ["Encounter", "Active", "Omen"],
    flavor: "An icy wind blows through the chamber, flickering the candles set out on makeshift altars along the walls. Black feathers and skulls adorned with beads and painted markings are piled around the room. Dark tidings of things to come.",
    test: "Spirit 5+",
    effect: "If passed, gain 25 XP and you may use 1 Grit to cancel a Growing Dread card from the top of the stack (or as it is played, this turn). If failed, add a Growing Dread card to the top of the stack.",
  },
  {
    id: "hell_hath_no_fury",
    name: "Hell Hath No Fury",
    tags: ["Encounter", "Active", "Stranger"],
    flavor: "A young woman kneels on the floor here, softly sobbing into her blood-stained hands.",
    test: "Spirit 6+",
    effect: "If successful, you comfort the girl and she reveals she is the last survivor of her farmstead, burned to the ground by foul demons. Gain 25 XP and take this card — she is now in your care. The next time you begin a Town Stay, discard this card to gain D3 Sanity. If KO'd before then, this card is discarded and you must lose 1 Sanity permanently as she is carried off by the demons.\n\nIf failed, it's a trick! Ambush Attack! — 1 Hellfire Witch that starts targeting the Hero that made this test.",
  },
  {
    id: "mangled_remains",
    name: "Mangled Remains",
    tags: ["Encounter", "Environment", "Blood", "Mission"],
    flavor: "A broken and twisted mess that looks like it may once have been human rests here. The sight is not pretty...the smell is worse.",
    effect: "If there is someone you were looking for as part of your Mission, this is all that remains of them — they are considered dead. Each Hero gains 25 XP. The Posse may either turn back with this knowledge (the Mission counts as successful), or continue on for some good old fashioned revenge.\n\nOtherwise — Each Hero may take a Spirit 6+ Test. If passed, Recover 1 Grit. If failed, take D6 Horror Hits.",
  },
  {
    id: "trade_route_shelter",
    name: "Trade Route Shelter",
    tags: ["Encounter", "Active", "Journal"],
    flavor: "It looks as though this area has been used as shelter from the harsh elements outside. There are remnants of supplies and a dusty journal of travel through the unforgiving desert.",
    test: "Lore 6+",
    effect: "If passed, gain 50 XP and you may move the Darkness Marker up to D3 spaces back on the Depth Track (this does not trigger special spaces). If failed, the insane ramblings scrawled into the journal infect your mind and you are transfixed by the words! Take D6 Horror Hits and immediately pass a Spirit 4+ test or roll once on the Madness Table.",
  },
  {
    id: "spectres_out_of_time",
    name: "Spectres out of Time",
    tags: ["Encounter", "Active", "Time", "Ghost"],
    flavor: "Ghostly apparitions of Mexican soldiers clash in violent battle with rough-dressed men defending a fortified wall! Explosions shower the room with spectral debris and you see legendary figures of the frontier fighting for their lives! The battle at the Alamo is playing out before your eyes!",
    test: "Lore 6+",
    effect: "For every 6+ rolled, gain 25 XP and you may Recover 1 Grit. If no Heroes passed this test, the ghostly soldiers charging in the vision manifest into real Lost Army soldiers and... Attack — 1 Lost Army with a Lost Army Trait. (or, 2 Lost Army if 5 or 6 Heroes).",
  },
  {
    id: "damned_if_you_do",
    name: "Damned if You Do",
    tags: ["Encounter", "Active", "Ghost", "Judgment"],
    flavor: "A dark spectre stands watch in the shadows before you. As you approach, it extends one ghostly arm out to block the path with an icy chill. In your mind, a soulless whisper demands payment for your dark past.",
    effect: "Each Hero must Choose:\n\nOffer Payment — Discard $100 plus an extra $50 for each Corruption Point and Mutation you currently have.\n\nStand by Your Choices — Roll a D6 for each Corruption Point and Mutation you currently have. On 1 or 2, you immediately gain another Corruption Point/Mutation (whichever you were rolling for), ignoring Willpower. Grit may not be used on these rolls.",
  },
  {
    id: "shot_in_the_back",
    name: "Shot in the Back",
    tags: ["Encounter", "Environment", "Ghost"],
    flavor: "Shot in the back and left for dead, a fallen Law Man has scratched something into the wall. You lean in close to try and decipher the crude writing. Perhaps it's a warning of things to come!",
    test: "Lore 6+",
    effect: "If passed, gain 50 XP, and during the first Turn of the next Fight this Adventure, every Hero gains +2 Shots/Combat (Hero's Choice) for that Activation. If failed, you are haunted by the spectre of the betrayed Law Man! Roll a D6:\n1 -1 Max Grit\n2 -3 Health\n3-4 -3 Sanity\n5 -1 Luck\n6 +1 Max Grit",
  },
  {
    id: "come_and_take_it",
    name: "Come and Take It",
    tags: ["Encounter", "Active", "Relic"],
    flavor: "Something under your foot slides a little as you step down on the ground here. Buried just below the surface is a ratty looking old flag depicting a star and cannon that says, simply, \"Come and Take It\".",
    test: "Lore 5+",
    effect: "If successful, you are inspired by the spirit of defiance. Take this card. The next time you would be forced to discard any Item or Token (except if discarded by use), you may discard this card instead.",
  },
];
