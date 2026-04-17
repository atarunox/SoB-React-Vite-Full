# Shadows of Brimstone — Hero Tracker App

## Project Overview

React + Vite app for tracking Heroes, Town Visits, and game state for the *Shadows of Brimstone* board game by Flying Frog Productions. Firebase for cloud persistence, localStorage as fallback. Tailwind CSS v4 for styling. Mobile-first target audience.

**Tech stack:** React 18, Vite 5, Tailwind CSS 4.1, Firebase (Firestore), framer-motion, react-router-dom v6.

---

## Critical Codebase Conventions

### Canonical Hero Fields

`sanitizeHero.js` is the single source of truth. Every hero object passes through it on load/save. Fields not in the canonical schema are silently ignored or overwritten.

**Resource pools (read/write these):**
| Field | Meaning | Default |
|---|---|---|
| `currentHealth` | Current HP | 10 |
| `maxHealth` | Max HP | 10 |
| `currentSanity` | Current Sanity | 10 |
| `maxSanity` | Max Sanity | 10 |
| `currentCorruption` | Corruption Points accumulated | 0 |
| `maxCorruption` | Corruption Resistance threshold | 5 |
| `currentGrit` | Current Grit tokens | 0 |
| `Grit` | Max Grit cap | 2 |
| `gold` | Currency | 0 |
| `xp` | Experience points | 0 |

**Core stats (inside `hero.stats`):**
| Stat | Type | Default |
|---|---|---|
| `Strength` | Dice pool | 2 |
| `Agility` | Dice pool | 2 |
| `Cunning` | Dice pool | 2 |
| `Spirit` | Dice pool | 2 |
| `Lore` | Dice pool | 2 |
| `Luck` | Dice pool | 2 |
| `Initiative` | Numeric | 4 |
| `Combat` | Dice pool (attack dice) | 1 |
| `Move` | Numeric | 0 |

**Threshold stats (inside `hero.stats`, "X+" format, lower is better):**
| Stat | Default |
|---|---|
| `Melee To-Hit` | 4+ |
| `Ranged To-Hit` | 4+ |
| `Defense` | 4+ |
| `Willpower` | 5+ |
| `Armor` | — |
| `Spirit Armor` | — |

**Conditions:** `injuries[]`, `madness[]`, `mutations[]` (top-level arrays of objects).

**Gear:** `hero.gear` is a slot-keyed object with 13 standard slots: `Main Hand`, `Off Hand`, `Head`, `Torso`, `Coat`, `Gloves`, `Hands`, `Pants`, `Feet`, `Shoulders`, `Face`, `Extra 1`, `Extra 2`.

### CRITICAL: Field Name Bugs to Avoid

The sanitizer (line 172) mirrors `corruption: currentCorruption` as a **read-only alias**. This means:
- Writing to `corruption` is **silently dropped** on next sanitize pass
- Writing to `corruptionHits` does **nothing** (not a real field)
- Writing to `wounds` does **nothing** (not a real field)
- Writing to `health` is **silently dropped** (overwritten by `currentHealth`)

**Always write to the canonical field:**
```js
// CORRECT — corruption
ctx.updateHero(id, h => ({
  ...h,
  currentCorruption: (h.currentCorruption ?? 0) + amount,
}));

// CORRECT — damage (reduce health)
ctx.updateHero(id, h => ({
  ...h,
  currentHealth: Math.max(0, (h.currentHealth ?? h.maxHealth ?? 10) - wounds),
}));

// CORRECT — healing
ctx.updateHero(id, h => ({
  ...h,
  currentHealth: Math.min(h.maxHealth ?? 10, (h.currentHealth ?? 0) + healAmount),
}));

// WRONG — silently dropped
ctx.updateHero(id, h => ({ ...h, corruption: X }));   // ← dropped
ctx.updateHero(id, h => ({ ...h, wounds: X }));        // ← dropped  
ctx.updateHero(id, h => ({ ...h, health: X }));        // ← dropped
ctx.updateHero(id, h => ({ ...h, corruptionHits: X }));// ← dropped
```

### Willpower Save Pattern for Corruption Hits

Reference implementation: `miningOperationHandler.js:215-228`.

Every source of Corruption Hits **must** allow Willpower saves unless the card text explicitly says "ignoring Willpower":

```js
const h = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? null;
const wpStr = String(h?.willpower ?? h?.stats?.Willpower ?? '5+');
const wpTarget = Number(String(wpStr).match(/\d+/)?.[0]) || 5;
const saveRolls = await ctx.roll?.(hitCount, 6,
  `Willpower ${wpTarget}+ saves vs ${hitCount} Corruption Hits`) || [];
const arr = Array.isArray(saveRolls) ? saveRolls : [saveRolls];
const blocks = arr.filter(n => n >= wpTarget).length;
const unblocked = Math.max(0, hitCount - blocks);
if (unblocked > 0) {
  ctx.updateHero?.(id, hh => ({
    ...hh,
    currentCorruption: (hh.currentCorruption ?? 0) + unblocked,
  }));
}
```

### Stat Calculation Pipeline

`calculateStats.js` merges: base stats → gear mods → skill mods → condition mods.
- Threshold stats (Defense, Willpower, etc.) are improved by **subtracting** the delta (e.g., Defense 4+ with +1 → 3+).
- `conditionRules.js` aggregates non-numeric rules: `forbidSlots`, `noCrit`, `dsAllergy`, `gritCap`, `noGuns`, etc.

---

## Verified Shadows of Brimstone Rules Reference

*Sources: City of the Ancients Rulebook, Swamps of Death Rulebook, Official FAQ (Nov 2019), Esoteric Order of Gamers rules summary v1.2, Shadows of Brimstone Wiki, Brimstone Mission Generator Reference.*

### Combat

**Attack rolls:**
- Roll dice equal to **Combat** stat (or weapon dice). Each die hitting the weapon's **To Hit** target (Melee or Ranged) scores a Hit.
- **Critical Hit:** Natural 6 on an attack die **ignores Defense** — no Defense save allowed.

**Defense (HP path):**
1. Roll 1 Defense die per incoming Hit. Success (meeting Defense target) blocks the entire Hit.
2. Each unblocked Hit deals the weapon's Damage in Wounds.
3. If hero has Armor, roll 1 Armor die per Wound. Success ignores that Wound.

**Willpower (Sanity path):**
1. Roll 1 Willpower die per Horror Hit. Success blocks 1 Hit.
2. Each unblocked Hit deals Sanity damage.
3. If hero has Spirit Armor, roll per Sanity Wound to ignore.

**"Ignoring Defense"** = no Defense save at all; Hits go straight to Damage.
**"Ignoring Willpower"** = no Willpower save; Hits go straight to Sanity damage.
These are **separate flags** — one does not imply the other.

### Corruption

**Corruption Hit vs Corruption Point — CRITICAL DISTINCTION:**
- A **Corruption Hit** is an incoming event → Hero rolls **Willpower save** (1 die per Hit).
- Failed saves become **Corruption Points** added to the tracker.
- Some effects explicitly "ignore Willpower" — only then are points applied directly.

**Overflow → Mutation:**
- When Corruption Points **reach Max Corruption** (default 5), discard all points to 0 and roll on the **Mutation Chart**. Mutation is permanent.

**Dark Stone end-of-adventure roll (two-stage):**
1. For each Dark Stone carried, roll D6. On **1-3**, take a Corruption Hit.
2. Willpower save as normal against each Hit.
3. **No Grit rerolls** on the D6 roll itself. Grit **can** be used on the Willpower save.

### Grit

- **Start of each Mission:** 1 Grit (regardless of max).
- **Max Grit:** Printed per Hero class (often 2-3). Increased by level-ups/items.
- **Usage:** Spend 1 Grit to **reroll any number of failed dice** from a single roll. Cannot reroll the same die twice.
- **Restriction:** Grit **cannot** reroll anything rolled **on a chart** (Injury, Madness, Mutation, Town Event, Exploration, Travel, Trap charts). It CAN reroll attack/defense/save dice even if prompted by a chart result.
- **Recovery:** Skip exploration action (heal D6 or recover 1 Grit), level up (+1), specific abilities/events.

### Health, Sanity, and KO

- **Knocked Out (KO'd):** Health or Sanity reaches 0 during a Fight.
- **End of Fight recovery:** Roll on **Injury Chart** (if HP hit 0) or **Madness Chart** (if Sanity hit 0), then heal **2D6** (split between Wounds and Sanity as desired).
- **Killed / Permanent Madness:** Specific chart results that remove the Hero permanently.
- **Heavy Wounds:** Injury chart results that are cumulative and permanent until cured.

### Town Visits

**Structure:**
- Each Day, each Hero visits **1 Town Location**.
- On visit: roll event (typically D12 for location event chart, entries 1-12).
- Then resolve services (purchases, healing, gambling, etc.).

**Town Event Track (Darkness in Town):**
- Day Marker starts at 1. End of each Day: roll D6. If roll ≤ Day Marker, a Town Event triggers (reset marker to 1). Otherwise advance marker +1.
- Longer stays → events become near-certain → pressure to leave.

**Ending Town Stay:**
- Voluntary (declare at start of new Day) or forced by Town Event.
- Resolve upkeep, then pick next Mission.

**Core Frontier Town locations:** Doc's Office, Saloon, General Store, Sheriff's Office, Frontier Outpost, Gambling Hall, Blacksmith, Indian Trading Post, Street Market, Mutant Quarter, Smuggler's Den, Church (expansion), plus others per expansion.

### XP and Advancement

- **Level thresholds:** 500, 1000, 2000, 3000, 4500, 6000, 8000 XP (Levels 2-8).
- **On level up:** Remove all Wound/Sanity counters, regain 1 Grit, choose one advancement from class-specific chart.
- **Skill Trees:** Four upgrade paths per class; each node requires prior nodes.

### Dark Stone

- Carried Dark Stone = risk (end-of-adventure corruption roll).
- Dark Stone weapons grant bonus attack dice but increase corruption exposure.
- Items with `darkStone: true` flag count for end-of-adventure rolls.

### Mutations, Injuries, Madness

- **Mutation Chart:** D66 (36 entries). Permanent stat/rule changes. Some forbid gear slots, change hands available, grant/remove abilities.
- **Injury Chart:** D66 (36 entries). Heavy Wounds, stat losses, equipment restrictions. Cumulative.
- **Madness Chart:** D66 (36 entries). Behavioral rules, stat changes.
- All three are career-permanent unless specifically cured.

---

## File Structure Map

### Core Architecture
```
src/
├── utils/
│   ├── sanitizeHero.js          — Canonical hero schema (SOURCE OF TRUTH)
│   ├── calculateStats.js        — Stat pipeline: base + gear + skills + conditions
│   ├── conditionRules.js        — Non-numeric rule aggregation (forbidSlots, noCrit, etc.)
│   ├── combatResolution.js      — Defense/Armor + Willpower/SpiritArmor resolution
│   ├── heroAccess.js            — Helper functions (adjustGrit, applyWounds, etc.)
│   ├── heroUtils.js             — Utility reads
│   ├── promptApi.js             — Dice roll/prompt UI bridge
│   ├── diceHelpers.js           — d6, d3, 2d6, Peril die
│   ├── townState.js             — Town visit state (localStorage)
│   ├── townStateAccess.js       — Town state readers/writers
│   └── locationHandlers/        — 26 handler files (see below)
├── data/
│   ├── items/gearCards.js       — 100+ gear items with slots/effects/mods
│   ├── items/mineArtifacts.js   — Mine artifact loot table
│   ├── items/otherWorldArtifacts.js — OtherWorld artifact loot
│   ├── heroClassCards.js        — Hero class definitions
│   ├── getExperienceForLevel.js — XP thresholds
│   ├── getLevelingChart.js      — Per-class level-up charts
│   ├── levelingCharts/          — Detailed per-class progression
│   ├── enemyCards/              — Enemy stat blocks per world
│   └── charts/                  — Mutation/Injury/Madness D66 tables
├── components/
│   ├── StatsTab.jsx             — Hero stats display + gear mod aggregation
│   ├── GearTab.jsx              — Slot-based equipment management
│   ├── ConditionsTab.jsx        — Injuries/Madness/Mutations viewer
│   ├── MiscTab.jsx              — XP, Gold, Skills, Level tracking
│   ├── PosseTab.jsx             — Multi-hero posse management
│   ├── SidebagsTab.jsx          — Side Bag token tracking
│   ├── TownPhaseTab.jsx         — Town visit flow
│   ├── TownTab/                 — Town UI components
│   ├── Town/                    — Location event modal + visit panel
│   ├── DM/                      — DM tools (enemy panels, charts, loot)
│   └── Shops/                   — Shop/service UI
├── context/
│   ├── HeroContext.jsx          — Hero state + Firebase sync
│   └── PosseContext.jsx         — Multi-hero collection management
└── firebase/
    └── firebaseConfig.js        — Firebase init with local-only fallback
```

### Location Handlers
Each file exports an async handler that receives a context object (`ctx`) with `updateHero`, `roll`, `promptChoice`, `doSkillCheck`, `toast`, `showResult`, etc.

```
locationHandlers/
├── blacksmithHandler.js
├── campSiteHandler.js
├── churchHandler.js
├── docsOfficeHandler.js + docsOfficeServices.js
├── frontierOutpostHandler.js + bank/bounties/training services
├── gamblingHallHandler.js + gamblingHallServices.js
├── generalStoreHandler.js
├── indianTradingPostHandler.js + services
├── locationEventHandler.js      — Unified event dispatcher
├── mutantQuarterHandler.js + services
├── saloonHandler.js + saloonServices.js
├── sheriffsOfficeHandler.js + services
├── smugglersDenHandler.js + smugglersDenServices.js
├── streetMarketHandler.js + services + backAlleyServices
└── campSiteHandler.js
```

---

## Mobile / UI Conventions

- **Tailwind CSS v4** with `sm:`, `md:`, `lg:` breakpoints. Default is mobile-first.
- **Tap targets:** Minimum 44×44px on interactive elements (buttons, links, toggles).
- **Modals/drawers:** Must respect viewport height; use `max-h-[80vh] overflow-y-auto`.
- **Text:** Use `break-words` or `overflow-wrap: anywhere` for long effect descriptions.
- **Grids:** Use `grid-cols-1 sm:grid-cols-2 md:grid-cols-3` pattern for responsive layouts.
- **Font sizes:** Minimum `text-sm` (14px) for readability on mobile.

---

## Known Issues / Audit Findings

### Critical (data not persisting)
- `heroAccess.js:adjustCorruption` writes to `corruption` (dropped by sanitizer) — must use `currentCorruption`
- `heroAccess.js:applyWounds/healWounds` writes to `wounds` (not a canonical field) — must use `currentHealth`
- `promptApi.js:137` applyHits fallback writes to `wounds` — must use `currentHealth`
- `saloonHandler.js:156` Bar Fight writes `wounds` — dropped
- `saloonHandler.js:213` Song and Dance heals `health` — dropped
- `streetMarketHandler.js:150` scuffle writes `wounds` — dropped
- `gamblingHallServices.js:318` Robbery writes `wounds` — dropped
- `docsOfficeServices.js:477` injection writes `corruption` — dropped

### Missing Willpower Saves
Any Corruption Hit source must allow Willpower saves unless card text explicitly says "ignoring Willpower". Check all `currentCorruption +=` writes to confirm saves are present.

### Not Yet Implemented
- Adventure system (exploration, depth/darkness track, encounter resolution)
- Enemy attack engine (only hero defense is modeled)
- Critical hit handling in combat (nat 6 → ignore Defense)
- Dark Stone end-of-adventure corruption roll (two-stage)
- Grit reroll restrictions (no rerolls on charts)
- Bleeding/Fear/Madness auto-application post-combat
- Grit spend during combat
- Dark Stone allergy auto-damage (`dsAllergy` flag aggregated but not enforced)
- `gritCap` enforcement from conditions
- `forbidSlots` enforcement in all gear equip paths
- Wanted/Outlaw status tracking on hero
- OtherWorld-specific mutation tables
