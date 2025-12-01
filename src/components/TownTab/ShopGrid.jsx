// src/components/TownTab/ShopGrid.jsx
import React from 'react';

export default function ShopGrid({ shops, heroChosen, onOpen }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {shops.map(([shopId, shop]) => {
        const isVisited = heroChosen === shopId;
        return (
          <button
            key={shopId}
            className={`btn ${isVisited ? 'btn-success' : 'btn-outline'} justify-between`}
            onClick={() => onOpen(shopId)}
          >
            <span>{shop.name}</span>
            {isVisited && <span className="ml-2 text-xs">(Visited)</span>}
          </button>
        );
      })}
    </div>
  );
}
