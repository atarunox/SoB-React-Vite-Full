import React from 'react';
import LootPoolPanel from './LootPoolPanel';
import { useLootPool } from '../hooks/useLootPool';

export default function LootTab({ currentHero }) {
  const gameId = 'brimstone-session-001'; // Replace with dynamic game/session ID
  const { lootPool, claimLoot } = useLootPool(gameId);

  return (
    <div className="p-4 bg-parchment min-h-screen space-y-4">
      <h2 className="text-2xl font-bold text-center">Loot Tab</h2>
      <LootPoolPanel
        lootPool={lootPool}
        currentHeroName={currentHero?.name || 'Unknown Hero'}
        onClaim={claimLoot}
      />
    </div>
  );
}
