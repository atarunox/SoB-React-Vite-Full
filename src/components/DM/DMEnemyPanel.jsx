import React, { useState, useMemo } from 'react';
import { useWorld } from '../../context/WorldContext';
import { usePosse } from '../../context/PosseContext';
import { useCombatState } from "../../hooks/useCombatState";

import { ENEMY_CARDS } from '../../data/enemyCards';
import { THREAT_DECKS, getThreatDeck } from '../../data/enemies/threatDecks';

import { DARKNESS_CARDS } from '../../data/darknessCards';
import { GROWING_DREAD_CARDS } from '../../data/growingDreadCards';
import EnemyGroupCard from './EnemyGroupCard';
import DMActiveEnemiesPanel from './DMActiveEnemiesPanel';

const THREAT_LEVELS = ['low', 'medium', 'high', 'epic'];

// Roll N unique abilities from an elite chart (D6 table, indices 0-5).
// If the chart has fewer entries than needed, allow repeats.
function rollEliteAbilities(eliteChart, count) {
  if (!Array.isArray(eliteChart) || eliteChart.length === 0 || count <= 0) return [];
  const results = [];
  const available = eliteChart.map((text, i) => ({ roll: i + 1, text }));

  for (let n = 0; n < count; n++) {
    // Pick from remaining if possible, otherwise allow repeats
    const pool = available.filter(a => !results.some(r => r.roll === a.roll));
    const source = pool.length > 0 ? pool : available;
    const pick = source[Math.floor(Math.random() * source.length)];
    results.push({ ...pick });
  }
  return results;
}

// Calculate how many elite abilities enemies get based on the SoB rules.
// Level 1-2: 0, Level 3-4: 1, Level 5-6: 2, Level 7+: 3
// +1 if a Drifter is in the posse
// + any modifier bonuses from darkness/growing dread
function getEliteCount(posse, globalModifiers = []) {
  const highestLevel = Math.max(
    ...(posse.map(h => Number(h.level || h.Level || 1) || 1)),
    1
  );
  let count = 0;
  if (highestLevel >= 7) count = 3;
  else if (highestLevel >= 5) count = 2;
  else if (highestLevel >= 3) count = 1;

  // Drifter bonus
  if (posse.some(h => /drifter/i.test(h?.class || h?.heroClass || ''))) {
    count += 1;
  }

  // Darkness / Growing Dread modifiers that add elite abilities
  for (const mod of globalModifiers) {
    if (mod.eliteModifier) count += Number(mod.eliteModifier) || 0;
  }

  return Math.max(0, count);
}

export default function DMEnemyPanel() {
  const { world } = useWorld();
  const { posse } = usePosse();
  const { combatGroups, setCombatGroups } = useCombatState();
  const [drawnCard, setDrawnCard] = useState(null);
  const [globalModifiers, setGlobalModifiers] = useState([]);
  const [threatLevel, setThreatLevel] = useState('low');

  // Compute current elite count so it can be shown and used
  const eliteCount = useMemo(
    () => getEliteCount(posse, globalModifiers),
    [posse, globalModifiers]
  );

  // Draw threat card and generate groups
  const drawThreatCard = () => {
    const deck = getThreatDeck(world, threatLevel);
    if (!Array.isArray(deck) || deck.length === 0) {
      alert(`No threat deck for world "${world}" (${threatLevel}) or deck is empty.`);
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

    const newGroups = card.enemies.map((eg, i) => {
      const enemyData = ENEMY_CARDS[world]?.find(e => e.name === eg.name) || {};
      const chart = enemyData.eliteChart || [];
      const rolled = rollEliteAbilities(chart, eliteCount);

      return {
        id: `${Date.now()}-${card.name}-grp${i}`,
        name: eg.name,
        count: eg.count,
        baseStats: { ...enemyData, world },
        modifiers: [],
        modifiedStats: { ...enemyData },
        eliteAbilityList: rolled,
        eliteChart: chart,
        manualExtraElite: 0,
        traits: [],
        keywords: [...(enemyData.keywords || [])],
        threatCard: card
      };
    });
    setCombatGroups(prev => [...(prev || []), ...newGroups]);
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
        description: card.description || '',
        eliteModifier: card.eliteModifier || 0,
      }
    ]);
  }

  function removeGlobalModifier(idx) {
    setGlobalModifiers(prev => prev.filter((_, i) => i !== idx));
  }

  // Check for Drifter presence for display
  const hasDrifter = posse.some(h => /drifter/i.test(h?.class || h?.heroClass || ''));
  const highestLevel = Math.max(...(posse.map(h => Number(h.level || h.Level || 1) || 1)), 1);

  return (
    <div>
      {/* Elite info banner */}
      <div className="mb-3 p-2 rounded-lg bg-amber-900/20 border border-amber-700/40 text-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-bold text-amber-200">Elite Abilities: {eliteCount}</span>
          <span className="text-xs text-amber-300/80">
            (Highest Lvl: {highestLevel}{hasDrifter ? ' • Drifter +1' : ''})
          </span>
        </div>
      </div>

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
        <div className="flex gap-2 items-center">
          <select
            className="select select-bordered select-sm"
            value={threatLevel}
            onChange={e => setThreatLevel(e.target.value)}
          >
            {THREAT_LEVELS.map(lvl => (
              <option key={lvl} value={lvl}>{lvl.charAt(0).toUpperCase() + lvl.slice(1)}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={drawThreatCard}>
            Draw Threat Card ({world})
          </button>
          {combatGroups.length > 0 && (
            <button
              className="btn btn-sm btn-error btn-outline"
              onClick={() => { setCombatGroups([]); setDrawnCard(null); }}
            >
              Clear All
            </button>
          )}
        </div>
        {drawnCard && (
          <div className="mt-2 sm:mt-0">
            <div className="font-bold">{drawnCard.name}</div>
            <div className="text-xs text-gray-500">{drawnCard.effect}</div>
          </div>
        )}
      </div>

      {/* Active enemies display with cycling/show-all view */}
      <DMActiveEnemiesPanel
        combatGroups={combatGroups}
        globalModifiers={globalModifiers}
        setCombatGroups={setCombatGroups}
        eliteCount={eliteCount}
      />
    </div>
  );
}
