# Spirit Guides - Quick Reference

**Last Updated**: 2025-12-10

## Overview

Spirit Guides are powerful one-time bonuses gained from the Indian Trading Post's Vision Quest service. Heroes gain a permanent Spirit Guide animal, and successful Spirit tests grant temporary buffs for use during adventures.

---

## All Six Spirit Guides

| Animal | D6 Roll | Effect | Status |
|--------|---------|--------|--------|
| 🦫 **Beaver** | 1 | Don't discard a Sidebag Token just used | ✅ Implemented (GearTab.jsx) |
| 🐺 **Wolf** | 2 | Roll 5 Extra Dice for a Scavenge Test | ⏸️ Awaits Scavenge UI |
| 🦅 **Eagle** | 3 | Discard and Re-draw a Threat or Darkness card | ✅ Implemented (DM tabs) |
| 🐭 **Mouse** | 4 | Reveal 2 extra Exploration Tokens and choose which to use | ⏸️ Awaits Exploration UI |
| 🐦 **Crow** | 5 | All Heroes are +3 Initiative in the first turn of an Ambush | ✅ Implemented |
| 🐍 **Snake** | 6 | Gain one additional Starting Upgrade for one turn | ✅ Implemented (ConditionsTab) |

---

## How to Use Each Spirit Guide

### 🦫 Beaver - Sidebag Token Protection

**Where**: GearTab.jsx
**When**: After using a sidebag token
**How**:
1. Use a sidebag token (Bandages, Whiskey, etc.)
2. If Beaver buff is active, token is NOT discarded
3. Buff is consumed automatically

**Implementation**: Lines 179-196 in GearTab.jsx

---

### 🐺 Wolf - Scavenge Bonus

**Where**: Not yet implemented (awaits Scavenge UI system)
**When**: During a Scavenge test
**How**:
1. Player initiates Scavenge test
2. Check for `hero.conditions` with `effects.scavengeDiceBonus: 5`
3. Add 5 extra dice to the Scavenge roll
4. Consume buff use after test

**Buff Effect**:
```javascript
{
  effects: {
    scavengeDiceBonus: 5
  }
}
```

---

### 🦅 Eagle - Card Redraw

**Where**: DMDarknessDrawer.jsx and DMEnemyPanel.jsx
**When**: After drawing Darkness or Threat card
**How**:
1. DM draws a Darkness or Threat card
2. If any hero has Eagle buff, green indicator appears
3. Click "🦅 Redraw with Eagle Spirit Guide" button
4. Current card discarded, new card drawn
5. Buff use consumed

**Implementation**:
- DMDarknessDrawer.jsx lines 26-107
- DMEnemyPanel.jsx lines 22-110

**Buff Effect**:
```javascript
{
  effects: {
    redrawCard: true
  }
}
```

---

### 🐭 Mouse - Exploration Tokens

**Where**: Not yet implemented (awaits Exploration UI system)
**When**: During Exploration token draw
**How**:
1. Player draws Exploration token
2. Check for `hero.conditions` with `effects.explorationTokensBonus: 2`
3. Reveal 2 additional tokens (total 3)
4. Player chooses which one to use
5. Consume buff use after choice

**Buff Effect**:
```javascript
{
  effects: {
    explorationTokensBonus: 2
  }
}
```

---

### 🐦 Crow - Ambush Initiative

**Where**: Already implemented
**When**: First turn of an Ambush
**How**:
1. Ambush is triggered
2. All heroes with Crow buff get +3 Initiative for first turn only
3. Buff consumed after first turn

**Buff Effect**:
```javascript
{
  effects: {
    ambushInitiativeBonus: 3
  }
}
```

---

### 🐍 Snake - Starting Upgrade

**Where**: ConditionsTab.jsx
**When**: Player activates the buff
**How**:
1. Go to ConditionsTab
2. Find Snake Spirit Guide buff
3. Click "🐍 Choose Starting Upgrade" button
4. Modal opens showing all Starting Upgrades from hero's class
5. Click desired upgrade
6. Snake buff consumed
7. New temporary buff created with upgrade's effects
8. Lasts until end of next adventure

**Implementation**: ConditionsTab.jsx lines 332-417 and 471-524

**Buff Effect**:
```javascript
{
  effects: {
    extraStartingUpgrade: true
  }
}
```

**Created Upgrade Buff**:
```javascript
{
  id: `snakeUpgrade_${classCard.id}_${Date.now()}`,
  type: 'buff',
  name: `Snake Spirit Guide: ${classCard.name}`,
  effects: classCard.effects,  // All effects from chosen upgrade
  duration: 'nextAdventure',
  temporary: true
}
```

---

## How to Gain a Spirit Guide

1. Visit Indian Trading Post in Town
2. Select "Vision Quest" service
3. **First time only**: Roll D6 to determine permanent Spirit Guide animal
4. Roll Spirit 5+ test (roll dice equal to Spirit stat, need at least one 5+)
5. **On success**:
   - Gain 25 XP
   - Gain Spirit Guide buff (1 use)
6. **On failure**:
   - Spirit Guide animal still saved permanently
   - No buff or XP gained

**Permanent Storage**:
```javascript
hero.spiritGuide = {
  animal: 'Eagle',                            // Animal name
  roll: 3,                                    // D6 roll (1-6)
  gainedAt: 1702857600000,                   // Timestamp
  source: 'Indian Trading Post - Vision Quest'
}
```

**Temporary Buff Storage**:
```javascript
hero.conditions = [
  {
    id: 'spiritGuide_eagle_1702857600000',
    type: 'buff',
    name: 'Spirit Guide: Eagle',
    effects: { redrawCard: true },
    usesRemaining: 1,
    maxUses: 1,
    source: 'Indian Trading Post - Vision Quest',
    active: true,
    createdAt: 1702857600000
  }
]
```

---

## Checking for Active Spirit Guide Buff

### In React Components

```javascript
import { usePosse } from '../context/PosseContext';

function MyComponent() {
  const { posse } = usePosse();

  // Find hero with specific Spirit Guide buff
  const eagleBuffHero = React.useMemo(() => {
    if (!posse?.heroes) return null;

    for (const hero of posse.heroes) {
      const conditions = Array.isArray(hero?.conditions) ? hero.conditions : [];
      const eagleBuff = conditions.find(c =>
        c?.type === 'buff' &&
        c?.active !== false &&
        !c?.removed &&
        c?.effects?.redrawCard === true &&
        (c?.usesRemaining ?? 0) > 0
      );

      if (eagleBuff) {
        return { hero, buff: eagleBuff };
      }
    }
    return null;
  }, [posse?.heroes]);

  // Use it
  if (eagleBuffHero) {
    console.log(`${eagleBuffHero.hero.name} has Eagle buff!`);
  }
}
```

### In Service Handlers

```javascript
function checkForWolfBuff(hero) {
  if (!Array.isArray(hero?.conditions)) return null;

  return hero.conditions.find(c =>
    c?.type === 'buff' &&
    c?.active !== false &&
    !c?.removed &&
    c?.effects?.scavengeDiceBonus &&
    (c?.usesRemaining ?? 0) > 0
  );
}
```

---

## Consuming a Buff

### Pattern (All Spirit Guides)

```javascript
function consumeSpritGuideBuff(hero, buffId, updateHero) {
  // 1. Find and update the buff
  const updatedConditions = hero.conditions.map(c => {
    if (c?.id === buffId) {
      const newUses = Math.max(0, (c.usesRemaining ?? 0) - 1);
      return {
        ...c,
        usesRemaining: newUses,
        active: newUses > 0  // Auto-inactive when depleted
      };
    }
    return c;
  });

  // 2. Update hero
  updateHero({
    ...hero,
    conditions: updatedConditions,
    updatedAt: Date.now()
  });

  // 3. Notify user
  alert(`Spirit Guide buff used! (${newUses} uses remaining)`);
}
```

---

## UI Display

### ConditionsTab - Buffs Section

All Spirit Guide buffs appear in the **"🌟 Active Buffs & Bonuses"** section at the top of ConditionsTab.

**Features**:
- Green border and background
- Shows uses remaining: "1/1 uses"
- Helper text for each Spirit Guide type
- Action buttons (Snake only)
- Remove button to manually delete

**Location**: ConditionsTab.jsx lines 405-492

---

## File Locations

| Component | Purpose | Lines |
|-----------|---------|-------|
| **Vision Quest Service** | Creates Spirit Guide buff | indianTradingPostServices.js:439-514 |
| **Buffs Display** | Shows all active buffs | ConditionsTab.jsx:405-492 |
| **Eagle (Darkness)** | Redraw Darkness cards | DMDarknessDrawer.jsx:26-107 |
| **Eagle (Threat)** | Redraw Threat cards | DMEnemyPanel.jsx:22-110 |
| **Snake Picker** | Choose Starting Upgrade | ConditionsTab.jsx:332-417, 471-524 |
| **Beaver** | Sidebag protection | GearTab.jsx:179-196 |

---

## Testing Spirit Guides

### Manual Testing Steps

1. **Get a Spirit Guide**:
   - Go to Town → Indian Trading Post
   - Select "Vision Quest"
   - Roll for Spirit Guide (first time)
   - Pass Spirit test to gain buff

2. **Verify Storage**:
   - Check `hero.spiritGuide` has animal/roll/etc.
   - Check `hero.conditions` has buff with correct effects

3. **Test Usage**:
   - Go to ConditionsTab - see buff displayed
   - Use specific feature (redraw card, choose upgrade, etc.)
   - Verify buff consumed (uses decremented)
   - Verify buff marked inactive when depleted

4. **Verify Cleanup**:
   - Inactive buffs should disappear from display
   - Permanent `hero.spiritGuide` should remain

---

## Common Pitfalls

1. **Checking wrong condition type**
   - Always filter by `type === 'buff'`
   - Check `active !== false` and `!removed`
   - Check `usesRemaining > 0`

2. **Forgetting to consume buff**
   - Always decrement `usesRemaining`
   - Always set `active: false` when uses reach 0

3. **Not updating hero**
   - Must call `updateHero()` after modifying conditions
   - Include `updatedAt: Date.now()`

4. **Multiple heroes with same buff**
   - Eagle checks ALL heroes for buff
   - Only first hero with buff is used
   - This is intentional (party-wide benefit)

---

## Future Enhancements

### Wolf & Mouse
When Scavenge and Exploration systems are implemented:
1. Check for buff with correct effect property
2. Apply bonus (extra dice or tokens)
3. Let player make choice if needed
4. Consume buff after use

### General Improvements
- Replace `alert()` with toast notifications
- Add animations for buff consumption
- Track Spirit Guide usage statistics
- Add Spirit Guide icons/avatars to display
- Auto-cleanup inactive buffs from storage

---

**For detailed implementation notes, see**: `docs/SESSION-NOTES-spirit-guides.md`
**For hero data structure, see**: `docs/hero-schema.md`
