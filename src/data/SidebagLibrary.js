// src/data/SidebagLibrary.js
export const LIBRARY_ENTRIES = [
  {
    category: "Side Bag Tokens",
    entries: [
      { item: "Ale", description: "Discard to Heal D6 Sanity Damage from yourself or an adjacent Hero.", source: "Expedition Supplies – Viking Camp, Saloon" },
      { item: "Anti-Rad", description: "Discard to remove D6 Corruption Points.", source: "Field Hospital, Mutant Quarter" },
      { item: "Bandages", description: "Discard to Heal D6 Wounds from yourself or an adjacent Hero.", source: "Brotherhood Temple, Desert Marketplace, Doc's Office, Expedition Supplies, Field Hospital, Frontier Town Camp Site, General Store, Gladiator Arena, House of Healing, Mutant Quarter, Sacred Garden, Scavenger Doc, Viking Healer, Village Market, Western Trading Post" },
      { item: "Blessed Bandages", description: "Discard to Heal 2D6 Wounds from yourself or an adjacent Hero. You also take a Blessed Aura from the Deck and gain one Defense.", source: "Church, Brotherhood Temple" },
      { item: "Bomb", description: "Discard to Throw and Stun. All models in same and adjacent spaces take D6 Hits and gain a Stunned Marker.", source: "Dwarf Cave, Expedition Supplies – Conquistador Camp, Guard House, Samurai Lord, Spanish Armory, Village Market" },
      { item: "Brimstone Ash", description: "Discard at any time to do 1 Wound to every adjacent Enemy, ignoring Defense.", source: "Church" },
      { item: "Dark Stone Shiv", description: "Discard to do D6 Wounds to an adjacent Enemy, ignoring Defense. Performer Only.", source: "Saloon" },
      { item: "Dynamite", description: "(Pre Attack) Discard to Throw at Range of Strength +3. Uses Melee To Hit. Does D6 Wounds (ignoring Defense) to D6 +1 Damage or 6 Burst or Spread. To move the Dynamite. All models in the same and adjacent spaces take D6 Wounds on Hit. Also if Dynamite would move into a wall, instead cancel that bounce.", source: "Frontier Outpost, General Store, Mining Operation, Mutant Quarter" },
      { item: "Exotic Herbs", description: "Discard to remove D3 Corruption Points.", source: "Street Market, Tea House, Trade Cart, Western Trading Post" },
      { item: "Fine Cigar", description: "Discard to gain Armor 3+ until the end of the turn.", source: "Gambling Hall" },
      { item: "Fire Sake", description: "Discard to gain D3 Fury Tokens. (Samurai only)", source: "Blacksmith, Gambling Parlor, Samurai Lord, Street Market, Tavern" },
      { item: "Flash", description: "Discard to make all Enemies -2 Initiative until the end of the turn.", source: "Blacksmith, Command Post, Dwarf Cave, Guard House, Mining Operation, Spanish Armory, Swordsmith, Western Trading Post" },
      { item: "Grit", description: "Discard to Recover 1 Grit.", source: "Various" },
      { item: "Hatchet", description: "Discard to throw it as a Ranged Free Attack. Range: Strength +2. Does D3 Wounds, ignoring Defense.", source: "Indian Trading Post" },
      { item: "Magik Tonic", description: "Discard to Recover a Grit and, until the end of the turn, you may Re-roll dice with Grit even if they have already been Re-rolled. (Limit 1 per turn)", source: "Various" },
      { item: "Potion", description: "Discard to add +2 to one of your Stats (Agility, Lore, etc) until the end of the turn.", source: "Various" },
      { item: "Sake", description: "Discard to gain benefits. (Forbidden Fortress)", source: "Forbidden Fortress" },
      { item: "Salve", description: "Discard to Heal D6 Sanity Damage from yourself or an adjacent Hero.", source: "Various" },
      { item: "Strong Sake", description: "Discard to gain enhanced benefits. (Forbidden Fortress)", source: "Forbidden Fortress" },
      { item: "Tea", description: "Discard to Heal 1D6 Health/Sanity or Recover 1 Ability token. (Limit 1 per turn)", source: "Tea House, Feudal Village" },
      { item: "Tonic", description: "Discard to Recover D3 Grit.", source: "Doc's Office, General Store, Field Hospital, Forbidden Fortress" },
      { item: "Void Sake", description: "Discard to Take 1 Corruption Hit to remove D3 Status Effect markers.", source: "Forbidden Fortress" },
      { item: "Whiskey", description: "Discard to Heal D6 Sanity Damage from yourself or an adjacent Hero.", source: "General Store, Mutant Quarter, Saloon" },
      { item: "Wine", description: "Discard to Heal Peril die Sanity.", source: "Various" }
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
