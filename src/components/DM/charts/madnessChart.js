// src/components/DM/charts/madnessChart.js
// Madness Chart (D36 = D6x10 + D6), based on the images you provided.
// Adds light `effects` for numeric stat changes and detailed non-numeric `rules`
// that your UI/logic can react to via getConditionRules().

export const madnessChart = [
  // 11–12
  {
    roll: 11,
    name: "Brain Dead",
    flavor: "You are nothing but an empty shell now.",
    effect: "Your Hero is Dead.",
    rules: { heroDead: true }
  },
  {
    roll: 12,
    name: "Brain Dead",
    flavor: "You are nothing but an empty shell now.",
    effect: "Your Hero is Dead.",
    rules: { heroDead: true }
  },

  // 13–16
  {
    roll: 13,
    name: "Egomania",
    flavor: "Do they even realize they’re traveling with the Legend?",
    effect: "You are unable to give or trade Gear or Side Bag Tokens with other Heroes.",
    rules: { noTradeOrGive: true }
  },
  {
    roll: 14,
    name: "Chronic Itching",
    flavor: "They seem to come from everywhere; bugs and spider crawling about, it’s downright sickening.",
    effect: "Whenever you roll a 1 to Move, you take 1 Hit.",
    rules: { moveRollOneCausesHit: true }
  },
  {
    roll: 15,
    name: "Utter Despair",
    flavor: "There’s no sense continuing on, it’s just going to get worse.",
    effect: "Whenever a Hold Back the Darkness roll is failed (including doubles that would fail), take D3 Sanity Damage (no Willpower saves).",
    rules: { hbtFailD3SanityNoWP: true }
  },
  {
    roll: 16,
    name: "Paranoia",
    flavor: "Just act natural, don’t let them know you’re on to them…",
    effect: "Whenever you attempt to Scavenge or Explore a Doorway, roll a D6. On a 1, 2, or 3, you fail the action.",
    rules: { scavengeExploreFailOn123: true }
  },

  // 21–26
  {
    roll: 21,
    name: "Sociopathy",
    flavor: "No one sees the smile on your face as you descend further and further into Darkness.",
    effect: "You do not get Willpower saves from Corruption Hits.",
    rules: { noWillpowerVsCorruption: true }
  },
  {
    roll: 22,
    name: "The Shakes",
    flavor: "Eventually, it all just gets to be too much to handle.",
    effect: "Whenever you Scavenge, ignore the first 6 that you roll.",
    rules: { scavengeIgnoreFirstSix: true }
  },
  {
    roll: 23,
    name: "Schizophrenia",
    flavor: "The talking Cactus is starting to get lippy with you!",
    effect: "Whenever you would give Equipment to another Hero, roll a D6. On a roll of 1 or 2, that Hero takes 2 Hits.",
    rules: { givingEquipmentMayHurt: true }
  },
  {
    roll: 24,
    name: "Hallucinations",
    flavor: "This isn’t a bag of gold; it’s a bag of horse shit!",
    effect: "Whenever you draw a Loot Card, roll a D6. On a 1, take 1 Sanity Damage (ignoring Willpower).",
    rules: { lootOneCausesSanity: true }
  },
  {
    roll: 25,
    name: "Obsession",
    flavor: "Don’t they know how much they mean to you?",
    effect: "Choose a Random Hero. You are -1 to any rolls if not adjacent to this Hero or at the same Location (minimum 1).",
    rules: { adjacencyPenaltyVsRandomHero: -1 }
  },
  {
    roll: 26,
    name: "Claustrophobia",
    flavor: "You’re going to suffocate if you don’t get some space!",
    effect: "Each turn you take 1 Horror Hit if you begin your Activation with < 6 open spaces adjacent to you.",
    rules: { needSixOpenAdjSpacesOrHorror: true }
  },

  // 31–36
  {
    roll: 31,
    name: "Traumatic Memory",
    flavor: "I don’t want to talk about it.",
    effect: "Until the start of your next Adventure, you take a Horror Hit whenever you would gain XP from any source.",
    temporary: true,
    rules: { xpTriggersHorrorHit: true }
  },
  {
    roll: 32,
    name: "Delusions",
    flavor: "The Yellow Sign is everywhere…",
    effect: "From now on, roll on this Madness Chart using D3x10 + D3. This Madness is -1 to recover via Exorcism in Town.",
    rules: { madnessRollMode: "D3x10+D3", exorcismHarderMinus1: true }
  },
  {
    roll: 33,
    name: "Gender Identity Crisis",
    flavor: "A butterfly waiting to come out of your cocoon!",
    effect: "Flip your character sheet over and use an opposite gender character model if available.",
    rules: { cosmeticGenderFlip: true }
  },
  {
    roll: 34,
    name: "Flagellant",
    flavor: "You deserve the pain.",
    effect: "Begin each Mine Mission with Wounds equal to your Corruption points (add to existing Wounds).",
    rules: { startMinesWithWoundsEqualToCorruption: true }
  },
  {
    roll: 35,
    name: "Dark Temptation",
    flavor: "You’ve stared into it for hours…",
    effect: "When rolling for Dark Stone Corruption, you instead take 2 Corruption Hits on a 1–3.",
    rules: { dsCorruptionOn123IsTwoHits: true }
  },
  {
    roll: 36,
    name: "Monsteromania",
    flavor: "I just gotta kill them sumbitches.",
    effect: "Choose a Monster keyword (Void/Beast/Demon/Undead). You must attack Enemies with that keyword if in Range and LoS.",
    rules: { mustPrioritizeKeywordAttack: ["Void","Beast","Demon","Undead"] }
  },

  // 41–46
  {
    roll: 41,
    name: "Monsterophobia",
    flavor: "No! Not that! Anything but that!",
    effect: "Choose a Monster keyword (Void/Beast/Demon/Undead). Take 1 Horror Hit if you start on the same Map Tile as that keyword.",
    rules: { horrorIfOnTileWithKeyword: ["Void","Beast","Demon","Undead"] }
  },
  {
    roll: 42,
    name: "Guilty Conscience",
    flavor: "We’re the real monsters here…",
    effect: "You are -1 to your Willpower rolls (minimum of 1).",
    effects: { Willpower: -1 }
  },
  {
    roll: 43,
    name: "Kleptomania",
    flavor: "They weren’t going to need that anyway.",
    effect: "When the Posse receives Loot, on a 1–2 you may take a Loot card from another player and gain 1 Corruption Point (no WP save).",
    rules: { kleptoLootOn12GainCorruption: true }
  },
  {
    roll: 44,
    name: "Unquiet Mind",
    flavor: "Don’t blow it… just a little bit more…",
    effect: "You are -1 to all Skill Test rolls (minimum of 1).",
    rules: { skillTestsDelta: -1 }
  },
  {
    roll: 45,
    name: "Nyctophobia",
    flavor: "Why’s it so dark here? Did you hear that?",
    effect: "You take 2D6 Horror Hits from Voices in the Dark and Light Sources only protect you when on the same Map Tile.",
    rules: { lightMustBeSameTile: true, voicesInDarkAre2D6: true }
  },
  {
    roll: 46,
    name: "Cowardice",
    flavor: "We’re not gonna fight that thing, are we?!",
    effect: "You are unable to attack any Enemy with more than twice your current remaining Health.",
    rules: { cannotAttackOver2xCurrentHP: true }
  },

  // 51–56
  {
    roll: 51,
    name: "Slow-Witted",
    flavor: "Why’s everyone gettin’ their guns out?",
    effect: "You are -2 Initiative during the first round of any Fights (minimum of 1).",
    rules: { firstRoundInitiativeDelta: -2 }
  },
  {
    roll: 52,
    name: "Addiction",
    flavor: "This is the last time… I swear it.",
    effect: "At the start of each Adventure, consume a Whiskey/Herb/Tonic/Fungal Bloom token or be -1 to ALL rolls for the Adventure.",
    rules: { needsSidebagFixOrMinusAllRolls: true }
  },
  {
    roll: 53,
    name: "Alcoholism",
    flavor: "How many drinks to stop the pain?",
    effect: "You must use 2 Whiskey Tokens for any Healing effect and use 1 Whiskey at the start of any Mission or take D3 Horror Hits.",
    rules: { whiskeyCostsDoubleForHealing: true, needWhiskeyAtMissionStartOrD3Horror: true }
  },
  {
    roll: 54,
    name: "Antisociality",
    flavor: "…all these people.",
    effect: "In Town, you cannot visit the same Location on the same day as any other Hero.",
    rules: { townCantShareLocationSameDay: true }
  },
  {
    roll: 55,
    name: "Faithlessness",
    flavor: "What kind of loving god would stand by…",
    effect: "In Town, you cannot visit the Church.",
    rules: { townCannotVisitChurch: true }
  },
  {
    roll: 56,
    name: "Zealotry",
    flavor: "Only the LORD can help…",
    effect: "In Town, your first Location must always be the Church (if available).",
    rules: { townMustVisitChurchFirst: true }
  },

  // 61–66
  {
    roll: 61,
    name: "Obsessive Compulsion",
    flavor: "…rinse three times, scrub four times…",
    effect: "Whenever you enter Town, you can do nothing for your entire first day as you spend it cleaning yourself.",
    rules: { townLoseFirstDay: true }
  },
  {
    roll: 62,
    name: "Lecherous",
    flavor: "They want some of what you got.",
    effect: "Opposite-gendered Heroes are -1 to their rolls when adjacent to you.",
    rules: { adjacentOppositeGenderPenalty: -1 }
  },
  {
    roll: 63,
    name: "Plutomania",
    flavor: "If it’s not gold, it’s useless.",
    effect: "Your possessions cannot be worth more than your Gold; if so, sell excess Items.",
    rules: { enforceSellExcessItemsByGold: true }
  },
  {
    roll: 64,
    name: "Berserker",
    flavor: "Kill! Kill! Kill!",
    effect: "If you are not adjacent to an Enemy during Combat, you must move towards the closest Enemy every turn when possible.",
    rules: { mustMoveTowardClosestEnemyIfNotAdjacent: true }
  },
  {
    roll: 65,
    name: "Panic Attack",
    flavor: "Deep breaths… serenity now…",
    effect: "No lasting long-term effects."
  },
  {
    roll: 66,
    name: "Apathy",
    flavor: "You’ve stopped caring about mostly everything.",
    effect: "You are at +1 Max Grit.",
    effects: { "Max Grit": +1 }
  }
];

// ---- helpers to match injuries/mutations API ----
export function lookupMadness(roll) {
  return madnessChart.find(e => Number(e.roll) === Number(roll)) || null;
}

export function materializeMadnessByRoll(roll) {
  const entry = lookupMadness(roll);
  if (!entry) return null;

  const effects = (entry.effects && typeof entry.effects === 'object') ? { ...entry.effects } : {};
  const rules   = (entry.rules && typeof entry.rules === 'object')     ? { ...entry.rules }   : {};
  const temporary = /until the start of your next adventure/i.test(entry.effect || '') || !!entry.temporary;

  return {
    type: 'Madness',
    roll: entry.roll,
    name: entry.name,
    flavor: entry.flavor,
    effectText: entry.effect,
    effects,
    rules,
    temporary
  };
}

export default madnessChart;
