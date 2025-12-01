import React from 'react';
import { HERO_CLASS_CARDS } from '../../data/heroClassCards';

export default function FactionSelector({ hero, updateHero }) {
  const { factions = [] } = HERO_CLASS_CARDS[hero.heroClass] || {};

  const selectFaction = (faction) => {
    updateHero({
      ...hero,
      selectedFaction: faction,
      awaitingFaction: false
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Choose Your Faction</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {factions.map(f => (
          <div
            key={f.id}
            className="border rounded-lg p-4 shadow hover:bg-green-100 cursor-pointer"
            onClick={() => selectFaction(f)}
          >
            <h3 className="font-semibold text-lg">{f.name}</h3>
            <p className="text-sm">{f.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
