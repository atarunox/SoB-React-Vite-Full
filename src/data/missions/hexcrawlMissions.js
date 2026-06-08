// HexCrawl Adventure Book — 6 Core HexCrawl Missions

export const HEXCRAWL_MISSIONS = [
  {
    id: 'hexcrawl_1_hive_of_scum_and_villainy',
    name: 'Hive of Scum & Villainy',
    pack: 'HexCrawl Adventure Book',
    packId: 'hexcrawl',
    missionNumber: 1,
    description:
      'While sitting in an old saloon, a disheveled and drunken prospector saddles up next to you and demands that you buy him a drink. He mentions he just came back from the biggest lode of Dark Stone that anyone has seen since Brimstone was around. Unfortunately it seems to have gotten somebody else\'s attention and you see a member of another Gang scurry out of the bar faster than a prairie fire with a tail wind. You buy the drunkard a beer and hurry out to get to the Mine before that other crew gets their filthy hands on that Dark Stone! By the time you get to the Mine, you find fresh tracks leading in to the entrance. You rush in, hoping to beat them to that sweet, sweet Dark Stone!',

    setup:
      'The Mission uses the standard setup and all Heroes start on the Mine Entrance Map Tile as normal.',

    missionLengths: [
      { name: 'Small Deposit',  objective: 'Find 2 Clue Icons' },
      { name: 'Medium Deposit', objective: 'Find 3 Clue Icons' },
      { name: 'Large Deposit',  objective: 'Find 4 Clue Icons' },
    ],

    specialRules: [
      {
        name: 'The Competition',
        text: 'The Darkness marker not only measures the progress of the Darkness in this Mine, but also tracks the progress of the other Gang as they make their way through the Mine searching for the Dark Stone deposit. When the Darkness marker and the Hero marker meet, the two groups come upon each other for the final battle. Even after the two markers meet, you should continue to make Hold Back the Darkness rolls. If the Darkness marker moves onto the space occupied by the Hero marker as a result of a failed HBtD roll or some other means, then the last battle is considered an Ambush and you follow the special Ambush rules for Human Enemies.',
      },
      {
        name: 'Mixed Enemies',
        text: 'Whenever an Attack result is drawn, look at whether the Exploration Token has any Door or Gate Icons. If it has Door Icons, roll on the appropriate Human Threat Chart; if there are any Gate Icons, draw a Threat card as normal.',
      },
      {
        name: 'Final Battle',
        text: 'When the final Clue Icon is found or when the Hero marker and the Darkness marker meet, the Heroes have either found the Dark Stone deposit and the other Gang is in the Objective Room or the Gang has ambushed the Posse. Reveal all Growing Dread cards and begin a fight one Threat Level above their normal Threat Level from the Human Threat Level Tables.',
      },
    ],

    objectives: [
      'Choose Mission Length (Small/Medium/Large Deposit) before the Mission begins.',
      'Find the required number of Clue Icons to reach the Dark Stone deposit before the rival gang does.',
      'When the final Clue Icon is found or Hero and Darkness markers meet: final battle begins at one Threat Level above normal (Human Threat Chart).',
      'Defeat all Enemies to successfully complete the Mission.',
    ],

    reward:
      'For each Clue Icon found, each Hero receives 20 XP and D3 Dark Stone (up to the Mission Length maximum). For each required Clue Icon NOT found before the Final Battle, each Hero\'s reward is reduced by -10 XP and -1 Dark Stone (minimum 0 on both).',

    failure:
      'The other Gang gets all that Dark Stone and unloads it in the nearest Town. That much Dark Stone in one place causes an explosion that has Destroyed D3 Random Buildings and reduced the price of Dark Stone in Town by 50% (rounded down) if you try to sell any.',
  },

  {
    id: 'hexcrawl_2_missing_expedition',
    name: 'Missing Expedition',
    pack: 'HexCrawl Adventure Book',
    packId: 'hexcrawl',
    missionNumber: 2,
    description:
      'A team of archaeologists from some damn-fool university has ventured deep into a Mine in search of tools and artifacts from some long-forgotten era. The team first passed through town weeks ago and nobody has heard a peep out of them since then. A Professor from the university has asked that someone stop by the Mine and do some investigating to see what the team has been up to during that time. Ordinarily you wouldn\'t be bothering yourself with such folks, but when they started talking about a reward, you just couldn\'t help but accept their generous offer.',

    setup:
      'This Mission starts with the Mine Entrance Map Tile leading directly to a Crossroad Map Tile. All Heroes start on the Mine Entrance Map Tile as normal.',

    specialRules: [
      {
        name: 'Abyssal Energy Token',
        text: 'Use a Dark Stone Token or some other marker to represent the Abyssal Energy Token. It begins a number of spaces from the Dark Gate equal to the number of spaces moved by the Darkness marker on the Depth Track and will move forwards 1 space towards the Mine Entrance Map Tile at the start of every turn. If a Hero is ever the same number of spaces to the Mine Entrance Map Tile as the Abyssal Energy Token, that Hero takes D8 Sanity Damage (ignoring Willpower).',
      },
      {
        name: 'Mixed Enemies',
        text: 'Whenever an Attack is called for (Ambush or regular Attack), roll a D6. On a 1, 2, or 3, draw a Threat card as normal. On a 4, 5, or 6, roll on the appropriate Human Threat Chart. Any Humans encountered have been changed by the power emanating from this Mine into mindless drones. Each time a Hero takes one or more Wounds from a Human Enemy\'s Attack, that Hero also takes 1 Corruption Hit (this is 1 Corruption Hit for the whole Enemy Attack, not per Hit).',
      },
      {
        name: 'Puzzle Doors',
        text: 'When Looking Through the Doorway during this Mission, the next Map Tile will not be automatically revealed. Instead, Heroes will need to solve a puzzle to open vault doors between Map Tiles. One Hero must be at the open puzzle connection and another Hero must be positioned at the puzzle connection for the entryway to their current tile. During their Activations, both Heroes must successfully make a Cunning 4+ test on the same turn to reveal the next Map Tile. Do not remove Map Tiles once they have been placed as the Heroes will need to retrace their steps.',
      },
      {
        name: 'Multiple Heroes Required',
        text: 'This Mission requires that multiple Heroes go out on the Mission. A solo Hero may play this Mission, however a Human ally will need to be added to the group. This can be any of the official allies or an Archaeologist may be added (Move 4, Cunning 3, Health 10 Def 5+, Sanity 10 Will 3+, no Combat actions). If the Archaeologist is KO\'d before the Objective Room is discovered, the Mission is KO\'d.',
      },
    ],

    objectives: [
      'Search the Mine to find and collect 5 Lost Journal Pages. Every Clue Icon found represents D3 Lost Journal Pages in that Room.',
      'Once all Encounters/Attacks are resolved, those Lost Journal Pages are collected.',
      'When the 5th Journal Page set is discovered: Ignore Attacks/Encounters on the final token; Objective Room has only one exit — a Dark Gate (a Gate End Cap). Heroes may not move through the Dark Gate.',
      'Place the Abyssal Energy Token a number of spaces from the Dark Gate equal to the number of spaces moved by the Darkness marker.',
      'Reveal all Growing Dread cards, then face an Epic Threat. Heroes need not kill every Enemy — they must escape back to the Mine Entrance Starting Area.',
      'Mission fails if any Heroes do not escape before the Abyssal Energy Token reaches the Mine Entrance Starting Area.',
    ],

    reward: 'Each Hero receives 25 XP and may draw a card from the Mine Artifact deck.',

    failure:
      'The Darkness that was unleashed by the expedition escapes the Mine and drives all nearby Towns insane. The nearest 3 Towns to the Mine are Destroyed. If not playing with the HexCrawl Overland map, the Heroes may not visit a Frontier Town, but instead must proceed directly on to the next Adventure.',
  },

  {
    id: 'hexcrawl_3_hostages',
    name: 'Hostages',
    pack: 'HexCrawl Adventure Book',
    packId: 'hexcrawl',
    missionNumber: 3,
    description:
      'A gang of robbers went on a crime spree and have holed themselves up in their hideout, but they\'ve taken some pretty important hostages on their way in there and someone needs to go in and rescue them innocents. Being that you\'re the toughest sumsabitches in the area, you\'ve been elected for that prestigious honor and most important job. Don\'t mess it up.',

    setup:
      'This Mission uses the standard set up and all Heroes start on the Mine Entrance Map Tile as normal.',

    missionLengths: [
      { name: 'Short',  objective: '5 Hostages taken' },
      { name: 'Medium', objective: '7 Hostages taken' },
      { name: 'Long',   objective: '9 Hostages taken' },
    ],

    specialRules: [
      {
        name: 'Deadly Countdown',
        text: 'The Depth Track operates a little differently. The Posse still makes HBtD rolls each turn, but whenever the Darkness marker passes or lands on a blood spatter space, it signifies that one of the Hostages has been killed — you do NOT draw a Darkness card.',
      },
      {
        name: 'Hostages',
        text: 'Whenever the Heroes come across a Clue Icon, ignore its normal result and instead roll a Human Threat at the Posse\'s level. Also place D3+1 Hostage Tokens or Models with the Enemies (or as many Hostages as are left in the Mission), placed last and in front of the Enemies when possible. Any Gun shots or Melee attacks by Heroes that are missed with a roll of \'1\' when the target is within 1 space of the Hostage, will Hit a Hostage instead. Hostages have Health 5, Defense 0.',
      },
      {
        name: 'Immediate Dread',
        text: 'Growing Dread cards are revealed immediately when drawn rather than being placed on the stack.',
      },
      {
        name: 'Human Enemies',
        text: 'Heroes will mostly encounter Human Enemies. Whenever directed to draw a Threat card, instead roll on the Human Threat Chart based on number of Heroes.',
      },
      {
        name: 'No Gates',
        text: 'No Gates can be found in this Mission. Any time a Gate would be placed, instead place a normal Door.',
      },
      {
        name: 'Stealth',
        text: 'If any of the Heroes fires a Gun during this Mission, there\'s a chance it will alert some of the robbers. Whenever a Hero shoots a Gun weapon, roll a D6. On a 1, a Hostage somewhere else in the Mines has been killed. Only roll when the Heroes fire Guns, not the robbers.',
      },
    ],

    objectives: [
      'Choose Mission Length (Short/Medium/Long) before the Mission begins.',
      'The Heroes are trying to bring back as many Hostages alive as possible.',
      'Mission is over when all Hostages are either rescued or killed AND all revealed Enemies on the board are eliminated.',
      'If by the end of the Mission the Heroes have rescued fewer Hostages than have been killed, the Mission is failed regardless of performance.',
    ],

    reward:
      'For rescuing most of the Hostages: each Hero gains (10 XP + $25) × the number of Hostages rescued alive, and each Hero may draw one Loot card.',

    failure:
      'For allowing a blood bath to unfold on their watch, each Hero loses one permanent Sanity and takes D6 Corruption Points, ignoring Willpower.',
  },

  {
    id: 'hexcrawl_4_down_on_the_bayou',
    name: 'Down on the Bayou',
    pack: 'HexCrawl Adventure Book',
    packId: 'hexcrawl',
    missionNumber: 4,
    description:
      '[Requires Swamps of Death] You\'ve trekked far into the Swamps of Jargono in search of somethin\' that didn\'t turn out to be much of nothin\'. And then the rain started. So you holed yourselves up in an ancient temple til the rainin\' stopped. Now you\'re ready to leave, but trouble is the dang whole place is so flooded over that you can\'t just walk back. Luckily there\'s an old dock and a rickety old boat nearby that you can use to get around. Now to just find your way out of here.',

    setup:
      'This Mission starts on the Swamps of Jargono side of the Mine Entrance Map Tile with an End Cap covering the connection. Place the Boat Tile adjacent to the End Cap. Other than beginning the game in the Swamps of Jargono, all Heroes start on the Mine Entrance Map Tile as normal.',

    specialRules: [
      {
        name: 'Immediate Dread',
        text: 'Growing Dread cards are revealed immediately when drawn rather than being placed on the stack.',
      },
      {
        name: 'Flyers Off the Map',
        text: 'Enemies with the ability \'Flight\' need not end their Movement on a space on a Map Tile. Instead, they may go "off the board" and any number of them may be considered adjacent to any figures that are on the edge of a Map Tile. Enemies with \'Flight\' may also attack Heroes on the Boat Tile.',
      },
      {
        name: 'No Looking Through the Door',
        text: 'There are no direct connections from one room to the next; instead, any time a Map Tile is placed, place end caps on all the puzzle connections. The only way the Heroes can travel between the Map Tiles is by using the Boat Tile.',
      },
      {
        name: 'Boat Travel',
        text: 'The Boat can only hold three Heroes at a time and at least one Hero is needed in the Boat for it to be moved anywhere. Any Hero on the Boat can move it during their Activation for 1 Move to travel to any other End Cap Map Tile that has been revealed. To get on or off the Boat, a Hero must spend the rest of their Movement and there must be a free space on either the Boat or an adjacent End Cap Map Tile.',
      },
      {
        name: 'Searching the Bayou',
        text: 'Heroes may spend their Activation to Search the Bayou: draw a Map card and place its Map Tile on the board with an Exploration Token. That Exploration Token is not revealed until a Hero exits the Boat onto one of its connected End Cap Map Tiles. Advanced Encounters do not occur until after the Exploration Token is revealed. Searching the Bayou replaces the Looking Through the Door action.',
      },
      {
        name: 'Lay of the Land (Objective)',
        text: 'After a Hero has Scavenged a Map Tile and there are no Enemies on the Map Tile, they may spend their Activation getting the Lay of the Land by rolling a Peril die and placing a Lay of the Land marker on that Map Tile (once per Map Tile). If the number rolled is equal to or less than the number of times they have already made Lay of the Land rolls (ignoring the Swamp Entrance Map Tile), then that Hero has found a way forward that leads to a Gate back to Earth. Immediately after any Lay of the Land roll, roll a D6. On a \'1\', any Heroes on that Map Tile are Ambushed by an Epic Threat.',
      },
    ],

    objectives: [
      'Heroes must navigate the flooded bayou by Boat to find Lay of the Land landmarks.',
      'To complete the Mission: successfully get a Lay of the Land roll AND defeat all remaining Enemies on that Map Tile. All Heroes must be on the same Map Tile.',
    ],

    reward:
      'Each Hero receives 30 XP and either finds enough trinkets valued at $75 × the number of Lay of the Land markers on the board, or may draw a Jargono Artifact card. Each Hero may choose their Reward differently.',

    failure:
      'The Heroes are lost in the Swamps of Jargono for D6 D6 days before they eventually get their bearings and find a Gate back to Earth. Each Hero takes D6 D6 Wounds and the Posse must immediately begin an Escape Mission before they are able to visit another Town.',
  },

  {
    id: 'hexcrawl_5_race_against_time',
    name: 'Race Against Time!',
    pack: 'HexCrawl Adventure Book',
    packId: 'hexcrawl',
    missionNumber: 5,
    description:
      'This whole mine is pretty unstable and is just as like to start falling down around you! You don\'t have much time to get what you came here for and get the hell outta this mine. If you can\'t find that thing in there in time, you lose the treasure and very likes you might lose some limbs in the process too!',

    setup:
      'This Mission starts with the Mine Entrance Map Tile leading directly to a T-Junction Map Tile. All Heroes start on the T-Junction Map Tile and may be placed in any spaces they like that are not also on the Mine Entrance Map Tile.',

    specialRules: [
      {
        name: 'Immediate Dread',
        text: 'Growing Dread cards are revealed immediately when drawn rather than being placed on the stack.',
      },
      {
        name: 'May Not Flee',
        text: 'Once the Adventure begins, the Heroes may not Flee; they are on the clock and the Mission is not successfully completed until all Heroes make it to the Mine Entrance Starting Area.',
      },
      {
        name: 'Unstable Mine',
        text: 'The Depth Track works differently in this Mission and is used as a timer to track the deterioration of the Mine around the Heroes. The Darkness marker automatically moves one space every turn regardless of whether the Posse makes their HBtD test or not. The normal HBtD tests are only used to check for Depth Events.',
      },
      {
        name: 'No Gates',
        text: 'No Gates can be found in this Mission. Any time a Gate would be placed, instead place a normal Door.',
      },
      {
        name: 'McGuffin (Objective)',
        text: 'The Heroes may not discover the McGuffin if they have already triggered the Treacherous Escape Special Rule. Anytime the Heroes find a Clue Icon on an Exploration Token, they may declare that they have discovered the McGuffin and all Heroes must now reach the Mine Entrance Starting Area to successfully complete the Mission. Locating the McGuffin is not actually required to complete the Mission, but finding it does influence the Reward the Posse can claim.',
      },
      {
        name: 'Treacherous Escape (Objective)',
        text: 'At the end of any turn in which one or more Heroes is standing on the Mine Entrance Map Tile, roll a special HBtD test (ignore Depth Events). If the test is successful, the coast is clear and the Heroes are able to hightail it out of there if they all reach the Mine Entrance Starting Area. If failed, the Darkness marker is not moved, but instead there is an Epic Threat waiting for the Posse attempting to block your escape! Heroes may not explore any more Rooms or discover the McGuffin once they have triggered the Treacherous Escape Special Rule.',
      },
    ],

    objectives: [
      'The Heroes are looking for a McGuffin — declare discovery when you find a Clue Icon.',
      'Once the McGuffin is found (or Treacherous Escape is triggered), all Heroes must reach the Mine Entrance Starting Area.',
      'The Darkness marker advances automatically every turn regardless of HBtD rolls.',
      'When Heroes are on the Mine Entrance Map Tile: roll HBtD (no Depth Events). Success = clear escape. Failure = Epic Threat blocks your way.',
    ],

    reward:
      'Each Hero receives (5 XP and $50) × the number of steps on the Depth Track the Hero Posse marker is from the Mine Entrance space. In addition, if the Heroes discovered the McGuffin and all Heroes made it back to the Mine Entrance Starting Area before the Darkness marker reaches the Mine Entrance on the Depth Track, roll a Peril die. If the number rolled is equal to or less than the number of spaces the Hero Posse marker is from the Mine Entrance space, each Hero may draw a Mine Artifact card.',

    failure:
      'Each Hero must discard a number of Gear or Artifact cards with a total listed Gold value of at least $200 as they are lost in their frantic dash to make it out of the Mine. Any Hero that cannot discard enough Gear or Artifacts like this instead loses one permanent Health and rolls once on the Injury Chart.',
  },

  {
    id: 'hexcrawl_6_confrontation',
    name: 'Confrontation!',
    pack: 'HexCrawl Adventure Book',
    packId: 'hexcrawl',
    missionNumber: 6,
    description:
      'This is it, you\'ve come to the lair of a great supernatural evil, hoping beyond hope that you\'ll be able to put an end to this menace for good. Chances are most of you won\'t live to see this through to the end, but by golly at least you tried.',

    setup:
      'This Mission starts with the Mine Entrance Map Tile leading directly to a Crossroad Map Tile. All Heroes start on the Mine Entrance Map Tile as normal. You will also need either The Big Room Mine Map Tile or The Devil\'s Pit Mine Map Tile (choose one) — remove the corresponding Map Card from the Mine Map Deck. Whichever room is chosen will be the Objective Room. Decide on a Boss Enemy for the Final Battle (Beli\'al is the suggested XXL Enemy, but any thematic Enemy works). This Mission can be used to end a Campaign on an Epic note, or played as a regular Mission.',

    specialRules: [
      {
        name: 'Permadeath',
        text: 'Heroes are not simply KO\'d on this Mission. If a Hero is reduced to 0 Sanity or 0 Health and you are out of Revive Tokens, they are permanently Dead (though may be resurrected later if just a regular Mission).',
      },
      {
        name: 'Despair',
        text: 'Though the Heroes have made it far, they know that they\'re surrounded by evil on all sides and that they may very well die on this last Mission. All Heroes are -1 to their Initiative and all of their Willpower rolls (minimum of 1).',
      },
      {
        name: 'Dimensional Nexus',
        text: 'Void energies threaten to tear apart the very fabric of reality! When revealing Exploration Tokens, Door and Gate Icons are swapped — Door Icons are actually Gates and Gate Icons are actually Doors. Draw a new World card whenever a Hero looks through a Gate. The Posse may pass through multiple Gates to multiple Other Worlds at many different places.',
      },
      {
        name: 'Ultimate Corruption',
        text: 'This place has become the ultimate den of filth and corruption. With each step the Heroes take further into this heart of Darkness, the Heroes can feel their humanity being stripped away via some terrible energy. Whenever either the Hero marker or Darkness marker advances on the Depth Track, all Heroes should roll for Corruption as they would at the end of a normal Adventure. Roll a D6 for each Dark Stone, item with a Dark Stone icon, or Dark Stone upgrade the Hero is carrying. For every 1, 2, or 3 rolled, take 1 Corruption Hit.',
      },
    ],

    objectives: [
      'Find 5 Clue Icons to reveal the Objective Room (The Big Room or The Devil\'s Pit).',
      'Once the Objective Room is attached to the board: Reveal all Growing Dread cards in the stack.',
      'Face an Epic Threat in addition to the Boss Enemy.',
      'At the start of each turn draw a Low Threat card and use the Objective Room Map Card to determine which Gate those Enemies enter through.',
      'All open puzzle connections of the Objective Room are connected to Gates — Heroes may not travel through any of the other Gates.',
    ],

    heroScaling: [
      { heroes: 'Mission', text: 'Each Hero receives 100 XP and may draw an Artifact card from a Random Other World.' },
      { heroes: 'Campaign', text: 'Campaign is successful! Choose a Town and a Town Location for each Hero. In any future campaigns, Heroes visiting those Town Locations in those specific Towns get +1 to Location Event rolls.' },
    ],

    reward:
      'Mission: Each Hero receives 100 XP and may draw an Artifact card from a Random Other World.',

    failure:
      'Mission: Whatever supernatural menace the Heroes were facing escapes into the surrounding countryside and goes on a rampage, Destroying all nearby Towns (D3 nearest Towns if playing HexCrawl). The Heroes may not visit a Frontier Town, but must instead proceed directly on to the next Adventure. Campaign Failure: The Campaign comes to a terrifying conclusion. Heroes are despised by their fellow people. Humanity is hunted to the point of extinction by otherworldly abominations.',
  },
];

export default HEXCRAWL_MISSIONS;
