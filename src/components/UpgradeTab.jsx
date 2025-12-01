// src/components/UpgradeTab.jsx
import React, { useMemo, useCallback, useEffect, useState } from 'react';
import getSkillTree from '../data/getSkillTree';
import getLevelingChart from '../data/getLevelingChart';
import './SkillTree.css';
import LevelRoller from './LevelRoller';
import { useHero } from '../context/HeroContext';
import { usePosse } from '../context/PosseContext';

// helpers
const norm = (s) => (s || '').trim().toLowerCase();
const skillKeyOf = (skill) => (skill?.id || skill?.name || '').trim();

function EffectsInline({ effects = {} }) {
  const entries = Object.entries(effects);
  if (!entries.length) return null;
  const THRESH_KEYS = new Set(['armor', 'spirit armor', 'defense', 'willpower']);
  const fmt = (k, v) => {
    if (typeof v === 'number') {
      const s = v > 0 ? `+${v}` : `${v}`;
      return THRESH_KEYS.has(norm(k)) ? `${s} (better)` : s;
    }
    return String(v);
  };
  return (
    <div className="text-xs italic text-amber-800 mb-1">
      Effects:{' '}
      {entries.map(([k, v], i) => (
        <span key={k}>
          {k} {fmt(k, v)}
          {i < entries.length - 1 ? ', ' : ''}
        </span>
      ))}
    </div>
  );
}

export default function UpgradeTab({ hero, updateHero }) {
  // Mirror patches to active hero so StatsTab recomputes immediately
  const { hero: activeHero, updateHero: updateActiveHero } = useHero();

  // If updateHero prop wasn’t passed, use PosseContext
  const posseCtx = usePosse();
  const cloudUpdateHero =
    typeof updateHero === 'function' ? updateHero : posseCtx?.updateHero;

  // Normalize class key to match your get* maps
  const heroId = useMemo(() => hero?.id || hero?.localId, [hero?.id, hero?.localId]);
  const heroClass = useMemo(
    () => (hero?.heroClass || '').replace(/\s+/g, ''),
    [hero?.heroClass]
  );

  const upgradeTree = useMemo(() => getSkillTree(heroClass) || [], [heroClass]);
  const levelChart = useMemo(() => getLevelingChart(heroClass), [heroClass]);
  const heroSkills = useMemo(
    () => (Array.isArray(hero?.skills) ? hero.skills : []),
    [hero?.skills]
  );

  const [longPressedSkill, setLongPressedSkill] = useState(null);

  // ---- selection helpers (support id or name) ----
  const hasSkillIn = useCallback((list, skill) => {
    const key = skillKeyOf(skill);
    const nm = skill?.name || '';
    return (list || []).some((s) => norm(s) === norm(key) || norm(s) === norm(nm));
  }, []);

  const hasSkill = useCallback(
    (skill) => hasSkillIn(heroSkills, skill),
    [heroSkills, hasSkillIn]
  );

  // ---- centralized save: persist + mirror to active hero ----
  const savePatch = useCallback(
    (patch) => {
      if (!heroId) return;
      const payload = { id: heroId, ...patch, updatedAt: Date.now() };

      if (typeof cloudUpdateHero === 'function') {
        cloudUpdateHero(payload); // Firestore/posse merge
      }

      const activeId = activeHero?.id || activeHero?.localId;
      if (
        activeId &&
        String(activeId) === String(heroId) &&
        typeof updateActiveHero === 'function'
      ) {
        updateActiveHero(payload); // HeroContext -> StatsTab sees changes now
      }
    },
    [heroId, cloudUpdateHero, activeHero?.id, activeHero?.localId, updateActiveHero]
  );

  // ---- toggle skill (minimal patch to Firestore + active hero) ----
  const toggleSkill = useCallback(
    (pathIndex, skillIndex) => {
      const skill = upgradeTree?.[pathIndex]?.[skillIndex];
      if (!skill || !heroId) return;

      const key = skillKeyOf(skill);
      const nm = skill?.name || '';

      const wasSelected = hasSkill(skill);

      // strip, then add (Set-based)
      const nextSet = new Set(
        (Array.isArray(heroSkills) ? heroSkills : []).filter(
          (s) => !(norm(s) === norm(key) || norm(s) === norm(nm))
        )
      );
      if (!wasSelected) nextSet.add(key);
      const newSkills = Array.from(nextSet);

      // Keep a flattened list of selected skill objects (match on id OR name)
      const selectedUpgrades = (upgradeTree || [])
        .flat()
        .filter(
          (s) =>
            s &&
            newSkills.some(
              (x) => norm(x) === norm(s.id || '') || norm(x) === norm(s.name || '')
            )
        );

      // minimal patch (matches how GearTab persists)
      savePatch({ skills: newSkills, upgradeTree: selectedUpgrades });
    },
    [heroId, heroSkills, upgradeTree, hasSkill, savePatch]
  );

  // ---- Aggregate selected skill effects for a quick summary ----
  const aggregatedEffects = useMemo(() => {
    const list = Array.isArray(hero?.upgradeTree) ? hero.upgradeTree : [];
    const total = {};
    for (const s of list) {
      const eff = s?.effects || {};
      for (const [k, v] of Object.entries(eff)) {
        if (typeof v === 'number') total[k] = (total[k] || 0) + v;
      }
    }
    return total;
  }, [hero?.upgradeTree]);

  // ---- Grid Level Chart (array-of-arrays) support ----
  const isGrid = Array.isArray(levelChart);

  const ensureLevelTrackGrid = useCallback(() => {
    const track = Array.isArray(hero.levelTrack) ? hero.levelTrack.map((row) => [...row]) : [];
    for (let r = 0; r < levelChart.length; r++) {
      if (!Array.isArray(track[r])) track[r] = [];
      const row = Array.isArray(levelChart[r]) ? levelChart[r] : [];
      for (let c = 0; c < row.length; c++) {
        if (typeof track[r][c] !== 'boolean') track[r][c] = false;
      }
    }
    return track;
  }, [hero.levelTrack, levelChart]);

  const toggleGridUpgrade = useCallback(
    (r, c) => {
      if (!heroId) return;
      const track = ensureLevelTrackGrid();
      track[r][c] = !track[r][c];
      savePatch({ levelTrack: track });
    },
    [heroId, ensureLevelTrackGrid, savePatch]
  );

  // ---- Map Level Chart (object) support (uses existing LevelRoller) ----
  const toggleMapUpgrade = useCallback(
    (key) => {
      if (!heroId) return;
      const track = { ...(hero.levelTrack || {}) };
      track[key] = !track[key];
      savePatch({ levelTrack: track });
    },
    [heroId, hero.levelTrack, savePatch]
  );

  // ---- Long-press handlers for skill popover ----
  const handlePressStart = (skill, e) => {
    const id = setTimeout(() => setLongPressedSkill(skill), 500);
    e.currentTarget.dataset.pressTimer = String(id);
  };
  const handlePressEnd = (e) => {
    const id = Number(e.currentTarget.dataset.pressTimer);
    if (id) clearTimeout(id);
  };
  useEffect(() => {
    return () => {
      // kill any stray timers on unmount
      const els = document.querySelectorAll('[data-press-timer]');
      els.forEach((el) => {
        const id = Number(el.getAttribute('data-press-timer'));
        if (id) clearTimeout(id);
      });
    };
  }, []);

  return (
    <div className="p-4 space-y-6">
      {/* Selected Skill Bonuses summary */}
      {Object.keys(aggregatedEffects).length > 0 && (
        <div className="rounded-xl border border-amber-700 bg-[#fff7e6] p-3">
          <div className="font-bold mb-1">Selected Skill Bonuses</div>
          <EffectsInline effects={aggregatedEffects} />
        </div>
      )}

      {/* Skill Tree */}
      <h3 className="text-xl font-bold">Skill Tree</h3>
      {upgradeTree && upgradeTree.length > 0 ? (
        <div className="skill-tree-container">
          {upgradeTree.map((path, pathIndex) => (
            <div key={pathIndex} className="space-y-2">
              {path.map(
                (skill, skillIndex) =>
                  skill && (
                    <button
                      key={skill.id || skill.name}
                      className={`skill-node ${hasSkill(skill) ? 'skill-selected animate-glow' : ''}`}
                      onClick={() => toggleSkill(pathIndex, skillIndex)}
                      onTouchStart={(e) => handlePressStart(skill, e)}
                      onTouchEnd={handlePressEnd}
                      onTouchCancel={handlePressEnd}
                      onMouseDown={(e) => handlePressStart(skill, e)}
                      onMouseUp={handlePressEnd}
                      onMouseLeave={handlePressEnd}
                      onContextMenu={(e) => { e.preventDefault(); setLongPressedSkill(skill); }}
                    >
                      <div className="skill-name">{skill.name}</div>
                      {skill.effects && <EffectsInline effects={skill.effects} />}
                      <div className="skill-desc">{skill.description || ''}</div>
                    </button>
                  )
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm italic">No skill tree found for this hero class.</p>
      )}

      {/* Level-Up Chart */}
      <h3 className="text-xl font-bold mt-6">Level-Up Chart</h3>

      {/* If grid (array-of-arrays): render inline grid */}
      {isGrid && levelChart.length > 0 ? (
        <div className="flex flex-col gap-3">
          {levelChart.map((row, r) => {
            const cells = Array.isArray(row) ? row : [];
            return (
              <div key={r} className="flex gap-3">
                {cells.map((cell, c) =>
                  cell ? (
                    <button
                      key={`${r}-${c}-${cell.name}`}
                      className={`px-3 py-2 rounded border ${
                        Array.isArray(hero.levelTrack) && hero.levelTrack?.[r]?.[c] === true
                          ? 'bg-emerald-200 border-emerald-600'
                          : 'bg-white border-amber-700'
                      }`}
                      onClick={() => toggleGridUpgrade(r, c)}
                      title={cell.description || ''}
                    >
                      <div className="font-semibold text-sm">{cell.name}</div>
                      {cell.effects && <EffectsInline effects={cell.effects} />}
                    </button>
                  ) : (
                    <div key={`${r}-${c}-empty`} className="w-16" />
                  )
                )}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* If object-map: use LevelRoller */}
      {!isGrid && levelChart && Object.keys(levelChart || {}).length > 0 ? (
        <LevelRoller
          levelChart={levelChart}
          hero={hero}
          updateHero={savePatch}   // ← mirror so HeroContext gets updates too
          onToggle={toggleMapUpgrade}
        />
      ) : null}

      {/* No chart fallback */}
      {!levelChart ||
      (isGrid ? levelChart.length === 0 : Object.keys(levelChart || {}).length === 0) ? (
        <p className="text-sm italic">No level-up chart found for this hero class.</p>
      ) : null}

      {/* Long-press popover */}
      {longPressedSkill && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setLongPressedSkill(null)}
        >
          <div className="bg-[#f9f1df] border-2 border-[#5c3a1e] p-4 rounded-lg max-w-sm text-center shadow-lg">
            <div className="font-bold text-lg mb-2">{longPressedSkill.name}</div>
            {longPressedSkill.effects && (
              <div className="italic text-green-800 mb-2">
                <EffectsInline effects={longPressedSkill.effects} />
              </div>
            )}
            <div className="text-sm">
              {longPressedSkill.description || 'No description available.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
