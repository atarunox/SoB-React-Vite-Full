// src/utils/isActiveMadness.js
export function isActiveMadness(m) {
  if (!m) return false;
  // backward-compatible flags across older/newer shapes
  const removed = m.removed === true || m.healed === true;
  const blocked = m.permanentBlocked === true || m.blocked === true || m.unremovableAtChurch === true;
  const activeFlag = (m.active !== false); // missing => treated as active
  const typeOk = !m.type || m.type === 'madness' || m.type === 'Madness' || m.kind === 'Madness';
  return typeOk && !removed && !blocked && activeFlag;
}
