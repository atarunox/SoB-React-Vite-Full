
export const DARKNESS_CARDS = [
  {
    name: "Occult Offering",
    tags: ["Darkness", "Ritual", "Dread"],
    effect: "Discard all other Darkness cards currently in play. For each card discarded, draw a Growing Dread card and add it to the stack.",
    remainsInPlay: false
  },
  {
    name: "Legions of the Damned",
    tags: ["Darkness", "Boost", "Soldier"],
    effect: "All Soldier Enemies are now +1 Initiative and +2 Health.",
    remainsInPlay: true,
    statModifiers: { keywordFilter: "Soldier", effects: { initiative: 1, health: 2 } }
  },
  {
    name: "Hunted Through the Void",
    tags: ["Darkness", "Void", "Hounds"],
    effect: "Every Hero takes 3 Horror Hits. One Random Hero also takes 6 Hits that do 2 Damage each.",
    remainsInPlay: false
  },
  {
    name: "Unknown Frontier",
    tags: ["Darkness", "Insanity"],
    effect: "Whenever the Hero Posse marker enters a Blood Spatter space on the Depth Track, every Hero currently in an OtherWorld takes 3 Horror Hits.",
    remainsInPlay: true
  },
  {
    name: "Fanatical Followers",
    tags: ["Darkness", "Boost", "Fanatic"],
    effect: "All Fanatic Enemies gain Tough (Immune to Critical Hits).",
    remainsInPlay: true
  },
  {
    name: "Sinister Legions",
    tags: ["Darkness", "Boost", "Construct"],
    effect: "All Construct Enemies are +1 Combat and +1 Defense. All Enemies on the next Threat Card drawn gain the Keyword Construct.",
    remainsInPlay: true,
    statModifiers: { keywordFilter: "Construct", effects: { combat: 1, defense: 1 } }
  },
  {
    name: "Chill of the Grave",
    tags: ["Darkness", "Boost", "Undead"],
    effect: "All Undead Enemies are now +1 Initiative and +1 Combat.",
    remainsInPlay: true,
    statModifiers: { keywordFilter: "Undead", effects: { initiative: 1, combat: 1 } }
  },
  {
    name: "Power of the Void",
    tags: ["Darkness", "Boost", "Void"],
    effect: "All Void Enemies are now +1 Combat.",
    remainsInPlay: true,
    statModifiers: { keywordFilter: "Void", effects: { combat: 1 } }
  },
  {
    name: "“Do you hear that?”",
    tags: ["Darkness", "Dread"],
    effect: "Add a Growing Dread card to the stack. Then, every Hero takes 1 Horror Hit for each Growing Dread card in the stack and discards 1 Grit. These Horror Hits do 2 Sanity Damage.",
    remainsInPlay: false
  },
  {
    name: "Savage Attack",
    tags: ["Darkness"],
    effect: "During the next Fight, all Enemies are -1 Defense but gain +2 Combat/Shots for their Attacks. If drawn during a Fight, this goes into effect immediately.",
    remainsInPlay: true,
    statModifiers: { keywordFilter: "__ALL__", effects: { defense: -1, combat: 2 } }
  },
  {
    name: "Lost in the Cosmos",
    tags: ["Darkness", "Insanity"],
    effect: "Count the number of Growing Dread cards in the stack and discard pile. Each Hero immediately takes Horror Hits equal to the total. Each of these Horror Hits does Sanity Damage equal to your Hero Level.",
    remainsInPlay: false
  },
  {
    name: "Demonic Speed",
    tags: ["Darkness", "Boost", "Demon"],
    effect: "All Demon Enemies are now +1 Initiative and +2 Move.",
    remainsInPlay: true,
    statModifiers: { keywordFilter: "Demon", effects: { initiative: 1, move: 2 } }
  },
  {
    name: "Swarm of Rats",
    tags: ["Darkness", "Animal", "Swarm"],
    effect: "Each Hero takes 2 Corruption Hits, gains 20XP, and must then pass an Agility 4+ test or discard 1 Side Bag Token.",
    remainsInPlay: false
  },
  {
    name: "The Dark Omen",
    tags: ["Darkness", "Omen"],
    effect: "The Darkness immediately moves 1 step forward on the Depth Track. Each Hero gains 20XP and may recover 1 Grit.",
    remainsInPlay: false
  },
  {
    name: "Wanted Men",
    tags: ["Darkness", "Boost", "Outlaw"],
    effect: "All Outlaw Enemies are +2 Health and +1 Damage with their Attacks. All Enemies on the next Threat Card drawn gain the Keyword Outlaw.",
    remainsInPlay: true,
    statModifiers: { keywordFilter: "Outlaw", effects: { health: 2, damage: 1 } }
  },
  {
    name: "Dark Possession",
    tags: ["Darkness", "Boost", "Demon"],
    effect: "Any time a Hero takes 1 or more Wounds from Demon Enemies during a turn, they also take 1 Corruption Hit.",
    remainsInPlay: true
  },
  {
    name: "The Wild West",
    tags: ["Darkness", "Town"],
    effect: "At the start of the next Town Stay after this Adventure, roll once on the Town Event Chart before the first Day begins.",
    remainsInPlay: true
  },
  {
    name: "Animal Savagery",
    tags: ["Darkness", "Boost", "Beast"],
    effect: "All Beast Enemies gain an extra +2 Combat for each To Hit roll of 6+ they roll during an attack.",
    remainsInPlay: true
  },
  {
    name: "Shifty Eyes",
    tags: ["Darkness", "Dread", "Treachery"],
    effect: "Select 1 Random Ally (Basic/Advanced) and roll a D6. On the roll of 1 or 2, he betrays you and runs off. Add a Growing Dread card to the stack. If no Allies, instead add D3 Growing Dread cards to the stack.",
    remainsInPlay: false
  },
  {
    name: "Cold Death",
    tags: ["Darkness", "Cold", "Death"],
    effect: "For each Wound a Hero currently has on him, he immediately takes another Wound, ignoring Defense. Then do the same for Sanity Damage, ignoring Willpower.",
    remainsInPlay: false
  },
  {
    name: "End of the Line",
    tags: ["Darkness", "Town", "Wanted"],
    effect: "If the current Mission is Failed, every Hero gains the Wanted status, as you are being hunted by the law.",
    remainsInPlay: true
  },
  {
    name: "Fueled by Rage",
    tags: ["Darkness", "Boost"],
    effect: "All Enemies are +1 Combat while they have one or more Wounds on them.",
    remainsInPlay: true
  },
  {
    name: "A Bitter Harvest",
    tags: ["Darkness", "Harvesters from Beyond"],
    effect: "Every Hero must roll a D6 for each Side Bag Token they have. On the roll of 1 or 2, discard that Token. For each Hero that discarded 1 or more Tokens, move the Darkness forward 1 space on the Depth Track.",
    remainsInPlay: false
  },
  {
    name: "Tentacles from the Void",
    tags: ["Darkness", "Attack"],
    effect: "Ambush Attack! D6 Tentacles",
    remainsInPlay: false
  },
  {
    name: "Relentless Assault",
    tags: ["Darkness", "Boost", "Tribal"],
    effect: "All Tribal Enemies are +1 Combat and +1 Initiative.",
    remainsInPlay: true,
    statModifiers: { keywordFilter: "Tribal", effects: { combat: 1, initiative: 1 } }
  },
  {
    name: "In the Shadow of Darkness",
    tags: ["Darkness"],
    effect: "While the Hero Posse marker is below the Darkness marker on the Depth Track, all Enemies gain +2 Health and +1 Damage with their Attacks.",
    remainsInPlay: true,
    statModifiers: { keywordFilter: "__ALL__", effects: { health: 2, damage: 1 } }
  },
  {
    name: "Hopeless",
    tags: ["Darkness"],
    effect: "Every Hero takes a number of Horror Hits equal to their Hero Level, that do 4 Sanity Damage each.",
    remainsInPlay: false
  },
  {
    name: "Shadow of Death",
    tags: ["Darkness", "Dread", "Death"],
    effect: "Every Hero must make a Spirit 5+ test. If failed, draw a Growing Dread card and add it to the stack.",
    remainsInPlay: false
  },
  {
    name: "Eyes in the Dark",
    tags: ["Darkness", "Insanity"],
    effect: "Any time a Hero Recovers one or more Grit, they also take 1 Corruption Hit.",
    remainsInPlay: true
  },
  {
    name: "Shadow’s Reach",
    tags: ["Darkness", "Ancient", "Betrayal"],
    effect: "The Hero with the highest Spirit, and at least 1 Dark Stone Shard, stares off into the darkness as they are tempted by the Shadow King’s influence. Make a Spirit 6+ test. For each roll that is not a 6, take 1 Corruption Hit. If you fail, gain 1 Mutation from this result. Roll D3 times on the Madness table.",
    remainsInPlay: false
  },
  {
    name: "Forces Beyond Control",
    tags: ["Darkness", "Ritual"],
    effect: "Immediately draw and play one Darkness card for each Hero in the Posse.",
    remainsInPlay: false
  },
  {
    name: "Restless Dead",
    tags: ["Darkness", "Boost", "Undead"],
    effect: "All Undead Enemies are now +1 Initiative and +2 Move.",
    remainsInPlay: true,
    statModifiers: { keywordFilter: "Undead", effects: { initiative: 1, move: 2 } }
  },
  {
    name: "Hell Siege",
    tags: ["Darkness", "Hell"],
    effect: "Any time a 7 is rolled for the Hold Back the Darkness roll, you must choose: Add a Growing Dread card to the stack OR Every Hero takes 2 Corruption Hits.",
    remainsInPlay: true
  },
  {
    name: "Dark Influences",
    tags: ["Darkness", "Cult"],
    effect: "Whenever a Hero uses a Grit, add a marker. Anytime there are markers here equal to the number of Heroes in the Posse, discard them and draw a Growing Dread card and add it to the stack.",
    remainsInPlay: true
  },
  {
    name: "Temptations of Evil",
    tags: ["Darkness", "Insanity"],
    effect: "Whenever the Darkness moves one or more spaces forward on the Depth Track, every Hero takes 1 Corruption Hit (or 2 Corruption Hits if Holy).",
    remainsInPlay: true
  },
  {
    name: "Ritual of Fire",
    tags: ["Darkness", "Ritual", "Fire"],
    effect: "Every Hero takes 4 Horror Hits. For each Sanity Damage taken from these Horror Hits, that Hero also gains 1 Burning marker.",
    remainsInPlay: false
  },
  {
    name: "Cave In",
    tags: ["Darkness"],
    effect: "With a thunderous crack, the ceiling begins to fall in! Each Hero must pass an Agility 6+ Test or take D6 Hits from falling debris.",
    remainsInPlay: false
  },
  {
    name: "Strength of the Void",
    tags: ["Darkness", "Boost", "Void"],
    effect: "All Void Enemies are now +1 Defense.",
    remainsInPlay: true,
    statModifiers: { keywordFilter: "Void", effects: { defense: 1 } }
  },
  {
    name: "Always Watching",
    tags: ["Darkness", "Boost", "Alien"],
    effect: "All Alien Enemies are +1 Initiative and +1 Damage on Ranged Attacks.",
    remainsInPlay: true,
    statModifiers: { keywordFilter: "Alien", effects: { initiative: 1, damage: 1 } }
  },
  {
    name: "Fueled by Dark Stone",
    tags: ["Darkness", "Boost", "Mutant"],
    effect: "All Mutant Enemies are +1 Initiative and +2 Damage with their Attacks. All Enemies on the next Threat Card drawn gain the Keyword Mutant.",
    remainsInPlay: true,
    statModifiers: { keywordFilter: "Mutant", effects: { initiative: 1, damage: 2 } }
  },
  {
    name: "Winds of Change",
    tags: ["Darkness", "Mutation"],
    effect: "Every Hero immediately takes: 2 Wounds, ignoring Defense, and 1 Corruption Hit for each Mutation they have.",
    remainsInPlay: false
  },
  {
    name: "Growling in the Dark",
    tags: ["Darkness"],
    effect: "All Heroes that are not currently on the same Map Tile as the Lantern immediately take D6 Horror Hits (or 2D6 if Hero Level 5 or higher).",
    remainsInPlay: false
  },
  {
    name: "Flood of Bats",
    tags: ["Darkness", "Animal", "Swarm"],
    effect: "Each Hero takes 2 Horror Hits, gains 10XP, and must then pass a Strength 4+ test or lose 1 Dark Stone.",
    remainsInPlay: false
  },
  {
    name: "Demonic Assault",
    tags: ["Darkness", "Boost", "Demon"],
    effect: "All Demon Enemies are +1 Initiative. They also gain +1 Combat for every 2 points higher their Initiative is than the target (or each point higher against a Holy Hero).",
    remainsInPlay: true,
    statModifiers: { keywordFilter: "Demon", effects: { initiative: 1 } }
  },
  {
    name: "Eruption of the Dead",
    tags: ["Darkness", "Attack", "Undead"],
    effect: "Bursting through the surface below, a horde of hungry dead surround you! Ambush Attack – D6 Hungry Dead.",
    remainsInPlay: false
  },
  {
    name: "High Noon",
    tags: ["Darkness", "Town", "Challenge"],
    effect: "Challenged to a duel before leaving town, the showdown is set upon your return! One Random Hero must either complete the High Noon Duel Solo Mission before starting their next Adventure, or skip their next Town Stay and begin with no Grit.",
    remainsInPlay: false
  },
  {
    name: "Forbidden Ritual",
    tags: ["Darkness", "Tribal", "Ritual"],
    effect: "Roll a D6 for each Blood Spatter and Growing Dread space that the Hero Posse marker has passed on the Depth Track (including the space it is currently on). On the roll of 1 or 2, immediately trigger that space’s Growing Dread or Darkness card, respectively.",
    remainsInPlay: false
  },
  {
    name: "Overwhelming Dread",
    tags: ["Darkness", "Dread"],
    effect: "“I got a real bad feeling about this.” Add a Growing Dread card to the stack.",
    remainsInPlay: false
  },
  {
    name: "Corrupted by Greed",
    tags: ["Darkness", "Greed"],
    effect: "Each Hero immediately takes 1 Corruption Hit for every $500 they currently have (rounding up). Limit 6 Corruption Hits.",
    remainsInPlay: false
  },
  {
    name: "Screams of the Damned",
    tags: ["Darkness", "Ghosts"],
    effect: "Each Hero takes 3 Horror Hits. Also, roll a D6 for each Token in your Side Bag. On the roll of 1 or 2, it is stolen by the mischievous spirits (discard).",
    remainsInPlay: false
  },
  {
    name: "Marching Darkness",
    tags: ["Darkness"],
    effect: "Roll a number of dice equal to the Hero Posse Level (Grit may not be used). For every roll of 1, 2, or 3, one Hero must discard a Grit or move the Darkness 1 step forward on the Depth Track.",
    remainsInPlay: false
  },
  {
    name: "Creeping Shadows",
    tags: ["Darkness", "Insanity"],
    effect: "Count the number of Growing Dread cards in the stack and discard pile, then roll a number of dice equal to the total. For each roll of 1, 2, or 3, move the Darkness 1 space forward on the Depth Track (Grit may not be used on this roll).",
    remainsInPlay: false
  },
  {
    name: "Darkness All Around",
    tags: ["Darkness"],
    effect: "Any time a Hero is KO’d, the Darkness moves D3 spaces forward on the Depth Track (or 1 space for any Ally killed).",
    remainsInPlay: true
  },
  {
    name: "Crumbling Faith",
    tags: ["Darkness", "Treachery"],
    effect: "All Heroes are -1 Spirit or -2 Spirit if Holy (minimum 1). Preacher/Nun Heroes are also -2 to their Casting Rolls when performing Sermons.",
    remainsInPlay: true
  },
  {
    name: "Decay of Time",
    tags: ["Darkness", "Boost", "Undead"],
    effect: "All Undead Enemies now do +1 Sanity Damage on any Horror Hits caused by their Fear, Terror, or Unspeakable Terror.",
    remainsInPlay: true
  }
];

export default function Placeholder() { return null; }