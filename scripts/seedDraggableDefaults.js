// scripts/seedDraggableDefaults.js
import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load positions JSON
async function loadPositions() {
  const jsonPath = path.resolve(__dirname, '../data/defaultStatPositions.json');
  const raw = await readFile(jsonPath, 'utf8');
  return JSON.parse(raw);
}

function buildFirebaseConfig() {
  // prefer plain FIREBASE_*; fall back to Vite-style VITE_FIREBASE_*
  const env = process.env;
  const pick = (k) => env[k] || env[`VITE_${k}`];
  const cfg = {
    apiKey: pick('FIREBASE_API_KEY'),
    authDomain: pick('FIREBASE_AUTH_DOMAIN'),
    projectId: pick('FIREBASE_PROJECT_ID'),
    storageBucket: pick('FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: pick('FIREBASE_MESSAGING_SENDER_ID'),
    appId: pick('FIREBASE_APP_ID'),
  };
  if (!cfg.apiKey || !cfg.projectId) {
    throw new Error('Missing Firebase config (need at least FIREBASE_API_KEY and FIREBASE_PROJECT_ID).');
  }
  return cfg;
}

async function main() {
  const app = initializeApp(buildFirebaseConfig());
  const db = getFirestore(app);

  const positions = await loadPositions();

  await setDoc(
    doc(db, 'config', 'draggableStatsDefault'),
    { type: 'statPositions', version: 1, positions, updatedAt: serverTimestamp() },
    { merge: true }
  );
  console.log('[seed] Wrote config/draggableStatsDefault');
}

main().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exitCode = 1;
});
