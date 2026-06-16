import React from "react";
import SectionCard from "./SectionCard";

export const SystemTab = () => {
  return (
    <div className="space-y-5">
      <SectionCard title="Server Info" subtitle="Runtime environment details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Node Version", value: "v20.14.0" },
            { label: "Environment", value: "Production" },
            { label: "DB Engine", value: "PostgreSQL 15.4" },
            { label: "Cache", value: "Redis 7.2" },
            { label: "Uptime", value: "14d 7h 42m" },
            { label: "Last Deploy", value: "2026-06-01 03:00" },
            { label: "Build Version", value: "v2.4.1-stable" },
            { label: "Region", value: "ap-southeast-1" },
          ].map((r) => (
            <div
              key={r.label}
              className="flex justify-between items-center px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100"
            >
              <span className="text-[12px] text-gray-500">{r.label}</span>
              <span className="text-[12px] font-bold font-mono text-gray-900">
                {r.value}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Maintenance Actions">
        <div className="space-y-3">
          {[
            {
              label: "Clear Cache",
              desc: "Flush Redis cache — system will re-warm automatically",
              icon: "cached",
              color: "text-blue-600 bg-blue-50 hover:bg-blue-100",
              btn: "Run",
            },
            {
              label: "Rebuild Search Index",
              desc: "Re-index all incident and personnel records",
              icon: "manage_search",
              color: "text-purple-600 bg-purple-50 hover:bg-purple-100",
              btn: "Run",
            },
            {
              label: "Force Database Backup",
              desc: "Trigger an immediate off-schedule backup",
              icon: "backup",
              color: "text-green-600 bg-green-50 hover:bg-green-100",
              btn: "Run",
            },
            {
              label: "Restart Worker Nodes",
              desc: "Gracefully restart background job workers",
              icon: "restart_alt",
              color: "text-amber-600 bg-amber-50 hover:bg-amber-100",
              btn: "Restart",
            },
          ].map((a) => (
            <div
              key={a.label}
              className="flex items-center justify-between px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`material-symbols-outlined text-[18px] ${a.color.split(" ")[0]}`}
                >
                  {a.icon}
                </span>
                <div>
                  <p className="text-[13px] font-bold text-gray-900">
                    {a.label}
                  </p>
                  <p className="text-[11px] text-gray-500">{a.desc}</p>
                </div>
              </div>
              <button
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors ${a.color}`}
              >
                {a.btn}
              </button>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Danger Zone"
        subtitle="Irreversible actions — proceed with caution"
      >
        <div className="space-y-3">
          {[
            {
              label: "Reset All Settings",
              desc: "Restore all admin settings to factory defaults",
            },
            {
              label: "Purge Audit Logs",
              desc: "Delete all audit log entries older than 90 days",
            },
          ].map((d) => (
            <div
              key={d.label}
              className="flex items-center justify-between px-4 py-3.5 bg-red-50 rounded-xl border border-red-100"
            >
              <div>
                <p className="text-[13px] font-bold text-red-900">{d.label}</p>
                <p className="text-[11px] text-red-500">{d.desc}</p>
              </div>
              <button className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-red-700 bg-red-100 hover:bg-red-200 transition-colors">
                Proceed
              </button>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};
export default SystemTab;
