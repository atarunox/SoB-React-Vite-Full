// src/components/EnemyReferencePage.jsx

import React from 'react';
import { ENEMY_CARDS } from '../data/enemyCards';

export default function EnemyReferencePage() {
  const difficulties = Object.keys(ENEMY_CARDS);

  return (
    <div className="p-4 max-w-4xl mx-auto bg-parchment min-h-screen text-black">
      <button
        onClick={() => window.location.href = '/'}
        className="btn btn-outline mb-4"
      >
        ← Back to DM Panel
      </button>

      <h1 className="text-2xl font-bold mb-4">All Enemy Stats</h1>

      {difficulties.map(level => (
        <div key={level} className="mb-6">
          <h2 className="text-xl font-semibold capitalize">{level} Enemies</h2>

          {Array.isArray(ENEMY_CARDS[level]) ? (
            ENEMY_CARDS[level].map((card, i) => (
              <div key={i} className="border p-2 mb-2 rounded bg-white/10 shadow">
                <p className="italic mb-1">Set: {card.set}</p>
                {Array.isArray(card.enemies) ? (
                  card.enemies.map((enemy, idx) => (
                    <div key={idx} className="mb-2 pl-2">
                      <strong>{enemy.name}</strong> ({enemy.amount ?? '—'}x)
                      <ul className="ml-4 list-disc">
                        <li>Health: {enemy.health ?? '—'}</li>
                        <li>Initiative: {enemy.initiative ?? '—'}</li>
                        <li>Defense: {enemy.defense ?? '—'}</li>
                        <li>Size: {enemy.Size ?? '—'}</li>
                        <li>Keywords: {enemy.keywords?.join(', ') || 'None'}</li>
                      </ul>
                    </div>
                  ))
                ) : (
                  <p className="text-sm italic text-red-500">
                    Error: Missing enemy list for this card.
                  </p>
                )}
              </div>
            ))
          ) : (
            Object.entries(ENEMY_CARDS[level]).map(([name, stats], idx) => (
              <div key={idx} className="mb-2 pl-2 border p-2 rounded bg-white/10 shadow">
                <strong>{name}</strong>
                <ul className="ml-4 list-disc">
                  <li>Health: {stats.health}</li>
                  <li>Initiative: {stats.initiative}</li>
                  <li>Defense: {stats.defense}</li>
                  <li>Size: {stats.Size}</li>
                  <li>Keywords: {stats.keywords?.join(', ') || 'None'}</li>
                </ul>
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  );
}
