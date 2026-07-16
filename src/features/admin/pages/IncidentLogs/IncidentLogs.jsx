import { useState, useEffect } from "react";
import useTopbarStore from "../../../../store/useTopbarStore";

// Styles
import "./IncidentLogs.css";

// Sub-components
import { IncidentDetail } from "./IncidentDetail";

// Data
import { INCIDENTS, PRIORITY_BADGE, STATUS_BADGE } from "./data";

const IncidentLogs = () => {
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [detail, setDetail] = useState(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;
  const { setSlot, clearSlot } = useTopbarStore();

  const today = INCIDENTS.filter((i) => i.date === "2026-06-09").length;
  const critical = INCIDENTS.filter((i) => i.priority === "CRITICAL").length;

  /* ── Topbar slot ── */
  useEffect(() => {
    setSlot(
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-900/40 border border-indigo-800 text-indigo-300">
          {INCIDENTS.length} total
        </span>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-950/40 border border-red-900 text-red-400">
          {critical} critical
        </span>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
          {today} today
        </span>
      </div>,
    );
    return () => clearSlot();
  }, []);

  const filtered = INCIDENTS.filter((inc) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      inc.id.toLowerCase().includes(q) ||
      inc.type.toLowerCase().includes(q) ||
      inc.district.toLowerCase().includes(q);
    const matchPri =
      filterPriority === "All" || inc.priority === filterPriority;
    const matchStat = filterStatus === "All" || inc.status === filterStatus;
    return matchSearch && matchPri && matchStat;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const counts = {
    total: INCIDENTS.length,
    critical: INCIDENTS.filter((i) => i.priority === "CRITICAL").length,
    resolved: INCIDENTS.filter((i) => i.status === "Resolved").length,
    avgDuration: "23 min",
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 pb-12 space-y-6">
      {detail && (
        <IncidentDetail incident={detail} onClose={() => setDetail(null)} />
      )}

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-white flex items-center gap-2">
            <span
              className="material-symbols-outlined text-indigo-400 text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              assignment
            </span>
            Incident Logs
          </h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            Historical records · {INCIDENTS.length} incidents
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[12px] font-medium text-slate-300 hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined text-[16px]">
              download
            </span>
            Export CSV
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-[12px] font-medium hover:bg-indigo-700 transition-colors">
            <span className="material-symbols-outlined text-[16px]">print</span>
            Print Log
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Incidents", value: counts.total,       icon: "assignment",   color: "bg-indigo-600" },
          { label: "Critical Cases",  value: counts.critical,    icon: "warning",      color: "bg-red-600" },
          { label: "Resolved",        value: counts.resolved,    icon: "check_circle", color: "bg-emerald-600" },
          { label: "Avg Duration",    value: counts.avgDuration, icon: "timer",        color: "bg-purple-600" },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex items-center gap-3 hover:border-slate-700 transition-colors">
            <div className={`${s.color} p-2.5 rounded-xl opacity-90`}>
              <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            </div>
            <div>
              <p className="text-[22px] font-bold text-white leading-none">{s.value}</p>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        {/* Filters */}
        <div className="px-5 py-4 border-b border-slate-800 flex flex-wrap gap-3 items-center justify-between">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[17px]">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search ID, type, district…"
              className="pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-[13px] text-white outline-none focus:ring-2 focus:ring-indigo-500 w-64 placeholder-slate-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-1 p-1 bg-slate-800 rounded-lg">
              {["All", "CRITICAL", "URGENT", "STANDARD"].map((p) => (
                <button key={p} onClick={() => { setFilterPriority(p); setPage(1); }}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${filterPriority === p ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}>
                  {p}
                </button>
              ))}
            </div>
            <div className="flex gap-1 p-1 bg-slate-800 rounded-lg">
              {["All", "Resolved", "Cancelled"].map((s) => (
                <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${filterStatus === s ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800">
                {["Incident ID","Date / Time","Type","Priority","District","Unit / Crew","Duration","Status",""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {paginated.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => setDetail(inc)}>
                  <td className="px-4 py-3.5 font-bold font-mono text-indigo-400">{inc.id}</td>
                  <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">{inc.date}<span className="ml-1 text-slate-600">{inc.time}</span></td>
                  <td className="px-4 py-3.5 font-medium text-slate-200">{inc.type}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[9px] font-bold px-2.5 py-1 rounded border ${PRIORITY_BADGE[inc.priority]}`}>{inc.priority}</span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400">{inc.district}</td>
                  <td className="px-4 py-3.5 text-slate-400">
                    <span className="font-semibold text-slate-200">{inc.unit}</span>
                    <span className="text-slate-600"> · {inc.crew}</span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 font-mono">{inc.duration}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_BADGE[inc.status]}`}>{inc.status}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button className="p-1 text-slate-600 hover:text-indigo-400 transition-colors">
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paginated.length === 0 && (
            <div className="text-center py-12 text-slate-600">
              <span className="material-symbols-outlined text-[48px] mb-2 block">search_off</span>
              <p className="text-[14px]">No incidents match your filters</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[12px] text-slate-500">
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-800 disabled:opacity-30">
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-[12px] font-bold transition-all ${page === i + 1 ? "bg-indigo-600 text-white" : "border border-slate-700 hover:bg-slate-800 text-slate-400"}`}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-800 disabled:opacity-30">
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentLogs;
