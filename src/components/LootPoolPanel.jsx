import React from 'react';

export default function LootPoolPanel({ lootPool, currentHeroName, onClaim }) {
  return (
    <div>
      {lootPool.length === 0 ? (
        <p className="italic text-center">No loot available.</p>
      ) : (
        lootPool.map((item) => (
          <div key={item.id} className="border p-2 m-2 rounded bg-white">
            <p><strong>{item.name}</strong></p>
            <p className="text-sm italic">{item.effect || item.effects?.join(', ')}</p>
            {item.claimedBy ? (
              <p className="text-green-700 text-sm">Claimed by {item.claimedBy}</p>
            ) : (
              <button
                className="btn btn-sm btn-accent"
                onClick={() => onClaim(item.id, currentHeroName)}
                disabled={!currentHeroName}
              >
                Claim
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
