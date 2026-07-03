// src/components/DM/DMLootPoolPanel.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { LOOT_DECKS } from "../../data/lootDecks";
import { ARTIFACT_DECKS } from "../../data/artifactDecks";
import { useDeckRegistry } from "../../context/DeckRegistryContext";

/* =========================================================
   Helpers: Item details panel
========================================================= */
const isItemCard = (c = {}) =>
  !!(c._isExpanded || c.type === "Gear" || c.type === "Artifact" || c.slot || c.effects);

function ItemDetails({ card }) {
  const isItem =
    !!(card?._isExpanded || card?.type === "Gear" || card?.type === "Artifact" || card?.slot || card?.effects);
  if (!isItem) return null;

  const { type, slot, value, twoHanded, darkStone, upgradeSlots, restrictions, effects, isAttachment, weight } = card;

  const effectsList = Array.isArray(effects)
    ? effects
    : effects && typeof effects === "object"
      ? Object.entries(effects).map(([k, v]) => `${v >= 0 ? "+" : ""}${v} ${k}`)
      : effects ? [effects] : [];

  const metaParts = [
    type || null, slot || null,
    twoHanded ? "Two-Handed" : null, isAttachment ? "Attachment" : null,
    darkStone ? "Dark Stone" : null, Number.isFinite(weight) ? `Wt ${weight}` : null,
    Number.isFinite(upgradeSlots) ? `Upgrades: ${upgradeSlots}` : null,
    Number.isFinite(value) ? `$${value}` : null,
  ].filter(Boolean);

  return (
    <div className="mt-2 rounded-xl border border-base-300 bg-base-100/80 p-3 shadow-sm">
      {metaParts.length > 0 && (
        <div className="text-sm font-medium mb-2 leading-6" style={{ letterSpacing: 0.2 }}>
          {metaParts.join("  ·  ")}
        </div>
      )}
      {restrictions?.length ? (
        <div className="text-xs opacity-80 mb-2">
          <span className="font-semibold">Restrictions:</span> {restrictions.join(", ")}
        </div>
      ) : null}
      {effectsList.length > 0 && (
        <>
          <div className="text-xs uppercase tracking-wider opacity-70 mb-1">Effects</div>
          <ul className="list-disc list-inside space-y-1 text-sm leading-relaxed">
            {effectsList.map((e, i) => <li key={i}>{String(e)}</li>)}
          </ul>
        </>
      )}
    </div>
  );
}

/* =========================================================
   Dice + resource parsing
========================================================= */
const NUM = String.raw`(\d{1,3}(?:,\d{3})*|\d+)`;
const DIE = String.raw`d(\d+)`;
const MULT = String.raw`[x×]\s*${NUM}`;
const RES = String.raw`(gold|dark\s*stone|darkstone|ds|tech|scrap|\$)`;
const RE_DIE_MULT_RES = new RegExp(`\\b${DIE}\\s*(?:${MULT})?\\s*${RES}\\b`, "i");
const RE_NUM_RES = new RegExp(`\\b${NUM}\\s*${RES}\\b`, "i");
const n = (x) => Number(String(x ?? 0).replace(/,/g, "")) || 0;
const resourceField = (tok) => {
  const t = String(tok || "").toLowerCase();
  if (t === "$" || /gold/.test(t)) return "gold";
  if (/dark\s*stone|darkstone|^ds$/.test(t)) return "darkStone";
  if (/tech(?!nique)/.test(t)) return "tech";
  if (/scrap/.test(t)) return "scrap";
  return null;
};
const rollDie = (sides) => Math.floor(Math.random() * Math.max(2, Number(sides) || 6)) + 1;

function resolvePayoutFromName(name = "") {
  if (!name) return null;
  const m1 = name.match(RE_DIE_MULT_RES);
  if (m1) {
    const [, sides, , multNum, resTok] = m1;
    const field = resourceField(resTok);
    if (!field) return null;
    const roll = rollDie(sides);
    const mult = multNum ? n(multNum) : 1;
    const amount = roll * mult;
    return { field, amount, breakdown: `Rolled D${sides}=${roll}${mult !== 1 ? ` × ${mult} = ${amount}` : ``}`, meta: { kind: "dice", sides: Number(sides) || 6, roll, mult } };
  }
  const m2 = name.match(RE_NUM_RES);
  if (m2) {
    const [, num, resTok] = m2;
    const field = resourceField(resTok);
    if (!field) return null;
    return { field, amount: n(num), breakdown: `+${n(num)} ${field}`, meta: { kind: "flat" } };
  }
  return null;
}

function applyDelta(hero, delta) {
  const next = { ...hero };
  for (const [k, v] of Object.entries(delta)) next[k] = n(next[k]) + n(v);
  return next;
}
function deltaFromResolved(resolved) {
  if (!resolved) return {};
  if ("field" in resolved) return { [resolved.field]: resolved.amount };
  return resolved;
}

/* =========================================================
   World normalization
========================================================= */
const normalizeWorldKey = (world) => {
  const w = String(world || "").trim().toLowerCase();
  if (w === "city of the ancients" || w === "the city of the ancients") return "Mines";
  if (w === "mines" || w === "the mines") return "Mines";
  if (w.includes("jargono")) return "Jargono";
  if (w.includes("targa")) return "Targa Plateau";
  if (w.includes("cynder")) return "Cynder";
  if (w.includes("trederra")) return "Trederra";
  if (w.includes("derelict")) return "Derelict Ship";
  if (w.includes("blasted") && w.includes("waste")) return "Blasted Wastes";
  if (w.includes("canyon")) return "The Canyons";
  return world;
};
const isMinesWorld = (world) => normalizeWorldKey(world) === "Mines";
const getOWTagForWorld = (world) => {
  switch (normalizeWorldKey(world)) {
    case "Jargono": return "Jargono";
    case "Targa Plateau": return "Targa";
    case "Cynder": return "Cynder";
    case "Trederra": return "Trederra";
    case "Derelict Ship": return "Derelict Ship";
    case "Blasted Wastes": return "Blasted Wastes";
    case "The Canyons": return "The Canyons";
    default: return null;
  }
};

/* =========================================================
   Deck management helpers
========================================================= */
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildShuffledDeck(sourceCards) {
  return shuffleArray(sourceCards.map((_, i) => i));
}

function loadDeckState(world) {
  try {
    const raw = localStorage.getItem(`sob:loot_deck:${world}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveDeckState(world, state) {
  try {
    localStorage.setItem(`sob:loot_deck:${world}`, JSON.stringify(state));
  } catch {}
}

/* =========================================================
   Loot card expansion
========================================================= */
const textOf = (card) => `${card?.name || ""} ${card?.effect || ""}`.toLowerCase();
const isGearDrawCard = (card) => /draw\s+(a\s+)?gear\s+card/.test(textOf(card));
const isArtifactDrawCard = (card) => /draw\s+(an?\s+)?artifact/.test(textOf(card));

function makeExpandedItemEntry(item, kind, sourceLootName, drawnFor) {
  const instanceId = `${item.id}::${Date.now()}::${Math.random().toString(36).slice(2, 8)}`;
  return { ...item, type: kind, drawnFor, claimedBy: null, resolvedResources: null, _isExpanded: true, _sourceLootName: sourceLootName, _instanceId: instanceId };
}

/* =========================================================
   Component
========================================================= */
export default function DMLootPoolPanel({ posse = [], world = "Mines", updateHero, combatGroups = [] }) {
  const sourceCards = useMemo(() => LOOT_DECKS[world] || LOOT_DECKS["Mines"] || [], [world]);

  // remaining: array of indices into sourceCards (shuffled order)
  const [remaining, setRemaining] = useState(() => {
    const saved = loadDeckState(world);
    if (saved?.world === world && Array.isArray(saved.remaining)) return saved.remaining;
    return buildShuffledDeck(sourceCards);
  });
  const [reshuffleNote, setReshuffleNote] = useState(null);

  const [lootPool, setLootPool] = useState([]);
  const [claimed, setClaimed] = useState({});
  const [lootHistory, setLootHistory] = useState([]);
  const [threatCount, setThreatCount] = useState(1);
  // Auto-link: default the loot count to the live fight size (1 loot per Threat, max 3).
  // The 1/2/3 buttons below remain a manual override.
  const fightThreatCount = Math.min(3, Math.max(1, combatGroups.length || 1));
  useEffect(() => {
    if (combatGroups.length > 0) setThreatCount(fightThreatCount);
  }, [combatGroups.length, fightThreatCount]);
  const [scavengeRolls, setScavengeRolls] = useState(null);
  const deck = useDeckRegistry();

  // Rebuild deck when world changes
  useEffect(() => {
    const saved = loadDeckState(world);
    if (saved?.world === world && Array.isArray(saved.remaining)) {
      setRemaining(saved.remaining);
    } else {
      const fresh = buildShuffledDeck(LOOT_DECKS[world] || LOOT_DECKS["Mines"] || []);
      setRemaining(fresh);
    }
    setReshuffleNote(null);
    setLootPool([]);
    setClaimed({});
  }, [world]);

  // Persist deck state
  useEffect(() => {
    saveDeckState(world, { world, remaining });
  }, [world, remaining]);

  // Draw N indices from the deck, auto-reshuffling when empty
  const drawFromDeck = useCallback((count) => {
    const src = LOOT_DECKS[world] || LOOT_DECKS["Mines"] || [];
    let pool = [...remaining];
    const drawn = [];
    let reshuffled = false;

    for (let i = 0; i < count; i++) {
      if (pool.length === 0) {
        pool = buildShuffledDeck(src);
        reshuffled = true;
      }
      drawn.push(pool.shift());
    }

    setRemaining(pool);
    if (reshuffled) setReshuffleNote('Loot deck exhausted — reshuffled!');
    return drawn.map(idx => src[idx]);
  }, [remaining, world]);

  function preExpandCard(baseCard, drawnFor, worldName) {
    const inMines = isMinesWorld(worldName);
    if (isGearDrawCard(baseCard)) {
      const item = inMines ? deck.drawGear() : deck.drawOtherWorldArtifact(getOWTagForWorld(worldName));
      if (item) return makeExpandedItemEntry(item, inMines ? "Gear" : "Artifact", `${baseCard.name} (${inMines ? "Mines" : normalizeWorldKey(worldName)})`, drawnFor);
    }
    if (isArtifactDrawCard(baseCard)) {
      const item = inMines ? deck.drawMineArtifact() : deck.drawGear();
      if (item) return makeExpandedItemEntry(item, inMines ? "Artifact" : "Gear", `${baseCard.name} (${inMines ? "Mines" : "Other World"})`, drawnFor);
    }
    return { ...baseCard, drawnFor, claimedBy: null, resolvedResources: null };
  }

  function drawLootForFight() {
    setReshuffleNote(null);
    // Each hero draws threatCount cards (max 3), all from the same deck
    const totalCards = posse.length * threatCount;
    const baseCards = drawFromDeck(totalCards);

    const newLoot = [];
    posse.forEach((hero, heroIdx) => {
      for (let t = 0; t < threatCount; t++) {
        const base = baseCards[heroIdx * threatCount + t];
        if (base) newLoot.push(preExpandCard(base, hero.name, world));
      }
    });

    setLootPool(newLoot);
    setClaimed({});
    setLootHistory(prev => [
      ...prev,
      ...newLoot.map(card => ({
        action: "draw", card, from: "pool", to: null, time: Date.now(),
        note: card._isExpanded ? `Expanded from: ${card._sourceLootName}` : undefined,
      })),
    ]);
  }

  function rollScavenge() {
    const rolls = Array.from({ length: 3 }, () => Math.ceil(Math.random() * 6));
    const successes = rolls.filter(r => r === 6).length;
    setScavengeRolls({ rolls, successes });

    if (successes > 0) {
      setReshuffleNote(null);
      const baseCards = drawFromDeck(successes);
      const newCards = baseCards.map(base => preExpandCard(base, 'Scavenge', world));
      setLootPool(prev => [...prev, ...newCards]);
      setLootHistory(prev => [
        ...prev,
        ...newCards.map(card => ({ action: "scavenge", card, from: "pool", to: null, time: Date.now() })),
      ]);
    }
  }

  function drawArtifactFromDeck(worldName) {
    const deckDef = ARTIFACT_DECKS[worldName] || [];
    if (!deckDef.length) return null;
    return deckDef[Math.floor(Math.random() * deckDef.length)];
  }

  function redrawCard(idx) {
    const old = lootPool[idx];
    if (!old || old.claimedBy) return;
    if (old._isExpanded && old.id) deck.release(old.id);
    const [base] = drawFromDeck(1);
    if (!base) return;
    const replacement = preExpandCard(base, old.drawnFor, world);
    setLootPool(prev => { const copy = [...prev]; copy[idx] = replacement; return copy; });
    setLootHistory(prev => [...prev, { action: "redraw", card: replacement, from: old.name, to: null, time: Date.now() }]);
  }

  function revertResourcesForCard(hero, card) {
    const res = card?.resolvedResources;
    if (!res) return hero;
    const delta = deltaFromResolved(res);
    const neg = Object.fromEntries(Object.entries(delta).map(([k, v]) => [k, -n(v)]));
    return applyDelta(hero, neg);
  }

  function claimLoot(idx, heroId) {
    const card = lootPool[idx];
    if (!card) return;
    const hero = posse.find(h => h.id === heroId || h.localId === heroId) || null;

    if (!hero || typeof updateHero !== "function") {
      setLootPool(prev => { const copy = [...prev]; copy[idx] = { ...card, claimedBy: heroId }; return copy; });
      return;
    }

    const patch = { id: hero.id || hero.localId };
    patch.inventory = [...(hero.inventory || []), card];

    if (!card._isExpanded && card.type === "Token") {
      patch.sideBag = [...(hero.sideBag || []), "Random Token"];
    }

    // Resolve the resource payout ONCE and persist it onto the card, so that
    // a dice-payout card (e.g. "Gain D6 x 50 Gold") doesn't re-roll a new amount
    // on each claim and CAN be correctly reverted on Return to Pool.
    let resolved = null;
    if (!card._isExpanded) {
      resolved = card.resolvedResources || resolvePayoutFromName(card.name || card.effect || "");
      if (resolved) {
        const delta = deltaFromResolved(resolved);
        for (const [field, amt] of Object.entries(delta)) patch[field] = n(hero[field]) + n(amt);
      }
    }

    updateHero(patch);
    setLootPool(prev => { const copy = [...prev]; copy[idx] = { ...card, claimedBy: heroId, resolvedResources: card._isExpanded ? null : (resolved || null) }; return copy; });
    setClaimed(prev => ({ ...prev, [heroId]: [...(prev[heroId] || []), idx] }));
    setLootHistory(prev => [...prev, {
      action: "claim", card, from: "pool", to: heroId, time: Date.now(),
      note: card._isExpanded ? `Claimed ${card.type}: ${card.name}` : (resolved?.breakdown || undefined),
    }]);
  }

  function sendToTreasurePool(idx) {
    const card = lootPool[idx];
    if (!card) return;
    const item = { ...card, id: card._instanceId || card.id || `loot_${Date.now()}_${Math.floor(Math.random() * 9999)}`, _droppedBy: card.drawnFor || 'Loot Pool', _droppedAt: Date.now() };
    delete item.claimedBy; delete item.resolvedResources; delete item.drawnFor;
    try {
      const key = 'sob:treasurePool';
      const pool = JSON.parse(localStorage.getItem(key) || '[]');
      pool.push(item);
      localStorage.setItem(key, JSON.stringify(pool));
    } catch {}
    setLootPool(prev => prev.filter((_, i) => i !== idx));
    setLootHistory(prev => [...prev, { action: 'treasure', card, from: 'pool', to: 'Treasure Pool', time: Date.now() }]);
  }

  const deckSize = sourceCards.length;
  const cardsLeft = remaining.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-bold text-lg">Loot Pool</h2>
        {/* Deck status */}
        <div className="flex items-center gap-2 text-sm">
          <span className="bg-gray-100 border rounded px-2 py-0.5 text-gray-700">
            Deck: <strong>{cardsLeft}</strong> / {deckSize} remaining
          </span>
          <button
            className="btn btn-xs btn-ghost text-gray-500"
            title="Reshuffle the full loot deck"
            onClick={() => {
              setRemaining(buildShuffledDeck(sourceCards));
              setReshuffleNote('Deck manually reshuffled.');
            }}
          >
            ↺ Reshuffle
          </button>
        </div>
      </div>

      {reshuffleNote && (
        <div className="bg-amber-50 border border-amber-300 text-amber-800 text-sm px-3 py-2 rounded flex items-center justify-between">
          <span>{reshuffleNote}</span>
          <button className="text-amber-600 text-xs hover:underline" onClick={() => setReshuffleNote(null)}>dismiss</button>
        </div>
      )}

      {/* Draw controls */}
      <div className="bg-gray-50 border rounded-lg p-3 space-y-3">
        <div className="font-semibold text-sm text-gray-700">Post-Fight Loot Draw</div>

        {/* Threat card count selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Threat cards drawn:</span>
          {[1, 2, 3].map(n => (
            <button
              key={n}
              className={`btn btn-sm min-w-[44px] ${threatCount === n ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setThreatCount(n)}
            >
              {n}
            </button>
          ))}
          <span className="text-xs text-gray-400">
            = {posse.length} hero{posse.length !== 1 ? 'es' : ''} × {threatCount} card{threatCount !== 1 ? 's' : ''} = {posse.length * threatCount} total
          </span>
          {combatGroups.length > 0 && threatCount === fightThreatCount && (
            <span className="text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-800 border border-amber-300 rounded px-1.5 py-0.5">
              auto from fight ({combatGroups.length} group{combatGroups.length !== 1 ? 's' : ''})
            </span>
          )}
        </div>

        <button className="btn btn-primary w-full" onClick={drawLootForFight}>
          Draw Loot ({posse.length * threatCount} card{posse.length * threatCount !== 1 ? 's' : ''})
        </button>
      </div>

      {/* Scavenge */}
      <div className="bg-gray-50 border rounded-lg p-3 space-y-2">
        <div className="font-semibold text-sm text-gray-700">Scavenge Action</div>
        <p className="text-xs text-gray-500">Roll 3D6 — each 6 draws 1 loot card from the deck.</p>
        <button className="btn btn-secondary btn-sm" onClick={rollScavenge}>Roll Scavenge (3D6)</button>
        {scavengeRolls && (
          <div className="text-sm">
            <span className="font-mono">[{scavengeRolls.rolls.join(', ')}]</span>
            {' — '}
            {scavengeRolls.successes > 0
              ? <span className="text-green-700 font-semibold">{scavengeRolls.successes} card{scavengeRolls.successes !== 1 ? 's' : ''} drawn!</span>
              : <span className="text-gray-500">No successes.</span>
            }
          </div>
        )}
      </div>

      {/* Manual artifact */}
      <button
        className="btn btn-outline btn-sm"
        onClick={() => {
          const artifact = drawArtifactFromDeck(world);
          if (artifact) {
            setLootPool(prev => [...prev, { ...artifact, type: "Artifact", claimedBy: null, drawnFor: "Artifact Draw", resolvedResources: null }]);
            setLootHistory(prev => [...prev, { action: "draw", card: artifact, from: "pool", to: null, time: Date.now() }]);
          }
        }}
      >
        + Add Artifact to Pool
      </button>

      {/* Pool cards */}
      {lootPool.length > 0 && (
        <>
          <div className="font-semibold text-sm text-gray-700 mt-2">
            Current Pool ({lootPool.filter(c => !c.claimedBy).length} unclaimed)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {lootPool.map((card, idx) => (
              <div key={idx} className={`border rounded p-2 ${card.claimedBy ? 'bg-green-50 border-green-200' : 'bg-base-100'}`}>
                <div className="font-semibold">{card.name}</div>
                {card._isExpanded && card._sourceLootName && (
                  <div className="text-xs mt-1 opacity-70">Expanded from: <em>{card._sourceLootName}</em></div>
                )}
                <div className="text-xs text-gray-400">Drawn for: {card.drawnFor}</div>

                <ItemDetails card={card} />

                {card.resolvedResources?.breakdown && (
                  <div className="text-xs text-emerald-700 mt-0.5">{card.resolvedResources.breakdown}</div>
                )}

                <div className="mt-1 flex flex-wrap gap-1">
                  {card.claimedBy ? (
                    <>
                      <span className="badge badge-success">
                        Claimed by {posse.find(h => h.id === card.claimedBy)?.name || posse.find(h => h.localId === card.claimedBy)?.name || "?"}
                      </span>
                      <button className="btn btn-xs btn-warning ml-1" onClick={() => {
                        const hero = posse.find(h => h.id === card.claimedBy) || posse.find(h => h.localId === card.claimedBy);
                        if (hero && updateHero && !card._isExpanded) updateHero(revertResourcesForCard(hero, card));
                        if (card._isExpanded && card.id) deck.release(card.id);
                        setLootPool(prev => { const copy = [...prev]; copy[idx] = { ...copy[idx], claimedBy: null, resolvedResources: null }; return copy; });
                        setLootHistory(prev => [...prev, { action: "return", card, from: card.claimedBy, to: "pool", time: Date.now() }]);
                      }}>Return to Pool</button>
                      <select className="select select-xs" defaultValue="" onChange={e => {
                        const newHeroId = e.target.value;
                        if (!newHeroId) return;
                        const oldHero = posse.find(h => h.id === card.claimedBy) || posse.find(h => h.localId === card.claimedBy);
                        const newHero = posse.find(h => h.id === newHeroId) || posse.find(h => h.localId === newHeroId);
                        if (!updateHero || !oldHero || !newHero) return;
                        if (card.resolvedResources && !card._isExpanded) {
                          const posDelta = deltaFromResolved(card.resolvedResources);
                          const negDelta = Object.fromEntries(Object.entries(posDelta).map(([k, v]) => [k, -n(v)]));
                          updateHero(applyDelta(oldHero, negDelta));
                          updateHero(applyDelta(newHero, posDelta));
                        }
                        setLootPool(prev => { const copy = [...prev]; copy[idx] = { ...copy[idx], claimedBy: newHeroId }; return copy; });
                        setLootHistory(prev => [...prev, { action: "transfer", card, from: card.claimedBy, to: newHeroId, time: Date.now() }]);
                      }}>
                        <option value="">Send to...</option>
                        {posse.filter(h => h.id !== card.claimedBy && h.localId !== card.claimedBy).map(h => (
                          <option key={h.id || h.localId} value={h.id || h.localId}>{h.name}</option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <>
                      {posse.map(h => (
                        <button key={h.id || h.localId} className="btn btn-xs btn-outline" onClick={() => claimLoot(idx, h.id || h.localId)}>
                          {h.name}
                        </button>
                      ))}
                      <button className="btn btn-xs btn-accent" onClick={() => sendToTreasurePool(idx)}>→ Treasure</button>
                      <button className="btn btn-xs btn-warning" onClick={() => redrawCard(idx)}>↺ Redraw</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Loot History */}
      {lootHistory.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold text-sm mb-1 text-gray-600">History</h3>
          <ul className="text-xs max-h-40 overflow-y-auto border rounded p-2 bg-gray-50 space-y-0.5">
            {[...lootHistory].reverse().map((entry, i) => (
              <li key={i}>
                <span className="font-bold uppercase text-gray-500">{entry.action}</span>{' '}
                <span>{entry.card.name}</span>
                {entry.note && <span className="ml-1 text-emerald-700">({entry.note})</span>}
                {entry.from && entry.from !== 'pool' && (
                  <span className="text-gray-400"> ← {posse.find(h => h.id === entry.from)?.name || entry.from}</span>
                )}
                {entry.to && entry.to !== 'pool' && (
                  <span className="text-green-600"> → {posse.find(h => h.id === entry.to || h.localId === entry.to)?.name || entry.to}</span>
                )}
                <span className="ml-2 text-gray-300">{new Date(entry.time).toLocaleTimeString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
