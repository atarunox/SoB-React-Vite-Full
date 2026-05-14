// src/data/townLocations/BlastedWastesTown/Temple/templeIdols.js
// Each idol has: roll 4 event, roll 10 event, blessing, and purchasable items.

export const templeIdols = {
  // ── Idol 1: Massive Warhead ─────────────────────────────────────────────────
  1: {
    name: 'Massive Warhead',
    description:
      'A massive, unexploded missile stands upright in the inner sanctum of the Temple, countless dings and dents pounded into its outer casing. The worshippers here are clearly a Doomsday Cult, devoting their lives to the chaos and randomness of the universe; the only certainty being... death.',
    event4: {
      name: 'The Hammer of Devotion',
      lore:
        "Taking turns, each of the followers steps forward and strikes the Warhead's casing with a large hammer, a testament to their devotion! Looking back at you, they hand you the hammer and clear a path.",
      effect:
        'You must either run (ending your Town Stay), or take your chances — Roll 2D6 + Strength. If the total is 13 or higher, your strike triggers the countdown sequence! This is the last day in Town for all Heroes. Every Hero takes 3 Corruption Hits from the ensuing fallout.',
    },
    event10: {
      name: 'Like There\'s no Tomorrow',
      lore:
        "Living every day at the brink of death, changes one's perspective. These followers really know how to party!",
      effect:
        'Every Hero at the Temple may Heal D6 Sanity and Recover a Grit. If you do though, you are also -1 on any Location Event roll you make in Town tomorrow.',
    },
    blessing: {
      id: 'temple_blessing_warhead',
      name: 'Blessing of Destruction',
      cost: { gold: 350 },
      type: 'Idol Blessing',
      tags: ['Idol Blessing', 'Holy'],
      limit: 'Once per Town Stay',
      effects: [
        'During the next Adventure, gain +5 XP every time you kill an Enemy, and if you are KO\'d by Wounds, gain 1 Sanity, or if KO\'d by Sanity Damage, gain 1 Health.',
      ],
    },
  },

  // ── Idol 2: The Great Kraken ────────────────────────────────────────────────
  2: {
    name: 'The Great Kraken',
    description:
      'The hall is adorned with the chiton plates and hardened shells of countless beasts that roam the desert wasteland. At the center is a massive shrine to the Great Kraken, a fire burning under a pyre of bones and teeth. The Kraken Cult that runs this Temple are known to be cannibals, feeding on the flesh of their dead to preserve the memories and bravery of an unbroken chain of descendants, said to be, from the Great Kraken itself.',
    event4: {
      name: 'Sacrifice the Chosen',
      lore:
        'The Great Kraken requires regular sacrifices to be made in its name, and the followers here always oblige. Usually this is chosen from devout volunteers, but they have taken a liking to you and decided to make an exception!',
      effect:
        'Make a Strength 5+ test to overpower the Cult of the Kraken priests that are trying to throw you into the fire pit! If successful, gain 20 XP. If failed, you are badly burned and cut up, but manage to escape without being consumed by the flames of the pyre! Your Location Visit is over and you take 2 Bleeding markers as well as D6 Wounds, ignoring Defense.',
    },
    event10: {
      name: 'Feast of Flesh',
      lore:
        'The Kraken Cult followers have lost one of their own, and they are having a celebration to eat his remains! Serving you up a portion, they stare at you intently.',
      effect:
        'If you do not eat, you are kicked out, ending your Location Visit. If you do eat, you are -3 Sanity and +1 Lore next Adventure.',
    },
    blessing: {
      id: 'temple_blessing_kraken',
      name: 'Blessing of the Kraken',
      cost: { gold: 300 },
      type: 'Idol Blessing',
      tags: ['Idol Blessing', 'Holy'],
      limit: 'Once per Town Stay',
      effects: [
        'During the next Adventure, you gain: Armor 5+.',
      ],
    },
  },

  // ── Idol 3: Dark Stone Warp Drive ───────────────────────────────────────────
  3: {
    name: 'Dark Stone Warp Drive',
    description:
      'At the center of the Temple rests a large Dark Stone Warp Core, pulled from the drive of a wrecked starship. It pulses with the power of the Void, giving off waves of heat, while the shimmering violet light dances across the walls and ceiling of the chamber. The Radiation Cult that worships here wear long robes, gloves, and masks to cover their sores and deformities; gifts from the Greater Gods of the Warp.',
    event4: {
      name: 'Radiation Leak',
      lore:
        "Though always leaking trace amounts of Dark Stone Radiation into the Temple, it would appear that there is a crack in the Warp Drive's housing which is pouring out gouts of intense radiation, and threatening to melt down!",
      effect:
        'You may either leave, ending your Location Visit and allowing the Temple to be immediately Destroyed, or try to repair the crack in the Warp Drive. To repair the crack, make a Cunning 6+ test. If successful, gain 25 XP and there is no further effect. If failed, the followers find you tampering with their Idol and burn you on the core before throwing you out! Take D6 Corruption Hits and the Temple is Destroyed anyway.',
    },
    event10: {
      name: 'Power for the Town',
      lore:
        "The followers have set up a series of cables and machinery to occasionally transfer extra power from the Warp Drive to keep the town's power running.",
      effect:
        'Do not roll for a Town Event at the end of the Day today.',
    },
    blessing: {
      id: 'temple_blessing_warp',
      name: 'Blessing of the Warp',
      cost: { gold: 150 },
      type: 'Idol Blessing',
      tags: ['Idol Blessing', 'Holy'],
      limit: 'Once per Town Stay',
      effects: [
        'During the next Adventure, you are +2 Health for each Mutation you have.',
      ],
    },
  },

  // ── Idol 4: Deactivated Mk II Warden ───────────────────────────────────────
  4: {
    name: 'Deactivated Mk II Warden',
    description:
      'Standing 30 feet tall at the center of a large cavern, this giant, deactivated Mk II Warden ominously towers over the Cult of Steel that worships at its feet. Walkways line the circular chamber, leading in to various parts of the ancient robot; altars to the Machine Ghosts that watch over the town.',
    event4: {
      name: 'Active Beacon',
      lore:
        'Though dormant for centuries, the systems of the Mk II Warden are powered by a Nuclear Fuel Cell. Even in its fail state, it occasionally pushes power to the systems, activating its homing beacon, if only for an instant; a fleeting call out to other Wardens still out there.',
      effect:
        'Make a Luck 5+ test as the signal from the Deactivated Warden momentarily triggers while you are examining its dusty surface. If failed, the long forgotten beacon has finally been received by another Warden, which attacks the Town, immediately destroying the Temple and 1 other Random Building!',
    },
    event10: {
      name: 'Tinkering with Tech',
      lore:
        'Obsessed with tech and the replacement of weak flesh with eternal metal, the Cult of Steel converts their own bodies, bit by bit, into mechanical vessels to hold their knowledge! In this way, they become one with the Machine Ghosts.',
      effect: 'You gain D3 Tech Tokens.',
    },
    blessing: {
      id: 'temple_blessing_machine_ghosts',
      name: 'Blessing of the Machine Ghosts',
      cost: { gold: 200 },
      type: 'Idol Blessing',
      tags: ['Idol Blessing', 'Holy'],
      limit: 'Once per Town Stay',
      effects: [
        'During the next Adventure, you are +1 Health for each Tech Item and Tech Token you carry.',
      ],
    },
  },

  // ── Idol 5: Hall of Bones ──────────────────────────────────────────────────
  5: {
    name: 'Hall of Bones',
    description:
      'The inner chambers of this Temple are built from, and covered in, cleaned and polished bones! There must be bones and skulls of thousands of people here, taken from many different alien races and creatures that have come to this world...clearly never to leave. In a morbid way, it\'s beautiful.',
    event4: {
      name: 'New Bones for the Hall',
      lore:
        'Winding your way through the twisting corridors of the Temple catacombs, you get the sense that you are being followed. You stop cold as a group of followers blocks the path up ahead. Turning, you discover that more have closed in behind. They seem to be looking for \'new\' bones to add to the Temple\'s Idol.',
      effect:
        'You are attacked by 5 fanatical followers! Roll 5 dice. For every roll that is equal to or less than your Strength, gain 10 XP as you defeat one of the followers. For each follower not defeated, take 3 Wounds, ignoring Defense. If KO\'d, only roll D6 on the Injury Table, as they add bones from you to the Temple walls!',
    },
    event10: {
      name: 'Parade of Skulls',
      lore:
        'A festival of death and life spills into the streets!',
      effect:
        'Every Hero at the Temple may fully heal their Sanity and remove 1 Corruption Point.',
    },
    blessing: {
      id: 'temple_blessing_death',
      name: 'Blessing of Death',
      cost: { gold: 250 },
      type: 'Idol Blessing',
      tags: ['Idol Blessing', 'Holy'],
      limit: 'Once per Town Stay',
      effects: [
        'During the next Adventure, any time you kill an Enemy, you may Heal 1 Wound.',
      ],
    },
  },

  // ── Idol 6: Gateway to the Void ────────────────────────────────────────────
  6: {
    name: 'Gateway to the Void',
    description:
      'A large, stable Void Gate flickers and flashes as it swirls in circles at the heart of the Temple! The Void Cult that worships here believes it is a direct conduit to the after life, ritually stepping through into the Void when they feel their souls are ready to journey into \'The Beyond\'.',
    event4: {
      name: '"Something\'s Coming Through!"',
      lore:
        'Hideous creatures burst forth from the swirling Gate to attack the Temple!',
      effect:
        'Place the Underground Lift Blasted Wastes Map Tile with a Gate on the entrance, and no exits. Every Hero at the Temple must also be placed anywhere on this Map Tile. Draw a Low Threat card (normal Threat, NOT OtherWorld), re-drawing until you find a Void or Demon Enemy, to Ambush Attack the Heroes on this Map Tile. The Heroes currently at the Temple must play out this Fight as though it were part of the next Adventure, gaining XP and Loot, and Catching their Breath as normal. Note that there is no Hold Back the Darkness, Scavenge, or Fleeing, and Heroes return to their Location Visit when complete.',
    },
    event10: {
      name: 'Visions of Tomorrow',
      lore:
        "Gazing into the abyss of the Void Gate, you see visions of things yet to come, and the Darkness of tomorrow's past!",
      effect:
        'You may start the next Adventure with Max Grit.',
    },
    blessing: {
      id: 'temple_blessing_void',
      name: 'Blessing of the Void',
      cost: { gold: 150 },
      type: 'Idol Blessing',
      tags: ['Idol Blessing', 'Holy'],
      limit: 'Once per Town Stay',
      effects: [
        'During the next Adventure, each time you pass through a Gate (once per Gate), Heal D6 Health/Sanity (any mix) and Recover a Grit.',
      ],
    },
  },
};

export default templeIdols;
