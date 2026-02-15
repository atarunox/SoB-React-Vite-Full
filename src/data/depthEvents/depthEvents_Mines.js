// depthEvents_Mines.js
export const DEPTH_EVENTS_MINES = [
  {
    roll: 1,
    name: "Cave-In",
    flavor: "The timbers overhead groan and crack as tons of rock and debris come crashing down around you!",
    effect: "Each Hero must make an Agility 5+ test. If failed, take D6 Wounds ignoring Armor. The exit you came from is now blocked — you must find another way out."
  },
  {
    roll: 2,
    name: "Dark Stone Vein",
    flavor: "The walls of this tunnel shimmer with an eerie purple glow as veins of raw Dark Stone pulse with energy all around you.",
    effect: "Each Hero gains 1 Dark Stone but must also take 1 Corruption Hit. Any Hero with a Pickaxe or Mining Tool gains an additional D3 Dark Stone."
  },
  {
    roll: 3,
    name: "Flooded Tunnel",
    flavor: "Icy black water seeps up from the ground, quickly flooding the tunnel ahead. The water is murky and cold, hiding whatever lurks beneath.",
    effect: "All Heroes on this Map Tile treat all movement as Rough Terrain (costs double). Each Hero must make a Strength 4+ test or lose 1 Side Bag Token, swept away by the current."
  },
  {
    roll: 4,
    name: "Abandoned Camp",
    flavor: "You stumble across the remains of a miner's camp — a cold fire pit, scattered supplies, and a journal with the last entry reading simply: 'They come from below.'",
    effect: "Each Hero may draw 1 Scavenge card. One Hero of the Posse's choice may Heal D3 Wounds. If any Scavenge card drawn is a Dark Stone, take 1 Corruption Hit."
  },
  {
    roll: 5,
    name: "Unstable Ground",
    flavor: "The floor beneath your feet shifts and buckles. Through the cracks, you can see nothing but blackness — a seemingly bottomless chasm below.",
    effect: "Each Hero must make a Luck 4+ test. If failed, you stumble and fall, taking D3 Wounds. If the roll is a natural 1, you also drop 1 random Item into the void below."
  },
  {
    roll: 6,
    name: "Whispering Walls",
    flavor: "A low, barely audible whisper seems to emanate from the stone walls themselves. The sound speaks your name and promises dark secrets if you only listen...",
    effect: "Each Hero must make a Spirit 5+ test. If passed, gain 25 XP as you resist the whispers. If failed, take D6 Sanity Damage and gain 1 Corruption Hit. Any Hero that rolls a natural 6 on the test also gains +1 Lore until end of Adventure."
  }
];


export default function Placeholder() { return null; }
