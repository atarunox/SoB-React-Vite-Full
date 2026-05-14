import React, { useState, useMemo } from 'react';
import { useWorld } from '../../context/WorldContext';
import { usePosse } from '../../context/PosseContext';
import { useCombatState } from "../../hooks/useCombatState";

import { ENEMY_CARDS } from '../../data/enemyCards';
import { THREAT_DECKS, getThreatDeck } from '../../data/enemies/threatDecks';
import { normalizeEnemyData } from '../../utils/enemyUtils';

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

// Official SoB Enemy Bonus by Hero Posse Level:
//   Level 1-2: No bonus
//   Level 3:   1 Elite Ability
//   Level 4:   2 Elite Abilities
//   Level 5-6: Brutal (no elite abilities from level alone)
//   Level 7:   Brutal + 1 Elite Ability
//   Level 8+:  Brutal + 2 Elite Abilities
// Drifter in posse: +1 Elite Ability (Danger Magnet)
function getEliteAndBrutal(posse) {
  const highestLevel = Math.max(
    ...(posse.map(h => Number(h.level || h.Level || 1) || 1)),
    1
  );

  let elite = 0;
  let brutal = false;

  if (highestLevel >= 8)      { elite = 2; brutal = true; }
  else if (highestLevel === 7) { elite = 1; brutal = true; }
  else if (highestLevel >= 5)  { elite = 0; brutal = true; }
  else if (highestLevel === 4) { elite = 2; }
  else if (highestLevel === 3) { elite = 1; }

  if (posse.some(h => /drifter/i.test(h?.class || h?.heroClass || ''))) {
    elite += 1;
  }

  return { elite: Math.max(0, elite), brutal };
}

export default function DMEnemyPanel() {
  const { world } = useWorld();
  const { posse } = usePosse();
  const { combatGroups, setCombatGroups } = useCombatState();
  const [drawnCard, setDrawnCard] = useState(null);
  const [threatLevel, setThreatLevel] = useState('low');

  const { elite: eliteCount, brutal: isBrutal } = useMemo(
    () => getEliteAndBrutal(posse),
    [posse]
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
      const rawEnemyData = ENEMY_CARDS[world]?.find(e => e.name === eg.name) || {};
      const enemyData = normalizeEnemyData(rawEnemyData, isBrutal);
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

  // Check for Drifter presence for display
  const hasDrifter = posse.some(h => /drifter/i.test(h?.class || h?.heroClass || ''));
  const highestLevel = Math.max(...(posse.map(h => Number(h.level || h.Level || 1) || 1)), 1);

  return (
    <div>
      {/* Elite / Brutal info banner */}
      <div className="mb-3 p-2 rounded-lg bg-amber-900/20 border border-amber-700/40 text-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-bold text-amber-200">Elite Abilities: {eliteCount}</span>
          {isBrutal && <span className="font-bold text-red-400 px-2 py-0.5 rounded bg-red-900/40 border border-red-700/50">BRUTAL</span>}
          <span className="text-xs text-amber-300/80">
            (Highest Lvl: {highestLevel}{hasDrifter ? ' • Drifter +1' : ''})
          </span>
        </div>
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
        globalModifiers={[]}
        setCombatGroups={setCombatGroups}
        eliteCount={eliteCount}
        isBrutal={isBrutal}
        posse={posse}
      />
    </div>
  );
}
