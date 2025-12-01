// src/components/TownTab/RareFindPanel.jsx
import React, { useMemo } from 'react';
import {
  ASSETS,
  IconRowComposite,
  IconRowRepeat,
  deriveHandsRequired,
  getCost,
} from './townTabHelpers';

export default function RareFindPanel({ shopId, readRareFind, hero, onBuy }) {
  const rareFind = useMemo(() => readRareFind?.(shopId), [shopId, readRareFind]);
  if (!rareFind || !rareFind.artifact) return null;

  const canBuy =
    (hero.darkStone ?? 0) >= Number(rareFind.priceDS || 0) &&
    (hero.chosenLocation === shopId);

  const art = rareFind.artifact;
  const dsCost = (() => {
    const c = getCost(art);
    return typeof c === 'object' && c?.darkStone ? Number(c.darkStone) : 0;
  })();
  const dsCarry = Number(art?.grantsCurrency?.darkStone || art?.carries?.darkStone || 0);
  const shownDS = dsCarry > 0 && dsCost > 0 ? dsCarry : dsCarry > 0 ? dsCarry : dsCost;
  const hands = deriveHandsRequired(art);

  return (
    <div className="mt-2 p-2 rounded border bg-amber-50">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-600">Limited Offer</div>
          <div className="font-semibold">Rare Find: {art.name}</div>
        </div>
        <div className="text-sm font-semibold">Price: {rareFind.priceDS} Dark Stone</div>
      </div>

      {/* Stats row */}
      <div className="mt-2 flex flex-wrap items-center gap-2 leading-none">
        {typeof art.upgradeSlots === 'number' && (
          <IconRowComposite
            map={ASSETS.slot}
            count={art.upgradeSlots}
            title={`Upgrade Slots: ${art.upgradeSlots}`}
          />
        )}
        {typeof art.weight === 'number' && art.weight > 0 && (
          <IconRowRepeat
            src={ASSETS.weight}
            count={art.weight}
            title={`Weight: ${art.weight}`}
          />
        )}
        {shownDS > 0 && (
          <IconRowRepeat
            src={ASSETS.ds}
            count={shownDS}
            title={
              dsCarry && dsCost
                ? `Dark Stone: ${dsCarry} carried, ${dsCost} cost`
                : dsCarry
                ? `Dark Stone Carried: ${dsCarry}`
                : `Dark Stone Cost: ${dsCost}`
            }
          />
        )}
        {hands > 0 && (
          <IconRowComposite
            map={ASSETS.hand}
            count={hands}
            title={`Hands Required: ${hands}`}
          />
        )}
      </div>

      {/* Tags */}
      {Array.isArray(art.tags) && art.tags.length > 0 && (
        <div className="mt-1">
          {art.tags.map((t, i) => (
            <span
              key={`rf_tag_${i}`}
              className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-gray-100 border text-gray-700 mr-1 mt-1"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Effects / description */}
      {art?.effects && Array.isArray(art.effects) && art.effects.length > 0 && (
        <ul className="text-xs list-disc list-inside mt-1 text-gray-800">
          {art.effects.map((e, i) => (
            <li key={`eff_${i}`}>{typeof e === 'string' ? e : JSON.stringify(e)}</li>
          ))}
        </ul>
      )}
      {art?.effect && <div className="text-xs text-gray-700 mt-1">{art.effect}</div>}
      {art?.description && <div className="text-xs text-gray-700 mt-1">{art.description}</div>}

      <button
        className="btn btn-xs btn-primary mt-2"
        disabled={!canBuy}
        title={
          hero.chosenLocation !== shopId
            ? 'Visit this location first'
            : (hero.darkStone ?? 0) < Number(rareFind.priceDS || 0)
            ? 'Not enough Dark Stone'
            : ''
        }
        onClick={onBuy}
      >
        Buy Artifact
      </button>
    </div>
  );
}
