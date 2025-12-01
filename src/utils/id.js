export function getId(h) {
  return (h && (h.id ?? h.localId)) ?? null;
}
export function ensureLocalId(h) {
  if (!h) return h;
  if (h.id || h.localId) return h;
  const lid = (globalThis.crypto?.randomUUID?.() || `tmp_${Math.random().toString(36).slice(2)}`);
  return { ...h, localId: lid };
}
