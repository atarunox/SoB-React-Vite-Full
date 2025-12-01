// src/data/townLocations/churchSacredOrderItems.js
const churchSacredOrderItems = [
  {
    name: "Holy Robes",
    cost: 600,
    type: "Clothing",
    slot: "Coat",
    weight: 1,
    upgradeSlots: 1,
    tags: ["Holy"],
    effects: ["+3 Health"]
  },
  {
    name: "Holy Book",
    cost: 800,
    type: "Gear",
    tags: ["Book", "Holy", "Icon"],
    weight: 1,
    upgradeSlots: 1,
	handsRequired: 1,
    limit: "One",
	
    effects: ["+1 Combat", "+1 Faith"]
  },
  {
    name: "Book of Armageddon",
    cost: 5600,
    type: "Gear",
    tags: ["Book", "Holy", "Icon"],
    weight: 2,
    upgradeSlots: 1,
	handsRequired: 2,
    effects: [
      "+2 Combat",
      "+1 to Faith Roll Total when performing a Judgement Sermon. Natural doubles still cause Dangerous Sermon Corruption."
    ]
  },
  {
    name: "Cross of Vengeance",
    cost: 2350,
    type: "Gear",
    slot: "Hand Weapon",
    tags: ["Holy"],
    weight: 1,
    upgradeSlots: 1,
	handsRequired: 1,
    effect:
      "While you are less than Full Health, your Combat Hits are +1 Damage. While you are at less than Half Health, your Combat Hits are +2 Damage."
  },
  {
    name: "Scroll of Protection",
    cost: 400,
    type: "Gear",
    tags: ["Holy", "Scroll"],
    effect: "Discard to cancel a Darkness card on a D6 Roll of 3+."
  },
  {
    name: "Icon of Resistance",
    cost: 1400,
    type: "Gear",
    tags: ["Holy", "Icon"],
    limit: "One",
    effect: "Re-roll one single failed Defense roll per turn."
  },
  {
    name: "Censer of Illumination",
    cost: 3200,
    type: "Gear",
    tags: ["Light", "Holy"],
    weight: 1,
    upgradeSlots: 1,
    effect:
      "Once per Adventure. Pass 1 Faith Roll per Sermon automatically (limit one)."
  }
];

export default churchSacredOrderItems;
