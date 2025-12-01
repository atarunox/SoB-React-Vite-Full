// src/utils/pricing.js
import { loadTownState } from './townState';

export function getShopModsSafe(shopId) {
  const s = loadTownState();
  return s.shopMods?.[shopId] || { priceDelta: 0, destroyed: false, saleActive: false };
}

/**
 * Compute final gold price with shop modifiers.
 * - priceDelta is applied directly (+100 for Cost Increase, -50 for Sale)
 * - When priceDelta < 0 (a sale), enforce min $10 (per event text)
 */
export function priceGoldWithMods(item, shopId) {
  const baseGold =
    typeof item?.cost === 'number'
      ? item.cost
      : (item?.cost?.gold ?? 0);

  const mods = getShopModsSafe(shopId);
  let price = baseGold + (mods.priceDelta || 0);

  // Enforce sale minimum only when the delta is negative
  if ((mods.priceDelta || 0) < 0) {
    price = Math.max(10, price);
  }

  return Math.max(0, Math.floor(price));
}
