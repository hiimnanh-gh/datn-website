import React from "react";

export const SectionHeader = ({ icon, title, children }) => (
  <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
    <h3 className="text-[16px] font-bold text-gray-900 flex items-center gap-2">
      <span className="material-symbols-outlined text-blue-600 text-[20px]">
        {icon}
      </span>
      {title}
    </h3>
    <div className="flex items-center gap-2 flex-wrap">{children}</div>
  </div>
);
