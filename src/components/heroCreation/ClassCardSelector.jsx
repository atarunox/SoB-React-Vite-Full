import React from 'react';
import { HERO_CLASS_CARDS } from '../../data/heroClassCards';

export default function ClassCardSelector({ hero, updateHero }) {
  const cardData = HERO_CLASS_CARDS[hero.heroClass];
  if (!cardData) {
    console.warn(`❌ No class cards found for hero class: ${hero.heroClass}`);
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4 text-red-700">No Class Cards Found</h2>
        <p className="text-sm">Hero class: <strong>{hero.heroClass}</strong></p>
        <p className="text-sm text-gray-700">Check if HERO_CLASS_CARDS includes this hero class.</p>
      </div>
    );
  }

  const { classCards = [], factions = [] } = cardData;

  const selectCard = (card) => {
    const updated = {
      ...hero,
      selectedClassCard: card,
      awaitingFaction: factions.length > 0,
    };
    updateHero(updated);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Choose Your Class Card</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {classCards.map(card => (
          <div
            key={card.id}
            className="border rounded-lg p-4 shadow hover:bg-yellow-100 cursor-pointer"
            onClick={() => selectCard(card)}
          >
            <h3 className="font-semibold text-lg">{card.name}</h3>
            <p className="text-sm">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
