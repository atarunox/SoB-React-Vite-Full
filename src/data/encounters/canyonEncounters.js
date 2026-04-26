export const canyonEncounters = [
  {
    id: "heavy_rain",
    name: "Heavy Rain",
    tags: ["Environment", "Weather"],
    flavor: "A heavy rain begins to pour down all around you, soaking your clothes and pummeling the cracked earth with large drops. Lightning flashes across the sky and half a second later, booming thunder rolls through the heavens.",
    effects: [
      "All models in The Canyons are -1 Move (min. 1) and have their Ranged Attacks reduced to a max of Range 4",
      "Whenever a Depth Event is rolled while Holding Back the Darkness, roll a D6. On the roll of 5+, discard this card"
    ],
    remainsInPlay: true,
  },
  {
    id: "heavy_rain",
    name: "Heavy Rain",
    tags: ["Environment", "Weather"],
    flavor: "A heavy rain begins to pour down all around you, soaking your clothes and pummeling the cracked earth with large drops. Lightning flashes across the sky and half a second later, booming thunder rolls through the heavens.",
    effects: [
      "All models in The Canyons are -1 Move (min. 1) and have their Ranged Attacks reduced to a max of Range 4",
      "Whenever a Depth Event is rolled while Holding Back the Darkness, roll a D6. On the roll of 5+, discard this card"
    ],
    remainsInPlay: true,
  },
  {
    id: "circling_above",
    name: "Circling Above",
    tags: ["Environment", "Omen"],
    flavor: "Black vultures circle above you, high in the sky. They are most likely waiting for you too to meet an untimely demise in this unforgiving valley of death. A grim omen to be sure.",
    test: {
      stat: "Spirit",
      target: "6+",
      success: ["Each Hero may Recover a Grit"],
      fail: ["Move the Darkness 1 space forward on the Depth Track"],
    },
  },
  {
    id: "circling_above",
    name: "Circling Above",
    tags: ["Environment", "Omen"],
    flavor: "Black vultures circle above you, high in the sky. They are most likely waiting for you too to meet an untimely demise in this unforgiving valley of death. A grim omen to be sure.",
    test: {
      stat: "Spirit",
      target: "6+",
      success: ["Each Hero may Recover a Grit"],
      fail: ["Move the Darkness 1 space forward on the Depth Track"],
    },
  },
  {
    id: "outlaw_trail",
    name: "Outlaw Trail",
    tags: ["Environment", "Outlaw"],
    flavor: "You seem to have stumbled onto a trail used by outlaws for their nefarious schemes.",
    effects: [
      "All Outlaw or Undead Enemies are +1 Combat/+1 Shot",
      "All Nothing Here Scavenge cards let the Hero draw a Loot card on the D6 roll of 3+",
      "All Hideous Discovery Scavenge cards also trigger an outlaw trap, setting off a Dynamite centered on the Scavenging Hero’s space",
      "Discard this card when the next Clue Icon is revealed"
    ],
    remainsInPlay: true,
  },
  {
    id: "the_last_man",
    name: "The Last Man",
    tags: ["Active", "Stranger", "Death"],
    flavor: "The area is littered with the bodies of dead cavalry soldiers, and it looks like they have been looted by their killers! Hearing a muffled cough, you find one last soldier clinging to life behind a rock. Based on his wounds...he’s not going to make it.",
    choices: [
      {
        label: "Comfort a Dying Man",
        effects: ["Take D6 Horror Hits. Then you may Recover a Grit or remove a Corruption Point"],
      },
      {
        label: "Search Him for Valuables",
        effects: ["Take D6 Corruption Hits. If the roll is 3 or higher, also draw an Artifact"],
      },
    ],
  },
  {
    id: "red_rock_shootout",
    name: "Red Rock Shootout",
    tags: ["Active", "Hazard"],
    flavor: "Turning the bend, you find yourselves walking right into a pitched firefight between a unit of 12th Cavalry soldiers and a group of mutant Scafford Gang hiding up in the hills! As bullets whiz past your head, you scramble for cover!",
    test: {
      stat: "Luck",
      target: "5+",
      success: [
        "Gain 20 XP as you pick your way from cover to cover, making your way through the valley while avoiding stray bullets",
        "If at least one 6+ was rolled, you may draw a Gear card, pulled from the field of battle"
      ],
      fail: ["For each 1 or 2 rolled on the test, take 1 Ranged Attack Hit that does D6 Damage"],
    },
  },
  {
    id: "man_eater_cactus",
    name: "Man-Eater Cactus",
    tags: ["Active", "Plant"],
    flavor: "Long vines and thorned tendrils extend across the canyon floor and walls here, all emanating from a massive, brightly colored cactus at the center of the valley. Flowers bloom on its surface and vines, but as you step closer, the blades of the cactus core begin to quiver and you swear that the vines around your feet just moved! extend across the canyon floor and walls like an unmoving force of nature, though globs of acidic ooze cling to the vines as they snake along the canyon wall.",
    test: {
      stat: "Escape",
      target: "3+",
      success: ["You may keep moving"],
      fail: ["Your move ends and you immediately take D6 Hits as the Man-Eater Cactus tears at you, attempting to drag you into its spined maw!"],
    },
    effects: [
      "Any time a Hero enters a space of this Map Tile, they must make the Escape test"
    ],
    remainsInPlay: true,
  },
  {
    id: "watchers_on_the_ridge",
    name: "Watchers on the Ridge",
    tags: ["Active"],
    flavor: "In the distance, black silhouettes line the ridge, looking down into the valley. As you strain to see, it’s clear they are watching you!",
    test: {
      stat: "Cunning",
      target: "4+",
      success: [
        "Gain 15 XP as you recognize the silhouettes on the ridgeline",
        "If the highest roll was a 4 or 5, reveal the top card of the Threat Deck your Hero Party is currently drawing from, then put it back. If that Threat card is later drawn for an Attack, it is automatically an Ambush",
        "If a 6+ was rolled, instead a war party of Indian Braves watches your posse. Take this card. Once during this Adventure, you may discard this Encounter to choose a Map Tile. Each Enemy on that Map Tile takes D6+2 Wounds, ignoring Defense, as they are riddled with Arrows from above"
      ],
      fail: [],
    },
  },
  {
    id: "watchers_on_the_ridge",
    name: "Watchers on the Ridge",
    tags: ["Active"],
    flavor: "In the distance, black silhouettes line the ridge, looking down into the valley. As you strain to see, it’s clear they are watching you!",
    test: {
      stat: "Cunning",
      target: "4+",
      success: [
        "Gain 15 XP as you recognize the silhouettes on the ridgeline",
        "If the highest roll was a 4 or 5, reveal the top card of the Threat Deck your Hero Party is currently drawing from, then put it back. If that Threat card is later drawn for an Attack, it is automatically an Ambush",
        "If a 6+ was rolled, instead a war party of Indian Braves watches your posse. Take this card. Once during this Adventure, you may discard this Encounter to choose a Map Tile. Each Enemy on that Map Tile takes D6+2 Wounds, ignoring Defense, as they are riddled with Arrows from above"
      ],
      fail: [],
    },
  },
  {
    id: "dark_stone_geodes",
    name: "Dark Stone Geodes",
    tags: ["Environment", "Dark Stone"],
    flavor: "Several massive, round boulders sit here, at the base of the cliffside. One of them is cracked open to reveal that the inside is hollow, lined with jagged Dark Stone crystals, glimmering with a magical glow.",
    test: {
      stat: "Agility",
      target: "5+",
      success: ["For every 5+ rolled, you may collect 1 Dark Stone"],
      fail: ["For every 1 rolled, take D3 Wounds ignoring Defense and 1 Corruption Hit, as you cut yourself on the black rock"],
    },
  },
  {
    id: "river_crossing",
    name: "River Crossing",
    tags: ["Environment", "Water"],
    flavor: "A raging river rolls by here, white water spitting up at you as it is dashed on the rocks. There seems to be somewhat of a ford here where you could possibly cross to the other side.",
    effects: [
      "If every Hero spends 1 Grit, you may cross the river to the other side",
      "Once all other Encounters and Attacks are complete here, reveal Map Cards until you find one that has ‘Water’ in the title. Place that map tile, with 2 Exploration Tokens on it and an End Cap on the Map Tile Entrance",
      "Each Hero is immediately moved to any space of that Map Tile and may draw a Loot card. Then reveal and choose 1 of the Exploration Tokens to use. Put the other Token back at the bottom of the stack"
    ],
  },
  {
    id: "the_cliffs_have_eyes",
    name: "The Cliffs Have Eyes",
    tags: ["Active", "Attack"],
    flavor: "You can’t help the feeling that you are being watched! Scanning the tops of the canyon walls, nothing seems out of place, but there is a stillness in the air. Gravel and rocks slide down the canyon wall to your left and you turn sharply, only to find it still empty. A bead of sweat rolls down your brow. that you are being watched! Scanning the tops of the canyon walls, nothing seems out of place, but there is a stillness in the air.",
    test: {
      stat: "Luck",
      target: "5+",
      success: ["Move the Hero Posse marker 1 space forward on the Depth Track and gain 20 XP"],
      fail: ["You weren’t imagining it! Ambush Attack! Ghost Warriors"],
    },
  },
  {
    id: "broken_wagon",
    name: "Broken Wagon",
    tags: ["Environment", "Tokens"],
    flavor: "A broken wagon rests here, overturned and splintered. Broken crates and smashed barrels litter the area. Perhaps there might still be something of value in the wreckage.",
    test: {
      stat: "Cunning",
      target: "4+",
      success: [
        "For every 4+ rolled, draw a Scavenge card to see what you discover",
        "For every 6+ rolled, you may instead gain 1 Side Bag Token: Whiskey, Bandages, Lantern, or Dynamite"
      ],
      fail: [],
    },
  },
  {
    id: "riverbed_massacre",
    name: "Riverbed Massacre",
    tags: ["Environment", "Death"],
    flavor: "The banks of the river here are littered with bodies and ransacked goods. It looks like these people got ambushed from the cliffs and never saw it coming until it was too late. With that in your mind, you look up to the cliffs above, suddenly feeling as if you too are now being stalked. here are littered with bodies and ransacked goods. It looks like these people got ambushed from the cliffs and never saw it coming until it was too late.",
    test: {
      stat: "Lore",
      target: "5+",
      success: ["For each 5+ rolled, you may draw a Loot card, discovered among the bodies"],
      fail: ["If more than half of the Heroes failed this test, you have taken too long and fallen into the same trap! Ambush Attack! Ghost Warriors"],
    },
  },
  {
    id: "the_lost_caravan",
    name: "The Lost Caravan",
    tags: ["Active", "Death"],
    flavor: "Scattered supplies and broken wagons litter the area, their torn canvas coverings whipping and blowing in the canyon wind. A ripped doll stares up at you from the rocky ground with its one remaining button eye. This caravan wasn't simply abandoned, but there aren't any bones or bodies to be found.",
    test: {
      stat: "Lore",
      target: "5+",
      success: ["Gain 10 XP for every 5+ rolled. If at least one 6 was rolled, you may draw a Gear card found in the wreckage"],
      fail: ["Take 3 Horror Hits as the ultimate fate of the travelers wears on your mind"],
    },
  },
  {
    id: "desert_howling",
    name: "Desert Howling",
    tags: ["Active", "Boost", "Beast"],
    flavor: "A chilling howl echoes out across the canyon valley. Moments later a group of howls respond from the other side of the gulch.",
    test: {
      stat: "Spirit",
      target: "5+",
      success: ["Gain 20 XP"],
      fail: ["Take D6 Horror Hits"],
    },
    effects: ["While this card is in play, all Beast Enemies in The Canyons are +1 Combat. Discard this card at the end of the Adventure"],
    remainsInPlay: true,
  },
  {
    id: "flash_flood",
    name: "Flash Flood",
    tags: ["Active", "Water"],
    flavor: "Without warning, a hard driving rain begins to pour down from the skies, drenching you to the bone. In moments, you hear a roar from up the trail and a torrential flood of water rushes toward you, threatening to sweep you off your feet, before dwindling back down to just a trickle.",
    test: {
      stat: "Strength",
      target: "5+",
      success: [],
      fail: ["You must discard 1 Item, Side Bag Token, or Dark Stone as it is swept away in the flash flood"],
    },
    followUp: {
      label: "Then...",
      test: {
        stat: "Luck",
        target: "5+",
        success: ["The waters leave behind something of value. Draw a Gear card"],
        fail: [],
      },
    },
  },
  {
    id: "heat_mirage",
    name: "Heat Mirage",
    tags: ["Active", "Heat", "Insanity"],
    flavor: "Waves of heat rise from the canyon floor, bending and twisting the light in a mesmerizing ripple effect. As you stare at the patterns and colors, your mind begins to form shapes and figures through the distortion.",
    effects: [
      "Each Hero, in descending order of Initiative, must draw and resolve one Mine Encounter card that effects only them",
      "Once it has been initially resolved (after tests, but before any Fight would begin), roll a D6. On the roll of 3+, it was a mirage! Any tokens, cards, Tiles, or Enemies that were part of it are discarded without further effect",
      "Any XP, Wounds, or Sanity Damage gained are real, regardless of whether the rest of the card's effects are real or not"
    ],
  },
  {
    id: "old_mine_entrance",
    name: "Old Mine Entrance",
    tags: ["Environment", "Mine"],
    flavor: "There is an old mine entrance here, cut into the canyon wall. It looks like it may have been boarded up at some point, but has since been broken back open.",
    effects: [
      "Place a Mine Entrance 'Gate' End Cap on one Random space of this Map Tile (replacing any other End Cap or Gate that might be there)",
      "This works the same in every way as a Gate to an OtherWorld, except it always leads to The Mines",
      "When placing the first Mine Map Tile on the other side of the Gate, start with the Mine Exit 'Gate' End Cap"
    ],
  },
  {
    id: "the_white_buffalo",
    name: "The White Buffalo",
    tags: ["Active", "Omen", "Animal"],
    flavor: "Shimmering in the light of the setting sun, a massive White Buffalo steps into the valley before you. In awe of its wonder, you summon the courage to approach the majestic creature, reaching out your hand.",
    test: {
      stat: "Spirit and Lore",
      target: "6+",
      success: ["Gain 30 XP as you are blessed by the White Buffalo. You may cancel one Darkness or Growing Dread card in play for each 6+ rolled on the test"],
      fail: ["The White Buffalo takes offense at your disrespect! For every 1 or 2 rolled on the test, take D6 Wounds, ignoring Defense and Armor"],
    },
  },
  {
    id: "sand_scorpions",
    name: "Sand Scorpions",
    tags: ["Active", "Swarm"],
    flavor: "Crawling up out of the sand, a swarm of deadly scorpions erupts all around you, pinching and striking with their lethal tails!",
    test: {
      stat: "Strength",
      target: "5+",
      success: ["Gain 15 XP as you fight off the scorpion swarm, crushing them under foot and smashing them with your fists"],
      fail: ["Take D6 Wounds, ignoring Defense"],
    },
    effects: ["Either way, for every 1 rolled during this test, you gain a Bleeding marker as you are stung by a Scorpion's tail!"],
  },
  {
    id: "rustlers_moon",
    name: "Rustler's Moon",
    tags: ["Environment", "Moon", "Boost"],
    flavor: "Known for its darkened sun, allowing outlaws and fiends to move unnoticed, a rustler's moon sits low on the horizon.",
    effects: [
      "All Outlaws, Enemies, and Heroes with 3 or more Corruption Points, are +1 Initiative and +2 Move",
      "This card may be canceled as though it were a Darkness card"
    ],
    remainsInPlay: true,
  },
  {
    id: "floating_barrels",
    name: "Floating Barrels",
    tags: ["Environment", "Water"],
    flavor: "The rushing river passes close by here, churning white with rapids. Caught on an outcropping of rocks, several wooden barrels bob and float in the splashing water.",
    test: {
      stat: "Strength",
      target: "4+",
      success: [
        "You pull some of the barrels close to shore and pry them open to see what is inside",
        "Draw a Scavenge card for every roll of 4 or 5. Draw a Loot card for every roll of 6+"
      ],
      fail: ["You slip and fall into the water, slicing your arm on a jagged rock. Take D6 Wounds, ignoring Defense"],
    },
  },
  {
    id: "the_devils_tongue",
    name: "The Devil's Tongue",
    tags: ["Environment", "Omen"],
    flavor: "Towering over the dry riverbed, an ancient forked cactus looms dark against the light sky. You've seen this cactus before, The Devil's Tongue...on a map...or was it... in a vision?",
    test: {
      stat: "Cunning",
      target: "6+",
      success: ["Gain 40 XP as you decipher its meaning. Until the end of the Adventure, you may cancel one Depth Event that is rolled"],
      fail: ["Roll a D6 (no Grit) and trigger the Depth Event that matches the roll"],
    },
  },
  {
    id: "firefly_valley",
    name: "Firefly Valley",
    tags: ["Environment", "Omen"],
    flavor: "As the sun begins to set, sparks of light flicker in the air all around you. Patterns and shapes form in your mind as the blinking light of the fireflies create constellations as portents of the future.",
    test: {
      stat: "Spirit",
      target: "5+",
      success: ["Gain 15 XP. For the rest of this Adventure, any time a Clue Icon is found, you may Recover a Grit"],
      fail: ["Draw a Growing Dread card and add it to the stack as you are horrified by the nightmare future you see in the lights!"],
    },
  },
  {
    id: "storm_clouds",
    name: "Storm Clouds",
    tags: ["Environment", "Dread"],
    flavor: "Dark clouds roll in from the West, filling the skies overhead with an ominous roar of thunder. A storm's coming... and it's coming in fast.",
    effects: [
      "Whenever the Hero Posse marker moves onto a Blood Spatter or Growing Dread space on the Depth Track, it triggers it as though it were the Darkness marker moving onto that space",
      "Whenever a Darkness card is drawn, every Hero may Recover a Grit on the D6 roll of 4+ each",
      "This Encounter may be canceled as though it were a Darkness card"
    ],
    remainsInPlay: true,
  },
  {
    id: "something_in_the_river",
    name: "Something in the River",
    tags: ["Active", "Water"],
    flavor: "Something bobbing out in the river catches your eye. It's floating down stream and will be close to shore in moments. You might... be able... to reach it.",
    test: {
      stat: "Agility",
      target: "4+",
      success: ["Roll a D6 to see what you pulled from the river"],
      fail: [],
    },
    rollTable: {
      dice: "D6",
      results: {
        "1": { name: "Bloated Body", effect: "As you pull it to the shore, it bursts open, erupting with writhing tentacles! Ambush Attack! Tentacles" },
        "2-5": { name: "Dead Soldier", effect: "Draw D3 Scavenge cards pulled from the body" },
        "6": { name: "What's this?", effect: "Draw an Artifact" },
      },
    },
  },
  {
    id: "the_hanging_tree",
    name: "The Hanging Tree",
    tags: ["Active", "Death"],
    flavor: "A tall, gnarled tree stands here at the edge of a rocky cliff. Swinging from one of its twisted branches are the sun-dried remains of a hanged outlaw.",
    choices: [
      {
        label: "Cut the Body Down",
        test: {
          stat: "Strength",
          target: "6+",
          success: ["For each 6+ rolled, draw a Loot card taken off the body before you give it a proper burial"],
          fail: ["The skeletal remains come to life and slash at you, biting and clawing as you reel back in horror! Take D6 Wounds, ignoring Defense and D6 Sanity Damage, ignoring Willpower"],
        },
      },
      {
        label: "Let Them Swing",
        effects: ["Draw a Growing Dread card and add it to the stack"],
      },
    ],
  },
  {
    id: "smoke_signals",
    name: "Smoke Signals",
    tags: ["Active", "Puzzle"],
    flavor: "Black smoke rises from the ridgeline of the canyon ahead, intermittently broken into dark puffs that form a loose column. As you stop to view the pattern that the smoke forms, the silence of the valley is broken by shrill war cries in the distance, behind you. They're getting closer!",
    test: {
      stat: "Lore",
      target: "5+",
      success: ["Gain 10 XP and you may move the Hero Posse marker up to 2 spaces forward on the Depth Track. For each space moved, every Hero may Recover a Grit"],
      fail: ["The next Attack is automatically an Ambush"],
    },
  },
  {
    id: "smoke_signals",
    name: "Smoke Signals",
    tags: ["Active", "Puzzle"],
    flavor: "Black smoke rises from the ridgeline of the canyon ahead, intermittently broken into dark puffs that form a loose column. As you stop to view the pattern that the smoke forms, the silence of the valley is broken by shrill war cries in the distance, behind you. They're getting closer!",
    test: {
      stat: "Lore",
      target: "5+",
      success: ["Gain 10 XP and you may move the Hero Posse marker up to 2 spaces forward on the Depth Track. For each space moved, every Hero may Recover a Grit"],
      fail: ["The next Attack is automatically an Ambush"],
    },
  },
  {
    id: "the_mountains_slumber",
    name: "The Mountain's Slumber",
    tags: ["Environment", "Dread"],
    flavor: "The earth shifts under your feet and you hear a hideous roar deep below ground. Something's alive down there, beneath your feet...and it sounds angry!",
    effects: [
      "Whenever the Hero Posse marker or the Darkness marker moves into a new Stage on the Depth Track, draw a Growing Dread card and add it to the stack",
      "This Encounter may be canceled as though it were a Darkness card"
    ],
    remainsInPlay: true,
  },
  {
    id: "angry_spirits",
    name: "Angry Spirits",
    tags: ["Active", "Ghost"],
    flavor: "As you enter the chamber, lights begin to spark and flicker, and a massive ball of ghostly energy erupts from a stone table at the center of the room! In an instant, a host of angry spectres swirls around above you with an unholy moaning and wailing, as they swoop down to curl around you and drain your life force!",
    test: {
      stat: "Spirit",
      target: "5+",
      success: ["Gain 25 XP and you may Heal D6 Sanity Damage"],
      fail: ["Take D3 Wounds, ignoring Defense, and you are -1 Max Grit for the rest of this Adventure"],
    },
  },
];
