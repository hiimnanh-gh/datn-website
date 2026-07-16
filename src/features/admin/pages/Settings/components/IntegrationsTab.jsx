import React from "react";
import SectionCard from "./SectionCard";

export const IntegrationsTab = () => {
  const integrations = [
    {
      name: "GPS Telematics API",
      provider: "VietMap",
      status: "Connected",
      icon: "location_on",
      color: "text-green-600 bg-green-50",
    },
    {
      name: "Hospital System Bridge",
      provider: "HL7 FHIR v4",
      status: "Connected",
      icon: "local_hospital",
      color: "text-green-600 bg-green-50",
    },
    {
      name: "Twilio SMS Gateway",
      provider: "Twilio",
      status: "Connected",
      icon: "sms",
      color: "text-green-600 bg-green-50",
    },
    {
      name: "Firebase Push",
      provider: "Google FCM",
      status: "Connected",
      icon: "notifications_active",
      color: "text-green-600 bg-green-50",
    },
    {
      name: "GIS / MapBox",
      provider: "Mapbox GL",
      status: "Disconnected",
      icon: "map",
      color: "text-gray-400 bg-gray-100",
    },
    {
      name: "Slack Alerts",
      provider: "Slack API",
      status: "Not configured",
      icon: "chat",
      color: "text-gray-400 bg-gray-100",
    },
  ];
  return (
    <div className="space-y-5">
      <SectionCard
        title="Connected Services"
        subtitle="Third-party integrations and APIs"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {integrations.map((int) => {
            const isConn = int.status === "Connected";
            return (
              <div
                key={int.name}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-800 bg-slate-800/20 hover:border-slate-700 transition-all"
              >
                <div className={`p-2.5 rounded-xl ${isConn ? "text-emerald-400 bg-emerald-950/30" : "text-slate-400 bg-slate-800"}`}>
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {int.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-white truncate">
                    {int.name}
                  </p>
                  <p className="text-[11px] text-slate-500">{int.provider}</p>
                </div>
                <div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      isConn
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {int.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="API Keys" subtitle="Manage access tokens">
        <div className="space-y-3">
          {["Production API Key", "Webhook Secret", "Staging API Key"].map(
            (k) => (
              <div
                key={k}
                className="flex items-center justify-between px-4 py-3 bg-slate-800/20 rounded-xl border border-slate-800"
              >
                <div>
                  <p className="text-[13px] font-semibold text-slate-200">{k}</p>
                  <p className="text-[11px] font-mono text-slate-500">
                    sk_••••••••••••••••••••••••••••XXXX
                  </p>
                </div>
                <button className="text-[12px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors">
                  <span className="material-symbols-outlined text-[14px]">
                    refresh
                  </span>
                  Rotate
                </button>
              </div>
            ),
          )}
        </div>
      </SectionCard>
    </div>
  );
};
export default IntegrationsTab;
