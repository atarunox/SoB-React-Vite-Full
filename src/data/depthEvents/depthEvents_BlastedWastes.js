// depthEvents_BlastedWastes.js
export const DEPTH_EVENTS_BLASTED = [
  {
    roll: 1,
    name: "Radiation Surge",
    flavor: "Your Dark Stone begins to pulse rapidly as a wave of intense radiation sweeps through the area. The very air shimmers with heat and void energy.",
    effect: "Each Hero takes D3 Corruption Hits, ignoring Willpower. For each Dark Stone a Hero is carrying, they take 1 additional Corruption Hit. Any Hero with Tech Armor reduces the total by 1."
  },
  {
    roll: 2,
    name: "Scrap Storm",
    flavor: "A howling wind kicks up, hurling jagged chunks of metal debris and shattered machinery through the air like deadly projectiles!",
    effect: "Each Hero takes D6 Hits at 2 Damage each. Heroes wearing Head gear reduce this to D3 Hits. After the storm passes, each Hero may collect D3 Scrap Tokens from the debris."
  },
  {
    roll: 3,
    name: "Sinkhole",
    flavor: "Without warning, the cracked earth opens up beneath you, revealing a dark pit lined with rusted metal and broken machinery from a buried installation.",
    effect: "Each Hero must make an Agility 5+ test. If failed, fall into the sinkhole — take D6 Wounds and you are separated from the group until you pass a Strength 4+ test to climb out (one attempt per turn). If passed, gain 10 XP."
  },
  {
    roll: 4,
    name: "Void Rift Echo",
    flavor: "A shimmering crack in reality appears before you, pulsing with dark energy. Through it, you can see glimpses of another world — and something is staring back.",
    effect: "Each Hero must make a Spirit 5+ test. If failed, take D6 Sanity Damage. If passed, gain 20 XP and may Recover 1 Grit. If any Hero rolls a natural 1, draw a Growing Dread card."
  },
  {
    roll: 5,
    name: "Ancient Wreckage",
    flavor: "Half-buried in the sand, the remains of a massive alien vessel stretch before you. Some of its systems still flicker with power after all these years.",
    effect: "Each Hero may make a Cunning 5+ or Lore 5+ test to salvage useful technology. If passed, gain 1 Tech Token and 15 XP. If failed, trigger a security alarm — draw a Threat card. One Hero may spend 2 Dark Stone to bypass the security entirely."
  },
  {
    roll: 6,
    name: "Ion Storm",
    flavor: "Purple lightning arcs across the sky as a massive ion storm rolls in from the wastes. The air crackles with energy and your equipment sparks dangerously.",
    effect: "Each Hero must roll a D6 for every Tech Token and Item with the Tech keyword they carry. On a roll of 1, that Token or Item is destroyed. After the storm, each surviving Hero gains 15 XP and may Heal D3 Sanity Damage."
  }
];


export default function Placeholder() { return null; }
