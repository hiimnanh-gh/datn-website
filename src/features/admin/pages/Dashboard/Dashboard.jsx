import { useState, useEffect, useCallback, useMemo } from "react";
import useTopbarStore from "../../../../store/useTopbarStore";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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
import "./Dashboard.css";

// Sub-components
import { FilterBtn } from "./FilterBtn";
import { SectionHeader } from "./SectionHeader";
import { KpiCard } from "./KpiCard";
import { KpiDetailModal } from "./KpiDetailModal";

// Data and helpers
import {
  generateDayData,
  generateMonthData,
  generateYearData,
  responseTimeData,
  incidentTypeData,
  SEED_FEED,
  TAG_STYLES,
} from "./data";

/* ─────────────────────────── Main Page ──────────────────── */
const VIEW_MODES = ["Năm", "Tháng", "Ngày"];
const HOUR_RANGES = ["24h", "12h", "6h"];

const Dashboard = () => {
  const [activeCard, setActiveCard] = useState(null); // which KPI drawer is open
  const [viewMode, setViewMode] = useState("Ngày");
  const [hourRange, setHourRange] = useState("24h");
  const [chartData, setChartData] = useState(() => generateDayData());
  const [feedItems, setFeedItems] = useState(SEED_FEED);
  const [cpuUsage, setCpuUsage] = useState(45);
  const [dbLoad, setDbLoad] = useState(60);
  const [wsNodes, setWsNodes] = useState(1240);
  const [latency, setLatency] = useState(42);
  const [liveSync, setLiveSync] = useState(true);
  const [lastUpdate, setLastUpdate] = useState("just now");
  const { setSlot, clearSlot } = useTopbarStore();

  /* ── Topbar slot: LIVE badge + timestamp + toggle ── */
  useEffect(() => {
    setSlot(
      <div className="flex items-center gap-2">
        <button
          onClick={() => setLiveSync((v) => !v)}
          className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all ${
            liveSync
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-gray-100 border-gray-200 text-gray-500"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              liveSync ? "bg-green-500 animate-pulse" : "bg-gray-400"
            }`}
          />
          {liveSync ? "LIVE" : "PAUSED"}
        </button>
        <span className="text-[11px] text-gray-400 hidden lg:block">
          updated {lastUpdate}
        </span>
      </div>,
    );
    return () => clearSlot();
  }, [liveSync, lastUpdate]);

  /* Regenerate chart data on view mode change */
  useEffect(() => {
    if (viewMode === "Năm") setChartData(generateYearData());
    if (viewMode === "Tháng") setChartData(generateMonthData());
    if (viewMode === "Ngày") setChartData(generateDayData());
    setHourRange("24h");
  }, [viewMode]);

  const displayData = useMemo(() => {
    if (viewMode !== "Ngày") return chartData;
    if (hourRange === "6h") return chartData.slice(18);
    if (hourRange === "12h") return chartData.slice(12);
    return chartData;
  }, [chartData, viewMode, hourRange]);

  const formatY = (v) => (viewMode === "Năm" ? `${(v / 1000).toFixed(0)}K` : v);
  const tooltipLabel =
    viewMode === "Năm" ? "Tháng" : viewMode === "Tháng" ? "Ngày" : "Giờ";

  /* Live updates */
  useEffect(() => {
    if (!liveSync) return;
    const id = setInterval(() => {
      setCpuUsage((v) =>
        Math.min(95, Math.max(20, v + (Math.random() - 0.48) * 6)),
      );
      setDbLoad((v) =>
        Math.min(95, Math.max(20, v + (Math.random() - 0.5) * 5)),
      );
      setWsNodes((v) =>
        Math.min(
          1500,
          Math.max(900, v + Math.round((Math.random() - 0.5) * 20)),
        ),
      );
      setLatency((v) =>
        Math.min(200, Math.max(20, v + Math.round((Math.random() - 0.5) * 8))),
      );
      setLastUpdate(new Date().toLocaleTimeString());
      if (Math.random() < 0.4) {
        const tags = ["AUTH", "DISPATCH", "SYSTEM", "ALERT", "INFO"];
        const msgs = [
          "Heartbeat check passed on all 48 active units.",
          "Fleet GPS sync completed in 1.1 s.",
          "User session refreshed — token rotated.",
          "WebSocket reconnect on Dispatcher #3.",
        ];
        const tag = tags[Math.floor(Math.random() * tags.length)];
        setFeedItems((prev) => [
          {
            id: Date.now(),
            time: new Date().toLocaleTimeString("en-GB"),
            tag,
            msg: msgs[Math.floor(Math.random() * msgs.length)],
          },
          ...prev.slice(0, 11),
        ]);
      }
    }, 3000);
    return () => clearInterval(id);
  }, [liveSync]);

  const refreshChart = useCallback(() => {
    if (viewMode === "Năm") setChartData(generateYearData());
    if (viewMode === "Tháng") setChartData(generateMonthData());
    if (viewMode === "Ngày") setChartData(generateDayData());
  }, [viewMode]);

  const HealthBar = ({ label, value, max = 100, color, note }) => (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </span>
        <span className="text-[13px] font-mono font-semibold text-gray-800">
          {value.toFixed(0)}
          {max === 100 ? "%" : ""}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`${color} h-2.5 rounded-full transition-all duration-700`}
          style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        />
      </div>
      {note && (
        <p className="text-[10px] text-gray-400 mt-1 text-right">{note}</p>
      )}
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto pb-12 space-y-6">
      {/* KPI Detail Drawer */}
      {activeCard && (
        <KpiDetailModal
          cardKey={activeCard}
          onClose={() => setActiveCard(null)}
        />
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900">
            System Overview
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Real-time metrics · updated {lastUpdate}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setLiveSync((v) => !v)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold border transition-all
              ${liveSync ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${liveSync ? "bg-green-500 pulse-dot" : "bg-gray-400"}`}
            />
            {liveSync ? "LIVE" : "PAUSED"}
          </button>
          <button
            onClick={refreshChart}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">
              refresh
            </span>{" "}
            Refresh
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
            <span className="material-symbols-outlined text-[16px]">
              download
            </span>{" "}
            Export
          </button>
        </div>
      </div>

      {/* ── KPI CARDS (clickable) ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          cardKey="users"
          icon="group"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          label="Total Active Users"
          value="12,450"
          trend="+4.2%"
          trendUp
          onClick={setActiveCard}
        />
        <KpiCard
          cardKey="fleet"
          icon="local_shipping"
          iconBg="bg-slate-100"
          iconColor="text-slate-600"
          label="Fleet Availability"
          value="92"
          unit="%"
          trend="-2.0%"
          trendUp={false}
          onClick={setActiveCard}
        />
        <KpiCard
          cardKey="capacity"
          icon="local_hospital"
          iconBg="bg-red-50"
          iconColor="text-red-600"
          label="Global ER Capacity"
          value="78"
          unit="%"
          trend="+1.5%"
          trendUp
          onClick={setActiveCard}
        />
        <KpiCard
          cardKey="latency"
          icon="speed"
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          label="Avg System Latency"
          value={latency}
          unit="ms"
          trend="-5ms"
          trendUp
          onClick={setActiveCard}
        />
      </div>

      {/* ── CHART ROW 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart with hierarchical filter */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionHeader icon="show_chart" title="Emergency Call Volume">
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
              {VIEW_MODES.map((m) => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all
                    ${viewMode === m ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
                >
                  {m}
                </button>
              ))}
            </div>
            {viewMode === "Ngày" && (
              <div className="flex items-center gap-1">
                {HOUR_RANGES.map((r) => (
                  <FilterBtn
                    key={r}
                    active={hourRange === r}
                    onClick={() => setHourRange(r)}
                  >
                    {r}
                  </FilterBtn>
                ))}
              </div>
            )}
          </SectionHeader>
          <p className="text-[12px] text-gray-400 mb-4">
            {viewMode === "Năm" && "Tổng quan 12 tháng qua"}
            {viewMode === "Tháng" &&
              `Dữ liệu tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}`}
            {viewMode === "Ngày" &&
              `Hôm nay — ${hourRange === "24h" ? "00:00–23:59" : hourRange === "12h" ? "12:00–23:59" : "18:00–23:59"}`}
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={displayData}
              margin={{
                top: 5,
                right: 10,
                left: viewMode === "Năm" ? 5 : -10,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="gradCalls" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                interval={
                  viewMode === "Tháng"
                    ? 4
                    : viewMode === "Ngày"
                      ? hourRange === "24h"
                        ? 3
                        : 1
                      : 0
                }
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatY}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 4,
                }}
                labelFormatter={(l) => `${tooltipLabel}: ${l}`}
                formatter={(v, n) => [
                  viewMode === "Năm" ? `${(v / 1000).toFixed(1)}K` : v,
                  n,
                ]}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              <Area
                type="monotone"
                dataKey="calls"
                name="Tổng cuộc gọi"
                stroke="#2563eb"
                strokeWidth={2}
                fill="url(#gradCalls)"
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Area
                type="monotone"
                dataKey="resolved"
                name="Đã xử lý"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#gradResolved)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col">
          <SectionHeader icon="monitor_heart" title="System Health">
            <span className="text-[10px] text-gray-400 px-2 py-1 bg-gray-100 rounded-md">
              auto-refresh
            </span>
          </SectionHeader>
          <div className="space-y-5 flex-1">
            <HealthBar
              label="Core CPU Usage"
              value={cpuUsage}
              color="bg-blue-500"
            />
            <HealthBar
              label="Database I/O Load"
              value={dbLoad}
              color="bg-amber-500"
            />
            <HealthBar
              label="Active WS Nodes"
              value={wsNodes}
              max={1500}
              color="bg-green-500"
              note="Capacity: 1,500"
            />
            <HealthBar label="Memory Usage" value={68} color="bg-purple-500" />
          </div>
          <div className="mt-5 p-3.5 bg-green-50 rounded-xl border border-green-100">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="material-symbols-outlined text-green-600 text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <span className="text-[13px] text-green-800 font-semibold">
                All Systems Operational
              </span>
            </div>
            <p className="text-[10px] text-green-600 ml-[26px]">
              Last checked: {lastUpdate}
            </p>
          </div>
        </div>
      </div>

      {/* ── CHART ROW 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Bar */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionHeader icon="timer" title="Avg Response Time (min)" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={responseTimeData}
              margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
              barGap={6}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                unit="m"
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
                wrapperStyle={{ fontSize: 12 }}
              />
              <Bar
                dataKey="avgMin"
                name="Actual"
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
              />
              <Bar
                dataKey="target"
                name="Target"
                fill="#e5e7eb"
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Incident Pie */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionHeader icon="pie_chart" title="Incident Type Distribution" />
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={220}>
              <PieChart>
                <Pie
                  data={incidentTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {incidentTypeData.map((e) => (
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
            <div className="flex-1 space-y-3">
              {incidentTypeData.map(({ name, value, color }) => (
                <div key={name} className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: color }}
                  />
                  <span className="text-[12px] text-gray-600 flex-1">
                    {name}
                  </span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
      </div>

      {/* ── LIVE FEED ── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <SectionHeader icon="history" title="Real-time System Audit Feed">
          <div
            onClick={() => setLiveSync((v) => !v)}
            className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full cursor-pointer select-none"
          >
            <span
              className={`w-2 h-2 rounded-full ${liveSync ? "bg-green-500 pulse-dot" : "bg-gray-400"}`}
            />
            <span className="text-[10px] text-green-700 font-bold uppercase tracking-wider">
              {liveSync ? "Live Sync Active" : "Paused"}
            </span>
          </div>
        </SectionHeader>
        <div className="space-y-1 max-h-[280px] overflow-y-auto scrollbar-thin pr-1">
          {feedItems.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-lg border-l-2 border-transparent hover:border-blue-500 transition-all"
            >
              <span className="text-[11px] font-mono text-gray-400 w-20 flex-shrink-0 pt-0.5 uppercase">
                {item.time}
              </span>
              <span
                className={`inline-block px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider h-fit flex-shrink-0 mt-0.5 ${TAG_STYLES[item.tag] || TAG_STYLES.SYSTEM}`}
              >
                {item.tag}
              </span>
              <p className="text-[13px] text-gray-700 leading-snug">
                {item.msg}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
          <span className="text-[11px] text-gray-400">
            {feedItems.length} events recorded
          </span>
          <button className="text-[12px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-colors">
            View Full Audit Log →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
