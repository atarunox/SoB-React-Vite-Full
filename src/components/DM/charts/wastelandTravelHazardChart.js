// src/components/DM/charts/wastelandTravelHazardChart.js
// Wasteland Travel Hazard Chart — D36 (36 entries, 11–66)
// Used in Blasted Wastes and The Canyons adventures.
// Source: Shadows of Brimstone Blasted Wastes rulebook, page 19–20.

export const wastelandTravelHazardChart = [
  {
    roll: 11,
    name: 'Geldonian Crawler',
    flavor: "Churning sand with its massive wheels, the gigantic rust crawler of the Geldonian Enclave belches black fumes from its exhaust ports. Sifting through the desert sands, it trundles slowly along, mining for spices and Life Water buried beneath the surface to sell to the highest bidder at the market ports of Cantarra Reach.",
    effect: "Make a Lore 5+ test. If successful, cancel the next Travel Hazard without rolling for it. If failed, add an extra Travel Hazard to your journey.",
  },
  {
    roll: 12,
    name: 'Ion Lightning',
    flavor: "Lighting arcs down from the sky as ripples of intense heat rise from the burning dunes.",
    effect: "Each Hero must roll a D6 for every Tech Token and Item they have. For each roll of 1, that Hero is struck by an electric discharge and must either discard a Tech Token or Item of their choice or roll once on the Injury Table.",
  },
  {
    roll: 13,
    name: 'Alien Oasis',
    flavor: "In the distance, you see a shimmering pool of cool water under a rocky overhang offering tempting shade.",
    effect: "Each Hero may Recover 1 Grit and Heal D6 Wounds/Sanity Damage (any mix).",
  },
  {
    roll: 14,
    name: 'Dust River',
    flavor: "A deep river of dust and sand flows through the canyon here, swept forward on a current of heated air.",
    effect: "Each Hero must make a Luck 4+ test to ford the dust river without losing their footing. If failed, you are swept away and separated from the group! You are not affected by the remaining Travel Hazards rolled by the Posse. Instead, you must roll D3 more Travel Hazards that affect only you, as you continue traveling on your own to meet up with the rest of the group when you reach Town.",
  },
  {
    roll: 15,
    name: 'Rock Mites',
    flavor: "With a sickening chitter, a swarm of large, hard-shelled creatures scurry up from beneath the rocks to surround you!",
    effect: "Each Hero must make a Strength 5+ test to overcome the Rock Mites. If successful, gain 15 XP and you escape to safety. If failed, they latch themselves onto you, and begin feeding! Take D6 Wounds, ignoring Defense, and make this test again until successful or KO'd.",
  },
  {
    roll: 16,
    name: 'Dying Scavenger',
    flavor: "Slumped against a chunk of wreckage, a dying scavenger tells you the location of his supply stash for the promise of a proper burial.",
    effect: "You may add 2 extra Travel Hazards to your journey to go out to the location of his stash on the way to Town. If you do, after completing the next 2 Travel Hazards, each Hero may choose one of the following to gain — Bandages, Whiskey, Spice, or D6 Scrap Tokens.",
  },

  {
    roll: 21,
    name: 'Void Twister',
    flavor: "A Void Twister sweeps across the desert landscape, creating a swirling storm of chaos all around you, and threatening to pull you off your feet!",
    effect: "Every Hero must make a Luck 5+ test. If successful, gain 10 XP and take 1 Corruption Hit. If failed, you are swept up in the twister and dashed on the jagged wreckage nearby! Take 2D6 Wounds, ignoring Defense and D3 Corruption Hits. Also, once you arrive in Town, 1 Random Building has been Destroyed by the Void Twister.",
  },
  {
    roll: 22,
    name: 'Dark Stone Dust Storm',
    flavor: "Without warning, a massive Dark Stone dust storm sweeps up over the dunes, engulfing you in its biting fury! Purple lightning arcs all around and it takes all of your strength to push through the abrasive onslaught and find shelter among some nearby wreckage.",
    effect: "Every Hero must make a Strength 5+ test to push their way through the storm. If successful, gain 20 XP and take D3 Corruption Hits. If failed, take D6 Hits and D6 Corruption Hits as you are battered by the Void-energized sandstorm.",
  },
  {
    roll: 23,
    name: 'Dune Quake',
    flavor: "The shifting sands open up into a gaping chasm before you as the ground all around trembles and collapses!",
    effect: "Every Hero must make an Agility 4+ test. If failed, you lose your footing and drop something into the chasm as you scramble away from the edge. You must discard 1 Item.",
  },
  {
    roll: 24,
    name: 'Sinking Sand',
    flavor: "Patches of sand here seem unstable, with no solid footing to be found. If you are not careful, you could find yourself pulled under in the sinking sand.",
    effect: "Every Hero may make a Cunning 5+ test. If successful, your keen eye spots something of value previously lost to the sinking sand — draw a Loot card. If failed, you stumble into an unstable patch and are pulled under! After a few moments, you claw your way back to the surface, but have lost something in the struggle. You must discard 1 Dark Stone, Tech, Scrap, Side Bag Token, or Item of your choice.",
  },
  {
    roll: 25,
    name: 'Fire in the Sky',
    flavor: "A blazing trail streaks across the sky in the distance as another ship is pulled down to the planet's surface!",
    effect: "Every Hero may make a Lore 5+ test. If successful, gain 10 XP and Recover a Grit.",
  },
  {
    roll: 26,
    name: 'Valley of Bones',
    flavor: "Crossing into a rocky valley, you discover that the cliff walls are lined with the bones of the dead, bleached white from years under the beating suns! Dark feelings of dread creep into your mind as you press forward.",
    effect: "Every Hero must make a Spirit 5+ test. If successful, gain 15 XP and you may heal D6 Sanity Damage. If failed, the angry spirits of the dead seem to close in all around you! Take 2D6 Horror Hits.",
  },

  {
    roll: 31,
    name: 'Nest of Eggs',
    flavor: "You've stumbled into a massive nest of large, reptilian looking eggs nestled into a rock formation. Chittering can be heard coming from a nearby cave.",
    effect: "Each Hero must choose to either get out before you are noticed (make an Agility 4+ test) or grab an egg and run (make a Strength 6+ test)! If successful, gain 10 XP. If you grabbed an egg, take 1 Corruption Hit and you may sell the egg in Town for D6×$100. If failed, you are too slow and discovered in the nest! Ravaged by a massive Harkon Beast, take 3D6 Hits.",
  },
  {
    roll: 32,
    name: 'Scavenger Trap',
    flavor: "Stepping on a pressure plate beneath the sand, a series of junk bombs explode all around you!",
    effect: "Each Hero takes D6 Wounds, ignoring Defense.",
  },
  {
    roll: 33,
    name: 'Hive Town Raiders',
    flavor: "Climbing a steep dune, you are nearly knocked over as two scrap wagons hurtle over the ridge, belching black smoke and showering you with sand as they spin circles around your posse!",
    effect: "Each Hero is attacked by 4 Raiders from the Scrap Wagons. Make a Skill 4+ test (your choice of Skill) to overcome them. For each success, you defeat 1 Raider and gain 10 XP. For each Raider you do not defeat, discard one Side Bag Token, Dark Stone, or Item, stolen in the skirmish.",
  },
  {
    roll: 34,
    name: "Karn'uto Stampede",
    flavor: "The ground shakes and the thunderous onslaught is deafening as a massive herd of wild Karn'uto stampede across the dunes around you!",
    effect: "Each Hero must make a Strength 4+ test to keep their footing. If passed, gain 15 XP as you stare down the unruly herd. If failed, you are overrun and trampled! Roll once on the Injury chart, using 3D6 and discarding the lowest single die roll.",
  },
  {
    roll: 35,
    name: "Traitor's Road",
    flavor: "Following a desert trail, you descend into a rocky valley. The cliff face here, on either side, is adorned with the hanging bodies of dead Scavengers, strung up to bake in the blistering sun. As you push forward, the bodies only grow in number.",
    effect: "Each Hero must make a Spirit 6+ test. If successful, gain 25 XP. If failed, draw a Growing Dread card and immediately play it (ignore all references to Enemies, the Depth Track, and any other game elements that are only used during an Adventure — note that this means some cards may have no effect at all).",
  },
  {
    roll: 36,
    name: 'Nomad Merchant',
    flavor: "Trekking through the desert wastes with a group of Karn'uto pack animals, a nomad merchant crosses your path and offers you the opportunity to view his wares. 'What are ya' buyin'?' he asks, in a raspy alien dialect.",
    effect: "Draw 2 Blasted Wastes Artifact cards and 1 other Artifact card from a Random World. The Heroes may purchase any of these Artifacts for the listed value + D3×$100. If an Artifact has no listed value, treat its listed value as $0. Only one of each item is available, and if multiple Heroes want to purchase the same item, the Hero with the highest Lore gets first choice.",
  },

  {
    roll: 41,
    name: 'Settlement Ruins',
    flavor: "You come across the smoking ruins of a small settlement. It looks as though it was raided in the last few days. From the carnage here, there were no survivors.",
    effect: "Each Hero loses 1 Grit. If you do not have a Grit to lose, instead take D3 Sanity Damage, ignoring Willpower.",
  },
  {
    roll: 42,
    name: 'Mutant Warriors',
    flavor: "Surrounded by a group of mutant scavengers, you have no choice but to give them what they want.",
    effect: "Each Hero must discard D3 of the following (any mix) — Grit, Dark Stone, Scrap, Tech, or Side Bag Token, offered up to pay off the mutants.",
  },
  {
    roll: 43,
    name: 'Polished Bones',
    flavor: "The sand here is full of bones, bleached by the desert suns and polished to a sheen by the abrasive sand storms.",
    effect: "Each Hero may draw a Scavenge card. Any Darkness or Growing Dread cards called for are drawn at the beginning of the next Adventure instead of immediately.",
  },
  {
    roll: 44,
    name: 'Wrecked Scrap Wagons',
    flavor: "You have stumbled onto the site of what must have been a high-speed skirmish between several Scrap Wagon mounted Warbands. Debris and bodies litter the area, still billowing oily black smoke and fumes.",
    effect: "Each Hero can decide to pass it by without getting too close, or to sift through the aftermath to look for anything useful. If you search the wreckage, make a Luck 5+ test. If failed, lose 1 Health permanently, as you breathe in a lung full of toxic fumes that burn in your chest. If successful, roll a D6: 1–3 Salvage (pull {P} Tech Tokens from the wreckage), 4–5 Artifact (draw a Blasted Wastes Artifact card), 6 Survivor (find someone alive — gain +1 Max Grit).",
  },
  {
    roll: 45,
    name: 'Watchtower',
    flavor: "A Rust Fort watchtower overlooks the valley ahead and you can see from the bodies strung up on posts surrounding it that they don't seem very friendly. You'll have to find another way around.",
    effect: "This adds an extra D3 Travel Hazards to your journey. If another Watchtower is rolled, instead every Hero loses all Grit they currently have as they sneak by undetected.",
  },
  {
    roll: 46,
    name: 'Sleeping Under the Stars',
    flavor: "As you drift off to sleep under the starry sky, your thoughts turn to the vastness of time and space, and all the horrors and wonders you have seen on your journeys.",
    effect: "Each Hero may make a Lore 6+ test. For each 6+ rolled, gain +1 Health or +1 Sanity.",
  },

  {
    roll: 51,
    name: 'Pit of Kar-Suul',
    flavor: "A gaping pit stretches out before you in the desert floor, rings of teeth protruding from the rocky looking, circular rings that line its interior. Is this a natural formation of some sort, or a massive creature?!?",
    effect: "Every Hero must roll a D6 for each Corruption Point and Mutation they have. On the roll of 1 or 2, take an additional Corruption Point, ignoring Willpower.",
  },
  {
    roll: 52,
    name: 'The Black Wall',
    flavor: "Rising high up out of the desert dunes, this featureless black wall extends off as far as the eye can see in both directions. You'll have to go a different way.",
    effect: "Add one extra Travel Hazard to the journey for each Hero in the Posse. If The Black Wall is rolled a second time during the journey to Town, there is no way through, and the Heroes must proceed to the next Adventure without a Town visit.",
  },
  {
    roll: 53,
    name: 'Fungus Farmers',
    flavor: "You encounter a small group of Fungus Farmers on their way to a neighboring settlement to sell their wares.",
    effect: "Each Hero may spend $50 to Heal D6 Health/Sanity (any mix). Also, when you arrive at the Barter Town that you are Traveling to, it automatically has a Mining Operation as one of its Locations.",
  },
  {
    roll: 54,
    name: 'Buried Warden',
    flavor: "Tripping over something hard, you look back to see a cascade of sand pouring away from the massive form of a Mk V Warden robot, rising up from under the dune! It's eyes flicker to life as it looks down at you with cold hate!",
    effect: "Each Hero must choose to do one of the following:\n\nRun and Hide (Agility 5+ test): If successful, you take no damage as you hide and wait for the Warden to pass. If failed, take 2D6 Hits as you are blasted by the Warden's Pacifier Cannon.\n\nor\n\nOverpower as a Group (Strength 5+ test): If the total number of successes from Heroes making this test is equal to or greater than the total number of Heroes in the Posse, you overpower the Warden and shut it down — each Hero that made this test gains 25 XP. If failed, each Hero that made this test takes D6 Wounds, ignoring Defense.",
  },
  {
    roll: 55,
    name: 'Hydro-Collector',
    flavor: "You come across a tall, ramshackle machine, with large wind turbines rooted in a rocky outcropping. It seems to be pulling moisture from the air and condensing it into a reservoir inside. There's no sign of who built or maintains it though.",
    effect: "Each Hero may take a refreshing drink from the collected water, Recovering 1 Grit. If you do, you also take 1 Corruption Point, ignoring Willpower, on the D6 roll of 1 (Grit may not be used for this roll).",
  },
  {
    roll: 56,
    name: 'Shimmering Mirage',
    flavor: "The heat coming off the sand shimmers in the distance, and shapes of far off places and things begin to take form in the light. Is there really something there?",
    effect: "Choose a number between 1 and 6, then roll 3 dice. For each die that rolled your chosen number, you may draw a Loot card (no extra Loot for the World effect). If none of the dice rolled your chosen number, you shake off the illusion and begin to realize just how dehydrated you really are! Take D6 Wounds and D6 Sanity Damage, ignoring Defense/Willpower and Armor.",
  },

  {
    roll: 61,
    name: 'Acid River',
    flavor: "The twin suns are low on the horizon as you pass through the rocky cliffs and sandy canyons. With night setting in, the boiling acid river at the base of the valley begins to churn and release toxic mist into the air, filling the region with a deadly fume.",
    effect: "Every Hero immediately takes 2 Hits that do 2 Wounds each. For the rest of this Traveling journey, every Hero takes 1 Hit that does 2 Wounds before each remaining Travel Hazard rolled.",
  },
  {
    roll: 62,
    name: 'Void Hound Attack',
    flavor: "A pack of vicious Void Hounds have been tracking your posse for days and have found the opportunity to strike!",
    effect: "Each Hero must make a Cunning 5+ test to outwit the Hounds or a Strength 5+ test to overpower them. If passed, gain 25 XP. If failed, you are ravaged by the creatures! Roll a D6 for every Clothing Item you have (not including your Personal Item). On the roll of 1 or 2 it is torn apart and destroyed by the savage attack.",
  },
  {
    roll: 63,
    name: 'Blinking Beacon',
    flavor: "A blinking light buried in the sand draws your attention, and you hear a rumbling roar in the distance.",
    effect: "You must make a Cunning 5+ test to find and shut off the beacon before it attracts something terrible from beneath the sand. If successful, gain 20 XP. If failed, you're too late! A massive desert Burrower erupts beneath you, scattering the posse and attacking your mounts! Every Hero must roll a D6 for any Transport they have. On the roll of 1 or 2, it is devoured by the beast (discarded)!",
  },
  {
    roll: 64,
    name: 'Offering to the Great Kraken',
    flavor: "On a rocky outcropping atop the cliff wall, an alien woman stands, tied to a rusty post; her tattered and flowing clothes blowing in the wind! She seems to be captive, placed as a sacrificial offering of some sort. In the distance, you hear a savage roar as the ground trembles!",
    effect: "Each Hero must decide to push on (no effect) or climb the cliff to try and free the captive! If you climb the cliff, make an Agility 6+ test. If the total number of successes for all Heroes is 3 or more, you reach the captive and free her! Each Hero that made the test may draw 2 Loot cards (no extra for the World ability). If not, a nightmarishly massive Sand Kraken emerges and eats the captive, knocking the Heroes off the cliff! Each Hero that made the test must roll once on the Injury Table.",
  },
  {
    roll: 65,
    name: 'Refugee Camp',
    flavor: "Tattered tents and malnourished Karn'uto beasts fill the small valley as you pick your way through a refugee camp of survivors from a Barter Town overrun by raiders.",
    effect: "Each Hero may discard any number of Side Bag or Tech Tokens to remove 1 Corruption Point each.",
  },
  {
    roll: 66,
    name: 'Desert Traveler',
    flavor: "Late at night, while the others are sleeping, a shadowy figure approaches your camp site. In a hushed whisper, he speaks to you from the shadows.",
    effect: "You may either wake the others (no further effect as he disappears into the night), or listen to what he has to say. Make a Spirit 6+ test. If successful, gain +1 Sanity. If failed, take D6 Corruption Points, ignoring Willpower.",
  },
];

export default wastelandTravelHazardChart;
