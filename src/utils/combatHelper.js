import React, { useEffect, useState } from 'react';
// import { getActiveModifiers, loadModifiersFromFirestore } from './dynamicModifiers';
// 
// export default function CombatHelper({ enemies }) {
//   const [modifiers, setModifiers] = useState(getActiveModifiers());
// 
//   useEffect(() => {
//     loadModifiersFromFirestore().then(() => {
//       setModifiers(getActiveModifiers());
//     });
//   }, []);
// 
//   const getAdjustedStats = (enemy) => {
//     let modified = { ...enemy };
//     const globalMods = modifiers?.enemyModifiers || {};
//     const allKeywords = [...(enemy.keywords || []), '__ALL__'];
// 
//     allKeywords.forEach((keyword) => {
//       const keywordMods = globalMods[keyword];
//       if (keywordMods) {
//         for (const [stat, value] of Object.entries(keywordMods)) {
//           modified[stat] = (modified[stat] || 0) + value;
//         }
      }
    });

    if (enemy.modifiers) {
      for (const [stat, value] of Object.entries(enemy.modifiers)) {
        modified[stat] = (modified[stat] || 0) + value;
      }
    }

    return modified;
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Combat Helper</h2>
      {enemies.map((e, idx) => {
        const mod = getAdjustedStats(e);
        return (
          <div key={idx} className="border p-2 my-2 rounded bg-white/10 shadow">
            <h3 className="font-semibold">{mod.name} ({e.amount}x)</h3>
            <p>Combat: {mod.combat || '—'}</p>
            <p>Initiative: {mod.initiative || '—'}</p>
            <p>Defense: {mod.defense || '—'}</p>
            <p>Health: {mod.health || '—'}</p>
            <p>Keywords: {mod.keywords?.join(', ') || '—'}</p>
            {e.traits?.length > 0 && (
              <p className="text-purple-600">Traits: {e.traits.join(', ')}</p>
            )}
            {e.eliteAbilities?.length > 0 && (
              <p className="text-red-600">Elite: {e.eliteAbilities.join(', ')}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
