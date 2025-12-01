// src/data/townLocations/sheriffsOfficeWantedPoster.js

const sheriffsOfficeWantedPoster = [
  {
    id: "wanted_poster",
    name: "Wanted Poster",
    type: "Gear",
    slot: "Extra",
    value: 100, // $100
    purchaseLimitPerVisit: 1, // enforce 1 per stay in GenericShop
    tags: ["Poster", "Law"],
    effects: [
      "Discard when you kill an Outlaw Enemy to gain D6 × $50.",
      "If you kill an Infamous Outlaw, gain D6 × $100 instead.",
      "If your Posse kills a Legendary Outlaw, gain D6 × $250."
    ],
    // (Optional) rules block if you want engine hooks:
    // rules: {
    //   discardTrigger: { onKill: { enemyTag: "Outlaw" } },
    //   payouts: {
    //     base: { die: "D6", perPipGold: 50 },
    //     infamous: { die: "D6", perPipGold: 100 },
    //     legendaryPosse: { die: "D6", perPipGold: 250 }
    //   }
    // }
  }
];

export default sheriffsOfficeWantedPoster;
