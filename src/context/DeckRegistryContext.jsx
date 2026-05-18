// src/context/DeckRegistryContext.js
import React, { createContext, useContext, useMemo, useRef } from "react";
import { gearCards } from "../data/items/gearCards";
import { mineArtifacts } from "../data/items/mineArtifacts";
import { otherWorldArtifacts } from "../data/items/otherWorldArtifacts";

// Physical deck copy counts — determines draw probability.
// Cards not listed default to 1 copy.
// Update this whenever cards are added to or removed from the physical deck.
const GEAR_DECK_COPIES = {
  axe:                    2,
  bandana:                2,
  bandages:               3,
  badlands_adventure_gear: 3,
  canteen:                4,
  critter_trap:           2,
  dead_mans_boots:        3,
  dead_mans_dice:         2,
  dark_fragment:          3,
  dynamite:               4,
  exotic_herbs:           2,
  far_eastern_potion:     2,
  cigar:                  2,
  flash_powder:           2,
  gunpowder_keg:          2,
  healing_herbs:          4,
  holy_water:             2,
  jack_of_hearts:         2,
  journal_pages:          2,
  lucky_bowler:           2,
  lantern_oil:            2,
  matches:                2,
  old_map:                2,
  pick_axe:               2,
  pistol:                 2,
  rare_spices:            2,
  sawed_off_shotgun:      4,
  scafford_wanted_poster: 2,
  tequila_bottle:         2,
  throwing_hatchets:      2,
  tonic:                  4,
  whiskey_bottle:         3,
};

// Worlds we route OW artifacts by. Must match tags used in otherWorldArtifacts.
const OW_TAGS = new Set([
  "Jargono",
  "Targa",
  "Targa Plateau",
  "Cynder",
  "Trederra",
  "Derelict Ship",
  "Blasted Wastes",
  "The Canyons",
]);

// Build a flat array of IDs with each ID repeated by its copy count.
// Drawing by splicing a random index perfectly mirrors a shuffled physical deck.
function buildGearPool(gearMap) {
  const pool = [];
  for (const [id] of gearMap) {
    const copies = GEAR_DECK_COPIES[id] ?? 1;
    for (let i = 0; i < copies; i++) pool.push(id);
  }
  // Shuffle with Fisher-Yates so the initial order is random
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

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
  const { maps, sets, idIndex } = useMemo(() => {
    const gearMap = new Map();
    const mineMap = new Map();
    const owMap = new Map();
    const idIndex = new Map();

    gearCards.forEach((it) => {
      if (!it?.id) return;
      gearMap.set(it.id, it);
      idIndex.set(it.id, { deck: "GEAR" });
    });

    mineArtifacts.forEach((it) => {
      if (!it?.id) return;
      mineMap.set(it.id, it);
      idIndex.set(it.id, { deck: "MINE" });
    });

    otherWorldArtifacts.forEach((it) => {
      if (!it?.id) return;
      owMap.set(it.id, it);
      const tag = Array.isArray(it.tags) ? it.tags.find((t) => OW_TAGS.has(t)) : null;
      idIndex.set(it.id, { deck: "OW", tag: tag || null });
    });

    const mineIds = new Set(mineMap.keys());

    const owByTag = new Map();
    for (const [id, meta] of idIndex) {
      if (meta.deck !== "OW") continue;
      const tag = meta.tag || "__ANY__";
      if (!owByTag.has(tag)) owByTag.set(tag, new Set());
      owByTag.get(tag).add(id);
    }

    return { maps: { gearMap, mineMap, owMap }, sets: { mineIds, owByTag }, idIndex };
  }, []);

  // Gear pool: flat array of IDs (one entry per physical copy).
  // Splicing a random index = draw without replacement from a shuffled deck.
  // When empty, rebuild and reshuffle (like picking up the discard pile).
  const gearPoolRef = useRef(null);
  const getGearPool = () => {
    if (!gearPoolRef.current || gearPoolRef.current.length === 0) {
      gearPoolRef.current = buildGearPool(maps.gearMap);
    }
    return gearPoolRef.current;
  };

  const mineAvailRef = useRef(new Set(sets.mineIds));
  const owAvailRef = useRef(
    new Map([...sets.owByTag.entries()].map(([k, v]) => [k, new Set(v)]))
  );

  const drawGear = () => {
    const pool = getGearPool();
    const idx = Math.floor(Math.random() * pool.length);
    const pickedId = pool.splice(idx, 1)[0];
    return maps.gearMap.get(pickedId) || null;
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
    if (!pool || pool.size === 0) pool = owAvailRef.current.get("__ANY__");
    if (!pool || pool.size === 0) return null;
    const pickId = pickRandomFromSet(pool);
    if (!pickId) return null;
    pool.delete(pickId);
    return maps.owMap.get(pickId) || null;
  };

  // Release: put a copy back into whichever pool it came from
  const release = (id) => {
    const meta = idIndex.get(id);
    if (!meta) return false;

    if (meta.deck === "GEAR") {
      // Push one copy back — mirrors physically returning a card to the discard
      getGearPool().push(id);
      return true;
    }
    if (meta.deck === "MINE") {
      mineAvailRef.current.add(id);
      return true;
    }
    if (meta.deck === "OW") {
      const key = meta.tag || "__ANY__";
      if (!owAvailRef.current.has(key)) owAvailRef.current.set(key, new Set());
      owAvailRef.current.get(key).add(id);
      return true;
    }
    return false;
  };

  const value = useMemo(() => ({ drawGear, drawMineArtifact, drawOtherWorldArtifact, release }), []);

  return (
    <DeckRegistryCtx.Provider value={value}>
      {children}
    </DeckRegistryCtx.Provider>
  );
}

export function useDeckRegistry() {
  const ctx = useContext(DeckRegistryCtx);
  if (!ctx) throw new Error("useDeckRegistry must be used inside a DeckRegistryProvider");
  return ctx;
}
