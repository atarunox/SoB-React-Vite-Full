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
  {
    category: "Status/Condition Markers",
    entries: [
      { item: "Bleeding", description: "-3 Health per marker. Remove all when KO'd or with 1 Grit.", source: "—" },
      { item: "Burning", description: "Take 2 Wounds (ignoring Defense) at start of Activation, then remove one marker.", source: "—" },
      { item: "Cooldown", description: "Skip weapon attack this turn. Remove the marker at end of Activation.", source: "—" },
      { item: "Death Mark", description: "Enemies deal +2 Damage to bearer. Removed on KO or adventure end.", source: "—" },
      { item: "Energy Shield", description: "Discard one to cancel all damage from a Hit. Roll 5+ each turn to regain.", source: "—" },
      { item: "Ensnared", description: "Can't move, -1 Defense. Strength 5+ to remove.", source: "—" },
      { item: "Entangle", description: "While entangled: -1 Defense. If hit again, take 2D6 Damage ignoring Defense.", source: "—" },
      { item: "Exertion", description: "If enclosed by barriers, take D6 Wounds at 3+ markers. Remove one per turn outside.", source: "—" },
      { item: "Noise", description: "Gain markers for moving, attacking, using items, etc. Remove D6 at start of Activation.", source: "—" },
      { item: "Poison", description: "Roll D6 per marker: 1–2 = 1 Wound, 6 = remove token.", source: "—" },
      { item: "Potent Poison", description: "Roll D6 per marker: 1–3 = that many Wounds. 6 = remove token.", source: "—" },
      { item: "Shaken", description: "-1 Grit & Ability Tokens per marker. Remove one if you move 6+ in a turn.", source: "—" },
      { item: "Stunned", description: "-1 Defense. Roll 4+ to remove 1 at start of Activation.", source: "—" },
      { item: "Unwanted Attention", description: "On a Location roll of 7, you may be attacked. Removed after Town Stay.", source: "—" },
      { item: "Void Venom", description: "-1 To Hit. Remove at end of Activation.", source: "—" },
      { item: "Webbed", description: "-1 Move per token and +1 Damage from Hits. Strength 5+ to remove.", source: "—" }
    ]
  },
  {
    category: "Ability Tokens",
    entries: [
      { item: "Ambition", description: "Conquistador Team Heroes, Cursed Eternal", source: "—" },
      { item: "Faith", description: "Preacher / Nun", source: "—" },
      { item: "Fortune", description: "Gambler", source: "—" },
      { item: "Fury", description: "Damiyo, Samurai Warrior, Wandering Samurai", source: "—" },
      { item: "Ki", description: "Traveling Monk", source: "—" },
      { item: "Magik", description: "Dark Stone Shaman, Blood Priestess / Blood Priest", source: "—" },
      { item: "Mana", description: "Sorcerer / Sorceress, Kitsune", source: "—" },
      { item: "Rage", description: "Ulfsark Skinwalker, Viking Team Heroes", source: "—" },
      { item: "Strike", description: "Trederran Strike Team Heroes", source: "—" }
    ]
  },
  {
    category: "Hits",
    entries: [
      { item: "Hits", description: "Cause Wounds unless prevented by Defense.", source: "—" },
      { item: "Horror Hits", description: "Cause Sanity Damage unless prevented by Willpower.", source: "—" },
      { item: "Corruption Hits", description: "Cause Corruption Points unless prevented by Willpower.", source: "—" },
      { item: "Hex Hits", description: "Deal Wounds, resisted with Willpower.", source: "—" },
      { item: "Toxin Hits", description: "Apply Poison tokens. Defended with Defense.", source: "—" }
    ]
  },
  {
    category: "Key Terms and Rules",
    entries: [
      { item: "Adjacent", description: "Spaces that share an edge. Also includes the other side of Gates.", source: "—" },
      { item: "Line of Sight", description: "A clear path with no obstructions between two points.", source: "—" },
      { item: "Cover", description: "Defensive bonus vs. Ranged Attacks.", source: "—" },
      { item: "Critical Hit", description: "A Hit that bypasses Defense or deals extra damage.", source: "—" },
      { item: "Hold Back the Darkness", description: "Roll at the start of each turn to prevent Darkness advancing.", source: "—" }
    ]
  }
];


export default function Placeholder() { return null; }
