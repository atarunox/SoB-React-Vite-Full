import React, { useState } from 'react';
import { travelHazardChart } from '../../data/charts/travelHazardChart';
import { townTraitsChart } from './charts/townTraitsChart';
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
    const d1 = Math.ceil(Math.random() * 6);
    const d2 = Math.ceil(Math.random() * 6);
    const roll = d1 * 10 + d2;
    const result = townTraitsChart.find(e => e.roll === roll) || townTraitsChart[0];
    setTraitRolled({ ...result, rolledValue: roll });
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
        <div className="mt-2 p-3 bg-blue-50 border border-blue-300 rounded-lg space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-blue-200 text-blue-900 px-2 py-0.5 rounded">{traitRolled.rolledValue}</span>
            <strong className="text-blue-900">{traitRolled.name}</strong>
          </div>
          {traitRolled.flavor && <p className="text-sm italic text-blue-700">{traitRolled.flavor}</p>}
          <p className="text-sm text-blue-900">{traitRolled.effect}</p>
          {traitRolled.restrictions?.length > 0 && (
            <p className="text-xs text-amber-700 italic">{traitRolled.restrictions.join(' · ')}</p>
          )}
        </div>
      )}

      {/* Town Stay Manager (day counter, darkness, debug mode) */}
      <TownStayManager posse={posse} updateHero={updateHero} />

      {/* Hero visit assignment */}
      <TownVisitPanel posse={posse} world={world} />
    </div>
  );
}
