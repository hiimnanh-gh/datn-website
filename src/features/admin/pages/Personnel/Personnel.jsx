import { useState, useEffect } from "react";
import useTopbarStore from "../../../../store/useTopbarStore";

// Styles
import "./Personnel.css";

// Sub-components
import { StaffDrawer } from "./StaffDrawer";

// Data
import {
  STAFF,
  ROLE_COLORS,
  STATUS_COLORS,
  AVATAR_BG,
} from "./data";

const Personnel = () => {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [view, setView] = useState("grid");
  const [selected, setSelected] = useState(null);
  const { setSlot, clearSlot } = useTopbarStore();

  const counts = {
    total: STAFF.length,
    active: STAFF.filter((s) => s.status === "Active").length,
    admins: STAFF.filter((s) => s.role === "Admin").length,
    dispatchers: STAFF.filter((s) => s.role === "Dispatcher").length,
    drivers: STAFF.filter((s) => s.role === "Driver").length,
  };

  /* ── Topbar slot: role pills ── */
  useEffect(() => {
    setSlot(
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-50 border border-green-100 text-green-700">
          {counts.active} active
        </span>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700">
          {counts.admins} admins
        </span>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-700">
          {counts.dispatchers} dispatch
        </span>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700">
          {counts.drivers} drivers
        </span>
      </div>,
    );
    return () => clearSlot();
  }, []);

  const filtered = STAFF.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.dept.toLowerCase().includes(q);
    const matchRole = filterRole === "All" || s.role === filterRole;
    const matchStatus = filterStatus === "All" || s.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="max-w-[1400px] mx-auto pb-12 space-y-6">
      {selected && (
        <StaffDrawer staff={selected} onClose={() => setSelected(null)} />
      )}

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 flex items-center gap-2">
            <span
              className="material-symbols-outlined text-blue-600 text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              groups
            </span>
            Personnel
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Staff management · {STAFF.length} members
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
            <span className="material-symbols-outlined text-[16px]">
              download
            </span>
            Export
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-[#2563eb] text-white rounded-lg text-[12px] font-medium hover:bg-blue-700 shadow-sm">
            <span className="material-symbols-outlined text-[16px]">
              person_add
            </span>
            Add Member
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
        {[
          { label: "Total Staff", value: counts.total, color: "bg-slate-700" },
          { label: "Active", value: counts.active, color: "bg-green-600" },
          { label: "Admins", value: counts.admins, color: "bg-blue-600" },
          {
            label: "Dispatchers",
            value: counts.dispatchers,
            color: "bg-purple-600",
          },
          { label: "Drivers", value: counts.drivers, color: "bg-amber-500" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
          >
            <div
              className={`${s.color} w-10 h-10 rounded-xl flex items-center justify-center`}
            >
              <span className="text-white font-bold text-[15px]">
                {s.value}
              </span>
            </div>
            <p className="text-[12px] text-gray-600 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[17px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, ID, dept…"
              className="pl-9 pr-3 py-2 bg-gray-100 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-blue-300 w-56"
            />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
              {["All", "Admin", "Dispatcher", "Driver"].map((r) => (
                <button
                  key={r}
                  onClick={() => setFilterRole(r)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${filterRole === r ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
              {["All", "Active", "On Leave", "Inactive"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${filterStatus === s ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
              {[
                { id: "grid", icon: "grid_view" },
                { id: "table", icon: "table_rows" },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  className={`p-1.5 rounded-md transition-all ${view === v.id ? "bg-white shadow-sm text-blue-600" : "text-gray-500"}`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {v.icon}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid view */}
        {view === "grid" && (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((s, i) => {
              const rc = ROLE_COLORS[s.role] || ROLE_COLORS.Driver;
              const bgCls = AVATAR_BG[i % AVATAR_BG.length];
              return (
                <button
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all text-left bg-gray-50 group"
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${bgCls} flex items-center justify-center text-white text-[18px] font-bold flex-shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    {s.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 text-[14px] truncate">
                      {s.name}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {s.id} · {s.dept}
                    </p>
                    <div className="flex gap-1.5 mt-1.5">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${rc.badge}`}
                      >
                        {s.role}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status]}`}
                      >
                        {s.status}
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-gray-300 group-hover:text-blue-400 transition-colors text-[20px]">
                    chevron_right
                  </span>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-3 text-center py-12 text-gray-400">
                <span className="material-symbols-outlined text-[48px] mb-2 block">
                  person_search
                </span>
                <p>No staff found</p>
              </div>
            )}
          </div>
        )}

        {/* Table view */}
        {view === "table" && (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[
                    "Staff",
                    "ID",
                    "Role",
                    "Department",
                    "Shift",
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
                {filtered.map((s, i) => {
                  const rc = ROLE_COLORS[s.role] || ROLE_COLORS.Driver;
                  const bgCls = AVATAR_BG[i % AVATAR_BG.length];
                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelected(s)}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg ${bgCls} flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0`}
                          >
                            {s.avatar}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {s.name}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {s.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-gray-500 text-[12px]">
                        {s.id}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${rc.badge}`}
                        >
                          {s.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600">{s.dept}</td>
                      <td className="px-4 py-3.5 text-gray-500">{s.shifts}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[s.status]}`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="material-symbols-outlined text-gray-400 hover:text-blue-600 text-[16px]">
                          chevron_right
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Personnel;
