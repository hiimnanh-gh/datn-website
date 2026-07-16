import React from "react";

export const StatBadge = ({ icon, label, value, color }) => (
  <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex items-center gap-3 hover:border-slate-700 transition-colors">
    <div className={`${color} p-2.5 rounded-xl opacity-90`}>
      <span
        className="material-symbols-outlined text-white text-[20px]"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {icon}
      </span>
    </div>
    <div>
      <p className="text-[22px] font-bold text-white leading-none">{value}</p>
      <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-0.5">
        {label}
      </p>
    </div>
  </div>
);
