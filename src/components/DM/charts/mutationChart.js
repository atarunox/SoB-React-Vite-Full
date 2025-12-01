// src/components/DM/charts/mutationChart.js
// Official SoB Mutation Chart (D36) with structured effects/rules.
//
// Notes:
// - `effects` only includes clear numeric/stat changes (parsed by calculateStats).
// - Non-numeric/conditional stuff goes in `rules` for getConditionRules() to use.
//   Supported examples used here:
//     • forbidSlots: string[]                   (e.g., 'Hat', 'Coat', 'Boots', 'Gloves')
//     • handsAvailableDelta: number
//     • noCrit: { melee?: boolean, ranged?: boolean, all?: boolean }
//     • corruptionCapacityDelta: number         (hold fewer CP before mutation)
//     • critDamageDelta: number                 (+/- damage on your crits)
//     • gainArmor4Plus: boolean                 (you have Armor 4+ regardless of gear)
//     • noGuns: boolean                         (cannot use Gun items at all)
//     • noGunsUnlessArtifact: boolean           (cannot use Guns unless item is Artifact)
//     • dsAllergy: boolean                      (Dark Stone allergy – take hits per DS carried)
//     • extraHandPerTurn: boolean               (narrative helper; treat like +1 available hand)
// - Keep `effect` text verbatim for display; `effects`/`rules` just power UI/logic.

export const mutationChart = [
  // 11–16
  {
    roll: 11,
    name: "Chest Portal",
    flavor: "A rift pulses in your chest.",
    effect:
      "Anytime an 11 or 12 is rolled to Hold Back the Darkness, you must roll a D6. 1–3: Low Threat Ambush; 4–5: Nothing; 6: Draw a Mine Artifact card.",
    effects: {},
    rules: {}
  },
  {
    roll: 12,
    name: "Tentacle Fingers",
    flavor: "Your fingers writhe and split.",
    effect: "No game effect.",
    effects: {},
    rules: {}
  },
  {
    roll: 13,
    name: "Tentacle Arm",
    flavor: "Your arm becomes a slick tendril.",
    effect:
      "You lose the use of one hand each turn, but you are +1 Combat. Guns may still be used, but cannot get Critical Hits.",
    effects: { Combat: +1 },
    rules: { handsAvailableDelta: -1, noCrit: { ranged: true } }
  },
  {
    roll: 14,
    name: "Tentacle Leg",
    flavor: "A tendril replaces your leg.",
    effect: "You are -1 Move each turn (minimum of 1).",
    effects: { Move: -1 },
    rules: {}
  },
  {
    roll: 15,
    name: "Tentacle Tongue",
    flavor: "A barbed tongue lashes out.",
    effect: "No game effect.",
    effects: {},
    rules: {}
  },
  {
    roll: 16,
    name: "Tentacle Mustache",
    flavor: "It twitches when you speak.",
    effect: "All Item prices in Town cost you $10 less than normal (minimum $10).",
    effects: {},
    rules: {}
  },

  // 21–26
  {
    roll: 21,
    name: "Glowing Skin",
    flavor: "You glow with an eerie light.",
    effect:
      "Immune to Voices in the Dark, but Enemies also Hit you on ‘To Hit’ rolls of 1.",
    effects: {},
    rules: {}
  },
  {
    roll: 22,
    name: "Rock Skin",
    flavor: "Stone plates form under your skin.",
    effect: "You are +3 Health, but -1 Move each turn (minimum of 1).",
    effects: { Health: +3, Move: -1 },
    rules: {}
  },
  {
    roll: 23,
    name: "Slippery Skin",
    flavor: "Greasy mucus coats your flesh.",
    effect:
      "You may now roll an extra die for Escape tests and choose which roll to use.",
    effects: {},
    rules: {}
  },
  {
    roll: 24,
    name: "Melty Skin",
    flavor: "Your skin sloughs under strain.",
    effect: "Anytime you take one or more Wounds from a source, take 1 extra Wound.",
    effects: {},
    rules: { startEachHitExtraWound: true }
  },
  {
    roll: 25,
    name: "Void Boils",
    flavor: "Painful blisters bubble and pop.",
    effect: "You are -2 Health, but +1 Max Grit.",
    effects: { Health: -2, Grit: +1 },
    rules: {}
  },
  {
    roll: 26,
    name: "Void Infection",
    flavor: "The void seeps into your veins.",
    effect: "Any time you pass through a Gate, you take 1 Corruption Point, ignoring Willpower.",
    effects: {},
    rules: {}
  },

  // 31–36
  {
    roll: 31,
    name: "Barbed Tail",
    flavor: "A jagged tail swishes behind you.",
    effect: "+1 Combat. You can now hold 1 fewer Corruption Point before you get a Mutation.",
    effects: { Combat: +1 },
    rules: { corruptionCapacityDelta: -1 }
  },
  {
    roll: 32,
    name: "Prehensile Tail",
    flavor: "Your tail can grip and carry.",
    effect:
      "You now have 1 extra ‘hand’ to use per turn. You can now hold 1 fewer Corruption Point before you get a Mutation.",
    effects: {},
    rules: { extraHandPerTurn: true, handsAvailableDelta: +1, corruptionCapacityDelta: -1 }
  },
  {
    roll: 33,
    name: "Tail with a Face",
    flavor: "It whispers terrible things.",
    effect: "Any time you take one or more Sanity Damage from a source, you take 1 extra Sanity Damage.",
    effects: {},
    rules: { extraSanityDamageOnSource: true }
  },
  {
    roll: 34,
    name: "Tail with a Mouth",
    flavor: "It bites anything nearby.",
    effect:
      "Any time you or another model adjacent to you rolls a 1 on a ‘To Hit’ roll, that model takes 1 Wound, ignoring Defense (no XP).",
    effects: {},
    rules: {}
  },
  {
    roll: 35,
    name: "Tentacle Tail",
    flavor: "It propels you unnaturally.",
    effect: "+1 Move. You can now hold 1 fewer Corruption Point before you get a Mutation.",
    effects: { Move: +1 },
    rules: { corruptionCapacityDelta: -1 }
  },
  {
    roll: 36,
    name: "Void Plague",
    flavor: "Your presence spreads sickness.",
    effect:
      "Any Hero adjacent to you at the end of a turn automatically takes D3 Wounds, ignoring Defense.",
    effects: {},
    rules: {}
  },

  // 41–46
  {
    roll: 41,
    name: "Horns",
    flavor: "Thick horns burst from your skull.",
    effect: "You can no longer use Clothing – Hat Items.",
    effects: {},
    rules: { forbidSlots: ['Hat'] }
  },
  {
    roll: 42,
    name: "Eye Grown Over",
    flavor: "Scar tissue clouds a socket.",
    effect: "All of your Critical Hits do 1 less Damage than normal.",
    effects: {},
    rules: { critDamageDelta: -1 }
  },
  {
    roll: 43,
    name: "Third Eye",
    flavor: "A new insight opens.",
    effect:
      "Once per turn, you may spend 2 Grit to force a Threat Card just drawn to be discarded and redrawn.",
    effects: {},
    rules: {}
  },
  {
    roll: 44,
    name: "Mouth Grown Over",
    flavor: "Speaking becomes… difficult.",
    effect: "All Item prices in Town cost you +$10.",
    effects: {},
    rules: {}
  },
  {
    roll: 45,
    name: "Fangs",
    flavor: "Predatory teeth snap and gnash.",
    effect:
      "You gain Bite (Free Attack). Once per turn, 1 Combat, uses D8 for Damage. If this Bite wounds a Void Enemy, you also take 1 Corruption Hit.",
    effects: {},
    rules: {}
  },
  {
    roll: 46,
    name: "Second Head",
    flavor: "Two minds rarely agree.",
    effect:
      "You may now use 2 Clothing – Hat Items and you are +1 Initiative. However, anytime you roll a 6 for movement, you lose your Activation as your heads argue.",
    effects: { Initiative: +1 },
    rules: {} // Allowing two Hats is outside current slot model; keep narrative.
  },

  // 51–56
  {
    roll: 51,
    name: "Arm Growth",
    flavor: "Twisted limbs sprout.",
    effect: "You can no longer use Clothing – Coat Items.",
    effects: {},
    rules: { forbidSlots: ['Coat'] }
  },
  {
    roll: 52,
    name: "Leg Growth",
    flavor: "Hunched and warped legs.",
    effect: "You can no longer use Clothing – Boot Items.",
    effects: {},
    rules: { forbidSlots: ['Boots', 'Feet'] }
  },
  {
    roll: 53,
    name: "Hand Growth",
    flavor: "Mutated palms and claws.",
    effect: "You can no longer use Clothing – Gloves Items.",
    effects: {},
    rules: { forbidSlots: ['Gloves'] }
  },
  {
    roll: 54,
    name: "Fused with Item",
    flavor: "It grows into your flesh.",
    effect:
      "Choose one Item you are carrying that is Clothing or Hand Weapon. From now on, that Item must be assigned every turn.",
    effects: {},
    rules: {}
  },
  {
    roll: 55,
    name: "Fused with Rock",
    flavor: "Stone anchors your body.",
    effect: "You are -2 Move each turn (minimum of 1), however you also gain Armor 4+.",
    effects: { Move: -2 },
    rules: { gainArmor4Plus: true }
  },
  {
    roll: 56,
    name: "Fused with Dark Stone",
    flavor: "Shards sink into bone.",
    effect:
      "Any Dark Stone shards you currently carry have become fused to you. These cannot be sold, used, or lost. Continue to roll for Corruption.",
    effects: {},
    rules: {}
  },

  // 61–66
  {
    roll: 61,
    name: "Dark Stone Allergy",
    flavor: "It burns from the inside.",
    effect:
      "At the start of each Activation, take 1 Hit for every Dark Stone shard and Item with a Dark Stone Icon you are carrying.",
    effects: {},
    rules: { dsAllergy: true }
  },
  {
    roll: 62,
    name: "Nose Fallen Off",
    flavor: "Breathing is… complicated.",
    effect: "All of your Town Location Event chart rolls are -1 to the roll (minimum of 2).",
    effects: {},
    rules: {}
  },
  {
    roll: 63,
    name: "Fused Fingers",
    flavor: "Gnarled digits stick together.",
    effect: "You may not use Gun Items (unless it is an Artifact card).",
    effects: {},
    rules: { noGunsUnlessArtifact: true } // ← artifact-gun exception
  },
  {
    roll: 64,
    name: "Eye Stalks",
    flavor: "They swivel independently.",
    effect:
      "All of your Critical Hits are +1 Damage. You can now hold 1 fewer Corruption Point before you get a Mutation.",
    effects: {},
    rules: { critDamageDelta: +1, corruptionCapacityDelta: -1 }
  },
  {
    roll: 65,
    name: "Void Speech",
    flavor: "Whispers in a language not meant for mortals.",
    effect:
      "At the start of each of your Activations, if there are any Void Enemies on your Map Tile, you are +1 Initiative, but you also take 1 Sanity Damage, ignoring Willpower.",
    effects: {}, // situational +1 Initiative not modeled as flat
    rules: {}
  },
  {
    roll: 66,
    name: "Child of the Void",
    flavor: "The stars look back at you.",
    effect:
      "You are +1 Lore, and while in an Other World, +1 Initiative. You can now hold 1 fewer Corruption Point before you get a Mutation.",
    effects: { Lore: +1 },
    rules: { corruptionCapacityDelta: -1 }
  }
];

// Utility: turn a roll into a structured condition object for hero.conditions[]
export function materializeMutationByRoll(roll) {
  const entry = mutationChart.find(e => Number(e.roll) === Number(roll));
  if (!entry) return null;
  return {
    type: 'Mutation',
    roll: entry.roll,
    name: entry.name,
    flavor: entry.flavor,
    effectText: entry.effect,
    effects: entry.effects || {},
    rules: entry.rules || {},
  };
}

export function lookupMutation(roll) {
  return mutationChart.find(e => Number(e.roll) === Number(roll)) || null;
}

export default function Placeholder() { return null; }
