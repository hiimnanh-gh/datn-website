import React, { useState } from "react";

export const DispatchModal = ({ incident, units, onAssign, onClose }) => {
  const [selected, setSelected] = useState(null);
  const available = units.filter((u) => u.status === "Available");
  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="bg-[#131b2e] px-6 py-4 flex items-center justify-between">
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
              className="text-slate-400 hover:text-white p-1"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="p-5 space-y-3">
            <p className="text-[12px] text-gray-500 font-semibold uppercase tracking-wider">
              Available Units
            </p>
            {available.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">
                No units currently available
              </p>
            )}
            {available.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelected(u.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                  selected === u.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-100 bg-gray-50 hover:border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${selected === u.id ? "bg-blue-600" : "bg-gray-200"}`}
                  >
                    <span
                      className="material-symbols-outlined text-[16px] text-white"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      local_shipping
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-[13px] font-bold text-gray-900">
                      {u.id}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {u.crew} · {u.zone}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    Available
                  </span>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Fuel: {u.fuel}%
                  </p>
                </div>
              </button>
            ))}
          </div>
          <div className="px-5 pb-5 flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => selected && onAssign(incident.id, selected)}
              disabled={!selected}
              className="flex-1 py-2.5 bg-[#2563eb] text-white rounded-xl text-[13px] font-bold disabled:opacity-40 hover:bg-blue-700 transition-colors"
            >
              Dispatch Unit
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
