import React from "react";

export const KpiCard = ({
  cardKey,
  icon,
  iconBg,
  iconColor,
  label,
  value,
  unit,
  trend,
  trendUp,
  onClick,
}) => (
  <button
    onClick={() => onClick(cardKey)}
    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200
      transition-all duration-200 text-left cursor-pointer group w-full active:scale-[0.98]"
  >
    <div className="flex justify-between items-start mb-4">
      <div
        className={`${iconBg} p-3 rounded-xl group-hover:scale-110 transition-transform duration-200`}
      >
        <span className={`material-symbols-outlined ${iconColor} text-[22px]`}>
          {icon}
        </span>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span
          className={`inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-[11px] font-bold
          ${trendUp ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
        >
          <span className="material-symbols-outlined text-[12px]">
            {trendUp ? "trending_up" : "trending_down"}
          </span>
          {trend}
        </span>
        <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
          <span className="material-symbols-outlined text-[11px]">
            open_in_new
          </span>{" "}
          Chi tiết
        </span>
      </div>
    </div>
    <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-1">
      {label}
    </p>
    <p className="text-[28px] text-gray-900 font-bold leading-none">
      {value}
      {unit && (
        <span className="text-[16px] text-gray-400 font-normal ml-1">
          {unit}
        </span>
      )}
    </p>
  </button>
);
