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
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700">
          {INCIDENTS.length} total
        </span>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 border border-red-100 text-red-600">
          {critical} critical
        </span>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-600">
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
    <div className="max-w-[1400px] mx-auto pb-12 space-y-6">
      {detail && (
        <IncidentDetail incident={detail} onClose={() => setDetail(null)} />
      )}

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 flex items-center gap-2">
            <span
              className="material-symbols-outlined text-blue-600 text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              assignment
            </span>
            Incident Logs
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Historical records · {INCIDENTS.length} incidents
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
            <span className="material-symbols-outlined text-[16px]">
              download
            </span>
            Export CSV
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-[#2563eb] text-white rounded-lg text-[12px] font-medium hover:bg-blue-700 shadow-sm">
            <span className="material-symbols-outlined text-[16px]">print</span>
            Print Log
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Total Incidents",
            value: counts.total,
            icon: "assignment",
            color: "bg-blue-600",
          },
          {
            label: "Critical Cases",
            value: counts.critical,
            icon: "warning",
            color: "bg-red-600",
          },
          {
            label: "Resolved",
            value: counts.resolved,
            icon: "check_circle",
            color: "bg-green-600",
          },
          {
            label: "Avg Duration",
            value: counts.avgDuration,
            icon: "timer",
            color: "bg-purple-600",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
          >
            <div className={`${s.color} p-2.5 rounded-xl`}>
              <span
                className="material-symbols-outlined text-white text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {s.icon}
              </span>
            </div>
            <div>
              <p className="text-[22px] font-bold text-gray-900 leading-none">
                {s.value}
              </p>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider mt-0.5">
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filters */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[17px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search ID, type, district…"
              className="pl-9 pr-3 py-2 bg-gray-100 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-blue-300 w-64"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
              {["All", "CRITICAL", "URGENT", "STANDARD"].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setFilterPriority(p);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${filterPriority === p ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
              {["All", "Resolved", "Cancelled"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setFilterStatus(s);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${filterStatus === s ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
                >
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
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  "Incident ID",
                  "Date / Time",
                  "Type",
                  "Priority",
                  "District",
                  "Unit / Crew",
                  "Duration",
                  "Status",
                  "",
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
              {paginated.map((inc) => (
                <tr
                  key={inc.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setDetail(inc)}
                >
                  <td className="px-4 py-3.5 font-bold font-mono text-blue-600">
                    {inc.id}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                    {inc.date}
                    <span className="ml-1 text-gray-400">{inc.time}</span>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-gray-800">
                    {inc.type}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-[9px] font-bold px-2.5 py-1 rounded border ${PRIORITY_BADGE[inc.priority]}`}
                    >
                      {inc.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">{inc.district}</td>
                  <td className="px-4 py-3.5 text-gray-600">
                    <span className="font-semibold text-gray-800">
                      {inc.unit}
                    </span>
                    <span className="text-gray-400"> · {inc.crew}</span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 font-mono">
                    {inc.duration}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_BADGE[inc.status]}`}
                    >
                      {inc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                      <span className="material-symbols-outlined text-[16px]">
                        chevron_right
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paginated.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <span className="material-symbols-outlined text-[48px] mb-2 block">
                search_off
              </span>
              <p className="text-[14px]">No incidents match your filters</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[12px] text-gray-500">
              Showing {(page - 1) * PER_PAGE + 1}–
              {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[16px]">
                  chevron_left
                </span>
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-[12px] font-bold transition-all ${page === i + 1 ? "bg-blue-600 text-white" : "border border-gray-200 hover:bg-gray-50 text-gray-600"}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[16px]">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentLogs;
