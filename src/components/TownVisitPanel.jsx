
const ALL_SHOPS = [ 'Blacksmith', 'General Store', 'Saloon', 'Doc's Office', 'Indian Trading Post', 'Church', 'Gambling Hall', 'Street Market', 'Mutant Quarters', 'Camp Site' ];

const CAMPSITE_ONLY = ['Camp Site']; const CAMP_EVENT_CHART = [ "Strange dreams haunt your sleep – Start next day with -1 Initiative.", "Wild animals raid the camp – Lose 1 Grit.", "Unsettling noises all night – Gain 1 Corruption Hit.", "Infected bug bite – Start next day with D3 Wounds.", "Bitter cold – Cannot recover Grit during the next day.", "Peaceful night under the stars – Gain 10 XP." ];

function TownVisitPanel() { const [heroes, setHeroes] = useState([]); const [assignments, setAssignments] = useState({}); const [results, setResults] = useState({}); const [lodging, setLodging] = useState({}); const [dailyEvent, setDailyEvent] = useState(null); const [campResults, setCampResults] = useState({}); const [phase, setPhase] = useState('day'); const [availableShops, setAvailableShops] = useState(ALL_SHOPS);


const assignHero = (heroId, shop) => { setAssignments(prev => { const next = { ...prev }; for (const key in next) { next[key] = next[key].filter(id => id !== heroId); } if (!next[shop]) next[shop] = []; next[shop].push(heroId); return next; }); };

const rollEventForShop = (shop) => { const card = TOWN_EVENT_CARDS[Math.floor(Math.random() * TOWN_EVENT_CARDS.length)]; setResults(prev => ({ ...prev, [shop]: card })); };

const endDay = () => { setAssignments({}); setResults({}); setLodging({}); setDailyEvent(null); setCampResults({}); setPhase('night'); };

const allChosenLodging = heroes.every(h => lodging[h.id]);

const drawDailyEvent = async () => { const card = TOWN_EVENT_CARDS[Math.floor(Math.random() * TOWN_EVENT_CARDS.length)]; setDailyEvent(card);

for (const h of heroes) {
  let updates = {};
  if (lodging[h.id] === 'Hotel') {
    updates.gold = Math.max(0, h.gold - 10);
  }
  const extraMarkers = (h.mutations?.length || 0) > 3 ? (h.mutations.length - 3) : 0;
  if (extraMarkers > 0) {
    updates.unwantedAttention = (h.unwantedAttention || 0) + extraMarkers;
  }
  if (Object.keys(updates).length) {
  }
}

const newResults = {};
heroes.forEach(h => {
  if (lodging[h.id] === 'Camp') {
    const roll = Math.floor(Math.random() * 6) + 1;
    newResults[h.id] = CAMP_EVENT_CHART[roll - 1];
  }
});
setCampResults(newResults);

};


return ( <div className="p-4 space-y-4"> <h2 className="text-xl font-bold">Town Visit Manager</h2>

<div className="grid grid-cols-2 gap-4">
    {heroes.map(h => (
      <div key={h.id} className="border p-2 rounded bg-white">
        <strong>{h.name}</strong>
        <p className="text-xs">Unwanted Attention: {h.unwantedAttention || 0}</p>
        <button className="btn btn-xs btn-warning mt-1" onClick={() => addGamblingMarker(h.id)}>
          +1 Marker (Gambling)
        </button>
      </div>
    ))}
  </div>

  {phase === 'night' && dailyEvent && Object.keys(campResults).length > 0 && (
    <div className="bg-green-100 p-3 rounded">
      <h4 className="font-bold">Camp Events</h4>
      <ul className="list-disc list-inside text-sm">
        {Object.entries(campResults).map(([id, text]) => {
          const h = heroes.find(x => x.id === id);
          return <li key={id}><strong>{h?.name}</strong>: {text}</li>;
        })}
      </ul>
    </div>
  )}
</div>

); }

export default TownVisitPanel;

