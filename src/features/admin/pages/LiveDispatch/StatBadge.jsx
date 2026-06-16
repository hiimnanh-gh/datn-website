import React from "react";

export const StatBadge = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
    <div className={`${color} p-2.5 rounded-xl`}>
      <span
        className="material-symbols-outlined text-white text-[20px]"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {icon}
      </span>
    </div>
    <div>
      <p className="text-[22px] font-bold text-gray-900 leading-none">
        {value}
      </p>
      <p className="text-[11px] text-gray-500 uppercase tracking-wider mt-0.5">
        {label}
      </p>
    </div>
  </div>
);
