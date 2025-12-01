export const SHOPS = {
  locations: [
    {
      name: "Camp Site",
      description: "Rest and recover outside of town.",
      services: [
        "Stay overnight for $10 per day",
        "Attempt to remove 1 Injury or Madness",
        "Spend Grit to heal",
        "Scavenge for food or supplies"
      ],
      items: []
    },
    {
      name: "Blacksmith",
      description: "Forge and upgrade weapons and armor.",
      services: [
        "Buy basic weapons and armor",
        "Upgrade weapons/armor",
        "Repair items"
      ],
      items: [
        { name: "Iron Sword", cost: 150, effect: "+1 Damage" },
        { name: "Chainmail", cost: 200, effect: "+4 Armor" },
        { name: "Upgrade Token", cost: 100, effect: "+1 to upgrade rolls" }
      ]
    },
    {
      name: "Church",
      description: "Heal and purify the soul.",
      services: [
        "Blessings and healing",
        "Remove Madness or Corruption",
        "Exorcism"
      ],
      items: [
        { name: "Healing Ritual", cost: 100, effect: "Recover D6 Wounds/Sanity" },
        { name: "Blessing of Protection", cost: 250, effect: "+1 Resistance vs Darkness" }
      ]
    },
    {
      name: "Doc's Office",
      description: "Medical services and surgery.",
      services: [
        "Heal wounds and sanity",
        "Remove Injury or Madness",
        "Buy Tonics and Injections"
      ],
      items: [
        { name: "Medical Tonic", cost: 100, effect: "Recover D6 Health or Sanity" },
        { name: "Surgical Injection", cost: 250, effect: "Attempt to remove Injury or Madness" }
      ]
    },
    {
      name: "Frontier Outpost",
      description: "Military gear and combat training.",
      services: [
        "Buy gear and explosives",
        "Receive Combat Training",
        "Buy armor vests and helmets"
      ],
      items: [
        { name: "Ammo Box", cost: 75, effect: "Replenish all Ammo counters" },
        { name: "Field Medkit", cost: 150, effect: "Heal 1D6 Wounds/Sanity once per adventure" },
        { name: "Grenade", cost: 100, effect: "Explosive, Range 3, Damage 2D6" }
      ]
    },
    {
      name: "Gambling Hall",
      description: "Risk gold and Grit for big payouts.",
      services: [
        "Play poker or dice",
        "Wager gold or Grit",
        "Special tables for Gamblers"
      ],
      items: [
        { name: "Poker Game", cost: 0, effect: "Win $500 on a 6, lose Grit on a 1" },
        { name: "High Stakes Dice", cost: 100, effect: "Win $300 on 5+, lose $200 on 1–2" }
      ]
    },
    {
      name: "General Store",
      description: "Stock up on adventuring goods.",
      services: [
        "Buy tokens and tools",
        "Refill Lantern Oil",
        "Upgrade Side Bag"
      ],
      items: [
        { name: "Lantern Oil", cost: 25, effect: "Refill Lantern" },
        { name: "Whiskey", cost: 50, effect: "Recover D6 Sanity" },
        { name: "Bandages", cost: 50, effect: "Recover D6 Wounds" }
      ]
    },
    {
      name: "Indian Trading Post",
      description: "Buy tribal gear and totems.",
      services: [
        "Trade artifacts",
        "Participate in rituals",
        "Receive spirit blessings"
      ],
      items: [
        { name: "Totem of the Bear", cost: 300, effect: "+1 Strength, once per adventure reduce 2 Wounds" },
        { name: "Spirit Charm", cost: 150, effect: "+1 to Willpower tests" }
      ]
    },
    {
      name: "Saloon",
      description: "Drink, gossip, and recruit allies.",
      services: [
        "Buy drinks for sanity",
        "Hire mercenaries",
        "Hear town gossip"
      ],
      items: [
        { name: "Whiskey Shot", cost: 25, effect: "Recover D3 Sanity" },
        { name: "Strong Drink", cost: 50, effect: "Recover D6 Sanity, roll for intoxication" },
        { name: "Tales of Woe", cost: 0, effect: "Roll D6: 5+ gain clue or reroll" }
      ]
    }
  ]
};


export default function Placeholder() { return null; }
