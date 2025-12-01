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

export const ENEMY_CARDS = {
  "City of the Ancients": mine,
  "Targa Plateau": targa,
  "Swamps of Jargono": jargono,
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
