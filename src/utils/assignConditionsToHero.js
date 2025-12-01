// // // import { doc, getDoc, updateDoc } // Removed Firestore for local mode; import { db } from './firebase'; import { injuryChart } from '../data/injuryChart'; import { madnessChart } from '../data/madnessChart'; import { mutationChart } from '../data/mutationChart';

const chartMap = { injury: injuryChart, madness: madnessChart, mutation: mutationChart, };

function getConditionFromChart(type, roll) { const chart = chartMap[type]; if (!chart) return null; return chart.find(entry => entry.roll === roll); }

export async function assignConditionToHero(heroId, type, roll) { const condition = getConditionFromChart(type, roll); if (!condition) throw new Error('Invalid condition type or roll');

const heroRef = doc(db, 'games', gameId, 'posse', heroId); const heroSnap = await getDoc(heroRef);

if (!heroSnap.exists()) throw new Error('Hero not found');

const heroData = heroSnap.data(); const updatedConditions = [...(heroData.conditions || []), { ...condition, type }];

await updateDoc(heroRef, { conditions: updatedConditions });
}


export default function Placeholder() { return null; }
