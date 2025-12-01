// src/firebase/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  connectFirestoreEmulator,
} from 'firebase/firestore';

// Read both legacy and Vite-style keys
const env = import.meta.env || {};
const pick = (...keys) => keys.map(k => env[k]).find(Boolean);

const cfg = {
  apiKey:             pick('VITE_FIREBASE_API_KEY',        'FIREBASE_API_KEY'),
  projectId:          pick('VITE_FIREBASE_PROJECT_ID',     'FIREBASE_PROJECT_ID'),
  appId:              pick('VITE_FIREBASE_APP_ID',         'FIREBASE_APP_ID'),
  authDomain:         pick('VITE_FIREBASE_AUTH_DOMAIN',    'FIREBASE_AUTH_DOMAIN'),
  storageBucket:      pick('VITE_FIREBASE_STORAGE_BUCKET', 'FIREBASE_STORAGE_BUCKET'),
  messagingSenderId:  pick('VITE_FIREBASE_MESSAGING_SENDER_ID', 'FIREBASE_MESSAGING_SENDER_ID'),
  measurementId:      pick('VITE_FIREBASE_MEASUREMENT_ID', 'FIREBASE_MEASUREMENT_ID'),
};

// Only require what we really need to start
const required = ['apiKey', 'projectId']; // appId optional
const missing = required.filter(k => !cfg[k]);

if (missing.length) {
  console.warn(
    '[Firebase] Missing env keys for config:',
    missing.join(', '),
    '— running in local mode (no Firestore writes).'
  );
}

export const localMode = missing.length > 0;

let app = null;
let db  = null;

if (!localMode) {
  // strip undefined keys
  Object.keys(cfg).forEach(k => cfg[k] === undefined && delete cfg[k]);

  app = initializeApp(cfg);

  // ✅ Use initializeFirestore and enable long-polling to avoid 400 Write/channel issues
  db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    // If you still hit issues on certain networks/VPNs, uncomment the next line:
    // experimentalForceLongPolling: true,
  });

  // Optional emulator wiring
  const useEmu = pick('VITE_FIREBASE_EMULATORS') === '1';
  if (useEmu) {
    const host = pick('VITE_FIRESTORE_EMULATOR_HOST') || 'localhost';
    const port = Number(pick('VITE_FIRESTORE_EMULATOR_PORT')) || 8080;
    connectFirestoreEmulator(db, host, port);
    console.info(`[Firebase] Connected Firestore emulator at ${host}:${port}`);
  }
} else {
  // Provide a stub so code can check db.localMode safely
  db = { localMode: true };
}

export { app, db };
