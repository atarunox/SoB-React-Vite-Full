/* FIXME: Unbalanced braces/parens detected: braces=0 parens=-2 brackets=0. Review this file. */
// src/context/HeroContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { db, localMode } from '../firebase/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { sanitizeHero } from '../utils/sanitizeHero';

const HeroContext = createContext(null);

// Firestore-safe sanitizer
function sanitizeForFirestore(value) {
  if (value === undefined) return null;
  if (typeof value === 'number' && Number.isNaN(value)) return null;
  if (typeof value === 'function') return null;

  if (Array.isArray(value)) return value.map(sanitizeForFirestore);

  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const sv = sanitizeForFirestore(v);
      if (sv !== undefined) out[k] = sv;
    }
    return out;
  }
  return value;
}

// tiny stable JSON helper for equality checks
const safeStringify = (obj) => {
  try { return JSON.stringify(obj); } catch { return ''; }
};

export function HeroProvider({ children }) {
  const [activeHeroId, setActiveHeroId] = useState(() => {
    try {
      return localStorage.getItem('activeHeroId') || null;
    } catch {
      return null;
    }
  });

  const [hero, setHero] = useState(null);

  // Prevent “echo” writes when we’re loading/swapping heroes
  const skipNextFirestoreUpdate = useRef(false);

  // Track last saved payload to avoid redundant writes
  const lastSavedJsonRef = useRef('');

  // Optional: small debounce on writes
  const saveTimer = useRef(null);

  // Persist activeHeroId locally
  useEffect(() => {
    try {
      if (activeHeroId) localStorage.setItem('activeHeroId', activeHeroId);
    } catch {}
  }, [activeHeroId]);

  // Load the currently active hero whenever activeHeroId changes
  const selectHeroById = useCallback(
    async (id) => {
      if (!id) {
        setHero(null);
        return;
      }

      let loaded = null;

      // 1) Try localStorage cache first (fast)
      try {
        const cached = localStorage.getItem(id);
        if (cached) {
          const parsed = JSON.parse(cached);
          const cleaned = sanitizeHero({ id, ...parsed }) || { id, ...parsed };
          loaded = cleaned;
        }
      } catch {}

      // 2) Firestore (if enabled)
      if (!localMode && db) {
        try {
          const ref = doc(db, 'heroes', id);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data();
            const cleaned = sanitizeHero({ id, ...data }) || { id, ...data };
            loaded = cleaned;
            // keep local cache in sync (sanitized)
            try {
              localStorage.setItem(id, JSON.stringify(cleaned));
            } catch {}
          }
        } catch (e) {
          console.error('[HeroContext] Error loading hero from Firestore:', e);
        }
      }

      // Fall back: if nothing loaded from FS, at least use local cache result
      if (!loaded) {
        // if no cache either, keep previous hero or set minimal object
        try {
          const cached = localStorage.getItem(id);
          if (cached) {
            const parsed = JSON.parse(cached);
            loaded = sanitizeHero({ id, ...parsed }) || { id, ...parsed };
          }
        } catch {}
      }

      // Apply if meaningfully different, and make sure we don’t echo-write it back
      if (loaded) {
        const nextJson = safeStringify(loaded);
        const prevJson = safeStringify(hero);
        if (nextJson !== prevJson) {
          skipNextFirestoreUpdate.current = true; // don’t immediately write this back
          setHero(loaded);
          lastSavedJsonRef.current = nextJson; // align the "last saved" marker
        }
      } else {
        setHero({ id }); // at least have an object with id
      }
    },
    [hero]
  );

  useEffect(() => {
    selectHeroById(activeHeroId);
  }, [activeHeroId, selectHeroById]);

  // Save active hero to Firestore/localStorage whenever it changes
  useEffect(() => {
    const h = hero;
    if (!h?.id) return;

    // Always keep local copy fresh (already sanitized)
    try {
      localStorage.setItem(h.id, JSON.stringify(h));
    } catch (e) {
      console.warn('[HeroContext] LocalStorage write failed:', e);
    }

    const clean = sanitizeForFirestore(h);
    const cleanJson = safeStringify(clean);

    // Don’t write if nothing changed since last save
    if (cleanJson === lastSavedJsonRef.current) {
      if (skipNextFirestoreUpdate.current) skipNextFirestoreUpdate.current = false;
      return;
    }

    // Optionally write to Firestore
    if (!localMode && db && !skipNextFirestoreUpdate.current) {
      // debounce ~200ms to coalesce bursts
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        const ref = doc(db, 'heroes', h.id);
        setDoc(ref, clean, { merge: true })
          .then(() => {
            lastSavedJsonRef.current = cleanJson;
          })
          .catch((e) => {
            console.error('[HeroContext] Error saving hero to Firestore:', e);
          });
      }, 200);
    } else {
      // local-only mode: still advance the lastSaved marker
      lastSavedJsonRef.current = cleanJson;
    }

    if (skipNextFirestoreUpdate.current) {
      skipNextFirestoreUpdate.current = false;
    }

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
    };
  }, [hero]);

  // Public updater: merge by id, sanitize, keep caches in sync
  const updateHero = useCallback((updates) => {
    setHero((prev) => {
      const id = updates?.id || prev?.id;
      if (!id) return prev; // nothing to merge into

      const merged = { ...(prev || {}), ...updates, id };

      // 🔸 always bump a rev to force consumers (like StatsTab) to recompute
      const bumped = { ...merged, _rev: Date.now(), updatedAt: Date.now() };

      // sanitize to ensure: gear uses `mods`, unified `conditions`, etc.
      const cleaned = sanitizeHero(bumped) || bumped;

      // local cache immediately
      try {
        localStorage.setItem(id, JSON.stringify(cleaned));
        localStorage.setItem('activeHeroId', id);
      } catch {}

      return cleaned;
    });
  }, []);

  const value = useMemo(
    () => ({
      activeHeroId,
      setActiveHeroId,
      hero,
      setHero,        // keep exported in case you truly need to replace wholesale
      updateHero,     // preferred: merges, sanitizes & persists
    }),
    [activeHeroId, hero, updateHero]
  );

  return <HeroContext.Provider value={value}>{children}</HeroContext.Provider>;
}

export function useHero() {
  const ctx = useContext(HeroContext);
  if (!ctx) throw new Error('useHero must be used inside <HeroProvider>');
  return ctx;
}
