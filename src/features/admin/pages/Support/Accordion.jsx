import React, { useState } from "react";

export const Accordion = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border border-gray-100 rounded-xl overflow-hidden transition-all ${open ? "shadow-sm" : ""}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-[14px] font-semibold text-gray-900">{q}</span>
        <span
          className={`material-symbols-outlined text-gray-400 text-[20px] transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}
        >
          expand_more
        </span>
      </button>
      {open && (
        <div className="px-5 pb-4 border-t border-gray-50">
          <p className="text-[14px] text-gray-600 leading-relaxed pt-3">{a}</p>
        </div>
      )}
    </div>
  );
};
export default Accordion;
