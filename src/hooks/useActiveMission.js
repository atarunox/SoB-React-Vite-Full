import { useState, useCallback } from 'react';

const STORAGE_KEY = 'sob:active_mission';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function save(id) {
  try {
    if (id == null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(id));
  } catch {}
}

export function useActiveMission() {
  const [activeMissionId, setActiveMissionId] = useState(load);

  const setMission = useCallback((id) => {
    setActiveMissionId(id);
    save(id);
  }, []);

  const clearMission = useCallback(() => {
    setActiveMissionId(null);
    save(null);
  }, []);

  return { activeMissionId, setMission, clearMission };
}
