import { useState, useEffect } from "react";
import useTopbarStore from "../../../../store/useTopbarStore";

// Styles
import "./LiveDispatch.css";

// Sub-components
import { StatBadge } from "./StatBadge";
import { DispatchModal } from "./DispatchModal";

// Data
import {
  PRIORITY_STYLES,
  STATUS_STYLES,
  INITIAL_INCIDENTS,
  INITIAL_UNITS,
} from "./data";

const LiveDispatch = () => {
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [units, setUnits] = useState(INITIAL_UNITS);
  const [assigning, setAssigning] = useState(null);
  const [ticker, setTicker] = useState(0);
  const [filter, setFilter] = useState("All");
  const { setSlot, clearSlot } = useTopbarStore();

  useEffect(() => {
    const id = setInterval(() => setTicker((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const handleAssign = (incidentId, unitId) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? {
              ...inc,
              assignedUnit: unitId,
              status: "Dispatched",
              eta: `${Math.floor(Math.random() * 8) + 2} min`,
            }
          : inc,
      ),
    );
    setUnits((prev) =>
      prev.map((u) => (u.id === unitId ? { ...u, status: "En Route" } : u)),
    );
    setAssigning(null);
  };

  const pending = incidents.filter((i) => i.status === "Pending");
  const dispatched = incidents.filter((i) => i.status === "Dispatched");
  const available = units.filter((u) => u.status === "Available").length;

  /* ── Topbar slot ── */
  useEffect(() => {
    const pendingCount = incidents.filter((i) => i.status === "Pending").length;
    const availableCount = units.filter((u) => u.status === "Available").length;
    setSlot(
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-full text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          LIVE
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-600">
          {pendingCount} pending
        </span>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-50 border border-green-100 text-green-600">
          {availableCount} units free
        </span>
      </div>,
    );
    return () => clearSlot();
  }, [incidents, units]);

  const filtered =
    filter === "All"
      ? incidents
      : incidents.filter((i) => i.priority === filter);

  return (
    <div className="max-w-[1400px] mx-auto pb-12 space-y-6">
      {assigning && (
        <DispatchModal
          incident={assigning}
          units={units}
          onAssign={handleAssign}
          onClose={() => setAssigning(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 flex items-center gap-2">
            <span
              className="material-symbols-outlined text-red-600 text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              emergency
            </span>
            Live Dispatch
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Real-time incident management · Auto-refresh every second
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
            <span className="material-symbols-outlined text-[16px]">add</span>{" "}
            New Incident
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatBadge
          icon="warning"
          label="Pending"
          value={pending.length}
          color="bg-orange-500"
        />
        <StatBadge
          icon="local_shipping"
          label="Dispatched"
          value={dispatched.length}
          color="bg-blue-600"
        />
        <StatBadge
          icon="check_circle"
          label="Units Available"
          value={available}
          color="bg-green-600"
        />
        <StatBadge
          icon="assignment"
          label="Total Active"
          value={incidents.length}
          color="bg-slate-600"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Incident Queue */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-[15px] flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">
                list_alt
              </span>
              Incident Queue
            </h3>
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
              {["All", "CRITICAL", "URGENT", "STANDARD"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {filtered.map((inc) => {
              const ps = PRIORITY_STYLES[inc.priority];
              return (
                <div
                  key={inc.id}
                  className={`px-5 py-4 ${inc.status === "Pending" ? ps.bg : "bg-white"} transition-colors`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span
                        className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${ps.dot} ${inc.status === "Pending" ? "animate-pulse" : ""}`}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-gray-900 text-[13px] font-mono">
                            {inc.id}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded ${ps.badge}`}
                          >
                            {inc.priority}
                          </span>
                          {inc.status === "Pending" && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-700">
                              AWAITING DISPATCH
                            </span>
                          )}
                        </div>
                        <p className="text-[13px] font-semibold text-gray-800">
                          {inc.type}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">
                            location_on
                          </span>
                          {inc.address}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-400">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">
                              person
                            </span>
                            {inc.caller}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">
                              schedule
                            </span>
                            {inc.time}
                          </span>
                          {inc.assignedUnit && (
                            <span className="flex items-center gap-1 text-blue-600 font-semibold">
                              <span className="material-symbols-outlined text-[12px]">
                                local_shipping
                              </span>
                              {inc.assignedUnit} · ETA {inc.eta}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {inc.status === "Pending" ? (
                        <button
                          onClick={() => setAssigning(inc)}
                          className="bg-[#2563eb] hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            send
                          </span>
                          Dispatch
                        </button>
                      ) : (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-bold">
                          Dispatched
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unit Status Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-[15px] flex items-center gap-2">
              <span
                className="material-symbols-outlined text-green-600 text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_shipping
              </span>
              Fleet Status
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {units.map((u) => (
              <div
                key={u.id}
                className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-[#131b2e] flex items-center justify-center flex-shrink-0">
                  <span
                    className="material-symbols-outlined text-white text-[16px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    local_shipping
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-[13px]">
                      {u.id}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[u.status]}`}
                    >
                      {u.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500">
                    {u.crew} · {u.zone}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-[9px] text-gray-400">Fuel</span>
                    <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${u.fuel > 60 ? "bg-green-500" : u.fuel > 30 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${u.fuel}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-gray-400 font-mono">
                      {u.fuel}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveDispatch;
