import React, { useState } from 'react';
import { useWorld } from '../../context/WorldContext';
// RIGHT:
import { useCombatState } from "../../hooks/useCombatState";

import { ENEMY_CARDS } from '../../data/enemyCards';
import { THREAT_DECKS, getThreatDeck } from '../../data/enemies/threatDecks';


import { DARKNESS_CARDS } from '../../data/darknessCards';
import { GROWING_DREAD_CARDS } from '../../data/growingDreadCards';
import EnemyGroupCard from './EnemyGroupCard';

export default function DMEnemyPanel() {
  const { world } = useWorld();
  const { combatGroups, setCombatGroups } = useCombatState();
  const [drawnCard, setDrawnCard] = useState(null);
  const [globalModifiers, setGlobalModifiers] = useState([]);

  // Draw threat card and generate groups
  const drawThreatCard = () => {
  const deck = getThreatDeck(world); // <- use helper!
  if (!Array.isArray(deck) || deck.length === 0) {
    alert(`No threat deck for world "${world}" or deck is empty.`);
    return;
  }
  const idx = Math.floor(Math.random() * deck.length);
  const card = deck[idx];
  setDrawnCard(card);

  if (!card || !Array.isArray(card.enemies)) {
    alert(`Threat card missing or has no enemies array!`);
    setCombatGroups([]);
    return;
  }

  const groups = card.enemies.map((eg, i) => {
    const enemyData = ENEMY_CARDS[world]?.find(e => e.name === eg.name) || {};
    return {
      id: `${card.name}-grp${i}`,
      name: eg.name,
      count: eg.count,
      baseStats: { ...enemyData, world },
      modifiers: [],
      modifiedStats: { ...enemyData },
      eliteAbilityList: [],
      traits: [],
      keywords: [...(enemyData.keywords || [])],
      threatCard: card
    };
  });
  setCombatGroups(groups);
};



  // Global modifiers
  function addGlobalModifier(type) {
    let card;
    if (type === 'darkness') {
      const idx = Math.floor(Math.random() * DARKNESS_CARDS.length);
      card = DARKNESS_CARDS[idx];
    }
    if (type === 'growingDread') {
      const idx = Math.floor(Math.random() * GROWING_DREAD_CARDS.length);
      card = GROWING_DREAD_CARDS[idx];
    }
    if (!card) return;
    setGlobalModifiers(prev => [
      ...prev,
      {
        type,
        name: card.name,
        effect: card.effect || {},
        addKeywords: card.keywords || [],
        description: card.description || ''
      }
    ]);
  }

  function removeGlobalModifier(idx) {
    setGlobalModifiers(prev => prev.filter((_, i) => i !== idx));
  }

  return (
    <div>
      {/* GLOBAL MODIFIERS */}
      <div className="mb-2">
        <b>Global Modifiers:</b>
        <div className="flex gap-2 mt-1">
          <button className="btn btn-xs btn-outline" onClick={() => addGlobalModifier('darkness')}>+ Darkness Card</button>
          <button className="btn btn-xs btn-outline" onClick={() => addGlobalModifier('growingDread')}>+ Growing Dread Card</button>
        </div>
        <ul className="list-disc list-inside text-xs mt-1">
          {globalModifiers.length === 0 && <li className="italic text-gray-400">None</li>}
          {globalModifiers.map((m, i) => (
            <li key={i}>
              <b>{m.type.toUpperCase()}:</b> <span className="font-semibold">{m.name}</span>
              {m.description && <span className="ml-2 italic">{m.description}</span>}
              <button className="ml-2 text-red-600 underline" onClick={() => removeGlobalModifier(i)}>Remove</button>
            </li>
          ))}
        </ul>
      </div>

      {/* THREAT DRAWER */}
      <div className="mb-4 flex flex-col sm:flex-row items-start gap-2">
        <button className="btn btn-primary" onClick={drawThreatCard}>
          Draw Threat Card ({world})
        </button>
        {drawnCard && (
          <div className="mt-2 sm:mt-0">
            <div className="font-bold">{drawnCard.name}</div>
            <div className="text-xs text-gray-500">{drawnCard.effect}</div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {combatGroups.length === 0 && (
          <div className="text-center text-gray-600 italic">No enemy groups. Draw a threat card to start.</div>
        )}
        {combatGroups.map((group, idx) => (
          <EnemyGroupCard
            key={group.id}
            group={group}
            groupIdx={idx}
            setCombatGroups={setCombatGroups}
            allGroups={combatGroups}
            globalModifiers={globalModifiers}
          />
        ))}
      </div>
    </div>
  );
}
