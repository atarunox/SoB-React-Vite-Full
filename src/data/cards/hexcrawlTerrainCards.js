// HexCrawl Terrain Cards
// Placed on the board to represent environmental hazards and features.
// Each card is placed face-down on a Map Tile and triggered when a Hero enters.

export const HEXCRAWL_TERRAIN_CARDS = [
  {
    id: "terrain_crates",
    name: "Crates",
    type: "Terrain",
    subtype: "Cover",
    effect: "Provides Cover 5+ to any model within 1 space. A Hero may spend 1 Action to Scavenge the Crates: roll D6. On 4+, draw 1 Loot Card.",
    rules: "Place adjacent to a wall or corner. Models in the same space as Crates gain Cover 5+.",
  },
  {
    id: "terrain_barrels",
    name: "Barrels",
    type: "Terrain",
    subtype: "Cover",
    effect: "Provides Cover 5+ to any model within 1 space. A Hero may spend 1 Action to search the Barrels: roll D6. On 5+, find 1 Whiskey Token or D6×$10 Gold.",
    rules: "Place adjacent to a wall. Models in the same space as Barrels gain Cover 5+.",
  },
  {
    id: "terrain_tnt_barrels",
    name: "TNT Barrels",
    type: "Terrain",
    subtype: "Hazard",
    effect: "Provides Cover 5+, but if any Ranged Attack misses its target and the To Hit roll is a 1, the TNT Barrels explode: all models within 3 spaces take D6 Wounds ignoring Defense. Remove this terrain token after the explosion.",
    rules: "Treat as Barrels for Cover. On explosion, remove the token and resolve D6 Wounds to all nearby models.",
  },
  {
    id: "terrain_corpses",
    name: "Corpses",
    type: "Terrain",
    subtype: "Difficult",
    effect: "Difficult Terrain — costs +1 Move to enter a space with Corpses. A Hero may spend 1 Action to search the Corpses: roll D6. On 4+, find D6×$10 Gold or 1 Dark Stone.",
    rules: "Costs +1 Move to enter. Provides no Cover.",
  },
  {
    id: "terrain_monster_bodies",
    name: "Monster Bodies",
    type: "Terrain",
    subtype: "Difficult",
    effect: "Difficult Terrain — costs +2 Move to enter. At the start of each turn, any Hero on a space with Monster Bodies must pass Willpower 4+ or take 1 Horror Hit. A Hero may Scavenge (1 Action): roll D6. On 4+, draw 1 Mine Artifact card.",
    rules: "Costs +2 Move to enter. Triggers Willpower check at start of each turn for Heroes in the space.",
  },
  {
    id: "terrain_dark_stone_shards",
    name: "Dark Stone Shards",
    type: "Terrain",
    subtype: "Corruption",
    effect: "Any Hero entering a space with Dark Stone Shards immediately takes 1 Corruption Hit (Willpower save applies). Heroes ending their turn in this space take an additional 1 Corruption Hit. A Hero may spend 1 Action to collect 1 Dark Stone.",
    rules: "Triggers Corruption Hit on entry and at end of turn for Heroes in the space.",
  },
  {
    id: "terrain_toxic_fumes",
    name: "Toxic Fumes",
    type: "Terrain",
    subtype: "Hazard",
    effect: "Any Hero entering a space with Toxic Fumes takes D3 Wounds ignoring Defense. Heroes starting their Activation in a space with Toxic Fumes take 1 additional Wound ignoring Defense.",
    rules: "Triggers D3 Wounds on entry. Triggers 1 additional Wound at start of Activation.",
  },
  {
    id: "terrain_unstable",
    name: "Unstable",
    type: "Terrain",
    subtype: "Hazard",
    effect: "At the start of each turn, roll D6. On a 1, all models within 2 spaces of this terrain take D3 Wounds as the ground shifts and debris falls. Heroes moving through this space must pass Agility 4+ or lose 1 Move.",
    rules: "Roll D6 at start of each turn. On 1, deal D3 Wounds to all models within 2 spaces.",
  },
  {
    id: "terrain_plant_growth",
    name: "Plant Growth",
    type: "Terrain",
    subtype: "Difficult",
    effect: "Difficult Terrain — costs +1 Move to enter. Any Hero ending their turn in Plant Growth must pass Agility 4+ or gain a Snare Marker (cannot move until Marker is removed by spending 1 Grit or 1 Action).",
    rules: "Costs +1 Move to enter. Agility 4+ test to avoid Snare Marker.",
  },
];

export default HEXCRAWL_TERRAIN_CARDS;
