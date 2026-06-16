import React from "react";
import { PRIORITY_BADGE, STATUS_BADGE } from "./data";

export const IncidentDetail = ({ incident, onClose }) => (
  <>
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
      onClick={onClose}
    />
    <div className="fixed right-0 top-0 h-screen w-full max-w-[440px] bg-white z-50 shadow-2xl flex flex-col overflow-hidden animate-slide-in">
      <div className="bg-[#131b2e] px-6 py-5 flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold text-[16px]">{incident.id}</h3>
          <p className="text-slate-400 text-[12px] mt-0.5">{incident.type}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Status & Priority */}
        <div className="flex gap-3">
          <span
            className={`text-[11px] font-bold px-3 py-1.5 rounded-full border ${PRIORITY_BADGE[incident.priority]}`}
          >
            {incident.priority}
          </span>
          <span
            className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${STATUS_BADGE[incident.status]}`}
          >
            {incident.status}
          </span>
        </div>

        {/* Info grid */}
        <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
          {[
            {
              label: "Date & Time",
              value: `${incident.date} · ${incident.time}`,
              icon: "calendar_today",
            },
            {
              label: "District",
              value: incident.district,
              icon: "location_on",
            },
            {
              label: "Assigned Unit",
              value: incident.unit,
              icon: "local_shipping",
            },
            { label: "Crew", value: incident.crew, icon: "people" },
            { label: "Duration", value: incident.duration, icon: "timer" },
            { label: "Outcome", value: incident.outcome, icon: "check_circle" },
          ].map((row, i) => (
            <div
              key={i}
              className="flex items-center px-4 py-3 border-b border-gray-100 last:border-0"
            >
              <span
                className="material-symbols-outlined text-gray-400 text-[16px] mr-3"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {row.icon}
              </span>
              <span className="text-[12px] text-gray-500 w-28 flex-shrink-0">
                {row.label}
              </span>
              <span className="text-[13px] font-semibold text-gray-800">
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div>
          <p className="text-[11px] text-gray-500 uppercase tracking-wider font-bold mb-3">
            Response Timeline
          </p>
          <div className="space-y-3">
            {[
              {
                time: incident.time,
                event: "Call received",
                color: "bg-blue-500",
              },
              {
                time: `+02:00`,
                event: "Unit dispatched",
                color: "bg-blue-500",
              },
              {
                time: `+08:00`,
                event: "Unit arrived on scene",
                color: "bg-purple-500",
              },
              {
                time: `+${incident.duration !== "—" ? incident.duration.replace(" min", ":00") : "—"}`,
                event: incident.outcome,
                color: "bg-green-500",
              },
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-gray-400 w-14 flex-shrink-0">
                  {t.time}
                </span>
                <div
                  className={`w-2 h-2 rounded-full ${t.color} flex-shrink-0`}
                />
                <span className="text-[12px] text-gray-700">{t.event}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-2">
        <button className="flex-1 py-2.5 bg-[#2563eb] text-white rounded-xl text-[13px] font-bold hover:bg-blue-700 transition-colors">
          Print Report
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-2.5 border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-600 hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  </>
);
