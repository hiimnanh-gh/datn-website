import React from "react";

export const SettingRow = ({ label, description, children }) => (
  <div className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
    <div className="flex-1 pr-8">
      <p className="text-[14px] font-semibold text-gray-800">{label}</p>
      {description && (
        <p className="text-[12px] text-gray-500 mt-0.5">{description}</p>
      )}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);
export default SettingRow;
