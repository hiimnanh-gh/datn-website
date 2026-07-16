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
              className="flex justify-between items-center px-4 py-2.5 bg-slate-800/20 border border-slate-800 rounded-xl"
            >
              <span className="text-[12px] text-slate-400">{r.label}</span>
              <span className="text-[12px] font-bold font-mono text-white">
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
              color: "text-indigo-400 bg-indigo-950/30 border border-indigo-900/50 hover:bg-indigo-900/30",
              btn: "Run",
            },
            {
              label: "Rebuild Search Index",
              desc: "Re-index all incident and personnel records",
              icon: "manage_search",
              color: "text-purple-400 bg-purple-950/30 border border-purple-900/50 hover:bg-purple-900/30",
              btn: "Run",
            },
            {
              label: "Force Database Backup",
              desc: "Trigger an immediate off-schedule backup",
              icon: "backup",
              color: "text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 hover:bg-emerald-950/30",
              btn: "Run",
            },
            {
              label: "Restart Worker Nodes",
              desc: "Gracefully restart background job workers",
              icon: "restart_alt",
              color: "text-amber-400 bg-amber-950/30 border border-amber-900/50 hover:bg-amber-900/30",
              btn: "Restart",
            },
          ].map((a) => (
            <div
              key={a.label}
              className="flex items-center justify-between px-4 py-3.5 bg-slate-800/20 border border-slate-800 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`material-symbols-outlined text-[18px] ${a.color.split(" ")[0]}`}
                >
                  {a.icon}
                </span>
                <div>
                  <p className="text-[13px] font-bold text-white">
                    {a.label}
                  </p>
                  <p className="text-[11px] text-slate-500">{a.desc}</p>
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
              className="flex items-center justify-between px-4 py-3.5 bg-red-950/20 border border-red-900/40 rounded-xl"
            >
              <div>
                <p className="text-[13px] font-bold text-red-400">{d.label}</p>
                <p className="text-[11px] text-red-500/80">{d.desc}</p>
              </div>
              <button className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-red-400 bg-red-950/40 border border-red-900 hover:bg-red-900/30 transition-all">
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
