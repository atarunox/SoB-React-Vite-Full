import React, { useState } from 'react';
import { travelHazardChart } from '../../data/charts/travelHazardChart';
import { townTraitsChart } from '../../data/charts/townTraitsChart';
import TownVisitPanel from './TownVisitPanel';
import TownStayManager from './TownStayManager';

export default function TownPhaseTab({ posse = [], updateHero, world = 'Frontier Town' }) {
  const [hazardRolled, setHazardRolled] = useState(null);
  const [traitRolled, setTraitRolled] = useState(null);

  const rollHazard = () => {
    const idx = Math.floor(Math.random() * travelHazardChart.length);
    setHazardRolled(travelHazardChart[idx]);
  };
  const rollTrait = () => {
    const idx = Math.floor(Math.random() * townTraitsChart.length);
    setTraitRolled(townTraitsChart[idx]);
  };

  return (
    <div className="p-4 bg-white rounded shadow space-y-4">
      <h2 className="text-xl font-bold">Town Phase</h2>

      {/* Travel Hazard / Town Trait rolls */}
      <div className="flex gap-2 flex-wrap">
        <button className="btn btn-primary" onClick={rollHazard}>Roll Travel Hazard</button>
        <button className="btn btn-secondary" onClick={rollTrait}>Roll Town Trait</button>
      </div>
      {hazardRolled && (
        <div className="mt-2 p-2 bg-yellow-50 border rounded">
          <strong>Travel Hazard:</strong> {hazardRolled.name} — <span className="italic">{hazardRolled.effect}</span>
        </div>
      )}
      {traitRolled && (
        <div className="mt-2 p-2 bg-blue-50 border rounded">
          <strong>Town Trait:</strong> {traitRolled.name} — <span className="italic">{traitRolled.effect}</span>
        </div>
      )}

      {/* Town Stay Manager (day counter, darkness, debug mode) */}
      <TownStayManager posse={posse} updateHero={updateHero} />

      {/* Hero visit assignment */}
      <TownVisitPanel posse={posse} world={world} />
    </div>
  );
}
