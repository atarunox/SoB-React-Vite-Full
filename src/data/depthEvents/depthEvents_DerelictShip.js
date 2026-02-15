// depthEvents_DerelictShip.js
export const DEPTH_EVENTS_DERELICT = [
  {
    roll: 1,
    name: "Hull Breach",
    flavor: "A section of the ship's hull groans and buckles before tearing open, exposing the corridor to the vacuum of space. Emergency bulkheads begin to slam shut!",
    effect: "Each Hero must make an Agility 5+ test to reach safety before the bulkheads seal. If failed, take D6 Wounds from decompression and debris. The Hero furthest from the exit must make a Strength 4+ test or be pulled toward the breach — take an additional D3 Wounds."
  },
  {
    roll: 2,
    name: "Flickering Lights",
    flavor: "The ship's lighting systems fail, plunging you into absolute darkness. Emergency lights strobe on and off, casting horrifying shadows that seem to move on their own.",
    effect: "Each Hero must make a Spirit 4+ test. If failed, take D6 Sanity Damage. All Heroes are at -1 to Ranged To Hit rolls on this Map Tile until a Light Source is activated. Any Hero carrying a Tech Light Source is immune to the Spirit test."
  },
  {
    roll: 3,
    name: "Toxic Leak",
    flavor: "A ruptured conduit sprays a stream of glowing green fluid across the corridor. The acrid smell burns your nostrils and the liquid sizzles where it touches metal.",
    effect: "Each Hero on this Map Tile takes 1 Corruption Hit. Any Hero that moves through the leak takes an additional D3 Wounds, ignoring Armor. The leak remains until a Hero makes a Cunning 5+ test to seal the conduit."
  },
  {
    roll: 4,
    name: "Ship's Log",
    flavor: "You discover a functioning terminal displaying the ship's final log entries. The crew's desperate messages paint a picture of something aboard that shouldn't be.",
    effect: "Each Hero may make a Lore 5+ test to access the logs. If passed, gain 20 XP and learn the layout — next Exploration draws 2 extra map cards (choose 1). If failed, a security lockdown triggers and all doors on this Map Tile are sealed until a Cunning 4+ test is passed."
  },
  {
    roll: 5,
    name: "Gravity Failure",
    flavor: "The artificial gravity in this section fluctuates wildly. One moment you're pinned to the floor, the next you're floating helplessly toward the ceiling.",
    effect: "Each Hero must make a Luck 4+ test. If failed, you slam into the ceiling or wall — take D3 Wounds. All movement on this Map Tile is at -2 Move (min 1). Any Hero with Mag-Boots or similar equipment ignores this effect entirely."
  },
  {
    roll: 6,
    name: "Containment Failure",
    flavor: "Red warning lights flash as a containment field in the far wall begins to collapse. Whatever was sealed inside is about to be freed after centuries of imprisonment.",
    effect: "Draw a Growing Dread card. Each Hero must make a Spirit 5+ test. If failed, take D6 Sanity Damage as the entity's psychic presence washes over you. If all Heroes pass, gain 25 XP each and the entity retreats. Any Hero that rolls a natural 6 also gains +1 Max Sanity permanently."
  }
];


export default function Placeholder() { return null; }
