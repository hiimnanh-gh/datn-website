import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  Truck,
  AlertTriangle,
  RefreshCw,
  Search,
  UserCheck,
  EyeOff,
  Flag,
  CheckCircle,
  Database,
  ArrowUpRight,
  ShieldAlert
} from "lucide-react";
import useTopbarStore from "../../../../store/useTopbarStore";
import {
  PROVIDER_PERFORMANCE_DATA,
  PROVIDERS_WALLETS,
  INITIAL_REVIEWS,
  SEED_FEED,
  TAG_STYLES
} from "./data";

const Dashboard = () => {
  // Live Sync & Mock States
  const [liveSync, setLiveSync] = useState(true);
  const [lastUpdate, setLastUpdate] = useState("just now");
  
  // Platform Metrics
  const [platformRevenue, setPlatformRevenue] = useState(284500);
  const [flaggedCount, setFlaggedCount] = useState(18);
  
  // Providers Table State
  const [wallets, setWallets] = useState(PROVIDERS_WALLETS);
  const [searchProvider, setSearchProvider] = useState("");
  
  // Reviews Feed State
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [feedItems, setFeedItems] = useState(SEED_FEED);

  const { setSlot, clearSlot } = useTopbarStore();

  // Topbar LIVE indicator injection
  useEffect(() => {
    setSlot(
      <div className="flex items-center gap-2 font-mono">
        <button
          onClick={() => setLiveSync((v) => !v)}
          className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all ${
            liveSync
              ? "bg-emerald-950/45 border-emerald-900 text-emerald-400"
              : "bg-slate-900 border-slate-800 text-slate-500"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              liveSync ? "bg-emerald-500 animate-pulse" : "bg-gray-600"
            }`}
          />
          {liveSync ? "AUTO-SYNC ACTIVE" : "PAUSED"}
        </button>
        <span className="text-[11px] text-slate-500 hidden lg:block">
          rev: ${(platformRevenue).toLocaleString()}
        </span>
      </div>
    );
    return () => clearSlot();
  }, [liveSync, platformRevenue]);

  // Simulation loop for live feed & financials
  useEffect(() => {
    if (!liveSync) return;
    const interval = setInterval(() => {
      // Randomly adjust platform revenue
      setPlatformRevenue(prev => prev + Math.floor(Math.random() * 250) + 50);
      
      // Randomly trigger flagged warning or top-up simulation
      if (Math.random() < 0.3) {
        const events = [
          {
            tag: "FINANCE",
            msg: `Provider top-up request processed. Wallet balance adjusted +$1,500.`
          },
          {
            tag: "FRAUD",
            msg: `GPS Telemetry audit: Speed limit anomaly detected on fleet 'FV Hospital Rescue'.`
          },
          {
            tag: "SECURITY",
            msg: `System scan: B2B clearing threshold successfully checked for all active providers.`
          }
        ];
        const selectedEvent = events[Math.floor(Math.random() * events.length)];
        
        if (selectedEvent.tag === "FRAUD") {
          setFlaggedCount(f => f + 1);
        }

        setFeedItems(prev => [
          {
            id: Date.now(),
            time: new Date().toLocaleTimeString("en-GB"),
            ...selectedEvent
          },
          ...prev.slice(0, 12)
        ]);
      }
      setLastUpdate(new Date().toLocaleTimeString());
    }, 4500);

    return () => clearInterval(interval);
  }, [liveSync]);

  // Review Actions
  const handleApproveReview = (id, user) => {
    setReviews(prev => prev.filter(r => r.id !== id));
    // Log in audit log
    setFeedItems(prev => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString("en-GB"),
        tag: "SECURITY",
        msg: `Review from customer '${user}' approved and published by Admin.`
      },
      ...prev
    ]);
  };

  const handleHideReview = (id, user) => {
    setReviews(prev => prev.filter(r => r.id !== id));
    // Log in audit log
    setFeedItems(prev => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString("en-GB"),
        tag: "SECURITY",
        msg: `Review from customer '${user}' hidden from public index by Admin.`
      },
      ...prev
    ]);
  };

  const handleFlagProvider = (id, provider) => {
    setReviews(prev => prev.filter(r => r.id !== id));
    setFlaggedCount(f => f + 1);
    // Log in audit log
    setFeedItems(prev => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString("en-GB"),
        tag: "FRAUD",
        msg: `Admin flagged provider '${provider}' for investigation based on user dispute.`
      },
      ...prev
    ]);
  };

  // Wallet top-up action from clearing datatable
  const handleTriggerTopUp = (providerId, providerName) => {
    setWallets(prev => prev.map(p => 
      p.id === providerId ? { ...p, balance: p.balance + 1500, status: "Active" } : p
    ));
    setFeedItems(prev => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString("en-GB"),
        tag: "FINANCE",
        msg: `Manual emergency clearing top-up of +$1,500.00 triggered for provider '${providerName}'.`
      },
      ...prev
    ]);
  };

  // Filter wallets based on search query
  const filteredWallets = wallets.filter(w => 
    w.name.toLowerCase().includes(searchProvider.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6 font-sans">
      
      {/* ── Page Header ── */}
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-wider font-mono text-white flex items-center gap-2">
            <ShieldAlert className="text-red-500 animate-pulse" size={24} />
            SUPER ADMIN COMMAND CENTER
          </h1>
          <p className="text-[11px] text-slate-500 mt-1 uppercase font-mono tracking-widest">
            Dispatch Marketplace Operations · Updated {lastUpdate}
          </p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={() => setLiveSync(l => !l)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
              liveSync 
                ? "bg-emerald-950/40 border-emerald-800 text-emerald-400" 
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}
          >
            <RefreshCw size={14} className={liveSync ? "animate-spin" : ""} />
            {liveSync ? "LIVE TELEMETRY" : "PAUSED"}
          </button>
        </div>
      </div>

      {/* ── 1. TOP METRICS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Total Platform Revenue */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden shadow-xl hover:border-slate-700 transition-all text-left">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest block">Total Platform Revenue</span>
              <span className="text-[9px] font-mono text-slate-500 block mt-0.5">(Wallet Deductions)</span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-950/50 border border-emerald-900 text-emerald-400">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tracking-tight text-white">
              ${platformRevenue.toLocaleString()}
            </span>
            <span className="text-xs font-bold font-mono text-emerald-400 flex items-center gap-0.5">
              <TrendingUp size={14} />
              +14.2%
            </span>
          </div>
        </div>

        {/* Metric 2: Active Providers */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden shadow-xl hover:border-slate-700 transition-all text-left">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest block">Active Providers</span>
              <span className="text-[9px] font-mono text-slate-500 block mt-0.5">(On-duty Fleets)</span>
            </div>
            <div className="p-2 rounded-xl bg-blue-950/50 border border-blue-900 text-blue-400">
              <Truck size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tracking-tight text-white">
              {wallets.filter(w => w.status === "Active").length} / {wallets.length}
            </span>
            <span className="text-xs font-bold font-mono text-blue-400">
              Contracted
            </span>
          </div>
        </div>

        {/* Metric 3: Flagged Rides */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden shadow-xl hover:border-slate-700 transition-all text-left">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest block">Flagged Rides</span>
              <span className="text-[9px] font-mono text-slate-500 block mt-0.5">(Telemetry/Disputes)</span>
            </div>
            <div className="p-2 rounded-xl bg-red-950/50 border border-red-900/80 text-red-400">
              <AlertTriangle size={20} className="animate-pulse" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tracking-tight text-red-500">
              {flaggedCount}
            </span>
            <span className="bg-red-950 text-red-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-red-900">
              High Risk
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. CHART AREA ── */}
      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl shadow-2xl text-left">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-sm font-bold font-mono tracking-wider text-white uppercase">Provider Performance & Issue Telemetry</h2>
            <p className="text-xs text-slate-500 mt-1">Cross-referencing overall compliance scores against telemetry violation / issue rates.</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-cyan-400 rounded-sm" /> Average Rating (0-5)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-rose-500 rounded-sm" /> Issue Rate (%)</span>
          </div>
        </div>

        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={PROVIDER_PERFORMANCE_DATA}
              margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }} 
                tickLine={false}
              />
              {/* Left Y Axis for Rating */}
              <YAxis 
                yAxisId="left"
                domain={[0, 5]} 
                stroke="#06b6d4" 
                tick={{ fill: "#06b6d4", fontSize: 10, fontFamily: "monospace" }}
                tickLine={false}
                axisLine={false}
              />
              {/* Right Y Axis for Issue Rate */}
              <YAxis 
                yAxisId="right"
                orientation="right"
                domain={[0, 15]} 
                unit="%"
                stroke="#f43f5e" 
                tick={{ fill: "#f43f5e", fontSize: 10, fontFamily: "monospace" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: "12px",
                  fontSize: "11px",
                  color: "#cbd5e1"
                }}
                labelStyle={{ fontWeight: "bold", color: "#fff", fontFamily: "monospace" }}
              />
              <Bar yAxisId="left" dataKey="rating" name="Avg Rating" fill="#22d3ee" radius={[4, 4, 0, 0]} maxBarSize={30}>
                {PROVIDER_PERFORMANCE_DATA.map((entry, index) => (
                  <Cell key={`cell-rating-${index}`} fill="#06b6d4" fillOpacity={0.85} />
                ))}
              </Bar>
              <Bar yAxisId="right" dataKey="issueRate" name="Issue Rate (%)" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={30}>
                {PROVIDER_PERFORMANCE_DATA.map((entry, index) => (
                  <Cell key={`cell-issues-${index}`} fill="#f43f5e" fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ── 3. WALLET & CLEARING MANAGEMENT DATATABLE (Col: 7) ── */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-2xl text-left">
          <div>
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
              <div>
                <h2 className="text-sm font-bold font-mono tracking-wider text-white uppercase">Provider Wallet & Clearings</h2>
                <p className="text-xs text-slate-500 mt-1">Monitors provider balances. Red alerts indicate critical clearing limits.</p>
              </div>
              <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
                <Search size={14} className="text-slate-500 mr-2" />
                <input
                  type="text"
                  placeholder="Filter fleet..."
                  value={searchProvider}
                  onChange={(e) => setSearchProvider(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs text-slate-300 w-[120px] font-mono"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-400 font-mono text-[10px] tracking-wider uppercase">
                    <th className="py-2.5 px-3">Provider</th>
                    <th className="py-2.5 px-3">Fleet Size</th>
                    <th className="py-2.5 px-3">Wallet Balance</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWallets.map((p) => {
                    const isLowBalance = p.balance < 1000;
                    return (
                      <tr 
                        key={p.id} 
                        className={`border-b border-slate-850 transition-colors ${
                          isLowBalance 
                            ? "bg-red-950/20 border-l-2 border-l-red-500 hover:bg-red-950/30" 
                            : "hover:bg-slate-900/50"
                        }`}
                      >
                        <td className="py-3.5 px-3 font-semibold text-slate-200">{p.name}</td>
                        <td className="py-3.5 px-3 font-mono text-slate-400">{p.fleetSize} units</td>
                        <td className="py-3.5 px-3 font-mono">
                          <span className={isLowBalance ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                            ${p.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                            p.status === "Active" 
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-900" 
                              : "bg-red-950 text-red-400 border border-red-900"
                          }`}>
                            {p.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          {isLowBalance ? (
                            <button
                              onClick={() => handleTriggerTopUp(p.id, p.name)}
                              className="bg-red-600 hover:bg-red-700 text-white font-mono text-[9px] font-bold px-2 py-1.5 rounded transition-all active:scale-95 shadow-md flex items-center gap-1 ml-auto"
                            >
                              <ArrowUpRight size={10} />
                              INTENSE TOP-UP
                            </button>
                          ) : (
                            <span className="text-slate-600 font-mono text-[10px] pr-2">Clear</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-850 flex justify-between items-center text-[10px] text-slate-500 font-mono">
            <span>Minimum Clearing Limit: $1,000.00</span>
            <span>All deposits integrated via Stripe & Plaid API</span>
          </div>
        </div>

        {/* ── 4. REVIEWS & DISPUTES MODERATION FEED (Col: 5) ── */}
        <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-2xl text-left">
          <div>
            <h2 className="text-sm font-bold font-mono tracking-wider text-white uppercase mb-1">Reviews & Dispute Moderation</h2>
            <p className="text-xs text-slate-500 mb-4">Real-time moderation. Actions adjust provider warning indices.</p>

            <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
              {reviews.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-950 border border-slate-850 rounded-xl font-mono">
                  All user reviews moderated. Queue clean.
                </div>
              ) : (
                reviews.map((rev) => {
                  const isGold = rev.tier === 'Gold';
                  const isSilver = rev.tier === 'Silver';
                  return (
                    <div key={rev.id} className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-3 hover:border-slate-750 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-200">{rev.user}</span>
                            <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full uppercase ${
                              isGold 
                                ? "bg-yellow-950 text-yellow-400 border border-yellow-800/80" 
                                : isSilver 
                                  ? "bg-slate-800 text-slate-300 border border-slate-650"
                                  : "bg-orange-950 text-orange-400 border border-orange-900"
                            }`}>
                              {rev.tier} Member
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                            Target: <span className="text-slate-350">{rev.provider}</span>
                          </span>
                        </div>
                        <span className="text-yellow-400 font-mono text-xs">★ {rev.rating}</span>
                      </div>

                      <p className="text-xs text-slate-400 italic font-mono leading-relaxed">
                        "{rev.comment}"
                      </p>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleApproveReview(rev.id, rev.user)}
                          className="flex-1 flex items-center justify-center gap-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 hover:text-emerald-300 font-mono text-[9px] font-bold py-1.5 rounded transition-all active:scale-95"
                        >
                          <UserCheck size={11} />
                          APPROVE
                        </button>
                        <button
                          onClick={() => handleHideReview(rev.id, rev.user)}
                          className="flex-1 flex items-center justify-center gap-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white font-mono text-[9px] font-bold py-1.5 rounded transition-all active:scale-95"
                        >
                          <EyeOff size={11} />
                          HIDE
                        </button>
                        <button
                          onClick={() => handleFlagProvider(rev.id, rev.provider)}
                          className="flex-1 flex items-center justify-center gap-1 bg-red-950/40 hover:bg-red-950/60 border border-red-900 text-red-400 font-mono text-[9px] font-bold py-1.5 rounded transition-all active:scale-95"
                        >
                          <Flag size={11} />
                          FLAG FLEET
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div className="text-[9px] text-slate-500 font-mono text-right pt-2 select-none">
            Reviews feed dynamically linked to User Mobile App
          </div>
        </div>

      </div>

      {/* ── 5. SYSTEM AUDIT FEED ── */}
      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl shadow-2xl text-left">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Database className="text-blue-500" size={18} />
            <h2 className="text-sm font-bold font-mono tracking-wider text-white uppercase">Platform Audit & Anti-Fraud Logs</h2>
          </div>
          <span className="text-[9px] bg-slate-950 border border-slate-850 text-slate-500 font-mono px-2.5 py-1 rounded-full uppercase tracking-wider">
            GPS Outlier Scan: Operational
          </span>
        </div>

        <div className="space-y-1.5 max-h-[180px] overflow-y-auto scrollbar-thin">
          {feedItems.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 px-3 py-2 bg-slate-950/45 hover:bg-slate-950 border border-slate-870 hover:border-slate-800 rounded-lg transition-all"
            >
              <span className="text-[10px] font-mono text-slate-500 w-16 shrink-0 pt-0.5">
                {item.time}
              </span>
              <span className={`inline-block px-1.5 py-0.5 rounded border text-[8px] font-bold font-mono shrink-0 h-fit ${TAG_STYLES[item.tag] || TAG_STYLES.SYSTEM}`}>
                {item.tag}
              </span>
              <p className="text-xs text-slate-300 font-mono leading-relaxed">
                {item.msg}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
