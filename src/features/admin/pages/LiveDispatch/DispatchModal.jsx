import React, { useState } from "react";

export const DispatchModal = ({ incident, units, onAssign, onClose }) => {
  const [selected, setSelected] = useState(null);
  const available = units.filter((u) => u.status === "Available");
  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold text-[15px]">
                Assign Unit — {incident.id}
              </h3>
              <p className="text-slate-400 text-[12px] mt-0.5">
                {incident.type} · {incident.address}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-white p-1 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="p-5 space-y-3">
            <p className="text-[12px] text-slate-500 font-semibold uppercase tracking-wider">
              Available Units
            </p>
            {available.length === 0 && (
              <p className="text-slate-600 text-sm text-center py-4">
                No units currently available
              </p>
            )}
            {available.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelected(u.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                  selected === u.id
                    ? "border-indigo-500 bg-indigo-900/20"
                    : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${selected === u.id ? "bg-indigo-600" : "bg-slate-700"}`}
                  >
                    <span
                      className="material-symbols-outlined text-[16px] text-white"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      local_shipping
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-[13px] font-bold text-white">{u.id}</p>
                    <p className="text-[11px] text-slate-500">
                      {u.crew} · {u.zone}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-2 py-0.5 rounded-full">
                    Available
                  </span>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Fuel: {u.fuel}%
                  </p>
                </div>
              </button>
            ))}
          </div>
          <div className="px-5 pb-5 flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-700 rounded-xl text-[13px] font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => selected && onAssign(incident.id, selected)}
              disabled={!selected}
              className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-[13px] font-bold disabled:opacity-40 hover:bg-indigo-700 transition-colors"
            >
              Dispatch Unit
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
