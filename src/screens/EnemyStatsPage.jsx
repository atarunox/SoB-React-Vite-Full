// components/DM/EnemyStatsPage.jsx

import React, { useEffect, useState } from 'react';
// // // import { collection, onSnapshot } // Removed Firestore for local mode;
// import { db } // Removed Firebase for local mode;
// import { loadModifiersFromFirestore, getActiveModifiers } from '../../utils/dynamicModifiers';
// import { applyEnemyModifiers } from '../../utils/enemyModifierUtils';
// 
// export default function EnemyStatsPage() {
//   const [combatGroups, setCombatGroups] = useState([]);
//   const [modifiers, setModifiers] = useState({});
//   const [expansionFilter, setExpansionFilter] = useState('All');
//   const [brutal, setBrutal] = useState(false);
// 
//   useEffect(() => {
//     const unsub = onSnapshot(collection(db, 'combatGroups'), (snap) => {
//       const groups = [];
//       snap.forEach(doc => groups.push({ id: doc.id, ...doc.data() }));
//       setCombatGroups(groups);
//     });
//     return () => unsub();
//   }, []);
// 
//   useEffect(() => {
//     loadModifiersFromFirestore().then(() => {
//       setModifiers(getActiveModifiers());
//     });
//   }, []);
// 
//   const filteredGroups = combatGroups.filter(group =>
//     expansionFilter === 'All' || group.set === expansionFilter
//   );
// 
//   return (
//     <div className="p-4 max-w-5xl mx-auto bg-parchment min-h-screen text-black">
//       <div className="flex justify-between items-center mb-4">
//         <button onClick={() => window.location.href = '/'} className="btn btn-outline">
//           ← Back to DM Panel
//         </button>
//         <div className="flex items-center gap-4">
//           <select
//             className="btn btn-sm"
//             value={expansionFilter}
//             onChange={(e) => setExpansionFilter(e.target.value)}
//           >
//             <option value="All">All Expansions</option>
//             <option value="City of the Ancients">City of the Ancients</option>
//             <option value="Swamps of Jargono">Swamps of Jargono</option>
//             <option value="Forbidden Fortress">Forbidden Fortress</option>
//             <option value="Other">Other</option>
//           </select>
//           <label className="flex items-center gap-2">
//             <input type="checkbox" checked={brutal} onChange={() => setBrutal(!brutal)} /> Brutal Mode
//           </label>
//         </div>
//       </div>
// 
//       <h1 className="text-2xl font-bold mb-4 text-center">Active Enemy Stats</h1>
// 
//       {filteredGroups.length === 0 ? (
//         <p className="italic text-center">No active enemies.</p>
//       ) : (
//         filteredGroups.map((group, index) => {
//           const variant = brutal ? 'brutal' : 'normal';
//           const enemy = {
//             ...group,
//             ...group.stats?.[variant],
//             toHit: group.toHit || {},
//           };
//           const adjusted = applyEnemyModifiers(enemy, modifiers);
// 
//           return (
//             <div key={index} className="mb-4 border rounded p-3 bg-white/10 shadow">
//               <h2 className="text-lg font-semibold">{group.amount}x {group.name}</h2>
//               <p className="text-sm italic mb-2">Keywords: {adjusted.keywords?.join(', ')}</p>
//               {adjusted.modSummary?.length > 0 && (
//                 <p className="text-blue-600 text-sm">Modifiers: {adjusted.modSummary.join(', ')}</p>
//               )}
//               {group.traits?.length > 0 && (
//                 <p className="text-purple-600 text-sm">Traits: {group.traits.join(', ')}</p>
//               )}
//               {group.eliteAbilities?.length > 0 && (
//                 <p className="text-red-600 text-sm">Elite Abilities: {group.eliteAbilities.join(', ')}</p>
//               )}
// 
//               <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 text-sm">
//                 <p><strong>Health:</strong> {adjusted.health ?? '—'}</p>
//                 <p><strong>Combat:</strong> {adjusted.combat ?? '—'}</p>
//                 <p><strong>Damage:</strong> {adjusted.damage ?? '—'}</p>
//                 <p><strong>Initiative:</strong> {adjusted.initiative ?? '—'}</p>
//                 <p><strong>Defense:</strong> {adjusted.defense ?? '—'}</p>
//                 <p><strong>Willpower:</strong> {adjusted.willpower ?? '—'}</p>
//                 <p><strong>Melee:</strong> {adjusted.toHit?.melee ?? '—'}</p>
//                 <p><strong>Ranged:</strong> {adjusted.toHit?.ranged ?? '—'}</p>
//                 <p><strong>Escape:</strong> {adjusted.escape ?? '—'}</p>
//                 <p><strong>Size:</strong> {adjusted.Size ?? '—'}</p>
//               </div>
//             </div>
//           );
//         })
//       )}
//     </div>
//   );
// }
