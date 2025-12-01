import React, { useState } from "react";
import { getAllStatsWithBreakdown } from "../../utils/enemyModifiers";
import { TRAIT_DECKS } from "../../data/traitDecks";
import { DARKNESS_CARDS } from "../../data/darknessCards";
import { GROWING_DREAD_CARDS } from "../../data/growingDreadCards";
import StatBreakdownModal from "./StatBreakdownModal";
import { getEnemyDifficulty } from "../../utils/enemyUtils";

export default function EnemyGroupCard({
  group,
  groupIdx,
  setCombatGroups,
  allGroups,
  posse = [],
  globalModifiers = [],
}) {
  const [expanded, setExpanded] = useState(false);
  const [breakdownModal, setBreakdownModal] = useState({ show: false, stat: "", breakdown: null });
  const [manualOverrides, setManualOverrides] = useState(group.manualOverrides || {});

  // Get full stats with breakdowns
  const statBundle = getAllStatsWithBreakdown(group, globalModifiers, manualOverrides);

  // Get the difficulty values
  const highestLevel = Math.max(...(posse.map(h => h.level || 1)), 1);
  const hasDrifter = posse.some(h => h.heroClass === "Drifter");
  const darknessPassed = globalModifiers.some(m => m.type === "darknessPassed");
  const growingDreadModifier = globalModifiers.reduce((sum, mod) => sum + (mod.eliteModifier || 0), 0);
  const manualExtraElite = group.manualExtraElite || 0;

  const { elite: eliteAbilities, brutal } = getEnemyDifficulty({
    heroLevel: highestLevel,
    hasDrifter,
    darknessPassed,
    growingDreadModifier,
    manualExtraElite,
  });

  function setManualElite(val) {
    const newGroups = [...allGroups];
    newGroups[groupIdx].manualExtraElite = val;
    setCombatGroups(newGroups);
  }

  // --- Modifiers ---
  const drawTrait = () => {
    const traitDeck = TRAIT_DECKS[group.baseStats.world] || [];
    const idx = Math.floor(Math.random() * traitDeck.length);
    const card = traitDeck[idx];
    const newGroups = [...allGroups];
    newGroups[groupIdx].modifiers.push({
      type: "trait",
      name: card.name,
      effect: card.effect || {},
      addKeywords: card.keywords || [],
      description: card.description || "",
    });
    setCombatGroups(newGroups);
  };
  const drawDarkness = () => {
    const idx = Math.floor(Math.random() * DARKNESS_CARDS.length);
    const card = DARKNESS_CARDS[idx];
    const newGroups = [...allGroups];
    newGroups[groupIdx].modifiers.push({
      type: "darkness",
      name: card.name,
      effect: card.effect || {},
      addKeywords: card.keywords || [],
      description: card.description || "",
    });
    setCombatGroups(newGroups);
  };
  const drawGrowingDread = () => {
    const idx = Math.floor(Math.random() * GROWING_DREAD_CARDS.length);
    const card = GROWING_DREAD_CARDS[idx];
    const newGroups = [...allGroups];
    newGroups[groupIdx].modifiers.push({
      type: "growingDread",
      name: card.name,
      effect: card.effect || {},
      addKeywords: card.keywords || [],
      description: card.description || "",
    });
    setCombatGroups(newGroups);
  };

  // --- Display ---
  return (
    <div className="bg-yellow-50 border rounded p-2 shadow flex flex-col gap-2">
      <StatBreakdownModal
        show={breakdownModal.show}
        onClose={() => setBreakdownModal({ show: false, stat: "", breakdown: null })}
        breakdown={breakdownModal.breakdown}
        statName={breakdownModal.stat}
      />
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <span className="font-bold text-lg">{group.name}</span>
        </div>
        <button className="btn btn-xs btn-outline" onClick={() => setExpanded((e) => !e)}>
          {expanded ? "Hide" : "Show"} Details
        </button>
      </div>
      {/* Difficulty summary */}
      <div className="flex flex-row gap-4 items-center text-base mt-1">
        <span>
          <b>Elite Abilities:</b> {eliteAbilities}
        </span>
        {brutal && <span className="text-red-600 font-bold">BRUTAL</span>}
      </div>
      {/* Manual Elite */}
      <div className="flex gap-2 mt-2">
        <button
          className="btn btn-xs btn-outline"
          onClick={() => setManualElite(manualExtraElite + 1)}
        >+1 Elite</button>
        <button
          className="btn btn-xs btn-outline"
          disabled={manualExtraElite === 0}
          onClick={() => setManualElite(Math.max(0, manualExtraElite - 1))}
        >-1 Elite</button>
      </div>
      {/* Expanded details */}
      {expanded && (
        <div className="flex flex-col gap-3 mt-2 text-base">
          {/* Stat block */}
          <div className="bg-base-200 p-2 rounded grid grid-cols-2 md:grid-cols-3 gap-2 text-sm border font-mono leading-tight">
            <div><b>Initiative:</b> {group.baseStats?.initiative ?? "—"}</div>
            <div><b>Combat:</b> {group.baseStats?.combat ?? "—"}</div>
            <div><b>Size:</b> {group.baseStats?.size || group.baseStats?.Size || "—"}</div>
            <div><b>Health:</b> {group.baseStats?.health ?? "—"}</div>
            <div><b>Defense:</b> {group.baseStats?.defense ?? "—"}</div>
            <div><b>Move:</b> {group.baseStats?.move ?? "—"}</div>
            <div><b>Escape:</b> {group.baseStats?.escape || "—"}</div>
            <div><b>XP:</b> {group.baseStats?.xp ?? "—"}</div>
            <div className="col-span-2">
              <b>Melee:</b> {
                group.baseStats?.melee
                  ? <>To-Hit {group.baseStats.melee.toHit ?? "—"}, Damage {group.baseStats.melee.damage ?? "—"}</>
                  : "—"
              }
            </div>
            <div>
              <b>Ranged:</b> {
                group.baseStats?.ranged
                  ? <>To-Hit {group.baseStats.ranged.toHit ?? "—"}, Damage {group.baseStats.ranged.damage ?? "—"}</>
                  : "—"
              }
            </div>
          </div>
          {/* Abilities */}
          <div>
            <b>Abilities:</b>
            <ul className="list-disc list-inside ml-5 whitespace-pre-line text-sm">
              {(Array.isArray(group.baseStats.abilities)
                ? group.baseStats.abilities
                : (group.baseStats.abilities || "")
                  .split(/\d: |, ?(?=[A-Za-z0-9])/g)
              ).filter(a => a && a.trim()).map((a, i) =>
                <li key={i}>{a.trim()}</li>
              )}
            </ul>
          </div>
          {/* Keywords */}
          <div className="flex gap-6 flex-wrap text-xs">
            <div><b>Keywords:</b> {statBundle.keywords?.join(", ") || "—"}</div>
          </div>
          {/* Modifiers */}
          <div>
            <b>Modifiers:</b>
            <ul className="list-disc list-inside ml-5 text-xs">
              {group.modifiers.length === 0 && <li className="italic text-gray-400">None</li>}
              {group.modifiers.map((m, i) => (
                <li key={i}>
                  <b>{m.type.toUpperCase()}:</b> <span className="font-semibold">{m.name}</span>
                  {m.description && <span className="ml-2 italic">{m.description}</span>}
                  <button
                    className="ml-2 text-red-600 underline"
                    onClick={() => {
                      const newGroups = [...allGroups];
                      newGroups[groupIdx].modifiers.splice(i, 1);
                      setCombatGroups(newGroups);
                    }}
                  >Remove</button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 mt-2">
              <button className="btn btn-xs btn-outline" onClick={drawTrait}>Draw Trait</button>
              <button className="btn btn-xs btn-outline" onClick={drawDarkness}>Draw Darkness</button>
              <button className="btn btn-xs btn-outline" onClick={drawGrowingDread}>Draw Growing Dread</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
