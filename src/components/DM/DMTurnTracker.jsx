import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { resolveActivationMarkers, getAllMarkers } from '../../utils/statusMarkers';
import { rollND } from '../../utils/diceHelpers';

const LS_KEY = 'sob_turnTracker';

function getHeroInitiative(hero) {
  return Number(hero?.stats?.Initiative ?? hero?.initiative ?? 4);
}

function parseFearFromGroup(group) {
  const abilities = group.baseStats?.abilities || [];
  for (const a of abilities) {
    const m = a.match(/(?:Unspeakable\s+)?(?:Terror|Fear)\s*\((\d+)\)/i);
    if (m) {
      const hits = parseInt(m[1], 10);
      const isUnspeakable = /unspeakable\s+terror/i.test(a);
      const isTerror = /(?<!unspeakable\s)terror\s*\(/i.test(a);
      const range = isUnspeakable ? 'same or adjacent Map Tile'
        : isTerror ? 'same Map Tile'
        : 'adjacent';
      return { hits, range, label: isUnspeakable ? `Unspeakable Terror (${hits})` : isTerror ? `Terror (${hits})` : `Fear (${hits})` };
    }
  }
  return null;
}

function buildTurnOrder(posse, combatGroups, excluded) {
  const entries = [];

  for (const hero of posse) {
    const id = hero.id || hero.localId;
    if (excluded[id]) continue;
    entries.push({
      type: 'hero',
      id,
      name: hero.name || 'Unknown Hero',
      initiative: getHeroInitiative(hero),
      hero,
    });
  }

  for (const group of combatGroups) {
    if (excluded[group.id]) continue;
    const init = group.baseStats?.initiative ?? 0;
    entries.push({
      type: 'enemy',
      id: group.id,
      name: `${group.name} (×${group.count})`,
      initiative: Number(init),
      group,
      fear: parseFearFromGroup(group),
    });
  }

  entries.sort((a, b) => b.initiative - a.initiative || (a.type === 'enemy' ? -1 : 1));
  return entries;
}

export default function DMTurnTracker({ posse = [], combatGroups = [], updateHero }) {
  const [round, setRound] = useState(1);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [excluded, setExcluded] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY + '_excluded')) || {}; } catch { return {}; }
  });
  const [showSettings, setShowSettings] = useState(false);
  const [activationLog, setActivationLog] = useState(null);
  const [activatedThisRound, setActivatedThisRound] = useState(new Set());

  useEffect(() => {
    localStorage.setItem(LS_KEY + '_excluded', JSON.stringify(excluded));
  }, [excluded]);

  const turnOrder = useMemo(
    () => buildTurnOrder(posse, combatGroups, excluded),
    [posse, combatGroups, excluded]
  );

  const current = turnOrder[currentIdx] || null;

  const toggleExclude = useCallback((id) => {
    setExcluded(prev => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  }, []);

  const getActivationEffects = useCallback((entry) => {
    const effects = [];

    if (entry.type === 'hero') {
      const markers = getAllMarkers(entry.hero);
      if (markers.length > 0) {
        effects.push({
          type: 'markers',
          label: `Markers: ${markers.map(m => `${m.count}× ${m.definition.name}`).join(', ')}`,
        });
      }

      for (const group of combatGroups) {
        const fear = parseFearFromGroup(group);
        if (fear) {
          effects.push({
            type: 'fear',
            label: `${group.name}: ${fear.label} — ${fear.hits} Horror Hit(s) if ${fear.range}`,
            hits: fear.hits,
            enemyName: group.name,
          });
        }
      }
    }

    return effects;
  }, [combatGroups]);

  const advanceTurn = useCallback(() => {
    setActivationLog(null);
    if (turnOrder.length === 0) return;

    const nextIdx = currentIdx + 1;
    if (nextIdx >= turnOrder.length) {
      setRound(r => r + 1);
      setCurrentIdx(0);
      setActivatedThisRound(new Set());
    } else {
      setCurrentIdx(nextIdx);
    }
  }, [currentIdx, turnOrder.length]);

  const markActivated = useCallback(() => {
    if (current) {
      setActivatedThisRound(prev => new Set(prev).add(current.id));
    }
  }, [current]);

  const handleResolveActivation = useCallback(async () => {
    if (!current || current.type !== 'hero') return;

    const hero = current.hero;
    const heroId = current.id;
    const markers = getAllMarkers(hero);

    if (markers.length === 0) {
      setActivationLog(['No activation markers to resolve.']);
      return;
    }

    // Minimal UI adapter for resolveActivationMarkers
    const ui = {
      roll: async (count, sides, label) => {
        const rolls = rollND(count, sides);
        return rolls;
      },
      toast: (msg) => {
        console.log(`[Activation] ${msg}`);
      },
    };

    const getStat = (h, statName) => {
      return h?.stats?.[statName] ?? h?.[statName?.toLowerCase()] ?? 0;
    };

    try {
      const result = await resolveActivationMarkers({
        ui,
        hero,
        getStat,
        updateHero,
        heroId,
      });

      // Apply wounds to hero (CRITICAL: use currentHealth, not wounds/health)
      if (result.wounds > 0 && updateHero) {
        updateHero(heroId, (h) => {
          const maxHP = Number(h.maxHealth ?? 10);
          const curHP = Number(h.currentHealth ?? maxHP);
          const nextHP = Math.max(0, curHP - result.wounds);
          return { ...h, currentHealth: nextHP };
        });
      }

      // Display log
      const logLines = result.log || [];
      if (result.lostActivation) {
        logLines.push('⚠️ Hero loses this activation due to Snare/Web!');
      }
      setActivationLog(logLines);

      // Auto-advance if lost activation
      if (result.lostActivation) {
        setTimeout(() => {
          markActivated();
          advanceTurn();
        }, 2000);
      }
    } catch (err) {
      setActivationLog([`Error resolving markers: ${err.message}`]);
      console.error(err);
    }
  }, [current, updateHero, markActivated, advanceTurn]);

  const prevTurn = useCallback(() => {
    setActivationLog(null);
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    } else if (round > 1) {
      setRound(r => r - 1);
      setCurrentIdx(Math.max(0, turnOrder.length - 1));
    }
  }, [currentIdx, round, turnOrder.length]);

  const resetTracker = useCallback(() => {
    setRound(1);
    setCurrentIdx(0);
    setActivationLog(null);
    setActivatedThisRound(new Set());
  }, []);

  const effects = current ? getActivationEffects(current) : [];

  if (turnOrder.length === 0) {
    return (
      <div className="p-4 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-2">Initiative Tracker</h2>
        <p className="text-gray-500 text-sm">No heroes or enemies in combat. Add enemies from the Enemies tab and make sure heroes are in the posse.</p>
        <button className="btn btn-sm btn-outline mt-2 min-h-[44px]" onClick={() => setShowSettings(!showSettings)}>
          {showSettings ? 'Hide Settings' : 'Settings'}
        </button>
        {showSettings && (
          <ExcludeSettings posse={posse} combatGroups={combatGroups} excluded={excluded} toggleExclude={toggleExclude} />
        )}
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded shadow space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold">Initiative Tracker</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold bg-gray-100 px-3 py-1 rounded">Round {round}</span>
          <button className="btn btn-xs btn-outline min-h-[36px]" onClick={() => setShowSettings(!showSettings)}>
            {showSettings ? 'Hide' : 'Settings'}
          </button>
          <button className="btn btn-xs btn-ghost text-red-500 min-h-[36px]" onClick={resetTracker}>Reset</button>
        </div>
      </div>

      {showSettings && (
        <ExcludeSettings posse={posse} combatGroups={combatGroups} excluded={excluded} toggleExclude={toggleExclude} />
      )}

      {/* Turn order list */}
      <div className="space-y-1">
        {turnOrder.map((entry, idx) => {
          const isCurrent = idx === currentIdx;
          const wasActivated = activatedThisRound.has(entry.id);
          const isHero = entry.type === 'hero';

          return (
            <div
              key={entry.id}
              className={`flex items-center justify-between px-3 py-2 rounded text-sm transition-colors ${
                isCurrent
                  ? isHero ? 'bg-blue-100 border-2 border-blue-400 font-bold' : 'bg-red-100 border-2 border-red-400 font-bold'
                  : wasActivated ? 'bg-gray-100 text-gray-400' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-xs px-1.5 py-0.5 rounded ${isHero ? 'bg-blue-200 text-blue-800' : 'bg-red-200 text-red-800'}`}>
                  {isHero ? 'H' : 'E'}
                </span>
                <span>{entry.name}</span>
                {entry.fear && (
                  <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
                    {entry.fear.label}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 font-mono">Init {entry.initiative}</span>
            </div>
          );
        })}
      </div>

      {/* Current activation panel */}
      {current && (
        <div className={`border-2 rounded-lg p-3 space-y-2 ${current.type === 'hero' ? 'border-blue-300 bg-blue-50' : 'border-red-300 bg-red-50'}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold">
              {current.type === 'hero' ? '🎯' : '💀'} {current.name}'s Activation
            </h3>
            <span className="text-xs text-gray-500">Init {current.initiative}</span>
          </div>

          {/* Activation effects */}
          {effects.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-600 uppercase">Start of Activation:</p>
              {effects.map((eff, i) => (
                <div key={i} className={`text-sm px-2 py-1 rounded ${
                  eff.type === 'fear' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                  eff.type === 'markers' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                  'bg-gray-100'
                }`}>
                  {eff.label}
                </div>
              ))}
            </div>
          )}

          {/* Activation log */}
          {activationLog && (
            <div className="text-xs bg-white/80 rounded p-2 border border-gray-200 max-h-32 overflow-y-auto">
              {activationLog.map((line, i) => <p key={i}>{line}</p>)}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <button className="btn btn-sm btn-outline min-h-[44px]" onClick={prevTurn}>
              ← Prev
            </button>
            {current.type === 'hero' && getAllMarkers(current.hero).length > 0 && (
              <button
                className="btn btn-sm btn-warning min-h-[44px]"
                onClick={handleResolveActivation}
              >
                ⚡ Resolve Markers
              </button>
            )}
            <button
              className={`btn btn-sm min-h-[44px] ${current.type === 'hero' ? 'btn-primary' : 'btn-error'}`}
              onClick={() => { markActivated(); advanceTurn(); }}
            >
              End Turn → Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ExcludeSettings({ posse, combatGroups, excluded, toggleExclude }) {
  return (
    <div className="bg-gray-50 rounded p-3 space-y-2 border border-gray-200">
      <p className="text-xs font-bold text-gray-500 uppercase">Include in Tracker:</p>
      <div className="space-y-1">
        {posse.map(hero => {
          const id = hero.id || hero.localId;
          return (
            <label key={id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={!excluded[id]}
                onChange={() => toggleExclude(id)}
                className="checkbox checkbox-sm"
              />
              <span className="text-blue-700">{hero.name || 'Unknown Hero'}</span>
              <span className="text-xs text-gray-400">Init {getHeroInitiative(hero)}</span>
            </label>
          );
        })}
        {combatGroups.map(group => (
          <label key={group.id} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={!excluded[group.id]}
              onChange={() => toggleExclude(group.id)}
              className="checkbox checkbox-sm"
            />
            <span className="text-red-700">{group.name} (×{group.count})</span>
            <span className="text-xs text-gray-400">Init {group.baseStats?.initiative ?? '?'}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
