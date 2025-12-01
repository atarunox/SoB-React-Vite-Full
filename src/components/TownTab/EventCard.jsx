import React from 'react';

export default function EventCard({ ev, resolving, onSetRoll, onResolve }) {
  return (
    <div className="mt-2 bg-gray-50 p-2 rounded border">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-500">Roll: {ev?.roll ?? '—'}</div>
          <div className="font-semibold">{ev?.title || 'Location Event'}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${ev?.resolved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
            {ev?.resolved ? 'Resolved' : 'Pending'}
          </span>
          {!ev?.resolved && (
            <button className="btn btn-xs btn-outline" onClick={onSetRoll} title="Enter a real-life roll">
              Set roll…
            </button>
          )}
        </div>
      </div>
      {ev?.lore && <div className="text-xs italic text-gray-700 mt-1">{ev.lore}</div>}
      {ev?.effect && (
        <div className={`text-xs mt-1 ${ev?.resolved ? 'text-gray-800' : 'text-gray-900'}`}>
          <span className="font-semibold">Effect:</span> {ev.effect}
        </div>
      )}
      {!ev?.resolved && (
        <button className="btn btn-xs btn-primary mt-2" onClick={onResolve} disabled={resolving}>
          {resolving ? 'Resolving…' : 'Resolve'}
        </button>
      )}
    </div>
  );
}
