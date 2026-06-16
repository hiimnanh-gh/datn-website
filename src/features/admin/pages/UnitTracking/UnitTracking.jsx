import { useState, useEffect } from "react";
import useTopbarStore from "../../../../store/useTopbarStore";

// Styles
import "./UnitTracking.css";

// Sub-components
import { MapPin } from "./MapPin";

// Data
import { UNITS, STATUS_CONFIG } from "./data";

const UnitTracking = () => {
  const [units, setUnits] = useState(UNITS);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const { setSlot, clearSlot } = useTopbarStore();

  /* ── Topbar slot: GPS live badge + unit counts ── */
  useEffect(() => {
    const active = units.filter((u) => u.status !== "Off Duty").length;
    const moving = units.filter(
      (u) => u.status === "En Route" || u.status === "Transporting",
    ).length;
    setSlot(
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          GPS LIVE
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
          {active}/{units.length} on duty
        </span>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-600">
          {moving} moving
        </span>
      </div>,
    );
    return () => clearSlot();
  }, [units]);

  useEffect(() => {
    const id = setInterval(() => {
      setUnits((prev) =>
        prev.map((u) => ({
          ...u,
          lat:
            u.status === "En Route" || u.status === "Transporting"
              ? +(u.lat + (Math.random() - 0.5) * 0.003).toFixed(5)
              : u.lat,
          lng:
            u.status === "En Route" || u.status === "Transporting"
              ? +(u.lng + (Math.random() - 0.5) * 0.003).toFixed(5)
              : u.lng,
          speed:
            u.status === "En Route" || u.status === "Transporting"
              ? Math.max(
                  30,
                  Math.min(
                    80,
                    u.speed + Math.round((Math.random() - 0.5) * 10),
                  ),
                )
              : 0,
        })),
      );
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const filtered = units.filter((u) => {
    const matchSearch =
      u.id.toLowerCase().includes(search.toLowerCase()) ||
      u.crew.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || u.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = Object.keys(STATUS_CONFIG).reduce((acc, k) => {
    acc[k] = units.filter((u) => u.status === k).length;
    return acc;
  }, {});

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
              location_on
            </span>
            Unit Tracking
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Live GPS monitoring · {units.length} units tracked
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
            <span className="material-symbols-outlined text-[16px]">
              download
            </span>
            Export GPS Log
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setFilterStatus(filterStatus === k ? "All" : k)}
            className={`flex items-center gap-2.5 p-3.5 rounded-xl border transition-all ${filterStatus === k ? "border-blue-500 bg-blue-50" : "bg-white border-gray-100 hover:border-gray-200"} shadow-sm`}
          >
            <span className={`w-3 h-3 rounded-full ${v.dot}`} />
            <div className="text-left">
              <p className="text-[18px] font-bold text-gray-900 leading-none">
                {counts[k]}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">{v.label}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Map */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-[15px] flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">
                map
              </span>
              Live GPS Map — TP. Hồ Chí Minh
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-green-700 font-bold bg-green-50 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              LIVE
            </div>
          </div>
          {/* Simulated map */}
          <div
            className="relative bg-[#e8eef4] overflow-hidden"
            style={{ height: 460 }}
          >
            {/* Grid lines */}
            <svg
              className="absolute inset-0 w-full h-full opacity-20"
              xmlns="http://www.w3.org/2000/svg"
            >
              {[...Array(8)].map((_, i) => (
                <line
                  key={`h${i}`}
                  x1="0"
                  y1={`${(i + 1) * 12.5}%`}
                  x2="100%"
                  y2={`${(i + 1) * 12.5}%`}
                  stroke="#94a3b8"
                  strokeWidth="0.5"
                />
              ))}
              {[...Array(8)].map((_, i) => (
                <line
                  key={`v${i}`}
                  x1={`${(i + 1) * 12.5}%`}
                  y1="0"
                  x2={`${(i + 1) * 12.5}%`}
                  y2="100%"
                  stroke="#94a3b8"
                  strokeWidth="0.5"
                />
              ))}
              {/* Simulated roads */}
              <path d="M 0,55% 100%,55%" stroke="#cbd5e1" strokeWidth="2" />
              <path d="M 50%,0 50%,100%" stroke="#cbd5e1" strokeWidth="2" />
              <path d="M 0,30% 100%,70%" stroke="#cbd5e1" strokeWidth="1.5" />
              <path d="M 20%,0 80%,100%" stroke="#cbd5e1" strokeWidth="1.5" />
              <path d="M 0,80% 100%,40%" stroke="#cbd5e1" strokeWidth="1" />
            </svg>
            {/* District labels */}
            <div
              className="absolute text-[9px] font-semibold text-slate-400 uppercase"
              style={{ left: "48%", top: "22%" }}
            >
              Q.1
            </div>
            <div
              className="absolute text-[9px] font-semibold text-slate-400 uppercase"
              style={{ left: "25%", top: "15%" }}
            >
              Tân Bình
            </div>
            <div
              className="absolute text-[9px] font-semibold text-slate-400 uppercase"
              style={{ left: "30%", top: "55%" }}
            >
              Q.10
            </div>
            <div
              className="absolute text-[9px] font-semibold text-slate-400 uppercase"
              style={{ left: "60%", top: "72%" }}
            >
              Q.7
            </div>
            <div
              className="absolute text-[9px] font-semibold text-slate-400 uppercase"
              style={{ left: "15%", top: "5%" }}
            >
              Bình Thạnh
            </div>
            {/* Pins */}
            {units.map((u) => (
              <MapPin
                key={u.id}
                unit={u}
                selected={selected?.id === u.id}
                onClick={setSelected}
              />
            ))}
          </div>
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex gap-4 flex-wrap">
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <div
                key={k}
                className="flex items-center gap-1.5 text-[11px] text-gray-600"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${v.dot}`} />
                {v.label}
              </div>
            ))}
          </div>
        </div>

        {/* Unit List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search unit or crew..."
                className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {filtered.map((u) => {
              const cfg = STATUS_CONFIG[u.status];
              const isSel = selected?.id === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => setSelected(isSel ? null : u)}
                  className={`w-full text-left px-4 py-3.5 transition-all hover:bg-gray-50 ${isSel ? "bg-blue-50 border-l-2 border-blue-500" : ""}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-900 text-[13px]">
                      {u.id}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {u.crew} · {u.zone}
                  </p>
                  {isSel && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {[
                        {
                          label: "Speed",
                          value:
                            u.status === "Off Duty" ? "—" : `${u.speed} km/h`,
                          icon: "speed",
                        },
                        {
                          label: "Fuel",
                          value: `${u.fuel}%`,
                          icon: "local_gas_station",
                        },
                        {
                          label: "Mileage",
                          value: u.mileage,
                          icon: "straighten",
                        },
                        { label: "Last Ping", value: u.lastPing, icon: "wifi" },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="bg-gray-50 rounded-lg p-2"
                        >
                          <p className="text-[9px] text-gray-400 uppercase font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[11px]">
                              {item.icon}
                            </span>
                            {item.label}
                          </p>
                          <p className="text-[12px] font-bold text-gray-800 mt-0.5">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitTracking;
