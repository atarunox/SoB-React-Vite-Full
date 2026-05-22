import React, { useState } from 'react';
import { useBigScoreState } from '../../hooks/useBigScoreState';
import {
  BIG_SCORE_ROLES,
  BIG_SCORE_RULES,
  BIG_SCORE_COMPLICATIONS,
} from '../../data/missionModifiers/bigScore';

// ── helpers ────────────────────────────────────────────────────────────────────

function roleById(id) {
  return BIG_SCORE_ROLES.find(r => r.id === id) || null;
}

function rollD6() {
  return Math.floor(Math.random() * 6) + 1;
}

// ── sub-components ─────────────────────────────────────────────────────────────

function RoleCard({ role, compact = false }) {
  const [open, setOpen] = useState(!compact);
  return (
    <div className="rounded border border-[#8b6b46]/40 bg-white/70 p-2 text-sm">
      <button
        className="w-full text-left font-semibold text-[#3b2f1d] flex justify-between items-center"
        onClick={() => setOpen(o => !o)}
      >
        <span>{role.name}</span>
        <span className="text-xs text-[#8b6b46]">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <p className="mt-1 text-xs text-[#5c3a1e] leading-relaxed">{role.effect}</p>
      )}
    </div>
  );
}

// ── phase: idle ────────────────────────────────────────────────────────────────

function IdlePhase({ state, toggleActive, drawRoles, posse }) {
  if (!state.active) {
    return (
      <div className="space-y-3">
        <div className="rounded border border-[#8b6b46]/30 bg-white/60 p-3 text-sm text-[#3b2f1d] space-y-1">
          <p className="font-semibold">How it works:</p>
          <p>{BIG_SCORE_RULES.bigScoreEncounters}</p>
          <p>{BIG_SCORE_RULES.bigScoreRoles}</p>
          <p>{BIG_SCORE_RULES.scoreTokens}</p>
        </div>
        <button
          className="w-full py-2 rounded bg-amber-700 hover:bg-amber-800 text-amber-100 font-bold text-sm transition-colors"
          onClick={toggleActive}
        >
          Activate for Next Adventure
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded border border-amber-600/60 bg-amber-50/80 p-3 text-sm text-amber-900 font-semibold">
        Big Score is ON — ready for next adventure
      </div>

      <details className="rounded border border-[#8b6b46]/40 bg-white/60">
        <summary className="cursor-pointer px-3 py-2 font-semibold text-sm text-[#3b2f1d] select-none">
          All Roles ({BIG_SCORE_ROLES.length})
        </summary>
        <div className="px-3 pb-3 space-y-2 mt-1">
          {BIG_SCORE_ROLES.map(r => <RoleCard key={r.id} role={r} compact />)}
        </div>
      </details>

      <button
        className="w-full py-2 rounded bg-amber-700 hover:bg-amber-800 text-amber-100 font-bold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={posse.length === 0}
        onClick={() => drawRoles(posse.length + 1, BIG_SCORE_ROLES)}
      >
        {posse.length === 0 ? 'Start Role Draft (add heroes first)' : `Start Role Draft (draw ${posse.length + 1} roles)`}
      </button>
    </div>
  );
}

// ── phase: setup ───────────────────────────────────────────────────────────────

function SetupPhase({ state, assignRole, beginAdventure, posse }) {
  const drawnRoles = state.drawnRoleIds.map(id => roleById(id)).filter(Boolean);

  // All posse heroes must have a role to begin adventure
  const assignedHeroIds = new Set(Object.keys(state.assignedRoles));
  const allAssigned = posse.length > 0 && posse.every(h => assignedHeroIds.has(h.id));

  // Which role IDs are already taken
  const takenRoleIds = new Set(Object.values(state.assignedRoles));

  return (
    <div className="space-y-3">
      <p className="text-xs text-[#5c3a1e] italic">
        Each hero picks one role in Initiative order (highest first). The remaining role is discarded.
      </p>

      <div className="space-y-2">
        {drawnRoles.map(role => {
          const assignedHero = posse.find(h => state.assignedRoles[h.id] === role.id);
          const isTaken = takenRoleIds.has(role.id);

          return (
            <div
              key={role.id}
              className={`rounded border p-2 text-sm space-y-1 ${
                isTaken
                  ? 'border-amber-600/60 bg-amber-50/60'
                  : 'border-[#8b6b46]/40 bg-white/70'
              }`}
            >
              <div className="font-semibold text-[#3b2f1d] flex justify-between">
                <span>{role.name}</span>
                {assignedHero && (
                  <span className="text-xs text-amber-700 font-normal">
                    → {assignedHero.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#5c3a1e] leading-relaxed">{role.effect}</p>

              {/* Assign dropdown */}
              <div className="pt-1">
                <select
                  className="w-full text-xs rounded border border-[#8b6b46]/40 bg-white px-2 py-1 text-[#3b2f1d]"
                  value={assignedHero?.id || ''}
                  onChange={e => {
                    const heroId = e.target.value;
                    if (heroId) assignRole(heroId, role.id);
                  }}
                >
                  <option value="">-- Assign to hero --</option>
                  {posse.map(h => {
                    const heroCurrentRole = state.assignedRoles[h.id];
                    const heroTakenDifferentRole = heroCurrentRole && heroCurrentRole !== role.id;
                    return (
                      <option
                        key={h.id}
                        value={h.id}
                        disabled={heroTakenDifferentRole}
                      >
                        {h.name}{heroTakenDifferentRole ? ' (has role)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {!allAssigned && posse.length > 0 && (
        <p className="text-xs text-amber-800 italic">
          Assign a role to every hero ({posse.filter(h => assignedHeroIds.has(h.id)).length}/{posse.length} assigned)
        </p>
      )}

      <button
        className="w-full py-2 rounded bg-amber-700 hover:bg-amber-800 text-amber-100 font-bold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={!allAssigned}
        onClick={beginAdventure}
      >
        Begin Adventure
      </button>
    </div>
  );
}

// ── phase: adventure ───────────────────────────────────────────────────────────

function AdventurePhase({
  state,
  posse,
  adjustTokens,
  addComplication,
  removeComplication,
  useInsideJobCancel,
  useGetawayReroll,
  beginCashout,
}) {
  const [complicationMsg, setComplicationMsg] = useState(null);

  const totalTokens = posse.reduce((sum, h) => sum + (state.scoreTokens[h.id] ?? 0), 0);

  // Check if getaway hero is assigned
  const getawayHeroId = Object.entries(state.assignedRoles).find(([, rid]) => rid === 'the_getaway')?.[0];

  const handleRollComplication = () => {
    const activeRolls = new Set(state.activeComplications.map(c => c.roll));
    let roll = rollD6();
    let rerolled = false;
    if (activeRolls.has(roll) && state.getawayRerollUsed === false && getawayHeroId) {
      // Offer getaway reroll — just auto-reroll here and flag
      rerolled = true;
      roll = rollD6();
      useGetawayReroll();
    } else if (activeRolls.has(roll)) {
      // Re-roll once automatically
      rerolled = true;
      roll = rollD6();
    }

    const complication = BIG_SCORE_COMPLICATIONS.find(c => c.roll === roll);
    if (!complication) return;

    const alreadyActive = activeRolls.has(roll);
    if (!alreadyActive) {
      addComplication(complication);
      setComplicationMsg({
        roll,
        name: complication.name,
        rerolled,
        alreadyActive: false,
      });
    } else {
      setComplicationMsg({
        roll,
        name: complication.name,
        rerolled,
        alreadyActive: true,
      });
    }

    setTimeout(() => setComplicationMsg(null), 4000);
  };

  return (
    <div className="space-y-4">

      {/* Assigned Roles */}
      <div>
        <div className="font-semibold text-sm text-[#3b2f1d] mb-1">Assigned Roles</div>
        <div className="space-y-1">
          {posse.map(h => {
            const roleId = state.assignedRoles[h.id];
            const role = roleId ? roleById(roleId) : null;
            return (
              <details key={h.id} className="rounded border border-[#8b6b46]/30 bg-white/60 text-sm">
                <summary className="cursor-pointer px-2 py-1 font-medium text-[#3b2f1d] select-none flex gap-1">
                  <span>{h.name}</span>
                  {role && <span className="text-amber-700">— {role.name}</span>}
                </summary>
                {role && (
                  <p className="px-2 pb-2 text-xs text-[#5c3a1e] leading-relaxed">{role.effect}</p>
                )}
              </details>
            );
          })}
        </div>
      </div>

      {/* Score Tokens */}
      <div>
        <div className="font-semibold text-sm text-[#3b2f1d] mb-1">
          Score Tokens — Total: {totalTokens}
        </div>
        <div className="space-y-1">
          {posse.map(h => {
            const tokens = state.scoreTokens[h.id] ?? 0;
            return (
              <div key={h.id} className="flex items-center gap-2 rounded border border-[#8b6b46]/30 bg-white/60 px-2 py-1">
                <span className="flex-1 text-sm font-medium text-[#3b2f1d]">{h.name}</span>
                <button
                  className="w-7 h-7 rounded bg-[#3d2c1a] text-amber-200 font-bold text-sm hover:bg-[#5c3a1e] transition-colors"
                  onClick={() => adjustTokens(h.id, -1)}
                  disabled={tokens === 0}
                >
                  −
                </button>
                <span className="w-6 text-center font-bold text-[#3b2f1d]">{tokens}</span>
                <button
                  className="w-7 h-7 rounded bg-amber-700 text-amber-100 font-bold text-sm hover:bg-amber-800 transition-colors"
                  onClick={() => adjustTokens(h.id, 1)}
                >
                  +
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Complications */}
      <div>
        <div className="font-semibold text-sm text-[#3b2f1d] mb-1">Complications</div>

        <button
          className="w-full py-1.5 rounded bg-red-800 hover:bg-red-900 text-red-100 font-semibold text-sm transition-colors mb-2"
          onClick={handleRollComplication}
        >
          Find Clue — Roll Complication (D6)
        </button>

        {complicationMsg && (
          <div className={`rounded border px-3 py-2 text-xs mb-2 ${
            complicationMsg.alreadyActive
              ? 'border-red-500/60 bg-red-50 text-red-800'
              : 'border-green-600/60 bg-green-50 text-green-900'
          }`}>
            <span className="font-semibold">Rolled {complicationMsg.roll}: {complicationMsg.name}</span>
            {complicationMsg.rerolled && <span className="ml-1 italic">(re-rolled)</span>}
            {complicationMsg.alreadyActive && <span className="ml-1 italic">— already active, no new complication</span>}
          </div>
        )}

        {state.activeComplications.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No active complications</p>
        ) : (
          <div className="space-y-1">
            {state.activeComplications.map(c => (
              <div key={c.roll} className="flex items-start gap-2 rounded border border-red-400/40 bg-red-50/60 px-2 py-1 text-xs">
                <div className="flex-1">
                  <span className="font-semibold text-red-900">{c.roll}: {c.name}</span>
                  <p className="text-red-800 leading-relaxed">{c.effect}</p>
                </div>
                <button
                  className="shrink-0 w-5 h-5 rounded-full bg-red-700 text-white text-xs font-bold hover:bg-red-900 transition-colors"
                  onClick={() => removeComplication(c.roll)}
                  title="Remove complication"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Inside Job Cancel */}
        {getawayHeroId && (
          <div className="mt-2 rounded border border-[#8b6b46]/30 bg-white/60 px-2 py-1 text-xs text-[#3b2f1d] flex items-center justify-between gap-2">
            <span>
              <span className="font-semibold">Inside Job Cancel</span>
              {' '}({posse.find(h => h.id === getawayHeroId)?.name} — The Getaway):
              {' '}{state.insideJobCancelUsed ? <span className="text-gray-500 italic">Used</span> : <span className="text-green-700">Available</span>}
            </span>
            {!state.insideJobCancelUsed && (
              <button
                className="shrink-0 px-2 py-0.5 rounded bg-amber-700 text-amber-100 font-semibold hover:bg-amber-800 transition-colors"
                onClick={useInsideJobCancel}
              >
                Use
              </button>
            )}
          </div>
        )}
      </div>

      {/* End Adventure */}
      <button
        className="w-full py-2 rounded bg-[#3d2c1a] hover:bg-[#5c3a1e] text-amber-200 font-bold text-sm transition-colors"
        onClick={beginCashout}
      >
        End Adventure / Cash Out
      </button>
    </div>
  );
}

// ── phase: cashout ─────────────────────────────────────────────────────────────

function CashoutPhase({ state, posse, reset }) {
  const totalTokens = posse.reduce((sum, h) => sum + (state.scoreTokens[h.id] ?? 0), 0);

  return (
    <div className="space-y-3">
      <div className="text-center font-bold text-lg text-[#3b2f1d]">Cash Out — Score Tokens</div>
      <p className="text-xs text-[#5c3a1e] italic text-center">
        Each Score Token = 1 extra Loot card (reshuffle Loot deck per Hero)
      </p>

      <div className="space-y-1">
        {posse.map(h => {
          const tokens = state.scoreTokens[h.id] ?? 0;
          return (
            <div key={h.id} className="flex items-center justify-between rounded border border-[#8b6b46]/30 bg-white/70 px-3 py-2 text-sm">
              <span className="font-medium text-[#3b2f1d]">{h.name}</span>
              <span className="text-[#5c3a1e]">
                <span className="font-bold text-amber-800">{tokens}</span> token{tokens !== 1 ? 's' : ''}
                {tokens > 0 && (
                  <span className="ml-2 text-xs text-green-800 font-semibold">
                    → {tokens} extra Loot {tokens !== 1 ? 'cards' : 'card'}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      <div className="rounded border border-amber-600/50 bg-amber-50/80 px-3 py-2 text-sm text-amber-900 text-center">
        <span className="font-bold">Total:</span> {totalTokens} Score Token{totalTokens !== 1 ? 's' : ''} across all heroes
      </div>

      <button
        className="w-full py-2 rounded bg-[#3d2c1a] hover:bg-[#5c3a1e] text-amber-200 font-bold text-sm transition-colors"
        onClick={reset}
      >
        Reset for Next Adventure
      </button>
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────────

export default function DMBigScorePanel({ posse = [] }) {
  const {
    state,
    toggleActive,
    drawRoles,
    assignRole,
    beginAdventure,
    adjustTokens,
    addComplication,
    removeComplication,
    useInsideJobCancel,
    useGetawayReroll,
    beginCashout,
    reset,
  } = useBigScoreState();

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="font-bold text-base text-[#3b2f1d]">The Next Big Score</div>
          <div className="text-xs text-[#8b6b46]">Requires Outlaw or Performer hero</div>
        </div>
        <button
          onClick={toggleActive}
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
            state.active
              ? 'bg-amber-700 text-amber-100 border-amber-600 hover:bg-amber-800'
              : 'bg-transparent text-[#5c3a1e] border-[#8b6b46]/50 hover:bg-[#f5ebd8]'
          }`}
        >
          {state.active ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="border-t border-[#8b6b46]/30 pt-3">
        {state.phase === 'idle' && (
          <IdlePhase
            state={state}
            toggleActive={toggleActive}
            drawRoles={drawRoles}
            posse={posse}
          />
        )}

        {state.phase === 'setup' && (
          <SetupPhase
            state={state}
            assignRole={assignRole}
            beginAdventure={beginAdventure}
            posse={posse}
          />
        )}

        {state.phase === 'adventure' && (
          <AdventurePhase
            state={state}
            posse={posse}
            adjustTokens={adjustTokens}
            addComplication={addComplication}
            removeComplication={removeComplication}
            useInsideJobCancel={useInsideJobCancel}
            useGetawayReroll={useGetawayReroll}
            beginCashout={beginCashout}
          />
        )}

        {state.phase === 'cashout' && (
          <CashoutPhase
            state={state}
            posse={posse}
            reset={reset}
          />
        )}
      </div>
    </div>
  );
}
