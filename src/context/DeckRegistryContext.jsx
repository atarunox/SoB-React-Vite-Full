// src/context/DeckRegistryContext.js
import React, { createContext, useContext, useMemo, useRef } from "react";
import { gearCards } from "../data/items/gearCards";
import { mineArtifacts } from "../data/items/mineArtifacts";
import { otherWorldArtifacts } from "../data/items/otherWorldArtifacts";

// Worlds we route OW artifacts by. Must match tags used in otherWorldArtifacts.
const OW_TAGS = new Set([
  "Jargono",
  "Targa",
  "Targa Plateau", // tolerate both
  "Cynder",
  "Trederra",
  "Derelict Ship",
  "Blasted Wastes",
  "The Canyons",
]);

// Helper — random element from a Set
function pickRandomFromSet(s) {
  if (!s || s.size === 0) return null;
  const idx = Math.floor(Math.random() * s.size);
  let i = 0;
  for (const v of s) {
    if (i === idx) return v;
    i++;
  }
  return null;
}

const DeckRegistryCtx = createContext(null);

export function DeckRegistryProvider({ children }) {
  // Build immutable maps of id -> item for each family
  const { maps, sets, idIndex } = useMemo(() => {
    const gearMap = new Map();
    const mineMap = new Map();
    const owMap = new Map(); // id -> item
    const idIndex = new Map(); // id -> { deck: 'GEAR'|'MINE'|'OW', tag?: 'Jargono'|... }

    // GEAR
    gearCards.forEach((it) => {
      if (!it?.id) return;
      gearMap.set(it.id, it);
      idIndex.set(it.id, { deck: "GEAR" });
    });

    // MINE ARTIFACTS
    mineArtifacts.forEach((it) => {
      if (!it?.id) return;
      mineMap.set(it.id, it);
      idIndex.set(it.id, { deck: "MINE" });
    });

    // OTHER WORLD ARTIFACTS
    otherWorldArtifacts.forEach((it) => {
      if (!it?.id) return;
      owMap.set(it.id, it);

      // Try to detect the primary world tag from its tags array
      const tag = Array.isArray(it.tags)
        ? it.tags.find((t) => OW_TAGS.has(t))
        : null;
      idIndex.set(it.id, { deck: "OW", tag: tag || null });
    });

    // Availability sets
    const gearIds = new Set(gearMap.keys());
    const mineIds = new Set(mineMap.keys());

    // By OW tag (each tag gets its own available-id set)
    const owByTag = new Map();
    for (const [id, meta] of idIndex) {
      if (meta.deck !== "OW") continue;
      const tag = meta.tag || "__ANY__";
      if (!owByTag.has(tag)) owByTag.set(tag, new Set());
      owByTag.get(tag).add(id);
    }

    return {
      maps: { gearMap, mineMap, owMap },
      sets: { gearIds, mineIds, owByTag },
      idIndex,
    };
  }, []);

  // Mutable working copies of availability
  const gearAvailRef = useRef(new Set(sets.gearIds));
  const mineAvailRef = useRef(new Set(sets.mineIds));
  const owAvailRef = useRef(
    new Map([...sets.owByTag.entries()].map(([k, v]) => [k, new Set(v)]))
  );

  // Drawers (remove from availability and return the item)
  const drawGear = () => {
    const pickId = pickRandomFromSet(gearAvailRef.current);
    if (!pickId) return null;
    gearAvailRef.current.delete(pickId);
    return maps.gearMap.get(pickId) || null;
    // Optional: support copies by keeping a counter instead of a Set
  };

  const drawMineArtifact = () => {
    const pickId = pickRandomFromSet(mineAvailRef.current);
    if (!pickId) return null;
    mineAvailRef.current.delete(pickId);
    return maps.mineMap.get(pickId) || null;
  };

  const drawOtherWorldArtifact = (tag) => {
    const key = tag || "__ANY__";
    let pool = owAvailRef.current.get(key);

    // strict tag first; then fallback to any OW
    if (!pool || pool.size === 0) {
      pool = owAvailRef.current.get("__ANY__");
    }
    if (!pool || pool.size === 0) return null;

    const pickId = pickRandomFromSet(pool);
    if (!pickId) return null;

    pool.delete(pickId);
    return maps.owMap.get(pickId) || null;
  };

  // Release: add back to its original pool
  const release = (id) => {
    const meta = idIndex.get(id);
    if (!meta) return false;

    if (meta.deck === "GEAR") {
      // don’t double-add
      if (![...gearAvailRef.current].includes(id)) {
        gearAvailRef.current.add(id);
      }
      return true;
    }

    if (meta.deck === "MINE") {
      if (![...mineAvailRef.current].includes(id)) {
        mineAvailRef.current.add(id);
      }
      return true;
    }

    if (meta.deck === "OW") {
      const key = meta.tag || "__ANY__";
      if (!owAvailRef.current.has(key)) owAvailRef.current.set(key, new Set());
      const pool = owAvailRef.current.get(key);
      if (![...pool].includes(id)) {
        pool.add(id);
      }
      return true;
    }

    return false;
  };

  // You can expose some debug helpers if you want
  const value = useMemo(
    () => ({
      drawGear,
      drawMineArtifact,
      drawOtherWorldArtifact,
      release,
    }),
    []
  );

  return (
    <DeckRegistryCtx.Provider value={value}>
      {children}
    </DeckRegistryCtx.Provider>
  );
}

export function useDeckRegistry() {
  const ctx = useContext(DeckRegistryCtx);
  if (!ctx) {
    throw new Error("useDeckRegistry must be used inside a DeckRegistryProvider");
  }
  return ctx;
}
