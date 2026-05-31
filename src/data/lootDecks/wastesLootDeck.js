// Wasteland Loot Deck — used in Canyons and Blasted Wastes instead of standard loot deck
// Duplicates are intentional — they match the physical card count.

export default [
  // ── Scrap ─────────────────────────────────────────────────────────────────
  { name: "Small Scrap — Gain 1 Scrap Token.",   type: "Scrap", xp: 15 },
  { name: "Small Scrap — Gain 1 Scrap Token.",   type: "Scrap", xp: 15 },
  { name: "Small Scrap — Gain 1 Scrap Token.",   type: "Scrap", xp: 15 },
  { name: "Small Scrap — Gain 1 Scrap Token.",   type: "Scrap", xp: 15 },
  { name: "Hunk of Scrap — Gain D3 Scrap Tokens.", type: "Scrap", xp: 15 },
  { name: "Hunk of Scrap — Gain D3 Scrap Tokens.", type: "Scrap", xp: 15 },
  { name: "Load of Scrap — Gain D6 Scrap Tokens.", type: "Scrap", xp: 15 },

  // ── Tech ──────────────────────────────────────────────────────────────────
  { name: "Piece of Tech — Gain 1 Tech Token.", type: "Tech", xp: 15 },
  { name: "Piece of Tech — Gain 1 Tech Token.", type: "Tech", xp: 15 },

  // ── Gold ──────────────────────────────────────────────────────────────────
  { name: "Alien Coins — Gain D6 x $25.", type: "Gold", xp: 15 },
  { name: "Alien Coins — Gain D6 x $25.", type: "Gold", xp: 15 },

  // ── Dark Stone ────────────────────────────────────────────────────────────
  { name: "Dark Stone Dust — Gain 1 Dark Stone.", type: "Dark Stone", xp: 15 },

  // ── Supplies ──────────────────────────────────────────────────────────────
  { name: "Supply Stash — Choose one: gain 1 Spice Token, 1 Bandage Token, or 1 Whiskey Token.", type: "Supply", xp: 15 },

  // ── Artifact ──────────────────────────────────────────────────────────────
  { name: "Something in the Sand — Draw a Blasted Wastes Artifact card.", type: "Artifact", xp: 15 },
  { name: "Something in the Sand — Draw a Blasted Wastes Artifact card.", type: "Artifact", xp: 15 },

  // ── Gear / Artifact (mixed table) ─────────────────────────────────────────
  { name: "Relic From Another Place — Roll D6: 1–4 draw a Gear card; 5 draw a Mine Artifact; 6 draw a Random World Artifact.", type: "Gear", xp: 15 },
];
