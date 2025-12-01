import React, { useState, useEffect, useMemo } from "react";
import { THREAT_DECKS } from "../../data/enemies/threatDecks";
import { TRAIT_CARDS } from "../../data/traitCards";
import { getEnemyDifficulty } from "../../utils/enemyDifficulty";
import { useCombatState } from "../../hooks/useCombatState";

// -------- utils ----------
function shuffleFY(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const WORLD_TO_THREAT_KEY = {
  "City of the Ancients": "Western",
  Mines: "Western",
  "Blasted Wastes": "Western",
  "Swamps of Jargono": "Jargono",
  "Targa Plateau": "Targa",
  Canyons: "Canyons",
  "Frontier Town": "Western",
  "Derelict Ship": "Ship",
};

const unwrap = (x) => (x && typeof x === "object" && "value" in x ? x.value : x);
const toText = (v) => {
  if (v == null) return null;
  const u = unwrap(v);
  if (u == null) return null;
  if (typeof u === "boolean") return u ? "Yes" : "No";
  return String(u);
};
const getFirst = (obj, keys) => {
  for (const k of keys) if (obj?.[k] != null) return obj[k];
};
const pickCI = (obj, names) => {
  if (!obj || typeof obj !== "object") return undefined;
  const keys = Object.keys(obj);
  const norm = (s) => String(s).toLowerCase().replace(/[\s_-]+/g, "");
  for (const want of names) {
    const target = norm(want);
    const hit = keys.find((k) => norm(k) === target);
    if (hit) return obj[hit];
  }
};
const fmtThreshold = (x) => {
  if (x == null) return null;
  const s = typeof x === "number" ? `${x}+` : String(x);
  return /\+$/.test(s) ? s : `${s}+`;
};

// Parse an attack (supports string or object) with fallbackDamage
function normalizeAttack(val, fallbackDamage) {
  const raw = unwrap(val);
  if (raw == null) return null;

  if (typeof raw === "string") {
    const s = raw;
    const toHit = (s.match(/(\d+\+)\s*(?:to[-\s]?hit)?/i) || [])[1];
    const damage =
      (s.match(/(\d+)\s*(?:dmg|damage)/i) || [])[1] ??
      (fallbackDamage != null ? String(fallbackDamage) : null);
    const range = (s.match(/(\d+)\s*(?:range|rng)/i) || [])[1] || null;
    return { toHit, damage, range, notes: undefined };
  }

  if (typeof raw === "object") {
    const toHit = unwrap(pickCI(raw, ["toHit", "to-hit", "to hit", "to_hit", "tohit", "threshold"]));
    let damage = unwrap(pickCI(raw, ["damage", "dmg"]));
    if (damage == null && fallbackDamage != null) damage = fallbackDamage;
    const range = unwrap(pickCI(raw, ["range", "rng"]));
    const notes = unwrap(pickCI(raw, ["notes", "desc", "text"]));
    return { toHit, damage, range, notes };
  }

  if (typeof raw === "number") return { toHit: `${raw}+`, damage: fallbackDamage ?? null, range: null };
  return null;
}

function AttackChips({ attack }) {
  if (!attack) return null;
  const toHit = attack.toHit != null ? fmtThreshold(attack.toHit) : null;
  const damage = attack.damage != null ? String(attack.damage) : null;
  const range = attack.range != null ? String(attack.range) : null;
  const hasRow = toHit || damage || range;
  if (!hasRow) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {toHit && (
        <span className="rounded px-2 py-0.5 text-xs bg-stone-800 border border-stone-700">
          <b>To-Hit:</b> {toHit}
        </span>
      )}
      {damage && (
        <span className="rounded px-2 py-0.5 text-xs bg-stone-800 border border-stone-700">
          <b>Damage:</b> {damage}
        </span>
      )}
      {range && (
        <span className="rounded px-2 py-0.5 text-xs bg-stone-800 border border-stone-700">
          <b>Range:</b> {range}
        </span>
      )}
    </div>
  );
}

function calcXP(e) { return e?.baseXP ?? e?.xp ?? 10; }

export default function DMEnemyDrawer({ world = "Mines", posse = [] }) {
  const {
    currentEnemy, setCurrentEnemy,
    currentTraitCard, setCurrentTraitCard,
    darkness, growingDread
  } = useCombatState();

  const threatKey = WORLD_TO_THREAT_KEY[world] || "Western";
  const availableDifficulties = useMemo(() => {
    const dks = THREAT_DECKS[threatKey] ? Object.keys(THREAT_DECKS[threatKey]) : [];
    const preferred = ["easy", "medium", "hard", "epic"];
    const ordered = preferred.filter(x => dks.includes(x)).concat(dks.filter(x => !preferred.includes(x)));
    return ordered.length ? ordered : ["medium"];
  }, [threatKey]);

  const [difficulty, setDifficulty] = useState(availableDifficulties[0] || "medium");
  const [deck, setDeck] = useState([]);

  useEffect(() => {
    const worldDecks = THREAT_DECKS[threatKey] || {};
    const difficultyDeck = worldDecks[difficulty] || [];
    setDeck(shuffleFY(difficultyDeck));
    setCurrentEnemy(null);
    setCurrentTraitCard(null);
  }, [threatKey, difficulty, setCurrentEnemy, setCurrentTraitCard]);

  const highestLevel = Math.max(...(posse.map(h => Number(h.level) || 1).concat(1)));
  const growingDreadModifier =
    growingDread.reduce((sum, card) => sum + (card.eliteModifier || 0), 0) +
    (darkness.some(d => d.type === "darknessPassed") ? 1 : 0);

  const { elite: eliteAbilities, brutal } = getEnemyDifficulty({
    heroLevel: highestLevel,
    hasDrifter: posse.some(h => h.heroClass === "Drifter"),
    darknessPassed: darkness.some(d => d.type === "darknessPassed"),
    growingDreadModifier,
    manualExtraElite: 0,
  });

  function pickTraitForGroup(group) {
    const names = (group?.enemies || []).map(e => (e?.name || "").toLowerCase());
    const byName = TRAIT_CARDS.filter(t =>
      t.tags?.some(tag => names.includes(String(tag).toLowerCase()))
    );
    if (byName.length) return shuffleFY(byName)[0];
    const byWorld = TRAIT_CARDS.filter(t =>
      t.tags?.some(tag => String(tag).toLowerCase() === threatKey.toLowerCase())
    );
    if (byWorld.length) return shuffleFY(byWorld)[0];
    return TRAIT_CARDS.length ? shuffleFY(TRAIT_CARDS)[0] : null;
  }

  const drawCard = () => {
    if (!deck.length) {
      alert("Deck is empty. Change difficulty, switch world, or reshuffle.");
      return;
    }
    const group = deck[0];
    setDeck(deck.slice(1));
    setCurrentEnemy(group);
    setCurrentTraitCard(pickTraitForGroup(group));
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={drawCard} className="btn btn-primary">Draw Enemy Card</button>
        <button
          onClick={() => {
            const worldDecks = THREAT_DECKS[threatKey] || {};
            const difficultyDeck = worldDecks[difficulty] || [];
            setDeck(shuffleFY(difficultyDeck));
            setCurrentEnemy(null);
            setCurrentTraitCard(null);
          }}
          className="btn btn-secondary"
        >
          Reshuffle
        </button>
        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm opacity-80">Difficulty:</label>
          <select
            className="select select-sm"
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
          >
            {availableDifficulties.map(d => (
              <option key={d} value={d}>{d[0].toUpperCase() + d.slice(1)}</option>
            ))}
          </select>
          <span className="text-xs opacity-70">Deck: {deck.length}</span>
        </div>
      </div>

      {/* Difficulty preview */}
      <div className="flex gap-2 flex-wrap text-sm">
        <span><b>World:</b> {world}</span>
        <span><b>Elite Abilities:</b> {eliteAbilities}</span>
        {brutal && <span className="ml-2 text-red-600 font-bold">BRUTAL</span>}
      </div>

      {/* Current group */}
      {currentEnemy && (
        <div className="mt-2 p-3 bg-[#3b2f1d] text-amber-100 border border-[#8b6b46] rounded shadow space-y-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-[220px]">
              <h3 className="text-xl font-bold">{currentEnemy.name || "Enemy Group"}</h3>
              <div className="text-xs opacity-80 mt-1">
                {currentEnemy.enemies?.map((e, i) => (
                  <span key={i} className="inline-block mr-2">
                    <b>{e.name}</b> (XP {calcXP(e)})
                  </span>
                ))}
              </div>
            </div>

            {/* Initiative bubble shows the most common/lowest initiative among the enemies (rough cue) */}
            {(() => {
              const inits = (currentEnemy.enemies || [])
                .map(e => Number(unwrap(getFirst(e.stats || e, ["Initiative","initiative"]))))
                .filter(n => Number.isFinite(n));
              const showInit = inits.length ? Math.min(...inits) : null;
              const size = unwrap(getFirst(currentEnemy, ["Size","size"])) ??
                           unwrap(getFirst((currentEnemy.enemies?.[0] || {}), ["Size","size"]));
              return (
                <div className="flex flex-col items-end gap-1">
                  <div className="w-[80px] h-[80px] rounded-full bg-stone-900 border border-stone-700 flex items-center justify-center">
                    <div className="flex flex-col items-center leading-tight">
                      <div className="text-xl font-black">{showInit != null ? String(showInit) : "—"}</div>
                      <div className="text-[9px] uppercase tracking-wide opacity-80 -mt-0.5">Initiative</div>
                    </div>
                  </div>
                  {size && (
                    <>
                      <div className="w-full text-right text-[11px] opacity-80">Size:</div>
                      <div className="w-full text-right font-semibold">{String(size)}</div>
                    </>
                  )}
                </div>
              );
            })()}
          </div>

          {/* TRAIT */}
          {currentTraitCard && (
            <div className="p-2 bg-yellow-100/20 border border-yellow-400/30 rounded">
              <div className="flex items-center justify-between gap-2 text-sm">
                <div>
                  <strong>Trait:</strong> {currentTraitCard.name}
                  {currentTraitCard.effect && <span> — {currentTraitCard.effect}</span>}
                </div>
                <button
                  className="btn btn-xs"
                  onClick={() => setCurrentTraitCard(pickTraitForGroup(currentEnemy))}
                >
                  Reroll Trait
                </button>
              </div>
            </div>
          )}

          {/* Per-enemy stat cards */}
          <div className="grid gap-3">
            {(currentEnemy.enemies || []).map((enemy, idx) => {
              const S = enemy.stats || enemy;

              const keywords = Array.isArray(S.keywords) ? S.keywords : (S.keywords ? [S.keywords] : []);
              const baseDamage = unwrap(getFirst(S, ["Damage","damage"]));

              const meleeAtk  = normalizeAttack(getFirst(S, ["Melee Attack","melee","Melee"]), baseDamage);
              const rangedAtk = normalizeAttack(getFirst(S, ["Ranged Attack","ranged","Ranged"]), baseDamage);

              const move   = toText(getFirst(S, ["Move","move"]));
              const escape = toText(getFirst(S, ["Escape","escape"]));

              const defense     = toText(getFirst(S, ["Defense","defense"]));
              const armor       = toText(getFirst(S, ["Armor","armor"]));
              const spiritArmor = toText(getFirst(S, ["Spirit Armor","spirit armor","SpiritArmor","spiritArmor"]));
              const health      = toText(getFirst(S, ["Health","health"]));

              const abilities = (() => {
                const raw = unwrap(getFirst(S, ["abilities","Abilities"]));
                if (!raw && raw !== 0) return [];
                if (Array.isArray(raw)) return raw.map(String);
                return String(raw).split(/\n+|[.;](?:\s+|$)/).map(s=>s.trim()).filter(Boolean);
              })();
              const eliteChart = (() => {
                const raw = unwrap(getFirst(S, ["eliteChart","elitechart","Elite Chart"]));
                if (!raw && raw !== 0) return [];
                if (Array.isArray(raw)) return raw.map(String);
                return String(raw).split(/\n+|[.;](?:\s+|$)/).map(s=>s.trim()).filter(Boolean);
              })();

              return (
                <div key={idx} className="rounded-lg p-3 bg-[#2f2618] border border-[#8b6b46]/60">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <div className="font-bold">{enemy.name}</div>
                    <div className="flex flex-wrap gap-1">
                      {keywords.length
                        ? keywords.map((kw, i) => (
                            <span key={i} className="px-2 py-0.5 text-[11px] rounded bg-stone-800 border border-stone-700">
                              {kw}
                            </span>
                          ))
                        : <span className="text-xs opacity-70">No keywords</span>}
                    </div>
                  </div>

                  {/* Attacks */}
                  {(meleeAtk || rangedAtk) && (
                    <div className="mt-2">
                      <div className="text-xs font-semibold uppercase tracking-wide opacity-80 mb-1">Attacks</div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {meleeAtk && (
                          <div className="rounded-md p-2 bg-stone-900/60 border border-stone-700">
                            <div className="text-xs font-semibold mb-1">Melee</div>
                            <AttackChips attack={meleeAtk} />
                          </div>
                        )}
                        {rangedAtk && (
                          <div className="rounded-md p-2 bg-stone-900/60 border border-stone-700">
                            <div className="text-xs font-semibold mb-1">Ranged</div>
                            <AttackChips attack={rangedAtk} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Mobility */}
                  {(move || escape) && (
                    <div className="mt-2">
                      <div className="text-xs font-semibold uppercase tracking-wide opacity-80 mb-1">Mobility</div>
                      <div className="flex flex-wrap gap-2">
                        {move   && <span className="rounded-md px-2.5 py-1 text-xs bg-stone-800 border border-stone-700"><b>Move:</b> {move}</span>}
                        {escape && <span className="rounded-md px-2.5 py-1 text-xs bg-stone-800 border border-stone-700"><b>Escape:</b> {escape}</span>}
                      </div>
                    </div>
                  )}

                  {/* Defense chips (right-aligned) */}
                  {(defense || armor || spiritArmor || health) && (
                    <div className="mt-2 flex flex-wrap gap-2 justify-end">
                      {defense     && <span className="rounded-md px-2.5 py-1 text-xs bg-stone-800 border border-stone-700"><b>Defense:</b> {defense}</span>}
                      {armor       && <span className="rounded-md px-2.5 py-1 text-xs bg-stone-800 border border-stone-700"><b>Armor:</b> {armor}</span>}
                      {spiritArmor && <span className="rounded-md px-2.5 py-1 text-xs bg-stone-800 border border-stone-700"><b>Spirit Armor:</b> {spiritArmor}</span>}
                      {health      && <span className="rounded-md px-2.5 py-1 text-xs bg-stone-800 border border-stone-700"><b>Health:</b> {health}</span>}
                    </div>
                  )}

                  {/* Abilities / Elite Chart */}
                  {abilities.length > 0 && (
                    <div className="mt-3 text-xs space-y-1">
                      <div className="font-semibold">Abilities</div>
                      <ul className="list-disc list-inside space-y-0.5">
                        {abilities.map((line, i) => <li key={i}>{line}</li>)}
                      </ul>
                    </div>
                  )}
                  {eliteChart.length > 0 && (
                    <div className="mt-2 text-xs space-y-1">
                      <div className="font-semibold">Elite Chart</div>
                      <ul className="list-disc list-inside space-y-0.5">
                        {eliteChart.map((line, i) => <li key={i}>{line}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
