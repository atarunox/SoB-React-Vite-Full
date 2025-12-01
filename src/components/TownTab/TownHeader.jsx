// src/components/TownHeader.jsx
import React from 'react';

export default function TownHeader({ hero }) {
  if (!hero) return null;
  return (
    <>
      <h2 className="text-xl font-bold">Town Visit</h2>
      <p className="italic text-sm mb-2">
        {hero.name ? `Welcome, ${hero.name}. ` : null}
        Staying at: <strong>{hero.lodging || 'Undecided'}</strong>
        {hero.gold !== undefined && <span> | Gold: ${hero.gold}</span>}
        {hero.darkStone !== undefined && <span> | Dark Stone: {hero.darkStone}</span>}
        {hero.scrap !== undefined && <span> | Scrap: {hero.scrap}</span>}
        {hero.tech !== undefined && <span> | Tech: {hero.tech}</span>}
      </p>
    </>
  );
}
