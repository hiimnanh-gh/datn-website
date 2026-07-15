import React from "react";

/* ─────────────────────────── Financial Chart Data ─────────────────── */
export const generateFinancialData = () => {
  // Weekly platform revenue through wallet deductions
  return [
    { label: "Mon", revenue: 38400, transactions: 240, commission: 6140 },
    { label: "Tue", revenue: 42100, transactions: 270, commission: 6730 },
    { label: "Wed", revenue: 35900, transactions: 215, commission: 5740 },
    { label: "Thu", revenue: 51200, transactions: 320, commission: 8190 },
    { label: "Fri", revenue: 48900, transactions: 305, commission: 7820 },
    { label: "Sat", revenue: 62000, transactions: 410, commission: 9920 },
    { label: "Sun", revenue: 58500, transactions: 380, commission: 9360 },
  ];
};

/* ─────────────────────────── Provider Performance & Issues ────────── */
export const PROVIDER_PERFORMANCE_DATA = [
  { name: "115 Sài Gòn", rating: 4.8, issueRate: 2.0, trips: 1420 },
  { name: "Family Medical", rating: 4.9, issueRate: 1.5, trips: 980 },
  { name: "FV Ambulance", rating: 4.7, issueRate: 5.0, trips: 720 },
  { name: "SOS Vietnam", rating: 4.5, issueRate: 8.5, trips: 1150 },
  { name: "Vina Ambulance", rating: 4.2, issueRate: 10.0, trips: 600 },
];

/* ─────────────────────────── Provider Wallets (Threshold $1,000) ──── */
export const PROVIDERS_WALLETS = [
  { id: "PROV-01", name: "115 Sài Gòn Emergency", fleetSize: 24, balance: 3450.0, status: "Active" },
  { id: "PROV-02", name: "Family Medical Practice", fleetSize: 12, balance: 4800.0, status: "Active" },
  { id: "PROV-03", name: "FV Hospital Rescue", fleetSize: 8, balance: 850.0, status: "Active" },      // Low Balance!
  { id: "PROV-04", name: "SOS Vietnam Rescue", fleetSize: 18, balance: 120.0, status: "Active" },       // Low Balance!
  { id: "PROV-05", name: "Vina Ambulance Services", fleetSize: 10, balance: 1250.0, status: "Active" },
  { id: "PROV-06", name: "Thành Đô Medic Express", fleetSize: 6, balance: 450.0, status: "Suspended" }, // Low Balance!
];

/* ─────────────────────────── User Review Moderation Feed ──────────── */
export const INITIAL_REVIEWS = [
  { 
    id: "REV-101", 
    user: "Nguyễn Văn Hùng", 
    tier: "Gold", 
    rating: 5, 
    comment: "Cực kỳ nhanh chóng! Đội ngũ điều phối viên tư vấn nhiệt tình, xe sạch sẽ và đầy đủ trang thiết bị.", 
    provider: "Family Medical Practice", 
    date: "Just now", 
    status: "Pending" 
  },
  { 
    id: "REV-102", 
    user: "Lê Minh Tuấn", 
    tier: "Silver", 
    rating: 2, 
    comment: "Xe đến trễ hơn 15 phút. Tài xế đi đường vòng tránh tắc đường nhưng không báo trước làm tăng cước.", 
    provider: "SOS Vietnam Rescue", 
    date: "5 mins ago", 
    status: "Pending" 
  },
  { 
    id: "REV-103", 
    user: "Phan Bích Trâm", 
    tier: "Gold", 
    rating: 5, 
    comment: "Bác sĩ trên xe sơ cứu rất chuyên nghiệp, chồng tôi đã ổn định huyết áp trước khi tới viện.", 
    provider: "115 Sài Gòn Emergency", 
    date: "15 mins ago", 
    status: "Pending" 
  },
  { 
    id: "REV-104", 
    user: "Marcus Vance", 
    tier: "Bronze", 
    rating: 1, 
    comment: "Paramedics demanded direct cash payment for highway tolls even though it should be automated through wallet deduction.", 
    provider: "Vina Ambulance Services", 
    date: "1 hour ago", 
    status: "Pending" 
  },
  { 
    id: "REV-105", 
    user: "Nguyễn Thu Thủy", 
    tier: "Silver", 
    rating: 4, 
    comment: "Xe cứu thương hỗ trợ tốt. Đội ngũ y tế xử lý vết thương gãy xương cẩn thận.", 
    provider: "Thành Đô Medic Express", 
    date: "2 hours ago", 
    status: "Approved" 
  },
];

/* ─────────────────────────── System Audit Feed ────────────────────── */
export const SEED_FEED = [
  {
    id: 1,
    time: "19:05:00",
    tag: "FINANCE",
    msg: "Automatic wallet deduction of $180.00 processed for transaction #EMS-102.",
  },
  {
    id: 2,
    time: "18:55:12",
    tag: "FRAUD",
    msg: "Warning: Driver 'DRV-102' route deviation detected on incident #EMS-103. flagged for audit.",
  },
  {
    id: 3,
    time: "18:42:01",
    tag: "SECURITY",
    msg: "Admin 'MichaelS' updated wallet threshold policy to $1,000 minimum clearing limit.",
  },
  {
    id: 4,
    time: "18:20:44",
    tag: "FRAUD",
    msg: "Outlier Alert: Provider 'SOS Vietnam' reported 8.5% issue rate this cycle. automated advisory sent.",
  },
  {
    id: 5,
    time: "17:55:10",
    tag: "FINANCE",
    msg: "Top-up completed: Provider '115 Sài Gòn' deposited $5,000.00 into platform ledger.",
  },
];

export const TAG_STYLES = {
  FINANCE: "bg-emerald-950/40 text-emerald-400 border-emerald-900/60",
  FRAUD: "bg-red-950/40 text-red-400 border-red-900/60",
  SECURITY: "bg-blue-950/40 text-blue-400 border-blue-900/60",
  SYSTEM: "bg-slate-900/50 text-slate-400 border-slate-800",
};
