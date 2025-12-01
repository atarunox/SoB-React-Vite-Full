import React, { useState } from 'react';
import { usePosse } from '../context/PosseContext';
import CreateHero from './CreateHero'; // Your hero creation UI

export default function PossePanel() {
  const { posse, addHero, removeHero, activeHeroId, setActiveHeroId } = usePosse();
  const [creating, setCreating] = useState(false);

  return (
    <div className="bg-white rounded border p-2 mb-4">
      <h3 className="font-bold text-lg mb-2">Party (Posse)</h3>
      <div className="flex flex-wrap gap-2">
        {posse.map(h => (
          <button
            key={h.id}
            className={`btn btn-xs ${activeHeroId === h.id ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveHeroId(h.id)}
          >
            {h.name}
            <span
              className="ml-2 text-xs text-red-400 cursor-pointer"
              onClick={e => { e.stopPropagation(); removeHero(h.id); }}
              title="Remove Hero"
            >✕</span>
          </button>
        ))}
        <button className="btn btn-xs btn-success" onClick={() => setCreating(true)}>
          + Add Hero
        </button>
      </div>
      {creating && (
        <CreateHero
          onCreate={hero => { addHero(hero); setCreating(false); }}
          onCancel={() => setCreating(false)}
        />
      )}
    </div>
  );
}
