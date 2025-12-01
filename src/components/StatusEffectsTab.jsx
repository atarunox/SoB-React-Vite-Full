import React from 'react';
import { calculateCurrentStats } from '../utils/calculateStats';
import MutationsInjuriesMadness from './MutationsInjuriesMadness';
import CorruptionTracker from './CorruptionTracker';

const StatusEffectsTab = ({ hero, updateHero }) => {
  if (!hero) return <p>No hero selected.</p>;

  const { stats = {}, breakdown = { base: {}, gear: {}, skills: {}, conditions: {} } } = calculateCurrentStats(hero);

  const keys = [
    'Health', 'Sanity', 'Grit',
    'Agility', 'Cunning', 'Spirit',
    'Strength', 'Lore', 'Luck',
    'Initiative', 'Armor', 'Defense', 'Spirit Armor'
  ];

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold">Status Effects</h2>

      <CorruptionTracker hero={hero} updateHero={updateHero} />
      <MutationsInjuriesMadness hero={hero} updateHero={updateHero} />

      <div className="space-y-4 bg-yellow-50 rounded shadow p-4">
        <h3 className="text-lg font-semibold text-center">Stat Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-sm border">
            <thead>
              <tr className="bg-yellow-200">
                <th className="border px-2 py-1">Stat</th>
                <th className="border px-2 py-1">Base</th>
                <th className="border px-2 py-1">Gear</th>
                <th className="border px-2 py-1">Skills</th>
                <th className="border px-2 py-1">Conditions</th>
                <th className="border px-2 py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((stat) => (
                <tr key={stat} className="odd:bg-white even:bg-gray-100">
                  <td className="border px-2 py-1 font-semibold">{stat}</td>
                  <td className="border px-2 py-1 text-center">{breakdown.base?.[stat] ?? '—'}</td>
                  <td className="border px-2 py-1 text-center">{breakdown.gear?.[stat] ?? '—'}</td>
                  <td className="border px-2 py-1 text-center">{breakdown.skills?.[stat] ?? '—'}</td>
                  <td className="border px-2 py-1 text-center">{breakdown.conditions?.[stat] ?? '—'}</td>
                  <td className="border px-2 py-1 text-center font-bold">{stats?.[stat] ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatusEffectsTab;
