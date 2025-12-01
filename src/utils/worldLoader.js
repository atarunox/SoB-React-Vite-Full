
// src/utils/worldLoader.js

export function getWorldFolder(worldName) {
  switch (worldName) {
    case 'Western':
      return '/data/worlds/Western';
    case 'Blasted Wastes':
    case 'BlastedWastes':
      return '/data/worlds/BlastedWastes';
    case 'Canyon':
      return '/data/worlds/Canyon';
    default:
      return '/data/worlds/OtherWorlds';
  }
}
