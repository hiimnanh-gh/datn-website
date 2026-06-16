import React from "react";
import { ROLE_COLORS, STATUS_COLORS } from "./data";

export const StaffDrawer = ({ staff, onClose }) => {
  const rc = ROLE_COLORS[staff.role] || ROLE_COLORS.Driver;
  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-screen w-full max-w-[420px] bg-white z-50 shadow-2xl flex flex-col overflow-hidden animate-slide-in">
        <div className="bg-[#131b2e] px-6 py-6 pb-8">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white mb-4 block ml-auto p-1 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl ${rc.avatar} flex items-center justify-center text-white text-[26px] font-bold shadow-lg`}
            >
              {staff.avatar}
            </div>
            <div>
              <h3 className="text-white font-bold text-[17px]">{staff.name}</h3>
              <p className="text-slate-400 text-[12px] mt-0.5">
                {staff.id} · {staff.dept}
              </p>
              <div className="flex gap-2 mt-2">
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${rc.badge}`}
                >
                  {staff.role}
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${STATUS_COLORS[staff.status]}`}
                >
                  {staff.status}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
            {[
              { label: "Email", value: staff.email, icon: "email" },
              { label: "Phone", value: staff.phone, icon: "phone" },
              { label: "Joined", value: staff.joined, icon: "calendar_today" },
              { label: "Shift", value: staff.shifts, icon: "schedule" },
            ].map((r, i) => (
              <div
                key={i}
                className="flex items-center px-4 py-3 border-b border-gray-100 last:border-0"
              >
                <span
                  className="material-symbols-outlined text-gray-400 text-[15px] mr-3"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {r.icon}
                </span>
                <span className="text-[11px] text-gray-500 w-16 flex-shrink-0">
                  {r.label}
                </span>
                <span className="text-[13px] font-semibold text-gray-800">
                  {r.value}
                </span>
              </div>
            ))}
          </div>
          <div>
            <p className="text-[11px] text-gray-500 uppercase tracking-wider font-bold mb-3">
              Certifications
            </p>
            <div className="flex flex-wrap gap-2">
              {staff.certifications.map((c) => (
                <span
                  key={c}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider font-bold mb-3">
              Performance (30 days)
            </p>
            {[
              { label: "Shifts completed", value: "22 / 22", pct: 100 },
              { label: "Incidents handled", value: "47", pct: 78 },
              { label: "Avg response time", value: "6.4 min", pct: 85 },
            ].map((m) => (
              <div key={m.label} className="mb-3 last:mb-0">
                <div className="flex justify-between mb-1">
                  <span className="text-[11px] text-gray-600">{m.label}</span>
                  <span className="text-[11px] font-bold text-gray-900">
                    {m.value}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${m.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-2">
          <button className="flex-1 py-2.5 bg-[#2563eb] text-white rounded-xl text-[13px] font-bold hover:bg-blue-700 transition-colors">
            Edit Profile
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
};
export default StaffDrawer;
