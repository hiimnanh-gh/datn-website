import { useState, useEffect } from "react";
import useTopbarStore from "../../../../store/useTopbarStore";

// Styles
import "./UnitTracking.css";

// Sub-components
import { MapPin } from "./MapPin";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon issue in react
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const providerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const HANOI_CENTER = [21.0285, 105.8542];

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
        <div className="flex items-center gap-1.5 bg-indigo-900/30 border border-indigo-800 text-indigo-300 px-3 py-1.5 rounded-full text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          GPS LIVE
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
          {active}/{units.length} on duty
        </span>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-950/40 border border-amber-900 text-amber-400">
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
    <div className="min-h-screen bg-slate-950 p-6 pb-12 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-400 text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
            Unit Tracking
          </h1>
          <p className="text-[13px] text-slate-400 mt-0.5">Live GPS monitoring · {units.length} units tracked</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[12px] font-medium text-slate-300 hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined text-[16px]">download</span>
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
            className={`flex items-center gap-2.5 p-3.5 rounded-xl border transition-all ${filterStatus === k ? "border-indigo-500 bg-indigo-900/20" : "bg-slate-900 border-slate-800 hover:border-slate-700"}`}
          >
            <span className={`w-3 h-3 rounded-full ${v.dot}`} />
            <div className="text-left">
              <p className="text-[18px] font-bold text-white leading-none">{counts[k]}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{v.label}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Map */}
        <div className="xl:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-[15px] flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-400 text-[18px]">map</span>
              Live GPS Map — Hà Nội
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold bg-emerald-950/30 border border-emerald-900 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </div>
          </div>
          {/* Real Leaflet map */}
          <div className="relative overflow-hidden z-0" style={{ height: 460 }}>
            <MapContainer center={HANOI_CENTER} zoom={13} className="w-full h-full z-0" zoomControl={false}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              {filtered.map((u) => (
                <Marker key={u.id} position={[u.lat, u.lng]} icon={providerIcon}>
                  <Popup className="text-slate-900 font-sans text-xs">
                    <div className="space-y-1">
                      <div className="font-bold text-blue-600 font-mono">{u.id} - {u.zone}</div>
                      <div className="text-[11px] text-slate-500">Status: {u.status}</div>
                      <div className="text-[11px] text-slate-500">Crew: {u.crew}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          <div className="px-5 py-3 bg-slate-800/50 border-t border-slate-800 flex gap-4 flex-wrap">
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className={`w-2.5 h-2.5 rounded-full ${v.dot}`} />
                {v.label}
              </div>
            ))}
          </div>
        </div>

        {/* Unit List */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
          <div className="px-4 py-4 border-b border-slate-800">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search unit or crew..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-[13px] text-white outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800">
            {filtered.map((u) => {
              const cfg = STATUS_CONFIG[u.status];
              const isSel = selected?.id === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => setSelected(isSel ? null : u)}
                  className={`w-full text-left px-4 py-3.5 transition-all hover:bg-slate-800/40 ${isSel ? "bg-indigo-900/20 border-l-2 border-indigo-500" : ""}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-[13px]">{u.id}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{u.crew} · {u.zone}</p>
                  {isSel && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {[
                        { label: "Speed",    value: u.status === "Off Duty" ? "—" : `${u.speed} km/h`, icon: "speed" },
                        { label: "Fuel",     value: `${u.fuel}%`,  icon: "local_gas_station" },
                        { label: "Mileage",  value: u.mileage,     icon: "straighten" },
                        { label: "Last Ping",value: u.lastPing,    icon: "wifi" },
                      ].map((item) => (
                        <div key={item.label} className="bg-slate-800 rounded-lg p-2">
                          <p className="text-[9px] text-slate-500 uppercase font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[11px]">{item.icon}</span>
                            {item.label}
                          </p>
                          <p className="text-[12px] font-bold text-slate-200 mt-0.5">{item.value}</p>
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
