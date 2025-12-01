// src/data/townLocations/indianTradingPostRituals.js



const indianTradingPostRitualsShop = {
  id: "indianTradingPostRituals",
  name: "Indian Trading Post — Rituals",
  categories: {
    services: [
      {
        id: "spirit-cleansing",
        name: "Spirit Cleansing",
        type: "Service",
        cost: "D6 Dark Stone",
        limit: "Once per Visit",
        resultTable: {
          "1": "Possessed by a corrupting spirit; you are not healed and immediately gain D3 new Mutations!",
          "2-3": "Failed – Not Healed.",
          "4-5": "Success – Fully Healed.",
          "6": "Spirit Guide – Fully Healed, +1 Sanity as you bond with your spirit guide.",
        },
        ui: {
          kind: "multiStep",
          onResolveAction: "rituals/spiritCleansing",
          steps: [
            { type: "rollOnce", die: "D6", id: "costDie", label: "Pay cost: D6 Dark Stone" },
            { type: "rollOnce", die: "D6", id: "resultDie", label: "Cleansing Result (consult table)" },
          ],
        },
      },
      {
        id: "vision-quest",
        name: "Vision Quest",
        type: "Service",
        cost: "Free",
        limit: "Once per Visit",
        test: "Spirit 5+",
        description: [
          "Sitting in a smoke-filled tent, the Medicine Man leads you through a Vision Quest with your Spirit Guide.",
          "If you do not know your Spirit Guide yet, roll on the chart below. Each Hero will only ever have one Spirit Guide, and it will always be the same once determined (Grit may NOT be used to re-roll your Spirit Guide—They choose you).",
          "Pass a Spirit 5+ test to gain 25 XP and the Vision Quest Bonus listed for your Spirit Guide to use once during the next Adventure.",
        ],
        bonusTable: {
          "1": "Beaver – Do not discard a Side Bag token just used.",
          "2": "Wolf – Roll 5 extra dice for a Scavenge test.",
          "3": "Eagle – Discard and re-draw a Threat or Darkness card.",
          "4": "Mouse – Reveal 2 extra Exploration Tokens and choose which to use.",
          "5": "Crow – All Heroes are +3 Initiative on the first turn of an Ambush.",
          "6": "Snake – Gain one additional Starting Upgrade for your Hero Class for one turn (do not gain/change Starting Gear from it).",
        },
        ui: {
          kind: "multiStep",
          onResolveAction: "rituals/visionQuest",
          steps: [
            { type: "skillCheck", stat: "Spirit", target: 5, id: "pass", label: "Spirit 5+ Test" },
            { type: "grantXP", amount: 25, when: { pass: true } },
            { type: "rollOnce", die: "D6", id: "guideDie", label: "Spirit Guide (consult bonus table)", when: { pass: true } },
          ],
        },
      },
    ],
  },
};

export default indianTradingPostRitualsShop;
