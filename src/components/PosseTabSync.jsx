// Local Storage helpers
const localKey = (uid, heroId) => `hero_${uid}_${heroId}`;

function saveLocalHeroData(uid, heroId, data) {
  try {
    localStorage.setItem(localKey(uid, heroId), JSON.stringify(data));
  } catch {
    /* ignore quota errors */
  }
}

function loadLocalHeroData(uid, heroId) {
  try {
    const raw = localStorage.getItem(localKey(uid, heroId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Save hero data to Firestore under a specific UID and hero ID, with offline fallback.
 */
export async function saveHeroData(uid, heroId, heroData) {
  const record = { ...heroData, updatedAt: Date.now(), ownerUid: uid };

  saveLocalHeroData(uid, heroId, record);

  // TODO: Add Firestore saving logic here
}

/**
 * Placeholder component for React import
 */
