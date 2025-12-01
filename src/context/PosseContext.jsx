// src/context/PosseContext.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { db } from '../firebase/firebaseConfig';
import {
  doc,
  setDoc,
  collection,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';

const PosseContext = createContext(null);

// ------------------------- utils -------------------------

function safeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

// Ensure we never write "hero_<id>" as a Firestore doc id
const normalizeDocId = (raw) => {
  const s = String(raw ?? '');
  return s.startsWith('hero_') ? s.slice(5) : s;
};

// Remove values Firestore rejects, and clean nested structures
function sanitize(obj) {
  if (obj == null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || typeof v === 'function') continue;
    // Extra guard: skip keys with '.' which are illegal in Firestore field names
    if (k.includes('.')) continue;
    out[k] = sanitize(v);
  }
  return out;
}

// Strip transient / derived fields before persisting to Firestore
function strip(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  const {
    // common derived / UI-only fields we never want to persist if they exist
    currentStats,
    calculatedStats,
    detailedStats,
    derivedStats,
    statsBySource,
    statsCache,
    _localOnly,
    _ephemeral,
    // add more here as needed
    ...rest
  } = obj;

  return sanitize(rest);
}

// Stable stringify (sorted keys) to avoid false diffs on key order
function stableStringify(value) {
  const seen = new WeakSet();
  const stringify = (v) => {
    if (v === null || typeof v !== 'object') return JSON.stringify(v);
    if (seen.has(v)) return '"[Circular]"';
    seen.add(v);

    if (Array.isArray(v)) {
      return '[' + v.map(stringify).join(',') + ']';
    }
    const keys = Object.keys(v).sort();
    const kv = keys.map((k) => JSON.stringify(k) + ':' + stringify(v[k]));
    return '{' + kv.join(',') + '}';
  };
  return stringify(value);
}

// Build a deterministic signature of a hero to compare snapshots
function stableHeroSignature(h) {
  if (!h) return '';
  const {
    updatedAt: _ignore, // ignore volatile timestamp
    id,
    localId,
    name,
    gear = {},
    inventory = [],
    extraGearSlots = [],
    sidebags = null,
    ...rest
  } = h;

  // Only include what matters for rendering / logic. Keep ordering stable.
  const sig = {
    id: id ?? localId,
    name: name ?? '',
    gear,
    inventory,
    extraGearSlots,
    sidebags,
    rest,
  };
  return stableStringify(sig);
}

function equalHeroLists(a = [], b = []) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const ida = a[i].id ?? a[i].localId;
    const idb = b[i].id ?? b[i].localId;
    if (ida !== idb) return false;
    if (stableHeroSignature(a[i]) !== stableHeroSignature(b[i])) return false;
  }
  return true;
}

// ---------------------- provider -------------------------

export function PosseProvider({ children }) {
  const [posse, setPosse] = useState([]);
  const [activeHeroId, setActiveHeroId] = useState(
    () => localStorage.getItem('activeHeroId') || ''
  );

  const unsubRef = useRef(null);
  const posseRef = useRef(posse);
  useEffect(() => {
    posseRef.current = posse;
  }, [posse]);

  // Load posse (Firestore or local-only)
  useEffect(() => {
    if (db?.localMode) {
      console.warn('[Posse] Firestore not ready (localMode). Using local storage only.');
      try {
        const raw = localStorage.getItem('posse') || '[]';
        setPosse(JSON.parse(raw));
      } catch {
        setPosse([]);
      }
      return;
    }

    const colRef = collection(db, 'heroes');
    unsubRef.current = onSnapshot(
      colRef,
      (snap) => {
        const list = snap.docs
          .filter((d) => !String(d.id).startsWith('hero_'))
          .map((d) => ({ id: d.id, ...d.data() }));

        // Deterministic order for comparisons
        list.sort((a, b) =>
          String(a.id ?? a.localId).localeCompare(String(b.id ?? b.localId))
        );

        // Only update state if the effective data changed
        const currentSorted = [...posseRef.current].sort((a, b) =>
          String(a.id ?? a.localId).localeCompare(String(b.id ?? b.localId))
        );
        if (!equalHeroLists(currentSorted, list)) {
          setPosse(list);
        }
      },
      (err) => {
        console.error('[Posse] Firestore subscription error:', err);
      }
    );

    return () => {
      unsubRef.current?.();
    };
  }, []);

  // Mirror posse to localStorage (handy in localMode/offline)
  useEffect(() => {
    try {
      localStorage.setItem('posse', JSON.stringify(posse));
    } catch {}
  }, [posse]);

  // Keep activeHeroId in localStorage
  useEffect(() => {
    if (activeHeroId) {
      try {
        localStorage.setItem('activeHeroId', activeHeroId);
      } catch {}
    }
  }, [activeHeroId]);

  // ---------------------- API methods ----------------------

  const addHero = useCallback(
    async (heroLike) => {
      if (!heroLike || typeof heroLike !== 'object') {
        console.warn('[PosseContext] addHero called without a valid hero object', heroLike);
        return;
      }

      const rawId = heroLike.id || heroLike.localId || safeId();
      const id = normalizeDocId(rawId);

      const merged = sanitize({
        ...heroLike,
        id,
        localId: heroLike.localId || id,
        updatedAt: Date.now(),
      });

      // Make new hero the active one by default
      setActiveHeroId(id);
      try {
        localStorage.setItem('activeHeroId', id);
      } catch {}

      if (!db || db?.localMode) {
        // Pure local mode
        setPosse((prev) => {
          const exists = prev.some(
            (h) =>
              normalizeDocId(h.id) === id ||
              normalizeDocId(h.localId) === id
          );
          const next = exists
            ? prev.map((h) =>
                normalizeDocId(h.id) === id ||
                normalizeDocId(h.localId) === id
                  ? merged
                  : h
              )
            : [...prev, merged];

          try {
            localStorage.setItem('posse', JSON.stringify(next));
          } catch {}
          return next;
        });
        return;
      }

      // Firestore mode
      try {
        const ref = doc(db, 'heroes', id);
        await setDoc(ref, strip(merged), { merge: true });
      } catch (err) {
        console.error('[Posse] addHero Firestore setDoc failed:', err);
      }
    },
    []
  );

  const updateHero = useCallback(
    async (idOrUpdates, maybePatch) => {
      // Allow both: updateHero(updatesObj) and updateHero(id, patchOrFn)
      let updates = idOrUpdates;

      // Legacy / 2-arg style: updateHero(id, patchOrFn)
      if (typeof idOrUpdates === 'string' || typeof idOrUpdates === 'number') {
        const idNorm = normalizeDocId(idOrUpdates);

        const current =
          posseRef.current?.find(
            (h) =>
              normalizeDocId(h.id) === idNorm ||
              normalizeDocId(h.localId) === idNorm
          ) || null;

        if (!current) {
          console.warn('[PosseContext] updateHero: hero not found for id', idOrUpdates);
          return;
        }

        const patch =
          typeof maybePatch === 'function'
            ? maybePatch(current)
            : maybePatch;

        if (!patch || typeof patch !== 'object') {
          // nothing to apply
          return;
        }

        updates = {
          ...current,
          ...patch,
          id: current.id || idNorm,
          localId: current.localId || current.id || idNorm,
        };
      }

      // At this point we expect a proper object
      if (!updates || typeof updates !== 'object') {
        console.warn('[PosseContext] updateHero called without valid updates', updates);
        return;
      }

      const rawId = updates.id || updates.localId || activeHeroId;
      if (!rawId) {
        console.warn('[PosseContext] updateHero called without id/localId/activeHeroId');
        return;
      }
      const id = normalizeDocId(rawId);

      const current = posseRef.current?.find(
        (h) =>
          normalizeDocId(h.id) === id ||
          normalizeDocId(h.localId) === id
      );

      const merged = current
        ? sanitize({
            ...current,
            ...updates,
            id,
            localId: current.localId || updates.localId || id,
            updatedAt: Date.now(),
          })
        : sanitize({
            ...updates,
            id,
            localId: updates.localId || id,
            updatedAt: Date.now(),
          });

      if (
        current &&
        stableStringify(strip(current)) === stableStringify(strip(merged))
      ) {
        // No effective change
        return;
      }

      if (!db || db?.localMode) {
        // Local-only mode
        setPosse((prev) => {
          const exists = prev.some(
            (h) =>
              normalizeDocId(h.id) === id ||
              normalizeDocId(h.localId) === id
          );
          const next = exists
            ? prev.map((h) =>
                normalizeDocId(h.id) === id ||
                normalizeDocId(h.localId) === id
                  ? merged
                  : h
              )
            : [...prev, merged];

          try {
            localStorage.setItem('posse', JSON.stringify(next));
          } catch {}
          return next;
        });
      } else {
        // Firestore mode
        const ref = doc(db, 'heroes', id);
        await setDoc(ref, strip(merged), { merge: true });
      }
    },
    [activeHeroId]
  );

  const removeHero = useCallback(
    async (idOrLocalId) => {
      const id = normalizeDocId(idOrLocalId);

      // Optimistic local update
      setPosse((prev) => {
        const next = prev.filter(
          (h) => normalizeDocId(h.id ?? h.localId) !== id
        );
        if (activeHeroId && normalizeDocId(activeHeroId) === id) {
          const newActive = next.length
            ? normalizeDocId(next[0].id ?? next[0].localId)
            : '';
          setActiveHeroId(newActive);
          try {
            if (newActive) localStorage.setItem('activeHeroId', newActive);
            else localStorage.removeItem('activeHeroId');
          } catch {}
        }
        try {
          localStorage.setItem('posse', JSON.stringify(next));
        } catch {}
        return next;
      });

      if (!db || db?.localMode) return;

      try {
        await deleteDoc(doc(db, 'heroes', id));
      } catch (err) {
        console.error('[Posse] Firestore delete failed for heroes/%s:', id, err);
      }
      // Defensive: clean up any legacy "hero_<id>" docs if they exist
      try {
        await deleteDoc(doc(db, 'heroes', `hero_${id}`));
      } catch {}
    },
    [activeHeroId]
  );

  const value = useMemo(
    () => ({
      posse,
      activeHeroId,
      setActiveHeroId,
      addHero,
      updateHero,
      removeHero,
    }),
    [posse, activeHeroId, addHero, updateHero, removeHero]
  );

  return (
    <PosseContext.Provider value={value}>
      {children}
    </PosseContext.Provider>
  );
}

export function usePosse() {
  return useContext(PosseContext);
}
