// dbAdapter.js
// Handles storage abstraction (localStorage or Firestore)

const isOffline = true;
const LOCAL_KEY = 'brimstone-heroes';

export async function saveHeroData(id, data) {
  if (isOffline) {
    const saved = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
    saved[id] = data;
    localStorage.setItem(LOCAL_KEY, JSON.stringify(saved));
    return;
  }
  // Firestore fallback (optional, not used in offline mode)
}

export async function loadHeroData(id) {
  if (isOffline) {
    const saved = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
    return saved[id] || null;
  }
}

export async function deleteHeroData(id) {
  if (isOffline) {
    const saved = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
    delete saved[id];
    localStorage.setItem(LOCAL_KEY, JSON.stringify(saved));
  }
}

export async function listHeroes() {
  if (isOffline) {
    const saved = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
    return Object.values(saved);
  }
}

export function clearAllHeroes() {
  if (isOffline) localStorage.removeItem(LOCAL_KEY);
}

// Utility for wired integration with HeroContext
export async function loadHeroListMap() {
  if (isOffline) {
    const saved = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
    return saved; // { id: hero }
  }
  return {}; // default fallback
}

export default function Placeholder() { return null; }
