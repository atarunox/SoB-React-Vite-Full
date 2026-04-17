// src/components/Town/LocationEventModal.jsx
import React from 'react';
import {
  ensureEventRolled,
  resolveEvent,
  setEventRoll, // returns the rolled object directly
} from '../../utils/locationEventsEngine';
import { makeLocEventCtx } from '../../utils/locationEventContext';
import { getEventDisplay } from '../../utils/locationEventText';

export default function LocationEventModal({
  shopId,
  posseApi,
  uiApi = {},
  isOpen,
  onClose,
}) {
  const [rolled, setRolled] = React.useState(null);
  const [busy, setBusy] = React.useState(false);

  // --- UI shims ------------------------------------------------------------
  // unify optional notify → toast
  const toast = (msg) => {
    try {
      if (typeof uiApi.toast === 'function') uiApi.toast(msg);
      else console.log('[Town Event]', msg);
    } catch {}
  };

  // Load/roll on open
  React.useEffect(() => {
    if (!isOpen || !shopId) return;
    const value = ensureEventRolled(shopId); // returns the object, not { result }
    setRolled(value);
  }, [isOpen, shopId]);

  // Prevent background scroll while open
  React.useEffect(() => {
    if (!isOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isOpen]);

  // ESC to close
  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const onConfirm = async () => {
    if (!shopId || busy) return;
    try {
      setBusy(true);
      const ctx = makeLocEventCtx({ posseApi, uiApi });
      await resolveEvent(shopId, ctx); // engine uses the cached roll
      // Broadcast so TownTab/state listeners refresh immediately.
      try {
        window.dispatchEvent(new CustomEvent('sobTownStateChanged'));
      } catch {}
      onClose?.();
    } catch (err) {
      console.error(err);
      toast(`Failed to apply event: ${err?.message || 'Unknown error'}`);
      setBusy(false); // keep open so user can retry
    }
  };

  const onManualPrompt = () => {
    const current = rolled?.roll ?? 7;
    const val = window.prompt('Enter total (2–12):', String(current));
    if (val == null) return;
    const n = Number(val);
    if (!Number.isFinite(n) || n < 2 || n > 12) {
      toast('Enter a number between 2 and 12.');
      return;
    }
    const next = setEventRoll(shopId, n); // returns object (roll/title/effect/…)
    setRolled(next);
  };

  if (!isOpen || !rolled) return null;

  // Prefer stored text; fallback to data map
  const fallback = getEventDisplay(shopId, rolled.roll) || {};
  const title = rolled.title || fallback.title || 'Location Event';
  const lore = rolled.lore || fallback.lore || '';
  const effect = rolled.effect || fallback.effect || '';

  const handleBackdrop = (e) => {
    // close when clicking the dim background, not the card
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div
      className="fixed inset-0 grid place-items-center bg-black/40 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="loc-event-title"
      onMouseDown={handleBackdrop}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-5 w-full max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 id="loc-event-title" className="text-lg font-semibold">
            {title}
          </h3>

          {/* Set roll control (always available until you choose to lock it) */}
          <button
            onClick={onManualPrompt}
            className="text-sm px-3 py-2 rounded border hover:shadow transition min-h-[44px]"
            title="Set roll manually"
            disabled={busy}
          >
            Set roll…
          </button>
        </div>

        <div className="text-xs text-gray-500 mb-2">Roll: {rolled.roll}</div>

        {lore ? <p className="text-sm italic text-gray-700 mb-2">{lore}</p> : null}

        <p className="text-sm text-gray-900">
          <span className="font-semibold">Effect:</span> {effect}
        </p>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={busy}>
            Close
          </button>
          <button
            className={`btn btn-primary btn-sm ${busy ? 'loading' : ''}`}
            onClick={onConfirm}
            disabled={busy}
          >
            Apply Event
          </button>
        </div>
      </div>
    </div>
  );
}
