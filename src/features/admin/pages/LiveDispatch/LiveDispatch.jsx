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
        <div className="flex items-center gap-1.5 bg-red-950/40 border border-red-900 text-red-400 px-3 py-1.5 rounded-full text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          LIVE
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-950/40 border border-amber-900 text-amber-400">
          {pendingCount} pending
        </span>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-900 text-emerald-400">
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
    <div className="min-h-screen bg-slate-950 p-6 pb-12 space-y-6">
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
          <h1 className="text-[26px] font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500 text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
            Live Dispatch
          </h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            Real-time incident management · Auto-refresh every second
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-red-950/40 border border-red-900 text-red-400 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[12px] font-medium text-slate-300 hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined text-[16px]">add</span>{" "}
            New Incident
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatBadge icon="warning"        label="Pending"        value={pending.length}    color="bg-orange-500" />
        <StatBadge icon="local_shipping"  label="Dispatched"     value={dispatched.length} color="bg-indigo-600" />
        <StatBadge icon="check_circle"    label="Units Available" value={available}          color="bg-emerald-600" />
        <StatBadge icon="assignment"      label="Total Active"   value={incidents.length}  color="bg-slate-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Incident Queue */}
        <div className="xl:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-[15px] flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-400 text-[18px]">list_alt</span>
              Incident Queue
            </h3>
            <div className="flex gap-1 p-1 bg-slate-800 rounded-lg">
              {["All", "CRITICAL", "URGENT", "STANDARD"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${filter === f ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-slate-800">
            {filtered.map((inc) => {
              const ps = PRIORITY_STYLES[inc.priority];
              return (
                <div
                  key={inc.id}
                  className={`px-5 py-4 transition-colors ${inc.status === "Pending" ? "bg-slate-800/50" : "bg-transparent"} hover:bg-slate-800/30`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${ps.dot} ${inc.status === "Pending" ? "animate-pulse" : ""}`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-white text-[13px] font-mono">{inc.id}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${ps.badge}`}>{inc.priority}</span>
                          {inc.status === "Pending" && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-900">
                              AWAITING DISPATCH
                            </span>
                          )}
                        </div>
                        <p className="text-[13px] font-semibold text-slate-200">{inc.type}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">location_on</span>
                          {inc.address}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">person</span>
                            {inc.caller}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                            {inc.time}
                          </span>
                          {inc.assignedUnit && (
                            <span className="flex items-center gap-1 text-indigo-400 font-semibold">
                              <span className="material-symbols-outlined text-[12px]">local_shipping</span>
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
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">send</span>
                          Dispatch
                        </button>
                      ) : (
                        <span className="text-[10px] bg-emerald-950/50 text-emerald-400 border border-emerald-900 px-2.5 py-1 rounded-full font-bold">
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
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h3 className="font-bold text-white text-[15px] flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
              Fleet Status
            </h3>
          </div>
          <div className="divide-y divide-slate-800">
            {units.map((u) => (
              <div key={u.id} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-800/40 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-slate-300 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-[13px]">{u.id}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[u.status]}`}>{u.status}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">{u.crew} · {u.zone}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-[9px] text-slate-600">Fuel</span>
                    <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${u.fuel > 60 ? "bg-emerald-500" : u.fuel > 30 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${u.fuel}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono">{u.fuel}%</span>
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
