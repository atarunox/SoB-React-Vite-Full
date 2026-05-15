// src/components/LevelUpModal.jsx
import React, { useState } from 'react';
import getLevelingChart from '../data/getLevelingChart';

function rollD6() {
  return Math.floor(Math.random() * 6) + 1;
}

export default function LevelUpModal({ hero, updateHero, onClose, onGoToUpgrades }) {
  const heroClass = hero?.heroClass || hero?.class || '';
  const newLevel = Number(hero?.level ?? 1) + 1;

  const [step, setStep] = useState(1);
  const [rolled, setRolled] = useState(false);
  const [rolledValues, setRolledValues] = useState({});

  // Pre-compute for Step 1 preview
  const currentHealth = Number(hero?.currentHealth ?? 0);
  const maxHealth = Number(hero?.maxHealth ?? hero?.stats?.Health ?? 10);
  const currentSanity = Number(hero?.currentSanity ?? 0);
  const maxSanity = Number(hero?.maxSanity ?? hero?.stats?.Sanity ?? 10);
  const currentGrit = Number(hero?.stats?.Grit ?? hero?.maxGrit ?? hero?.Grit ?? 2);
  const newGrit = currentGrit + 1;

  // Leveling chart data
  const chart = getLevelingChart(heroClass);
  const entry =
    typeof chart === 'object' && !Array.isArray(chart) ? chart[newLevel] : null;

  const hasRealData =
    entry != null &&
    (entry.effects || entry.extraRoll || entry.name || entry.description || entry.bonus);

  // Step 1: Apply base level-up effects
  const handleApplyBase = () => {
    const patch = {
      level: newLevel,
      currentHealth: maxHealth,
      currentSanity: maxSanity,
      maxGrit: newGrit,
      stats: { ...(hero?.stats || {}), Grit: newGrit },
    };
    updateHero(patch);
    setStep(2);
  };

  // Step 2: Roll the random bonus
  const handleRoll = () => {
    if (!hasRealData || rolled) return;
    const values = {};
    if (entry.effects) {
      for (const [key, value] of Object.entries(entry.effects)) {
        values[key] = value === 'D6' ? rollD6() : value;
      }
    }
    if (entry.extraRoll) {
      values[`__extraRoll_${entry.extraRoll.stat}`] = rollD6();
    }
    setRolledValues(values);
    setRolled(true);
  };

  // Step 2: Apply the rolled bonus
  const handleApplyBonus = () => {
    if (!rolled) return;
    const newStats = { ...(hero?.stats || {}) };
    const bonusRecord = {};

    if (entry.effects) {
      for (const [key, value] of Object.entries(entry.effects)) {
        const amt = rolledValues[key] ?? (value === 'D6' ? 0 : value);
        if (typeof amt === 'number') {
          newStats[key] = (Number(newStats[key]) || 0) + amt;
        }
        bonusRecord[key] = amt;
      }
    }

    if (entry.extraRoll) {
      const stat = entry.extraRoll.stat;
      const roll = rolledValues[`__extraRoll_${stat}`] ?? 0;
      newStats[stat] = (Number(newStats[stat]) || 0) + roll;
      bonusRecord[`Rolled ${stat}`] = roll;
    }

    const existingBonuses = hero?.levelBonuses || {};
    const existingTrack = hero?.levelTrack || {};

    updateHero({
      stats: newStats,
      levelBonuses: { ...existingBonuses, [newLevel]: bonusRecord },
      levelTrack: { ...existingTrack, [newLevel]: true },
    });

    setStep(3);
  };

  const handleSkipBonus = () => {
    setStep(3);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#1e1a14] border border-[#8b6b46] rounded-2xl shadow-2xl overflow-hidden">
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 px-4 pt-4 pb-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  step === s
                    ? 'bg-amber-500 border-amber-300 text-[#1e1a14]'
                    : step > s
                    ? 'bg-emerald-700 border-emerald-500 text-white'
                    : 'bg-[#2a2218] border-[#8b6b46] text-amber-400/60'
                }`}
              >
                {step > s ? '✓' : s}
              </div>
              {s < 3 && (
                <div
                  className={`h-0.5 w-8 ${step > s ? 'bg-emerald-600' : 'bg-[#8b6b46]/40'}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="px-6 pb-6 pt-2 max-h-[80vh] overflow-y-auto">
          {/* ── Step 1: Preview ── */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <div className="text-3xl mb-1">🎉</div>
                <h2 className="text-xl font-bold text-amber-200">Advancing to Level {newLevel}!</h2>
                <p className="text-amber-100/70 text-sm mt-1">{hero?.name || 'Hero'} is leveling up</p>
              </div>

              <div className="bg-[#2a2218] rounded-xl border border-[#8b6b46]/50 p-4 flex flex-col gap-3">
                <div className="text-amber-300 font-semibold text-sm uppercase tracking-wider mb-1">
                  What will happen:
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-100/80">Full Health restored</span>
                  <span className="text-emerald-400 font-bold tabular-nums">
                    {currentHealth} / {maxHealth} → {maxHealth} / {maxHealth}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-100/80">Full Sanity restored</span>
                  <span className="text-indigo-400 font-bold tabular-nums">
                    {currentSanity} / {maxSanity} → {maxSanity} / {maxSanity}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-100/80">+1 Max Grit</span>
                  <span className="text-amber-400 font-bold tabular-nums">
                    {currentGrit} → {newGrit}
                  </span>
                </div>
              </div>

              <button
                className="btn btn-warning w-full text-base font-bold py-3"
                onClick={handleApplyBase}
              >
                Apply &amp; Continue →
              </button>
            </div>
          )}

          {/* ── Step 2: Random Bonus ── */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <h2 className="text-xl font-bold text-amber-200">Random Bonus</h2>
                <p className="text-amber-100/70 text-sm mt-1">Level {newLevel} bonus for {heroClass || 'your hero'}</p>
              </div>

              {!hasRealData ? (
                <div className="bg-[#2a2218] rounded-xl border border-[#8b6b46]/50 p-4 text-amber-100/80 text-sm text-center italic">
                  No random bonus chart data for this class yet. Check the Upgrade tab for your level upgrade.
                </div>
              ) : (
                <div className="bg-[#2a2218] rounded-xl border border-[#8b6b46]/50 p-4 flex flex-col gap-3">
                  {entry.name && (
                    <div className="text-amber-300 font-bold text-base">{entry.name}</div>
                  )}
                  {entry.description && (
                    <div className="text-amber-100/80 text-sm italic">{entry.description}</div>
                  )}
                  {entry.bonus && (
                    <div className="text-amber-100/80 text-sm">{entry.bonus}</div>
                  )}

                  {entry.effects && (
                    <div className="flex flex-col gap-1.5 mt-1">
                      {Object.entries(entry.effects).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <span className="text-amber-100/80">+ {key}</span>
                          <span className="text-emerald-400 font-bold tabular-nums">
                            {value === 'D6'
                              ? rolled
                                ? `+${rolledValues[key] ?? '?'} (rolled)`
                                : '+D6'
                              : `+${value}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {entry.extraRoll && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-amber-100/80">+ {entry.extraRoll.stat} (extra roll)</span>
                      <span className="text-emerald-400 font-bold tabular-nums">
                        {rolled
                          ? `+${rolledValues[`__extraRoll_${entry.extraRoll.stat}`] ?? '?'} (rolled)`
                          : `+D6`}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2">
                {hasRealData && (entry.effects || entry.extraRoll) && (
                  <>
                    <button
                      className="btn btn-warning w-full font-bold py-2.5"
                      onClick={handleRoll}
                      disabled={rolled}
                    >
                      {rolled ? 'Rolled!' : '🎲 Roll Bonus'}
                    </button>
                    <button
                      className="btn w-full font-bold py-2.5"
                      onClick={handleApplyBonus}
                      disabled={!rolled}
                    >
                      Apply Bonus →
                    </button>
                  </>
                )}

                {(!hasRealData || (!entry.effects && !entry.extraRoll)) && (
                  <button
                    className="btn w-full font-bold py-2.5"
                    onClick={handleSkipBonus}
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Step 3: Done ── */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <div className="text-3xl mb-1">✅</div>
                <h2 className="text-xl font-bold text-emerald-300">
                  Level up complete!
                </h2>
                <p className="text-amber-100/80 text-sm mt-1">
                  You are now <strong className="text-amber-200">Level {newLevel}</strong>.
                </p>
              </div>

              <div className="bg-[#2a2218] rounded-xl border border-[#8b6b46]/50 p-4 text-sm text-amber-100/80 text-center">
                Head to the <strong className="text-amber-200">Upgrade tab</strong> to choose your new skill upgrade from the skill tree.
              </div>

              <div className="flex flex-col gap-2">
                <button
                  className="btn btn-warning w-full font-bold py-2.5"
                  onClick={() => {
                    onGoToUpgrades?.();
                    onClose?.();
                  }}
                >
                  Go to Upgrades
                </button>
                <button
                  className="btn w-full py-2.5"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
