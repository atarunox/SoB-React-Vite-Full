// src/data/items/artifactDecks.js

// Pull the Mine Artifacts via *named* export:
import { mineArtifacts } from './items/mineArtifacts';

// You can later fill these with their real decks.
const targaArtifacts = [];         // Targa Plateau
const cynderArtifacts = [];        // Caverns of Cynder
const jargonoArtifacts = [];       // Swamps of Jargono
const blastedWastesArtifacts = []; // Blasted Wastes
const derelictShipArtifacts = [];  // Derelict Ship

// Master registry of decks
export const artifactDecks = {
  mine: mineArtifacts,
  targa: targaArtifacts,
  cynder: cynderArtifacts,
  jargono: jargonoArtifacts,
  blastedWastes: blastedWastesArtifacts,
  derelictShip: derelictShipArtifacts,
};

// Convenience getters
export function getArtifactDeck(name = 'mine') {
  return artifactDecks[name] || artifactDecks.mine;
}

export function drawRandomArtifact(name = 'mine') {
  const deck = getArtifactDeck(name);
  if (!Array.isArray(deck) || deck.length === 0) return null;
  const i = Math.floor(Math.random() * deck.length);
  return deck[i] || null;
}

// Provide a default export for files that do `import decks from './artifactDecks'`
export default artifactDecks;
