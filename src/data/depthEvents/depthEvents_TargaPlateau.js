// depthEvents_TargaPlateau.js
export const DEPTH_EVENTS_TARGA = [
  {
    roll: 1,
    name: "Frozen Passage",
    flavor: "The corridor ahead is encased in thick ice. Ancient alien machinery is visible beneath the frozen surface, still blinking with faint lights.",
    effect: "All movement on this Map Tile costs double. Each Hero must make a Strength 4+ test to break through. If failed, take D3 Wounds from the bitter cold. Heroes wearing 3 or more Clothing items are immune to the Wounds."
  },
  {
    roll: 2,
    name: "Cryo Chamber",
    flavor: "You enter a vast chamber lined with hundreds of cryo tubes, most shattered and empty. A few still glow with an eerie blue light, their occupants preserved for millennia.",
    effect: "Each Hero may make a Lore 5+ test to examine a tube. If passed, gain 25 XP and roll a D6: on 5-6, draw a Targa Artifact card. If failed, the tube shatters — take D3 Wounds from frozen shrapnel and 1 Corruption Hit from the ancient void energy released."
  },
  {
    roll: 3,
    name: "Ice Quake",
    flavor: "The ground shakes violently as massive cracks spread through the ice beneath your feet. The ancient structure groans under the strain.",
    effect: "Each Hero must make an Agility 5+ test. If failed, you fall through the ice — take D6 Wounds and are placed on a random adjacent space. If the roll is a natural 1, also lose 1 random Item that falls into the crevasse."
  },
  {
    roll: 4,
    name: "Alien Murals",
    flavor: "The walls of this chamber are covered in intricate alien carvings that seem to tell a story of destruction, flight, and desperate hope. Some of the symbols pulse with residual energy.",
    effect: "Each Hero may make a Lore 6+ test. If passed, gain 30 XP and +1 to all Skill Tests on this Map Tile as you decipher the alien warnings. If failed, the symbols burn your mind — take D3 Sanity Damage."
  },
  {
    roll: 5,
    name: "Dormant Sentinel",
    flavor: "A massive alien construct stands motionless in the center of the chamber. Its single eye flickers between darkness and a dull red glow. Is it watching you?",
    effect: "Each Hero must make a Cunning 4+ test to sneak past. If any Hero fails, the Sentinel activates — draw a Threat card. If all Heroes pass, gain 20 XP each and you may loot the chamber for D3 Dark Stone."
  },
  {
    roll: 6,
    name: "Blizzard Breach",
    flavor: "A section of the ancient structure has collapsed, exposing the interior to the howling blizzard outside. Wind and snow blast through the breach with terrifying force.",
    effect: "Each Hero takes D3 Wounds from the extreme cold, ignoring Armor. Any Hero with a Light Source loses it as the wind extinguishes it. Heroes may spend 1 Grit to brace against the storm and take no Wounds. After weathering the storm, each Hero gains 15 XP."
  }
];


export default function Placeholder() { return null; }
