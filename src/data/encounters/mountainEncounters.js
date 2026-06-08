// Mountain Terrain Encounters — D20 table
// Source: HexCrawl Encounters Book v1.0, pp. 42–43

export const mountainEncounters = [
  {
    roll: 1,
    name: "The Mountain Pass",
    tags: ["Active", "Enemy"],
    flavor: "A lonely mountain pass is guarded by a horde of Enemies, denying all passage.",
    effect: "Unless the Posse fights a High level threat, you must stop all movement for the day as you search for another way around this group.",
  },
  {
    roll: 2,
    name: "Rock Slide",
    tags: ["Environment", "Hazard"],
    flavor: "A few pebbles bounce by at first, without anyone paying attention, but when the mountain's face begins to slide, all bets are off.",
    effect: "Roll 2D6. Collectively, the Heroes must take that many Hits, but may decide how those Hits are distributed amongst the Heroes. You have one minute to decide or all Heroes each take that many Hits.",
  },
  {
    roll: 3,
    name: "Hot Feet!",
    tags: ["Environment", "Fire"],
    flavor: "The ground about you begins to rumble as you realize that you appear to be on a dormant volcano that has once again become active and is about to start spewing lava!",
    test: { stat: "Agility", target: "5+",
      fail: ["Any Hero that fails has lost any Boots they were wearing, unless the Boots provided some kind of resistance or immunity to Fire effects."]
    },
  },
  {
    roll: 4,
    name: "The Price of Corruption",
    tags: ["Active", "Stranger"],
    flavor: "If it weren't for the time of season the little log cabin would never be seen by the Posse. This would probably have been for the best, for there now stands before you a man with a sawed-off shotgun, accompanied by wolves and a great bear.",
    effect: "If the Posse collectively has more Corruption points than the # of Heroes x 2, then the Mountain man and his animal allies attack you! Each Hero takes D6 Hits and rolls a D6. On a roll of 1, that Hero has lost 1 Dark Stone, an item with a Dark Stone icon, or an item with a Dark Stone Upgrade attached (your choice).",
  },
  {
    roll: 5,
    name: "Fossil Record",
    tags: ["Environment", "Loot"],
    flavor: "A recent landslide has exposed a fossil. The fossil does not appear to be like any creature you've ever seen before, living or dead. Surely a learned fellow would be interested in having a look at this thing.",
    effect: "Each Hero that can may take one Fossil item. Each Fossil may be sold at a Doc's Office for D6x$50.",
  },
  {
    roll: 6,
    name: "Gabriel's Horns",
    tags: ["Environment", "Hope"],
    flavor: "The Posse travels through a wet mist of low cloud formations feeling miserable. They are drawn out of their black thoughts when the mountain peaks begin to sing a sort of song. It's almost as if the mountain tops are resonating with some sort of cosmic harmony.",
    effect: "Each Hero is Healed to Full Health & Sanity.",
  },
  {
    roll: 7,
    name: "Spider Hole",
    tags: ["Environment", "Explore"],
    flavor: "As you search along a particularly steep side of a rocky area, you see what appears to be a small freshly dug hole, hastily covered with a flat rock. As you uncover the hole, something emerges!",
    effect: "Each Hero gains 25 XP. Roll a D6:",
    table: [
      { roll: "1", text: "A giant spider jumps out from the hole as you rip off the covering and attacks. Each Hero takes D3 Wounds (no Defense) before you're able to kill the thing." },
      { roll: "2-5", text: "An odor of death & decay hits you full force as you lift the covering. You find mutilated bodies, fresh kills for some creature that thankfully isn't around. Each Hero takes D3 Horror Hits as they realize the cuts are actually intricate carvings of some demonic symbols." },
      { roll: "6", text: "A frightened Prospector arises from the hole. He had been hiding from a swarm of monsters and gives the Heroes what he thinks attracted the monsters in the first place. Each Hero receives 1 Dark Stone and recovers 1 Grit." },
    ],
  },
  {
    roll: 8,
    name: "Viper's Nest",
    tags: ["Active", "Creature"],
    flavor: "One of the Posse members needs a private moment with nature. An unfortunate back-step and they are reaching for their drawers as they slide down a flue. None of this is as surprising as the rattle-snake nest they've fallen on.",
    test: { stat: "Agility", target: "5+",
      success: ["Gain 20 XP and you are unharmed."],
      fail: ["You have become Poisoned! Gain D6 Poison markers. For each of these Poison markers that you have, roll a D6 once per day. On a 1 or 2, take 1 Wound, ignoring Defense. On a 6, you may discard a Poison marker."]
    },
  },
  {
    roll: 9,
    name: "Good Eatin'",
    tags: ["Active"],
    flavor: "A tribe of crazed mountain giants have taken up cannibalism and are hunting the Posse! They're planning on getting fat off the meat of your carcasses tonight.",
    effect: "Each Hero in the Posse takes D8 Wounds. This damage can be completely avoided if any one Hero gives up their Horse to be killed to throw the mountain giants off of the Posse's trail.",
  },
  {
    roll: 10,
    name: "Nest of the Thunderbird",
    tags: ["Active", "Creature"],
    flavor: "Looking up through thickening clouds, someone glimpses a huge nest. An enormous winged shape leaps from the edge of the nest.",
    effect: "The Thunderbird attacks the Posse! A Random Hero takes D6 Hits. For the rest of the day, every time the Posse moves into a hex with mountain terrain, a Random Hero in the Posse takes an additional D6 Hits.",
  },
  {
    roll: 11,
    name: "Fire in the Hills",
    tags: ["Active", "Fire"],
    flavor: "The smell of smoke hangs in the air and all around you the hillsides are aflame with an unnatural glow! Lavamen are walking the landscape destroying all they find. The unnatural flames of the Lavamen burn those tainted by corruption.",
    effect: "Each Hero takes 1 Wound (no Defense) for each point of Corruption they have. Any Hero that takes damage from this also gains 15 XP.",
  },
  {
    roll: 12,
    name: "Mountain Yetis",
    tags: ["Active", "Creature"],
    flavor: "A warning grunt turns the Posse's head towards the lip of a cliff-top. A hairy head appears. Another head follows and another. Giant, hairy, beast-like men stare down in silence. One points with intent at you. Then suddenly, rolling logs and boulders come crashing down the mountainside towards the Posse!",
    test: {
      options: [
        { stat: "Agility", target: "5+" },
        { stat: "Strength", target: "4+", collective: true }
      ],
      success: ["Any Hero that is successful in the Agility test or if the Posse passes the Strength test, they each gain 20 XP and recover 1 Grit."],
      fail: ["If any Heroes fail the individual Agility test, they take D6 Hits. If any one Hero in the group fails the Strength 4+ test, then all Heroes in the Posse takes D3 Wounds (no Defense)."]
    },
  },
  {
    roll: 13,
    name: "Burial Chamber of the Dust Pharaohs",
    tags: ["Environment", "Ancient"],
    flavor: "What appeared to the Posse as a semblance of man-made structures can no longer be reasoned to be anything but. An opening along a cliff side seems to be covered in gold. Inside an enormous cavern of gold, rank-upon-rank of man-sized urns vanish into the dusty distance.",
    effect: "If you decide to look inside the urns, gain 25 XP and roll D6:",
    table: [
      { roll: "1", text: "Seepage — While looking through the urns, one of the urns seems to have been seeping its contents for who knows how long. A random Hero accidentally touches the substance and gets an odd, tingly feeling. That Hero gains a Random Mutation regardless of how much Corruption they currently have and Corruption is not removed because of this." },
      { roll: "2-5", text: "Trinkets and Bobbles — Most of what you find crumbles to dust in your hands, but you come across a few small things that might fetch a good price. Each Hero gains D3x$25." },
      { roll: "6", text: "Something Interesting — a Random Hero draws a Loot card!" },
    ],
  },
  {
    roll: 14,
    name: "Gruesome Sculptures",
    tags: ["Active", "Cult"],
    flavor: "Some old blood cult lurked in the cave that can be seen above this mountain path. When they departed (or where driven out), their gruesome rack of skulls and the pylons they built from stacked human thigh bones were left untouched, grim sentinels along either side of the traverse.",
    effect: "Each Hero gains 25 XP and takes D6 Horror Hits. The macabre display has the Posse on edge throughout the entire trip. For the rest of this day and the next, any Attack results from Exploration Tokens become Ambush Attacks instead.",
  },
  {
    roll: 15,
    name: "Cavern of the Winds",
    tags: ["Environment", "Hazard"],
    flavor: "Making your way around a particularly difficult ridge, the Posse is forced to go single file, inching along at a slow pace. The way before you opens up to reveal a small cavern where the wind blows with monstrous strength. The opening is too small to enter, so you'll have to go around, but it's going to be treacherous.",
    effect: "Decide on the order of Heroes in the line and, one at a time, each Hero makes an Agility 4+ test. If a Hero fails this initial test, the Heroes before or after them may attempt an Agility 4+ test to rescue them, otherwise they fall. If any 1s are rolled on this rescue roll, that Hero also falls and again, the Heroes before and after them may attempt an Agility 4+ test to rescue them. All Heroes that fall down the ridge take D6 Wounds (no Defense). Any Heroes that do not fall gain 20 XP and recovers 1 Grit.",
  },
  {
    roll: 16,
    name: "Stairway to the Sky",
    tags: ["Active", "Ancient", "Tech"],
    flavor: "A mountain with a massive staircase cut into the side leads up towards the tallest peak in this area. There you find what appears to be some sort of weird mechanical device in the center of a raised platform.",
    test: { stat: "Lore", target: "6+",
      success: ["A single Hero may attempt to figure out the inner workings of the device and get it working again. The rock around the peak shudders and suddenly the Heroes are flying! This platform may transport the Heroes to any hex on the map in a single day (do not roll for Wilderness Encounters and does not count against movement), but falls to pieces after the Heroes land."],
      fail: ["If they are unsuccessful, the mountain shudders around them and the rock staircase the party took up is destroyed in a massive upheaval. The Posse will need to spend 5 MP to climb back down the mountain from the peak."]
    },
  },
  {
    roll: 17,
    name: "Corrupting Influences",
    tags: ["Active", "Void"],
    flavor: "Lightning bolts burst against mountain peaks. One bolt strikes directly in front of the Posse, blinding you for a moment, but it leaves something behind. A crackling orb of pure white hovers in front of you, bolts of energy shooting out.",
    effect: "Any Heroes that are carrying Dark Stone, items with a Dark Stone icon, or items with a Dark Stone Upgrade attached take D3 Horror Hits. If any Sanity Damage is taken, that Hero gains the 'Fused With Item' Mutation, but must fuse with an item with a Dark Stone Icon or that has a Dark Stone Upgrade. Continue to roll for Corruption on that item.",
  },
  {
    roll: 18,
    name: "Hunting Lodge",
    tags: ["Active", "Merchant"],
    flavor: "You come across a well-built cabin up in a remote part of the mountains, a hunting lodge way up here! The owner has a variety of wares for sale here.",
    effect: "You may buy Purchase Items from here as if you were at a General Store Town Location (do not roll for Location Events).",
  },
  {
    roll: 19,
    name: "Remnants of the Great Worm",
    tags: ["Environment", "Explore"],
    flavor: "The Posse stumbles across a tunnel out in the middle of nowhere. As you travel down into this cave, you find something you weren't quite expecting...",
    effect: "Roll a D6:",
    table: [
      { roll: "1-2", text: "Ambush! — Ambush by a High level threat in the middle of a suitably large Mine Map Tile Room with one exit connected to the Mine Entrance Map Tile." },
      { roll: "3-5", text: "Junk Pile — Each Hero may attempt a Scavenge roll to see if they find anything of value." },
      { roll: "6", text: "Thriving Tunnel City — You come across a hidden mining community. Treat this as a Town Visit. Don't roll for Town Set Up, but each Hero may visit any one Town Location they want to. After that, the Heroes are led out of the tunnel city and may never visit again." },
    ],
  },
  {
    roll: 20,
    name: "Local Sightings",
    tags: ["Active", "Explore"],
    flavor: "A mountain hermit who knows the area passes by and strikes up a conversation with you. He knows the area pretty well and tells you what he can about it.",
    effect: "Select an adjacent hex and flip over an Exploration Token. If you Search that specific hex on this day, draw the face-up Exploration Token. Otherwise draw from the next face-down Exploration Token for any other hexes that you Search this day. Reshuffle all the Exploration Tokens at the end of the day.",
  },
];
