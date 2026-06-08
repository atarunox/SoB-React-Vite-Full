import React, { useState } from 'react';
import { travelHazardChart } from '../../data/charts/travelHazardChart';
import { wastelandTravelHazardChart } from './charts/wastelandTravelHazardChart';
import { townTraitsChart } from './charts/townTraitsChart';

const WASTELAND_WORLDS = new Set(['Blasted Wastes', 'The Canyons']);
import TownVisitPanel from './TownVisitPanel';
import TownStayManager from './TownStayManager';

export default function TownPhaseTab({ posse = [], updateHero, world = 'Frontier Town' }) {
  const [hazardRolled, setHazardRolled] = useState(null);
  const [traitRolled, setTraitRolled] = useState(null);

  const hazardChart = WASTELAND_WORLDS.has(world) ? wastelandTravelHazardChart : travelHazardChart;

  const rollHazard = () => {
    if (WASTELAND_WORLDS.has(world)) {
      // D36: roll two dice (tens 1–6, ones 1–6)
      const tens = Math.ceil(Math.random() * 6);
      const ones = Math.ceil(Math.random() * 6);
      const roll = tens * 10 + ones;
      const result = wastelandTravelHazardChart.find(e => e.roll === roll);
      setHazardRolled(result ? { ...result, rolledValue: roll } : null);
    } else {
      const idx = Math.floor(Math.random() * hazardChart.length);
      setHazardRolled(hazardChart[idx]);
    }
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
        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-300 rounded-lg space-y-1">
          <div className="flex items-center gap-2">
            {hazardRolled.rolledValue && (
              <span className="text-xs font-mono bg-yellow-200 text-yellow-900 px-2 py-0.5 rounded">{hazardRolled.rolledValue}</span>
            )}
            <strong className="text-yellow-900">{hazardRolled.name}</strong>
          </div>
          {hazardRolled.flavor && <p className="text-sm italic text-yellow-700">{hazardRolled.flavor}</p>}
          <p className="text-sm text-yellow-900 whitespace-pre-wrap">{hazardRolled.effect}</p>
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
