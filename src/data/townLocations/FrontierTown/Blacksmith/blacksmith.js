// Frontier Town — Blacksmith Event Chart
// Fully rules-accurate transcription from the official card.

export default {
  2: {
    name: "Dark Stone Poisoning",
    effect:
      "Spending so much time working with Dark Stone has driven the blacksmith mad and he has finally snapped! Coming at you with a hot poker, you must make a Strength 5+ test to overpower him OR an Agility 5+ test to dodge and trip him into the fire. If failed, you are stabbed with the poker, searing into your side and giving you a nasty Dark Stone Scar that will never fully heal (lose D6 Health permanently). Either way, the blacksmith himself is shot dead. The Blacksmith is closed until after the next Adventure.",
    log: [
      "Make Strength 5+ OR Agility 5+.",
      "Fail → Gain a permanent Dark Stone Scar: lose D6 Max Health.",
      "Shop closed until after next Adventure."
    ],
  },

  3: {
    name: "Wild Horse",
    effect:
      "A horse has broken free of the stables and threatens to run wild through the town! Make a Strength 5+ test to get the wild beast under control. If passed, the blacksmith pays you $100 for your trouble. If failed, the horse wreaks havoc in town and smashes through one of the neighboring businesses! A Random building in Town is destroyed and may not be visited until after the next Adventure. Any Heroes that are in that building must pass an Agility 4+ test to get out just in time, or roll once on the Injury Chart as the building collapses down on top of them.",
    log: [
      "Strength 5+.",
      "Pass → Gain $100.",
      "Fail → Random Town location destroyed this Town Stay.",
      "Heroes inside make Agility 4+ or roll once on Injury Chart."
    ],
  },

  4: {
    name: "Cost Increase",
    effect:
      "There's more work than one blacksmith can handle! All purchase prices are +$100. Cancels out 'Forging Sale'.",
    log: [
      "Apply shop modifier: +$100 to all Blacksmith items.",
      "Cancels any active 'Forging Sale'.",
    ],
  },

  5: {
    name: "Cost Increase",
    effect:
      "There's more work than one blacksmith can handle! All purchase prices are +$100. Cancels out 'Forging Sale'.",
    log: [
      "Same as roll 4: price increase.",
    ],
  },

  6: {
    name: "Black Smoke and Horse Manure",
    effect: "Makes you feel alive! No Event.",
    log: [],
  },

  7: {
    name: "Black Smoke and Horse Manure",
    effect: "Makes you feel alive! No Event.",
    log: [],
  },

  8: {
    name: "Black Smoke and Horse Manure",
    effect: "Makes you feel alive! No Event.",
    log: [],
  },

  9: {
    name: "Forging Sale!",
    effect:
      "Business is slow, since the creatures attacked the other night. All purchase prices are reduced by –$50 (to a minimum of $10). Cancels out 'Cost Increase'.",
    log: [
      "Apply shop modifier: –$50 to all Blacksmith items (min $10).",
      "Cancels any active 'Cost Increase'.",
    ],
  },

  10: {
    name: "Forging Sale!",
    effect:
      "Business is slow, since the creatures attacked the other night. All purchase prices are reduced by –$50 (to a minimum of $10). Cancels out 'Cost Increase'.",
    log: [
      "Same as roll 9: sale active.",
    ],
  },

  11: {
    name: "Rare Find",
    effect:
      "The blacksmith has an Artifact recovered from the mines near here that he would be willing to part with in trade for some Dark Stone. Draw a Mine Artifact card. You may purchase it for D6+1 Dark Stone.",
    log: [
      "Draw 1 Mine Artifact.",
      "May purchase it for (D6 + 1) Dark Stone."
    ],
  },

  12: {
    name: "Unique Forging",
    effect:
      "Recognizing your virtue as a hunter, the blacksmith pulls out an old looking piece of parchment from a chest. He tells you that it has been waiting for the 'Chosen' Hero to come through town and he believes you to be that one. The ancient runic depiction on the parchment is unique and powerful, but also dangerous. If you are willing, he will forge it onto one of your items for free, changing one of your items with an empty Upgrade Slot. That Upgrade Slot is filled and the item now has the following: Free Attack – Once per Adventure, do D6 Damage to every adjacent Enemy, ignoring Defense.",
    log: [
      "Choose one item you own that has an empty Upgrade Slot.",
      "Slot is filled with: Free Attack (Once per Adventure → D6 Damage to all adjacent Enemies, ignoring Defense).",
    ],
  },
};
