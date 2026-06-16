import React from "react";
import { STATUS_CONFIG } from "./data";

export const MapPin = ({ unit, selected, onClick }) => {
  const cfg = STATUS_CONFIG[unit.status];
  const x = ((unit.lng - 106.64) / 0.1) * 100;
  const y = ((10.83 - unit.lat) / 0.1) * 100;
  return (
    <button
      onClick={() => onClick(unit)}
      className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${selected ? "z-20 scale-125" : "z-10 hover:scale-110"}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      title={unit.id}
    >
      <div
        className={`w-8 h-8 rounded-full border-3 flex items-center justify-center shadow-lg ${selected ? "border-white ring-2 ring-blue-500" : "border-white"} bg-[#131b2e]`}
      >
        <span
          className="material-symbols-outlined text-white text-[14px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          local_shipping
        </span>
      </div>
      <span
        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${cfg.dot}`}
      />
      {selected && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#131b2e] text-white text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap shadow-lg">
          {unit.id}
        </div>
      )}
    </button>
  );
};
export default MapPin;
