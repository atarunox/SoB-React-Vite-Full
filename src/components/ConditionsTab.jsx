// src/components/ConditionsTab.jsx
import React from 'react';
import { usePosse } from '../context/PosseContext';
import { useHero } from '../context/HeroContext';
// Pull lookups to enrich roll-only entries:
import { lookupInjury } from './DM/charts/injuryChart'; // safe to import here
import { TRANSFORMATIONS } from '../data/transformations';

/* ---------------- small helpers ---------------- */
const isActive = (c) => c && c.active !== false && !c.removed;

function EffectsInline({ effects = {} }) {
  const entries = Object.entries(effects).filter(([, v]) => v !== 0 && v != null);
  if (!entries.length) return null;
  const fmt = (v) => (typeof v === 'number' ? (v > 0 ? `+${v}` : `${v}`) : String(v));
  return (
    <div className="text-xs italic text-amber-800 mt-0.5">
      Effects{' '}
      {entries.map(([k, v], i) => (
        <span key={k}>
          {k} {fmt(v)}
          {i < entries.length - 1 ? ', ' : ''}
        </span>
      ))}
    </div>
  );
}

function ExtraFlagsInline({ cond }) {
  const lines = [];
  const duration = cond?.duration ? String(cond.duration) : '';
  const scopeSuffix =
    duration ? ` (${duration === 'nextAdventure' ? 'next Adventure' : duration})` : '';
  if (typeof cond?.gritCap === 'number') lines.push(`Max Grit cap ${cond.gritCap}${scopeSuffix}`);
  if (cond?.temporary) lines.push('Temporary');
  if (!lines.length) return null;
  return <div className="text-xs italic text-indigo-800 mt-0.5">{lines.join(' · ')}</div>;
}

/* ---------------- unified collectors with source pointers ---------------- */
function _pushActive(out, cond, src) {
  if (!cond) return;
  if (typeof cond === 'string') cond = { name: cond };
  if (typeof cond === 'number') cond = { roll: cond };
  if (isActive(cond)) out.push({ cond, src });
}

function buildMadnessWithSources(hero) {
  const out = [];
  if (Array.isArray(hero?.conditions?.madness)) {
    hero.conditions.madness.forEach((c, i) =>
      _pushActive(out, c, { kind: 'nested', path: 'conditions.madness', idx: i })
    );
  }
  if (Array.isArray(hero?.madness)) {
    hero.madness.forEach((c, i) =>
      _pushActive(out, c, { kind: 'legacy', path: 'madness', idx: i })
    );
  }
  if (Array.isArray(hero?.conditions)) {
    hero.conditions.forEach((c, i) => {
      const t = String(c?.type || '').toLowerCase();
      if (t === 'madness') _pushActive(out, c, { kind: 'flat', path: 'conditions', idx: i });
    });
  }
  return out;
}

function buildInjuryWithSources(hero) {
  const out = [];
  if (Array.isArray(hero?.conditions?.injury)) {
    hero.conditions.injury.forEach((c, i) =>
      _pushActive(out, c, { kind: 'nested', path: 'conditions.injury', idx: i })
    );
  }
  if (Array.isArray(hero?.injury)) hero.injury.forEach((c, i) =>
    _pushActive(out, c, { kind: 'legacy', path: 'injury', idx: i })
  );
  if (Array.isArray(hero?.injuries)) hero.injuries.forEach((c, i) =>
    _pushActive(out, c, { kind: 'legacy', path: 'injuries', idx: i })
  );
  if (Array.isArray(hero?.conditions)) {
    hero.conditions.forEach((c, i) => {
      const t = String(c?.type || '').toLowerCase();
      if (t === 'injury') _pushActive(out, c, { kind: 'flat', path: 'conditions', idx: i });
    });
  }
  return out;
}

function buildMutationWithSources(hero) {
  const out = [];
  if (Array.isArray(hero?.conditions?.mutation)) {
    hero.conditions.mutation.forEach((c, i) =>
      _pushActive(out, c, { kind: 'nested', path: 'conditions.mutation', idx: i })
    );
  }
  if (Array.isArray(hero?.mutation)) hero.mutation.forEach((c, i) =>
    _pushActive(out, c, { kind: 'legacy', path: 'mutation', idx: i })
  );
  if (Array.isArray(hero?.mutations)) hero.mutations.forEach((c, i) =>
    _pushActive(out, c, { kind: 'legacy', path: 'mutations', idx: i })
  );
  if (Array.isArray(hero?.conditions)) {
    hero.conditions.forEach((c, i) => {
      const t = String(c?.type || '').toLowerCase();
      if (t === 'mutation') _pushActive(out, c, { kind: 'flat', path: 'conditions', idx: i });
    });
  }
  return out;
}

function buildTemporaryWithSources(hero) {
  const out = [];
  if (Array.isArray(hero?.conditions?.temporary)) {
    hero.conditions.temporary.forEach((c, i) =>
      _pushActive(out, c, { kind: 'nested', path: 'conditions.temporary', idx: i })
    );
  }
  if (Array.isArray(hero?.conditions)) {
    hero.conditions.forEach((c, i) => {
      const t = String(c?.type || '').toLowerCase();
      const looksTemp =
        t === 'temporary' || c?.temporary === true || String(c?.duration || '').toLowerCase() === 'nextadventure';
      if (looksTemp) _pushActive(out, c, { kind: 'flat', path: 'conditions', idx: i });
    });
  }
  return out;
}

/* NEW: Permanent bucket so “Down a Dark Road” shows */
function buildPermanentWithSources(hero) {
  const out = [];
  if (Array.isArray(hero?.conditions?.permanent)) {
    hero.conditions.permanent.forEach((c, i) =>
      _pushActive(out, c, { kind: 'nested', path: 'conditions.permanent', idx: i })
    );
  }
  if (Array.isArray(hero?.conditions)) {
    hero.conditions.forEach((c, i) => {
      const t = String(c?.type || '').toLowerCase();
      if (t === 'permanent') _pushActive(out, c, { kind: 'flat', path: 'conditions', idx: i });
    });
  }
  return out;
}

/* ---------------- reducers ---------------- */
function removeBySrc(hero, src) {
  if (!src) return hero;
  if (src.kind === 'nested' && src.path === 'conditions.madness') {
    const list = Array.isArray(hero?.conditions?.madness) ? hero.conditions.madness : [];
    return { ...hero, conditions: { ...(hero.conditions || {}), madness: list.filter((_, i) => i !== src.idx) } };
  }
  if (src.kind === 'nested' && src.path === 'conditions.injury') {
    const list = Array.isArray(hero?.conditions?.injury) ? hero.conditions.injury : [];
    return { ...hero, conditions: { ...(hero.conditions || {}), injury: list.filter((_, i) => i !== src.idx) } };
  }
  if (src.kind === 'nested' && src.path === 'conditions.mutation') {
    const list = Array.isArray(hero?.conditions?.mutation) ? hero.conditions.mutation : [];
    return { ...hero, conditions: { ...(hero.conditions || {}), mutation: list.filter((_, i) => i !== src.idx) } };
  }
  // permanent
  if (src.kind === 'nested' && src.path === 'conditions.permanent') {
    const list = Array.isArray(hero?.conditions?.permanent) ? hero.conditions.permanent : [];
    return { ...hero, conditions: { ...(hero.conditions || {}), permanent: list.filter((_, i) => i !== src.idx) } };
  }
  // temporary
  if (src.kind === 'nested' && src.path === 'conditions.temporary') {
    const list = Array.isArray(hero?.conditions?.temporary) ? hero.conditions.temporary : [];
    return { ...hero, conditions: { ...(hero.conditions || {}), temporary: list.filter((_, i) => i !== src.idx) } };
  }

  if (src.kind === 'legacy' && src.path === 'madness') {
    const list = Array.isArray(hero?.madness) ? hero.madness : [];
    return { ...hero, madness: list.filter((_, i) => i !== src.idx) };
  }
  if (src.kind === 'legacy' && src.path === 'injury') {
    const list = Array.isArray(hero?.injury) ? hero.injury : [];
    return { ...hero, injury: list.filter((_, i) => i !== src.idx) };
  }
  if (src.kind === 'legacy' && src.path === 'injuries') {
    const list = Array.isArray(hero?.injuries) ? hero.injuries : [];
    return { ...hero, injuries: list.filter((_, i) => i !== src.idx) };
  }
  if (src.kind === 'legacy' && src.path === 'mutation') {
    const list = Array.isArray(hero?.mutation) ? hero.mutation : [];
    return { ...hero, mutation: list.filter((_, i) => i !== src.idx) };
  }
  if (src.kind === 'legacy' && src.path === 'mutations') {
    const list = Array.isArray(hero?.mutations) ? hero.mutations : [];
    return { ...hero, mutations: list.filter((_, i) => i !== src.idx) };
  }

  if (src.kind === 'flat' && src.path === 'conditions') {
    const all = Array.isArray(hero?.conditions) ? hero.conditions : [];
    const next = all.map((x, i) => (i === src.idx ? { ...x, removed: true, active: false } : x));
    return { ...hero, conditions: next };
  }

  return hero;
}

function updateBySrc(hero, src, updater) {
  if (!src) return hero;
  if (src.kind === 'nested' && src.path === 'conditions.madness') {
    const list = Array.isArray(hero?.conditions?.madness) ? hero.conditions.madness : [];
    return { ...hero, conditions: { ...(hero.conditions || {}), madness: list.map((x, i) => (i === src.idx ? updater(x) : x)) } };
  }
  if (src.kind === 'nested' && src.path === 'conditions.injury') {
    const list = Array.isArray(hero?.conditions?.injury) ? hero.conditions.injury : [];
    return { ...hero, conditions: { ...(hero.conditions || {}), injury: list.map((x, i) => (i === src.idx ? updater(x) : x)) } };
  }
  if (src.kind === 'nested' && src.path === 'conditions.mutation') {
    const list = Array.isArray(hero?.conditions?.mutation) ? hero.conditions.mutation : [];
    return { ...hero, conditions: { ...(hero.conditions || {}), mutation: list.map((x, i) => (i === src.idx ? updater(x) : x)) } };
  }
  // permanent
  if (src.kind === 'nested' && src.path === 'conditions.permanent') {
    const list = Array.isArray(hero?.conditions?.permanent) ? hero.conditions.permanent : [];
    return { ...hero, conditions: { ...(hero.conditions || {}), permanent: list.map((x, i) => (i === src.idx ? updater(x) : x)) } };
  }
  // temporary
  if (src.kind === 'nested' && src.path === 'conditions.temporary') {
    const list = Array.isArray(hero?.conditions?.temporary) ? hero.conditions.temporary : [];
    return { ...hero, conditions: { ...(hero.conditions || {}), temporary: list.map((x, i) => (i === src.idx ? updater(x) : x)) } };
  }

  if (src.kind === 'legacy' && src.path === 'madness') {
    const list = Array.isArray(hero?.madness) ? hero.madness : [];
    return { ...hero, madness: list.map((x, i) => (i === src.idx ? updater(x) : x)) };
  }
  if (src.kind === 'legacy' && src.path === 'injury') {
    const list = Array.isArray(hero?.injury) ? hero.injury : [];
    return { ...hero, injury: list.map((x, i) => (i === src.idx ? updater(x) : x)) };
  }
  if (src.kind === 'legacy' && src.path === 'injuries') {
    const list = Array.isArray(hero?.injuries) ? hero.injuries : [];
    return { ...hero, injuries: list.map((x, i) => (i === src.idx ? updater(x) : x)) };
  }
  if (src.kind === 'legacy' && src.path === 'mutation') {
    const list = Array.isArray(hero?.mutation) ? hero.mutation : [];
    return { ...hero, mutation: list.map((x, i) => (i === src.idx ? updater(x) : x)) };
  }
  if (src.kind === 'legacy' && src.path === 'mutations') {
    const list = Array.isArray(hero?.mutations) ? hero.mutations : [];
    return { ...hero, mutations: list.map((x, i) => (i === src.idx ? updater(x) : x)) };
  }

  if (src.kind === 'flat' && src.path === 'conditions') {
    const all = Array.isArray(hero?.conditions) ? hero.conditions : [];
    return { ...hero, conditions: all.map((x, i) => (i === src.idx ? updater(x) : x)) };
  }

  return hero;
}

/* ---------------- display enrichment ---------------- */
function materializeForDisplay(entry) {
  const c = entry?.cond || {};
  if ((c.name && (c.effectText || c.effect)) || c.effects) return entry;

  const type = String(c.type || '').toLowerCase();
  if (type === 'injury' && Number.isFinite(Number(c.roll))) {
    const row = lookupInjury(Number(c.roll));
    if (row) {
      const effects = row.effects || undefined;
      return {
        ...entry,
        cond: {
          ...c,
          name: c.name || row.name,
          effectText: c.effectText || row.effect,
          flavor: c.flavor || row.flavor,
          effects: c.effects || effects,
        },
      };
    }
  }
  return entry;
}

/* ---------------- component ---------------- */
export default function ConditionsTab({ hero }) {
  const { updateHero: cloudUpdateHero } = usePosse();
  const { hero: activeHero, updateHero: updateActiveHero } = useHero();

  const heroId = hero?.id || hero?.localId;

  const injuriesWithSrc   = buildInjuryWithSources(hero).map(materializeForDisplay);
  const madnessWithSrc    = buildMadnessWithSources(hero).map(materializeForDisplay);
  const mutationsWithSrc  = buildMutationWithSources(hero).map(materializeForDisplay);
  const permanentWithSrc  = buildPermanentWithSources(hero).map(materializeForDisplay);
  const temporaryWithSrc  = buildTemporaryWithSources(hero).map(materializeForDisplay);

  const notes = Array.isArray(hero?.conditionNotes) ? hero.conditionNotes : [];

  const savePatch = (patchOrUpdater) => {
    if (!heroId) return;
    const payload =
      typeof patchOrUpdater === 'function'
        ? { id: heroId, ...patchOrUpdater(hero), updatedAt: Date.now() }
        : { id: heroId, ...patchOrUpdater, updatedAt: Date.now() };

    cloudUpdateHero?.(payload);

    const activeId = activeHero?.id || activeHero?.localId;
    if (activeId && String(activeId) === String(heroId)) {
      updateActiveHero?.(payload);
    }
  };

  const removeCondition = (entry) => {
    if (!entry?.src) return;
    savePatch((h) => removeBySrc(h, entry.src));
  };

  const setForeignObjectSlot = (entry, chosen) => {
    if (!entry?.src) return;
    savePatch((h) =>
      updateBySrc(h, entry.src, (c) => ({
        ...c,
        resolvedForbid: chosen ? [chosen] : [],
      }))
    );
  };

  const removeNote = (noteId) => {
    const next = notes.filter((n) => (n?.id || '') !== noteId);
    savePatch({ conditionNotes: next });
  };

  const LockedBadge = () => (
    <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700 border border-red-200">
      Surgery-locked
    </span>
  );

  const renderList = (title, entries) => (
    <div className="mb-4">
      <h3 className="font-bold text-lg">{title}</h3>
      {entries.length === 0 ? (
        <p className="italic text-gray-600">None</p>
      ) : (
        <ul className="space-y-1">
          {entries.map((entry) => {
            const c = entry.cond || {};
            const key =
              c?.id ||
              `${title}-${entry?.src?.kind}-${entry?.src?.path}-${entry?.src?.idx}-${c?.name || 'cond'}`;
            const effectText = c?.effectText || c?.effect || '';
            const forbidOneOf = c?.rules?.forbidOneOf;
            const locked = !!c?.surgeryLocked;

            return (
              <li key={key} className="border p-2 rounded bg-yellow-50">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold flex items-center flex-wrap">
                      <span className="truncate">
                        {c?.name || (c.roll != null ? `Roll ${c.roll}` : 'Unknown Condition')}
                      </span>
                      {locked && <LockedBadge />}
                    </div>

                    {effectText && <p className="text-sm text-gray-700">{effectText}</p>}
                    {c?.effects && typeof c.effects === 'object' && <EffectsInline effects={c.effects} />}
                    <ExtraFlagsInline cond={c} />

                    {Array.isArray(forbidOneOf) && (
                      <div className="mt-1 text-xs">
                        <label className="mr-1">Blocked slot:</label>
                        <select
                          className="border px-1 py-0.5 rounded text-xs"
                          value={(c.resolvedForbid && c.resolvedForbid[0]) || ''}
                          onChange={(e) => setForeignObjectSlot(entry, e.target.value || null)}
                        >
                          <option value="">— choose —</option>
                          {forbidOneOf.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded shrink-0"
                    onClick={() => removeCondition(entry)}
                    title="Remove / mark inactive"
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  const renderNotes = () => (
    <div className="mb-4">
      <h3 className="font-bold text-lg">Permanent Modifiers / Notes</h3>
      {notes.length === 0 ? (
        <p className="italic text-gray-600">None</p>
      ) : (
        <ul className="space-y-1">
          {notes.map((n) => {
            const id = n?.id || `note-${n?.ts || Math.random()}`;
            const kind = n?.kind || 'Note';
            const ts = n?.ts ? new Date(n.ts).toLocaleString() : '';
            let title = kind;

            if (kind === 'MaxChange') {
              const stat = n?.stat || 'Max';
              const delta = Number(n?.delta ?? 0);
              const newMax = n?.newMax;
              title = `${stat}: ${delta > 0 ? '+' : ''}${delta}${Number.isFinite(newMax) ? ` (now ${newMax})` : ''}`;
            }

            const source = n?.source ? String(n.source) : '';
            const reason = n?.reason ? String(n.reason) : '';

            return (
              <li key={id} className="border p-2 rounded bg-white">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="font-semibold">{title}</div>
                    {(source || reason) && (
                      <div className="text-sm text-gray-700">
                        {source}
                        {source && reason ? ' — ' : ''}
                        {reason}
                      </div>
                    )}
                    {ts && <div className="text-xs opacity-60 mt-0.5">{ts}</div>}
                  </div>
                  <button
                    type="button"
                    className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded"
                    onClick={() => removeNote(n?.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  const pendingMutations = mutationsWithSrc.filter(
    e => e?.cond?.source === 'Corruption Overflow' || e?.cond?.name === 'Mutation — Roll Needed'
  );

  const allMutationNames = mutationsWithSrc
    .map(e => e?.cond?.name)
    .filter(n => n && n !== 'Mutation — Roll Needed');

  const hasDuplicateMutation = allMutationNames.length !== new Set(allMutationNames).size;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Conditions</h2>

      {hasDuplicateMutation && (
        <div className="mb-4 bg-black text-white rounded-lg p-3 border-2 border-red-600 text-center space-y-1">
          <div className="text-2xl font-black text-red-400">☠ CHARACTER DEATH</div>
          <div className="text-sm">This hero has rolled the same Mutation twice — they are permanently dead.</div>
        </div>
      )}

      {/* Transformation Curse banner */}
      {(() => {
        const tfm = hero?.transformation ? TRANSFORMATIONS[hero.transformation] : null;
        if (!tfm) return null;
        return (
          <div className={`mb-4 rounded-lg border-2 ${tfm.theme.border} ${tfm.theme.bg} p-3 space-y-2`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-xs font-bold uppercase tracking-widest ${tfm.theme.text}`}>Transformation Curse</div>
                <div className={`font-bold text-base ${tfm.theme.text}`}>{tfm.name}</div>
                <div className="text-white/50 text-xs">{tfm.curseSource}</div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded ${tfm.theme.badge}`}>{tfm.keyword}</span>
            </div>
            <ul className="space-y-1.5">
              {tfm.abilities.map((a, i) => (
                <li key={i} className="text-xs text-white/85 leading-snug">
                  <b className="text-white">{a.name}:</b> {a.effect}
                </li>
              ))}
            </ul>
          </div>
        );
      })()}

      {pendingMutations.length > 0 && !hasDuplicateMutation && (
        <div className="mb-4 bg-purple-900 text-purple-100 rounded-lg p-3 border border-purple-500 space-y-1">
          <div className="font-bold text-sm">⚠ {pendingMutations.length} Mutation{pendingMutations.length > 1 ? 's' : ''} Pending — Roll Needed</div>
          <div className="text-xs text-purple-300">
            Corruption overflowed. Roll D66 on the Mutation chart and update each entry below with the result.
            If you roll the same mutation this hero already has → character death.
          </div>
        </div>
      )}

      {renderList('Permanent Effects', permanentWithSrc)} {/* shows Dark Road */}
      {renderList('Temporary Conditions', temporaryWithSrc)}
      {renderList('Injuries', injuriesWithSrc)}
      {renderList('Madness', madnessWithSrc)}
      {renderList('Mutations', mutationsWithSrc)}

      {renderNotes()}
    </div>
  );
}
