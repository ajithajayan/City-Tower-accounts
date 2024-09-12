import React from "react";
import Layout from "../components/Layout/Layout";
import SettingItem from "../components/Settings/SettingItem";

const settingsItems = [
  "What's new",
  "About us",
  "Support",
  "Admin Pannel"
];

const SettingsPage: React.FC = () => {
  return (
    <Layout>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-[#52088E]">
        {settingsItems.map((item, index) => (
          <SettingItem 
            key={index} 
            label={item} 
            className="text-center whitespace-nowrap min-w-max"
          />
        ))}
      </div>
    </Layout>
  );
};

export default SettingsPage;
