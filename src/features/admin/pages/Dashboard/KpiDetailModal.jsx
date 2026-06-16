import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { KPI_DETAILS } from "./data";

export const KpiDetailModal = ({ cardKey, onClose }) => {
  const d = KPI_DETAILS[cardKey];
  if (!d) return null;

  const ChartComponent = () => {
    if (d.chartType === "line") {
      return (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart
            data={d.chartData}
            margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              unit=" ms"
            />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v) => [`${v} ms`]}
            />
            <Line
              type="monotone"
              dataKey={d.chartKey}
              stroke={d.accentColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }
    if (d.chartType === "role_bar") {
      // Horizontal bar — one bar per role, colored individually
      const total = d.chartData.reduce((s, r) => s + r.value, 0);
      return (
        <div className="space-y-3">
          {d.chartData.map((r) => (
            <div key={r.label}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: r.fill }}
                  />
                  <span className="text-[12px] font-semibold text-gray-700">
                    {r.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">
                    {r.value.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-bold text-gray-700 w-10 text-right">
                    {((r.value / total) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(r.value / total) * 100}%`,
                    background: r.fill,
                  }}
                />
              </div>
            </div>
          ))}
          <p className="text-[10px] text-gray-400 text-right pt-1">
            Tổng: {total.toLocaleString()} tài khoản
          </p>
        </div>
      );
    }
    return (
      <ResponsiveContainer width="100%" height={180}>
        <BarChart
          data={d.chartData}
          margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f0f0f0"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Bar
            dataKey={d.chartKey}
            fill={d.accentColor}
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-screen w-full max-w-[480px] bg-white z-50 shadow-2xl
        flex flex-col overflow-hidden animate-slide-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`${d.accentBg} p-2.5 rounded-xl`}>
              <span
                className={`material-symbols-outlined ${d.accentText} text-[22px]`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {d.icon}
              </span>
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-gray-900">{d.title}</h2>
              <p className="text-[11px] text-gray-400">Chi tiết & phân tích</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5 space-y-6">
          {/* 4 mini-stat grid */}
          <div className="grid grid-cols-2 gap-3">
            {d.stats.map((s) => (
              <div
                key={s.label}
                className="bg-gray-50 rounded-xl p-3.5 border border-gray-100"
              >
                <div
                  className={`${s.bg} w-8 h-8 rounded-lg flex items-center justify-center mb-2`}
                >
                  <span
                    className={`material-symbols-outlined ${s.color} text-[16px]`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {s.icon}
                  </span>
                </div>
                <p className="text-[18px] font-bold text-gray-900 leading-tight">
                  {s.value}
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-0.5">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Chart section */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-[12px] font-bold text-gray-700 mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-gray-400">
                bar_chart
              </span>
              {d.chartTitle}
            </p>
            <ChartComponent />
          </div>

          {/* Extra rows */}
          <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-4 py-3 border-b border-gray-100 bg-white">
              Thống kê bổ sung
            </p>
            {d.extraRows.map((r, i) => (
              <div
                key={i}
                className="flex justify-between items-center px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-white transition-colors"
              >
                <span className="text-[13px] text-gray-600">{r.label}</span>
                <span className="text-[13px] font-bold text-gray-900">
                  {r.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-[13px] font-bold text-white transition-all active:scale-95"
            style={{ background: d.accentColor }}
          >
            Xem báo cáo đầy đủ
          </button>
        </div>
      </div>
    </>
  );
};
