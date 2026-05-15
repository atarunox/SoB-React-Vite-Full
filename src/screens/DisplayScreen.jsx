import React, { useMemo } from 'react';
import { useAdventure } from '../context/AdventureContext';
import { usePosse } from '../context/PosseContext';
import { useWorld } from '../context/WorldContext';
import { getHBtDThreshold } from '../data/depthEvents/depthEventLookup';

// ── Stat bar ──────────────────────────────────────────────────────────────────
function StatBar({ label, current, max, colorClass }) {
  const pct = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-xs text-gray-400">
        <span>{label}</span>
        <span className="font-bold text-white">{current} / {max}</span>
      </div>
      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Single hero card ──────────────────────────────────────────────────────────
function HeroCard({ hero }) {
  const s = hero.stats ?? {};

  const posseConditions = useMemo(() => [
    ...(hero.injuries  ?? []).filter(c => c?.posseEffect),
    ...(hero.madness   ?? []).filter(c => c?.posseEffect),
    ...(hero.mutations ?? []).filter(c => c?.posseEffect),
  ], [hero]);

  const isKO = hero.currentHealth <= 0 || hero.currentSanity <= 0;

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${isKO ? 'border-red-600 bg-red-950/40' : 'border-gray-700 bg-gray-800'}`}>
      {/* Name + class */}
      <div className="flex items-baseline gap-2">
        <h2 className="text-xl font-bold text-white leading-tight">{hero.name || 'Unknown'}</h2>
        <span className="text-sm text-gray-400">{hero.heroClass || ''}</span>
        {isKO && <span className="ml-auto text-xs font-bold text-red-400 animate-pulse">KO</span>}
      </div>

      {/* Resource bars */}
      <div className="space-y-2">
        <StatBar label="Health"  current={hero.currentHealth  ?? 0} max={hero.maxHealth  ?? 10} colorClass="bg-red-500" />
        <StatBar label="Sanity"  current={hero.currentSanity  ?? 0} max={hero.maxSanity  ?? 10} colorClass="bg-blue-500" />
        {(hero.currentCorruption ?? 0) > 0 && (
          <StatBar label="Corruption" current={hero.currentCorruption ?? 0} max={hero.maxCorruption ?? 5} colorClass="bg-purple-500" />
        )}
      </div>

      {/* Grit / Gold / XP */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="bg-amber-900/60 border border-amber-600 px-2 py-0.5 rounded text-amber-200">
          Grit {hero.currentGrit ?? 0}/{hero.Grit ?? 2}
        </span>
        <span className="bg-yellow-900/60 border border-yellow-600 px-2 py-0.5 rounded text-yellow-200">
          Gold ${hero.gold ?? 0}
        </span>
        <span className="bg-gray-700 border border-gray-500 px-2 py-0.5 rounded text-gray-200">
          XP {hero.xp ?? 0}
        </span>
      </div>

      {/* Core stats */}
      <div className="grid grid-cols-6 gap-1 text-center">
        {[
          ['Str', s.Strength],
          ['Agi', s.Agility],
          ['Cun', s.Cunning],
          ['Spi', s.Spirit],
          ['Lor', s.Lore],
          ['Lck', s.Luck],
        ].map(([abbr, val]) => (
          <div key={abbr} className="bg-gray-700 rounded p-1">
            <div className="text-[10px] text-gray-400">{abbr}</div>
            <div className="text-sm font-bold text-white">{val ?? '—'}</div>
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          ['Init', s.Initiative],
          ['Cbt',  s.Combat],
          ['Move', s.Move],
        ].map(([label, val]) => (
          <span key={label} className="bg-gray-700 border border-gray-600 px-2 py-0.5 rounded text-gray-200">
            {label}: <strong>{val ?? '—'}</strong>
          </span>
        ))}
      </div>

      {/* Posse-affecting conditions */}
      {posseConditions.length > 0 && (
        <div className="border border-orange-500 bg-orange-950/40 rounded p-2 space-y-1">
          <div className="text-xs font-bold text-orange-400 uppercase tracking-wide">Affects Whole Posse</div>
          {posseConditions.map((c, i) => (
            <div key={i} className="text-xs text-orange-200">
              <span className="font-semibold">{c.name}:</span> {c.effect}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Depth track ───────────────────────────────────────────────────────────────
function DepthTrack({ state }) {
  const spaces = Array.from({ length: state.trackLength + 1 }, (_, i) => i);
  const threshold = getHBtDThreshold(state.depth);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-gray-300 text-sm">Depth <strong className="text-white">{state.depth}</strong></span>
        <span className="text-gray-300 text-sm">Darkness <strong className="text-white">{state.darkness}</strong></span>
        <span className="bg-amber-900/60 border border-amber-500 px-2 py-0.5 rounded text-amber-200 text-xs">
          HBtD {threshold}+
        </span>
        <span className="text-gray-500 text-xs">Turn {state.turn}</span>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-1 py-2 min-w-max">
          {spaces.map(i => {
            const isParty    = i === state.depth;
            const isDark     = i === state.darkness;
            const isGD       = state.growingDreadSpaces.includes(i);
            const isBS       = state.bloodSpatterSpaces.includes(i);
            const consumed   = i > state.darkness;

            let bg = 'bg-gray-700';
            if (consumed) bg = 'bg-gray-900';
            else if (isGD) bg = 'bg-purple-900 border-purple-600';
            else if (isBS) bg = 'bg-red-900 border-red-700';

            return (
              <div key={i} className={`relative flex items-center justify-center w-8 h-10 rounded border border-gray-600 text-[10px] font-mono shrink-0 ${bg}`}>
                <span className={consumed ? 'text-gray-700' : 'text-gray-400'}>{i}</span>
                {isParty && (
                  <div className="absolute -top-2 w-5 h-5 rounded-full bg-blue-500 border-2 border-blue-300 flex items-center justify-center text-white text-[9px] font-bold shadow-lg">P</div>
                )}
                {isDark && (
                  <div className="absolute -bottom-2 w-5 h-5 rounded-full bg-red-600 border-2 border-red-400 flex items-center justify-center text-white text-[9px] font-bold shadow-lg">D</div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-gray-600 px-1 mt-1">
          <span>← Entrance</span>
          <span>Deep →</span>
        </div>
      </div>

      {/* Last roll */}
      {state.lastRoll && (() => {
        const lr = state.lastRoll;
        const age = Date.now() - (lr.timestamp || 0);
        if (age > 120000) return null;
        const cls = lr.isDoubles ? 'border-purple-500 text-purple-200 bg-purple-950/40'
          : lr.success ? 'border-green-600 text-green-200 bg-green-950/40'
          : 'border-red-600 text-red-200 bg-red-950/40';
        return (
          <div className={`rounded border px-3 py-2 text-sm ${cls}`}>
            <span className="font-bold">{lr.rolledBy}</span> rolled [{lr.die1}+{lr.die2}]={lr.roll} vs {lr.threshold}+
            {' — '}
            {lr.isDoubles ? `DOUBLES — Depth Event: ${lr.depthEvent?.name ?? '?'}` : lr.success ? 'Held!' : 'Darkness advances!'}
          </div>
        );
      })()}
    </div>
  );
}

// ── Main display ──────────────────────────────────────────────────────────────
export default function DisplayScreen() {
  const adventure = useAdventure();
  const { posse } = usePosse();
  const { world } = useWorld();

  const state = adventure?.state;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700 pb-3">
        <h1 className="text-2xl font-bold text-amber-400 tracking-wide">
          Shadows of Brimstone
        </h1>
        <span className="text-gray-400 text-sm">{world}</span>
      </div>

      {/* Adventure track */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
        {state?.active ? (
          <DepthTrack state={state} />
        ) : (
          <p className="text-gray-500 text-center py-4 text-sm">No adventure active</p>
        )}
      </div>

      {/* Posse */}
      {posse.length === 0 ? (
        <p className="text-gray-600 text-center">No heroes in posse</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posse.map(hero => (
            <HeroCard key={hero.id || hero.localId} hero={hero} />
          ))}
        </div>
      )}
    </div>
  );
}
