import React from "react";

export const FilterBtn = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all border
      ${active ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}
  >
    {children}
  </button>
);
