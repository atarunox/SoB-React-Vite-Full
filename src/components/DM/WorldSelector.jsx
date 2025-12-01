// src/components/DM/WorldSelector.jsx
import React, { useMemo } from 'react';
import { WORLD_CARDS_BY_CAMPAIGN } from '../../data/worldCards';

// Legacy fallback list (still exported for any older imports)
export const WORLDS = [
  'Mines',
  'Targa Plateau',
  'Swamps of Jargono',
  'Derelict Ship',
  'Canyons',
  'Blasted Wastes',
  'Frontier Town',
];

// Optional mapping from campaign keys -> pretty labels (for future UI)
const CAMPAIGN_LABEL = {
  cityOfTheAncients: 'City of the Ancients',
  forbiddenFortress: 'Forbidden Fortress',
  adventures: 'Adventures',
};

/**
 * WorldSelector
 * Props:
 * - world: string (current selected world)
 * - setWorld: fn(newWorld) -> void
 * - onChange: optional side-effect callback
 * - className: string (styling)
 * - selectedCampaigns: string[] campaign keys to include (defaults to City of the Ancients)
 * - includeBaseWorlds: boolean (include "Mines" & "Frontier Town")
 */
export default function WorldSelector({
  world = 'Mines',
  setWorld = () => {},
  onChange = () => {},
  className = '',
  selectedCampaigns = ['cityOfTheAncients'],
  includeBaseWorlds = true,
}) {
  // Build a clean, deduped, sorted list of world names from selected campaigns
  const worlds = useMemo(() => {
    const names = new Set();

    // Optional base worlds
    if (includeBaseWorlds) {
      names.add('Mines');
      names.add('Frontier Town');
    }

    // Merge from selected campaigns
    for (const key of selectedCampaigns) {
      const cards = WORLD_CARDS_BY_CAMPAIGN[key] || [];
      for (const card of cards) {
        if (card?.name) names.add(card.name);
      }
    }

    // Fallback to legacy list if nothing selected
    if (names.size === 0) {
      WORLDS.forEach((n) => names.add(n));
    }

    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [selectedCampaigns, includeBaseWorlds]);

  const handleChange = (e) => {
    const newWorld = e.target.value;
    setWorld(newWorld);   // updates app state (DMTab)
    onChange(newWorld);   // optional: analytics, toasts, etc.
  };

  // Ensure current value is always in the list (so select stays controlled)
  const safeValue = worlds.includes(world) ? world : (worlds[0] || '');

  return (
    <div className={`p-4 border rounded bg-white shadow-md ${className}`}>
      <h2 className="text-xl font-bold mb-2">World Selector</h2>

      <select
        value={safeValue}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded"
      >
        {worlds.map((w) => (
          <option key={w} value={w}>
            {w}
          </option>
        ))}
      </select>

      <p className="mt-2 text-sm">
        Current World: <strong>{safeValue || '—'}</strong>
      </p>

      {/* (Optional) Debug helper: show selected campaigns
      <p className="mt-1 text-xs text-gray-500">
        From: {selectedCampaigns.map(k => CAMPAIGN_LABEL[k] || k).join(', ') || 'Default'}
      </p>
      */}
    </div>
  );
}
