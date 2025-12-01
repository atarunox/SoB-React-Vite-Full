import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { db } from '../firebase/firebaseConfig';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const LS_KEY = 'dm_map_drawn_v1';

// Safer UUID helper
function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'id_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocal(arr) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(arr)); } catch {}
}

/**
 * Persist drawn map cards (tiles) to Firestore (if available) with localStorage fallback.
 * @param {object} opts
 * @param {string=} opts.campaignId - optional; if provided will store under users/{uid?}/campaigns/{campaignId}
 * @param {string=} opts.docPath - optional absolute doc path tuple e.g. ['shared','dmState'] (default)
 */
export function usePersistentMapDrawn(opts = {}) {
  const { campaignId, docPath } = opts;

  // Choose a doc path: shared/dmState by default
  const ref = useMemo(() => {
    if (!db) return null;
    if (Array.isArray(docPath) && docPath.length >= 2) {
      return doc(db, ...docPath);
    }
    // If you have per-campaign paths, wire them here:
    // e.g. doc(db, 'campaigns', campaignId, 'dm', 'state')
    if (campaignId) return doc(db, 'campaigns', campaignId, 'dm', 'state');
    return doc(db, 'shared', 'dmState');
  }, [campaignId, docPath]);

  const [drawn, setDrawn] = useState(loadLocal);
  const ignoreNextSnapshot = useRef(false);

  // Live -> Client
  useEffect(() => {
    if (!ref) return;
    const unsub = onSnapshot(ref, snap => {
      if (!snap.exists()) return;
      if (snap.metadata.hasPendingWrites || ignoreNextSnapshot.current) {
        ignoreNextSnapshot.current = false;
        return;
      }
      const data = snap.data();
      const serverArr = Array.isArray(data?.map?.drawn) ? data.map.drawn : [];
      setDrawn(serverArr);
      saveLocal(serverArr);
    });
    return unsub;
  }, [ref]);

  const write = useCallback(async (next) => {
    setDrawn(next);
    saveLocal(next);
    if (!ref) return; // offline fallback
    try {
      ignoreNextSnapshot.current = true;
      await setDoc(ref, { map: { drawn: next }, updatedAt: Date.now() }, { merge: true });
    } catch (e) {
      console.warn('[dmMap] Firestore write failed', e);
    }
  }, [ref]);

  // API
  const addCard = useCallback((card) => {
    // Expect shape like { id?, name, world, type?, data? }
    const enriched = { id: card.id || uid(), drawnAt: Date.now(), ...card };
    write([...drawn, enriched]);
  }, [drawn, write]);

  const removeCard = useCallback((id) => {
    write(drawn.filter(c => c.id !== id));
  }, [drawn, write]);

  const clearCards = useCallback(() => {
    write([]);
  }, [write]);

  const replaceAll = useCallback((arr) => {
    // If you need to rehydrate from an external list
    const withIds = (arr || []).map(c => ({ id: c.id || uid(), ...c }));
    write(withIds);
  }, [write]);

  return { drawn, addCard, removeCard, clearCards, replaceAll, setDrawn: write };
}
