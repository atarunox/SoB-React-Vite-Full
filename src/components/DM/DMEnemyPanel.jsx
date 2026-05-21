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

// Parse spawn text into { enemies, chainDraws }.
// chainDraws: [{tier, count}] for "N Low/Med/High Threat Card(s)" tokens.
// enemies: [{name, count}] for everything else.
function parseSpawnResult(spawnText, posseSize) {
  if (!spawnText) return { enemies: [], chainDraws: [] };
  const parts = spawnText.split(/\s+and\s+|\s*\+\s*/i).map(s => s.trim()).filter(Boolean);
  const enemies = [];
  const chainDraws = [];

  for (const part of parts) {
    // "N Low/Med/Medium/High/Epic Threat Card(s)" or "N Threat Card(s)"
    const tc = part.match(/^(\d+)\s+(?:(low|med|medium|high|epic)\s+)?threat\s+cards?/i);
    if (tc) {
      const count = parseInt(tc[1]);
      const word  = (tc[2] || '').toLowerCase();
      const tier  = word === 'med' ? 'medium' : word || null; // null = same tier as parent
      chainDraws.push({ tier, count });
      continue;
    }
    const ppPlus = part.match(/^\{P\}\{P\}\+(\d+)\s+(.+)/);  if (ppPlus) { enemies.push({ name: ppPlus[2].trim(), count: posseSize * 2 + parseInt(ppPlus[1]) }); continue; }
    const pp    = part.match(/^\{P\}\{P\}\s+(.+)/);           if (pp)     { enemies.push({ name: pp[1].trim(),     count: posseSize * 2 });                        continue; }
    const pPlus = part.match(/^\{P\}\+(\d+)\s+(.+)/);         if (pPlus)  { enemies.push({ name: pPlus[2].trim(), count: posseSize + parseInt(pPlus[1]) });        continue; }
    const p     = part.match(/^\{P\}\s+(.+)/);                if (p)      { enemies.push({ name: p[1].trim(),      count: posseSize });                            continue; }
    const d3p   = part.match(/^D3\+(\d+)\s+(.+)/i);           if (d3p)    { enemies.push({ name: d3p[2].trim(),   count: Math.ceil(Math.random()*3)+parseInt(d3p[1]) }); continue; }
    const d3    = part.match(/^D3\s+(.+)/i);                  if (d3)     { enemies.push({ name: d3[1].trim(),     count: Math.ceil(Math.random()*3) });           continue; }
    const num   = part.match(/^(\d+)\s+(.+)/);                if (num)    { enemies.push({ name: num[2].trim(),    count: parseInt(num[1]) });                     continue; }
  }
  return { enemies, chainDraws };
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

export default function DMEnemyPanel({ globalModifiers = [] }) {
  const { world } = useWorld();
  const { posse } = usePosse();
  const { combatGroups, setCombatGroups } = useCombatState();
  const [drawnCards, setDrawnCards] = useState([]); // [{card, isChained}]
  const [threatLevelOverride, setThreatLevelOverride] = useState(null);

  const posseSize = posse.length || 1;
  const autoTier = autoTierForPosse(posseSize);
  const threatLevel = threatLevelOverride ?? autoTier;

  const { elite: eliteCount, brutal: isBrutal } = useMemo(
    () => getEliteAndBrutal(posse),
    [posse]
  );

  const allEnemiesFlat = useMemo(() => Object.values(ENEMY_CARDS).flat(), []);

  function makeGroups(card, enemies) {
    return enemies.map((eg, i) => {
      const rawEnemyData = allEnemiesFlat.find(e =>
        e.name?.toLowerCase() === eg.name.toLowerCase()
      ) || {};
      const enemyData = normalizeEnemyData(rawEnemyData, isBrutal);
      const chart = enemyData.eliteChart || [];
      return {
        id: `${Date.now()}-${card.id}-grp${i}-${Math.random().toString(36).slice(2)}`,
        name: eg.name,
        count: eg.count,
        baseStats: { ...enemyData, world },
        modifiers: [],
        modifiedStats: { ...enemyData },
        eliteAbilityList: rollEliteAbilities(chart, eliteCount),
        eliteChart: chart,
        manualExtraElite: 0,
        traits: [],
        keywords: [...(enemyData.keywords || [])],
        threatCard: card,
      };
    });
  }

  const drawThreatCard = () => {
    const pickCard = (tier) => {
      const deck = THREAT_CARDS.filter(c => c.tier === tier);
      return deck.length ? deck[Math.floor(Math.random() * deck.length)] : null;
    };

    const primary = pickCard(threatLevel);
    if (!primary) return;

    const drawn = [{ card: primary, isChained: false }];
    const newGroups = [];

    // Process primary card
    const { enemies: pEnemies, chainDraws } = parseSpawnResult(resolveSpawnText(primary, posseSize), posseSize);
    newGroups.push(...makeGroups(primary, pEnemies));

    // Resolve chain draws (depth 1 — chain draws don't chain further)
    for (const { tier, count } of chainDraws) {
      const drawTier = tier || threatLevel;
      for (let n = 0; n < count; n++) {
        const chained = pickCard(drawTier);
        if (!chained) continue;
        drawn.push({ card: chained, isChained: true, chainedTier: drawTier });
        const { enemies: cEnemies } = parseSpawnResult(resolveSpawnText(chained, posseSize), posseSize);
        newGroups.push(...makeGroups(chained, cEnemies));
      }
    }

    setDrawnCards(drawn);
    if (newGroups.length > 0) setCombatGroups(prev => [...(prev || []), ...newGroups]);
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
              onClick={() => { setCombatGroups([]); setDrawnCards([]); }}
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

        {drawnCards.length > 0 && (
          <div className="space-y-1.5">
            {drawnCards.map(({ card, isChained, chainedTier }, idx) => (
              <div key={idx} className={`p-3 rounded-lg border space-y-1 ${
                isChained
                  ? 'bg-[#1a1a2a] border-blue-700/50'
                  : 'bg-[#2a1f14] border-amber-700/50'
              }`}>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-bold text-amber-200 text-sm">
                    {isChained && <span className="text-blue-400 text-xs mr-1.5">↳ chain draw</span>}
                    {card.name}
                  </span>
                  <span className={`text-[10px] font-semibold border rounded px-1.5 py-0.5 capitalize ${
                    card.tier === 'low'    ? 'bg-green-900/50 text-green-300 border-green-700'
                    : card.tier === 'medium' ? 'bg-yellow-900/50 text-yellow-300 border-yellow-700'
                    : card.tier === 'high'   ? 'bg-orange-900/50 text-orange-300 border-orange-700'
                                            : 'bg-red-900/50 text-red-300 border-red-700'
                  }`}>{card.tier}</span>
                </div>
                <p className="text-sm font-semibold text-amber-100">
                  ⚔ {resolveSpawnText(card, posseSize)}
                  {card.heroTable && <span className="ml-1 text-xs font-normal text-amber-400/60">({posseSize} heroes)</span>}
                </p>
                {(card.effects || []).map((e, i) => (
                  <p key={i} className="text-xs text-amber-300/80 italic">{e}</p>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active enemies display with cycling/show-all view */}
      <DMActiveEnemiesPanel
        combatGroups={combatGroups}
        globalModifiers={globalModifiers || []}
        setCombatGroups={setCombatGroups}
        eliteCount={eliteCount}
        isBrutal={isBrutal}
        posse={posse}
      />
    </div>
  );
}
