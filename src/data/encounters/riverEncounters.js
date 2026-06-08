// River Terrain Encounters — D20 table
// Source: HexCrawl Encounters Book v1.0, pp. 48–49
// Rivers are any hexes that include flowing water or any lakes, streams, or any other bodies of water.

export const riverEncounters = [
  {
    roll: 1,
    name: "Raging River Rescue",
    tags: ["Hazard", "Water"],
    flavor: "As you ride beside the river, you see someone clinging for dear life onto a branch as they go speeding past the Posse downstream. You only have seconds to act!",
    test: {
      options: [
        { stat: "Agility", target: "4+" },
        { stat: "Strength", target: "5+" }
      ],
      success: ["The poor stranger is pulled up from the river and thanks you profusely. Whomever successfully pulls the stranger up gains D6x$25 and recovers 1 Grit."],
      fail: ["If no one rescues the stranger, then each Hero takes D3 Corruption Hits. If a Hero fails and is in the process, they get caught up in the river themselves and will need to be rescued by another Hero who will need to make the same roll (same condition applies to all Heroes who attempt this). Heroes may either attempt to rescue the stranger or another Hero, but not both. Those that aren't rescued will be carried away by the current for a few miles before you're able to clamber to safety. Any who are not rescued take D6 Hits, lose D3 Random Side Bag Tokens, and roll a D6. On a 1, a Random Gear or Artifact must also be discarded."]
    },
  },
  {
    roll: 2,
    name: "River Passage",
    tags: ["Environment", "Transport"],
    flavor: "A small ferry travels the river up and downstream. If you want to, you can call to the owner of the boat to book passage.",
    effect: "For $15 a passenger (Hero or their mounts), you may travel to any hex along this river. Travel takes 1 day no matter the distance and you do not roll for Wilderness Encounters.",
  },
  {
    roll: 3,
    name: "The River Serpent Lurks",
    tags: ["Active", "Creature"],
    flavor: "Something is moving beneath the water, every so often you catch sight of a scaled form just breaking the surface. There's a palpable sense of dread in the Posse when you think about what might happen if you were to try to cross that river.",
    effect: "If the Posse crosses this river at any point during this day or the next, you will be attacked by a savage river monster, its hunger for flesh and Dark Stone brought alive by your passing! Each Hero will take Hits and rolls a D6. On a 1, that Hero has lost their Horse or Cart Transport. Otherwise, if the Posse does not cross the river, nothing happens.",
  },
  {
    roll: 4,
    name: "Down to the River to Pray",
    tags: ["Active", "Holy"],
    flavor: "A group of singing church-goers is on their way to the river for some baptisms. They invite your Posse to walk with them to the river and join in their fellowship.",
    effect: "Each Hero may have a 'Conversion' performed on them for free. This is the exact same as the Service of the same name that can be purchased at a Church Town Location.",
  },
  {
    roll: 5,
    name: "Row Row Row your Boat",
    tags: ["Water", "Transport"],
    flavor: "The Posse comes across an old boat run aground. The boat still seems to be in good shape, you could take it for a quick jaunt down the river if you wanted to.",
    effect: "The Posse may travel in this boat to any hex along the river for a cost of 1 Move point. After that, the boat springs a leak and is no longer able to be used.",
  },
  {
    roll: 6,
    name: "Gold Panning",
    tags: ["Active", "Stranger"],
    flavor: "As you search along the banks of this river, you come across a grizzled, old Prospector, panning for gold. Just as you pass by he jumps up in exclamation, he's struck it rich! He dances about wildly, but then slows when he notices your Posse draw near. The Prospector has suddenly grown suspicious of your Posse.",
    test: { stat: "Cunning", target: "5+",
      success: ["The Prospector gives the Posse D6x$50 to buy your silence about the location of the gold deposit."],
      fail: ["The Prospector whips out his pickaxe and chases you varmints away for trespassin' on his property! Each Hero takes D3 Hits and the Posse is pushed out of this hex into a random adjacent hex (use the random hex diagram), this does not count against Movement for the day."]
    },
  },
  {
    roll: 7,
    name: "Ruins of the Old World",
    tags: ["Environment", "Ancient"],
    flavor: "The bridge crossing this part of the river is an elaborate stone affair, with some complex artistic reliefs carved into the arched sides and supports.",
    test: { stat: "Lore", target: "5+",
      success: ["For each 5+ that a Hero rolls, they gain 20 XP. If the Posse collectively rolls more successes than there are Heroes in the group, they discover a puzzle woven into the artistic reliefs on the bridge."],
      followUp: { stat: "Cunning", target: "4+", then: "Agility", thenTarget: "4+",
        effect: "The first Hero to complete both tests draws a Loot card. To determine who may take the tests first, roll a D6 and add it to their Initiative, highest number goes first. Each Hero may only attempt these tests once."
      }
    },
  },
  {
    roll: 8,
    name: "Lost in the Fog",
    tags: ["Environment", "Lost"],
    flavor: "A thick fog has enveloped the area, obscuring your vision. You can barely see five feet in front of you and you end up getting lost.",
    effect: "Roll D3. The Posse moves that many hexes in random directions. For each hex moved, roll a D6 and consult the Random Hex Diagram for which direction to move. Ignore Terrain movement costs when moving the Posse in this way.",
  },
  {
    roll: 9,
    name: "Nightmare Ram",
    tags: ["Active", "Creature"],
    flavor: "Before you stands a weird half-goat, half-man beast, a Nightmare Ram! The beast carries a lantern and stares intently at you with cruel eyes as it guards what looks to be a riverside garden of some sort.",
    effect: "The weird beast charges at the party, out of fear or malice you cannot say. Each Hero in the party takes Hits and the thing wades out into the river and escapes. If nobody in the party takes any Wounds from the assault, the Nightmare Ram also drops his antique Lantern, carved of bone! This Lantern can be used to make separate Hold Back the Darkness rolls (make two sets of rolls, only move the Darkness marker if both rolls fail). This Lantern will last until the end of your next Mission, at which point it crumbles apart.",
  },
  {
    roll: 10,
    name: "Deputies & Desperados",
    tags: ["Active", "Stranger"],
    flavor: "A group of lawmen and some outlaws have gotten themselves into a shootout, the outlaws seem to have the upper-hand as the lawmen are pinned down and can't retreat with the river at their backs.",
    effect: "You may choose to help either the Outlaws or the Lawmen. If you assist the Lawmen, the Outlaws are killed and each Hero in the Posse gains 50 XP. If you assist the Outlaws, the Lawmen are killed and each Hero in the Posse gains D3x$50. If there are any Heroes with the keyword 'Law' in the Posse, you must help the Lawmen.",
  },
  {
    roll: 11,
    name: "The Ferryman",
    tags: ["Active", "Strange", "Stranger"],
    flavor: "You see a figure clad in a dark cloak atop a ferry, their face obscured from view. The figure stretches out a bony hand, and in a gravelly voice the figure makes the Heroes an offer to forestall their own demise.",
    effect: "Any Heroes may pay the Ferryman with 1 Dark Stone to gain 1 personal Revive Token. This Revive Token may only be used by the Hero that paid the toll and may not be transferred to any other Heroes. Each Hero may only buy one Revive Token.",
  },
  {
    roll: 12,
    name: "Men of Stone and Sorrow",
    tags: ["Active", "Disease"],
    flavor: "You stop by the river to get yourself a drink, as you bend down and cup your hands for some water, you see something strange. At first it appears to be a statue beneath the water, but it begins to swim towards you at a rapid pace. A stone figure reaches through the water at you and is trying to pull you under!",
    test: { stat: "Agility", target: "4+",
      success: ["If the Hero successfully dodges the attack, they gain 25 XP."],
      fail: ["If failed, this Hero is dragged into the water and becomes infected with 'Greyscale', an illness that slowly turns a Hero to living stone! Each week (7 days) after becoming infected, you get -1 to Initiative, +1 to your Defense rolls, and roll once on the Madness Chart. After 4 full weeks, the Hero will die and their body permanently changes into a statue. The only cure for Greyscale is to be bitten by a Void Enemy. After receiving 1 Wound from a Void Enemy, the effects of the disease are removed at the end of the Mission (or next Mission if not currently on one)."]
    },
  },
  {
    roll: 13,
    name: "Flash Flood!",
    tags: ["Active", "Water"],
    flavor: "Dangerous flash flooding upriver has surprised your group. The rush for high ground is on and it's everyone for themselves!",
    test: { stat: "Agility", target: "4+",
      fail: ["Any Heroes that fail lose a Random Gear item from their inventory. Each Hero may make a Combat roll (deals no damage) to swap one of their die results with another Hero's (each Hero may swap once)."]
    },
  },
  {
    roll: 14,
    name: "Deep Hatreds",
    tags: ["Active", "Jargono", "Creature"],
    flavor: "A tribe of Serpent men have taken up residence on this part of the river. Though their features appear misshapen and horrible to behold, they're not immediately attacking you. They seem to have the same level of disgust and trepidation towards you as you do of them.",
    effect: "Each Hero takes D3 Horror Hits. If anybody takes any Sanity damage from their initial scare, a fight breaks out and each Hero takes D6 Hits. If nobody in the Posse takes any Sanity damage from this, they see past the serpent mens' frightening exterior and begin a dialogue with them. Heroes may buy Purchase Items from these Serpent men as if they were at a Jargono Swamp Village (see Klutz's Jargono Swamp Village on BoardGameGeek.com for more info).",
  },
  {
    roll: 15,
    name: "High Waters",
    tags: ["Environment", "Hazard", "Water"],
    flavor: "Heavy rains have raised the waters higher than normal and the entire area has become flooded. Crossing the river will be impossible.",
    effect: "The Posse immediately moves 1 hex away from any River terrain (does not cost movement). For the rest of the day, you are unable to move onto any hexes with River terrain.",
  },
  {
    roll: 16,
    name: "Floating Body",
    tags: ["Environment", "Death"],
    flavor: "A corpse, bloated and rotting floats along the river. The body appears to be quite old and from where you are there's no way to tell the cause of death.",
    effect: "If the Posse decides to pull the body ashore, roll a D6:",
    table: [
      { roll: "1-2", text: "Hungry Dead — As you pull the body up, it comes alive and begins to attack the Posse. A Random Hero takes D6 Wounds before you're able to kill the foul thing." },
      { roll: "3-5", text: "A few coins — You rifle through the corpse's pockets and a random Hero finds D3x$10. Take D3 Corruption Hits for looting the dead." },
      { roll: "6", text: "Something — Whether the fellah died for it or not, you can't tell, but a Random Hero finds something. Draw a Loot card. They also take D3 Corruption Hits for looting a corpse." },
    ],
  },
  {
    roll: 17,
    name: "Crossing Troops",
    tags: ["Environment", "Movement"],
    flavor: "An army of soldiers have erected a series of temporary bridges in this area to bring horses and equipment across the river.",
    effect: "For the next day, the Posse may cross this river as if it were Easy terrain. After today, the temporary bridges will be taken down and travel across the river will be treated as Tough terrain as normal.",
  },
  {
    roll: 18,
    name: "Ragged Story Teller",
    tags: ["Active", "Stranger"],
    flavor: "Sitting beside the river, an elderly woman dressed in patched gypsy clothing is washing some clothing, singing a song in a language you can only guess is European. Nearby you see an immaculately painted vardo and a horse grazing. The woman beckons you over and without introducing herself begins a story.",
    effect: "The woman weaves a tale of death & destruction, of tragic heroes & loves lost, of monsters slain and wrongs righted. When she has finished her story, she turns to a Random Hero and says that the tale she has just told, was their own future. That Hero gains a personal Revive Token. That Token may be used by them and not transferred to any other Heroes.",
  },
  {
    roll: 19,
    name: "Strange Ice",
    tags: ["Environment"],
    flavor: "Inexplicably, the surface of the river here has frozen over, though the temperature certainly doesn't warrant that behavior.",
    effect: "For the next day, the Posse may cross any river hexes as if they were Easy terrain, however, roll a D6 anytime you cross over the river. On a 1, the ice breaks and each Hero suffers D6 Hits from falling into the river. Roll an additional D6, on a 1, Heroes' Horse is lost.",
  },
  {
    roll: 20,
    name: "Local Gossip",
    tags: ["Active", "Explore"],
    flavor: "A local woman is collecting some water from the river. She stops to talk to you for a bit and reveals some interesting details about the area.",
    effect: "Select an adjacent hex and flip over an Exploration Token. If you Search that specific hex on this day, draw the face-up Exploration Token. Otherwise draw from the next face-down Exploration Token for any other hexes that you Search this day. Reshuffle all the Exploration Tokens at the end of the day.",
  },
];
