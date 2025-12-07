import React, { useState, useMemo } from 'react';
import { useWorld } from '../../context/WorldContext';
// RIGHT:
import { useCombatState } from "../../hooks/useCombatState";
import { usePosse } from '../../context/PosseContext';

import { ENEMY_CARDS } from '../../data/enemyCards';
import { THREAT_DECKS, getThreatDeck } from '../../data/enemies/threatDecks';


import { DARKNESS_CARDS } from '../../data/darknessCards';
import { GROWING_DREAD_CARDS } from '../../data/growingDreadCards';
import EnemyGroupCard from './EnemyGroupCard';

export default function DMEnemyPanel() {
  const { world } = useWorld();
  const { combatGroups, setCombatGroups } = useCombatState();
  const { posse, updateHero } = usePosse();
  const [drawnCard, setDrawnCard] = useState(null);
  const [globalModifiers, setGlobalModifiers] = useState([]);

  // Find hero with active Eagle Spirit Guide buff
  const eagleBuffHero = useMemo(() => {
    if (!posse?.heroes) return null;

    for (const hero of posse.heroes) {
      const conditions = Array.isArray(hero?.conditions) ? hero.conditions : [];
      const eagleBuff = conditions.find(c =>
        c?.type === 'buff' &&
        c?.active !== false &&
        !c?.removed &&
        c?.effects?.redrawCard === true &&
        (c?.usesRemaining ?? 0) > 0
      );

      if (eagleBuff) {
        return { hero, buff: eagleBuff };
      }
    }
    return null;
  }, [posse?.heroes]);

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

  // Redraw threat card with Eagle Spirit Guide
  const redrawThreatWithEagle = () => {
    if (!eagleBuffHero) return;

    const { hero, buff } = eagleBuffHero;

    // Consume one use of the Eagle Spirit Guide buff
    const updatedConditions = hero.conditions.map(c => {
      if (c?.id === buff.id) {
        const newUses = Math.max(0, (c.usesRemaining ?? 0) - 1);
        return {
          ...c,
          usesRemaining: newUses,
          active: newUses > 0,
        };
      }
      return c;
    });

    // Update hero in posse
    updateHero({
      ...hero,
      conditions: updatedConditions,
      updatedAt: Date.now(),
    });

    // Clear current card and draw a new one
    setDrawnCard(null);
    setCombatGroups([]);
    drawThreatCard();

    alert(`🦅 Eagle Spirit Guide: Threat card redrawn! (${eagleBuffHero.buff.usesRemaining - 1} uses remaining)`);
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
      {/* Eagle Spirit Guide indicator */}
      {eagleBuffHero && (
        <div className="bg-green-50 border-2 border-green-500 rounded p-2 text-sm mb-3">
          <strong className="text-green-800">🦅 Eagle Spirit Guide Active!</strong>
          <p className="text-gray-700">
            {eagleBuffHero.hero.name} can redraw a Threat or Darkness card ({eagleBuffHero.buff.usesRemaining} use{eagleBuffHero.buff.usesRemaining !== 1 ? 's' : ''} remaining)
          </p>
        </div>
      )}

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
        {drawnCard && eagleBuffHero && (
          <button
            className="btn bg-green-600 hover:bg-green-700 text-white border-green-700"
            onClick={redrawThreatWithEagle}
          >
            🦅 Redraw with Eagle Spirit Guide
          </button>
        )}
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
