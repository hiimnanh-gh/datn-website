export const months = [
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

export const incidentTrend = months.map((m, i) => ({
  month: m,
  critical: Math.round(80 + Math.sin(i * 0.7) * 25 + Math.random() * 20),
  urgent: Math.round(160 + Math.sin(i * 0.5) * 40 + Math.random() * 30),
  standard: Math.round(240 + Math.cos(i * 0.4) * 50 + Math.random() * 40),
}));

export const responseData = months.map((m, i) => ({
  month: m,
  avg: +(4.5 + Math.sin(i * 0.8) * 1.5 + (Math.random() - 0.5) * 0.8).toFixed(
    1,
  ),
  target: 5,
}));

export const unitUtilization = [
  { unit: "AMB-01", dispatches: 48, maintenance: 2, available: 18 },
  { unit: "AMB-03", dispatches: 42, maintenance: 5, available: 21 },
  { unit: "AMB-07", dispatches: 55, maintenance: 1, available: 12 },
  { unit: "AMB-12", dispatches: 38, maintenance: 8, available: 22 },
  { unit: "AMB-15", dispatches: 51, maintenance: 3, available: 14 },
  { unit: "AMB-21", dispatches: 29, maintenance: 12, available: 27 },
];

export const incidentTypes = [
  { name: "Cardiac", value: 31, color: "#ef4444" },
  { name: "Trauma", value: 24, color: "#f97316" },
  { name: "Respiratory", value: 19, color: "#3b82f6" },
  { name: "Stroke", value: 14, color: "#8b5cf6" },
  { name: "Other", value: 12, color: "#6b7280" },
];

export const districtHeatmap = [
  { district: "Q.1", incidents: 142, critical: 38, resolved: 139 },
  { district: "Q.3", incidents: 98, critical: 22, resolved: 95 },
  { district: "Q.5", incidents: 87, critical: 18, resolved: 84 },
  { district: "Q.10", incidents: 76, critical: 15, resolved: 73 },
  { district: "Tân Bình", incidents: 64, critical: 12, resolved: 60 },
  { district: "Bình Thạnh", incidents: 57, critical: 10, resolved: 55 },
  { district: "Q.7", incidents: 52, critical: 8, resolved: 50 },
  { district: "Q.4", incidents: 41, critical: 7, resolved: 40 },
];

export const KPI_CARDS = [
  {
    label: "Total Incidents (YTD)",
    value: "4,218",
    trend: "+12%",
    up: true,
    icon: "assignment",
    color: "bg-blue-600",
  },
  {
    label: "Avg Response Time",
    value: "5.2 min",
    trend: "-8%",
    up: true,
    icon: "timer",
    color: "bg-green-600",
  },
  {
    label: "Resolution Rate",
    value: "97.4%",
    trend: "+0.6%",
    up: true,
    icon: "check_circle",
    color: "bg-teal-600",
  },
  {
    label: "Fleet Utilization",
    value: "84%",
    trend: "+3%",
    up: true,
    icon: "local_shipping",
    color: "bg-purple-600",
  },
];
