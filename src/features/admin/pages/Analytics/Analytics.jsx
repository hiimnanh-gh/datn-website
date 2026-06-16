import { useState, useMemo, useEffect } from "react";
import useTopbarStore from "../../../../store/useTopbarStore";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Styles
import "./Analytics.css";

// Data
import {
  incidentTrend,
  incidentTypes,
  responseData,
  unitUtilization,
  districtHeatmap,
  KPI_CARDS,
} from "./data";

const Analytics = () => {
  const [period, setPeriod] = useState("Year");
  const { setSlot, clearSlot } = useTopbarStore();

  /* ── Topbar slot: period selector ── */
  useEffect(() => {
    setSlot(
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-gray-400 font-semibold mr-1">
          Period:
        </span>
        {["Week", "Month", "Quarter", "Year"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
              period === p
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {p}
          </button>
        ))}
      </div>,
    );
    return () => clearSlot();
  }, [period]);

  return (
    <div className="max-w-[1400px] mx-auto pb-12 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 flex items-center gap-2">
            <span
              className="material-symbols-outlined text-blue-600 text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              monitoring
            </span>
            Analytics
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Performance insights · {new Date().getFullYear()} full year
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
            {["Week", "Month", "Quarter", "Year"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${period === p ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
            <span className="material-symbols-outlined text-[16px]">
              download
            </span>
            Export PDF
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_CARDS.map((k) => (
          <div
            key={k.label}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div className={`${k.color} p-3 rounded-xl flex-shrink-0`}>
              <span
                className="material-symbols-outlined text-white text-[22px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {k.icon}
              </span>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                {k.label}
              </p>
              <p className="text-[24px] font-bold text-gray-900 leading-tight">
                {k.value}
              </p>
              <span
                className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${k.up ? "text-green-600" : "text-red-500"}`}
              >
                <span className="material-symbols-outlined text-[13px]">
                  {k.up ? "trending_up" : "trending_down"}
                </span>
                {k.trend} vs last year
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-[15px] font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[18px]">
              show_chart
            </span>
            Incident Volume by Priority
          </h3>
          <p className="text-[12px] text-gray-400 mb-4">
            Monthly breakdown — {new Date().getFullYear()}
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={incidentTrend}
              margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gCrit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gUrg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gStd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
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
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              <Area
                type="monotone"
                dataKey="critical"
                name="Critical"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#gCrit)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="urgent"
                name="Urgent"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#gUrg)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="standard"
                name="Standard"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#gStd)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Incident type pie */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-[15px] font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[18px]">
              pie_chart
            </span>
            Type Distribution
          </h3>
          <p className="text-[12px] text-gray-400 mb-3">
            YTD breakdown by category
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={incidentTypes}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {incidentTypes.map((e) => (
                  <Cell key={e.name} fill={e.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v, n) => [`${v}%`, n]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {incidentTypes.map(({ name, value, color }) => (
              <div key={name} className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: color }}
                />
                <span className="text-[12px] text-gray-600 flex-1">{name}</span>
                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${value}%`, background: color }}
                  />
                </div>
                <span className="text-[12px] font-bold text-gray-800 w-8 text-right">
                  {value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response time */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-[15px] font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-green-600 text-[18px]">
              timer
            </span>
            Avg Response Time vs Target
          </h3>
          <p className="text-[12px] text-gray-400 mb-4">
            Minutes — target ≤5 min
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={responseData}
              margin={{ top: 5, right: 10, left: -15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                unit="m"
                domain={[3, 7]}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v) => [`${v} min`]}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              <Line
                type="monotone"
                dataKey="avg"
                name="Actual"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="target"
                name="Target"
                stroke="#d1d5db"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Fleet utilization */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-[15px] font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-600 text-[18px]">
              local_shipping
            </span>
            Fleet Utilization (days/month)
          </h3>
          <p className="text-[12px] text-gray-400 mb-4">
            Dispatched vs Maintenance vs Available
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={unitUtilization}
              margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
              barSize={14}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="unit"
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
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              <Bar
                dataKey="dispatches"
                name="Dispatched"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
                stackId="a"
              />
              <Bar
                dataKey="maintenance"
                name="Maintenance"
                fill="#f59e0b"
                radius={[0, 0, 0, 0]}
                stackId="a"
              />
              <Bar
                dataKey="available"
                name="Available"
                fill="#e5e7eb"
                radius={[4, 4, 0, 0]}
                stackId="a"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* District heatmap table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-[15px] flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[18px]">
              location_city
            </span>
            Incidents by District
          </h3>
          <span className="text-[11px] text-gray-400">
            {new Date().getFullYear()} · all months
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  "District",
                  "Total Incidents",
                  "Critical",
                  "Resolved",
                  "Resolution Rate",
                  "Heat",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[10px] text-gray-500 font-bold uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {districtHeatmap.map((d, i) => {
                const resRate = ((d.resolved / d.incidents) * 100).toFixed(1);
                const maxInc = Math.max(
                  ...districtHeatmap.map((x) => x.incidents),
                );
                const heat = (d.incidents / maxInc) * 100;
                return (
                  <tr
                    key={d.district}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-bold text-gray-900">
                      {d.district}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-gray-800">
                      {d.incidents}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-red-600 font-semibold">
                        {d.critical}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-green-600 font-semibold">
                      {d.resolved}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${resRate}%` }}
                          />
                        </div>
                        <span className="text-[12px] font-bold text-gray-700">
                          {resRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="w-28 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${heat}%`,
                            background: `hsl(${210 - heat * 1.4}, 85%, 55%)`,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
