// src/components/DM/DrawnMapTilesRow.jsx

import React, { useState, useCallback } from "react";

// Swipe hook: left/right navigation and down-to-close
function useSwipe({ onLeft, onRight, onDown }) {
  const [startX, setStartX] = useState(null);
  const [startY, setStartY] = useState(null);

  const onTouchStart = e => {
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
  };

  const onTouchEnd = e => {
    if (startX == null || startY == null) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    const absDx = Math.abs(dx), absDy = Math.abs(dy);

    if (absDx > 60 && absDx > absDy) {
      dx > 0 ? onRight() : onLeft();
    } else if (absDy > 60 && absDy > absDx) {
      dy > 0 && onDown();
    }

    setStartX(null);
    setStartY(null);
  };

  return { onTouchStart, onTouchEnd };
}

// Find the matching encounter object by name
function findEncounter(encounters, name) {
  if (!encounters || !name) return null;
  return encounters.find(
    enc => enc.name.trim().toLowerCase() === name.trim().toLowerCase()
  );
}

/**
 * Props:
 * - tiles: array of { id, name, image, advancedEncounter?: { name, note? } }
 * - encounters: array of full encounter objects (with name, effect, tags, skillChecks, etc.)
 */
export default function DrawnMapTilesRow({ tiles, encounters }) {
  const [enlargedIdx, setEnlargedIdx] = useState(null);

  const goLeft  = useCallback(() => setEnlargedIdx(i => Math.max(i - 1, 0)), []);
  const goRight = useCallback(() => setEnlargedIdx(i => Math.min(i + 1, tiles.length - 1)), [tiles.length]);
  const onDown  = useCallback(() => setEnlargedIdx(null), []);

  const swipeHandlers = useSwipe({ onLeft: goLeft, onRight: goRight, onDown });

  const tile = tiles[enlargedIdx];
  const advanced = tile?.advancedEncounter?.name
    ? findEncounter(encounters, tile.advancedEncounter.name)
    : null;

  return (
    <div className="py-2">
      {/* Tile row */}
      <div className="font-bold text-base mb-1 px-2">Drawn Map Tiles:</div>
      <div className="flex overflow-x-auto gap-3 px-2 pb-2 hide-scrollbar">
        {tiles.map((t, i) => (
          <div
            key={`${t.id}-${i}`}
            className="flex flex-col items-center min-w-[110px] max-w-[110px] cursor-pointer"
            onClick={() => setEnlargedIdx(i)}
          >
            <div className="w-[110px] h-[110px] rounded-lg shadow border bg-white overflow-hidden flex items-center justify-center">
              <img src={t.image} alt={t.name} className="object-cover w-full h-full" />
            </div>
            <div className="mt-1 text-xs text-center font-semibold truncate w-[100px]">
              {t.name}
            </div>
          </div>
        ))}
      </div>

      {/* ENLARGED BOTTOM DRAWER OVERLAY */}
      {tile && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setEnlargedIdx(null)}
            style={{ touchAction: 'none' }}
          />

          {/* Drawer */}
          <div
  className="fixed left-0 right-0 z-50 bg-white rounded-t-2xl shadow-lg p-4 flex flex-col items-center animate-slideUp"
  style={{
    top: '8vh',               // starts 8% from the top
    bottom: 0,
    minHeight: 280,
    maxHeight: '84vh',        // up to 84% of screen height
    overflowY: 'auto',
    width: '100vw',
    touchAction: 'none',
  }}
  {...swipeHandlers}
  onClick={e => e.stopPropagation()}
>

            {/* Drag handle */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mb-3" />

            {/* Close button */}
            <button
              className="absolute top-4 right-6 text-3xl text-gray-600 hover:text-red-500 z-60"
              onClick={() => setEnlargedIdx(null)}
              aria-label="Close"
              tabIndex={0}
            >
              &times;
            </button>

            {/* Enlarged image */}
            <img
              src={tile.image}
              alt={tile.name}
              className="rounded-lg mb-3"
              style={{
                maxWidth: "92vw",
                maxHeight: "30vh",
                objectFit: "contain",
                boxShadow: "0 4px 16px #2224",
              }}
              draggable={false}
            />

            <div className="font-bold text-lg mb-2">{tile.name}</div>

            {/* Advanced encounter details */}
            {advanced && (
  <div
    className="w-full max-w-[480px] border-2 border-yellow-300 bg-yellow-100/90 shadow-lg rounded-xl p-4 mb-4 relative"
    style={{
      backgroundImage: "url(/assets/parchment-texture.png), linear-gradient(180deg,#fffbe6 70%,#f8e9b7 100%)",
      backgroundBlendMode: "multiply",
      backgroundSize: "cover",
      backgroundRepeat: "repeat",
      borderColor: "#f4d774"
    }}
  >
    <div className="font-bold mb-1 text-yellow-800 drop-shadow">Advanced Encounter: {advanced.name}</div>
    <div className="text-sm whitespace-pre-line mb-2 text-gray-900">{advanced.effect}</div>
    {advanced.skillChecks && (
      <div className="text-xs text-gray-700 mb-1">
        <b>Skill Checks:</b>{" "}
        {advanced.skillChecks.map((sc, i) =>
          `${sc.stat} ${sc.value}${i < advanced.skillChecks.length - 1 ? ", " : ""}`
        )}
      </div>
    )}
    {advanced.tags && (
      <div className="text-xs text-gray-500">
        <b>Tags:</b> {advanced.tags.join(", ")}
      </div>
    )}
    {tile.advancedEncounter.note && (
      <div className="text-xs text-gray-600 italic mt-1">
        {tile.advancedEncounter.note}
      </div>
    )}
  </div>
)}

          </div>
        </>
      )}
    </div>
  );
}