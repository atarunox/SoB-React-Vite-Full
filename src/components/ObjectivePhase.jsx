import React from 'react';
import { useCombatState } from '../hooks/useCombatState';
import { useWorld } from '../context/WorldContext';
import { getWorldDecks } from '../data/worldDecks';

export default function ObjectivePhase() {
  const { world } = useWorld();
  const { growingDread } = getWorldDecks(world);
  const { growingDreadQueue, clearGrowingDreadQueue, addGrowingDread } = useCombatState();
  const onRevealAll = () => {
    growingDreadQueue.forEach(() => {
      const card = growingDread[Math.floor(Math.random()*growingDread.length)];
      addGrowingDread(card);
    });
    clearGrowingDreadQueue();
  };
  return (
    <div className="p-4 border rounded space-y-2">
      <h3 className="font-semibold">Objective Fight</h3>
      <p className="text-sm opacity-80">Reveal ALL queued Growing Dread now.</p>
      <button className="border rounded px-2 py-1" onClick={onRevealAll}>Reveal All Growing Dread</button>
      <div className="text-sm opacity-70">Queued: {growingDreadQueue.length}</div>
    </div>
  );
}
