import { useState, useEffect } from "react";
import useTopbarStore from "../../../../store/useTopbarStore";

// Styles
import "./Settings.css";

// Configurations
import { TABS } from "./data";

// Sub-components
import GeneralTab from "./components/GeneralTab";
import SecurityTab from "./components/SecurityTab";
import NotificationsTab from "./components/NotificationsTab";
import IntegrationsTab from "./components/IntegrationsTab";
import SystemTab from "./components/SystemTab";

const TAB_CONTENT = {
  general: GeneralTab,
  security: SecurityTab,
  notifications: NotificationsTab,
  integrations: IntegrationsTab,
  system: SystemTab,
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const Content = TAB_CONTENT[activeTab];
  const { setSlot, clearSlot } = useTopbarStore();

  /* ── Topbar slot: settings tabs breadcrumb ── */
  useEffect(() => {
    const current = TABS.find((t) => t.id === activeTab);
    setSlot(
      <div className="flex items-center gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              t.id === activeTab
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <span
              className="material-symbols-outlined text-[12px]"
              style={t.id === activeTab ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {t.icon}
            </span>
            <span className="hidden lg:inline">{t.label}</span>
          </button>
        ))}
      </div>,
    );
    return () => clearSlot();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-950 p-6 pb-12 space-y-6 max-w-[1100px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-[26px] font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-indigo-400 text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span>
          Settings
        </h1>
        <p className="text-[13px] text-slate-400 mt-0.5">System configuration and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <nav className="w-52 flex-shrink-0 space-y-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all text-left ${
                activeTab === t.id
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={activeTab === t.id ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {t.icon}
              </span>
              {t.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Content />
        </div>
      </div>
    </div>
  );
};

export default Settings;
