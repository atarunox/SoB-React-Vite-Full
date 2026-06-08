// Swamp Terrain Encounters — D20 table
// Source: HexCrawl Encounters Book v1.0, pp. 52–53
// Swamp terrain includes any obvious swamp hexes or hexes found on Jargono.

export const swampEncounters = [
  {
    roll: 1,
    name: "Ghost Lights",
    tags: ["Active", "Ghost"],
    flavor: "Off in the distance you spy a group of floating lights. Many a man has lost his life to the deceptive guidance of these dancing lights.",
    effect: "Until you leave this swamp, all of your Overland Movement is random (roll on the Random Hex Diagram each time you move while on any Swamp hexes) until you leave this swamp area.",
  },
  {
    roll: 2,
    name: "Black Wings",
    tags: ["Active", "Creature"],
    flavor: "A swarm of BogBats native to Jargono suddenly catches sight of the Posse and swoops down on your position!",
    effect: "Each Hero must roll a D6 for every Dark Stone they are carrying (including Items with a Dark Stone Icon and Items with Dark Stone Upgrades on them). On a roll of 1 or 2, that Item is snatched away from them by a BogBat (discarded).",
  },
  {
    roll: 3,
    name: "Biting Flies",
    tags: ["Active", "Swarm"],
    flavor: "Raised welts cover every inch of your exposed skin. The bites from these dang flies burn and make your skin feel aflame. You can barely concentrate from the itching.",
    effect: "In the next Overland battle that the Heroes have in the swamps, they are -1 to one of their highest Defense rolls each turn.",
  },
  {
    roll: 4,
    name: "Deluge of the Necrotoads",
    tags: ["Active", "Creature"],
    flavor: "A mysterious rain of flesh-eating amphibians that live for a few minutes as they try to devour any living thing they come in contact with.",
    effect: "Any Heroes that do NOT have any Hat or Coat Gear take D6 Wounds, ignoring Defense, as the rain of slimy Necrotoads falls all about them and then dies. Movement out of this hex will cost 1 extra Move point as the squishy things will make the going a bit rougher for a few miles until the Posse can get clear of the darn things.",
  },
  {
    roll: 5,
    name: "Sorrow",
    tags: ["Active", "Stranger"],
    flavor: "You come across a small community of Mutants living in this swampland. They've retreated from the communities of 'normal' men out of fear of persecution and look at you with guarded eyes.",
    test: {
      options: [
        { stat: "Spirit", target: "6+" },
        { stat: "Cunning", target: "6+" }
      ],
      success: ["If any Heroes are successful the group may stop and rest for a day with the Mutant enclave. Each Hero may roll a D6 to see if a single Injury is healed by a Mutant Healer with miraculous powers: On a 1 or 2, the Injury becomes permanent instead. On a 3 or 4, the Injury is not healed and the Hero gains a random Mutation. On a 5 or 6, the Injury is Healed."],
      fail: ["Otherwise, no effect. Each Hero moves on."]
    },
  },
  {
    roll: 6,
    name: "Poison Arrows",
    tags: ["Active", "Poison"],
    flavor: "In the middle of your search through these humid, disgusting swamps, arrows are unleashed by invisible assailants! The tiny arrows seem to be tipped with some foul dark brown substance; poison!",
    test: { stat: "Agility", target: "5+",
      success: ["Gain 20 XP and you are unharmed."],
      fail: ["You have become Poisoned! Gain D6 Poison markers. For each of these Poison markers that you have, roll a D6 at the start of each day. On a 1, 2, or 3, take 2 Wounds, ignoring Defense. On a 6, you may discard a Poison marker."]
    },
  },
  {
    roll: 7,
    name: "The Witch's Hovel",
    tags: ["Stranger"],
    flavor: "An old hag of a woman, white haired, wrinkled face, and a mean look in her eye, stands hunched over in the middle of the swamp. She stares intently at the group as they travel through the swamp, her look seeming to curse the very ground you walk upon.",
    test: { stat: "Cunning", target: "5+",
      success: ["Gain 5 XP for each 5+ rolled as you're able to engage the old hag in a battle of wits and confound her with riddles."],
      fail: ["Any Hero that fails the test takes D6 Horror Hits. Then... Spirit 5+: If failed, the Witch has cursed you. Roll once on the Madness Chart."]
    },
  },
  {
    roll: 8,
    name: "Sinking Temple",
    tags: ["Environment", "Mission"],
    flavor: "The brambles open upon a stone pathway of half-sunken stones. A most welcome relief for the Posse from the constant sucking of the swamp. Whatever stone structure the party walks upon is enormous. The mossy staircase takes them above the canopy exposing a vista that covers many miles.",
    effect: "The Posse may immediately begin a Temple of Dread Mission [Jargono:6]. The difficulty of this Mission is one level higher than the Posse level, but the reward for this Mission is D6 x$100 instead in addition to rolling D6 on the Reward Chart. Failure to complete this Mission also results in the Posse drawing D3 Growing Dread cards that will be applied at the beginning of the next Mission! Otherwise, if the Posse doesn't enter, nothing eventful happens.",
  },
  {
    roll: 9,
    name: "The Smithie",
    tags: ["Active", "Merchant"],
    flavor: "On a small island in the middle of the swamp sits a hut. You see sparks flying around on the far side of the hut. As you walk around the outside of the dwelling, you catch sight of a giant of man wearing a leather apron. He pounds tirelessly away at an anvil, each blow exploding in a blast of red hot sparks.",
    effect: "You may buy Purchase Items from here as if you were at a Blacksmith (do not roll for Location Events).",
  },
  {
    roll: 10,
    name: "Black Spears",
    tags: ["Environment"],
    flavor: "Off on the horizon is a dark, almost purple, storm cloud. Lightning strikes the ground a few miles away, but otherwise, it's just another day in the swamp.",
    effect: "Nothing eventful happens.",
  },
  {
    roll: 11,
    name: "Hunting Jaguar",
    tags: ["Active", "Creature"],
    flavor: "Every now and then you catch sight of a pair of glowing jade eyes on the prowl. They remain off in the shadows and disappear anytime you try to investigate, but always they appear again... waiting... hunting.",
    test: { stat: "Cunning", target: "4+",
      success: ["Each Hero that is successful gains 15 XP, you have outsmarted the Jaguar."],
      fail: ["Each Hero that is unsuccessful takes either D8 Wounds with no Defense, or rolls once on the Injury Chart (must choose before rolling for Damage)."]
    },
  },
  {
    roll: 12,
    name: "A Knot of Toads",
    tags: ["Active", "Swarm", "Poison"],
    flavor: "A knot of giant toads sits before you, just as ugly when they're big as they would be small and normal. The heads on these toads though, appear to be misshapen, almost human-like in their appearance. Before you can react, they begin to swarm around you!",
    test: {
      options: [
        { stat: "Agility", target: "6+" },
        { stat: "Luck", target: "5+" }
      ],
      success: ["Gain 15 XP and you are unharmed."],
      fail: ["You have become Poisoned! Gain D8 Poison markers. For each of these Poison markers that you have, roll a D6 at the start of each day. On a 1, 2, or 3, take 1 Wound, ignoring Defense. On a 6, you may discard a Poison marker."]
    },
  },
  {
    roll: 13,
    name: "A Supposed Voodoo Meeting",
    tags: ["Active", "Cult"],
    flavor: "As you make your way slowly through the muck and the mire, you see ahead of you a fountain of flame rising from a small island in the swamp. About it dances a group of what appear to be children at first, but upon closer inspection seem to be small, dwarven humanoids.",
    test: { stat: "Spirit", target: "5+",
      success: ["Each Hero that is successful gains 25 XP."],
      fail: ["For each Hero that fails this test, they instead add a Growing Dread card to the stack. This stack will apply to the next Mission the Posse begins."]
    },
  },
  {
    roll: 14,
    name: "Hallucinogenic Spores",
    tags: ["Environment", "Poison"],
    flavor: "Puffs of little clouds are released from the tops of iridescent mushrooms. Their pungency clogs the lungs, and clots the mind with hallucinations.",
    effect: "For the rest of the time the Posse is in this Swamp, any Fights that the Posse gets into are automatically treated as Ambushes.",
  },
  {
    roll: 15,
    name: "Blasphemy!",
    tags: ["Cult", "Madness"],
    flavor: "You seem to have caught a group of cultists in the middle of a blasphemous ritual, the carcasses of small animals littered about and cult members in various states of undress. However, the sight upon the crude altar they have erected in the center of their gathering is downright sickening.",
    effect: "Each Hero takes 2 Horror Hits. Instead of taking Sanity Damage however, gain a Madness for each Horror Hit that you fail your Willpower roll against.",
  },
  {
    roll: 16,
    name: "Lord of the Toads",
    tags: ["Active", "Creature"],
    flavor: "An enormous toad the size of an ox leaps in front of the Posse. It blinks an eye. It blinks another eye. The Great Toad lulls the mind to sleep, as its great gullet opens wide.",
    effect: "The Heroes with the weakest Willpower rating (highest #+) all take D6 Horror Hits. Those Heroes that lose at least 3 Sanity as a result become thralls of the Great Toad and suffer an additional D3 Corruption Points with no Willpower save before they're eventually able to recover their senses and get away.",
  },
  {
    roll: 17,
    name: "Serpent Swarm",
    tags: ["Active", "Swarm"],
    flavor: "A great writhing mass of entangled serpents erupts beneath the Heroes as they walk through the swamp.",
    effect: "Each Hero takes D6 Hits. For each Wound suffered as a result, a Hero gains 1 Poison marker. For each of these Poison markers that you have, roll a D6 at the start of each day. On a 1, 2, or 3, take 1 Wound, ignoring Defense. On a 6, you may discard a Poison marker.",
  },
  {
    roll: 18,
    name: "Dreamer of Fates",
    tags: ["Stranger", "Fortune"],
    flavor: "On a particularly large island in the middle of this swampland, you spy a straw-thatched hut. About the hut lie many skulls and cracked bones, the sound of strange, rhythmic music permeates the air. A lone figure in front of the dwelling sits cross-legged, seemingly in a trance. His face is painted bone-white, as if to resemble a smiling skull.",
    effect: "The Dreamer of Fates asks if you would know your future. If so, each Hero that would know rolls a D8 on the following table:",
    table: [
      { roll: "1", text: "Death — The next Wound or Sanity damage you suffer will cause you to be KO'd, no matter how much Health or Sanity you have." },
      { roll: "2", text: "The Devil — The next point of Corruption you take will cause you to gain a Mutation, no matter how much Corruption you actually have." },
      { roll: "3", text: "The Tower — Until the end of your next Adventure, you cannot get Critical Hits, no matter what you roll." },
      { roll: "4", text: "The Fool — Until the end of your next Adventure, gain -5 XP anytime you would gain XP." },
      { roll: "5", text: "The World — After today, the next day of overland movement occurs without incident, do not roll for any Wilderness Encounters (still roll for Terrain Encounters when necessary)." },
      { roll: "6", text: "Justice — Until the end of the next Adventure, for every Wound that you take, the source of that Wound takes a Hit (roll a D6 for Damage)." },
      { roll: "7", text: "The Sun — Until the end of your next Adventure, gain +5 XP anytime you would gain XP." },
      { roll: "8", text: "Strength — Until the end of your next Adventure, do +1 Damage for all attacks." },
    ],
  },
  {
    roll: 19,
    name: "Gurglin'",
    tags: ["Environment"],
    flavor: "The floating marshlands deceive hoof and foot alike. The rot and muck of the quagmire hungers for sustenance. One wrong step and whatever you're on is sure to sink into a dark pit without any hope of getting out.",
    test: { stat: "Agility", target: "3+",
      fail: ["If failed, any Heroes traveling on a Horse or Cart loses their Horse or Cart Transport item and are now walking on Foot."]
    },
  },
  {
    roll: 20,
    name: "Local Story",
    tags: ["Active", "Explore"],
    flavor: "A disheveled and dirty looking fellow walks through the swamp towards you, unmindful of the mud he's walking through. He wipes his hand on the one corner of clean fabric he still has on and shakes your hand. He takes a swig of some liquid and tells you a crazy story about something he saw just a while back.",
    effect: "Select an adjacent hex and flip over an Exploration Token. If you Search that specific hex on this day, draw the face-up Exploration Token. Otherwise draw from the next face-down Exploration Token for any other hexes that you Search this day. Reshuffle all the Exploration Tokens at the end of the day.",
  },
];
