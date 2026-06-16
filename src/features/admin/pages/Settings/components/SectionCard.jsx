import React from "react";

export const SectionCard = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100">
      <h3 className="font-bold text-gray-900 text-[15px]">{title}</h3>
      {subtitle && (
        <p className="text-[12px] text-gray-500 mt-0.5">{subtitle}</p>
      )}
    </div>
    <div className="p-6">{children}</div>
  </div>
);
export default SectionCard;
