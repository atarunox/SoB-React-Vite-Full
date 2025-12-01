// src/components/modals/ExorcismModal.jsx
import React, { useMemo, useState } from 'react';
import { listActiveMadnesses } from '../../utils/isActiveMadness';

export default function ExorcismModal({ hero, onConfirm, onCancel }) {
  const options = useMemo(() => listActiveMadnesses(hero), [hero]);
  const [selectedId, setSelectedId] = useState(options[0]?.id || null);
  const [roll, setRoll] = useState('');

  const onSubmit = (e) => {
    e?.preventDefault?.();
    const chosen = options.find(m => (m.id || m.name) === selectedId) || options[0] || null;
    const n = Number(roll);
    if (!chosen) return;
    if (!(n >= 1 && Number.isFinite(n))) return;
    onConfirm?.({ madness: chosen, roll: n });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-4">
        <div className="text-lg font-semibold">Exorcism of Madness</div>
        {options.length === 0 ? (
          <div className="mt-3 text-sm text-gray-700">
            This hero has Madnesses, but none are currently eligible for Exorcism (they may be blocked or removed).
          </div>
        ) : (
          <form className="mt-3 space-y-3" onSubmit={onSubmit}>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Choose a Madness</label>
              <select
                className="w-full border rounded px-2 py-1"
                value={selectedId ?? ''}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                {options.map((m, i) => {
                  const id = m.id || m.name || `mad_${i}`;
                  return (
                    <option key={id} value={id}>
                      {m.name || m.id || `Madness ${i + 1}`}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Enter D6 roll (cost = roll × $50)
              </label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                min={1}
                step={1}
                value={roll}
                onChange={(e) => setRoll(e.target.value)}
                placeholder="1–6"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button type="button" className="btn btn-sm btn-outline" onClick={() => onCancel?.()}>
                Cancel
              </button>
              <button type="submit" className="btn btn-sm btn-primary">Confirm</button>
            </div>
          </form>
        )}
        {options.length === 0 && (
          <div className="flex items-center justify-end mt-4">
            <button className="btn btn-sm btn-primary" onClick={() => onCancel?.()}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
