import React, { useState } from 'react';
import ALL_MISSIONS from '../../data/missions/index';
import { useActiveMission } from '../../hooks/useActiveMission';

function MissionDetail({ mission, isActive, onSelect, onClear }) {
  return (
    <div className={`rounded-lg border-2 p-4 space-y-3 ${isActive ? 'border-amber-500 bg-amber-50/80' : 'border-[#8b6b46]/30 bg-white/80'}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-bold text-[#3b2f1d] text-base">{mission.name}</div>
          <div className="text-xs text-gray-500">{mission.pack} · Mission {mission.missionNumber}</div>
        </div>
        {isActive ? (
          <button
            onClick={onClear}
            className="shrink-0 px-2 py-1 text-xs rounded border border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
          >
            Clear
          </button>
        ) : (
          <button
            onClick={() => onSelect(mission.id)}
            className="shrink-0 px-2 py-1 text-xs rounded border border-amber-400 text-amber-800 bg-amber-50 hover:bg-amber-100 font-semibold"
          >
            Select
          </button>
        )}
      </div>

      {isActive && (
        <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-200 rounded-full px-2 py-0.5">
          ★ Active Mission
        </div>
      )}

      {/* Description */}
      <div>
        <div className="text-xs font-semibold text-[#5c3a1e] uppercase tracking-wide mb-1">Description</div>
        <p className="text-xs text-[#3b2f1d]/80 italic leading-snug">{mission.description}</p>
      </div>

      {/* Setup / Hero Scaling */}
      {mission.setup && (
        <div>
          <div className="text-xs font-semibold text-[#5c3a1e] uppercase tracking-wide mb-1">Setup</div>
          <p className="text-xs text-[#3b2f1d]/80 leading-snug">{mission.setup}</p>
        </div>
      )}
      {mission.heroScaling?.length > 0 && (
        <table className="text-xs w-full border-collapse">
          <tbody>
            {mission.heroScaling.map(row => (
              <tr key={row.heroes} className="border-t border-[#8b6b46]/20 first:border-0">
                <td className="pr-2 py-0.5 font-semibold text-[#5c3a1e] w-12">{row.heroes}</td>
                <td className="py-0.5 text-[#3b2f1d]/80">{row.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Special Rules */}
      {mission.specialRules?.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-[#5c3a1e] uppercase tracking-wide mb-1">Special Rules</div>
          <ul className="space-y-1">
            {mission.specialRules.map(rule => (
              <li key={rule.name} className="text-xs leading-snug">
                <span className="font-semibold text-[#3b2f1d]">{rule.name}</span>
                <span className="text-[#3b2f1d]/70"> — {rule.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Objectives */}
      {mission.objectives?.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-[#5c3a1e] uppercase tracking-wide mb-1">Goal</div>
          <ul className="list-disc list-inside space-y-0.5">
            {mission.objectives.map((obj, i) => (
              <li key={i} className="text-xs text-[#3b2f1d]/80 leading-snug">{obj}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Reward */}
      {mission.reward && (
        <div className="rounded bg-green-50 border border-green-200 p-2">
          <div className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-0.5">Reward</div>
          <p className="text-xs text-green-900 leading-snug">{mission.reward}</p>
        </div>
      )}

      {/* Failure */}
      {mission.failure && (
        <div className="rounded bg-red-50 border border-red-200 p-2">
          <div className="text-xs font-semibold text-red-800 uppercase tracking-wide mb-0.5">Failure</div>
          <p className="text-xs text-red-900 leading-snug">{mission.failure}</p>
        </div>
      )}
    </div>
  );
}

export default function DMMissionsPanel() {
  const { activeMissionId, setMission, clearMission } = useActiveMission();
  const [expanded, setExpanded] = useState(activeMissionId);

  // Group missions by pack
  const byPack = ALL_MISSIONS.reduce((acc, m) => {
    const key = m.pack || 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-[#3b2f1d]">Missions</h3>
        <span className="text-xs text-gray-500">{ALL_MISSIONS.length} mission{ALL_MISSIONS.length !== 1 ? 's' : ''}</span>
      </div>

      {activeMissionId && (
        <div className="p-2 rounded bg-amber-100 border border-amber-400 text-xs text-amber-900 font-medium">
          Active: {ALL_MISSIONS.find(m => m.id === activeMissionId)?.name ?? activeMissionId}
        </div>
      )}

      {Object.entries(byPack).map(([packName, missions]) => (
        <div key={packName} className="space-y-2">
          <div className="text-xs font-bold text-[#5c3a1e] uppercase tracking-wide border-b border-[#8b6b46]/30 pb-1">
            {packName}
          </div>
          {missions.map(mission => (
            <div key={mission.id}>
              {/* Collapsed row */}
              {expanded !== mission.id ? (
                <button
                  className={`w-full text-left rounded-lg border px-3 py-2 flex items-center justify-between gap-2 transition-colors ${
                    activeMissionId === mission.id
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-[#8b6b46]/30 bg-white/80 hover:bg-[#f5ebd8]'
                  }`}
                  onClick={() => setExpanded(mission.id)}
                >
                  <div>
                    <span className="font-semibold text-sm text-[#3b2f1d]">{mission.name}</span>
                    {activeMissionId === mission.id && (
                      <span className="ml-2 text-xs text-amber-700 font-bold">★ Active</span>
                    )}
                    <div className="text-xs text-gray-500">Mission {mission.missionNumber}</div>
                  </div>
                  <span className="text-[#8b6b46] text-xs">▼</span>
                </button>
              ) : (
                <div>
                  <button
                    className="w-full text-left text-xs text-[#8b6b46] mb-1 flex items-center gap-1"
                    onClick={() => setExpanded(null)}
                  >
                    <span>▲</span> <span>Collapse</span>
                  </button>
                  <MissionDetail
                    mission={mission}
                    isActive={activeMissionId === mission.id}
                    onSelect={setMission}
                    onClear={clearMission}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {ALL_MISSIONS.length === 0 && (
        <p className="text-sm text-gray-500 italic">No missions loaded yet.</p>
      )}
    </div>
  );
}
