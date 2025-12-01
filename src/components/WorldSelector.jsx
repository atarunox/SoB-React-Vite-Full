import React from 'react';
import { useWorld } from '../../context/WorldContext';

const WORLDS = [
  'Mines',
  'Targa Plateau',
  'Swamps of Jargono',
  'Derelict Ship',
  'Canyons',
  'Blasted Wastes',
  'Frontier Town',
];

export default function WorldSelector({ isDM }) {
  const { world, setWorld } = useWorld();

  if (!isDM) return null; // Only show to DM

  return (
    <div className="p-4 border rounded bg-white shadow-md">
      <h2 className="text-xl font-bold mb-2">World Selector</h2>
      <select
        value={world}
        onChange={(e) => setWorld(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded"
      >
        {WORLDS.map((w) => (
          <option key={w} value={w}>{w}</option>
        ))}
      </select>
    </div>
  );
}
