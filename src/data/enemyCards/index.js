import { mineEnemies as mine } from './mineEnemies';
import { targaEnemies as targa } from './targaEnemies';
import { jargonoEnemies as jargono } from './jargonoEnemies';
import { trederraEnemies as trederra } from './trederraEnemies';
import { cynderEnemies as cynder } from './cynderEnemies';
import { frontierEnemies as frontier } from './frontierEnemies';
import { shipEnemies as ship } from './shipEnemies';
import { wastesEnemies as wastes } from './wastesEnemies';
import { bellyEnemies as belly } from './bellyEnemies';
import { forestEnemies as forest } from './forestEnemies';
import { mountainEnemies as mountain } from './mountainEnemies';
import { valleyEnemies as valley } from './valleyEnemies';
import { fortressEnemies as fortress } from './fortressEnemies';
import westernEnemies from './westernEnemies';

// Flatten westernEnemies (organized by threat tier > set > enemies) into per-world arrays
function extractWesternBySet(data) {
  const bySet = {};
  for (const groups of Object.values(data)) {
    for (const group of groups) {
      if (!bySet[group.set]) bySet[group.set] = [];
      bySet[group.set].push(...(group.enemies || []));
    }
  }
  return bySet;
}
const westernBySet = extractWesternBySet(westernEnemies);

export const ENEMY_CARDS = {
  "City of the Ancients": [...mine, ...(westernBySet["City of the Ancients"] || [])],
  "Mines": mine,
  "Targa Plateau": [...targa, ...(westernBySet["Targa Plateau"] || [])],
  "Swamps of Jargono": [...jargono, ...(westernBySet["Swamps of Jargono"] || [])],
  "Jargono": jargono,
  "Trederra": trederra,
  "Caverns of Cynder": cynder,
  "Frontier Town": frontier,
  "Derelict Ship": ship,
  "Blasted Wastes": wastes,
  "Belly of the Beast": belly,
  "OtherWorld: Forest of the Dead": forest,
  "OtherWorld: Cursed Mountain": mountain,
  "OtherWorld: Valley of the Serpent Kings": valley,
  "Forbidden Fortress": fortress
};
