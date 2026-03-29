# CLAUDE.md — Shadows of Brimstone Companion App

## Overview

Digital companion/tracker for the Shadows of Brimstone board game. Built with React 18, Vite 5, Tailwind CSS 4, and Firebase (Firestore). JavaScript only — no TypeScript.

## Commands

```bash
npm run dev        # Start dev server (port 5173)
npm run build      # Production build (use to verify changes — no linter or tests)
npm run preview    # Preview production build
```

**Tool scripts:**
```bash
node tools/fix-town-imports.mjs     # Add explicit .js extensions to town location imports
node tools/check-balance.mjs <file> # Validate bracket/brace/paren balance in a file
```

## Architecture

```
src/
├── components/    # 151 files — UI components organized by feature (DM/, Loot/, Shops/, Town/, TownTab/)
├── data/          # 217 files — game content (heroes, enemies, items, loot, town locations, skill trees)
├── utils/         # 82 files — pure game logic (combat, conditions, stats, location events)
├── context/       # 6 React Context providers
├── hooks/         # 5 custom hooks (combat state, loot pool, Firestore sync)
├── firebase/      # Config + sync handlers
├── screens/       # Page-level components
├── App.jsx        # Router + provider tree
└── main.jsx       # ReactDOM entry
```

## Context Providers (State Management)

| Context | Purpose |
|---------|---------|
| PosseContext | All heroes in the party |
| HeroContext | Active/selected hero |
| WorldContext | Current game world |
| CampaignContext | Campaign tracking |
| DeckRegistryContext | Item deck management |
| UIScaleContext | UI scaling preferences |

**Data flow:** Context API (shared state) + localStorage (offline persistence) + Firestore (cloud sync). `sanitizeHero.js` validates all hero data before Firestore writes.

## Coding Conventions

- **Components:** Functional only. `export default function ComponentName() {}`.
- **Context pattern:** `createContext(null)` → `export function XProvider({ children })` → `export function useX()`.
- **Styling:** Tailwind utility classes. Inline `style={{}}` only for dynamic values.
- **State:** `useMemo`, `useCallback`, `useRef` for memoization. localStorage with try/catch.
- **Defensive coding:** Optional chaining (`hero?.id`), nullish coalescing (`?? fallback`).
- **Naming:** PascalCase components, camelCase functions, UPPER_SNAKE constants, `use` prefix for hooks.
- **Exports:** Default exports for components, named exports for utilities.

## Game Data Format

Hero stats use mixed types — numbers for values, strings for thresholds:
```js
{ stats: { Agility: 4 }, toHit: { ranged: "4+", melee: "5+" }, defense: "4+" }
```

Data is organized as nested objects: `category > className > details`. Arrays for abilities and items.

## Gotchas

- **No linter or test framework.** Run `npm run build` to verify changes compile.
- **Town location imports** need explicit `.js` extensions or Vite can't resolve them. Run `fix-town-imports.mjs` if you see import errors.
- **Large files:** TownTab/index.jsx (~111KB), GearTab.jsx (~48KB), calculateStats.js (~47KB).
- **Firebase localMode:** When env vars are missing, Firebase gracefully falls back to localStorage-only mode.
- **Sanitization:** Hero data is sanitized on every write — undefined values stripped, dot-keys rejected, circular refs detected.

## Location Handler Conventions

All location event handlers in `src/utils/locationHandlers/` **must** follow these patterns. Reference `saloonHandler.js` as the canonical example.

### Required patterns for every handler

1. **display() function** — Return `{ title, lore, effect }` for each roll value. Lore should match the card text from the board game rulebook.

2. **Lore in log output** — Every event starts with title + lore in the log:
   ```js
   log.push(`[Location] (${roll}) ${info.title} — ${info.lore}`);
   log.push(`Effect: ${info.effect}`);
   ```

3. **Result prompts** — After every roll (skill checks, damage, costs, healing), **show the result as a prompt dialog** so the player can see and acknowledge the outcome before continuing:
   ```js
   await showResult(ctx, 'EVENT TITLE — Result', [checkLine, '', outcome]);
   ```
   Use `ctx.promptChoice` with a single `[{ label: 'Continue' }]` button. The `showResult` helper does this:
   ```js
   async function showResult(ctx, title, lines) {
     const body = Array.isArray(lines) ? lines.join('\n') : lines;
     await ctx.promptChoice?.(`${title}\n\n${body}`, [{ label: 'Continue' }]);
   }
   ```

4. **Skill checks use returnDetails** — Always use `returnDetails: true` and format the result:
   ```js
   const result = await ctx.doSkillCheck(id, {
     stat: 'Strength', target: 5, returnDetails: true,
     message: `EVENT TITLE\nLore text\nFlavor about what you're doing.`,
   });
   const checkLine = formatCheckResult(result, 'Strength', 5);
   // checkLine = "Rolled [3, 5] — PASSED (Strength 5+, 1 success)"
   ```

5. **Auto-rolled dice show values** — When rolling D6 for damage, costs, healing, etc., always show the roll:
   ```js
   const woundRoll = d6();
   const woundLine = `Rolled [${woundRoll}] for Wounds.`;
   log.push(woundLine);
   ```

6. **Skill check messages include hero context** — The `message` param to `doSkillCheck` should include the event title, lore, and a flavor line about what the hero is attempting. The system appends the mechanical label (e.g., "Strength 5+ test (3d6)") automatically.

7. **Player choices for OR-tests** — When the rulebook says "Stat1 X+ OR Stat2 Y+", use `promptChoice` to let the player pick which test to attempt (don't auto-chain them).

8. **Manual vs Auto rolls** — If the roll is something the player can influence (skill checks, willpower, defense, armor saves, tests), use a manual input pre-filled with an auto-roll result. The player can accept the default by hitting Continue, or change the value if they rolled physical dice or spent grit. This avoids an extra "auto or manual?" prompt — the input field serves both purposes. For rolls the player cannot control (damage amounts, item values, gold costs, wound rolls), auto-roll with `d6()` and just display the result.

### Hero data field names

- **Grit:** Use `currentGrit` (not `grit`). Read: `h.currentGrit ?? h.grit ?? 0`. Write: `{ currentGrit: newVal }`.
- **Health:** Use `currentHealth`. Max at `h.maxHealth ?? h.max_health ?? 10`.
- **Sanity:** Use `currentSanity`. Max at `h.maxSanity ?? h.SanityMax ?? 0`.
- **Gold:** Use `h.gold`. Always `Math.max(0, ...)` to prevent negative.
- **XP:** Use `h.xp`.
- **Location visit buffs:** Store on `hero.locationVisitBuffs` (e.g., `{ Luck: 2, Cunning: 2 }`). These are automatically picked up by `doSkillCheck` and `getEffectiveStat` in `locationEventContext.js`.
- **Adventure buffs/debuffs:** Store on `hero.adventureBuffs` / `hero.adventureDebuffs` for effects that apply at next adventure start.

### Handler return format

```js
return {
  actions: [],
  townState: ctx.townState,
  log: result?.log || [`Location Event Roll: ${roll}`],
  eventRoll: roll,
  eventIndex: Math.max(0, roll - 2),
};
```

### Never use `window.prompt`, `window.alert`, or `window.confirm`

Use the structured ctx methods instead: `ctx.promptChoice`, `ctx.promptNumber`, `ctx.promptYesNo`, `ctx.doSkillCheck`.

## SoB Combat Rules Reference

### Hero Attacks vs Enemies

1. **Roll To-Hit**: Roll dice equal to Combat (melee) or Shots (ranged) stat. Max 8 dice per attack. Each die ≥ weapon's To-Hit value = 1 Hit. Dual-wielding off-hand needs 1 higher to hit and neither weapon can crit.
2. **Assign Hits**: Melee hits to adjacent enemies only. Ranged must target adjacent enemies first; overflow to others only after adjacent are dead.
3. **Roll Damage**: Each Hit deals D6 damage.
4. **Enemy Defense (flat reduction)**: Subtract enemy's Defense value from each damage roll. Remainder = wounds to enemy Health. Defense 0 or less = no damage from that hit.
5. **Critical Hits**: Ignore enemy Defense entirely. If enemy is immune to crits ("Tough"), treat as normal hit (Defense applies).
6. **Enemy Armor (saving throw, if any)**: Per wound, roll D6 ≥ Armor target to negate that wound.

### Enemy Attacks vs Heroes

1. **Enemy generates Hits**: Based on Combat/Shots values and To-Hit target.
2. **Hero Defense (saving throw)**: Roll D6 per incoming Hit. Each roll ≥ Defense target blocks that entire Hit. Roll all Defense dice together (Grit can reroll all failed dice at once).
3. **Wounds**: Each unblocked Hit = wounds equal to enemy's Damage value.
4. **Hero Armor (saving throw)**: Roll D6 per wound. Each roll ≥ Armor target negates 1 wound. Only one Armor save applies (use best). Armor saves do NOT stack.
5. **KO'd**: Health reaches 0 = KO'd. No further wounds applied.

### Horror/Sanity Track

Same structure but with different stats:
- **Horror Hits** defended by Willpower (saving throw per hit).
- Unblocked Horror Hits cause Sanity Damage (usually 1 per hit unless stated otherwise).
- **Spirit Armor** saves per point of Sanity Damage (like Armor for wounds).
- Neither Armor nor Spirit Armor prevents Corruption.

### Hit Types

| Type | Causes | Defended By |
|------|--------|-------------|
| Hits | Wounds | Defense (hero) / flat reduction (enemy) |
| Horror Hits | Sanity Damage | Willpower |
| Corruption Hits | Corruption Points | Willpower |
| Hex Hits | Wounds | Willpower |
| Toxin Hits | Poison tokens | Defense |

### Special Mechanics

- **Endurance (X)**: Caps wounds from a single Hit to X. Applied before Armor saves.
- **Damage Reduction**: "Reduce all damage by X (min 1)" — flat subtraction before converting to wounds. Some are type-specific (Fire, Ranged, etc.).
- **Tough**: Immune to Critical Hits only (not damage reduction).
- **Cover X+**: Situational saving throw against specific damage types (e.g., "Cover 4+ vs Explosives"). Separate from Defense/Armor.

### Enemy vs Hero Defense — Key Difference

**Enemy Defense = flat number** (higher = better for enemy). Stored as plain int (e.g., `defense: 5`). Subtracted from each D6 damage roll. Modifiers add/subtract directly: `+1 Defense` → `defense + 1`.

**Hero Defense = threshold** (lower = better for hero). Stored as string (e.g., `"4+"`). Roll D6 ≥ target to block. In `calculateStats.js`, a positive delta improves the threshold: `+1` makes `5+` → `4+`.

### Combat Resolution Order (Full)

```
Hero Attack → Roll To-Hit → Assign Hits → Roll D6 Damage per Hit
  → Subtract Enemy Defense (flat) → Apply Endurance cap
  → Roll Enemy Armor saves (per wound) → Apply wounds to Health

Enemy Attack → Generate Hits → Hero rolls Defense (per hit, saving throw)
  → Failed hits × Damage value = pending Wounds
  → Hero rolls Armor (per wound, saving throw) → Apply wounds to Health
```

### After a Fight

Fight ends immediately when all enemies defeated. Each hero heals D3 (any mix of Wounds/Sanity).

### Stat Modifier Sign Conventions

For **enemy stats** (flat numbers — combat, initiative, health, move, damage, defense):
- Positive modifier = better for enemy (e.g., `combat: 1` means +1 Combat)
- `defense: 1` = +1 Defense = harder to wound
- `defense: -1` = -1 Defense = easier to wound

For **hero threshold stats** (Defense, Armor, Willpower, Spirit Armor — "X+" format):
- In `calculateStats.js` `applyDeltas`: positive delta = improvement (lower threshold)
- `+1` makes `5+` → `4+`

## Don'ts

- Don't add TypeScript — project is JS-only by design.
- Don't restructure `src/data/` — game content is organized by domain and referenced extensively.
- Don't remove localStorage fallbacks — they enable offline play.
- Don't remove sanitization logic — it prevents corrupt data in Firestore.
