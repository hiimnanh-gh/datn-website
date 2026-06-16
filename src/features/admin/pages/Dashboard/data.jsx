import React from "react";

/* ─────────────────────────── Data generators ─────────────── */
export const generateDayData = () => {
  const hours = Array.from(
    { length: 24 },
    (_, i) => `${String(i).padStart(2, "0")}:00`,
  );
  return hours.map((h, i) => ({
    label: h,
    calls: Math.max(
      30,
      Math.round(
        120 +
          200 * Math.sin(((i - 6) * Math.PI) / 12) +
          (Math.random() - 0.5) * 80,
      ),
    ),
    resolved: Math.max(
      20,
      Math.round(
        100 +
          170 * Math.sin(((i - 6) * Math.PI) / 12) +
          (Math.random() - 0.5) * 60,
      ),
    ),
  }));
};

export const generateMonthData = () => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const now = new Date();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => {
    const base = 2400 + Math.sin(i * 0.4) * 600;
    return {
      label: `${months[now.getMonth()]} ${i + 1}`,
      calls: Math.max(800, Math.round(base + (Math.random() - 0.5) * 800)),
      resolved: Math.max(
        600,
        Math.round(base * 0.85 + (Math.random() - 0.5) * 600),
      ),
    };
  });
};

export const generateYearData = () => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months.map((m, i) => {
    const base = 28000 + Math.sin(i * 0.6) * 8000;
    return {
      label: m,
      calls: Math.max(12000, Math.round(base + (Math.random() - 0.5) * 6000)),
      resolved: Math.max(
        10000,
        Math.round(base * 0.88 + (Math.random() - 0.5) * 5000),
      ),
    };
  });
};

/* ─────────────────────────── KPI detail data ──────────────── */
export const KPI_DETAILS = {
  users: {
    title: "Phân bổ người dùng theo Role",
    icon: "group",
    accentColor: "#2563eb",
    accentBg: "bg-blue-50",
    accentText: "text-blue-600",
    // 4 role mini-stats
    stats: [
      {
        label: "Admin",
        value: "48",
        icon: "admin_panel_settings",
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      {
        label: "Dispatcher",
        value: "312",
        icon: "headset_mic",
        color: "text-purple-600",
        bg: "bg-purple-50",
      },
      {
        label: "Driver",
        value: "2,540",
        icon: "drive_eta",
        color: "text-amber-600",
        bg: "bg-amber-50",
      },
      {
        label: "User",
        value: "9,550",
        icon: "person",
        color: "text-green-600",
        bg: "bg-green-50",
      },
    ],
    chartTitle: "Tỉ lệ từng role trong hệ thống",
    // Stacked bar: each day shows breakdown by role
    chartData: [
      { label: "Admin", value: 48, fill: "#2563eb" },
      { label: "Dispatcher", value: 312, fill: "#9333ea" },
      { label: "Driver", value: 2540, fill: "#f59e0b" },
      { label: "User", value: 9550, fill: "#10b981" },
    ],
    chartKey: "value",
    chartColor: "#2563eb",
    chartType: "role_bar", // special type
    extraRows: [
      { label: "Tổng tài khoản", value: "12,450" },
      { label: "Online ngay lúc này", value: "3,241" },
      { label: "Đăng nhập hôm nay", value: "+874" },
      { label: "Tài khoản mới tháng này", value: "+342" },
      { label: "Tỷ lệ đăng nhập thành công", value: "99.4%" },
      { label: "Tài khoản bị khóa", value: "7" },
    ],
  },
  fleet: {
    title: "Fleet Availability",
    icon: "local_shipping",
    accentColor: "#64748b",
    accentBg: "bg-slate-100",
    accentText: "text-slate-600",
    stats: [
      {
        label: "Available",
        value: "44",
        icon: "check_circle",
        color: "text-green-600",
        bg: "bg-green-50",
      },
      {
        label: "Dispatched",
        value: "6",
        icon: "emergency",
        color: "text-red-600",
        bg: "bg-red-50",
      },
      {
        label: "Maintenance",
        value: "3",
        icon: "build",
        color: "text-amber-600",
        bg: "bg-amber-50",
      },
      {
        label: "Offline",
        value: "1",
        icon: "power_off",
        color: "text-gray-400",
        bg: "bg-gray-100",
      },
    ],
    chartTitle: "Lượt xuất xe trong tuần",
    chartData: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => ({
      label: d,
      value: Math.round(8 + Math.random() * 12),
    })),
    chartKey: "value",
    chartColor: "#64748b",
    chartType: "bar",
    extraRows: [
      { label: "Total fleet size", value: "54 vehicles" },
      { label: "Avg response distance", value: "4.2 km" },
      { label: "Fuel efficiency avg", value: "87%" },
      { label: "Overdue maintenance", value: "2 units" },
    ],
  },
  capacity: {
    title: "Global ER Capacity",
    icon: "local_hospital",
    accentColor: "#ef4444",
    accentBg: "bg-red-50",
    accentText: "text-red-600",
    stats: [
      {
        label: "Hospitals Online",
        value: "28",
        icon: "local_hospital",
        color: "text-green-600",
        bg: "bg-green-50",
      },
      {
        label: "Critical Beds",
        value: "214",
        icon: "bed",
        color: "text-red-600",
        bg: "bg-red-50",
      },
      {
        label: "ICU Available",
        value: "56",
        icon: "monitor_heart",
        color: "text-amber-600",
        bg: "bg-amber-50",
      },
      {
        label: "Overflow Risk",
        value: "3",
        icon: "warning",
        color: "text-orange-600",
        bg: "bg-orange-50",
      },
    ],
    chartTitle: "Mức độ lấp đầy theo bệnh viện",
    chartData: [
      { label: "BV Chợ Rẫy", value: 94 },
      { label: "BV Bạch Mai", value: 81 },
      { label: "BV 115", value: 73 },
      { label: "BV Nhân dân", value: 68 },
      { label: "BV ĐH Y Dược", value: 55 },
      { label: "BV Hùng Vương", value: 44 },
    ],
    chartKey: "value",
    chartColor: "#ef4444",
    chartType: "bar",
    extraRows: [
      { label: "Avg ER wait time", value: "18 min" },
      { label: "Transfers today", value: "34" },
      { label: "Full capacity", value: "1 hospital" },
      { label: "Diversion active", value: "0" },
    ],
  },
  latency: {
    title: "Avg System Latency",
    icon: "speed",
    accentColor: "#6366f1",
    accentBg: "bg-indigo-50",
    accentText: "text-indigo-600",
    stats: [
      {
        label: "API Latency",
        value: "42 ms",
        icon: "api",
        color: "text-indigo-600",
        bg: "bg-indigo-50",
      },
      {
        label: "DB Query",
        value: "11 ms",
        icon: "storage",
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      {
        label: "WebSocket",
        value: "8 ms",
        icon: "podcasts",
        color: "text-green-600",
        bg: "bg-green-50",
      },
      {
        label: "P99 Latency",
        value: "210 ms",
        icon: "bar_chart",
        color: "text-amber-600",
        bg: "bg-amber-50",
      },
    ],
    chartTitle: "Độ trễ hệ thống – 24h",
    chartData: Array.from({ length: 24 }, (_, i) => ({
      label: `${String(i).padStart(2, "0")}h`,
      value: Math.max(
        20,
        Math.round(42 + Math.sin(i * 0.5) * 15 + (Math.random() - 0.5) * 20),
      ),
    })),
    chartKey: "value",
    chartColor: "#6366f1",
    chartType: "line",
    extraRows: [
      { label: "Uptime (30 days)", value: "99.98%" },
      { label: "Error rate", value: "0.02%" },
      { label: "Active nodes", value: "12" },
      { label: "Last incident", value: "3 days ago" },
    ],
  },
};

/* ─────────────────────────── Static data ─────────────────── */
export const responseTimeData = [
  { category: "Critical", avgMin: 4.2, target: 5 },
  { category: "Urgent", avgMin: 8.7, target: 10 },
  { category: "Standard", avgMin: 14.1, target: 15 },
  { category: "Routine", avgMin: 22.5, target: 25 },
];

export const incidentTypeData = [
  { name: "Cardiac", value: 31, color: "#ef4444" },
  { name: "Trauma", value: 24, color: "#f97316" },
  { name: "Respiratory", value: 19, color: "#3b82f6" },
  { name: "Stroke", value: 14, color: "#8b5cf6" },
  { name: "Other", value: 12, color: "#6b7280" },
];

export const SEED_FEED = [
  {
    id: 1,
    time: "14:05:00",
    tag: "AUTH",
    msg: (
      <>
        Admin <b>nguyenanh</b> logged in from IP 192.168.1.44
      </>
    ),
  },
  {
    id: 2,
    time: "14:02:11",
    tag: "DISPATCH",
    msg: (
      <>
        Unit <b>AMB-42</b> accepted mission{" "}
        <code className="bg-slate-100 px-1 rounded text-[11px] font-mono">
          EMS-102
        </code>
        . En route sector 7
      </>
    ),
  },
  {
    id: 3,
    time: "13:58:20",
    tag: "SYSTEM",
    msg: <>Automated DB Backup completed — 1.2 GB archived</>,
  },
  {
    id: 4,
    time: "13:52:44",
    tag: "ALERT",
    msg: (
      <>
        High latency on <b>Node-Alpha</b> (120 ms) — auto-scaling initiated
      </>
    ),
  },
  {
    id: 5,
    time: "13:45:12",
    tag: "DISPATCH",
    msg: (
      <>
        Incident{" "}
        <code className="bg-slate-100 px-1 rounded text-[11px] font-mono">
          EMS-101
        </code>{" "}
        closed — patient transferred
      </>
    ),
  },
  {
    id: 6,
    time: "13:38:05",
    tag: "SYSTEM",
    msg: <>Scheduler completed fleet maintenance scan — 48 units checked</>,
  },
];

export const TAG_STYLES = {
  AUTH: "bg-blue-50 text-blue-700 border-blue-200",
  DISPATCH: "bg-red-50 text-red-700 border-red-200",
  SYSTEM: "bg-slate-100 text-slate-700 border-slate-200",
  ALERT: "bg-amber-50 text-amber-700 border-amber-200",
  INFO: "bg-green-50 text-green-700 border-green-200",
};
