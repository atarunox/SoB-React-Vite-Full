# Hero Object Schema

This document describes the structure of hero objects in the Shadows of Brimstone app.

## Core Properties

```javascript
{
  // Identity
  id: string,                    // Unique identifier (or localId)
  localId: string,               // Local storage ID
  name: string,                  // Hero name
  class: string,                 // Hero class (e.g., "Gunslinger")

  // Resources
  gold: number,
  darkStone: number,
  scrap: number,
  tech: number,
  xp: number,

  // Stats (current values)
  health: number,
  maxHealth: number,
  sanity: number,
  maxSanity: number,
  grit: number,
  maxGrit: number,
  corruption: number,
  maxCorruption: number,

  // Core stats object
  stats: {
    Agility: number,
    Cunning: number,
    Spirit: number,
    Strength: number,
    Lore: number,
    Luck: number,
    Initiative: number,
    Move: number,
    Combat: number,
    // Threshold stats (X+ format)
    'Melee To-Hit': string,      // e.g., "4+"
    'Ranged To-Hit': string,
    Defense: string,
    Willpower: string,
    Armor: string,
    'Spirit Armor': string,
  }
}
```

## Inventory & Equipment

```javascript
{
  // Inventory
  inventory: Array<Item>,          // General inventory items

  // Equipped gear (by slot)
  gear: {
    weapon: Item,
    armor: Item,
    trinket: Item,
    // ... other slots
  },

  // Sidebag tokens (NEW FORMAT - use this one)
  sidebags: {
    capacity: number,              // Default: 6
    items: Array<{
      id: string,                  // Unique token ID
      name: string,                // Token name (e.g., "Dynamite")
      qty: number,                 // Quantity
      description: string          // Effect description
    }>
  },

  // Legacy sidebag format (DEPRECATED - for backward compatibility only)
  sideBag: Object<string, number>  // { "Dynamite": 2, "Whiskey": 1 }
}
```

## Conditions & Ailments

**IMPORTANT**: Ailments can be stored in multiple locations for backward compatibility.
When reading ailments, check ALL locations. When writing new ailments, use the nested format.

```javascript
{
  // PREFERRED: Nested conditions object
  conditions: {
    madness: Array<Condition>,     // Madness ailments
    curse: Array<Condition>,       // Curse ailments
    mutation: Array<Condition>,    // Mutation ailments
    injury: Array<Condition>,      // Injury ailments
    buff: Array<Condition>,        // Temporary buffs
    // ... other condition types
  },

  // LEGACY: Top-level arrays (check these for backward compatibility)
  madness: Array<Condition>,       // Old madness storage
  curses: Array<Condition>,        // Old curse storage
  mutation: Array<Condition>,      // Old mutation storage (singular)
  mutations: Array<Condition>,     // Old mutation storage (plural)

  // ALTERNATIVE: Flat conditions array with type field
  conditions: Array<{
    type: string,                  // 'madness', 'curse', 'mutation', 'buff', etc.
    // ... other condition fields
  }>
}
```

### Condition Object Format

```javascript
{
  id: string,                      // Unique condition ID
  type: string,                    // 'madness', 'curse', 'mutation', 'injury', 'buff'
  name: string,                    // Display name
  title: string,                   // Alternative display name

  // Status flags
  active: boolean,                 // Is condition active? (default: true)
  removed: boolean,                // Has been removed? (default: false)
  removable: boolean,              // Can be removed by player?

  // Effects
  effects: Object,                 // Effect modifiers (see below)
  mods: Object,                    // Stat modifiers

  // Usage tracking
  usesRemaining: number,           // Uses left (for limited-use buffs)
  maxUses: number,                 // Total uses available

  // Metadata
  source: string,                  // Where it came from
  createdAt: number,               // Timestamp
  gainedAt: number,                // When acquired
  duration: Object,                // Duration info
}
```

## Spirit Guide System

```javascript
{
  // Permanent Spirit Guide (set during Vision Quest)
  spiritGuide: {
    animal: string,                // 'Beaver', 'Wolf', 'Eagle', 'Mouse', 'Crow', 'Snake'
    roll: number,                  // D6 roll that determined the guide (1-6)
    gainedAt: number,              // Timestamp
    source: string                 // 'Indian Trading Post - Vision Quest'
  },

  // Active Spirit Guide buff (temporary, 1 use per adventure)
  // Stored in conditions array with type='buff' and effects:
  conditions: [
    {
      type: 'buff',
      name: 'Spirit Guide: Beaver',
      effects: {
        sideBagProtection: true    // Beaver: Don't discard sidebag token
        // OR
        scavengeDiceBonus: 5       // Wolf: +5 dice on Scavenge test
        // OR
        redrawCard: true           // Eagle: Redraw Threat/Darkness card
        // OR
        explorationTokensBonus: 2  // Mouse: +2 Exploration tokens
        // OR
        ambushInitiativeBonus: 3   // Crow: +3 Initiative first turn of Ambush
        // OR
        extraStartingUpgrade: true // Snake: Gain Starting Upgrade
      },
      usesRemaining: 1,
      maxUses: 1,
      source: 'Indian Trading Post - Vision Quest'
    }
  ]
}
```

## Effect Object Properties

The `effects` object on conditions/items can contain various modifiers:

```javascript
{
  // Stat modifiers (additive)
  spiritDelta: number,             // +/- Spirit
  initiativeDelta: number,         // +/- Initiative
  maxSanityDelta: number,          // +/- Max Sanity

  // Spirit Guide effects
  sideBagProtection: boolean,      // Beaver: Don't discard sidebag token
  scavengeDiceBonus: number,       // Wolf: Extra dice on Scavenge
  redrawCard: boolean,             // Eagle: Redraw card
  explorationTokensBonus: number,  // Mouse: Extra exploration tokens
  ambushInitiativeBonus: number,   // Crow: Initiative bonus in ambush
  extraStartingUpgrade: boolean,   // Snake: Temp starting upgrade

  // Other effects (extend as needed)
}
```

## Upgrade Tree

```javascript
{
  upgradeTree: Array<{
    id: string,
    name: string,
    purchased: boolean,
    effects: Array<string>,         // Effect descriptions
    mods: Object,                   // Stat modifiers
    // ... other upgrade fields
  }>
}
```

## Important Notes

### When Reading Ailments
Always check all three storage locations:
1. `hero.conditions.madness` (preferred)
2. `hero.madness` (legacy)
3. `hero.conditions` array with `type: 'madness'` (flat)

See `getAilmentList()` in `indianTradingPostServices.js` for reference implementation.

### When Writing New Ailments
Use the nested format: `hero.conditions.madness.push(newMadness)`

### Sidebag Tokens
Always use the new structured format with `sidebags: {capacity, items: [...]}`.
The old `sideBag` object format is deprecated but kept for backward compatibility.
