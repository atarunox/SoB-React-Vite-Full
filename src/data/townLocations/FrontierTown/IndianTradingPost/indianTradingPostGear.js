// src/data/townLocations/indianTradingPostGear.js

const ACCESS_REQ = ["Tribal", "Scout"];

const indianTradingPostGearShop = {
  id: "indianTradingPostGear",
  name: "Indian Trading Post — Gear",
  categories: {
    items: [
      {
        id: "snake-skin-belt",
        name: "Snake Skin Belt",
        type: "Gear",
        slot: "Belt",
        cost: 650,
        tags: ["Belt"],
        upgradeSlots: 1,
        weight: 1,
        effects: [
          "Once per Adventure: transfer a single Enemy Hit you have taken to an adjacent model",
        ],
        oncePerAdventure: true,
        rules: {
          redirectHit: { to: "adjacentModel", perAdventure: 1 },
        },
        requiredKeywords: ACCESS_REQ,
      },

      {
        id: "cavalry-jacket",
        name: "Cavalry Jacket",
        type: "Gear",
        slot: "Coat",
        cost: 2750,
        tags: ["Coat"],
        upgradeSlots: 1,
        weight: 1,
        effects: ["Recover 1 Grit when you roll a 6 on your Move"],
        rules: {
          onMoveRoll: { die: "D6", triggers: [6], gritDelta: 1 },
        },
        requiredKeywords: ACCESS_REQ,
      },

      {
        id: "scout-bag",
        name: "Scout Bag",
        type: "Container",
        slot: "Accessory",
        cost: 2000,
        tags: ["Container"],
        upgradeSlots: 0,
        weight: 0,
        effects: [
          "Carry +2 weight of gear",
          "Items inside cannot be equipped directly",
        ],
        rules: {
          container: { extraCapacity: { weight: 2 }, equippableFromInside: false },
        },
        requiredKeywords: ACCESS_REQ,
      },

      {
        id: "medicine-bag",
        name: "Medicine Bag",
        type: "Medical",
        slot: "Accessory",
        cost: 3200,
        tags: ["Tribal", "Medical"],
        upgradeSlots: 0,
        weight: 1,
        effects: [
          "Once per Adventure, heal 3D6 Health/Sanity split across self or adjacent Heroes",
        ],
        oncePerAdventure: true,
        rules: {
          heal: {
            dice: "3D6",
            split: true,
            targets: "selfOrAdjacent",
            stats: ["Health", "Sanity"],
          },
        },
        ui: { onUseAction: "heal/3d6/split/adjacent" },
        requiredKeywords: ACCESS_REQ,
      },
    ],
  },
};

export default indianTradingPostGearShop;
