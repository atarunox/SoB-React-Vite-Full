// utils/firebaseClean.js
export function cleanForFirestore(value) {
  if (value === undefined || typeof value === 'function') return null;
  if (typeof value !== 'object' || value === null) {
    return Number.isNaN(value) ? null : value;
  }
  if (Array.isArray(value)) {
    return value.map(cleanForFirestore);
  }
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (v === undefined || typeof v === 'function') continue;
    const cleaned = cleanForFirestore(v);
    if (cleaned !== undefined) out[k] = cleaned;
  }
  return out;
}
