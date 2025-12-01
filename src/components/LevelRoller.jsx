import React from 'react';

function rollD6() {
  return Math.ceil(Math.random() * 6);
}

export default function LevelRoller({ levelChart, hero, updateHero }) {
  const levelTrack = hero.levelTrack || {};
  const levelBonuses = hero.levelBonuses || {};

  const toggle = (level) => {
    const isAlreadyApplied = levelTrack[level];
    const entry = levelChart[level];
    if (!entry) return;

    if (isAlreadyApplied) {
      if (!window.confirm(`Remove level ${level}? This will undo the bonuses.`)) return;

      const updated = { ...hero };
      updated.levelTrack = { ...levelTrack };
      delete updated.levelTrack[level];

      const existingBonuses = levelBonuses[level];
      if (existingBonuses) {
        for (const [key, value] of Object.entries(existingBonuses)) {
          const amt = typeof value === 'number' ? value : 0;

          if (key.includes('Rolled')) {
            const stat = key.replace('Rolled ', '');
            updated.stats = {
              ...(updated.stats || {}),
              [stat]: (updated.stats?.[stat] || 0) - amt
            };
          } else {
            updated.stats = {
              ...(updated.stats || {}),
              [key]: (updated.stats?.[key] || 0) - amt
            };
          }
        }
      }

      const newBonuses = { ...levelBonuses };
      delete newBonuses[level];
      updated.levelBonuses = newBonuses;
      updateHero(updated);
      return;
    }

    let confirmationMessage = `Apply level ${level}?`;
    let summary = '';

    if (entry.effects) {
      summary += '\nEffects:';
      for (const [key, value] of Object.entries(entry.effects)) {
        summary += `\n- ${key} +${value}`;
      }
    }
    if (entry.extraRoll) {
      summary += `\nExtra Roll: +${entry.extraRoll.die} ${entry.extraRoll.stat}`;
    }

    if (!window.confirm(confirmationMessage + summary)) return;

    const updated = { ...hero };
    updated.levelTrack = { ...levelTrack, [level]: true };

    let bonusRecord = {};

    if (entry.effects) {
      for (const [key, value] of Object.entries(entry.effects)) {
        const amt = value === 'D6' ? rollD6() : value;
        if (typeof amt === 'number') {
          updated.stats = {
            ...(updated.stats || {}),
            [key]: (updated.stats?.[key] || 0) + amt
          };
        }
        bonusRecord[key] = amt;
      }
    }

    if (entry.extraRoll) {
      const roll = rollD6();
      const stat = entry.extraRoll.stat;
      updated.stats = {
        ...(updated.stats || {}),
        [stat]: (updated.stats?.[stat] || 0) + roll
      };
      bonusRecord[`Rolled ${stat}`] = roll;
    }

    updated.levelBonuses = { ...levelBonuses, [level]: bonusRecord };
    updateHero(updated);
  };

  const renderEffects = (effects) => {
    return Object.entries(effects).map(([stat, value]) => (
      <span key={stat}>{stat} +{value} </span>
    ));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Object.entries(levelChart).map(([level, entry]) => {
        const isDone = levelTrack[level];
        return (
          <div
            key={level}
            className={`border p-3 rounded-lg shadow-md ${isDone ? 'bg-green-100 border-green-400' : 'bg-yellow-50'}`}
          >
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-lg">Level {level}</h4>
              <button
                className="btn btn-sm"
                onClick={() => toggle(level)}
              >
                {isDone ? 'Undo' : 'Apply'}
              </button>
            </div>
            {entry.name && <div className="font-bold text-sm mt-1">{entry.name}</div>}
            {entry.description && <div className="text-sm italic text-gray-700">{entry.description}</div>}
            {entry.effects && (
              <div className="text-sm mt-1">Effects: {renderEffects(entry.effects)}</div>
            )}
            {entry.bonus && <div className="text-sm">{entry.bonus}</div>}
            {entry.choice && <div className="text-sm">Choose: {entry.choice.join(' or ')}</div>}
            {entry.extraRoll && <div className="text-sm">+{entry.extraRoll.die} {entry.extraRoll.stat}</div>}
          </div>
        );
      })}
    </div>
  );
}
