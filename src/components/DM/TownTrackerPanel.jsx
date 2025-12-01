import React, { useEffect, useState } from 'react';
import { loadTownState } from '../../utils/townState';

export default function TownTrackerPanel() {
  const [state, setState] = useState(loadTownState());

  // Optionally poll or use a button to refresh local state
  useEffect(() => {
    const interval = setInterval(() => setState(loadTownState()), 2000);
    return () => clearInterval(interval);
  }, []);

  const { heroes, locationEvents } = state;

  return (
    <div className="p-4">
      <h2 className="font-bold text-xl mb-2">Town Tracker</h2>
      <table className="table-auto w-full mb-4">
        <thead>
          <tr>
            <th>Hero</th>
            <th>Lodging</th>
            <th>Location</th>
            <th>Done?</th>
          </tr>
        </thead>
        <tbody>
          {heroes.map(hero => (
            <tr key={hero.id}>
              <td>{hero.name}</td>
              <td>{hero.lodging}</td>
              <td>{hero.chosenLocation || <span className="text-gray-400">—</span>}</td>
              <td>{hero.isDone ? "✅" : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 className="font-bold mt-4">Location Events</h3>
      <ul>
        {Object.entries(locationEvents).map(([loc, event]) => (
          <li key={loc}><strong>{loc}:</strong> {event.event} (Roll: {event.roll})</li>
        ))}
      </ul>
    </div>
  );
}
