import { lootCards as lootDefault } from './lootDeck';
import { darknessCards as darknessDefault } from './darknessCards';
import { growingDreadCards as gdDefault } from './growingDreadCards';

// Extend/replace per world as you add sets
const perWorld = {
  Mines: {
    loot: lootDefault,
    darkness: darknessDefault,
    growingDread: gdDefault,
  },
  Jargono: {
    loot: lootDefault,
    darkness: darknessDefault,
    growingDread: gdDefault,
  },
  'Blasted Wastes': {
    loot: lootDefault,
    darkness: darknessDefault,
    growingDread: gdDefault,
  },
};

export function getWorldDecks(world='Mines') {
  const entry = perWorld[world] || perWorld['Mines'];
  return {
    loot: entry.loot || lootDefault,
    darkness: entry.darkness || darknessDefault,
    growingDread: entry.growingDread || gdDefault,
  };
}
