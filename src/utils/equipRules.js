// src/utils/equipRules.js
export function getBaseHands(hero) {
  // Base is 2. If you have a field for extra hands (mutation/injury, etc.), add it here.
  // Example: hero.extraHands could be granted by a mutation.
  return 2 + Number(hero?.extraHands || 0);
}

export function handsUsedByItem(item) {
  if (!item) return 0;
  // Free Attack weapons don't use hands
  if (item?.rules?.freeAttackPerTurn) return 0;

  if (typeof item?.handsRequired === 'number') return item.handsRequired;
  if (item?.twoHanded) return 2;
  if (item?.slot === 'Gun' || item?.slot === 'Hand Weapon') return 1;
  return 0;
}

export function computeHandsInUse(equippedItems = []) {
  return equippedItems.reduce((sum, it) => sum + handsUsedByItem(it), 0);
}

/**
 * canEquipItem(hero, item, equippedItems)
 * Returns { ok: boolean, reason?: string }
 */
export function canEquipItem(hero, item, equippedItems = []) {
  const baseHands = getBaseHands(hero);
  const used = computeHandsInUse(equippedItems);
  const need = handsUsedByItem(item);

  if (need === 0) return { ok: true };

  if (used + need > baseHands) {
    return {
      ok: false,
      reason: `Not enough free hands: need ${need}, have ${Math.max(baseHands - used, 0)} free.`,
    };
  }
  return { ok: true };
}
