// Road Terrain Encounters — D20 table
// Source: HexCrawl Encounters Book v1.0, pp. 50–51
// Road terrain must include a Road going over any other kind of terrain.

export const roadEncounters = [
  {
    roll: 1,
    name: "Medical Attention",
    tags: ["Active", "Merchant"],
    flavor: "A Doctor on his way to cover his rounds for folks out in the wilderness, slowly rides towards the Posse, his journey taking him in the opposite direction. He notices the state of the group and asks if there's anything he can do to help.",
    effect: "You may pay for Medical Attention actions from this Doctor as if you were at a Doc's Office (do not roll for Location Events).",
  },
  {
    roll: 2,
    name: "Torrential Rains",
    tags: ["Active", "Movement"],
    flavor: "The blowing sheets of rain wet your bones through and through. This freak storm came out of nowhere, but it's been unrelenting and there doesn't seem to be any cover that the Posse can see. The road is becoming flooded and you don't think you'll be able to travel very easily while this downpour continues.",
    effect: "For the rest of the day, treat all Roads and Railroad tracks as Tough terrain instead of Easy terrain.",
  },
  {
    roll: 3,
    name: "The Settlers",
    tags: ["Active", "Settlement"],
    flavor: "The Posse comes across a small wagon train looking to make a settlement. Having heard rumors about free land for anyone that will settle it, they have packed up all their belongings and starting a new life on the frontier.",
    effect: "The Settlers ask you for an escort. If the Posse travels with them, at a pace of 4 MP per day to one of the edges of the map, each Hero gains 20 XP and $50.",
  },
  {
    roll: 4,
    name: "Circle the Wagons",
    tags: ["Active", "Tribal"],
    flavor: "The Posse barely manages to take up defensive positions within a circle of homesteading wagons after coming across a pack of Stranglers. The homesteaders here have been massacred, but you don't seem to be alone. A group of Indian Braves have also ended up here and are helping to hold back the fiends.",
    test: {
      options: [
        { stat: "Strength", target: "5+" },
        { stat: "Agility", target: "5+" }
      ],
      effect: "For each 6 rolled, an Indian Brave is spared. If successful, then the Posse and the Indians have managed to hold back the Stranglers until help arrives and drive the Stranglers off, each Hero gains 30 XP. If at least 3+ Indian Braves are spared, then these Indians recount your bravery in the face of overwhelming numbers and each Hero that doesn't have the keyword 'Tribal' or 'Paleface' gains the keyword 'Kemosabe'. If a Hero has the keyword 'Paleface', then they lose that keyword instead. If the Posse fails, then each Hero takes D8 Wounds before they're able to escape, leaving the Indian Braves to their deaths. Each Hero that does not have the keyword 'Tribal' or 'Kemosabe' gains the keyword 'Paleface'. If a Hero has the keyword 'Kemosabe', then they lose that keyword instead."
    },
  },
  {
    roll: 5,
    name: "Well Worn Wheel",
    tags: ["Active", "Stranger"],
    flavor: "A stage coach has thrown a wheel and one of the passengers has suffered a severe wound to the head. If the Posse can lend aid they will be most appreciative.",
    effect: "Any Heroes that wants to may give up a Bandage or any other Wound-Healing Side Bag Tokens, then chooses from the following rewards: $50, a Whiskey Side Bag Token, or recover 1 Grit. Each Hero may only donate a single Side Bag Token for a reward. If nobody donates anything, each Hero in the Posse takes D3 Corruption Hits.",
  },
  {
    roll: 6,
    name: "Pony Express Plea",
    tags: ["Active", "Deliver"],
    flavor: "The Posse come upon a Pony Express rider whose swollen leg is corrupt with gangrene. The tip of a broken arrow can be seen. He asks the Posse to deliver the mail that he carries in his place.",
    effect: "Roll on the Town Chart. If the Posse travels to that Town and delivers the mail within 3 days, each Hero in the Posse gains 20 XP and $50 each.",
  },
  {
    roll: 7,
    name: "Stage Coach Mystery",
    tags: ["Active", "Blood"],
    flavor: "Bloodied bodies hang from the windows and drape the stage coach reins. The horses are exhausted with fright and bring the stage to a halt in front of the Posse. Something doesn't seem right about the situation.",
    test: { stat: "Cunning", target: "5+",
      success: ["Each Hero that passes this test uncovers the mystery and immediately takes D8 Horror Hits at the sudden realization of what happened on that stage coach. Any Hero that rolls a 1, also rolls on the Madness Chart and gains a Madness. The details of the stage coach mystery are so horrific as to be beyond human understanding, let alone the written word."]
    },
  },
  {
    roll: 8,
    name: "Bleeding Justice",
    tags: ["Stranger"],
    flavor: "A US Marshal, tired and dusty, is approaching from the opposite direction. He has a gunshot wound and is demanding help from you in the name of the US Government.",
    effect: "Stop all movement for the day. If there are any 'Law' Heroes in the group, the Posse must collectively give up 3 Bandages or other Wound-Healing Side Bag Tokens to Heal the US Marshal. Otherwise, it is optional. If they don't have enough or don't give, then Heroes with the keyword 'Law' take D6 Corruption Points, ignoring Willpower, as they watch him die. All other Heroes without the keyword 'Law' or 'Outlaw' instead take D3 Corruption Points with no Willpower save. 'Outlaw' Heroes are unaffected (but must still give up Side Bag Tokens if 'Law' Heroes are present). If the US Marshal is Healed, then each Hero that participated gains 20 XP and recovers 1 Grit for helping to nurse him back to health.",
  },
  {
    roll: 9,
    name: "Highwaymen",
    tags: ["Tight"],
    flavor: "The man bows with an exaggerated sweep. His ragged dirty gang members only scowl. He kindly asks that you relieve yourself of material burdens, for others have greater need of it, and they won't be much use to you if you were to die.",
    effect: "Ambush — Roll for a Human Threat at the Posse's level.",
  },
  {
    roll: 10,
    name: "Nerves on Edge",
    tags: ["Active", "Stranger"],
    flavor: "A stage coach flanked by well-armed men all around it proceeds cautiously down the road. The men seem to be expecting trouble and one wrong move could provoke an altercation, especially with how heavily armed your group is.",
    effect: "All the players gather in a circle looking at each other. In unison, all players count from 1 to 30. The first player to blink during this time has caused some kind of misunderstanding. Their Hero gets shot and immediately takes Wounds, all other Heroes take Hits in the resulting shootout. All Heroes gain 10 XP. If all players manage to not blink, the stage coach passes by without incident and all Heroes instead gain 20 XP.",
  },
  {
    roll: 11,
    name: "Rambling Whispers",
    tags: ["Stranger"],
    flavor: "A man dressed in a bloody coat meanders past you on the road, mumbling under his breath. You watch as he stumbles past and seems to disappear into the air. What did you just see?",
    effect: "Nothing eventful happens.",
  },
  {
    roll: 12,
    name: "Circuit Preacher",
    tags: ["Stranger", "Holy"],
    flavor: "A one horse buggy pulls along side the Posse, and a black clad preacher asks if he might accompany you until the next town. He has heard rumors that a town is without a Preacher and he seeks to bring them the Word.",
    effect: "Until you enter the next Town, the Preacher counts as a member of the Posse with the keyword 'Holy'. The Preacher will also grant 1 Random Hero a temporary Aura of Endurance during any overland Fights that occur while he travels with you. This Aura only lasts the duration of the Fight and the Preacher himself does not participate in Fights.",
  },
  {
    roll: 13,
    name: "Black Blessings",
    tags: ["Environment", "Void"],
    flavor: "At this crossroads, a statue of eerie and unsettling aspect has been erected. It resembles a robed death, a bent crone, and some kind of snaky tentacle creature, all rolled into one hunched form. Someone has left for this strange waygod an offering of a raw haunch of deer, dry and odorous and pecked by birds but new enough to be untouched by wolves or other creatures.",
    effect: "Any Heroes may give up Side Bag Tokens as an offering to the statue, then roll 2D6 once on the table. For each additional Token offered beyond the first, add +1 to the roll. Otherwise, nothing happens if no offering is made.",
    table: [
      { roll: "1-4", text: "The hunched form was apparently angered by your meager gift as leeches begin to rain from the sky all around you. Each Hero suffers Wounds, ignoring Defense, and each Hero rolls a D6, on a 1 or 2, that Hero's horse has been bled to death by the leeches." },
      { roll: "5-10", text: "The curious figure takes no notice of your meager offering. Consider his apathy to be a blessing." },
      { roll: "11-12+", text: "The strange waygod appears to have been most pleased by your offering. Each Hero that contributed something may choose to have any one Mutation, Madness or Injury permanently Healed." },
    ],
  },
  {
    roll: 14,
    name: "Where the Deer and the Antelope Play",
    tags: ["Active", "Camp"],
    flavor: "A cadre of cowboys are gathered around a makeshift camp, resting, talking, playing songs, and they invite you to sit awhile with them and pass the time. The sight of so many friendly faces almost makes you forget about the trials and tribulations you've seen out on the road.",
    effect: "Stop all movement for the day as you settle in with the cowboys. Each Hero may choose one activity to perform and rolls a Skill Test: Sing a song (Spirit), Tell a Story (Lore), Play a Game of Cards (Luck), Drink some Whiskey (Strength), Tell some off-color Jokes (Cunning), Play the Knife game (Agility). For each 6 rolled, gain 20 XP. For each 1 rolled, take 1 Hit (D3 Damage) as either your chosen activity takes a turn for the worst or somebody takes offense and gives you a punch in the face.",
  },
  {
    roll: 15,
    name: "Godforsaken Efficiency",
    tags: ["Active", "Blood"],
    flavor: "The road here is lined with rows of burned out houses, with corpses stacked high. Their spines have been broken and they've been stacked neatly.",
    effect: "Each Hero takes Horror Hits as you recoil at the terrible efficiency of the scene around you. Something went through a lot of trouble to horribly mutilate these corpses, yet neatly stack them along the roadside.",
  },
  {
    roll: 16,
    name: "Dust on the Horizon",
    tags: ["Environment", "Strange"],
    flavor: "Something off in the distance is approaching the Posse at a tremendous speed, so much so that it's kicking up a storm of dust all around it.",
    test: { stat: "Agility", target: "6+",
      fail: ["That Hero gains 10 XP and is thrown from their horse and suffers Wounds with no defense and rolls a D6. On a result of 1 or 2, their Transport item is Killed or Destroyed by the speeding thing."],
      success: ["Those that succeed at their Agility test gain 20 XP, but otherwise suffer no ill effects apart from a new-found healthy paranoia of high-speed objects."]
    },
  },
  {
    roll: 17,
    name: "Charming Figure",
    tags: ["Stranger", "Charm"],
    flavor: "A masked figure is riding hell-bent for leather towards you. As they come to a stop in front of you, they take off their bandanna to reveal an attractive face. One of the Heroes catches their eye and they ride up next to them, their tasty intentions made blatantly obvious with their flirtations.",
    effect: "The Hero with the highest Initiative is approached by this ravishing Rider (choose one at random if tied for highest). For each Corruption Point on the Hero, they must make a Willpower save. If more than half of their saves are successful, they have no Corruption, they resist the Rider's charms and the Rider simply leaves with a kiss. Otherwise, if not, the Rider leaves with a kiss and D3x$50 that they picked from your pocket while you were distracted!",
  },
  {
    roll: 18,
    name: "One Last Drink",
    tags: ["Active", "Stranger"],
    flavor: "A bruised and bleeding man is reaching for a bottle of some greenish, glowing liquid, but he can't quite reach it and doesn't have the strength to get it to it. He whispers some desperate, unintelligible words to you, asking for a drink.",
    effect: "A Random Hero may decide to assist the dying man to take a drink of the greenish liquid before he dies. If the Hero decides not to help him drink the liquid, the man collapses and dies with his last dying wish unfulfilled. That Hero takes D3 Corruption Hits for denying a man his last wish. If the Hero helps him, the man drinks and then mutates into some bizarre gooey substance and slinks away, leaving $100, but each Hero takes D6 Horror Hits at the sight of all this.",
  },
  {
    roll: 19,
    name: "Opium Dreams",
    tags: ["Stranger"],
    flavor: "A group of caravan traders has stopped by the side of the road. They nod politely as you approach, sitting in a circle and smoking a hookah.",
    effect: "Those Heroes that want to may stop and smoke with the caravanners. Each Hero that smokes up rolls a D6. If the number rolled is less than the total number of Madnesses that a Hero has, they may remove one of those Madnesses. Otherwise if it is equal to or greater than the number of Madnesses they currently have, roll on the Madness Chart instead.",
  },
  {
    roll: 20,
    name: "Local Update",
    tags: ["Active", "Explore"],
    flavor: "A cavalry officer and some troops are returning from a sortie with a pack of Void things. They saw something else and tell you what you can expect to find.",
    effect: "Select an adjacent hex and flip over an Exploration Token. If you Search that specific hex on this day, draw the face-up Exploration Token. Otherwise draw from the next face-down Exploration Token for any other hexes that you Search this day. Reshuffle all the Exploration Tokens at the end of the day.",
  },
];
