// src/utils/conditionNotes.js

// Minimal, flexible note type for the Conditions tab.
export function makeMaxChangeNote({ stat, delta, newMax, source, reason }) {
  return {
    id: `maxchg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    kind: 'MaxChange',
    stat,             // e.g., 'Max Sanity', 'Max Health'
    delta,            // +N or -N
    newMax,           // resulting max after the change
    source,           // e.g., 'Church Event 3', 'Blacksmith Event 2'
    reason,           // free text, optional
    ts: Date.now(),
  };
}

// Pure helper to append a note onto a hero object.
export function pushConditionNote(hero, note) {
  const notes = Array.isArray(hero?.conditionNotes) ? hero.conditionNotes : [];
  return { ...hero, conditionNotes: [...notes, note] };
}
