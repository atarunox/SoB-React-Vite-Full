// src/components/TownTab/TownEventCard.jsx
import React from 'react';
import {
  getEventState as _getLocEventState,
  ensureEventRolled,
} from '../../utils/locationEventsEngine';

// one-arg engine accessor + safe fallback
const readEvent = (shopId) => {
  if (!shopId) return null;
  return _getLocEventState(shopId) || ensureEventRolled(shopId);
};

export default function TownEventCard({ shopId, onSetRoll, onResolve, extraContent, promptApi }) {
  const [resolving, setResolving] = React.useState(false);
  const [tick, setTick] = React.useState(0); // bump when engine announces changes

  // keep in sync with engine cache updates (Resolve/Reroll/Set Roll)
  React.useEffect(() => {
    const onChange = () => setTick((t) => t + 1);
    window.addEventListener('sobTownStateChanged', onChange);
    return () => window.removeEventListener('sobTownStateChanged', onChange);
  }, []);

  // read the current event from the engine
  const ev = React.useMemo(() => readEvent(shopId), [shopId, tick]);

  const title = ev?.title || 'Location Event';
  const lore = ev?.lore || '';
  const effect = ev?.effect || '';
  const resolved = !!ev?.resolved;

  const handleSetRoll = async () => {
    const current = ev?.roll ?? 7;

    // Use promptApi if available, otherwise fallback to window.prompt
    let n;
    if (promptApi?.promptNumber) {
      n = await promptApi.promptNumber({
        title: 'Set Event Roll',
        message: 'Enter total (2–12):',
        min: 2,
        max: 12,
        defaultValue: current,
      });
    } else {
      const val = window.prompt('Enter total (2–12):', String(current));
      if (val == null) return;
      n = Number(val);
    }

    if (!Number.isFinite(n) || n < 2 || n > 12) {
      alert('Enter a number between 2 and 12.');
      return;
    }
    onSetRoll?.(n); // parent will set and (optionally) bump its own nonce
  };

  const handleResolve = async () => {
    if (resolving || resolved) return;
    setResolving(true);
    try {
      await onResolve?.(); // parent resolves & emits sobTownStateChanged
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="mt-2 bg-gray-50 p-2 rounded border">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-500">Roll: {ev?.roll ?? '—'}</div>
          <div className="font-semibold">{title}</div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border ${
              resolved
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {resolved ? 'Resolved' : 'Pending'}
          </span>
          {!resolved && (
            <>
              <button
                className="btn btn-xs btn-outline"
                onClick={handleSetRoll}
                title="Enter a real-life roll"
              >
                Set roll…
              </button>
              <button
                className="btn btn-xs btn-primary"
                onClick={handleResolve}
                disabled={resolving}
              >
                {resolving ? 'Resolving…' : 'Resolve'}
              </button>
            </>
          )}
        </div>
      </div>

      {lore && <div className="text-xs italic text-gray-700 mt-1">{lore}</div>}
      {effect && (
        <div className={`text-xs mt-1 ${resolved ? 'text-gray-800' : 'text-gray-900'}`}>
          <span className="font-semibold">Effect:</span> {effect}
        </div>
      )}

      {extraContent && (
        <div className="mt-2">
          {typeof extraContent === 'function' ? extraContent({ event: ev }) : extraContent}
        </div>
      )}
    </div>
  );
}
