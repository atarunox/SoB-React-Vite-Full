// depthEvents_CavernsOfCynder.js
// Caverns of Cynder — a hellish OtherWorld of molten rock, ash, and fire.
export const DEPTH_EVENTS_CYNDER = [
  {
    roll: 1,
    name: "Eruption",
    flavor: "The ground splits open and a geyser of molten rock blasts toward the cavern ceiling, showering the area in burning cinders.",
    effect: "Each Hero must make an Agility 5+ test. If failed, take D6 Wounds ignoring Armor and gain a Burning marker (D6 Wounds at the start of each Activation; roll 4+ to extinguish)."
  },
  {
    roll: 2,
    name: "Cinder Vein",
    flavor: "Rivulets of glowing Dark Stone run molten through the rock here, hot enough to scald yet impossible to ignore.",
    effect: "Each Hero may collect 1 Dark Stone but takes 1 Corruption Hit and 1 Wound from the heat (ignoring Armor). Any Hero with Fire Immunity ignores the Wound."
  },
  {
    roll: 3,
    name: "Choking Ash",
    flavor: "A cloud of black volcanic ash rolls through the cavern, searing the lungs and blinding the eyes.",
    effect: "Until the start of the next turn, all Heroes are at -1 to all To Hit rolls (minimum 1). Each Hero must make a Strength 4+ test or take D3 Wounds ignoring Armor."
  },
  {
    roll: 4,
    name: "Obsidian Shards",
    flavor: "The floor is carpeted with razor-edged volcanic glass that shifts and cracks underfoot.",
    effect: "All movement on this Map Tile is Rough Terrain (costs double). Each Hero that moves this turn must make an Agility 4+ test or take D3 Wounds ignoring Defense."
  },
  {
    roll: 5,
    name: "Rising Heat",
    flavor: "The temperature climbs to unbearable levels as the very air begins to shimmer and warp.",
    effect: "Each Hero must make a Strength 5+ test. If failed, lose 1 Grit from exhaustion (Heroes with 0 Grit take 1 Wound instead). Any Hero carrying 3+ Dark Stone takes 1 additional Corruption Hit as the stone flares."
  },
  {
    roll: 6,
    name: "Whispers of the Flame",
    flavor: "The fires speak with a thousand burning voices, promising power to any who would listen and be consumed.",
    effect: "Each Hero must make a Spirit 5+ test. If passed, gain 25 XP. If failed, take D6 Sanity Damage and gain 1 Corruption Hit. Any Hero that rolls a natural 6 also gains +1 Spirit until end of Adventure."
  }
];

export default function Placeholder() { return null; }
