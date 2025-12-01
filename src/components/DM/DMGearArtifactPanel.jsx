
import React from 'react';

export default function DMGearArtifactPanel({ loot = [] }) {
  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-bold">Loot Pool</h2>
      {loot.length === 0 ? (
        <p className="italic">No loot available.</p>
      ) : (
        <ul className="list-disc list-inside">
          {loot.map((item, index) => (
            <li key={index}>{item.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
