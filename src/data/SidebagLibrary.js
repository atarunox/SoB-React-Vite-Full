// src/data/SidebagLibrary.js
export const LIBRARY_ENTRIES = [
  {
    category: "Side Bag Tokens",
    entries: [
      { item: "Ale", description: "Discard to Heal D6 Sanity Damage.", source: "Expedition Supplies – Viking Camp" },
      { item: "Anti-Rad", description: "Discard to remove D6 Corruption Points.", source: "Field Hospital" },
      { item: "Bandages", description: "Discard to Heal D6 Wounds.", source: "Brotherhood Temple, Desert Marketplace, Doc's Office, Expedition Supplies – Conquistador Camp, Trederran Camp, Viking Camp, Feudal Village Camp Site, Field Hospital, Frontier Town Camp Site, General Store, Gladiator Arena, House of Healing, Mutant Quarter, Sacred Garden, Scavenger Doc, Viking Healer, Village Market, Western Trading Post" },
      { item: "Bomb", description: "Discard to throw as a Ranged Attack. Range: Strength +3. If missed, bounces D3 times before exploding. Models in the target space and adjacent spaces take D6 Wounds each, ignoring Defense.", source: "Dwarf Cave, Expedition Supplies – Conquistador Camp, Guard House, Samurai Lord, Spanish Armory, Village Market" },
      { item: "Brimstone Ash", description: "Discard at any time to do 1 Wound to every adjacent Enemy, ignoring Defense.", source: "Church" },
      { item: "Dark Stone Shiv", description: "Discard to do D6 Wounds to an adjacent Enemy, ignoring Defense. Performer Only.", source: "Saloon" },
      { item: "Dynamite", description: "Discard to throw as a Ranged Attack. Range: Strength +3. Exploding Dynamite affects models in target and adjacent spaces for D6 Wounds, ignoring Defense.", source: "Frontier Outpost, General Store, Mining Operation, Mutant Quarter" },
      { item: "Exotic Herbs", description: "Discard to remove D3 Corruption Points.", source: "Street Market, Tea House, Trade Cart, Western Trading Post" },
      { item: "Fine Cigar", description: "Discard to gain Armor 3+ until the end of the turn.", source: "Gambling Hall" },
      { item: "Fire Sake", description: "Discard to gain D3 Fury Tokens. (Samurai only)", source: "Blacksmith, Gambling Parlor, Samurai Lord, Street Market, Tavern" },
      { item: "Flash", description: "Discard to make all Enemies -2 Initiative until end of turn.", source: "Blacksmith, Command Post, Dwarf Cave, Guard House, Mining Operation, Spanish Armory, Swordsmith, Western Trading Post" }
    ]
  },
  {
    category: "Large Side Bag Tokens",
    entries: [
      { item: "Amulet of Light", description: "Discard to cancel a Darkness card, as well as all others currently in play.", source: "—" },
      { item: "Elixer of Fortitude", description: "Discard to gain 1 Sanity or remove a Madness.", source: "—" },
      { item: "Elixer of Purity", description: "Discard to gain 1 Corruption Resistance or remove a Mutation or Curse.", source: "—" },
      { item: "Elixer of Vitality", description: "Discard to gain 1 Health or remove an Injury.", source: "—" }
    ]
  },
];

export const flattenTokens = () => {
  const all = [];
  for (const cat of LIBRARY_ENTRIES) {
    if (!Array.isArray(cat.entries)) continue;
    for (const e of cat.entries) {
      all.push({
        name: e.item,
        description: e.description,
        source: e.source,
        category: cat.category,
      });
    }
  }
  // de-dupe by lowercased name
  const map = new Map();
  for (const t of all) map.set(t.name.toLowerCase(), t);
  return [...map.values()];
};
