// src/components/DM/DMLootPoolPanel.jsx
import React, { useState } from "react";
import { LOOT_DECKS } from "../../data/lootDecks";
import { ARTIFACT_DECKS } from "../../data/artifactDecks"; // unchanged manual button
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

  const {
    type,
    slot,
    value,
    twoHanded,
    darkStone,
    upgradeSlots,
    restrictions,
    effects,
    isAttachment,
    weight,
  } = card;

  const effectsList = Array.isArray(effects)
    ? effects
    : effects && typeof effects === "object"
      ? Object.entries(effects).map(([k, v]) => `${v >= 0 ? "+" : ""}${v} ${k}`)
      : effects
        ? [effects]
        : [];

  const metaParts = [
    type || null,
    slot || null,
    twoHanded ? "Two-Handed" : null,
    isAttachment ? "Attachment" : null,
    darkStone ? "Dark Stone" : null,
    Number.isFinite(weight) ? `Wt ${weight}` : null,
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
          <span className="font-semibold">Restrictions:</span>{" "}
          {restrictions.join(", ")}
        </div>
      ) : null}

      {effectsList.length > 0 && (
        <>
          <div className="text-xs uppercase tracking-wider opacity-70 mb-1">Effects</div>
          <ul className="list-disc list-inside space-y-1 text-sm leading-relaxed">
            {effectsList.map((e, i) => (
              <li key={i}>{String(e)}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/* =========================================================
   Dice + resource parsing (normal loot like “Gain 250 Gold”)
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
const rollDie = (sides) =>
  Math.floor(Math.random() * Math.max(2, Number(sides) || 6)) + 1;

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
    return {
      field,
      amount,
      breakdown: `Rolled D${sides}=${roll}${mult !== 1 ? ` × ${mult} = ${amount}` : ``}`,
      meta: { kind: "dice", sides: Number(sides) || 6, roll, mult },
    };
  }

  const m2 = name.match(RE_NUM_RES);
  if (m2) {
    const [, num, resTok] = m2;
    const field = resourceField(resTok);
    if (!field) return null;
    const amount = n(num);
    return { field, amount, breakdown: `+${amount} ${field}`, meta: { kind: "flat" } };
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
   World awareness
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
  if (w.includes("canyons")) return "The Canyons";
  return world;
};
const isMinesWorld = (world) => normalizeWorldKey(world) === "Mines";

const getOWTagForWorld = (world) => {
  const key = normalizeWorldKey(world);
  switch (key) {
    case "Jargono":         return "Jargono";
    case "Targa Plateau":   return "Targa"; // artifacts use "Targa"
    case "Cynder":          return "Cynder";
    case "Trederra":        return "Trederra";
    case "Derelict Ship":   return "Derelict Ship";
    case "Blasted Wastes":  return "Blasted Wastes";
    case "The Canyons":     return "The Canyons";
    default:                return null;
  }
};

/* =========================================================
   Loot card → item expansion rules
========================================================= */
const textOf = (card) => `${card?.name || ""} ${card?.effect || ""}`.toLowerCase();

const isGearDrawCard = (card) => /draw\s+(a\s+)?gear\s+card/.test(textOf(card));
const isArtifactDrawCard = (card) => /draw\s+(an?\s+)?artifact/.test(textOf(card));

function makeExpandedItemEntry(item, kind, sourceLootName, drawnFor) {
  const instanceId = `${item.id}::${Date.now()}::${Math.random().toString(36).slice(2,8)}`;
  return {
    ...item,
    type: kind,                // "Gear" or "Artifact"
    drawnFor,
    claimedBy: null,
    resolvedResources: null,
    _isExpanded: true,
    _sourceLootName: sourceLootName,
    _instanceId: instanceId,
  };
}

/* =========================================================
   Component
========================================================= */
export default function DMLootPoolPanel({ posse = [], world = "Mines", updateHero }) {
  const [lootPool, setLootPool] = useState([]);
  const [claimed, setClaimed] = useState({});
  const [lootHistory, setLootHistory] = useState([]);
  const deck = useDeckRegistry();

  // Expand a drawn loot card into a concrete item when appropriate
  function preExpandCard(baseCard, drawnFor, worldName) {
    const inMines = isMinesWorld(worldName);

    // Gear draw card (may swap to Artifact if NOT Mines)
    if (isGearDrawCard(baseCard)) {
      const item = inMines
        ? deck.drawGear()
        : deck.drawOtherWorldArtifact(getOWTagForWorld(worldName));
      if (item) {
        return makeExpandedItemEntry(
          item,
          inMines ? "Gear" : "Artifact",
          `${baseCard.name} (${inMines ? "Mines" : normalizeWorldKey(worldName)})`,
          drawnFor
        );
      }
    }

    // Artifact draw card (may swap to Gear if NOT Mines)
    if (isArtifactDrawCard(baseCard)) {
      const item = inMines
        ? deck.drawMineArtifact()
        : deck.drawGear();
      if (item) {
        return makeExpandedItemEntry(
          item,
          inMines ? "Artifact" : "Gear",
          `${baseCard.name} (${inMines ? "Mines" : "Other World"})`,
          drawnFor
        );
      }
    }

    // Normal loot card (kept as-is)
    return {
      ...baseCard,
      drawnFor,
      claimedBy: null,
      resolvedResources: null,
    };
  }

  function drawLoot() {
    const deckDef = LOOT_DECKS[world] || LOOT_DECKS["Mines"] || [];
    if (!deckDef.length) return;

    const newLoot = posse.map((hero) => {
      const base = deckDef[Math.floor(Math.random() * deckDef.length)];
      return preExpandCard(base, hero.name, world);
    });

    setLootPool(newLoot);
    setClaimed({});
    setLootHistory((prev) => [
      ...prev,
      ...newLoot.map((card) => ({
        action: "draw",
        card,
        from: "pool",
        to: null,
        time: Date.now(),
        note: card._isExpanded ? `Expanded from: ${card._sourceLootName}` : undefined,
      })),
    ]);
  }

  // Manual “Add Artifact to Pool” button — unchanged (still uses ARTIFACT_DECKS)
  function drawArtifactFromDeck(worldName) {
    const deckDef = ARTIFACT_DECKS[worldName] || [];
    if (!deckDef.length) return null;
    return deckDef[Math.floor(Math.random() * deckDef.length)];
  }

  function redrawCard(idx) {
    const old = lootPool[idx];
    if (!old || old.claimedBy) return;
    if (old._isExpanded && old.id) deck.release(old.id);
    const deckDef = LOOT_DECKS[world] || LOOT_DECKS["Mines"] || [];
    if (!deckDef.length) return;
    const base = deckDef[Math.floor(Math.random() * deckDef.length)];
    const replacement = preExpandCard(base, old.drawnFor, world);
    setLootPool((prev) => {
      const copy = [...prev];
      copy[idx] = replacement;
      return copy;
    });
    setLootHistory((prev) => [
      ...prev,
      { action: "redraw", card: replacement, from: old.name, to: null, time: Date.now() },
    ]);
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

    const hero =
      posse.find((h) => h.id === heroId || h.localId === heroId) || null;

    if (!hero || typeof updateHero !== "function") {
      setLootPool((prev) => {
        const copy = [...prev];
        copy[idx] = { ...card, claimedBy: heroId };
        return copy;
      });
      return;
    }

    const patch = { id: hero.id || hero.localId };

    if (card._isExpanded) {
      patch.inventory = [...(hero.inventory || []), card];
    } else {
      patch.inventory = [...(hero.inventory || []), card];

      if (card.type === "Token") {
        patch.sideBag = [...(hero.sideBag || []), "Random Token"];
      }

      const resolved =
        card.resolvedResources || resolvePayoutFromName(card.name || card.effect || "");
      if (resolved) {
        const delta = deltaFromResolved(resolved);
        for (const [field, amt] of Object.entries(delta)) {
          patch[field] = n(hero[field]) + n(amt);
        }
      }
    }

    updateHero(patch);

    setLootPool((prev) => {
      const copy = [...prev];
      copy[idx] = {
        ...card,
        claimedBy: heroId,
        resolvedResources: card._isExpanded ? null : (card.resolvedResources || null),
      };
      return copy;
    });

    setClaimed((prev) => ({
      ...prev,
      [heroId]: [...(prev[heroId] || []), idx],
    }));

    setLootHistory((prev) => [
      ...prev,
      {
        action: "claim",
        card,
        from: "pool",
        to: heroId,
        time: Date.now(),
        note: card._isExpanded
          ? `Claimed ${card.type}: ${card.name}`
          : (card.resolvedResources?.breakdown || undefined),
      },
    ]);
  }

  function sendToTreasurePool(idx) {
    const card = lootPool[idx];
    if (!card) return;

    const item = {
      ...card,
      id: card._instanceId || card.id || `loot_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
      _droppedBy: card.drawnFor || 'Loot Pool',
      _droppedAt: Date.now(),
    };
    delete item.claimedBy;
    delete item.resolvedResources;
    delete item.drawnFor;

    try {
      const key = 'sob:treasurePool';
      const pool = JSON.parse(localStorage.getItem(key) || '[]');
      pool.push(item);
      localStorage.setItem(key, JSON.stringify(pool));
    } catch {}

    setLootPool((prev) => prev.filter((_, i) => i !== idx));
    setLootHistory((prev) => [
      ...prev,
      { action: 'treasure', card, from: 'pool', to: 'Treasure Pool', time: Date.now() },
    ]);
  }

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-lg">Loot Pool</h2>

      <button className="btn btn-primary mb-2" onClick={drawLoot}>
        Draw Loot for Each Hero
      </button>

      <button
        className="btn btn-secondary mb-2 ml-2"
        onClick={() => {
          const artifact = drawArtifactFromDeck(world);
          if (artifact) {
            setLootPool((prev) => [
              ...prev,
              {
                ...artifact,
                type: "Artifact",
                claimedBy: null,
                drawnFor: "Artifact Draw",
                resolvedResources: null,
              },
            ]);
            setLootHistory((prev) => [
              ...prev,
              {
                action: "draw",
                card: artifact,
                from: "pool",
                to: null,
                time: Date.now(),
              },
            ]);
          }
        }}
      >
        Add Artifact to Pool
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {lootPool.map((card, idx) => (
          <div key={idx} className="border rounded p-2 bg-base-100">
            <div className="font-semibold">{card.name}</div>

            {card._isExpanded && card._sourceLootName && (
              <div className="text-xs mt-1 opacity-70">
                Expanded from: <em>{card._sourceLootName}</em>
              </div>
            )}

            <ItemDetails card={card} />

            {card.resolvedResources?.breakdown && (
              <div className="text-xs text-emerald-700 mt-0.5">
                {card.resolvedResources.breakdown}
              </div>
            )}

            <div className="mt-1 flex flex-wrap gap-1">
              {card.claimedBy ? (
                <>
                  <span className="badge badge-success">
                    Claimed by{" "}
                    {posse.find((h) => h.id === card.claimedBy)?.name ||
                      posse.find((h) => h.localId === card.claimedBy)?.name ||
                      "?"}
                  </span>

                  {/* Return to pool */}
                  <button
                    className="btn btn-xs btn-warning ml-1"
                    onClick={() => {
                      const hero =
                        posse.find((h) => h.id === card.claimedBy) ||
                        posse.find((h) => h.localId === card.claimedBy);

                      if (hero && updateHero && !card._isExpanded) {
                        const reverted = revertResourcesForCard(hero, card);
                        updateHero(reverted);
                      }

                      // Release pre-expanded items back into availability
                      if (card._isExpanded && card.id) {
                        deck.release(card.id);
                      }

                      setLootPool((prev) => {
                        const copy = [...prev];
                        copy[idx] = {
                          ...copy[idx],
                          claimedBy: null,
                          resolvedResources: null,
                        };
                        return copy;
                      });

                      setLootHistory((prev) => [
                        ...prev,
                        {
                          action: "return",
                          card,
                          from: card.claimedBy,
                          to: "pool",
                          time: Date.now(),
                        },
                      ]);
                    }}
                  >
                    Return to Pool
                  </button>

                  {/* Transfer */}
                  <div className="ml-1">
                    <select
                      className="select select-xs"
                      defaultValue=""
                      onChange={(e) => {
                        const newHeroId = e.target.value;
                        if (!newHeroId) return;

                        const oldHero =
                          posse.find((h) => h.id === card.claimedBy) ||
                          posse.find((h) => h.localId === card.claimedBy);
                        const newHero =
                          posse.find((h) => h.id === newHeroId) ||
                          posse.find((h) => h.localId === newHeroId);
                        if (!updateHero || !oldHero || !newHero) return;

                        if (card.resolvedResources && !card._isExpanded) {
                          const posDelta = deltaFromResolved(card.resolvedResources);
                          const negDelta = Object.fromEntries(
                            Object.entries(posDelta).map(([k, v]) => [k, -n(v)])
                          );
                          updateHero(applyDelta(oldHero, negDelta));
                          updateHero(applyDelta(newHero, posDelta));
                        }

                        setLootPool((prev) => {
                          const copy = [...prev];
                          copy[idx] = { ...copy[idx], claimedBy: newHeroId };
                          return copy;
                        });

                        setLootHistory((prev) => [
                          ...prev,
                          {
                            action: "transfer",
                            card,
                            from: card.claimedBy,
                            to: newHeroId,
                            time: Date.now(),
                          },
                        ]);
                      }}
                    >
                      <option value="">Send to...</option>
                      {posse
                        .filter(
                          (h) =>
                            h.id !== card.claimedBy &&
                            h.localId !== card.claimedBy
                        )
                        .map((h) => (
                          <option key={h.id || h.localId} value={h.id || h.localId}>
                            {h.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  {posse.map((h) => (
                    <button
                      key={h.id || h.localId}
                      className="btn btn-xs btn-outline"
                      onClick={() => claimLoot(idx, h.id || h.localId)}
                    >
                      Claim as {h.name}
                    </button>
                  ))}
                  <button
                    className="btn btn-xs btn-accent"
                    onClick={() => sendToTreasurePool(idx)}
                  >
                    → Treasure Pool
                  </button>
                  <button
                    className="btn btn-xs btn-warning"
                    onClick={() => redrawCard(idx)}
                  >
                    Redraw
                  </button>
                </>
              )}
            </div>

            <div className="text-xs mt-1 text-gray-400">
              Drawn for: {card.drawnFor}
            </div>
          </div>
        ))}
      </div>

      {/* Loot History */}
      <div className="mt-6">
        <h3 className="font-bold text-md mb-2">Loot History</h3>
        <ul className="text-xs max-h-40 overflow-y-auto border rounded p-2 bg-gray-50">
          {lootHistory.length === 0 && (
            <li className="italic text-gray-400">No actions yet.</li>
          )}
          {lootHistory.map((entry, i) => (
            <li key={i}>
              <span className="font-bold">{entry.action.toUpperCase()}</span>{" "}
              <span>{entry.card.name}</span>
              {entry.note && (
                <span className="ml-1 text-emerald-700">({entry.note})</span>
              )}
              {entry.from && (
                <>
                  {" "}
                  from{" "}
                  <span className="text-blue-700">
                    {entry.from === "pool"
                      ? "Pool"
                      : posse.find((h) => h.id === entry.from)?.name ||
                        posse.find((h) => h.localId === entry.from)?.name ||
                        entry.from}
                  </span>
                </>
              )}
              {entry.to && (
                <>
                  {" "}
                  to{" "}
                  <span className="text-green-700">
                    {entry.to === "pool"
                      ? "Pool"
                      : posse.find((h) => h.id === entry.to)?.name ||
                        posse.find((h) => h.localId === entry.to)?.name ||
                        entry.to}
                  </span>
                </>
              )}
              <span className="ml-2 text-gray-400">
                {new Date(entry.time).toLocaleTimeString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
