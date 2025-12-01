// utils/heroStorage.js

export function saveHeroToLocal(hero) {
  if (!hero || !hero.localId) return;
  const heroes = loadHeroesFromLocal();
  heroes[hero.localId] = hero;
  localStorage.setItem('heroes', JSON.stringify(heroes));
}

export function loadHeroesFromLocal() {
  const stored = localStorage.getItem('heroes');
  return stored ? JSON.parse(stored) : {};
}

export function deleteHeroFromLocal(id) {
  const heroes = loadHeroesFromLocal();
  delete heroes[id];
  localStorage.setItem('heroes', JSON.stringify(heroes));
}