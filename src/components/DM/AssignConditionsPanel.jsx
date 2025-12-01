import React from "react";

const CONDITION_TYPES = ["Injury", "Madness", "Mutation"];

export default function AssignConditionsPanel({ posse = [], onAssign = () => {} }) {
  if (!Array.isArray(posse) || posse.length === 0) {
    return (
      <div className="p-4 bg-white rounded shadow-md">
        <h2 className="text-xl font-bold mb-2">Assign Condition</h2>
        <div className="text-sm text-gray-500 italic">No heroes found.</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Assign Condition</h2>
      {posse.map((hero) => {
        const key = hero.id || hero.localId || hero.name;
        return (
          <div key={key} className="mb-4 p-3 border rounded bg-gray-50">
            <h3 className="font-bold">{hero.name || "Unnamed Hero"}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {CONDITION_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => onAssign(hero, type)}
                  className="btn btn-xs btn-outline"
                >
                  Assign {type}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
