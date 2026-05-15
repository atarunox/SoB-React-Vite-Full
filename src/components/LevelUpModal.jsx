import React, { useState, useMemo } from 'react';
import getLevelingChart from '../data/getLevelingChart';
import { calculateCurrentStats } from '../utils/calculateStats';

// ── Dice helpers ─────────────────────────────────────────────────────────────
function rollD6() { return Math.floor(Math.random() * 6) + 1; }
function roll2D6() { return [rollD6(), rollD6()]; }

// ── Bonus string parser ───────────────────────────────────────────────────────
// Converts strings like "+D6 Health and +3 Sanity" or "+1 Strength or +1 Initiative"
// into structured component objects.
function parseBonusStr(str) {
  if (!str) return [];
  const s = str.trim();

  // "or" choice: "+1 Strength or +1 Initiative"
  if (/ or /i.test(s)) {
    const parts = s.split(/ or /i);
    const options = parts.map(p => parseSingle(p.trim())).filter(Boolean);
    if (options.length >= 2) return [{ type: 'choice', options, key: s }];
  }

  // "and" — multiple components: "+D6 Health and +3 Sanity"
  if (/ and /i.test(s)) {
    return s.split(/ and /i).flatMap(p => parseBonusStr(p.trim()));
  }

  // D6 split: "+D6 Health/Sanity (any mix)"
  const splitM = s.match(/[+]?D6\s+([A-Za-z]+)\/([A-Za-z]+)/i);
  if (splitM) {
    return [{ type: 'd6split', stats: [splitM[1], splitM[2]], key: s }];
  }

  const single = parseSingle(s);
  return single ? [single] : [{ type: 'narrative', text: s }];
}

function parseSingle(str) {
  str = str.trim();
  const d6m = str.match(/[+]?D6\s+([A-Za-z][\w\s]*)/i);
  if (d6m) return { type: 'd6', stat: d6m[1].trim(), key: str };
  const fixm = str.match(/[+]?(\d+)\s+([A-Za-z][\w\s]*)/i);
  if (fixm) return { type: 'fixed', stat: fixm[2].trim(), amount: Number(fixm[1]), key: str };
  return null;
}

// ── Stat helpers ─────────────────────────────────────────────────────────────
const SKILL_STATS = new Set(['Strength', 'Agility', 'Cunning', 'Spirit', 'Lore', 'Luck']);
const CAPPED_AT_6 = new Set([...SKILL_STATS, 'Initiative', 'Combat']);

function getCurrentVal(stat, calcedStats, hero) {
  if (stat === 'Health') return Number(hero?.maxHealth ?? 10);
  if (stat === 'Sanity') return Number(hero?.maxSanity ?? 10);
  if (stat === 'Grit') return Number(calcedStats?.Grit ?? hero?.stats?.Grit ?? 2);
  return Number(calcedStats?.[stat] ?? hero?.stats?.[stat] ?? 0);
}

function applyComponent(comp, value, newStats, heroPatch, hero) {
  // value is the resolved amount
  if (comp.stat === 'Health' || comp.stat === 'Sanity') {
    const key = comp.stat === 'Health' ? 'maxHealth' : 'maxSanity';
    heroPatch[key] = (heroPatch[key] ?? Number(hero?.[key] ?? 10)) + value;
  } else if (comp.stat === 'Grit') {
    newStats.Grit = (Number(newStats.Grit) || 0) + value;
    heroPatch.maxGrit = (heroPatch.maxGrit ?? Number(hero?.maxGrit ?? 2)) + value;
  } else if (comp.stat && value) {
    newStats[comp.stat] = (Number(newStats[comp.stat]) || 0) + value;
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────
function DiceDisplay({ dice, label, reroll }) {
  return (
    <div className={`flex items-center gap-2 ${reroll ? 'opacity-50 line-through' : ''}`}>
      {label && <span className="text-xs text-amber-100/60">{label}</span>}
      {dice.map((d, i) => (
        <div
          key={i}
          className="w-9 h-9 rounded-lg border-2 border-[#8b6b46] bg-[#2a2218] flex items-center justify-center text-amber-200 font-bold text-base"
        >
          {d}
        </div>
      ))}
      <span className="text-amber-200 font-bold">= {dice[0] + dice[1]}</span>
      {reroll && <span className="text-xs text-amber-100/40 ml-1">already taken</span>}
    </div>
  );
}

function ChoiceComp({ comp, value, onChange, calcedStats, hero }) {
  return (
    <div className="bg-[#1a1510] rounded-lg border border-[#8b6b46]/30 p-3 flex flex-col gap-2">
      <div className="text-xs text-amber-300/70 uppercase tracking-wide font-semibold">Choose one:</div>
      <div className="flex flex-col gap-1.5">
        {comp.options.map((opt) => {
          const cur = getCurrentVal(opt.stat, calcedStats, hero);
          const capped = CAPPED_AT_6.has(opt.stat) && cur >= 6;
          const selected = value === opt.stat;
          return (
            <button
              key={opt.key ?? opt.stat}
              onClick={() => !capped && onChange(opt.stat)}
              className={`flex items-center justify-between rounded-lg px-3 py-2 border text-sm transition-colors ${
                selected
                  ? 'bg-amber-600/30 border-amber-500 text-amber-100'
                  : capped
                  ? 'bg-red-950/30 border-red-800/40 text-red-400/60 cursor-not-allowed'
                  : 'bg-[#2a2218] border-[#8b6b46]/40 text-amber-100/80 hover:bg-amber-900/20 hover:border-amber-600/60'
              }`}
            >
              <span className="font-semibold">+{opt.amount} {opt.stat}</span>
              <span className={`text-xs tabular-nums ${capped ? 'text-red-400' : 'text-amber-100/50'}`}>
                {capped ? `${cur} / 6 MAX` : `currently ${cur}${CAPPED_AT_6.has(opt.stat) ? ` / 6 max` : ''}`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function D6Comp({ comp, value, onChange }) {
  const [manual, setManual] = useState('');
  const autoRoll = () => {
    const r = rollD6();
    setManual(String(r));
    onChange(r);
  };
  const handleInput = (e) => {
    const v = e.target.value;
    setManual(v);
    const n = Number(v);
    if (n >= 1 && n <= 6) onChange(n);
  };
  return (
    <div className="bg-[#1a1510] rounded-lg border border-[#8b6b46]/30 p-3 flex flex-col gap-2">
      <div className="text-xs text-amber-300/70 uppercase tracking-wide font-semibold">
        Roll D6 → add to max {comp.stat}
      </div>
      <div className="flex items-center gap-2">
        <button
          className="btn btn-sm btn-warning flex-1"
          onClick={autoRoll}
        >
          🎲 Auto Roll
        </button>
        <input
          type="number"
          min={1}
          max={6}
          value={manual}
          onChange={handleInput}
          placeholder="or enter 1-6"
          className="w-28 text-center text-sm px-2 py-1.5 rounded-lg border border-[#8b6b46]/50 bg-[#2a2218] text-amber-100 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
        />
        {value != null && (
          <span className="text-emerald-400 font-bold text-lg tabular-nums">+{value}</span>
        )}
      </div>
    </div>
  );
}

function D6SplitComp({ comp, totalValue, onRollTotal, splitValues, onSplitChange }) {
  const [manual, setManual] = useState('');
  const [a, b] = comp.stats;
  const aVal = splitValues?.[a] ?? 0;
  const bVal = splitValues?.[b] ?? 0;

  const autoRoll = () => {
    const r = rollD6();
    setManual(String(r));
    onRollTotal(r);
  };
  const handleInput = (e) => {
    const v = e.target.value;
    setManual(v);
    const n = Number(v);
    if (n >= 1 && n <= 6) onRollTotal(n);
  };

  return (
    <div className="bg-[#1a1510] rounded-lg border border-[#8b6b46]/30 p-3 flex flex-col gap-2">
      <div className="text-xs text-amber-300/70 uppercase tracking-wide font-semibold">
        Roll D6 → distribute between max {a} / max {b}
      </div>
      <div className="flex items-center gap-2">
        <button className="btn btn-sm btn-warning flex-1" onClick={autoRoll}>
          🎲 Auto Roll
        </button>
        <input
          type="number"
          min={1}
          max={6}
          value={manual}
          onChange={handleInput}
          placeholder="or 1-6"
          className="w-24 text-center text-sm px-2 py-1.5 rounded-lg border border-[#8b6b46]/50 bg-[#2a2218] text-amber-100 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
        />
        {totalValue != null && (
          <span className="text-emerald-400 font-bold tabular-nums">Total: {totalValue}</span>
        )}
      </div>
      {totalValue != null && (
        <div className="flex items-center gap-3 mt-1">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-xs text-amber-100/60">+{a}</label>
            <input
              type="number"
              min={0}
              max={totalValue}
              value={aVal}
              onChange={(e) => {
                const v = Math.min(Math.max(0, Number(e.target.value)), totalValue);
                onSplitChange({ [a]: v, [b]: totalValue - v });
              }}
              className="w-full text-center text-sm px-2 py-1 rounded-lg border border-[#8b6b46]/50 bg-[#2a2218] text-amber-100 focus:outline-none"
            />
          </div>
          <span className="text-amber-400 font-bold mt-4">+</span>
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-xs text-amber-100/60">+{b}</label>
            <input
              type="number"
              min={0}
              max={totalValue}
              value={bVal}
              onChange={(e) => {
                const v = Math.min(Math.max(0, Number(e.target.value)), totalValue);
                onSplitChange({ [a]: totalValue - v, [b]: v });
              }}
              className="w-full text-center text-sm px-2 py-1 rounded-lg border border-[#8b6b46]/50 bg-[#2a2218] text-amber-100 focus:outline-none"
            />
          </div>
          <span className="text-xs text-amber-100/40 mt-4">/ {totalValue}</span>
        </div>
      )}
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function LevelUpModal({ hero, updateHero, onClose, onGoToUpgrades }) {
  const heroClass = hero?.heroClass || hero?.class || '';
  const newLevel  = Number(hero?.level ?? 1) + 1;

  const [step, setStep]               = useState(1);
  const [rollHistory, setRollHistory] = useState([]);   // [{dice:[d1,d2], taken:bool}]
  const [chartKey, setChartKey]       = useState(null); // final 2d6 key
  const [resolutions, setResolutions] = useState({});   // keyed by component key

  // Calculated stats (includes gear bonuses) for displaying current values
  const calcedStats = useMemo(
    () => hero ? calculateCurrentStats(hero) : {},
    [hero]
  );

  // Step 1 preview values
  const currentHealth = Number(hero?.currentHealth ?? 0);
  const maxHealth     = Number(hero?.maxHealth ?? hero?.stats?.Health ?? 10);
  const currentSanity = Number(hero?.currentSanity ?? 0);
  const maxSanity     = Number(hero?.maxSanity ?? hero?.stats?.Sanity ?? 10);
  const currentGrit   = Number(hero?.stats?.Grit ?? hero?.maxGrit ?? hero?.Grit ?? 2);
  const newGrit       = currentGrit + 1;

  // Chart data
  const chart         = getLevelingChart(heroClass);
  const isRealChart   = typeof chart === 'object' && !Array.isArray(chart);
  const levelTrack    = hero?.levelTrack || {};

  // Parse the landed entry into interactive components
  const entry         = isRealChart && chartKey != null ? chart[chartKey] : null;
  const bonusComps    = useMemo(() => parseBonusStr(entry?.bonus), [entry?.bonus]);
  const extraComps    = useMemo(() => parseBonusStr(entry?.extra),  [entry?.extra]);
  const allComps      = [...bonusComps, ...extraComps];

  // Structured effects format (legacy/alternate chart style)
  const hasEffects    = entry?.effects || entry?.extraRoll;

  // Determine if all required inputs are resolved
  const isFullyResolved = useMemo(() => {
    if (!entry) return true;
    for (const comp of allComps) {
      const k = comp.key;
      if (comp.type === 'choice' && resolutions[k] == null) return false;
      if (comp.type === 'd6'     && resolutions[k] == null) return false;
      if (comp.type === 'd6split') {
        if (resolutions[`${k}__total`] == null) return false;
        const [a, b] = comp.stats;
        if (resolutions[`${k}__split`]?.[a] == null) return false;
      }
    }
    return true;
  }, [allComps, resolutions, entry]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleApplyBase = () => {
    updateHero({
      level:         newLevel,
      currentHealth: maxHealth,
      currentSanity: maxSanity,
      maxGrit:       newGrit,
      stats:         { ...(hero?.stats || {}), Grit: newGrit },
    });
    setStep(2);
  };

  const handleRoll2D6 = () => {
    const history = [];
    const allKeys = isRealChart ? Object.keys(chart).map(Number) : [];
    let key = null;

    for (let attempt = 0; attempt < 20; attempt++) {
      const dice = roll2D6();
      const total = dice[0] + dice[1];
      const taken = !!levelTrack[total];
      history.push({ dice, taken });
      if (!taken && allKeys.includes(total)) {
        key = total;
        break;
      }
    }

    setRollHistory(history);
    setChartKey(key);
    setResolutions({});
  };

  const setRes = (key, value) =>
    setResolutions(prev => ({ ...prev, [key]: value }));

  const handleApplyBonus = () => {
    if (!isFullyResolved) return;

    const newStats   = { ...(hero?.stats || {}) };
    const heroPatch  = {};
    const bonusRecord = {};

    if (hasEffects) {
      // Legacy structured format
      if (entry.effects) {
        for (const [k, v] of Object.entries(entry.effects)) {
          const amt = v === 'D6' ? (resolutions[k] ?? 0) : v;
          if (typeof amt === 'number') newStats[k] = (Number(newStats[k]) || 0) + amt;
          bonusRecord[k] = amt;
        }
      }
      if (entry.extraRoll) {
        const stat = entry.extraRoll.stat;
        const roll = resolutions[`__extraRoll_${stat}`] ?? 0;
        newStats[stat] = (Number(newStats[stat]) || 0) + roll;
        bonusRecord[`Rolled ${stat}`] = roll;
      }
    } else {
      // String-parsed components
      for (const comp of allComps) {
        const k = comp.key;
        if (comp.type === 'fixed') {
          applyComponent(comp, comp.amount, newStats, heroPatch, hero);
          bonusRecord[comp.stat] = comp.amount;
        } else if (comp.type === 'd6') {
          const amt = resolutions[k] ?? 0;
          applyComponent(comp, amt, newStats, heroPatch, hero);
          bonusRecord[`+D6 ${comp.stat}`] = amt;
        } else if (comp.type === 'choice') {
          const chosen = resolutions[k];
          const opt = comp.options.find(o => o.stat === chosen);
          if (opt) {
            applyComponent(opt, opt.amount, newStats, heroPatch, hero);
            bonusRecord[`choice:${opt.stat}`] = opt.amount;
          }
        } else if (comp.type === 'd6split') {
          const split = resolutions[`${k}__split`] || {};
          for (const stat of comp.stats) {
            const amt = split[stat] ?? 0;
            if (amt > 0) {
              const fakeComp = { stat };
              applyComponent(fakeComp, amt, newStats, heroPatch, hero);
              bonusRecord[`split:${stat}`] = amt;
            }
          }
        }
      }
    }

    updateHero({
      ...heroPatch,
      stats:        newStats,
      levelBonuses: { ...(hero?.levelBonuses || {}), [chartKey]: bonusRecord },
      levelTrack:   { ...(hero?.levelTrack   || {}), [chartKey]: true },
    });

    setStep(3);
  };

  const handleSkipBonus = () => setStep(3);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#1e1a14] border border-[#8b6b46] rounded-2xl shadow-2xl overflow-hidden">
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 px-4 pt-4 pb-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                step === s  ? 'bg-amber-500 border-amber-300 text-[#1e1a14]'
                : step > s  ? 'bg-emerald-700 border-emerald-500 text-white'
                            : 'bg-[#2a2218] border-[#8b6b46] text-amber-400/60'
              }`}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && (
                <div className={`h-0.5 w-8 ${step > s ? 'bg-emerald-600' : 'bg-[#8b6b46]/40'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="px-6 pb-6 pt-2 max-h-[80vh] overflow-y-auto themed-scrollbar">

          {/* ── Step 1: Preview & base bonuses ── */}
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

              <button className="btn btn-warning w-full text-base font-bold py-3" onClick={handleApplyBase}>
                Apply &amp; Continue →
              </button>
            </div>
          )}

          {/* ── Step 2: Roll 2D6 on the chart ── */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <h2 className="text-xl font-bold text-amber-200">Random Bonus</h2>
                <p className="text-amber-100/70 text-sm mt-1">
                  Roll 2D6 on the {heroClass || 'class'} chart
                </p>
              </div>

              {!isRealChart ? (
                <div className="bg-[#2a2218] rounded-xl border border-[#8b6b46]/50 p-4 text-amber-100/80 text-sm text-center italic">
                  No chart data for this class yet. Check the Upgrade tab.
                </div>
              ) : rollHistory.length === 0 ? (
                <button className="btn btn-warning w-full font-bold py-3" onClick={handleRoll2D6}>
                  🎲 Roll 2D6
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Roll history */}
                  <div className="bg-[#2a2218] rounded-xl border border-[#8b6b46]/50 p-3 flex flex-col gap-2">
                    {rollHistory.map((r, i) => (
                      <DiceDisplay
                        key={i}
                        dice={r.dice}
                        label={i > 0 ? 'Re-roll' : 'Roll'}
                        reroll={r.taken}
                      />
                    ))}
                  </div>

                  {/* Result entry */}
                  {chartKey == null ? (
                    <div className="text-amber-100/60 text-sm text-center italic">
                      All chart entries are used — nothing left to roll!
                    </div>
                  ) : entry ? (
                    <div className="bg-[#2a2218] rounded-xl border border-[#8b6b46]/50 p-4 flex flex-col gap-3">
                      <div className="text-amber-300/60 text-xs font-semibold uppercase tracking-wide">
                        Chart result: {chartKey}
                      </div>
                      {entry.name && (
                        <div className="text-amber-200 font-bold text-base">{entry.name}</div>
                      )}
                      {entry.description && (
                        <div className="text-amber-100/70 text-sm italic">{entry.description}</div>
                      )}

                      {/* Interactive components */}
                      {allComps.map((comp, i) => {
                        const k = comp.key;
                        if (comp.type === 'narrative') {
                          return (
                            <div key={i} className="text-sm text-amber-100/80 bg-[#1a1510] rounded-lg p-2 border border-[#8b6b46]/20">
                              {comp.text}
                            </div>
                          );
                        }
                        if (comp.type === 'fixed') {
                          return (
                            <div key={i} className="flex items-center justify-between text-sm px-1">
                              <span className="text-amber-100/80">+ {comp.stat}</span>
                              <span className="text-emerald-400 font-bold">+{comp.amount}</span>
                            </div>
                          );
                        }
                        if (comp.type === 'choice') {
                          return (
                            <ChoiceComp
                              key={i}
                              comp={comp}
                              value={resolutions[k]}
                              onChange={(v) => setRes(k, v)}
                              calcedStats={calcedStats}
                              hero={hero}
                            />
                          );
                        }
                        if (comp.type === 'd6') {
                          return (
                            <D6Comp
                              key={i}
                              comp={comp}
                              value={resolutions[k]}
                              onChange={(v) => setRes(k, v)}
                            />
                          );
                        }
                        if (comp.type === 'd6split') {
                          return (
                            <D6SplitComp
                              key={i}
                              comp={comp}
                              totalValue={resolutions[`${k}__total`]}
                              onRollTotal={(v) => {
                                setRes(`${k}__total`, v);
                                setRes(`${k}__split`, { [comp.stats[0]]: v, [comp.stats[1]]: 0 });
                              }}
                              splitValues={resolutions[`${k}__split`]}
                              onSplitChange={(s) => setRes(`${k}__split`, s)}
                            />
                          );
                        }
                        return null;
                      })}

                      {/* Legacy effects format */}
                      {hasEffects && (
                        <div className="flex flex-col gap-2">
                          {entry.effects && Object.entries(entry.effects).map(([k, v]) =>
                            v === 'D6' ? (
                              <D6Comp
                                key={k}
                                comp={{ stat: k, key: k }}
                                value={resolutions[k]}
                                onChange={(val) => setRes(k, val)}
                              />
                            ) : (
                              <div key={k} className="flex items-center justify-between text-sm px-1">
                                <span className="text-amber-100/80">+ {k}</span>
                                <span className="text-emerald-400 font-bold">+{v}</span>
                              </div>
                            )
                          )}
                          {entry.extraRoll && (
                            <D6Comp
                              comp={{ stat: entry.extraRoll.stat, key: `__extraRoll_${entry.extraRoll.stat}` }}
                              value={resolutions[`__extraRoll_${entry.extraRoll.stat}`]}
                              onChange={(val) => setRes(`__extraRoll_${entry.extraRoll.stat}`, val)}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Action buttons */}
                  <div className="flex flex-col gap-2">
                    {chartKey != null && entry && (allComps.length > 0 || hasEffects) && (
                      <button
                        className="btn btn-warning w-full font-bold py-2.5"
                        onClick={handleApplyBonus}
                        disabled={!isFullyResolved}
                      >
                        {isFullyResolved ? 'Apply Bonus →' : 'Resolve all choices first'}
                      </button>
                    )}
                    {(chartKey == null || !entry || (allComps.length === 0 && !hasEffects)) && (
                      <button className="btn w-full font-bold py-2.5" onClick={handleSkipBonus}>
                        {entry?.name ? 'Acknowledge & Continue →' : 'Next →'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {!isRealChart && (
                <button className="btn w-full font-bold py-2.5" onClick={handleSkipBonus}>
                  Next →
                </button>
              )}
            </div>
          )}

          {/* ── Step 3: Done ── */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <div className="text-3xl mb-1">✅</div>
                <h2 className="text-xl font-bold text-emerald-300">Level up complete!</h2>
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
                  onClick={() => { onGoToUpgrades?.(); onClose?.(); }}
                >
                  Go to Upgrades
                </button>
                <button className="btn w-full py-2.5" onClick={onClose}>Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
