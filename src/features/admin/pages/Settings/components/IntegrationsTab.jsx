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
          {integrations.map((int) => (
            <div
              key={int.name}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-gray-200 transition-all"
            >
              <div className={`p-2.5 rounded-xl ${int.color}`}>
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {int.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-900 truncate">
                  {int.name}
                </p>
                <p className="text-[11px] text-gray-500">{int.provider}</p>
              </div>
              <div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    int.status === "Connected"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {int.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="API Keys" subtitle="Manage access tokens">
        <div className="space-y-3">
          {["Production API Key", "Webhook Secret", "Staging API Key"].map(
            (k) => (
              <div
                key={k}
                className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div>
                  <p className="text-[13px] font-semibold text-gray-800">{k}</p>
                  <p className="text-[11px] font-mono text-gray-400">
                    sk_••••••••••••••••••••••••••••XXXX
                  </p>
                </div>
                <button className="text-[12px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
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
