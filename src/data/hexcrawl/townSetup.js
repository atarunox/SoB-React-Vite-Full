// HexCrawl Town Setup tables — Adventure Book pp.13-19

// Town Size: roll D8 (with Frontier Town expansion) or D6 (without)
export const TOWN_SIZE_TABLE = [
  { min: 1, max: 4, size: 4, label: 'Size 4 Town', locations: '1–4 Locations', die: 'D8' },
  { min: 5, max: 6, size: 6, label: 'Size 6 Town', locations: '5–6 Locations', die: 'D8' },
  { min: 7, max: 8, size: 8, label: 'Size 8 Town', locations: '7–8 Locations', die: 'D8' },
];

export const TOWN_SIZE_TABLE_NO_FT = [
  { min: 1, max: 2, size: 4, label: 'Size 4 Town', locations: '1–4 Locations', die: 'D6' },
  { min: 3, max: 4, size: 6, label: 'Size 6 Town', locations: '5–6 Locations', die: 'D6' },
  { min: 5, max: 6, size: 8, label: 'Size 8 Town', locations: '7–8 Locations', die: 'D6' },
];

// Town Type: roll 2D6 (Frontier Town expansion required)
export const TOWN_TYPE_TABLE = [
  { roll: 2,    type: 'Town Ruins' },
  { roll: 3,    type: 'Haunted Town' },
  { roll: 4,    type: 'Plague Town' },
  { roll: 5,    type: 'Rail Town' },
  { roll: 6,    type: 'Standard Frontier Town' },
  { roll: 7,    type: 'Standard Frontier Town' },
  { roll: 8,    type: 'Standard Frontier Town' },
  { roll: 9,    type: 'Mining Town' },
  { roll: 10,   type: 'River Town' },
  { roll: 11,   type: 'Mutant Town' },
  { roll: 12,   type: 'Outlaw Town' },
];

// Town Keyword: roll D8 (without Frontier Town expansion)
export const TOWN_KEYWORD_TABLE = [
  { roll: 1, keyword: 'Traveler',           defaultLocation: 'General Store' },
  { roll: 2, keyword: 'Showman/Performer',  defaultLocation: 'Saloon' },
  { roll: 3, keyword: 'Holy',               defaultLocation: 'Church' },
  { roll: 4, keyword: 'Science/Mutant',     defaultLocation: "Doc's Office" },
  { roll: 5, keyword: 'Law',                defaultLocation: 'Frontier Outpost' },
  { roll: 6, keyword: 'Outlaw',             defaultLocation: 'Saloon' },
  { roll: 7, keyword: 'Tribal/Kemosabe',    defaultLocation: null },
  { roll: 8, keyword: 'Frontier/Paleface',  defaultLocation: 'Frontier Outpost' },
];

// Town Locations: roll D12 (with Frontier Town) or D6 (without)
export const TOWN_LOCATION_TABLE_FT = [
  { roll: 1,  location: 'General Store' },
  { roll: 2,  location: 'Frontier Outpost' },
  { roll: 3,  location: 'Church' },
  { roll: 4,  location: "Doc's Office" },
  { roll: 5,  location: 'Saloon' },
  { roll: 6,  location: 'Blacksmith' },
  { roll: 7,  location: "Sheriff's Office" },
  { roll: 8,  location: 'Gambling Hall' },
  { roll: 9,  location: 'Street Market' },
  { roll: 10, location: "Smuggler's Den" },
  { roll: 11, location: 'Mutant Quarter' },
  { roll: 12, location: 'Indian Trading Post' },
];

export const TOWN_LOCATION_TABLE_NO_FT = [
  { roll: 1, location: 'General Store' },
  { roll: 2, location: 'Frontier Outpost' },
  { roll: 3, location: 'Church' },
  { roll: 4, location: "Doc's Office" },
  { roll: 5, location: 'Saloon' },
  { roll: 6, location: 'Blacksmith' },
];

// Town Build Chart: 2D6 roll — determines if new Location stays permanent after 7 days
export const TOWN_BUILD_CHART = [
  { size: 4, invest1: 1000, invest2: 2000, invest3: 3000, invest4: 4000, invest5: 5000, invest6: 6000, targets: [12, 10, 8, 6, 4, 3] },
  { size: 6, invest1: 1500, invest2: 3000, invest3: 4500, invest4: 6000, invest5: 7500, invest6: 9000, targets: [12, 10, 8, 6, 4, 3] },
  { size: 8, invest1: 2000, invest2: 4000, invest3: 6000, invest4: 8000, invest5: 10000, invest6: 12000, targets: [12, 10, 8, 6, 4, 3] },
];

export const TOWN_TRAITS_CHART = [
  { roll: 11, name: 'Dry',                  effect: 'This Town has declared alcohol to be a vile sin and forbids the purchase of or the imbibing of any alcoholic demon drink. Heroes may not purchase any alcoholic Side Bag Tokens here but may attempt to sell them at the Camp Site for twice the price. When attempting to sell, roll a D6. On a 1 or 2, the sale is discovered and the Heroes must end their Town Stay and cannot enter Town for a week.' },
  { roll: 12, name: 'Dark Secret',          effect: "This Town has a secret so horrible the Town itself would be torn apart were it to ever come to light. Every time the Posse enters for a Town Stay, a Random Hero makes a Cunning 6+ test. If three successes are made on a single roll, this vile secret is discovered and this Town is Destroyed." },
  { roll: 13, name: 'No Stones Allowed!',   effect: "[Reroll if the Town is the Mining Town type] The people here are fed up with Dark Stone and don't allow any Dark Stone into the city. You may not buy or sell any Dark Stone, Gear with the Dark Stone symbol, or any Dark Stone Upgrades while in this Town." },
  { roll: 14, name: 'Dark Stone Infused',   effect: 'Everything here is coated with a fine Dark Stone dust. Each Hero takes 1 Corruption Hit for each day that they stay here during a Town Visit.' },
  { roll: 15, name: 'Shortages',            effect: "[Reroll if the Town is the Mining Town or Rail Town type] This Town is having trouble getting ahold of the basic necessities and there are shortages on most items here. Side Bag Tokens may not be bought here, but may be sold for twice the listed price. Also, whenever a Hero wants to buy a Purchase Item, roll a D6. On a 1, 2, or 3, that Item is not in stock." },
  { roll: 16, name: 'Obligation',           effect: 'A Random Hero has some sort of financial obligation in this Town (family, lover, property, etc.) and must pay D3×$50 whenever visiting this Town or else gain 1 Corruption point with no Willpower save.' },
  { roll: 21, name: 'Degenerate',           effect: "[Reroll if the Town has the keyword 'Law' or the trait 'Law-Abiding'] The womenfolk here aren't safe to walk the streets alone. Any Female Hero that visits a Town Location without a Male Hero is at risk of being assaulted. If unaccompanied, make a Strength 4+ test. If failed, that Female Hero takes 1 Hit (1 Damage each) and rolls on the Injury Chart if she suffers more than 3 Wounds." },
  { roll: 22, name: 'Bad Water',            effect: "Folks here tell you not to touch the water, whether to bathe in or drink, it's got things crawlin' around in it that ain't healthy. Oddly enough, the townsfolk don't seem much affected by it. At the beginning of each day, every Hero makes a Strength 4+ test. If failed they are at -1 Health until the end of the next Mission." },
  { roll: 23, name: 'Inbred',              effect: "Everyone in this Town is related to everyone else here and it's makin' the people not right in the head. You may only Purchase Items in this Town. All other Services, Rituals, or other actions are unavailable on account of being too complicated for folks here to figure out." },
  { roll: 24, name: 'Xenophobic',          effect: "[Reroll if the Town has the keyword 'Mutant' or is the Mutant Town type] Heroes with any Mutations roll twice for Location Events and always take the lesser of the two results. This Town should never include the Mutant Quarter Location." },
  { roll: 25, name: 'Unstable Gate',       effect: "[Reroll if the Town has the trait 'Peaceful'] Sometimes Gates open up in Town. Whenever the Posse enters this Town, All Heroes make a Luck 4+ roll. If failed, Attack! — Draw a Threat card at the Posse's Threat level. If this fight is failed or escaped, Destroy one Town Location." },
  { roll: 26, name: 'Foreigners',          effect: "A colony of some foreign folk live here and it's hard to figure out where anything is because none of them speaks proper 'Merican. Whenever a Hero would visit a Town Location, go to a Random Town Location instead." },
  { roll: 31, name: 'Heathens',            effect: "[Reroll if the Town already has the 'Religious Cult' trait or keyword 'Holy' or is the Plague Town type] Heroes with the keyword 'Holy' or 'Occult' roll twice for Location Events and always take the lesser of the two results. Replace the Church with another Location if it is setup in this Town." },
  { roll: 32, name: 'Cannibals!',          effect: "The people of this Town have taken to questionable practices. Whenever the Posse enters this Town, Attack! — Roll a Human Threat at the Hero Posse's level. If all Heroes are KO'd during this fight, all Heroes roll on the Injury Chart 3 times. The Heroes may not stay at this Town (not even at the Camp Site)." },
  { roll: 33, name: 'Religious Cult',      effect: "[Reroll if the Town already has the 'Heathens' trait] The townsfolk here are overzealous and won't abide unbelievers. Heroes that do not have the keyword 'Holy' roll twice for Location Events and always take the lesser of the two results. There must always be a Church in this Town. Replace another Location with the Church if it is ever Destroyed for any reason." },
  { roll: 34, name: 'Boring',             effect: "Folks here are boring as hell. Remove any other Town Traits/Types/Keywords from this Town and do not roll for any other Traits." },
  { roll: 35, name: 'Bartering',          effect: "The people here don't care much for Gold and it may not be used to Purchase Items here. All Items that are traded directly for Items or Services are worth their listed sell value, however, no change is given." },
  { roll: 36, name: 'Corrupt',            effect: "[Reroll this trait if the Town has the keyword 'Law'] Corruption is widespread in this Town. Each Hero must pay a $25 bribe for each day they stay in Town or else they must end their Town Visit immediately." },
  { roll: 41, name: 'Thieving',           effect: "[Reroll if the Town has the 'Law-Abiding' Trait or the keyword 'Law'] Whenever the Posse enters this Town, they are immediately targeted by a gang of pickpockets & thieves. Each Hero makes an Agility 4+ roll. If failed, that Hero has lost D3×$50 worth of Gold, Gear or Side Bag Tokens (your choice)." },
  { roll: 42, name: 'Slavers',            effect: "The people in this Town have turned to slavery to deal with their hardships. Whenever you visit Town Locations, take D6 Corruption Hits. A Hero may attempt to free slaves from a Town Location by making a Strength 6+ test. Destroy that Location, gain 50XP, and end the Posse's Town Stay. You may not visit again for a week." },
  { roll: 43, name: 'Amazonian',          effect: "Women have banded together here and don't care much for men. Male Heroes roll twice for Location Events and always take the lesser of the two results." },
  { roll: 44, name: 'Peaceful',           effect: "[Reroll if the Town has the keyword 'Outlaw' or has the 'Unstable Gate' trait or is the Outlaw Town type] No weapons of any sorts are permitted in this Town. While in Town the Heroes do not have access to their weapons and may only use their fists in Combat. The Heroes may not purchase or sell any Weapons, Ammunition, or Weapon Upgrades while in Town." },
  { roll: 45, name: 'Addicted',           effect: "The people of this Town are in the throes of a terrible addiction and will go to any lengths to get it. Each Hero makes an Agility 4+ roll for each day they stay in Town. If failed, that Hero loses an Alcohol or Herb Side Bag Token (their choice)." },
  { roll: 46, name: 'Nightmares',         effect: "Every night you stay in this Town your sleep is troubled with horrifying nightmares. Each Hero takes 3 Horror Hits every day they stay in Town. Sanity Damage gained from this cannot be Healed until after you confront your fears and finish another Mission." },
  { roll: 51, name: 'Artifact Decay',     effect: "Something about this Town don't react well with them artifacts people been pulling up from the Mines. Each Hero that carries any Artifacts rolls a D8 whenever they enter this Town. On a 1, 2, or 3, add a Corruption token to an Artifact (your choice). With 3 Corruption tokens, that Artifact is Destroyed." },
  { roll: 52, name: 'Bad Luck',           effect: "There's something not quite right about this place and it seems to be contagious. At the beginning of each day in Town, All Heroes make a Luck 5+ roll. If failed, move the Darkness marker two spaces on the Town Event Track instead of the normal one per day." },
  { roll: 53, name: 'Black Market',       effect: "The Heroes may visit any Town Location they want to, whether or not it 'officially' exists in this Town. Prices are $50 more expensive for any Purchase Items or Services at Black Market Locations (regular Town Locations have normal prices). If a Town Location is ever Destroyed, a Black Market Location will spring up to replace it. If all Town Locations are Destroyed in this Town, the Town itself is Destroyed." },
  { roll: 54, name: 'Jovial',             effect: "Despite the circumstances, the people here seem downright happy and unphased, which is just somehow wrong. When rolling on the Town Event Chart, roll twice and take the higher of the two rolls." },
  { roll: 55, name: 'Constructive',       effect: "Whenever the Heroes enter this Town, if any Town Locations have been Destroyed, the Posse rolls a D8. If an 8 is rolled, add a new Town Location. This roll is not made again until another Mission is completed." },
  { roll: 56, name: 'Cattle Yard',        effect: "Heroes here can make some extra cash on the side by helping out herding or slaughtering cattle. Instead of visiting a Town Location, a Hero may make an Agility or Strength Skill test for the day to earn some money. For each roll of 2-5, gain $25. For every roll of 6, that Hero gains $100. If a 1 is rolled, that Hero earns nothing and has suffered an accident — roll on the Injury Chart instead." },
  { roll: 61, name: 'Law-Abiding',        effect: "[Reroll if the Town type is an Outlaw Town or if the Town already has either the 'Degenerate' or 'Thieving' Trait or the keyword 'Outlaw'] Folks here are proper and don't much tolerate disreputable persons. Heroes with the keyword 'Outlaw' roll twice for Location Events and always take the lesser of the two results. This Town should never include the Smuggler's Den Location." },
  { roll: 62, name: 'Fancy House',        effect: "Every night you stay in this Town, each Hero rolls a D8. On a 1 or 2, a Male Hero loses $50 and gains the keyword 'Rash'. While you have 'Rash', your Hero is -25% Health (rounded up). This may be removed at the Doc's Office with a Surgery attempt. On a roll of 8, that Hero instead loses $100 and may remove one Madness. Female Heroes who roll a 7 or 8 may gain $100 if they choose to." },
  { roll: 63, name: 'Unstable Economy',   effect: "This Town is in a constant state of flux and you can never tell who's set up shop and it's always something different every time you come here. Choose different Town Locations each time you come here for a Town Stay (Keyword Locations or Town Type Locations are the only constants, must still follow any restrictions)." },
  { roll: 64, name: 'Dimensional Paradox', effect: "This Town is caught in a weird vortex at the junction of two realities. Pick a second, different Keyword or Town Type, depending on if you own the Frontier Town expansion. Whenever you enter Town, roll a D6. On an even roll, it is the 1st Town Keyword/Type; on an odd roll it is the 2nd Town Keyword/Type. Locations stay the same though and may conflict with the rules... it's a paradox." },
  { roll: 65, name: 'Well-Defended',      effect: "This Town has Armor 5+. Whenever a Town Location or the Town itself would be Destroyed, roll a D6. On a 5 or better, that Location or the Town is not Destroyed." },
  { roll: 66, name: 'Unique Location',    effect: "There's an expert or artisan in Town that is renowned throughout the region and beyond. Choose one of the Town's Locations at Random. You may purchase Advanced Gear & Services from this Location in this Town." },
];
