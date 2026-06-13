// depthEvents_Trederra.js
// Trederra — a war-torn alien OtherWorld of toxic skies, ruined tech, and radiation.
export const DEPTH_EVENTS_TREDERRA = [
  {
    roll: 1,
    name: "Radiation Surge",
    flavor: "An invisible wave of alien radiation pulses through the ruins, setting your teeth on edge and your skin crawling.",
    effect: "Each Hero must make a Spirit 5+ test. If failed, take D3 Wounds ignoring Armor and gain 1 Corruption Hit as the radiation seeps into the body."
  },
  {
    roll: 2,
    name: "Crystal Dark Stone",
    flavor: "Jagged spires of crystalline Dark Stone erupt from the broken ground, humming with alien energy.",
    effect: "Each Hero may collect 1 Dark Stone but must take 1 Corruption Hit. Any Hero with a Tech item or Trederran Gear gains an additional D3 Dark Stone."
  },
  {
    roll: 3,
    name: "Toxic Mist",
    flavor: "A sickly green mist drifts low across the wasteland, dissolving everything it touches.",
    effect: "All Heroes on this Map Tile gain a Poison marker (1 Wound ignoring Defense at the end of each turn; spend 1 Grit to remove). Each Hero must make a Strength 4+ test or lose 1 Side Bag Token to corrosion."
  },
  {
    roll: 4,
    name: "Malfunctioning Sentry",
    flavor: "A long-dormant alien defense turret whirs to life, its targeting array locking onto the nearest movement.",
    effect: "The Hero nearest the center of the Map Tile takes a Ranged Hit (Range 10, To Hit 4+, Damage 4). If no Hero is hit, the sentry instead spawns a Low Threat Ambush at the start of the next turn."
  },
  {
    roll: 5,
    name: "Unstable Gravity",
    flavor: "Reality buckles as the alien world's gravity flickers, throwing everything off balance.",
    effect: "Each Hero must make an Agility 4+ test. If failed, you are flung D3 spaces in a random direction (DM chooses) and take 1 Wound. Heroes that pass may immediately move 1 free space."
  },
  {
    roll: 6,
    name: "Echoes of the War",
    flavor: "The psychic residue of an ancient, world-ending war floods your mind with visions of alien slaughter.",
    effect: "Each Hero must make a Spirit 5+ test. If passed, gain 25 XP from the alien insight. If failed, take D6 Sanity Damage and gain 1 Corruption Hit. Any Hero that rolls a natural 6 also gains +1 Lore until end of Adventure."
  }
];

export default function Placeholder() { return null; }
