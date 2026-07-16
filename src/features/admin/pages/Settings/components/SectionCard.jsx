import React from "react";

export const SectionCard = ({ title, subtitle, children }) => (
  <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-800">
      <h3 className="font-bold text-white text-[15px]">{title}</h3>
      {subtitle && (
        <p className="text-[12px] text-slate-400 mt-0.5">{subtitle}</p>
      )}
    </div>
    <div className="p-6">{children}</div>
  </div>
);
export default SectionCard;
