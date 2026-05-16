# Shadows of Brimstone — Campaign Tracker App

React + Vite app for tracking Heroes, Town Visits, and game state for *Shadows of Brimstone* by Flying Frog Productions. Firebase for cloud persistence, localStorage as fallback. Mobile-first.

**Tech stack:** React 18, Vite 8, Tailwind CSS 4.1, Firebase (Firestore), Framer Motion, react-router-dom v6, react-grid-layout, tesseract.js (OCR), uuid.

**Dev server:** `npm run dev` → `https://localhost:5173` or `https://<LAN-IP>:5173` (HTTPS via `@vitejs/plugin-basic-ssl` — browser will warn on first load, click Advanced → Proceed).

---

## Critical Codebase Conventions

### Canonical Hero Fields

`sanitizeHero.js` is the single source of truth. Every hero passes through it on load/save. Fields not in the canonical schema are silently dropped.

**Resource pools (always read/write these exact field names):**
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
`Melee To-Hit`, `Ranged To-Hit`, `Defense`, `Willpower`, `Armor`, `Spirit Armor`

**Conditions:** `injuries[]`, `madness[]`, `mutations[]` — top-level arrays of objects.

**Gear:** `hero.gear` is a slot-keyed object. 13 standard slots: `Main Hand`, `Off Hand`, `Head`, `Torso`, `Coat`, `Gloves`, `Hands`, `Pants`, `Feet`, `Shoulders`, `Face`, `Extra 1`, `Extra 2`.

### CRITICAL: Field Name Bugs to Avoid

The sanitizer mirrors `corruption: currentCorruption` as a **read-only alias**. Writing to it is silently dropped.

```js
// CORRECT
ctx.updateHero(id, h => ({ ...h, currentCorruption: (h.currentCorruption ?? 0) + amount }));
ctx.updateHero(id, h => ({ ...h, currentHealth: Math.max(0, (h.currentHealth ?? 10) - wounds) }));
ctx.updateHero(id, h => ({ ...h, currentHealth: Math.min(h.maxHealth ?? 10, (h.currentHealth ?? 0) + heal) }));

// WRONG — silently dropped by sanitizer
ctx.updateHero(id, h => ({ ...h, corruption: X }));     // ← dropped
ctx.updateHero(id, h => ({ ...h, wounds: X }));          // ← dropped
ctx.updateHero(id, h => ({ ...h, health: X }));          // ← dropped
ctx.updateHero(id, h => ({ ...h, corruptionHits: X }));  // ← dropped
```

### Willpower Save Pattern for Corruption Hits

Reference: `miningOperationHandler.js:215-228`. Every Corruption Hit source **must** allow Willpower saves unless card text says "ignoring Willpower":

```js
const h = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? null;
const wpStr = String(h?.willpower ?? h?.stats?.Willpower ?? '5+');
const wpTarget = Number(String(wpStr).match(/\d+/)?.[0]) || 5;
const saveRolls = await ctx.roll?.(hitCount, 6, `Willpower ${wpTarget}+ saves`) || [];
const blocks = (Array.isArray(saveRolls) ? saveRolls : [saveRolls]).filter(n => n >= wpTarget).length;
const unblocked = Math.max(0, hitCount - blocks);
if (unblocked > 0) ctx.updateHero?.(id, hh => ({ ...hh, currentCorruption: (hh.currentCorruption ?? 0) + unblocked }));
```

### Stat Calculation Pipeline

`calculateStats.js` merges: base stats → gear mods → skill mods → condition mods.
- Threshold stats (Defense, Willpower, etc.) improve by **subtracting** delta (e.g., Defense 4+ with +1 → 3+).
- `conditionRules.js` aggregates non-numeric rules: `forbidSlots`, `noCrit`, `dsAllergy`, `gritCap`, `noGuns`.

---

## Routes

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | `HeroScreen` | Main hero view (8 tabs) |
| `/dm` | `DMTab` | DM panel — enemies, loot, card decks, maps, turn tracker |
| `/display` | `DisplayScreen` | Read-only TV display — depth track, posse stats, initiative order |
| `/active-enemies` | `ActiveEnemyStatsPage` | Currently-engaged enemy stats |
| `/enemies` | `EnemyStatsPage` | All-enemies searchable reference |

**HeroScreen tabs:** Stats → Gear → Town → Upgrade → Conditions → Posse → Misc → DM

**TV Display** (`/display`): opened via "📺 Display" button in DM tab header. Full-screen dark theme, world-themed (switches automatically with world selector), real-time via Firebase. Shows: depth track, last HBtD roll, initiative order, per-hero HP/Sanity/Corruption bars + stats. No interaction — pure display.

---

## Context Provider Tree

```
<ErrorBoundary>
  <Router>
    <DeckRegistryProvider>   # item lookup tables (gear, artifacts)
      <WorldProvider>        # campaign world name, Firestore sync
        <CombatProvider>     # darkness/dread/combat groups
          <PosseProvider>    # posse roster, real-time listeners
            <HeroProvider>   # active hero, localStorage/Firestore sync
              <AdventureProvider>  # adventure track, depth, lantern
                <UIScaleProvider> # global UI scale
```

---

## File Structure Map

```
src/
├── App.jsx                      # Router + provider tree
├── context/
│   ├── HeroContext.jsx          # Active hero + Firestore/localStorage sync (200ms debounce)
│   ├── PosseContext.jsx         # Party roster, real-time onSnapshot listeners
│   ├── WorldContext.jsx         # Campaign world name
│   ├── DeckRegistryContext.jsx  # Item lookup maps (gear, mine artifacts, OW artifacts by world)
│   ├── AdventureContext.jsx     # Adventure track, depth track, HBtD, lantern
│   └── UIScaleContext.jsx       # Global UI scale factor + statsViewMode ('tiles'|'list')
├── hooks/
│   ├── useCombatState.jsx       # Darkness deck, growing dread, enemy groups (localStorage key: sob_combat_state_v4)
│   ├── useHexCrawlSettings.js   # HexCrawl mode per-chart toggles (localStorage key: sob:hexcrawl_settings)
│   ├── useLootPool.jsx
│   └── usePersistentMapDrawn.js
├── screens/
│   ├── HeroScreen.jsx           # Tab router + AdventureTrackView
│   ├── DisplayScreen.jsx        # Read-only TV display (/display route), world-themed
│   └── EnemyStatsPage.jsx
├── components/
│   ├── DM/                      # DMTab, DMTurnTracker, DMEnemyPanel, DMLootPoolPanel, DMMapDrawer, etc.
│   │   ├── DMDeckExplorer.jsx   # Collapsible deck browser (all card types incl. enemies)
│   │   └── DMOptionsPanel.jsx   # Options sub-tab shell (Settings/DeckExplorer/ItemGen/Scan)
│   ├── TownTab/                 # Town phase UI + LocationPanel
│   ├── Town/                    # Town event drawers, travel hazards
│   ├── Shops/                   # Shop/service UI
│   ├── StatsTab.jsx             # Hero attributes; tiles OR list layout; tile color customization
│   ├── LevelUpModal.jsx         # 3-step level-up flow (2D6 chart roll, D6 prompts, choices)
│   ├── GearTab.jsx              # Slot-based equipment management
│   ├── ConditionsTab.jsx        # Injuries/Madness/Mutations + Spirit Guide buffs
│   ├── UpgradeTab.jsx           # Skill trees, perks
│   ├── MiscTab.jsx              # XP, Gold, Skills, Level tracking + stats view mode toggle
│   ├── PosseTab.jsx             # Multi-hero posse management
│   ├── SidebagsTab.jsx          # Side Bag token tracking
│   └── ErrorBoundary.jsx
├── utils/
│   ├── sanitizeHero.js          # CANONICAL HERO SCHEMA — source of truth
│   ├── calculateStats.js        # Stat pipeline: base + gear + skills + conditions
│   ├── levelingUtils.js         # XP_THRESHOLDS, xpForLevel, getNextLevelXP, canLevelUp
│   ├── conditionRules.js        # Non-numeric rule aggregation
│   ├── combatResolution.js      # Defense/Armor + Willpower/SpiritArmor resolution
│   ├── heroAccess.js            # adjustGrit, applyWounds, etc.
│   ├── diceHelpers.js           # rollD6, rollND, d3, 2d6
│   ├── promptApi.js             # UI-layer dice/prompt bridge
│   ├── TownEngine.js            # Town phase orchestration
│   ├── townState.js             # Town visit state (localStorage)
│   └── locationHandlers/        # 26+ handler files (one per location)
│       ├── blacksmithHandler.js
│       ├── campSiteHandler.js
│       ├── churchHandler.js
│       ├── docsOfficeHandler.js + docsOfficeServices.js
│       ├── frontierOutpostHandler.js + bank/bounties/training
│       ├── gamblingHallHandler.js + gamblingHallServices.js
│       ├── generalStoreHandler.js
│       ├── indianTradingPostHandler.js + services
│       ├── mutantQuarterHandler.js + services
│       ├── saloonHandler.js + saloonServices.js
│       ├── sheriffsOfficeHandler.js + services
│       ├── smugglersDenHandler.js + smugglersDenServices.js
│       └── streetMarketHandler.js + services + backAlleyServices
├── data/
│   ├── heroes.jsx               # 14 character class definitions
│   ├── items/                   # gearCards.js, mineArtifacts.js, otherWorldArtifacts.js
│   ├── enemies/ + enemyCards/   # Enemy stat blocks per world (13 worlds)
│   ├── townLocations/           # 13/15 locations implemented
│   ├── skillTrees/              # 16 classes, 4 levels each
│   ├── levelingCharts/          # XP→stat tables per class
│   ├── cards/                   # Encounter, darkness, growing dread, loot, threat, world cards
│   │   └── townTypeCards.js     # 7 Frontier Town expansion Town Type cards (Mining, Mutant, Outlaw, Plague, Rail, River, Ruins)
│   ├── charts/                  # Mutation/Injury/Madness D66 tables (mostly stubs — 2-3 entries each)
│   └── depthEvents/             # World-specific Depth Event charts (6 worlds, roll 1-6 = die value doubled)
│       ├── depthEvents_Mines.js, _TargaPlateau.js, _Jargono.js, _DerelictShip.js, _Canyons.js, _BlastedWastes.js
│       └── depthEventLookup.js  # getDepthEvent(world, dieValue) + getHBtDThreshold(depth)
└── firebase/
    └── firebaseConfig.js        # Env key reading, Firestore init, long-polling, emulator config
```

---

## Firebase / Data Persistence

**Firestore collections:** `heroes/{heroId}`, `posse`, `shared/world`

**localStorage keys:** `activeHeroId`, `{heroId}` (hero JSON cache), `sob:lastTab:{heroId}`, `sob_combat_state_v4`, `sob_adventure_state` (adventure track — schema v3, auto-discards older versions), `sob:statsViewMode` (`'tiles'`|`'list'`), `sob:stats:tileColors:{heroId}`, `sob:stats:listOrder:{heroId}`, `sob:stats:layout:{heroId}` (react-grid-layout positions), `dm_options_subtab`, `dm_campaigns`, `dm_current_drawer`, `sob:hexcrawl_settings` (HexCrawl mode toggles — see below)

**Local mode:** If `VITE_FIREBASE_API_KEY` or `VITE_FIREBASE_PROJECT_ID` are missing → localStorage only. Logs `[Firebase] Missing env keys`.

**Required `.env.local`:**
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

---

## Adventure Track Model

**State fields** (`AdventureContext`, `sob_adventure_state` key, schema v3):
| Field | Meaning | Start |
|---|---|---|
| `depth` | Posse steps from entry (0 = at entry, 1 = on space 15, …, 15 = on space 1) | 0 |
| `darkness` | Physical space number darkness occupies (0 = entry right, 1 = space 1, …, 15 = space 15) | 0 |
| `trackLength` | Total numbered spaces (default 15) | 15 |
| `growingDreadSpaces` | Physical space numbers with GD markers (default [6,11,15]) | — |
| `bloodSpatterSpaces` | Physical space numbers with BS markers (default [2,4,8,10,13]) | — |

**Track slot layout** (left → right as displayed):
```
slot 0: Posse Entry
slot 1: space 15
slot 2: space 14
…
slot 15: space 1
slot 16: Darkness Entry
```

**Slot math:**
- `posseSlot = depth` — posse marker sits at this slot index
- `darknessSlot = (trackLength + 1) - darkness` — darkness marker sits at this slot index (slot 16 when darkness=0)
- `consumed = slotIdx > darknessSlot` — space is "eaten" by darkness, shown darker

**Mission failed:** `darkness > trackLength`

**HBtD threshold** (`getHBtDThreshold(depth)` in `depthEventLookup.js`):
- depth 0–4 → 7+
- depth 5–9 → 8+
- depth 10+ → 9+

---

## Tailwind v4 Notes

- Custom colors (`leather`, `brass`, `blood`, `parchment`, `shadow`, `corruption`) defined in `src/index.css` under `@theme { --color-* }` — NOT in `tailwind.config.js`
- Uses `@import "tailwindcss"; @config "../tailwind.config.js";` at top of `index.css`
- Custom utilities use `@utility` directive (e.g., `text-shadow-sm`, `bg-gradient-radial`)
- Dynamically-constructed class names go in `@source inline("...")` safelist
- `tailwind.config.js` only contains `content` glob

---

## Mobile / UI Conventions

- Tailwind `sm:` / `md:` / `lg:` breakpoints. Default is mobile-first.
- Tap targets: minimum 44×44px on all interactive elements.
- Modals/drawers: `max-h-[80vh] overflow-y-auto`.
- Text: use `break-words` / `overflow-wrap: anywhere` for long effect descriptions.
- Grids: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3` pattern.
- Font sizes: minimum `text-sm` (14px) for mobile readability.
- UI scale: global scale factor via `UIScaleContext` + `html[data-btn-size]` for button sizes.

---

## What Has Been Built

- 14 character classes with full stats, abilities, starting items
- 16 skill trees (4 upgrade levels each), leveling charts per class
- Full hero character sheet: Stats (draggable blocks), Gear, Upgrade, Conditions, Misc, Posse, Town, DM tabs
- Posse management with real-time Firebase sync
- DM panel: enemy spawning, darkness/growing dread card decks, loot pools, maps, **initiative/turn tracker**
- **Adventure Tracker** (DM + Hero views): 15-space depth track matching physical board layout `[Posse Entry][15][14]…[1][Darkness Entry]`; correct HBtD (2D6, depth-based threshold 7+/8+/9+, doubles → world-specific Depth Event chart, darkness does not advance on doubles); lantern bearer detection; GD spaces green, BS spaces red
- **Map tile → depth advance**: Drawing a map tile in DMMapDrawer shows an amber banner prompting DM to advance the depth marker
- **TV/Display screen** (`/display`): Read-only full-screen display for a second monitor/TV; world-themed (Mines, Targa, Jargono, Derelict Ship, Canyons, Blasted Wastes, Frontier Town); shows depth track, last HBtD roll, initiative order (heroes + active enemies, enemies win ties), per-hero HP/Sanity/Corruption bars + Grit + full stats; real-time via Firebase; opened via "📺 Display" button in DM tab
- **Camera OCR**: scan enemy cards via live camera viewfinder (tesseract.js)
- **PWA support** for offline/mobile use
- Town phase: 13/15 locations with event tables and services
- Combat: Defense/Armor/Willpower/SpiritArmor resolution paths
- Condition system: injuries, madness, mutations, corruption tracking
- Enemy data: 13 worlds/locations with full stat blocks
- Loot generation, equipment tracking, artifact deck by world
- Hero ejection/sync system for town/hero state
- Firebase persistence with localStorage fallback + ErrorBoundary

### Stats Tab (Hero Sheet)

- **Two layout modes** (toggled from MiscTab → "Stats View Mode"):
  - **Tiles** — draggable react-grid-layout blocks, layout saved per-hero in `sob:stats:layout:{heroId}`
  - **List** — D&D-style vertical list; reorderable via drag-and-drop when layout edit mode is active; order saved in `sob:stats:listOrder:{heroId}`
- **Tile color customization**: right-click (desktop) or long-press (mobile) any stat tile to pick a background + text color theme; saved per-hero in `sob:stats:tileColors:{heroId}`
- **Resource cards**: Health, Sanity, Grit, Corruption, Gold each rendered as colored gradient cards with +/− buttons and a progress bar that pulses red at ≤33%
- **XP card**: shows `currentXP / nextLevelXP`, progress bar, and a "⬆ Level Up!" button when threshold is reached. Buttons: −5 · +10 · +50 · +100
- **`statOrder`** is declared at **module scope** (before the component function) — do not move it inside the component or useState lazy initializers will crash with a TDZ ReferenceError

### Level-Up System

- **`src/utils/levelingUtils.js`**: `XP_THRESHOLDS`, `xpForLevel(level, hero)` (Drifter pays double), `getNextLevelXP(hero)`, `canLevelUp(hero)`
- **`src/components/LevelUpModal.jsx`**: 3-step modal
  - Step 1: Preview + apply full heal/sanity/+1 maxGrit
  - Step 2: Roll **2D6** → land on the class leveling chart (keys 2–12). Re-rolls automatically if the slot is already in `hero.levelTrack`. Shows dice history. Interactive per component type:
    - **Fixed** (`+1 Move`) — shown, applied automatically
    - **D6** (`+D6 Health`) — "Auto Roll" button or manual 1–6 input; adds to `maxHealth`/`maxSanity`
    - **Choice** (`+1 Strength or +1 Initiative`) — radio buttons showing current effective stat (gear included) and 6-max reminder; capped options disabled in red
    - **D6 Split** (`+D6 Health/Sanity any mix`) — roll total then distribute via linked inputs
    - **Narrative** (Vendetta, Dark Stone Resistance) — description shown, no stat change
  - Step 3: Prompt to visit Upgrade tab for skill tree choice
- **`hero.levelTrack`**: keyed by 2D6 chart result (2–12), not by character level — tracks which chart slots have been used
- **`hero.levelBonuses`**: keyed by chart result, stores what was applied at each slot
- **Leveling charts** (`src/data/levelingCharts/`): objects keyed 2–12 with `{ name?, description?, bonus?, extra?, effects?, extraRoll? }`. `bonus`/`extra` are strings parsed at runtime; `effects`/`extraRoll` are legacy structured format. Most classes use the string format.

### DM Tab — Options Consolidation

The **Options** top-level tab now contains four sub-tabs (state persisted as `dm_options_subtab`):
- **Settings** — campaign checkboxes (world source selection), select-all/none, merged worlds count
- **Deck Explorer** — browse all card decks (see below)
- **Item Generator** — moved from former top-level tab
- **Scan Cards** — moved from former top-level tab

`src/components/DM/DMOptionsPanel.jsx` renders the sub-tab shell and passes props through to each sub-component.

### Deck Explorer (`src/components/DM/DMDeckExplorer.jsx`)

Collapsible sections with card counts and search for every deck:

| Section | Source | Notes |
|---|---|---|
| Darkness Cards | `darknessCards.js` | `DARKNESS_CARDS` |
| Growing Dread | `growingDreadCards.js` | `GROWING_DREAD_CARDS` |
| Encounter Cards | `encounterCards.js` | `ENCOUNTER_CARDS` |
| Loot Cards | `lootDeck.js` | `lootCards` |
| World Cards | `worldCards.js` | `WORLD_CARDS` |
| Map Cards | `mapCards.js` | `MAP_CARDS` |
| Gear Cards | `items/gearCards.js` | slot, value, effects, restrictions |
| Mine Artifacts | `items/mineArtifacts.js` | type, value, effects |
| OtherWorld Artifacts | `items/otherWorldArtifacts.js` | type, value, effects |
| Enemy Cards | `enemyCards/index.js` `ENEMY_CARDS` | World picker dropdown → searchable list; HP/Def/Init/To-Hit badges + abilities |
| Town Type Cards | `data/cards/townTypeCards.js` | 7 Frontier Town expansion double-sided Town Type cards |
| Town Traits (D36) | `DM/charts/townTraitsChart.js` | HexCrawl D36 Town Traits chart (all 36 entries) |

### HexCrawl Mode (`src/hooks/useHexCrawlSettings.js`)

Per-chart toggles stored in `localStorage` under key `sob:hexcrawl_settings`. Managed via `useHexCrawlSettings()` hook (returns `{ settings, toggle, setAll }`).

**Settings shape:**
```js
{
  injuryChart:      true,   // use D36 HexCrawl injury chart in DM Chart Panel
  madnessChart:     true,   // use D36 HexCrawl madness chart in DM Chart Panel
  mutationChart:    true,   // use D36 HexCrawl mutation chart in DM Chart Panel
  townTraits:       true,   // roll Town Traits on town entry (D36)
  persistentHealth: false,  // no full heal at adventure end — Catch Your Breath only
}
```

**Defaults:** all charts ON, persistentHealth OFF. When a chart is OFF, `DMChartPanel` shows a callout banner instructing the DM to roll the physical D66 chart instead.

**Charts:** `src/components/DM/charts/` contains the full HexCrawl D36 entries (injuryChart, madnessChart, mutationChart, townTraitsChart). These are the digital lookups. Standard Brimstone charts in `src/data/charts/` are stubs only (2–3 entries) — no digital lookup for standard mode.

**Persistent Health:** When ON, end-of-adventure confirmation shows a "Catch Your Breath" instruction instead of the "Full Heal All Heroes" button. DM resolves the 2D6 heal manually per hero.

**UI:** DM Options → Settings sub-tab → "HexCrawl Mode" section (5 checkboxes + All On / All Off buttons).

### Initiative Order — Enemies Included

Both `DisplayScreen.jsx` and `DMTurnTracker.jsx` now merge heroes and active enemy groups into a single sorted list. **Tie-break: enemies activate before heroes** at equal initiative.

Sort key: `b.initiative - a.initiative || (a.type === 'enemy' ? -1 : 1)`

On the TV display, enemy entries render with a red-tinted border and show `×count` in the sub-text.

---

## Known Issues / Audit Findings

### Data-Not-Persisting Bugs (fields silently dropped by sanitizer)
- `heroAccess.js:adjustCorruption` writes to `corruption` → use `currentCorruption`
- `heroAccess.js:applyWounds/healWounds` writes to `wounds` → use `currentHealth`
- `promptApi.js:137` applyHits fallback writes to `wounds` → use `currentHealth`
- `saloonHandler.js:156` Bar Fight writes `wounds` → fix
- `saloonHandler.js:213` Song and Dance heals `health` → fix
- `streetMarketHandler.js:150` scuffle writes `wounds` → fix
- `gamblingHallServices.js:318` Robbery writes `wounds` → fix
- `docsOfficeServices.js:477` injection writes `corruption` → fix

### Missing Willpower Saves
Any `currentCorruption +=` write must be preceded by Willpower saves unless card text says "ignoring Willpower".

### Not Yet Implemented
- Enemy attack engine (only hero defense is modeled)
- Critical hit handling (nat 6 → ignore Defense)
- Dark Stone end-of-adventure corruption roll (two-stage)
- Grit reroll restrictions (no chart rerolls)
- Bleeding/Fear/Madness auto-application post-combat
- Grit spend during combat
- Dark Stone allergy auto-damage (`dsAllergy` flag exists but not enforced)
- `gritCap` enforcement from conditions
- `forbidSlots` enforcement in all gear equip paths
- Wanted/Outlaw status tracking
- OtherWorld-specific mutation tables
- Injury/Madness/Mutation charts (D66 — currently only 2-3 stub entries each)
- Spirit Guides (Eagle, Snake, Beaver) — in `finish-general-store` branch, not yet merged
- Doc's Office Medical Attention tab disable — in `disable-medical-attention` branch, not yet merged
- Orphanage and Town Hall locations (stubbed empty)

---

## Enemy Mechanic Support Reference

### Combat Resolver Handles (`combatResolution.js`)
- Endurance (X) — max wounds per hit cap, parsed from ability text
- Tough — immune to Critical Hits
- Cover X+ — additional save per hit
- Enemy Armor X+ — parsed from ability text

### Hero Markers (`statusMarkers.js`)
| Key | Matches enemy text |
|---|---|
| `bleeding` | "Bleeding marker" |
| `poison` | "Poison marker" |
| `fire` | "Burning marker" (naming mismatch — enemies say "Burning") |
| `web` | "Webbed marker" |
| `snare` | "Snare marker" |
| `noise` | "Noise marker" |
| `voidVenom` | NOT in system — used by all Spider variants |

### Enemy Mechanics NOT Implemented
- Regeneration (X) — heals X wounds at turn start (Hell Vermin, Undead Gunslinger, etc.)
- Spawning — mid-fight enemy adds (Egg Sacks, Corpse Pile)
- Fear/Terror/Unspeakable Terror — automatic Horror Hits on activation
- D8 dice for To Hit — Magma Giant (Massive Fists)
- Lava Spaces — terrain markers
- Shootout mechanics — Undead Gunslinger/Outlaws
- Formation — Lost Army defensive stance
- Enemy special card decks — Serpent Magik, Shaman Juju Trinkets, etc.

### Enemy Data Schema (3 formats, all handled by `enemyUtils.js:normalizeEnemyData`)
1. **Old** (mineEnemies): flat `health`, `defense`, `melee: { toHit, damage }`, `eliteChart`
2. **Western** (westernEnemies, scannedEnemies): `stats: { normal, brutal }`, `toHit: { melee, ranged }`, `eliteAbilities`
3. **Scanner internal**: flat `normalCombat`, `brutalCombat` → converted to western by `formatEnemyForExport`

---

## Tailwind v4 Notes

- Custom colors (`leather`, `brass`, `blood`, `parchment`, `shadow`, `corruption`) are defined in `src/index.css` under `@theme { --color-* }` — NOT in `tailwind.config.js`
- Use `@import "tailwindcss"` at the top of `index.css`, not `@tailwind base/components/utilities`
- Custom utilities (`text-shadow-*`, `bg-gradient-radial`) use `@utility` directive
- Safelist classes (dynamically constructed in JS) go in `@source inline("...")` in `index.css`
- `tailwind.config.js` only contains `content` glob — theme/plugins/safelist all moved to CSS

## Common Gotchas

- **HTTPS:** Vite serves HTTPS via self-signed cert. Browser warns on first load — click "Advanced → Proceed". Always use `https://` not `http://`.
- **Empty Claude sessions:** If a session errors with `400 text content blocks must be non-empty`, use `/clear`. This is a Claude API issue, not an app bug.
- **Firebase local mode:** If app doesn't sync, check `.env.local` has valid keys. Console logs `[Firebase] Missing env keys`.
- **Firestore long-polling:** Enabled by default (`experimentalAutoDetectLongPolling: true`) — avoids 400 channel errors on VPNs.
- **react-grid-layout:** Stat block layout saved per-hero in localStorage. Clearing storage resets layout.
- **Sanitizer drops unknown fields:** Never write to `wounds`, `corruption`, `health`, `corruptionHits`. Always use the canonical field names above.
- **Grit rerolls:** Cannot reroll anything rolled on a chart (Injury, Madness, Mutation, Town Events, Exploration, etc.).

---

## Verified Shadows of Brimstone Rules Reference

*Sources: City of the Ancients Rulebook, Swamps of Death Rulebook, Forbidden Fortress Rulebook, Gates of Valhalla Rulebook, Official FAQ v1.02 + v2.01, Esoteric Order of Gamers summary v1.2, Brimstone Mission Generator Reference.*

### Core Game Loop

Each session has 3 phases in order:
1. **Adventure Phase** — Explore the dungeon, fight enemies, collect loot
2. **Travel Phase** — Roll travel hazards between missions
3. **Town Phase** — Visit town locations, heal, buy gear, advance heroes

**Adventure round sequence:**
1. Hold Back the Darkness (HBtD) — Lantern Bearer rolls 2D6 vs stage target; see full rules below
2. Hero Activation — each hero takes a turn (Move + Action, or double Move)
3. Room Exploration — reveal Exploration tokens on entry
4. End of Turn — (darkness marker advances on HBtD failure, not end of turn)

### Hero Stats

Every hero has:
- **Health** / **Sanity** — resource pools (KO at 0)
- **Defense** / **Willpower** — threshold saves (X+), roll 1 die per hit
- **Armor** / **Spirit Armor** — secondary saves after wounds applied
- **Combat** — number of attack dice
- **Initiative** — determines activation order
- **Grit** / **Max Grit** — reroll tokens
- **6 Skills:** Agility, Cunning, Spirit, Strength, Lore, Luck (1–6, tested by rolling that many D6, need one ≥ target)

### Combat

**Attack chain:**
1. Roll Combat dice (or weapon dice). Each die ≥ To-Hit target scores a Hit.
2. **Critical Hit:** Natural 6 ignores Defense entirely — no save allowed.
3. Enemy rolls Defense saves (1 die per Hit, success blocks the Hit).
4. Each unblocked Hit deals weapon Damage in Wounds.
5. If hero has Armor, roll 1 Armor die per Wound — success ignores that Wound.

**Horror path (Sanity):** Same chain but uses Willpower saves + Spirit Armor.

**"Ignoring Defense"** and **"Ignoring Willpower"** are separate flags — one does not imply the other.

**Off-hand weapon:** +1 added to To-Hit number required.

### Hold Back the Darkness (HBtD) — Full Rules

Happens **every round** including during fights. The hero holding the **Old Lantern** makes the roll.

**Roll:** 2D6. Compare the total to the **stage target** based on the party's current depth zone:
| Depth Stage | Target |
|---|---|
| Stage 1 (shallow, depths 1–4) | 7+ |
| Stage 2 (mid, depths 5–9) | 8+ |
| Stage 3 (deep, depths 10–15) | 9+ |

**Result — not doubles:**
- **Success (meets or beats target):** Nothing happens. Darkness held back.
- **Failure (below target):** Advance the Darkness marker **1 space** forward on the Darkness Track.
  - If the marker lands on a **blood-spatter space** → draw a **Darkness Card** immediately.
  - If the marker lands on a **Growing Dread space** → draw a **Growing Dread Card** (place face-down).
  - If the marker reaches the end → mission consequence (per mission card).

**Result — doubles rolled (any total):**
- The Darkness marker does **NOT** move (regardless of whether the total would have succeeded or failed).
- Instead resolve a **Depth Event** from the world-specific Depth Event Chart, keyed to the total rolled (2, 4, 6, 8, 10, or 12). Each world has its own chart — Mines, Targa Plateau, Jargono, etc. are all different.

**Grit:** Cannot be spent to reroll the 2D6 HBtD roll. Grit CAN be spent on any saves triggered by the resulting Depth Event effects.

**Modifiers:** The "Encroaching Darkness" Darkness Card subtracts −1 from the HBtD total while in play.

### Darkness Cards

~12-card deck shuffled at mission start. Drawn when the Darkness marker lands on a blood-spatter space after a failed HBtD roll. Effects include:
- Enemy spawns at specific locations
- Environmental damage to all heroes
- "Remain in Play" debuffs until condition met
- Escalation (advance Darkness marker)

Shuffle discard pile when deck empties.

### Growing Dread

~7-card deck. Cards drawn and placed face-down when the Darkness marker passes a Growing Dread space. All revealed simultaneously at mission climax (when objective room entered or final room explored). Effects escalate danger.

### Town Phase

**7-step sequence:**
1. **Recover KO'd Heroes** — roll on Injury/Madness chart for each
2. **Sell Dark Stone** — $25/stone at Frontier Outpost (or special prices)
3. **Corruption Check** — roll for any carried Dark Stone
4. **Choose Town** — pick campaign's frontier town or outpost
5. **Days in Town** — each day: pick 1 location, roll 2D6 event chart, resolve services
6. **Upgrade Heroes** — spend XP on skill tree nodes
7. **Prepare** — buy supplies, reorganize gear, choose next mission

**Town Event Track:** Day Marker starts at 1. End of each day, roll D6. If roll ≤ Day Marker → Town Event fires (reset to 1). Otherwise advance +1. Longer stays make events inevitable.

**Frontier Town locations (base game):**
- General Store — ammo, clothing, basic supplies
- Blacksmith — weapon upgrades, horse purchases
- Doc's Office — surgery, corruption treatment, Medical Attention service
- Church — blessings, exorcism, rituals
- Saloon — entertainment, rumors, gambling
- Frontier Outpost — bounties, banking, training, Dark Stone sales
- Gambling Hall — Blackjack, Roulette, Craps, Dice games
- Indian Trading Post — rituals, auras, Spirit Cleansing, Vision Quest
- Sheriff's Office — bounties, wanted poster system
- Street Market — open market, bath house, Dark Stone selling
- Smuggler's Den — black market, outlaw services
- Mutant Quarter — mutation-friendly services
- Camp Site — wilderness camp, healing tents

### Depth & Exploration

**Map tiles:** Passages (corridors) and Rooms. Place tiles as heroes explore.

**Exploration tokens** (placed face-down on new tiles): Encounter / Attack / Gate / Empty

**Look Through a Door action:** Reveal tile + token without entering.

**Scavenge:** Roll 3D6; each 6 = draw 1 Scavenge card.

**OtherWorld portals (Gates):** Hero who triggers a Gate is transported to the OtherWorld map. Must find another Gate to return, or complete an OtherWorld objective.

**Depth Track:** Each room entered advances depth. Higher depth = stronger Encounter tables + more Darkness cards drawn.

### Conditions

**Injuries** (from HP KO):
- Roll on Injury Chart (D66, 36 entries)
- Career-permanent unless cured at Doc's Office
- Can forbid gear slots, reduce attack dice, limit actions

**Madness** (from Sanity KO):
- Roll on Madness Chart (D66, 36 entries)
- Career-permanent unless exorcised at Church
- Behavioral rules, stat changes

**Mutations** (from Corruption overflow):
- When Corruption Points reach Max Corruption (default 5): discard all points → roll Mutation Chart (D66)
- Career-permanent, no removal
- Getting the same mutation twice = permanent character death

**Removal:**
- Injuries → Doc's Office surgery (cost + stat check)
- Madness → Church exorcism (cost + Spirit check)
- Corruption Points → Spirit Cleansing at Indian Trading Post, or Church rituals

### Loot

- Each hero draws **1 Loot card per Threat card** (max 3) after a fight
- Loot types: Gold (D6×$25/$50/$100), Dark Stone (1 or D3), Gear card, Artifact card
- **Side Bags:** extra item slots beyond standard gear; limited by Side Bag type
- **Scavenge cards** drawn during exploration give bonus items

### XP & Leveling

| Level | Cumulative XP Required |
|---|---|
| 2 | 500 |
| 3 | 1,000 |
| 4 | 2,000 |
| 5 | 3,000 |
| 6 | 4,500 |
| 7 | 6,000 |
| 8 | 8,000 |

**On level-up:** Full heal + Sanity restore → +1 Grit → roll Random Bonus → choose 1 Upgrade from class chart (4 choices per tier, top-down order enforced, 7 total upgrades over career).

### Grit

- **Start of mission:** 1 Grit (regardless of max)
- **Spend:** Reroll any number of failed dice from one roll (can't reroll same die twice)
- **Restriction:** Cannot reroll dice rolled **on a chart** (Injury, Madness, Mutation, Town Event, Exploration, Travel, Trap charts). CAN reroll attack/defense/save dice triggered by chart results.
- **Recovery:** Skip exploration action (heal D6 or recover 1 Grit), level-up, specific abilities/events

### Dark Stone

- Each Dark Stone carried → end-of-adventure risk: roll D6; on 1-3 take a Corruption Hit → Willpower save
- No Grit rerolls on the D6 risk roll itself; Grit CAN be used on the Willpower save
- Dark Stone weapons grant bonus attack dice but increase corruption exposure
- Items with `darkStone: true` flag count for end-of-adventure rolls

### Campaigns & Expansions

**Core sets:**
- City of the Ancients — Old West mines, Targa Plateau OtherWorld
- Swamps of Death — Old West, Jargono (Swamps) OtherWorld
- Forbidden Fortress — Feudal Japan, Belly of the Beast OtherWorld
- Gates of Valhalla — Norse setting, Valhalla OtherWorld

**OtherWorld expansions (10+):** Caverns of Cynder, Derelict Ship, Blasted Wastes, Forest of the Dead, Cursed Mountain, Valley of the Serpent Kings, and more.

**Hero Packs:** Individual hero expansions with new class + items.

### Card Decks (Complete List)

| Deck | When Used | Shuffle Rule |
|---|---|---|
| Map Tiles | Exploration | N/A (permanent layout) |
| Exploration Tokens | Room entry | Reshuffle when empty |
| Threat Cards | Fight start | Per encounter |
| Encounter Cards | Exploration tokens | Per mission |
| Darkness Cards | HBtD fail | Reshuffle discard when empty |
| Growing Dread | Darkness marker passes GD spaces | Revealed all at once at climax |
| Loot Cards | Post-fight | Reshuffle when empty |
| Scavenge Cards | Scavenge action | Reshuffle when empty |
| Town Event Cards | Town Event trigger | Reshuffle when empty |
| Town Gear Cards | Shop purchases | N/A (static list) |
| Travel Hazard Cards | Travel phase | Per travel |
| World Cards | World Events | Per mission |
| Elite Ability Cards | Elite enemy spawn | Shuffle elite deck |
| Mine Artifact Cards | Loot draw (mine) | Reshuffle when empty |
| OtherWorld Artifact Cards | Loot draw (OW) | Reshuffle when empty |
| Personal Item Cards | Hero creation | N/A |

---

## Full Mechanics Audit (2026-05-16)

### Implemented

| Mechanic | Location |
|---|---|
| Hero stats, gear, conditions (injuries/madness/mutations) | `sanitizeHero.js`, `ConditionsTab.jsx` |
| Skill trees, leveling charts, XP, level-up 2D6 roll | `LevelUpModal.jsx`, `levelingUtils.js` |
| All 13 Frontier Town locations (event tables + services) | `locationHandlers/` |
| Blasted Wastes town locations (Workshop, Mining Op, Market, Arena, Temple, Doc) | `locationHandlers/` |
| Adventure depth track (15-space, HBtD 2D6, doubles→Depth Event) | `AdventureContext.jsx`, `AdventureTrackView.jsx` |
| Depth events for 6 worlds (Mines, Targa, Jargono, Derelict Ship, Canyons, Blasted Wastes) | `data/depthEvents/` |
| TV display screen with hero stats, initiative, depth track | `DisplayScreen.jsx` |
| Posse management (Firebase real-time sync) | `PosseContext.jsx` |
| Gear upgrade slot system (attach/remove across all locations) | `upgradeSlots.js`, `GearTab.jsx` |
| Combat resolution: Defense, Armor, Willpower, Spirit Armor | `combatResolution.js` |
| Enemy stat blocks (13 worlds) | `data/enemyCards/` |
| Loot generation | `DMLootPoolPanel` |
| Camera OCR (enemy card scanning) | tesseract.js |
| Dark Stone quantity tracking (`darkStone` field) | `sanitizeHero.js`, `StatsTab.jsx` |
| Corruption overflow → placeholder mutation added automatically | `sanitizeHero.js` |
| Grit reset to 1 on adventure start | `DMAdventureTracker.jsx` `handleStartAdventure` |
| End-of-adventure Dark Stone corruption roll (automated) | `DMAdventureTracker.jsx` `handleEndAdventure` |
| Mutation pending alert + duplicate-mutation death warning | `ConditionsTab.jsx` |
| Prominent HBtD result modal (hero + DM) | `AdventureTrackView.jsx`, `DMAdventureTracker.jsx` |
| Initiative order: enemies beat heroes on ties | `DisplayScreen.jsx`, `DMTurnTracker.jsx` |

### Not Yet Implemented — Priority Order

#### High (core loop, happens every session)
| Mechanic | Notes |
|---|---|
| Injury/Madness/Mutation D66 full chart data | Only 2-3 stub entries each; all 36 needed per chart |
| Critical hits (nat 6 → ignore Defense) | `combatResolution.js` needs `isCrit = roll === 6` path |
| Enemy attack engine | Only hero defense is modeled; enemy attacks are narrated manually |
| Corruption overflow auto-prompt in UI | Sanitizer adds placeholder mutation but no in-session alert fires at the moment of overflow |

#### Medium (important but not every round)
| Mechanic | Notes |
|---|---|
| Elite enemy abilities | `eliteChart` in data but no roll/apply/track mechanic |
| GD card simultaneous reveal trigger | DM panel needs "Reveal all GD cards" button for mission climax |
| Off-hand weapon To-Hit penalty | +1 to To-Hit for weapons in `Off Hand` slot; not enforced in stat pipeline |
| Travel hazard phase UI | `travelHazardChart.js` exists; no phase UI between adventure and town |
| Scavenge action | Roll 3D6; each 6 → draw Scavenge card; no UI |
| Threat cards → loot count link | `threatDecks.js` exists; not wired to loot draw count |
| Grit recovery (Rest action) | Skip explore → heal D6 HP or gain 1 Grit; no UI |
| Wanted/Outlaw status tracking | Smuggler's Den data exists; no persistent flag on hero |
| Mission card selection/objectives | No mission structure; DM manages manually |
| OtherWorld-specific mutation tables | Only the base table stub exists |

#### Low (expansion content / advanced rules)
| Mechanic | Notes |
|---|---|
| OtherWorld Gates (portal transport) | Exploration token mechanic; not modeled |
| Enemy Regeneration (X) | Heals X wounds at turn start |
| Fear / Terror / Unspeakable Terror | Auto Horror Hits on enemy activation |
| Enemy Spawning | Mid-fight enemy adds (Egg Sacks, etc.) |
| Formation | Lost Army defensive stance |
| Shootout mechanics | Undead Gunslinger / Outlaws |
| D8 die type | Magma Giant Massive Fists; only D6 modeled |
| Enemy special card decks | Serpent Magik, Shaman Juju Trinkets, etc. |
| Depth events for 7+ worlds | Belly of the Beast, Forest of the Dead, Cursed Mountain, Valley of the Serpent Kings, Valhalla, etc. |
| Exploration token draw randomization | DM resolves manually |
| Lava Spaces | Terrain mechanic not modeled |
| Orphanage / Town Hall | Stubbed empty |

### Known Data-Not-Persisting Bugs (silently dropped by sanitizer)
- `heroAccess.js:adjustCorruption` writes `corruption` → use `currentCorruption`
- `heroAccess.js:applyWounds/healWounds` writes `wounds` → use `currentHealth`
- `promptApi.js:137` applyHits fallback writes `wounds` → fix
- `saloonHandler.js:156` Bar Fight writes `wounds` → fix
- `saloonHandler.js:213` Song and Dance heals `health` → fix
- `streetMarketHandler.js:150` scuffle writes `wounds` → fix
- `gamblingHallServices.js:318` Robbery writes `wounds` → fix
- `docsOfficeServices.js:477` injection writes `corruption` → fix
