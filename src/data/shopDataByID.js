// src/data/shopDataByID.js
// Canonical registry of Town locations used by TownTab.
// If a shop is missing here, it won't show in the location list!

// Which town a shop belongs to. Used by TownTab to filter locations by world.
// 'FrontierTown' = original core set, 'BlastedWastesTown' = Blasted Wastes expansion.
// Camp Site has no town -- it's always available.

export const FRONTIER_TOWN_IDS = [
  'frontierOutpost', 'generalStore', 'indianTradingPost', 'mutantQuarter',
  'docsOffice', 'church', 'blacksmith', 'smugglersDen', 'streetMarket',
  'saloon', 'gamblingHall', 'sheriffsOffice',
];

export const BLASTED_WASTES_TOWN_IDS = [
  'miningOperation', 'desertMarketplace', 'temple',
  'gladiatorArena', 'scavengerDoc', 'wastelandWorkshop',
];

export const shopDataById = {
  /* ---------------- Camp Site (for Camp lodging) ---------------- */
  // NOTE: TownTab uses CAMP_SHOPS = ['campSiteTents'],
  // so the key AND id must both be "campSiteTents".
  campSiteTents: {
    id: 'campSiteTents',
    name: 'Camp Site',
    type: 'Shop',
    description:
      'Rest up outside of town. Limited services; next day you may only visit the Camp Site.',
    rules: [
      'Heroes staying at Camp are limited to visiting the Camp Site the next day.',
      'Heroes staying at the Hotel may visit any Town location.',
    ],
  },

  // ====================== FRONTIER TOWN ======================================

  /* ---------------- Frontier Outpost ---------------- */
  frontierOutpost: {
    id: 'frontierOutpost',
    name: 'Frontier Outpost',
    town: 'FrontierTown',
    type: 'Shop',
    description:
      'Bank, training yard, and a small trading post for soldiers and travelers.',
  },

  /* ---------------- General Store ---------------- */
  generalStore: {
    id: 'generalStore',
    name: 'General Store',
    town: 'FrontierTown',
    type: 'Shop',
    description:
      'Basic supplies, ammo, clothes, hats, and the odd specialty item.',
  },

  /* ---------------- Indian Trading Post ---------------- */
  indianTradingPost: {
    id: 'indianTradingPost',
    name: 'Indian Trading Post',
    town: 'FrontierTown',
    type: 'Shop',
    description:
      'Medicine Man services, Tribal Tent, and unique charms and gear.',
  },

  /* ---------------- Mutant Quarter ---------------- */
  mutantQuarter: {
    id: 'mutantQuarter',
    name: 'Mutant Quarter',
    town: 'FrontierTown',
    type: 'Shop',
    description:
      'A rough district with its own community, services, and gear.',
  },

  /* ---------------- Doc's Office ---------------- */
  docsOffice: {
    id: 'docsOffice',
    name: "Doc's Office",
    town: 'FrontierTown',
    type: 'Shop',
    description:
      'Medical supplies, injections, and surgical services.',
  },

  /* ---------------- Church ---------------- */
  church: {
    id: 'church',
    name: 'Church',
    town: 'FrontierTown',
    type: 'Shop',
    description:
      'Holy rituals, blessed auras, and sacred gear.',
  },

  /* ---------------- Blacksmith ---------------- */
  blacksmith: {
    id: 'blacksmith',
    name: 'Blacksmith',
    town: 'FrontierTown',
    type: 'Shop',
    description: 'Dark Stone forge, upgrades, and transport.',
  },

  /* ---------------- Smuggler's Den ---------------- */
  smugglersDen: {
    id: 'smugglersDen',
    name: "Smuggler's Den",
    town: 'FrontierTown',
    type: 'Shop',
    description:
      'Back-alley doc, black market, and outlaw opportunities.',
    rules: [
      "Law heroes may not enter the Smuggler's Den.",
      'Some actions are Outlaw-only.',
    ],
  },

  /* ---------------- Street Market ---------------- */
  streetMarket: {
    id: 'streetMarket',
    name: 'Street Market',
    town: 'FrontierTown',
    type: 'Shop',
    description:
      'Potions, spices, mounts, gear, and shady back-alley services.',
  },

  /* ---------------- Saloon ---------------- */
  saloon: {
    id: 'saloon',
    name: 'Saloon',
    town: 'FrontierTown',
    type: 'Shop',
    description: 'Whiskey, tall tales, and risky entertainment.',
    rules: [
      'Draw a Saloon Location Event when you visit.',
      'Entertainment entries require tests or rolls; resolve on perform.',
      'Some gear/services are Saloon Girl-only.',
    ],
  },

  /* ---------------- Gambling Hall ---------------- */
  gamblingHall: {
    id: 'gamblingHall',
    name: 'Gambling Hall',
    town: 'FrontierTown',
    type: 'Shop',
    description: 'Games of chance, fancy clothing, and the cashier.',
    rules: [
      'Draw a Gambling Hall Location Event when you visit.',
      'Gambling services prompt for your dice; autoroll can be added later.',
    ],
  },

  /* ---------------- Sheriff's Office ---------------- */
  sheriffsOffice: {
    id: 'sheriffsOffice',
    name: "Sheriff's Office",
    town: 'FrontierTown',
    type: 'Shop',
    description: 'Law services, bounties, and deputization.',
    rules: [
      "Outlaw heroes may not visit the Sheriff's Office (except Pay Off Warrants).",
      '"Become Deputized" grants a permanent +1 Cunning and the Law keyword.',
      'Items/services under "Law and Order" are for Law heroes only.',
    ],
  },

  // ====================== BLASTED WASTES TOWN ================================

  /* ---------------- Mining Operation ---------------- */
  miningOperation: {
    id: 'miningOperation',
    name: 'Mining Operation',
    town: 'BlastedWastesTown',
    type: 'Shop',
    description:
      'Deep tunnels, fungus crops, and explosives. Work the mines for pay or risk.',
  },

  /* ---------------- Desert Marketplace ---------------- */
  desertMarketplace: {
    id: 'desertMarketplace',
    name: 'Desert Marketplace',
    town: 'BlastedWastesTown',
    type: 'Shop',
    description:
      'Alien clothing, side bag tokens, transports, and shady back-alley dealings.',
  },

  /* ---------------- Temple ---------------- */
  temple: {
    id: 'temple',
    name: 'Temple',
    town: 'BlastedWastesTown',
    type: 'Shop',
    description:
      'Ancient blessings, idol worship, and sacred items from a forgotten age.',
  },

  /* ---------------- Gladiator Arena ---------------- */
  gladiatorArena: {
    id: 'gladiatorArena',
    name: 'Gladiator Arena',
    town: 'BlastedWastesTown',
    type: 'Shop',
    description:
      'Fight for glory, gold, and the roar of the crowd.',
  },

  /* ---------------- Scavenger Doc ---------------- */
  scavengerDoc: {
    id: 'scavengerDoc',
    name: 'Scavenger Doc',
    town: 'BlastedWastesTown',
    type: 'Shop',
    description:
      'Alien medical supplies, dubious surgery, and scientific research.',
  },

  /* ---------------- Wasteland Workshop ---------------- */
  wastelandWorkshop: {
    id: 'wastelandWorkshop',
    name: 'Wasteland Workshop',
    town: 'BlastedWastesTown',
    type: 'Shop',
    description:
      'Scrap armor, rust equipment, and the Wasteland Rust Forge for upgrades.',
  },
};

export default shopDataById;
