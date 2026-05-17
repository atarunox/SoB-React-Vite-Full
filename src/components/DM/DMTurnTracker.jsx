import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { resolveActivationMarkers, getAllMarkers } from '../../utils/statusMarkers';
import { rollND } from '../../utils/diceHelpers';

const LS_KEY = 'sob_turnTracker';

// Keyed by trait card name. Values: { activation?, hero?, round_end? }
// activation  = show when that enemy group is the active entry
// hero        = show on every hero's activation while the group is in combat
// round_end   = show in the persistent end-of-round reminder strip
const TRAIT_REMINDERS = {
  // ── Harbinger ──────────────────────────────────────────────────────────────
  'Lashing Tail':          { activation: 'Roll 1 Hit on Random Hero within 3 spaces → 2D6 Damage' },
  'Screeching Roar':       { round_end:  'If HBtD failed this turn: all Enemies +2 Damage / all Heroes −2 Damage until end of turn' },
  'Blistering Touch':      { hero:       'Adjacent to Harbinger? Agility 5+ or take 3 Hits × 2 Damage; 6+ to-hit adds D3 Burning markers' },
  'Bringer of Armageddon': { activation: 'Cast a Shadow Magik Spell (or Default Spell on back of reference card)' },

  // ── HellBats ───────────────────────────────────────────────────────────────
  'Human Faces':           { hero:      'Adjacent to HellBats? Take 1 Corruption Hit' },
  'Flooding Swarm':        { round_end: 'HellBats — Flooding Swarm: Add D3+1 Ambushing HellBats to the Fight' },

  // ── Goliath ────────────────────────────────────────────────────────────────
  'Plunging Tentacle Arms':{ activation: 'If no Tentacle enemies on board: place 2 Tentacles as Ambush. Killed Tentacle → add its base Health as wounds to Goliath' },
  'Unstoppable Mass':      { activation: 'Re-Target to Hero with highest current Health this turn' },

  // ── Slashers ───────────────────────────────────────────────────────────────
  'Enraged by Light':      { activation: 'If within 2 spaces of Lantern Hero, re-target that Hero (+2 Combat while on same Map Tile as Light Source)' },

  // ── Order of the Crimson Hand ──────────────────────────────────────────────
  'Acolytes of the Black': { round_end:  'Crimson Hand — Acolytes: If HBtD failed this turn, Crimson Hand get an extra Activation at Initiative 8' },

  // ── Feral Vampires ─────────────────────────────────────────────────────────
  'Light Sensitive':       { activation: 'Roll D6 per Vampire in Move range of Lantern Hero — on 5+: re-target to Lantern Hero this turn' },
  'Soul Siphoning':        { round_end:  'Feral Vampires — Soul Siphoning: Each Hero takes 1 Horror Hit per Wound on each adjacent Vampire' },
  'Blood Frenzied':        { activation: 'Re-Target to Hero with most Wounds; +1 Damage per 2 Wounds target had at start of Vampire activation' },

  // ── Werewolf Feral Kin ─────────────────────────────────────────────────────
  'Battle Lust':           { round_end:  'Werewolf Feral Kin — Battle Lust: Heal Wounds equal to Blood Spatter spaces Darkness has passed (including current space)' },
  'The Smell of Fear':     { activation: 'Re-Target to Hero with most Sanity Damage; +1 Damage per 2 Sanity Damage target had at start of activation' },

  // ── Lost Army ──────────────────────────────────────────────────────────────
  'Burning Hatred':        {
    activation: 'Lost Army in Formation: Free Move 1 space toward Lantern Hero (must stay in Formation)',
    hero:       'On same Map Tile as Lost Army? Take 2 Horror Hits',
  },

  // ── Hellfire Succubi ───────────────────────────────────────────────────────
  'Belian Coven':          { activation: 'Roll D6 — on 1, 2, or 3: draw a Shadow Magik Spell card for a Random Succubus to cast' },

  // ── Shaman ─────────────────────────────────────────────────────────────────
  'Tribal Voodoo Doll':    { activation: 'Select a Random Hero → Defense and Willpower 5+ this turn (unless already worse)' },
  "Ven'issa Rattle":       { hero:       'On same Map Tile as Shaman? Take 2 Horror Hits (Terror 2 — replaces any Fear)' },

  // ── Ancient One ────────────────────────────────────────────────────────────
  'Ancient Enemies':       { activation: 'Roll D6 — on 1, 2, or 3: draw a Darkness card' },

  // ── Night Terrors ──────────────────────────────────────────────────────────
  'Glowing Eyes':          { activation: '⇅ REVERSE INITIATIVE active — all models activate lowest→highest. Defense 4− enemies have Tough until they Activate' },
  'Death in the Dark':     { activation: 'Re-Target to Hero furthest from Light Source; +1 To Hit if not on same tile as Light Source' },
};

function getHeroInitiative(hero) {
  return Number(hero?.stats?.Initiative ?? hero?.initiative ?? 4);
}

function parseFearFromGroup(group) {
  const sources = [
    ...(group.baseStats?.abilities || []),
    ...(group.modifiers || []).filter(m => m.type === 'enemyTrait').map(m => m.description || ''),
  ];
  for (const a of sources) {
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

// Returns trait reminder text for a specific timing from a group's active enemyTrait modifiers.
function getTraitRemindersForGroup(group, timing) {
  if (!group?.modifiers) return [];
  return group.modifiers
    .filter(m => m.type === 'enemyTrait')
    .flatMap(m => {
      const r = TRAIT_REMINDERS[m.name];
      if (!r || !r[timing]) return [];
      return [{ cardName: m.name, text: r[timing] }];
    });
}

function buildTurnOrder(posse, combatGroups, excluded, reversed) {
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

  if (reversed) {
    entries.sort((a, b) => a.initiative - b.initiative || (a.type === 'enemy' ? -1 : 1));
  } else {
    entries.sort((a, b) => b.initiative - a.initiative || (a.type === 'enemy' ? -1 : 1));
  }
  return entries;
}

export default function DMTurnTracker({ posse = [], combatGroups = [], updateHero }) {
  const [round, setRound] = useState(1);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [excluded, setExcluded] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY + '_excluded')) || {}; } catch { return {}; }
  });
  const [reverseInitiative, setReverseInitiative] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activationLog, setActivationLog] = useState(null);
  const [activatedThisRound, setActivatedThisRound] = useState(new Set());

  useEffect(() => {
    localStorage.setItem(LS_KEY + '_excluded', JSON.stringify(excluded));
  }, [excluded]);

  // Auto-suggest reverse initiative when Glowing Eyes is active
  const glowingEyesActive = useMemo(
    () => combatGroups.some(g => g.modifiers?.some(m => m.type === 'enemyTrait' && m.name === 'Glowing Eyes')),
    [combatGroups]
  );

  const turnOrder = useMemo(
    () => buildTurnOrder(posse, combatGroups, excluded, reverseInitiative),
    [posse, combatGroups, excluded, reverseInitiative]
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

  // Collect persistent round-end reminders from all active groups' trait modifiers
  const roundEndReminders = useMemo(() => {
    return combatGroups.flatMap(g => getTraitRemindersForGroup(g, 'round_end'));
  }, [combatGroups]);

  const getActivationEffects = useCallback((entry) => {
    const effects = [];

    if (entry.type === 'hero') {
      // Status markers
      const markers = getAllMarkers(entry.hero);
      if (markers.length > 0) {
        effects.push({
          type: 'markers',
          label: `Markers: ${markers.map(m => `${m.count}× ${m.definition.name}`).join(', ')}`,
        });
      }

      // Fear / Terror / Unspeakable Terror from all enemy groups
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

      // Trait reminders that fire on hero activation
      for (const group of combatGroups) {
        const heroReminders = getTraitRemindersForGroup(group, 'hero');
        for (const r of heroReminders) {
          effects.push({
            type: 'trait',
            label: `${group.name} [${r.cardName}]: ${r.text}`,
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

    const ui = {
      roll: async (count, sides) => rollND(count, sides),
      toast: (msg) => console.log(`[Activation] ${msg}`),
    };

    const getStat = (h, statName) => h?.stats?.[statName] ?? h?.[statName?.toLowerCase()] ?? 0;

    try {
      const result = await resolveActivationMarkers({ ui, hero, getStat, updateHero, heroId });

      if (result.wounds > 0 && updateHero) {
        updateHero(heroId, (h) => {
          const maxHP = Number(h.maxHealth ?? 10);
          const curHP = Number(h.currentHealth ?? maxHP);
          return { ...h, currentHealth: Math.max(0, curHP - result.wounds) };
        });
      }

      const logLines = result.log || [];
      if (result.lostActivation) logLines.push('⚠️ Hero loses this activation due to Snare/Web!');
      setActivationLog(logLines);

      if (result.lostActivation) {
        setTimeout(() => { markActivated(); advanceTurn(); }, 2000);
      }
    } catch (err) {
      setActivationLog([`Error resolving markers: ${err.message}`]);
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
    setReverseInitiative(false);
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
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold bg-gray-100 px-3 py-1 rounded">Round {round}</span>

          {/* Reverse initiative toggle */}
          <button
            className={`btn btn-xs min-h-[36px] ${reverseInitiative ? 'btn-warning' : 'btn-outline'}`}
            onClick={() => setReverseInitiative(v => !v)}
            title={reverseInitiative ? 'Initiative reversed (lowest first) — click to restore' : 'Reverse initiative order (Glowing Eyes)'}
          >
            ⇅ {reverseInitiative ? 'Reversed' : 'Normal'}
          </button>

          <button className="btn btn-xs btn-outline min-h-[36px]" onClick={() => setShowSettings(!showSettings)}>
            {showSettings ? 'Hide' : 'Settings'}
          </button>
          <button className="btn btn-xs btn-ghost text-red-500 min-h-[36px]" onClick={resetTracker}>Reset</button>
        </div>
      </div>

      {/* Glowing Eyes suggestion banner */}
      {glowingEyesActive && !reverseInitiative && (
        <div className="bg-purple-100 border border-purple-400 rounded px-3 py-2 flex items-center justify-between gap-2">
          <span className="text-xs text-purple-800 font-semibold">👁 Glowing Eyes active — should initiative be reversed?</span>
          <button className="btn btn-xs btn-warning" onClick={() => setReverseInitiative(true)}>Reverse Now</button>
        </div>
      )}

      {/* Reverse initiative active banner */}
      {reverseInitiative && (
        <div className="bg-amber-100 border border-amber-400 rounded px-3 py-2 text-xs text-amber-900 font-semibold">
          ⇅ Initiative REVERSED — activating lowest to highest (0 → 1 → 2…)
        </div>
      )}

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

          {/* Hero: Fear / markers / trait reminders */}
          {effects.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-600 uppercase">Start of Activation:</p>
              {effects.map((eff, i) => (
                <div key={i} className={`text-sm px-2 py-1 rounded ${
                  eff.type === 'fear'    ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                  eff.type === 'markers' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                  eff.type === 'trait'   ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                  'bg-gray-100'
                }`}>
                  {eff.type === 'trait' && <span className="mr-1">⚠</span>}
                  {eff.label}
                </div>
              ))}
            </div>
          )}

          {/* Enemy: trait activation reminders */}
          {current.type === 'enemy' && (() => {
            const reminders = getTraitRemindersForGroup(current.group, 'activation');
            if (reminders.length === 0) return null;
            return (
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-600 uppercase">Trait Reminders:</p>
                {reminders.map((r, i) => (
                  <div key={i} className="text-sm px-2 py-1 rounded bg-orange-100 text-orange-900 border border-orange-300">
                    <span className="font-semibold">[{r.cardName}]</span> {r.text}
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Activation log */}
          {activationLog && (
            <div className="text-xs bg-white/80 rounded p-2 border border-gray-200 max-h-32 overflow-y-auto">
              {activationLog.map((line, i) => <p key={i}>{line}</p>)}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <button className="btn btn-sm btn-outline min-h-[44px]" onClick={prevTurn}>← Prev</button>
            {current.type === 'hero' && getAllMarkers(current.hero).length > 0 && (
              <button className="btn btn-sm btn-warning min-h-[44px]" onClick={handleResolveActivation}>
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

      {/* Round-end reminders — persistent strip */}
      {roundEndReminders.length > 0 && (
        <div className="border border-amber-400 rounded-lg bg-amber-50 p-3 space-y-1">
          <p className="text-xs font-bold text-amber-800 uppercase">End of Round Reminders:</p>
          {roundEndReminders.map((r, i) => (
            <div key={i} className="text-xs text-amber-900 px-2 py-1 bg-amber-100 rounded border border-amber-300">
              <span className="font-semibold">[{r.cardName}]</span> {r.text}
            </div>
          ))}
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
              <input type="checkbox" checked={!excluded[id]} onChange={() => toggleExclude(id)} className="checkbox checkbox-sm" />
              <span className="text-blue-700">{hero.name || 'Unknown Hero'}</span>
              <span className="text-xs text-gray-400">Init {getHeroInitiative(hero)}</span>
            </label>
          );
        })}
        {combatGroups.map(group => (
          <label key={group.id} className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={!excluded[group.id]} onChange={() => toggleExclude(group.id)} className="checkbox checkbox-sm" />
            <span className="text-red-700">{group.name} (×{group.count})</span>
            <span className="text-xs text-gray-400">Init {group.baseStats?.initiative ?? '?'}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
