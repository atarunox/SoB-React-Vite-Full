
import React, { useEffect, useState } from 'react';
import { getWorldFolder } from '../../utils/worldLoader';
import { useWorld } from '../../context/WorldContext';

export default function DMDepthDrawer() {
  const { world } = useWorld();
  const [depths, setDepths] = useState([]);

  useEffect(() => {
    async function loadDepths() {
      try {
        const path = getWorldFolder(world);
        const data = await import(`${path}/depthEvents/depthEvents.js`);
        setDepths(data.default || []);
      } catch (err) {
        console.error('Error loading depth events for', world, err);
      }
    }
    loadDepths();
  }, [world]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Depth Events - {world}</h2>
      <ul className="space-y-2">
        {depths.map((event, i) => (
          <li key={i} className="border p-2 bg-white rounded shadow">
            <strong>{event.name}</strong><br />
            {event.effect}
          </li>
        ))}
      </ul>
    </div>
  );
}
