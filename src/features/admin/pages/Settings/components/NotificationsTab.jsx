import React, { useState } from "react";
import SectionCard from "./SectionCard";
import SettingRow from "./SettingRow";
import Toggle from "./Toggle";

export const NotificationsTab = () => {
  const [settings, setSettings] = useState({
    criticalAlert: true,
    dispatchUpdate: true,
    systemDown: true,
    fleetMaint: false,
    dailyReport: true,
    weeklyDigest: false,
    sms: false,
    email: true,
    push: true,
  });
  const toggle = (key) => setSettings((s) => ({ ...s, [key]: !s[key] }));
  return (
    <div className="space-y-5">
      <SectionCard
        title="Alert Types"
        subtitle="Choose which events trigger notifications"
      >
        <SettingRow
          label="Critical Incident Alerts"
          description="Cardiac, stroke, trauma — immediate push"
        >
          <Toggle
            checked={settings.criticalAlert}
            onChange={() => toggle("criticalAlert")}
          />
        </SettingRow>
        <SettingRow
          label="Dispatch Status Updates"
          description="Unit assigned, en route, arrived"
        >
          <Toggle
            checked={settings.dispatchUpdate}
            onChange={() => toggle("dispatchUpdate")}
          />
        </SettingRow>
        <SettingRow
          label="System Downtime Alerts"
          description="Service interruptions or high latency"
        >
          <Toggle
            checked={settings.systemDown}
            onChange={() => toggle("systemDown")}
          />
        </SettingRow>
        <SettingRow
          label="Fleet Maintenance Due"
          description="Units requiring scheduled maintenance"
        >
          <Toggle
            checked={settings.fleetMaint}
            onChange={() => toggle("fleetMaint")}
          />
        </SettingRow>
        <SettingRow
          label="Daily Summary Report"
          description="End-of-day incident and fleet summary"
        >
          <Toggle
            checked={settings.dailyReport}
            onChange={() => toggle("dailyReport")}
          />
        </SettingRow>
        <SettingRow
          label="Weekly Digest"
          description="Compiled analytics sent every Monday"
        >
          <Toggle
            checked={settings.weeklyDigest}
            onChange={() => toggle("weeklyDigest")}
          />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Delivery Channels">
        <SettingRow label="Email Notifications" description="">
          <Toggle checked={settings.email} onChange={() => toggle("email")} />
        </SettingRow>
        <SettingRow
          label="Push Notifications"
          description="Browser or mobile push"
        >
          <Toggle checked={settings.push} onChange={() => toggle("push")} />
        </SettingRow>
        <SettingRow
          label="SMS Alerts"
          description="Critical-only via SMS gateway"
        >
          <Toggle checked={settings.sms} onChange={() => toggle("sms")} />
        </SettingRow>
      </SectionCard>
    </div>
  );
};
export default NotificationsTab;
