import React, { useState, useMemo } from "react";
import { useCombatState } from "../../hooks/useCombatState";
import EnemyGroupCard from "./EnemyGroupCard";
import { ENEMY_CARDS } from "../../data/enemyCards";

// Transform enemy card data to combat format
function enemyToCombat(enemy, side = 'normal') {
  const stats = enemy.stats || {};
  const sideStats = side === 'brutal' && stats.brutal ? stats.brutal : (stats.normal || stats);

  return {
    name: enemy.name,
    count: 1,
    keywords: enemy.keywords || [],
    Size: enemy.Size || 'Medium',
    baseStats: {
      health: Number(sideStats.health) || 0,
      combat: sideStats.combat || 0,
      damage: Number(sideStats.damage) || 0,
      defense: String(sideStats.defense || '5+'),
      move: enemy.move || 0,
      initiative: Number(enemy.initiative) || 0,
      toHit: enemy.toHit || { melee: '4+', ranged: null },
      escape: enemy.escape || '4+',
      armor: '—',
    },
    abilities: enemy.abilities || [],
    eliteAbilities: side === 'brutal' && enemy.brutalEliteAbilities?.length
      ? enemy.brutalEliteAbilities
      : (enemy.eliteAbilities || []),
    xp: sideStats.xp || '0',
  };
}

// Enemy Picker Modal Component
function EnemyPickerModal({ onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const [selectedWorld, setSelectedWorld] = useState('all');

  const worlds = useMemo(() => {
    const set = new Set();
    Object.keys(ENEMY_CARDS).forEach(world => set.add(world));
    return ['all', ...Array.from(set).sort()];
  }, []);

  const filteredEnemies = useMemo(() => {
    const searchLower = search.toLowerCase();
    const result = [];

    Object.entries(ENEMY_CARDS).forEach(([world, enemies]) => {
      if (selectedWorld !== 'all' && world !== selectedWorld) return;

      (enemies || []).forEach(enemy => {
        const matchesSearch = !search ||
          enemy.name?.toLowerCase().includes(searchLower) ||
          enemy.keywords?.some(k => k.toLowerCase().includes(searchLower));

        if (matchesSearch) {
          result.push({ ...enemy, world });
        }
      });
    });

    return result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [search, selectedWorld]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">Add Enemy Group</h2>
            <button className="btn btn-sm btn-ghost" onClick={onClose}>✕</button>
          </div>

          <input
            type="text"
            placeholder="Search by name or keyword..."
            className="input input-bordered w-full mb-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />

          <select
            className="select select-bordered w-full"
            value={selectedWorld}
            onChange={(e) => setSelectedWorld(e.target.value)}
          >
            {worlds.map(w => (
              <option key={w} value={w}>
                {w === 'all' ? 'All Worlds' : w}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filteredEnemies.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No enemies found</div>
          ) : (
            <div className="space-y-2">
              {filteredEnemies.map((enemy, idx) => {
                const normalHealth = enemy.stats?.normal?.health || enemy.health || 0;
                const brutalHealth = enemy.stats?.brutal?.health || 0;

                return (
                  <div key={idx} className="border rounded p-3 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">{enemy.name}</div>
                        <div className="text-xs text-gray-600">
                          {enemy.world} • {enemy.keywords?.join(', ') || 'No keywords'}
                        </div>
                        <div className="flex gap-2 mt-1">
                          {normalHealth > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
                              Normal: {normalHealth}hp
                            </span>
                          )}
                          {brutalHealth > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700">
                              Brutal: {brutalHealth}hp
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {normalHealth > 0 && (
                          <button
                            className="btn btn-xs btn-success"
                            onClick={() => onSelect(enemy, 'normal')}
                          >
                            + Normal
                          </button>
                        )}
                        {brutalHealth > 0 && (
                          <button
                            className="btn btn-xs btn-error"
                            onClick={() => onSelect(enemy, 'brutal')}
                          >
                            + Brutal
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EnemyGroupsPanel({ posse = [], globalModifiers = [] }) {
  const {
    combatGroups,
    addGroup,
    removeGroup,
    clearCombat,
    darkness,
    growingDread,
    removeDarkness,
    removeGrowingDread,
  } = useCombatState();
  const [showPicker, setShowPicker] = useState(false);

  function handleSelectEnemy(enemy, side) {
    const combatEnemy = enemyToCombat(enemy, side);
    addGroup(combatEnemy);
    setShowPicker(false);
  }

  return (
    <div className="flex flex-col gap-4 p-2">
      {/* Darkness & Growing Dread at the top */}
      <div className="flex gap-2 flex-wrap mb-2">
        <div className="bg-black text-white px-2 py-1 rounded shadow flex items-center gap-2">
          <b>Darkness:</b>
          {darkness.length === 0 && <span className="text-gray-400">None</span>}
          {darkness.map((card, i) => (
            <span key={card.id || i} className="bg-gray-800 px-2 py-0.5 rounded flex items-center gap-1">
              {card.name}
              <button className="text-red-400 ml-1" onClick={() => removeDarkness(card.id || i)}>✕</button>
            </span>
          ))}
        </div>
        <div className="bg-purple-700 text-white px-2 py-1 rounded shadow flex items-center gap-2">
          <b>Growing Dread:</b>
          {growingDread.length === 0 && <span className="text-gray-200">None</span>}
          {growingDread.map((card, i) => (
            <span key={card.id || i} className="bg-purple-900 px-2 py-0.5 rounded flex items-center gap-1">
              {card.name}
              <button className="text-red-300 ml-1" onClick={() => removeGrowingDread(card.id || i)}>✕</button>
            </span>
          ))}
        </div>
      </div>

      {/* Enemy Group Cards */}
      <div className="flex flex-col gap-4">
        {combatGroups.map((group, idx) => (
          <div key={group.id} className="relative">
            <EnemyGroupCard
              group={group}
              groupIdx={idx}
              setCombatGroups={() => {}} // Not needed, using context
              allGroups={combatGroups}
              posse={posse}
              globalModifiers={globalModifiers}
            />
            <button
              className="absolute top-1 right-1 text-red-500 font-bold rounded px-1 bg-white bg-opacity-70"
              onClick={() => removeGroup(group.id)}
              title="Remove group"
              style={{ zIndex: 10 }}
            >✕</button>
          </div>
        ))}
        {combatGroups.length === 0 && (
          <div className="text-center text-gray-400 italic">No active enemy groups.</div>
        )}
      </div>

      {/* Floating Add/Clear Buttons */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-6 z-50 pointer-events-none">
        <button
          className="btn btn-success pointer-events-auto"
          style={{ borderRadius: 999, minWidth: 56, minHeight: 56, fontSize: 32 }}
          onClick={() => setShowPicker(true)}
        >＋</button>
        <button
          className="btn btn-error pointer-events-auto"
          style={{ borderRadius: 999, minWidth: 56, minHeight: 56, fontSize: 32 }}
          onClick={clearCombat}
        >🗑️</button>
      </div>

      {/* Enemy Picker Modal */}
      {showPicker && (
        <EnemyPickerModal
          onSelect={handleSelectEnemy}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
