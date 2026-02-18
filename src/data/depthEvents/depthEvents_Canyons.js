// depthEvents_Canyons.js
export const DEPTH_EVENTS_CANYONS = [
  {
    roll: 1,
    name: "Rockslide",
    flavor: "The canyon walls shudder and crack as boulders and debris rain down from the cliffs above. The narrow passage leaves nowhere to run!",
    effect: "Each Hero must make an Agility 4+ test. If failed, take D6 Wounds. If the roll is a natural 1, also roll once on the Injury Chart. The path behind you is now blocked by rubble."
  },
  {
    roll: 2,
    name: "Flash Flood",
    flavor: "A distant rumble grows into a roar as a wall of muddy water comes rushing through the narrow canyon, sweeping everything in its path!",
    effect: "Each Hero must make a Strength 5+ test. If failed, you are swept D6 spaces in a random direction and take D3 Wounds. Lose 1 Side Bag Token as it's carried away by the flood. If passed, gain 10 XP."
  },
  {
    roll: 3,
    name: "Echo Canyon",
    flavor: "Your footsteps echo endlessly through the twisting canyon walls. The sound seems to amplify and distort until you can no longer tell which direction the echoes come from.",
    effect: "Each Hero must make a Cunning 4+ test. If failed, you become disoriented — you may not move for 1 turn. If any Hero fails, add 1 to the Darkness track as the noise attracts attention. If all Heroes pass, gain 15 XP each."
  },
  {
    roll: 4,
    name: "Bone Cairn",
    flavor: "Stacked against the canyon wall is a towering pile of bleached bones — human, animal, and things you cannot identify. Something has been feeding here for a long time.",
    effect: "Each Hero must make a Spirit 5+ test or take D3 Sanity Damage. Heroes may search the bones with a Luck 4+ test — if passed, find D6 x $25 Gold among the remains. If any search roll is a natural 1, disturb something sleeping — draw a Threat card."
  },
  {
    roll: 5,
    name: "Narrow Passage",
    flavor: "The canyon narrows to barely wide enough for a person to squeeze through. The walls press in from both sides, and there's no telling what waits on the other side.",
    effect: "Large enemies cannot follow through this passage. Each Hero must make an Agility 4+ test to squeeze through. If failed, take 1 Wound and discard 1 Item (too large to fit). Heroes with 3 or fewer Items pass automatically."
  },
  {
    roll: 6,
    name: "Hidden Spring",
    flavor: "Tucked behind a rock formation, you discover a natural spring of crystal-clear water. The cool shade and fresh water offer a rare moment of peace in the unforgiving canyons.",
    effect: "Each Hero may Heal D6 Wounds and D3 Sanity Damage. Recover 1 Grit. Any Hero that drinks deeply must roll a D6 — on a 1, the water carries a trace of Dark Stone, take 1 Corruption Hit."
  }
];


export default function Placeholder() { return null; }
