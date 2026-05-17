import React, { useState, useMemo } from 'react';
import { TRANSFORMATIONS, TRANSFORMATION_LIST } from '../../data/transformations';

export default function DMTransformationPanel({ posse = [], updateHero }) {
  const [selectedHeroId, setSelectedHeroId] = useState('');
  const [confirming, setConfirming] = useState(null); // transformation id pending confirm

  const hero = useMemo(
    () =>
      posse.find(h => String(h.id) === String(selectedHeroId)) ||
      posse.find(h => String(h.localId) === String(selectedHeroId)),
    [posse, selectedHeroId]
  );

  const current = hero?.transformation ? TRANSFORMATIONS[hero.transformation] : null;

  const applyTransformation = (tId) => {
    if (!hero) return;
    const id = hero.id ?? hero.localId;
    updateHero({ id, transformation: tId });
    setConfirming(null);
  };

  const removeTransformation = () => {
    if (!hero) return;
    const id = hero.id ?? hero.localId;
    updateHero({ id, transformation: null });
  };

  return (
    <div className="space-y-4 p-3">
      <div>
        <h3 className="font-bold text-sm text-[#3b2f1d] mb-2 uppercase tracking-wide">
          Hero Transformations
        </h3>
        <p className="text-xs text-[#5c3a1e]/70 mb-3">
          Apply a Transformation Curse to a hero. A hero can only hold one transformation at a time —
          applying another deals 3 Corruption Hits instead (resolve manually).
        </p>

        {/* Hero selector */}
        <select
          value={selectedHeroId}
          onChange={e => { setSelectedHeroId(e.target.value); setConfirming(null); }}
          className="w-full text-sm px-3 py-2 rounded-lg border border-[#8b6b46]/50 bg-white/80 focus:outline-none focus:ring-1 focus:ring-[#b8860b]/50 mb-3"
        >
          <option value="">— Select a Hero —</option>
          {posse.map(h => {
            const id = h.id ?? h.localId;
            const tfm = h.transformation ? TRANSFORMATIONS[h.transformation] : null;
            return (
              <option key={id} value={id}>
                {h.name ?? 'Unnamed'}{tfm ? ` (${tfm.name})` : ''}
              </option>
            );
          })}
        </select>

        {!hero && (
          <p className="text-sm italic text-[#5c3a1e]/50 text-center py-4">Select a hero to manage their transformation.</p>
        )}
      </div>

      {hero && (
        <div className="space-y-3">
          {/* Active transformation */}
          {current ? (
            <div className={`rounded-lg border-2 ${current.theme.border} ${current.theme.bg} p-3 space-y-2`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-xs font-bold uppercase tracking-widest ${current.theme.text}`}>
                    Active Transformation
                  </span>
                  <div className={`font-bold text-base mt-0.5 ${current.theme.text}`}>{current.name}</div>
                  <div className="text-xs text-white/50 mt-0.5">{current.curseSource}</div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded ${current.theme.badge}`}>
                  {current.keyword}
                </span>
              </div>

              <ul className="space-y-2">
                {current.abilities.map((a, i) => (
                  <li key={i} className="text-xs text-white/85 leading-snug">
                    <b className="text-white">{a.name}:</b> {a.effect}
                  </li>
                ))}
              </ul>

              <button
                onClick={removeTransformation}
                className="w-full mt-1 text-xs py-1.5 rounded border border-red-600/60 text-red-400 hover:bg-red-900/40 transition-colors"
              >
                Remove Transformation (cured by special event)
              </button>
            </div>
          ) : (
            <div className="text-sm italic text-[#5c3a1e]/60 bg-[#fdf6e3] border border-[#8b6b46]/30 rounded-lg px-3 py-2">
              {hero.name ?? 'This hero'} has no active transformation.
            </div>
          )}

          {/* Apply a transformation */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-[#5c3a1e] mb-2">
              Apply Transformation Curse
            </div>
            {current && (
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-300 rounded px-2 py-1 mb-2">
                ⚠ This hero already has a transformation. Applying another deals 3 Corruption Hits — resolve manually before applying.
              </div>
            )}
            <div className="grid grid-cols-1 gap-2">
              {TRANSFORMATION_LIST.map(t => (
                <div key={t.id}>
                  {confirming === t.id ? (
                    <div className={`rounded-lg border ${t.theme.border} ${t.theme.bg} p-2`}>
                      <p className={`text-xs font-semibold ${t.theme.text} mb-2`}>
                        Apply <b>{t.name}</b> to {hero.name ?? 'this hero'}?
                        {current && ' (They already have a transformation — ensure 3 Corruption Hits are dealt first.)'}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => applyTransformation(t.id)}
                          className={`flex-1 text-xs py-1.5 rounded font-bold ${t.theme.badge} border ${t.theme.border}`}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirming(null)}
                          className="flex-1 text-xs py-1.5 rounded border border-[#8b6b46]/40 text-[#5c3a1e] bg-white/60"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirming(t.id)}
                      disabled={current?.id === t.id}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-colors
                        ${current?.id === t.id
                          ? `${t.theme.border} ${t.theme.bg} opacity-50 cursor-default`
                          : 'border-[#8b6b46]/40 bg-[#fdf6e3] hover:bg-[#f5e8c8] text-[#3b2f1d]'
                        }`}
                    >
                      <span className="font-bold">{t.curseName}</span>
                      <span className="ml-2 text-[#5c3a1e]/60">→ {t.name}</span>
                      {t.abilities.some(a => a.name.includes('pending')) && (
                        <span className="ml-2 text-amber-600 italic">(details pending scan)</span>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
