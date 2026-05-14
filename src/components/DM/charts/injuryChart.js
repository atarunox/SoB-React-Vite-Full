// src/components/DM/charts/injuryChart.js
import { withConditionAppended } from '../../../utils/mergeConditions';
// --- Base data (with structured effects/rules where applicable) ---
export const injuryChart = [
  { roll: 11, name: "Eviscerated", flavor: "A brutal wound tears through vital organs.", effect: "Hero is Dead." },
  { roll: 12, name: "Eviscerated", flavor: "A brutal wound tears through vital organs.", effect: "Hero is Dead." },

  {
    roll: 13,
    name: "Foreign Object",
    flavor: "There's something in your body that wasn't there when you woke up this morning.",
    effect:
      "Roll D6. You can no longer wear 1) Torso/Coat, 2)Boots, 3)Hats, 4)Gloves, 5)Shoulder, 6)Belt/Pants. If a foreign object exists there, lose 3 health permanently",
    // Let the player resolve which slot is blocked; store chosen slot(s) in the condition as `resolvedForbid`
    rules: { forbidOneOf: ["Torso","Coat","Feet","Head","Gloves","Shoulders","Belt","Pants"] }
  },
  {
    roll: 14,
    name: "Spinal Cord Injury",
    flavor: "That was a solid hit to your spine, you're feeling that!",
    effect: "-1 Agility and Strength (min 1).",
    effects: { Agility: -1, Strength: -1 }
  },
  {
    roll: 15,
    name: "Brain Injury",
    flavor: "You head no feel good. You head hit, go night night.",
    effect: "-1 Cunning and Lore (min 1).",
    effects: { Cunning: -1, Lore: -1 }
  },
  {
    roll: 16,
    name: "Butchered Genitals",
    flavor: "Reproductive activities are clearly not an option anymore",
    effect: "-1 Spirit and Luck (min 1).",
    effects: { Spirit: -1, Luck: -1 }
  },
  {
    roll: 21,
    name: "Fractured Hip",
    flavor: "Every step you take sends a sharp pain through your body.",
    effect: "1 Hit after every Move action."
  },
  {
    roll: 22,
    name: "Mangled Hand",
    flavor: "Your hand will never hold a gun the same way again",
    effect:
      "Your Hero has one less hand available for carrying items. Weapons may still be used, but unable to get Critical Hits with the injured hand",
    rules: {
      handsAvailableDelta: -1,
      noCritWithInjuredHand: true
    }
  },
  {
    roll: 23,
    name: "Gouged Eye",
    flavor:
      "Your vision gets hazy and streaks of blood run down your face. At least you won't see these horrors as clearly anymore...",
    effect: "No Critical Hits with Ranged Weapons.",
    rules: { noCrit: { ranged: true } }
  },
  {
    roll: 24,
    name: "Fractured Ribs",
    flavor: "With a sickening crunch, you feel parts of your ribs break and splinter",
    effect: "-1 max weight",
    rules: { carryCapacityDelta: -1 }
  },
  {
    roll: 25,
    name: "Broken Leg",
    flavor: "Your leg twists and bends in a direction not normally associated with the human leg.",
    effect: "-1 Move (min 1).",
    effects: { Move: -1 }
  },
  {
    roll: 26,
    name: "Abdominal Trauma",
    flavor: "It's like a horse just kicked you in your gut",
    effect: "-1 to Defense rolls (min 1).",
    effects: { Defense: -1 }
  },
  {
    roll: 31,
    name: "Concussion",
    flavor:
      "The room swirls about you and there's a constant ringing sound that isn't going away anytime soon",
    effect: "-1 Initiative and -1 Skill die until next Adventure.",
    effects: { Initiative: -1 }
  },
  {
    roll: 32,
    name: "Internal Bleeding",
    flavor:
      "You've had worse scrapes shaving yourself in the morning. You'll be fine you tell everyone...",
    effect: "Future rolls on this chart use D3x10+D3. -1 to Surgery roll on this injury."
  },
  {
    roll: 33,
    name: "Broken Arm",
    flavor:
      "Your arm dangles uselssly by your side. You'll be damned if you can hit anything quite the same again",
    effect: "No Critical Hits with Melee Weapons.",
    rules: { noCrit: { melee: true } }
  },
  {
    roll: 34,
    name: "Cracked Knee",
    flavor: "You used to be a fighter, til this happened to your knee.",
    effect:
      "Whenever you are wounded, you are also pushed 1 space if possible (players chooses direction)"
  },
  {
    roll: 35,
    name: "Crushed Foot",
    flavor: "You can't seems to feel your foot too well anymore.",
    effect: "-1 Escape rolls (min 1).",
    effects: { Agility: 0 } // left as narrative; you may translate to a concrete stat if desired
  },
  {
    roll: 36,
    name: "Scalped",
    flavor: "You feel exposed flesh where hair once grew.",
    effect: "Cannot wear Head Clothing/Gear.",
    rules: { forbidSlots: ["Head"] }
  },
  {
    roll: 41,
    name: "Slashed Face",
    flavor: "You've earned yourself a sinister looking scar.",
    effect: "-1 on rolls in Encounters with the Keyword 'Stranger' (min 1)."
  },
  {
    roll: 42,
    name: "Broken Teeth",
    flavor:
      "Your teeth are mighty sensitive now and it's going to be painful to eat or drink anything from now on.",
    effect:
      "Your Hero takes 1 Hit after using a Side Bag Token that is meant to be consumed (no effect from Dynamite)"
  },
  {
    roll: 43,
    name: "Broken Collar Bone",
    flavor:
      "The pain is intense and it hurts to do most anything, but it doesn't look like you're in any mortal danger.",
    effect: "-1 Max Grit.",
    effects: { Grit: -1 }
  },
  {
    roll: 44,
    name: "Chest Wound",
    flavor:
      "Your shirt is soaked with blood from the massive gash running down your chest. It hurts to even turn your body.",
    effect: "-1 Initiative.",
    effects: { Initiative: -1 }
  },
  {
    roll: 45,
    name: "Severed Finger",
    flavor:
      "A portion of one of your fingers has been lopped off, which makes shooting a gun an interesting proposition. You can only count to nine now.",
    effect: "Ranged Weapons are -1 Shot (min 1).",
    rules: { shotsDeltaRanged: -1 }
  },
  {
    roll: 46,
    name: "Severed Ear",
    flavor: " A part of your ear lies on the ground next to you.",
    effect:
      "In every Fight, you are considered Ambushed by a single Enemy (choose one ). That Enemy appears next to your Hero at +2 Initiative."
  },
  {
    roll: 51,
    name: "Swollen Eye",
    flavor: "You have a massive headache and you can't blink out of one side of your face.",
    effect:
      "Until the end of the Adventure, your Line of Sight is restricted to the direction your model is facing. It costs 1 Move to change your model's facing during your Activation."
  },
  {
    roll: 52,
    name: "Pulled Muscle",
    flavor:
      "Hot damn, that'll do it. You'll be fine in a few hours, but dangit if that ain't a charley horse.",
    effect:
      "Until the end of the Adventure, you are at half-movement (rounded down ) on the turn after you take any Wounds"
  },
  {
    roll: 53,
    name: "Twisted Ankle",
    flavor:
      "It's not the worst pain you've ever felt, but you'll have to watch how you walk on that foot for a bit.",
    effect: "Until the end of the Adventure, you may not move your Hero diagonally."
  },
  {
    roll: 54,
    name: "Sprained Wrist",
    flavor:
      " You feel like a pansy for even complainin' about it, but it's sure hard as hell to hold a gun straight now.",
    effect:
      " Until the end of the Adventure, you are -1 to all Ranged 'To Hit' rolls (minimum of 1 ).",
    effects: { "Ranged To-Hit": -1 }
  },
  {
    roll: 55,
    name: "Dislocated Shoulder",
    flavor:
      " Until you get a free second to get your arm placed back in its socket you definitely ain't gonna be hittin' as hard.",
    effect:
      "Until the end of the Adventure, you are -1 to all Melee 'To Hit' rolls (minimum of 1 )",
    effects: { "Melee To-Hit": -1 }
  },
  {
    roll: 56,
    name: "Rattled",
    flavor:
      " The room is wobbling some all around you like you was drunk, but you'll manage... somehow.",
    effect:
      "Until the end of the Adventure, you are -1 to all Skill Test rolls (minimum of 1 )."
  },
  {
    roll: 61,
    name: "Photophobia",
    flavor: " Somethin' hit you and now all the lights are too bright",
    effect:
      "You are -1 to all 'To Hit' rolls if you are on the same Map Tile as the Posse's Light Source (minimum of 1 )."
  },
  {
    roll: 62,
    name: "Breathing Difficulties",
    flavor: " You can't seem to move much without yer' lungs hurtin'.",
    effect: " You cannot spend Grit to add to your Movement."
  },
  {
    roll: 63,
    name: "Puncture Wound",
    flavor: " That got you good, but you'll live. Suck it up hombre",
    effect: "Until the end of the Adventure, you are -1 Combat.",
    effects: { Combat: -1 }
  },
  {
    roll: 64,
    name: "Busted Jaw",
    flavor:
      " It's hard for you to talk now, though your friends appreciate the silence",
    effect:
      " Until the start of your next Mission, you must pay +$25 for all Purchase Items or Services."
  },
  {
    roll: 65,
    name: "Wind Knocked Out",
    flavor:
      "You stop a second to catch your breath and look yourself over. Not a scratch on you, time to kick some ass",
    effect: "No lasting effect."
  },
  {
    roll: 66,
    name: "Scarring",
    flavor:
      " It might look bad, but you don't feel a thing. If anything, it's made you more pissed than you were before.",
    effect: "+1 Max Grit.",
    effects: { Grit: +1 }
  }
];

// Utility: optional parser for free-form effect text → numeric effects (kept minimal here)
const STAT_MAP = new Map([
  ['agility', 'Agility'], ['strength', 'Strength'], ['cunning', 'Cunning'],
  ['lore', 'Lore'], ['spirit', 'Spirit'], ['luck', 'Luck'],
  ['move', 'Move'], ['initiative', 'Initiative'], ['combat', 'Combat'],
  ['max grit', 'Grit'], ['defense', 'Defense']
]);
const NUM = /([+-]?\d+)/;
function effectStringToEffects(txt = '') {
  const s = String(txt).toLowerCase();
  let m = s.match(new RegExp(`${NUM.source}\\s+([a-z ]+?)\\s+and\\s+([a-z ]+?)(\\W|$)`));
  if (m) {
    const n = Number(m[1]);
    const a = STAT_MAP.get(m[2].trim()); const b = STAT_MAP.get(m[3].trim());
    const out = {}; if (a) out[a] = n; if (b) out[b] = n; if (Object.keys(out).length) return out;
  }
  m = s.match(new RegExp(`${NUM.source}\\s+([a-z ]+?)(\\W|$)`));
  if (m) { const n = Number(m[1]); const stat = STAT_MAP.get(m[2].trim()); if (stat) return { [stat]: n }; }
  return {};
}

// Build a condition object you can push into hero.conditions, from a roll
export function materializeInjuryByRoll(roll) {
  const entry = injuryChart.find(e => Number(e.roll) === Number(roll));
  if (!entry) return null;
  const effects = entry.effects || effectStringToEffects(entry.effect);
  const temporary = /until the end of the adventure|until the start of your next mission/i.test(entry.effect);
  return {
    type: 'Injury',
    roll: entry.roll,
    name: entry.name,
    flavor: entry.flavor,
    effectText: entry.effect,
    effects,
    rules: entry.rules || undefined,
    temporary,
  };
}
export function appendInjuryToHero(posseApi, heroOrId, roll) {
  const heroId = typeof heroOrId === 'string' ? heroOrId : (heroOrId?.id || heroOrId?.localId);
  if (!heroId || !posseApi?.getHero) return;
  const hero = typeof heroOrId === 'object' ? heroOrId : posseApi.getHero(heroId);
  if (!hero) return;

  const entry = materializeInjuryByRoll(roll);
  if (!entry) return;

  const nextConds = withConditionAppended(hero.conditions, 'injury', entry);
  posseApi.updateHero?.({ id: heroId, conditions: nextConds, updatedAt: Date.now() });
  return entry;
}
export function lookupInjury(roll) {
  return injuryChart.find(e => Number(e.roll) === Number(roll)) || null;
}

export default injuryChart;
