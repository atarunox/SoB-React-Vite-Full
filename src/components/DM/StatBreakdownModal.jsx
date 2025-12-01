import React from "react";

export default function StatBreakdownModal({ show, onClose, breakdown, statName }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-2">
      <div className="bg-white rounded-lg shadow-xl p-4 max-w-md w-full relative">
        <button className="absolute right-2 top-2 btn btn-xs" onClick={onClose}>Close</button>
        <h3 className="font-bold text-lg mb-2">Stat Breakdown: {statName}</h3>
        <div className="space-y-2">
          <div>
            <b>Base Value:</b> {breakdown?.base}
          </div>
          {breakdown?.steps?.map((step, idx) => (
            <div key={idx} className="border-l-4 pl-2 mb-1"
              style={{
                borderColor: step.type === "global" ? "#4f46e5" :
                  step.type === "local" ? "#ca8a04" : "#64748b"
              }}>
              <b>
                {step.type === "global" ? "Global Modifier" :
                 step.type === "local" ? "Group Modifier" :
                 step.type === "override" ? "Override" : "Other"}
              </b>
              {step.name && <>: <span className="font-semibold">{step.name}</span></>}
              {step.source && <div className="text-xs italic">{step.source}</div>}
              <div>Value: {step.value}</div>
              {step.effect && <div className="text-xs text-gray-500">{step.effect}</div>}
            </div>
          ))}
          <div className="mt-2 text-center">
            <b>Final Value:</b> <span className="text-xl">{breakdown?.final}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
