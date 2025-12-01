// src/components/DM/LootPool.jsx
import React, { useState } from 'react';
import { useWorld } from '../../context/WorldContext';

import * as gearModule from '../../data/items/gearCards';
import * as mineArtifactsModule from '../../data/items/mineArtifacts';
import * as otherWorldArtifactsModule from '../../data/items/otherWorldArtifacts';

import {
  isOtherWorld,
  getGearDeckForWorld,
  getArtifactDeckForWorld,
  drawRandom,
} from '../../data/loot/selectors';

export default function DMLootPool() {
  const { world } = useWorld(); // "Mines" or an Other World name
  const [pool, setPool] = useState([]);

  const addToPool = (item) => setPool((prev) => [...prev, item]);

  const drawGear = () => {
    const deck = getGearDeckForWorld(world, gearModule);
    const card = drawRandom(deck);
    if (!card) {
      alert(`No Gear cards available for ${world || 'current world'}.`);
      return;
    }
    addToPool({ type: 'Gear', world, ...card });
  };

  const drawArtifact = () => {
    const deck = getArtifactDeckForWorld(world, mineArtifactsModule, otherWorldArtifactsModule);
    const card = drawRandom(deck);
    if (!card) {
      const target = isOtherWorld(world) ? world : 'Mines';
      alert(`No Artifact cards available for ${target}.`);
      return;
    }
    addToPool({ type: 'Artifact', world, ...card });
  };

  return (
    <div className="p-4 space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <button className="btn btn-primary" onClick={drawGear}>
          Draw Gear ({world || 'World ?'})
        </button>
        <button className="btn btn-secondary" onClick={drawArtifact}>
          Draw Artifact ({world || 'World ?'})
        </button>
      </div>

      <div className="mt-2">
        <h3 className="font-bold mb-2">Loot Pool</h3>
        {pool.length === 0 ? (
          <div className="text-sm opacity-70">No loot drawn yet.</div>
        ) : (
          <ul className="space-y-1">
            {pool.map((it, i) => (
              <li key={i} className="p-2 rounded border bg-white/70">
                <div className="text-xs opacity-70">
                  {it.type} • {it.world || 'Unknown world'}
                </div>
                <div className="font-semibold">{it.name || it.title || 'Unnamed Item'}</div>
                {it.effect && <div className="text-sm">{it.effect}</div>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
