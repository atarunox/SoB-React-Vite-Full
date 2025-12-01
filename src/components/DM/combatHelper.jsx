import React, { useState, useEffect } from 'react';
import { getActiveModifiers } from './dynamicModifiers'; // must be local-mode only

export default function CombatHelper({ enemies = [] }) {
  const [modifiers, setModifiers] = useState(getActiveModifiers());

  useEffect(() => {
    setModifiers(getActiveModifiers()); // Re-check on mount, no Firestore
  }, []);

  const getAdjustedStats = (enemy) => {
    const modified = { ...enemy };

    (enemy.keywords || []).forEach(k => {
      const keywordMods = modifiers.enemyModifiers?.[k];
      if (keywordMods) {
//         Object.entries(keywordMods).forEach(([stat, value]) => {
          if (typeof modified[stat] === 'number') {
            modified[stat] += value;
          } else if (typeof modified[stat] === 'string' && /\d+\+/.test(modified[stat])) {
            const parsed = parseInt(modified[stat]);
            if (!isNaN(parsed)) {
              const newVal = Math.max(2, parsed - value);
              modified[stat] = `${newVal}+`;
            }
          }
        });
      }
    });

    return modified;
  };

  return (
    <div className="p-4 space-y-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-bold">Combat Helper</h2>
      {enemies.map((enemy, idx) => {
        const mod = getAdjustedStats(enemy);
        return (
          <div key={idx} className="border p-3 rounded bg-gray-100">
            <h3 className="font-bold">{mod.name}</h3>
            {mod.combat !== undefined && <p><strong>Combat:</strong> {mod.combat}</p>}
            {mod.initiative !== undefined && <p><strong>Initiative:</strong> {mod.initiative}</p>}
            <p><strong>Keywords:</strong> {(mod.keywords || []).join(', ')}</p>
          </div>
        );
      })}
    </div>
  );
}
