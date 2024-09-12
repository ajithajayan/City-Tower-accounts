import React from "react";
import { Link } from "react-router-dom";

interface SettingItemProps {
  label: string;
  className?: string;  // Adding className as an optional prop
}

const SettingItem: React.FC<SettingItemProps> = ({ label, className }) => {
  return (
    <div className={`bg-[#6a0dad] p-4 rounded-lg text-white text-center font-bold transition-transform transform hover:scale-105 hover:bg-[#8b00ff] ${className}`}>
      <span>
        {label === "Admin Pannel" ? (
          // Link for "Admin Pannel" that opens in a new tab
          <Link to={`${import.meta.env.VITE_APP_ADMIN_URL}`} target="_blank" rel="noopener noreferrer">
            {label}
          </Link>
        ) : (
          <>{label}</>
        )}
      </span>
    </div>
  );
};

export default SettingItem;
