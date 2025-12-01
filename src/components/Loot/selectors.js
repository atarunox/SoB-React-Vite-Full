// src/data/loot/selectors.js
import { gearCards } from '../items/gearCards';
import { mineArtifacts } from '../items/mineArtifacts';
import { otherWorldArtifacts } from '../items/otherWorldArtifacts';

// --- Helpers --------------------------------------------------------------

export const isOtherWorld = (world) => {
  // For now, Mines = base world. Everything else is "Other World".
  // (You can make this smarter later with a whitelist/metadata.)
  return String(world || '').trim().toLowerCase() !== 'mines';
};

const drawRandom = (list) => {
  if (!Array.isArray(list) || list.length === 0) return null;
  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
};

// (Optional) normalize a few common fields so UI can render uniformly
const normalizeItem = (raw, type) => {
  if (!raw) return null;
  return {
    id: raw.id || `${type}_${Math.random().toString(36).slice(2)}`,
    name: raw.name || 'Unknown',
    type,                       // 'Gear' | 'Artifact'
    slot: raw.slot || raw.type || '',
    effects: raw.effects || raw.description || [],
    value: raw.value ?? raw.gold ?? 0,
    source: raw.source || type,
    raw,                        // keep original for details popover, etc.
  };
};

// --- World-aware deck getters --------------------------------------------

export const getGearDeckForWorld = (world) => {
  // Your current gear file has no world metadata, so we return the full deck.
  // If you later add tags like { tags: ['Mines'] }, filter here.
  return gearCards;
};

export const getArtifactDeckForWorld = (world) => {
  return isOtherWorld(world) ? otherWorldArtifacts : mineArtifacts;
};

// --- World-aware draws ----------------------------------------------------

export const drawGearForWorld = (world) => {
  const deck = getGearDeckForWorld(world);
  return normalizeItem(drawRandom(deck), 'Gear');
};

export const drawArtifactForWorld = (world) => {
  const deck = getArtifactDeckForWorld(world);
  return normalizeItem(drawRandom(deck), 'Artifact');
};
