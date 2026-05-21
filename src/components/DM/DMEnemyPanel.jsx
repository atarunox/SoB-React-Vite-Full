import React, { useState, useMemo } from 'react';
import { useWorld } from '../../context/WorldContext';
import { usePosse } from '../../context/PosseContext';
import { useCombatState } from "../../hooks/useCombatState";

import { ENEMY_CARDS } from '../../data/enemyCards';
import { THREAT_CARDS } from '../../data/cards/threatCards';
import { normalizeEnemyData } from '../../utils/enemyUtils';

import DMActiveEnemiesPanel from './DMActiveEnemiesPanel';

const THREAT_LEVELS = ['low', 'medium', 'high', 'epic'];

// Derive recommended tier from posse size (official SoB rules)
function autoTierForPosse(posseSize) {
  if (posseSize <= 2) return 'low';
  if (posseSize <= 4) return 'medium';
  return 'high';
}

// Resolve the spawn text for a card given current posse size (heroTable cards vary by count)
function resolveSpawnText(card, posseSize) {
  if (card.spawn) return card.spawn;
  if (card.heroTable) {
    const row = card.heroTable.find(r => {
      const [lo, hi] = r.range.split('-').map(Number);
      return posseSize >= lo && posseSize <= (hi || 99);
    });
    return row?.text || card.heroTable[0]?.text || '';
  }
  return '';
}

// Parse spawn text into [{name, count}] for enemy group creation.
// Handles: N Name, {P} Name, {P}{P} Name, {P}+N Name, D3 Name, D3+N Name
function parseSpawnToGroups(spawnText, posseSize) {
  if (!spawnText) return [];
  const parts = spawnText.split(/\s+and\s+|\s*\+\s*/i).map(s => s.trim()).filter(Boolean);
  return parts.flatMap(part => {
    const ppPlus = part.match(/^\{P\}\{P\}\+(\d+)\s+(.+)/);  if (ppPlus) return [{ name: ppPlus[2].trim(), count: posseSize * 2 + parseInt(ppPlus[1]) }];
    const pp    = part.match(/^\{P\}\{P\}\s+(.+)/);           if (pp)     return [{ name: pp[1].trim(),     count: posseSize * 2 }];
    const pPlus = part.match(/^\{P\}\+(\d+)\s+(.+)/);         if (pPlus)  return [{ name: pPlus[2].trim(), count: posseSize + parseInt(pPlus[1]) }];
    const p     = part.match(/^\{P\}\s+(.+)/);                if (p)      return [{ name: p[1].trim(),      count: posseSize }];
    const d3p   = part.match(/^D3\+(\d+)\s+(.+)/i);           if (d3p)    return [{ name: d3p[2].trim(),   count: Math.ceil(Math.random() * 3) + parseInt(d3p[1]) }];
    const d3    = part.match(/^D3\s+(.+)/i);                  if (d3)     return [{ name: d3[1].trim(),     count: Math.ceil(Math.random() * 3) }];
    const num   = part.match(/^(\d+)\s+(.+)/);                if (num)    return [{ name: num[2].trim(),    count: parseInt(num[1]) }];
    return [];
  });
}

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
  const [threatLevelOverride, setThreatLevelOverride] = useState(null);

  const posseSize = posse.length || 1;
  const autoTier = autoTierForPosse(posseSize);
  const threatLevel = threatLevelOverride ?? autoTier;

  const { elite: eliteCount, brutal: isBrutal } = useMemo(
    () => getEliteAndBrutal(posse),
    [posse]
  );

  const drawThreatCard = () => {
    const deck = THREAT_CARDS.filter(c => c.tier === threatLevel);
    if (deck.length === 0) return;
    const card = deck[Math.floor(Math.random() * deck.length)];
    setDrawnCard(card);

    const spawnText = resolveSpawnText(card, posseSize);
    const groups = parseSpawnToGroups(spawnText, posseSize);

    const newGroups = groups.map((eg, i) => {
      const allEnemies = Object.values(ENEMY_CARDS).flat();
      const rawEnemyData = allEnemies.find(e =>
        e.name?.toLowerCase() === eg.name.toLowerCase()
      ) || {};
      const enemyData = normalizeEnemyData(rawEnemyData, isBrutal);
      const chart = enemyData.eliteChart || [];
      const rolled = rollEliteAbilities(chart, eliteCount);

      return {
        id: `${Date.now()}-${card.id}-grp${i}`,
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
        threatCard: card,
      };
    });
    if (newGroups.length > 0) {
      setCombatGroups(prev => [...(prev || []), ...newGroups]);
    }
  };

  const hasDrifter = posse.some(h => /drifter/i.test(h?.class || h?.heroClass || ''));
  const highestLevel = Math.max(...(posse.map(h => Number(h.level || h.Level || 1) || 1)), 1);

  const tierColors = { low: 'text-green-400', medium: 'text-yellow-400', high: 'text-orange-400', epic: 'text-red-400' };

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
      <div className="mb-4 space-y-2">
        <div className="flex gap-2 items-center flex-wrap">
          <div className="flex items-center gap-1.5">
            {THREAT_LEVELS.map(lvl => (
              <button
                key={lvl}
                onClick={() => setThreatLevelOverride(lvl === autoTier ? null : lvl)}
                className={`text-xs px-2.5 py-1 rounded-full border font-semibold transition-colors capitalize ${
                  threatLevel === lvl
                    ? lvl === 'low'    ? 'bg-green-700 text-white border-green-600'
                    : lvl === 'medium' ? 'bg-yellow-600 text-white border-yellow-500'
                    : lvl === 'high'   ? 'bg-orange-600 text-white border-orange-500'
                                       : 'bg-red-700 text-white border-red-600'
                    : 'bg-white/10 text-amber-300/70 border-amber-700/30 hover:bg-white/20'
                }`}
              >
                {lvl}{lvl === autoTier ? ' ★' : ''}
              </button>
            ))}
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={drawThreatCard}
          >
            Draw {threatLevel.charAt(0).toUpperCase() + threatLevel.slice(1)} Threat
          </button>
          {combatGroups.length > 0 && (
            <button
              className="btn btn-sm btn-error btn-outline"
              onClick={() => { setCombatGroups([]); setDrawnCard(null); }}
            >
              Clear All
            </button>
          )}
          {threatLevelOverride && (
            <button
              className="text-xs text-amber-400/70 hover:text-amber-400 underline"
              onClick={() => setThreatLevelOverride(null)}
            >
              reset to auto ({autoTier})
            </button>
          )}
        </div>
        <div className="text-xs text-amber-400/60">
          {posseSize} hero{posseSize !== 1 ? 'es' : ''} → auto: <span className={`font-semibold ${tierColors[autoTier]}`}>{autoTier}</span>
        </div>

        {drawnCard && (
          <div className="p-3 rounded-lg bg-[#2a1f14] border border-amber-700/50 space-y-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-bold text-amber-200 text-sm">{drawnCard.name}</span>
              <span className={`text-[10px] font-semibold border rounded px-1.5 py-0.5 capitalize ${
                drawnCard.tier === 'low'    ? 'bg-green-900/50 text-green-300 border-green-700'
                : drawnCard.tier === 'medium' ? 'bg-yellow-900/50 text-yellow-300 border-yellow-700'
                : drawnCard.tier === 'high'   ? 'bg-orange-900/50 text-orange-300 border-orange-700'
                                              : 'bg-red-900/50 text-red-300 border-red-700'
              }`}>{drawnCard.tier}</span>
            </div>
            {drawnCard.spawn && (
              <p className="text-sm font-semibold text-amber-100">⚔ {drawnCard.spawn}</p>
            )}
            {drawnCard.heroTable && (
              <p className="text-sm font-semibold text-amber-100">
                ⚔ {resolveSpawnText(drawnCard, posseSize)}
                <span className="ml-1 text-xs font-normal text-amber-400/60">({posseSize} heroes)</span>
              </p>
            )}
            {(drawnCard.effects || []).map((e, i) => (
              <p key={i} className="text-xs text-amber-300/80 italic">{e}</p>
            ))}
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
