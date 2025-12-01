import React, { useEffect, useState } from 'react';
import { getActiveModifiers } from './dynamicModifiers'; // local-only

export default function EnemyDrawer({ enemy }) {
  const [displayEnemy, setDisplayEnemy] = useState({ ...enemy });

  useEffect(() => {
    const applyModifiers = () => {
      const { keywords: globalKeywords, enemyModifiers } = getActiveModifiers();

      const baseStats = enemy.stats?.brutal || enemy.stats?.normal || {};
      const flattened = {
        ...enemy,
        ...baseStats,
      };

      const modified = {
        ...flattened,
        keywords: [...(flattened.keywords || [])],
        modSummary: [],
      };

      globalKeywords.forEach(k => {
        if (!modified.keywords.includes(k)) {
          modified.keywords.push(k);
        }
      });

      modified.keywords.forEach(k => {
        const mods = enemyModifiers[k];
        if (mods) {
          for (const [stat, mod] of Object.entries(mods)) {
            if (typeof modified[stat] === 'number') {
              modified[stat] += mod;
              modified.modSummary.push(`+${mod} ${stat} (${k})`);
            } else if (typeof modified[stat] === 'string' && /\d+\+/.test(modified[stat])) {
              const parsed = parseInt(modified[stat]);
              if (!isNaN(parsed)) {
                const newVal = Math.max(2, parsed - mod);
                modified[stat] = `${newVal}+`;
                modified.modSummary.push(`${mod > 0 ? '-' : '+'}${Math.abs(mod)} ${stat} (${k})`);
              }
            }
          }
        }
      });

      setDisplayEnemy(modified);
    };

    applyModifiers();
  }, [enemy]);

  return (
    <div className="p-3 border rounded bg-white shadow space-y-2">
      <h3 className="text-lg font-bold">{displayEnemy.name}</h3>

      <div className="text-sm text-gray-700 space-y-1">
        <p><strong>Keywords:</strong> {displayEnemy.keywords?.join(', ') || 'None'}</p>

        {displayEnemy.modSummary?.length > 0 && (
          <p className="text-blue-600">
            <strong>Modifiers:</strong> {displayEnemy.modSummary.join(', ')}
          </p>
        )}

        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
          <p><strong>Health:</strong> {displayEnemy.health ?? '—'}</p>
          <p><strong>Defense:</strong> {displayEnemy.defense ?? '—'}</p>
          <p><strong>Armor:</strong> {displayEnemy.armor ?? '—'}</p>
          <p><strong>Willpower:</strong> {displayEnemy.willpower ?? '—'}</p>

          <p><strong>Melee To-Hit:</strong> {displayEnemy.melee?.toHit || '—'}</p>
          <p><strong>Melee Damage:</strong> {displayEnemy.melee?.damage || '—'}</p>
          <p><strong>Ranged To-Hit:</strong> {displayEnemy.ranged?.toHit || '—'}</p>
          <p><strong>Ranged Damage:</strong> {displayEnemy.ranged?.damage || '—'}</p>

          <p><strong>Initiative:</strong> {displayEnemy.initiative ?? '—'}</p>
          <p><strong>Move:</strong> {displayEnemy.move ?? '—'}</p>
          <p><strong>Escape:</strong> {displayEnemy.escape ?? '—'}</p>
          <p><strong>XP:</strong> {displayEnemy.xp ?? '—'}</p>
          <p><strong>Size:</strong> {displayEnemy.Size ?? '—'}</p>
        </div>

        {displayEnemy.abilities && (
          <div>
            <strong>Abilities:</strong>
            <ul className="list-disc ml-5">
              {displayEnemy.abilities.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        )}

        {displayEnemy.eliteChart && (
          <details className="mt-2">
            <summary className="font-semibold">Elite Chart</summary>
            <ul className="list-disc ml-5">
              {displayEnemy.eliteChart.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}
