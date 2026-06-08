// Railroad Terrain Encounters — D20 table
// Source: HexCrawl Encounters Book v1.0, pp. 46–47
// Railroads may occur over any other terrain and must include a railroad track traveling over them.

export const railroadEncounters = [
  {
    roll: 1,
    name: "Great White Buffalo",
    tags: ["Active", "Creature"],
    flavor: "A great white leviathan of a buffalo snorts and lowers its head towards a passing train it mistakes for another great buffalo.",
    effect: "With a tumultuous crash the Great White Buffalo rams into the train, sending its cars scattering off to the side of the railway. Until the End of your next Adventure, all train travel along this section of railway is impossible until the mess can be cleaned up.",
  },
  {
    roll: 2,
    name: "Racing the Iron Horse",
    tags: ["Active", "Gambling"],
    flavor: "Someone must've made a bet at a train station, as you can see a locomotive speeding down the track, going neck and neck against an Indian Brave on horseback. The Train Engineer is giving the train all she has and only God knows if man or machine will win out in this race.",
    effect: "Each Hero may place odds on the outcome of this race. Everyone that wants to, secretly bets with a hidden die, even = the Train, odd = the Indian Brave. Then a D6 is rolled and the outcome determined. Each losing bidder pays $25 to every other winning bidder. If the Train won, those winning Heroes also gain a Bandage or Whiskey Side Bag Token (choose one), while if the Indian Brave wins, those winning Heroes Recover 1 Grit.",
  },
  {
    roll: 3,
    name: "Indian Attack!",
    tags: ["Active", "Tribal"],
    flavor: "Smoke billows can be seen up ahead and Indian Braves on horseback throwing torches are riding around. They're destroying the railway where it has gone over sacred Indian territory!",
    effect: "If you decide to stop the Indians from attacking, each Hero takes D6 Hits and every non-Tribal Hero loses the keyword 'Kemosabe' if they have it, while every Hero that does not have the keyword 'Kemosabe' gains the keyword 'Paleface'. If you do not stop the Indians, this section of the railway is permanently Destroyed. You may not travel by train down this railway to any towns that would be reached via this section of the railway.",
  },
  {
    roll: 4,
    name: "Train Robbery!",
    tags: ["Active", "Outlaw"],
    flavor: "Ahead of you, the Posse spies a passenger train stopped on the tracks, a group on horseback with guns drawn can be seen in front of the train and the engineer is standing beside the engine with bands in his hands. It's a Train Robbery!",
    effect: "Each Hero that can makes a Range attack against the train robbers to chase them away. If less than half of the Heroes Hit with their attacks, the train robbers put up a fight and each Hero in the Posse takes Wounds with no Defense. In addition, for each 1 that a Hero rolls, that Hero has accidentally shot an innocent bystander and takes 1 Corruption Point with no save.",
  },
  {
    roll: 5,
    name: "Phantom Train",
    tags: ["Active", "Horror"],
    flavor: "The whistle of an oncoming train can be heard rushing down the tracks. Yet the train you can see appears to be some faint apparition, a spectral train of the dead. The train comes to a stop in front of the Posse, an ethereal conductor beckons you to board the train.",
    effect: "The Posse may travel on this Phantom Train if they'd like to any hex on the map, but each Hero takes D8 Horror Hits and if they suffer 3 or more Sanity Damage as a result, roll once on the Madness Chart.",
  },
  {
    roll: 6,
    name: "Dastardly Whiplash",
    tags: ["Active", "Rescue"],
    flavor: "Some foul fiend has left a fair maiden tied up to a railway line. What devilry! You have only seconds to act before a speeding locomotive bears down upon this buxom damsel in distress.",
    effect: "Each Hero may attempt to free the tied-up maiden, however, only one Hero may be successful. Each Hero that is attempting makes an Agility 3+ test and counts the number of their successes. All Heroes that are tied for number of successes are disqualified. The player with the most successes that isn't disqualified (not tied and must have 1 or more successes) has rescued the fair maiden. If no one is successful, the fair maiden is cut in twain and all Heroes take D3 Corruption Hits (no Willpower save). Whoever saves the maiden recovers 1 Grit and may Heal D6 Wounds/Sanity (any mix) at the end of the day.",
  },
  {
    roll: 7,
    name: "Kraken of the Rails",
    tags: ["Active", "Void"],
    flavor: "A horde of Tentacles have sprung forth from the ground and are literally holding up a small train off the tracks!",
    effect: "Each Hero makes an Attack (Melee or Ranged). If collectively the Heroes are able to do at least 2 x # of Heroes worth of Damage (ex. three Heroes need to do at least 6 Wounds), then they have freed the train from the tentacles before serious damage is done. If successful, the Heroes each gain a reward of D6x$25. If failed, then the train along with a huge section of the railway is Destroyed. Until the end of your next Adventure, you may not travel by train down this railway to any towns that would be reached via this section of the railway.",
  },
  {
    roll: 8,
    name: "Chained to the Rails",
    tags: ["Active", "Rescue"],
    flavor: "Some hooligans have chained a farmer's cow to the tracks. The farmer is busy trying to free the animal from the tracks, but a speeding locomotive is on a collision course with both man and cow unless you can act fast!",
    effect: "Without discussing their choice, each Hero secretly chooses a direction to pull the cow off the tracks using a hidden die (even = right, odd = left). Everyone reveals their choice at the same time. Whichever group wins, the cow is pulled in their direction off the tracks and each Hero on that side gains 20 XP. Whichever Heroes were on the other side barely escape the oncoming train and take Wounds for their effort. If tied, the cow is torn apart by the train and the Heroes collectively lose $50 paying back the farmer for his lost cow (each Hero loses $50 if a decision cannot be reached).",
  },
  {
    roll: 9,
    name: "Derailment",
    tags: ["Environment", "Dark Stone"],
    flavor: "A freight train has derailed off the tracks, spilling its contents all over the area. A load of Dark Stone that was being transported also spilled out, drawing out some things that were best kept in the shadows...",
    effect: "Each Hero may make a Scavenge roll to grab some Dark Stone for themselves. For each roll of 5 or 6, gain 1 Dark Stone without ill effect. On a roll of 2, 3, 4 a Hero gains 1 Dark Stone, but also gains 1 Corruption Point with no save. If any Heroes roll a 1, Ambush — Draw a High Threat card.",
  },
  {
    roll: 10,
    name: "Casey Jones",
    tags: ["Active", "Rescue"],
    flavor: "The train engineer has passed out over the side of the railing. The Posse can see from where they're at that the train is out of control. There's not much time to act!",
    test: {
      options: [
        { stat: "Luck", target: "6+" },
        { stat: "Agility", target: "5+" }
      ],
      success: ["Then each Hero gains 20 XP and the train is brought to a stop without incident. If no Heroes are successful, then the train is only brought to a stop when it crashes into the nearest Town. 1 Random Building in that Town is Destroyed."]
    },
  },
  {
    roll: 11,
    name: "Bone Train",
    tags: ["Environment"],
    flavor: "A Bone train is currently stopped in the middle of the tracks for repairs. Workers are busy collecting buffalo bones and packing them back into the train.",
    effect: "Nothing eventful happens.",
  },
  {
    roll: 12,
    name: "Craps",
    tags: ["Active", "Gambling"],
    flavor: "Beside the tracks are some vagrants, pulled up around some barrels playing Craps. They offer to let you roll some dice if you don't mind losing the shirt off your backs.",
    effect: "Each Hero may gamble if they want and places a bet of $50 or $100, roll 2D6. A 7 or 11 automatically wins the game for the Hero, while 2, 3, or double-sixes automatically fails. Any other result becomes the target number and the Hero will roll again. The Hero must hit the target number, but if they roll a 7 this time, they fail. Any Hero that is successful gains twice whatever amount they originally bet. Any Hero that fails instead loses twice their initial bet.",
  },
  {
    roll: 13,
    name: "Train Hopping",
    tags: ["Active", "Transport"],
    flavor: "The Posse comes across a train that has stopped along the tracks for some minor repairs. The engineer and the conductor appear to be busy and aren't paying attention to their cars, if you were quick about it you could hop a ride to the next town!",
    test: { stat: "Agility", target: "4+",
      success: ["If the group is successful, then the Posse is immediately transported to any one Town on the Rail Line."],
      fail: ["Any Hero that is unsuccessful takes D6 Wounds with no Defense getting injured in the process of boarding the train."]
    },
  },
  {
    roll: 14,
    name: "Foreign Aid",
    tags: ["Environment", "Ancient"],
    flavor: "Before you is a group of foreign railway workers repairing a section of the track. None seem to speak any English, but they're motioning to you to come see something they've discovered just down the track. The workers have uncovered an ancient tablet with series of alien glyphs carved into it.",
    test: { stat: "Lore", target: "6+",
      success: ["Gain 25 XP and all Heroes may draw a Loot card as the inscription gives instructions to open a hidden cache over the next hill."],
      fail: ["You miss this, and the Heroes fail to disarm the booby trap that blows up the Loot and does Wounds to all Heroes, ignoring Defense."]
    },
  },
  {
    roll: 15,
    name: "Hear that Train a Comin'",
    tags: ["Active", "Outlaw"],
    flavor: "A fancy passenger train is lazily making its way down the track towards you. You bet there's rich folk eatin' in a fancy dining car, drinking coffee and smoking big cigars. It's a wonder people like that still live and play in a place like Brimstone.",
    effect: "If there are no Heroes with the keyword 'Law' in the Posse and at least one 'Outlaw' Hero, you may attempt a Train Hold Up. Each Hero may attempt an Agility 4+ test. For each 4+ rolled, that Hero gains D3x$50. If any 1s are rolled, there is a confrontation and that hero takes D6 Hits. If more than half the Posse fails this roll, then something gets mucked up, some people die, and each Hero takes D6 Corruption Hits at the needless slaughter of those innocents.",
  },
  {
    roll: 16,
    name: "Prisoner Escape",
    tags: ["Active", "Outlaw"],
    flavor: "A passenger train is passing by the Posse when suddenly, gunfire is heard from one of the train cars. Glass explodes and a man jumps from out of the train car with shackles hanging from his hands. A Lawman leaking blood stumbles out of train attempting a pursuit after him, but he's in no shape to continue.",
    effect: "The Posse may either Heal the Lawman, while the Prisoner escapes, catch the Prisoner while the Lawman bleeds to death, or attempt both.\n\nTo Heal the Lawman — Lore 4+: If successful, all Heroes gain 20 XP for helping out the Lawman. If failed, then all Heroes take D3 Corruption points with no Willpower save.\n\nTo Catch the Prisoner — Agility 4+: If successful, all Heroes gain $100 from the Prisoner's bounty. If failed, then all Heroes take D3 Corruption Points with no Willpower save.\n\nTo Attempt Both — Lore 6+ & Agility 6+ (only two different Heroes may attempt this option): If successful, all Heroes gain 30 XP and $150. If failed, then all Heroes take Corruption Points with no Willpower save.",
  },
  {
    roll: 17,
    name: "Hot Rails to Hell",
    tags: ["Active", "Hell"],
    flavor: "A fiery train comes screaming down the track, fire and brimstone spewing forth from its chimney. The souls of the damned seem to be powering this 'Hell Train' in place of coal, their anguished cries can be heard for miles and miles around.",
    effect: "Each Hero takes Horror Hits at the sight and sound of the Hell Train passing by! Pray that you never find yourselves aboard that cursed locomotive, on its way to deliver it's load of sinners to Heck.",
  },
  {
    roll: 18,
    name: "Energy Surge",
    tags: ["Environment", "Void"],
    flavor: "This rail line has become imbued with some strange energies that crackle and spark. Any living thing that goes near it is struck by a powerful energy streak!",
    effect: "Until the end of the next Adventure, every time the Posse enters a hex on this section of railway (all railway hexes connecting two towns together) then all Heroes in the Posse immediately take D6 Wounds with no Defense from being struck by the powerful energies permeating the railroad tracks.",
  },
  {
    roll: 19,
    name: "Explosion!",
    tags: ["Environment", "Transport"],
    flavor: "You walk along the train tracks, keeping an eye out for anything out of the ordinary. All of a sudden, just behind where the Posse was just walking, the railway explodes! Maybe somebody has it in for you guys...",
    effect: "This section of the railway has been Destroyed. Until the end of your next Adventure, you may not travel by train down this railway to any Towns that would be reached via this section of the railway.",
  },
  {
    roll: 20,
    name: "Local Report",
    tags: ["Active", "Explore"],
    flavor: "A Rail Inspector is walking the line and stops to chat with your group. He's spent some time in the area and saw something no more than a day ago that he thinks you need to watch out for.",
    effect: "Select an adjacent hex and flip over an Exploration Token. If you Search that specific hex on this day, draw the face-up Exploration Token. Otherwise draw from the next face-down Exploration Token for any other hexes that you Search this day. Reshuffle all the Exploration Tokens at the end of the day.",
  },
];
