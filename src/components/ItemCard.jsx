import React from 'react';

const ItemCard = ({ item }) => {
  return (
    <div className="relative border-2 border-leather p-4 rounded-lg shadow-horror bg-gradient-to-br from-parchment-light to-parchment-dark space-y-2 hover:shadow-horror-lg transition-shadow duration-200">
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-2 h-2 bg-brass rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-2 h-2 bg-brass rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-2 h-2 bg-brass rounded-bl-lg" />
      <div className="absolute bottom-0 right-0 w-2 h-2 bg-brass rounded-br-lg" />

      <h4 className="font-bold text-xl text-leather-dark text-shadow-sm border-b border-leather-light pb-1">{item.name}</h4>

      <div className="space-y-1 text-sm">
        {item.cost !== undefined && <p className="text-brass-dark"><strong>Cost:</strong> ${item.cost}</p>}
        {item.value !== undefined && <p className="text-brass-dark"><strong>Value:</strong> ${item.value}</p>}
        {item.darkStone && <p className="text-corruption"><strong>Dark Stone:</strong> {item.darkStone}</p>}
        {item.weight !== undefined && <p><strong>Weight:</strong> {item.weight}</p>}
        {item.slot && <p><strong>Slot:</strong> {item.slot}</p>}
        {item.type && <p><strong>Type:</strong> {item.type}</p>}
        {item.twoHanded && <p className="text-blood"><strong>Two-Handed:</strong> Yes</p>}
        {item.upgradeSlots !== undefined && <p><strong>Upgrade Slots:</strong> {item.upgradeSlots}</p>}
        {item.effect && <p className="italic text-leather bg-parchment p-2 rounded border border-leather-light mt-2">{item.effect}</p>}
        {Array.isArray(item.effects) && item.effects.length > 0 && (
          <ul className="list-disc list-inside text-sm italic bg-parchment p-2 rounded border border-leather-light mt-2 space-y-1">
            {item.effects.map((fx, i) => <li key={i}>{fx}</li>)}
          </ul>
        )}
        {Array.isArray(item.restrictions) && item.restrictions.length > 0 && (
          <p className="text-blood-dark font-semibold bg-blood-light/10 p-2 rounded border border-blood-light mt-2">
            <strong>Restrictions:</strong> {item.restrictions.join(', ')}
          </p>
        )}
        {item.tags && <p className="text-xs text-leather-light"><strong>Tags:</strong> {item.tags.join(', ')}</p>}
      </div>
    </div>
  );
};

export default ItemCard;
