import React, { useState } from "react";
import SectionCard from "./SectionCard";
import SettingRow from "./SettingRow";
import Toggle from "./Toggle";

export const GeneralTab = () => {
  const [orgName, setOrgName] = useState("TP.HCM Emergency Services");
  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh");
  const [lang, setLang] = useState("vi");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      <SectionCard
        title="Organization Info"
        subtitle="Basic information about your EMS organization"
      >
        <div className="space-y-4">
          <div>
            <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wider block mb-1.5">
              Organization Name
            </label>
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wider block mb-1.5">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
              >
                <option value="Asia/Ho_Chi_Minh">
                  Asia/Ho Chi Minh (UTC+7)
                </option>
                <option value="Asia/Bangkok">Asia/Bangkok (UTC+7)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div>
              <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wider block mb-1.5">
                Language
              </label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wider block mb-1.5">
              Emergency Hotline
            </label>
            <input
              defaultValue="115"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
            />
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            onClick={handleSave}
            className={`px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all ${saved ? "bg-green-600" : "bg-[#2563eb] hover:bg-blue-700"} text-white flex items-center gap-2`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {saved ? "check" : "save"}
            </span>
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Display Preferences">
        <div>
          <SettingRow
            label="Compact Mode"
            description="Reduce spacing and font sizes across the interface"
          >
            <Toggle checked={false} onChange={() => {}} />
          </SettingRow>
          <SettingRow
            label="Show unit IDs in dispatch"
            description="Display vehicle IDs alongside crew names"
          >
            <Toggle checked={true} onChange={() => {}} />
          </SettingRow>
          <SettingRow label="Dark Mode" description="Use a dark color scheme">
            <Toggle checked={false} onChange={() => {}} />
          </SettingRow>
        </div>
      </SectionCard>
    </div>
  );
};
export default GeneralTab;
