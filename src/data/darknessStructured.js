export const darknessCards = [
  {
    name: "Fueled by Dark Stone",
    tags: ["Darkness", "Boost", "Mutant"],
    effect: "All Mutant Enemies are +1 Initiative and +2 Damage with their Attacks. All Enemies on the next Threat Card drawn gain the Keyword Mutant.",
    remainsInPlay: true,
    modifiers: {
      addKeywordToNextEnemy: "Mutant",
      enemyModifiers: {
        keyword: "Mutant",
        initiative: 1,
        combat: 2
      }
    }
  },
  {
    name: "Fueled by Rage",
    tags: ["Darkness", "Boost"],
    effect: "All Enemies are +1 Combat while they have one or more Wounds on them.",
    remainsInPlay: true,
    modifiers: {
      conditionalEnemyModifiers: {
        condition: "hasWounds",
        modifiers: {
          combat: 1
        }
      }
    }
  },
  {
    name: "Relentless Assault",
    tags: ["Darkness", "Boost", "Tribal"],
    effect: "All Tribal Enemies are +1 Combat and +1 Initiative.",
    remainsInPlay: true,
    modifiers: {
      enemyModifiers: {
        keyword: "Tribal",
        combat: 1,
        initiative: 1
      }
    }
  },
  {
    name: "Strength of the Void",
    tags: ["Darkness", "Boost", "Void"],
    effect: "All Void Enemies are now +1 Defense.",
    remainsInPlay: true,
    modifiers: {
      enemyModifiers: {
        keyword: "Void",
        defense: 1
      }
    }
  },
  {
    name: "Always Watching",
    tags: ["Darkness", "Boost", "Alien"],
    effect: "All Alien Enemies are +1 Initiative and +1 Damage on Ranged Attacks.",
    remainsInPlay: true,
    modifiers: {
      enemyModifiers: {
        keyword: "Alien",
        initiative: 1,
        rangedDamage: 1
      }
    }
  },
  {
    name: "Restless Dead",
    tags: ["Darkness", "Boost", "Undead"],
    effect: "All Undead Enemies are now +1 Initiative and +2 Move.",
    remainsInPlay: true,
    modifiers: {
      enemyModifiers: {
        keyword: "Undead",
        initiative: 1,
        move: 2
      }
    }
  }
];


export default function Placeholder() { return null; }