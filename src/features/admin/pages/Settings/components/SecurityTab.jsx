import React, { useState } from "react";
import SectionCard from "./SectionCard";
import SettingRow from "./SettingRow";
import Toggle from "./Toggle";

export const SecurityTab = () => {
  const [twoFA, setTwoFA] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  return (
    <div className="space-y-5">
      <SectionCard
        title="Authentication"
        subtitle="Control how administrators log in"
      >
        <SettingRow
          label="Two-Factor Authentication"
          description="Require 2FA for all admin accounts"
        >
          <Toggle checked={twoFA} onChange={setTwoFA} />
        </SettingRow>
        <SettingRow
          label="SSO / SAML"
          description="Enable single sign-on via your identity provider"
        >
          <Toggle checked={false} onChange={() => {}} />
        </SettingRow>
        <SettingRow
          label="Session Timeout"
          description="Automatically log out after inactivity"
        >
          <select
            value={sessionTimeout}
            onChange={(e) => setSessionTimeout(e.target.value)}
            className="px-3 py-1.5 border border-slate-700 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-950 text-white"
          >
            {["15", "30", "60", "120"].map((v) => (
              <option key={v} value={v}>
                {v} min
              </option>
            ))}
          </select>
        </SettingRow>
      </SectionCard>

      <SectionCard title="Password Policy">
        <SettingRow
          label="Minimum length"
          description="Minimum 8 characters required"
        >
          <input
            defaultValue="8"
            type="number"
            min="6"
            max="32"
            className="w-16 px-2 py-1.5 border border-slate-700 bg-slate-950 text-white rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-indigo-500/50 text-center"
          />
        </SettingRow>
        <SettingRow label="Require uppercase & numbers" description="">
          <Toggle checked={true} onChange={() => {}} />
        </SettingRow>
        <SettingRow label="Password expiry (days)" description="">
          <input
            defaultValue="90"
            type="number"
            className="w-16 px-2 py-1.5 border border-slate-700 bg-slate-950 text-white rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-indigo-500/50 text-center"
          />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Audit Log" subtitle="Recent security events">
        <div className="space-y-2">
          {[
            {
              time: "14:05",
              event: "Admin login",
              user: "nguyenanh",
              ip: "192.168.1.44",
            },
            {
              time: "13:02",
              event: "Password change",
              user: "admin_IT",
              ip: "10.0.0.5",
            },
            {
              time: "12:47",
              event: "Failed login (×3)",
              user: "unknown",
              ip: "203.45.12.77",
            },
          ].map((r, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800/40 transition-colors"
            >
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${r.event.includes("Failed") ? "bg-red-500" : "bg-emerald-500"}`}
              />
              <span className="text-[11px] text-slate-500 font-mono w-12">
                {r.time}
              </span>
              <span className="text-[13px] text-slate-200 flex-1">
                {r.event}
              </span>
              <span className="text-[11px] font-semibold text-slate-300">
                {r.user}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {r.ip}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};
export default SecurityTab;
