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

## Don'ts

- Don't add TypeScript — project is JS-only by design.
- Don't restructure `src/data/` — game content is organized by domain and referenced extensively.
- Don't remove localStorage fallbacks — they enable offline play.
- Don't remove sanitization logic — it prevents corrupt data in Firestore.
