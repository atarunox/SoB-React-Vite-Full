// src/hooks/useLootPool.jsx
// This hook is currently disabled — Firebase imports were removed for local mode.
// The hook and its consumers (LootTab, LootPoolPanel) are not used in the app.

export function useLootPool(/* gameId */) {
  return { lootPool: [], claimLoot: () => {} };
}

export default function Placeholder() { return null; }
