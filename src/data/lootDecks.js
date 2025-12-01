// src/data/lootDecks.js

import mineLootDeck from './lootDecks/mineLootDeck';
import wastesLootDeck from './lootDecks/wastesLootDeck';
// ...import other world loot decks as you add them

export const LOOT_DECKS = {
  Mines: mineLootDeck,
  "Blasted Wastes": wastesLootDeck,
  // ...add other worlds
};
