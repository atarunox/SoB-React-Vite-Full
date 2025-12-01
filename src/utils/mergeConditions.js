// src/utils/mergeConditions.js

// Normalize various shapes into a bucketed object without destroying data.
// Supports:
//  - undefined/null    → {injury:[], madness:[], mutation:[], temporary:[], parasite:[], permanent:[], other:[]}
//  - flat array        → puts items into appropriate buckets by `type`, keeps unknowns in `other`
//  - object with some buckets → fills missing buckets, keeps extras
export function normalizeConditionsObject(conditions) {
  const base = {
    injury: [],
    madness: [],
    mutation: [],
    temporary: [],
    parasite: [],
    permanent: [],
    other: [], // fallback for unknown types or legacy entries
  };

  if (!conditions) return { ...base };

  // Already bucketed object?
  if (!Array.isArray(conditions) && typeof conditions === 'object') {
    const out = { ...base, ...conditions };
    // Ensure arrays
    for (const k of Object.keys(base)) {
      if (!Array.isArray(out[k])) {
        out[k] = Array.isArray(out[k]) ? out[k] : (out[k] ? [out[k]] : []);
      }
    }
    return out;
  }

  // Flat array → bucket it
  if (Array.isArray(conditions)) {
    const out = { ...base };
    for (const c of conditions) {
      const t = String(c?.type || '').toLowerCase();
      if (t === 'injury') out.injury.push(c);
      else if (t === 'madness') out.madness.push(c);
      else if (t === 'mutation') out.mutation.push(c);
      else if (t === 'temporary') out.temporary.push(c);
      else if (t === 'parasite') out.parasite.push(c);
      else if (t === 'permanent') out.permanent.push(c);
      else out.other.push(c);
    }
    return out;
  }

  // Anything else → base
  return { ...base };
}

// Return a **flat** view of all conditions (used by calculators/UIs that want one list).
// By default includes active entries (removed !== true). Pass {includeRemoved:true} to keep all.
export function flattenConditions(conditions, { includeRemoved = false } = {}) {
  const obj = normalizeConditionsObject(conditions);
  const all = [
    ...obj.injury,
    ...obj.madness,
    ...obj.mutation,
    ...obj.temporary,
    ...obj.parasite,
    ...obj.permanent, // <-- include permanent so stat math sees it
    ...obj.other,
  ];
  return includeRemoved ? all : all.filter(c => c && c.removed !== true);
}

// Low-level helper: append an entry into a specific bucket **without** dropping other buckets.
// If `conditions` was a flat array, it returns a *bucketed* object (non-breaking for readers using normalize).
export function withConditionAppended(conditions, bucket, entry) {
  const obj = normalizeConditionsObject(conditions);
  const b = String(bucket || '').toLowerCase();
  const key =
    b === 'injury' ? 'injury' :
    b === 'madness' ? 'madness' :
    b === 'mutation' ? 'mutation' :
    b === 'parasite' ? 'parasite' :
    b === 'temporary' ? 'temporary' :
    b === 'permanent' ? 'permanent' :
    'other';

  const list = Array.isArray(obj[key]) ? obj[key] : [];
  obj[key] = [...list, entry];
  return obj;
}

// Convenience: specifically append to Temporary bucket.
export function appendTemporary(conditions, entry) {
  // Make sure the entry is clearly temporary for UIs that key off flags
  const tmp = {
    temporary: true,
    type: entry?.type || 'Temporary',
    active: entry?.active !== false,
    ...entry,
  };
  return withConditionAppended(conditions, 'temporary', tmp);
}

// Convenience: specifically append to Permanent bucket.
export function appendPermanent(conditions, entry) {
  const perm = {
    permanent: true,
    type: entry?.type || 'Permanent',
    active: entry?.active !== false,
    ...entry,
  };
  return withConditionAppended(conditions, 'permanent', perm);
}

// Optional: remove-by-id across all buckets (used by some UIs)
export function removeConditionById(conditions, id) {
  const obj = normalizeConditionsObject(conditions);
  const keys = Object.keys(obj);
  const next = {};
  for (const k of keys) {
    const arr = Array.isArray(obj[k]) ? obj[k] : [];
    next[k] = arr.map(c => (c && (c.id === id)) ? { ...c, removed: true, active: false } : c);
  }
  return next;
}

// Optional: shallow update-by-id across all buckets
export function updateConditionById(conditions, id, updater) {
  const obj = normalizeConditionsObject(conditions);
  const keys = Object.keys(obj);
  const next = {};
  for (const k of keys) {
    const arr = Array.isArray(obj[k]) ? obj[k] : [];
    next[k] = arr.map(c => (c && c.id === id) ? updater(c) : c);
  }
  return next;
}
