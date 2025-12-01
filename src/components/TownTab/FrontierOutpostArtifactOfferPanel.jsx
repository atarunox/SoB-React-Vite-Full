// src/components/TownTab/FrontierOutpostArtifactOfferPanel.jsx
import React from 'react';

export default function FrontierOutpostArtifactOfferPanel({
  townStateApi,
  posseApi,
  uiApi,
}) {
  const state = townStateApi?.get?.() || {};
  const stayMods = state.stayMods || {};
  const offer = stayMods.foWorldArtifactOffer;

  // No offer at all → nothing to show
  if (!offer) return null;

  const { world, artifact, price, purchasedBy } = offer;

  const activeHero =
    posseApi?.getActiveHero?.() ||
    posseApi?.getHeroById?.(posseApi.getActiveHeroId?.());

  if (!activeHero) return null;

  const canAfford = (activeHero.gold || 0) >= price;

  const handleBuy = () => {
    if (!canAfford) {
      uiApi?.toast?.("You cannot afford this artifact.");
      return;
    }

    // Deduct gold
    posseApi.updateHero(activeHero.id, (h) => ({
      ...h,
      gold: (h.gold || 0) - price,
    }));

    // Mark purchased
    const newState = townStateApi.get();
    newState.stayMods = {
      ...(newState.stayMods || {}),
      foWorldArtifactOffer: {
        ...offer,
        purchasedBy: activeHero.id,
      },
    };

    townStateApi.set(newState);

    uiApi?.toast?.(`Purchased ${artifact?.name || 'Artifact'}!`);
  };

  return (
    <div className="mt-4 p-3 border border-amber-600 bg-amber-50 rounded">
      <div className="font-bold text-sm">
        Trading Post — World Artifact Offer
      </div>

      <div className="mt-2">
        <div><strong>World:</strong> {world}</div>
        <div><strong>Artifact:</strong> {artifact?.name}</div>
        <div className="text-xs text-gray-700 mt-1">
          {artifact?.description}
        </div>
      </div>

      {purchasedBy ? (
        <div className="mt-3 font-semibold text-green-700">
          Already purchased by {posseApi.getHero(purchasedBy)?.name || 'Hero'}
        </div>
      ) : (
        <>
          <div className="mt-2 font-semibold">
            Price: ${price}
          </div>

          <button
            className="btn btn-xs btn-primary mt-2"
            disabled={!canAfford}
            onClick={handleBuy}
          >
            Buy Artifact
          </button>
        </>
      )}
    </div>
  );
}
