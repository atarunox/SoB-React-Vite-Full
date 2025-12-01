import React from 'react';
import './SkillTree.css';

const normalize = (s) => (s || '').trim().toLowerCase();

const SkillTree = ({ hero, updateHero, data }) => {
  if (!hero) return null;

  const flatSkills = Array.isArray(data) ? data.flat() : [];

  const handleSkillToggle = (skill) => {
    const name = skill?.name || '';
    if (!name) return;

    const current = Array.isArray(hero.skills) ? hero.skills : [];
    const exists = current.some((s) => normalize(s) === normalize(name));
    const nextSkills = exists
      ? current.filter((s) => normalize(s) !== normalize(name))
      : [...current, name];

    const id = hero.id || hero.localId;
    if (!id) return;
    updateHero({ id, skills: nextSkills });
  };

  return (
    <div className="min-h-screen bg-[url('/assets/Parchment.jpg')] bg-cover bg-no-repeat bg-center bg-fixed border border-yellow-300 rounded p-4 shadow-inner overflow-x-auto">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-6 px-2 break-words max-w-full">
        {hero.name}'s Upgrade Chart
      </h2>

      <div className="grid grid-cols-4 gap-4">
        {flatSkills.map((skill, index) => {
          if (!skill || !skill.name) {
            return (
              <div
                key={`skill-empty-${index}`}
                className="min-h-[6rem] bg-gray-100 rounded border border-dashed"
                aria-disabled="true"
              />
            );
          }

          const selected = (hero.skills || []).some(
            (s) => normalize(s) === normalize(skill.name)
          );

          return (
            <div
              key={skill.name}
              className={`skill-node ${selected ? 'skill-selected animate-glow' : ''} transition-all duration-150`}
              onClick={() => handleSkillToggle(skill)}
              style={{
                borderWidth: selected ? 3 : 1,
                borderColor: selected ? '#14532d' : '#000',
                boxShadow: selected ? '0 0 12px 2px #bef264' : undefined,
                cursor: 'pointer',
              }}
            >
              <div className="skill-name">{skill.name}</div>

              {skill.effects && (
                <div className="text-[0.65rem] font-semibold text-green-800 mb-1 leading-snug bg-yellow-200 border border-black rounded px-1">
                  {Object.entries(skill.effects)
                    .map(([stat, val]) =>
                      typeof val === 'number'
                        ? `${val > 0 ? '+' : ''}${val} ${stat}`
                        : `${stat}: ${val}`
                    )
                    .join(' / ')}
                </div>
              )}

              <div className="skill-desc">{skill.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillTree;
