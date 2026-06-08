// Form and Void — Short Story Campaign
// HexCrawl Adventure Book, pp. 48-66
// A branching narrative campaign using City of the Ancients Core Set.
// Missions are referenced by [Basic:N] and [Targa:N] from the Adventure Books.

export const FORM_AND_VOID_MISSIONS = [
  {
    id: 'form_and_void_1_for_a_few_dark_stone_more',
    name: 'Story Mission 1: For A Few Dark Stone More',
    pack: 'Form and Void (Short Story Campaign)',
    packId: 'form_and_void',
    missionNumber: 1,
    description:
      'Brimstone used to be the \'Paris of the West\', a booming Dark Stone mining town. Then the Darkness came. You overhear talk of a local mine in the hills with a large deposit of Dark Stone. You buy a drink for an old prospector who tells you everything he knows about a couple patches of Dark Stone in the place... and somethin\' mighty evil about it all. [Uses Basic Mission 1 rules]',
    setup:
      'Choose the closest Mine on the HexCrawl Overland map to the Starting Town (other than #20 Ruins of Brimstone). Set up using normal For A Few Dark Stone More [Basic:1] directions. Choose either Small, Medium, or Large Deposits for Mission Length.',
    specialRules: [],
    objectives: [
      'Complete the standard For A Few Dark Stone More [Basic:1] objectives.',
      'The Mission takes place in the mine closest to your Starting Town (not Mine #20).',
    ],
    reward:
      'Travel back to the Starting Town. In addition to normal rewards — Small: +25XP and D3 Dark Stone; Medium: +50XP and D3+1 Dark Stone; Large: +75XP and D3+2 Dark Stone. Next Story Mission: Exploration [Basic:2]. Must complete 1 Job first, then travel to a Random Town.',
    failure:
      'Begin an Escape Mission [Basic:5] before exiting. The nearest D3 Towns to this Mine are Destroyed. The next nearest 3 Towns each have 1 Random Location Destroyed. Next Story Mission: Search Party [Basic:4]. Must complete 1 Job first.',
  },

  {
    id: 'form_and_void_2_exploration',
    name: 'Story Mission 2: Exploration',
    pack: 'Form and Void (Short Story Campaign)',
    packId: 'form_and_void',
    missionNumber: 2,
    description:
      'A rail baron named Wilfred F. Peabody and his associate Dr. Hedgebrook are looking for adventurers to explore a mine with suspected Dark Stone deposits. Peabody\'s "Associates" are collectors looking to build up their supplies. "My Associates are simply collectors looking to build up their supplies. You never can tell when the whole market will just... blow up." [Uses Basic Mission 2 rules]',
    setup:
      'Choose a Random Mine on the HexCrawl Overland map (not Mine #20). Set up using normal Exploration [Basic:2] directions.',
    specialRules: [],
    objectives: [
      'Complete the standard Exploration [Basic:2] objectives.',
    ],
    reward:
      'Travel back to the Originating Town (Overland Move reduced to 3 MP/day due to extra cargo). Normal Exploration rewards (25XP and $50 × depth steps). Next Story Mission: Frozen Expedition [Targa:6]. Must complete 2 Jobs first, then travel to a Random Town.',
    failure:
      'Begin Escape Mission [Basic:5]. Automatic Wilderness Encounter every day traveling until you reach a Town. Nearest Town Destroyed, 5 nearest Towns each have 1 Random Location Destroyed. Next Story Mission: Terror in the Night [Targa:1]. Must complete 2 Jobs first.',
  },

  {
    id: 'form_and_void_3_frozen_expedition',
    name: 'Story Mission 3: Frozen Expedition',
    pack: 'Form and Void (Short Story Campaign)',
    packId: 'form_and_void',
    missionNumber: 3,
    description:
      'Dr. Hedgebrook — a pale, disheveled, wild-eyed man who works for Wilfred F. Peabody — is studying frozen creatures that have been thawing out. He dispatched an Expedition to investigate Targa-related clues, but hasn\'t heard from them. Now something from a portal to an ancient frozen city has slaughtered them all. Hedgebrook needs those Journal Pages before the ice melts completely. [Uses Targa:6 rules]',
    setup:
      'Choose a Random Mine to travel to (not Mine #20). Set up using normal Frozen Expedition [Targa:6] directions. Return to the Originating Town after collecting Journal Pages.',
    specialRules: [],
    objectives: [
      'Complete the standard Frozen Expedition [Targa:6] objectives.',
      'Return to the Originating Town with the Journal Pages.',
    ],
    reward:
      'Normal Frozen Expedition rewards (50XP, +$250 if no buildings were destroyed). Next Story Mission: City of the Ancients [Targa:4]. Must complete 3 Jobs first.',
    failure:
      'Originating Town Destroyed. 3 nearest Towns have D3 Random Locations Destroyed. Next Story Mission: Stop the Ritual [Targa:2]. Must complete 3 Jobs first.',
  },

  {
    id: 'form_and_void_4_city_of_the_ancients',
    name: 'Story Mission 4: City of the Ancients',
    pack: 'Form and Void (Short Story Campaign)',
    packId: 'form_and_void',
    missionNumber: 4,
    description:
      'Wilfred F. Peabody is offering a reward for brave adventurers to poke around the ancient frozen city of Targa. You\'ve heard rumors of a Mine where cold blizzards emanate night and day, and there\'s some sort of portal to another world that people have disappeared through. Time to see what secrets lie within Targa, the City of the Ancients. [Uses Targa:4 rules]',
    setup:
      'Choose a Random Mine (not Mine #20). Set up using normal City of the Ancients [Targa:4] directions.',
    specialRules: [],
    objectives: [
      'Complete the standard City of the Ancients [Targa:4] objectives.',
    ],
    reward:
      'Normal rewards (25XP and D6×$50 in trinkets). Then IMMEDIATELY begin Story Mission 5: Overload [Targa:5] — do not return to the Overland map. Heroes may get one additional Catch Your Breath roll before beginning.',
    failure:
      'Each Hero takes D6 Wounds (carry over). Immediately begin Last Stand [Targa:3] before exiting this Mine.',
  },

  {
    id: 'form_and_void_5_overload',
    name: 'Story Mission 5: Overload',
    pack: 'Form and Void (Short Story Campaign)',
    packId: 'form_and_void',
    missionNumber: 5,
    description:
      'That sunnuvabitch Peabody! He\'s trapped you on Targa and it\'s gonna blow up in the process. Peabody and Hedgebrook followed after you and used what you found for them to wake a \'prisoner\' of some kind here — turns out Targa was a giant prison. Y\'all need to either keep this old place from blowing up or escape through another portal back to Earth before it\'s too late. [Uses Targa:5 rules]',
    setup:
      'Posse begins immediately on the Targa Entrance Map Tile. Set up using normal Overload [Targa:5] directions.',
    specialRules: [],
    objectives: [
      'Complete the standard Overload [Targa:5] objectives.',
    ],
    reward:
      'Normal rewards (50XP, roll D6: on 3+ draw a Targa Artifact). Exit to a different Random Mine than originally entered. Immediately begin Story Mission 6: Blow the Mine [Basic:6] — travel to nearest Town first to record the Objective Mine.',
    failure:
      'Each Hero rolls Injury Chart once. Immediately begin Last Stand [Targa:3] before exiting.',
  },

  {
    id: 'form_and_void_last_stand',
    name: 'Story Mission (Branching): Last Stand',
    pack: 'Form and Void (Short Story Campaign)',
    packId: 'form_and_void',
    missionNumber: 6,
    description:
      'You don\'t know how it happened. Whatever that bastard Peabody has gotten you mixed up in has led you here. Things were a blur after that last bit and all you know is that you\'re somewhere deep down in the Mines. But you\'re not alone... There\'s some of them things you can hear off in the distance, getting closer. You\'ve got a little bit of time to prepare some kind of defense. [Uses Targa:3 rules]',
    setup:
      'Posse begins with Heroes anywhere on the board. Set up using normal Last Stand [Targa:3] directions.',
    specialRules: [],
    objectives: [
      'Complete the standard Last Stand [Targa:3] objectives.',
    ],
    reward:
      'Normal rewards (5 Loot cards and D6×25 XP to any Heroes not KO\'d). Exit the same Mine entered; this Mine is the Objective Mine. Proceed to nearest Town, then begin Story Mission: Blow the Mine [Basic:6].',
    failure:
      'Each Hero rolls once on both Injury Chart and Madness Chart. Exit the same Mine; this is the Objective Mine. However, all Mounts are Dead (away too long). Proceed to next Town and begin Blow the Mine [Basic:6].',
  },

  {
    id: 'form_and_void_seal_the_void_gate',
    name: 'Story Mission (Branching): Seal the Void Gate',
    pack: 'Form and Void (Short Story Campaign)',
    packId: 'form_and_void',
    missionNumber: 7,
    description:
      'You\'ve finally tracked that pair of pissants out here — Peabody and Hedgebrook. Before you got there though, some preacher man named Father Bartholomew tried getting his followers in there, but Peabody is finishing his summoning magik. He\'s become some kind of unholy supernatural monster, an avatar to an Ancient One seeking to bridge the gap between our world and its twisted Void dimension. You only have a few hours to close the Gate. [Uses Basic:3 rules]',
    setup:
      'Start on Mine Entrance Map Tile as normal. Set up using normal Seal the Void Gate [Basic:3] directions.',
    specialRules: [],
    objectives: [
      'Complete the standard Seal the Void Gate [Basic:3] objectives.',
    ],
    reward:
      'Normal rewards (25XP and D6×$50). Exit the same Mine entered; this is the Objective Mine. Begin Blow the Mine [Basic:6] at nearest Town.',
    failure:
      'Destroy the nearest 3 Towns (Peabody\'s summoning shook the Earth). Immediately begin Last Stand [Targa:3] before exiting.',
  },

  {
    id: 'form_and_void_search_party',
    name: 'Story Mission (Branching): Search Party',
    pack: 'Form and Void (Short Story Campaign)',
    packId: 'form_and_void',
    missionNumber: 8,
    description:
      'Honest work is pretty damn scarce around these parts. You tried to get work from rail baron Peabody, but his thugs escorted you away. You did overhear him talking about paying top dollar for strange things from the mines for some "Hedge-somethin\'" fellow. But then you see a woman in hysterics — someone got dragged off in the night toward one of the mines. [Uses Basic:4 rules]',
    setup:
      'Choose the nearest Mine (not Mine #20). Set up using normal Search Party [Basic:4] directions.',
    specialRules: [],
    objectives: [
      'Complete the standard Search Party [Basic:4] objectives.',
    ],
    reward:
      'Travel back to Originating Town. If bringing back a living person: Overland Move 4 MP/day. If dead: 3 MP/day. Normal Search Party rewards (50XP and Person Rescued Reward). Next Story Mission: Frozen Expedition [Targa:6]. Must complete 2 Jobs first.',
    failure:
      'Normal failure (D3 Corruption ignoring Willpower) plus D6 Corruption ignoring Willpower if ever in that Originating Town again. Next Story Mission: Terror in the Night [Targa:1]. Must complete 2 Jobs first.',
  },

  {
    id: 'form_and_void_stop_the_ritual',
    name: 'Story Mission (Branching): Stop the Ritual',
    pack: 'Form and Void (Short Story Campaign)',
    packId: 'form_and_void',
    missionNumber: 9,
    description:
      'The Disciples of the Void cult has been raping and pillaging across the region, sacrificing prisoners and collecting Dark Stone for some great and terrible magik. You\'ve pieced together their movements and think you know where they\'re headed. Time to bust in there and beat the crap out of them loonies and put a stop to their crazy plans. [Uses Targa:2 rules with extra enemy]',
    setup:
      'Choose a Random Mine (not Mine #20). Set up using normal Stop the Ritual [Targa:2] directions, but add either a Void Sorcerer or Occultist Human Enemy to the Summoning Chamber Objective Room for the Final Fight (in addition to the Epic Threat). This extra figure represents the head cultist.',
    specialRules: [],
    objectives: [
      'Defeat the Epic Threat AND the head cultist (Void Sorcerer or Occultist) in the Summoning Chamber.',
    ],
    reward:
      'Normal rewards (50XP). Roll on Mine Chart to determine next Mine location. Immediately begin Seal the Void Gate [Basic:3] there.',
    failure:
      'Nearest 3 Towns from this Mine Destroyed. Each Hero takes D6 Wounds (carry over). Immediately begin Last Stand [Targa:3] before exiting.',
  },

  {
    id: 'form_and_void_terror_in_the_night',
    name: 'Story Mission (Branching): Terror in the Night',
    pack: 'Form and Void (Short Story Campaign)',
    packId: 'form_and_void',
    missionNumber: 10,
    description:
      'Something terrifying clawed its way out of the Mines the other night and made its way into town, tearing lawmen into little itty bitty pieces. It\'s kidnapped somebody from this town and they\'re like to be dead real soon. This is part of some pattern — a lot of folks have been disappearin\' from towns all over the area. The Mayor is paying good money if you can bring that person back safe and sound. [Uses Targa:1 rules]',
    setup:
      'Choose the nearest Mine (not Mine #20). Set up using normal Terror in the Night [Targa:1] directions.',
    specialRules: [],
    objectives: [
      'Complete the standard Terror in the Night [Targa:1] objectives.',
    ],
    reward:
      'Travel back to Originating Town. Living person: Overland Move 3 MP/day. Dead: 3 MP/day. Normal rewards (50XP and D6×$50). Next Story Mission: City of the Ancients [Targa:4]. Must complete 3 Jobs first.',
    failure:
      'Normal failure (D3 Corruption ignoring Willpower) plus D6 Corruption ignoring Willpower if ever in that Originating Town again. Next Story Mission: Stop the Ritual [Targa:2]. Must complete 3 Jobs first.',
  },

  {
    id: 'form_and_void_final_blow_the_mine',
    name: 'Story Mission FINAL: Blow the Mine',
    pack: 'Form and Void (Short Story Campaign)',
    packId: 'form_and_void',
    missionNumber: 11,
    description:
      'It all leads back to Peabody. You\'ve found that he\'s the head of the Disciples of the Void cult, and with Hedgebrook they\'ve used your efforts to complete an "Awakening" — summoning an eldritch Great Old One from its cursed slumber on Targa. The entire region around Brimstone is a massive magik summoning circle. You\'ve found heavy-duty Explosives in Hedgebrook\'s lab... time to end this. [Uses Basic:6 rules]',
    setup:
      'Travel to the Objective Mine and begin a Blow the Mine [Basic:6] Mission. Uses the Treacherous Escape special rule instead of Dangerous Escape: at end of any turn with Heroes on Mine Entrance Map Tile, it automatically has an Epic Threat waiting. In addition to the Epic Threat card, also add two Occultist Human Enemies (Hedgebrook and Peabody) — they\'re attempting to stop you. All Enemies must be defeated before you can escape!',
    specialRules: [
      {
        name: 'Treacherous Escape',
        text: 'At the end of any turn in which one or more Heroes is standing on the Mine Entrance Map Tile as the Objective Room, instead of rolling a special HBtD test, the Mine Entrance Map Tile automatically has an Epic Threat waiting there for the Posse. In addition to whatever is drawn from the Epic Threat card, also add two Occultist Human Enemies — Hedgebrook and Peabody. These are the villains. All Enemies must be defeated before you can escape!',
      },
    ],
    objectives: [
      'Complete the standard Blow the Mine [Basic:6] objectives.',
      'Defeat both Peabody and Hedgebrook (Occultist Human Enemies) blocking the exit.',
    ],
    reward:
      'CAMPAIGN SUCCESS! The Mine blows to kingdom come. Peabody and Hedgebrook are defeated. Brimstone remains and creatures continue coming through the Gates, but the immediate threat is ended. A sunset to ride off into... for now.',
    failure:
      'CAMPAIGN FAILURE! Peabody\'s plans succeed. The Unnameable Entity from beyond our Universe — a Great Old One — bridges the gap between worlds. Humanity is ground to dust. The Heroes barely survive in a world now overrun by otherworldly abominations. Ride off into a sunset that is actually an explosion destroying another town.',
  },
];

export default FORM_AND_VOID_MISSIONS;
