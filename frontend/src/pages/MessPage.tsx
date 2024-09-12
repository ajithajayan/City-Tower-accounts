import React, { useState } from "react";
import Layout from "../components/Layout/Layout";
import MessMembers from "../components/Mess/MessMembers";
import Menus from "../components/Mess/Menus";
import AddMembers from "@/components/Mess/AddMembers";

const MessPage: React.FC = () => {
  const [activeButton, setActiveButton] = useState("Menus");

  const handleButtonClick = (buttonName: string) => {
    setActiveButton(buttonName);
  };

  const renderContent = () => {
    switch (activeButton) {
      case "Menus":
        return <Menus />;
      case "Add Members":
        return <AddMembers />;
      case "Mess Members":
        return <MessMembers />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="p-4 bg-gray-100 min-h-screen">
        <header className="bg-white p-4 shadow-md rounded-md mb-4">
          <div className="flex flex-col md:flex-row md:justify-around space-y-2 md:space-y-0 md:space-x-4">
            {/* Menus Button */}
            <button
              className={`py-2 px-4 rounded w-full md:w-auto ${
                activeButton === "Menus"
                  ? "bg-[#6f42c1] text-white transition-all"
                  : "bg-purple-400 text-white hover:bg-purple-600"
              }`}
              onClick={() => handleButtonClick("Menus")}
            >
              Menus
            </button>
            {/* Add Members Button */}
            <button
              className={`py-2 px-4 rounded w-full md:w-auto ${
                activeButton === "Add Members"
                  ? "bg-[#6f42c1] text-white transition-all"
                  : "bg-purple-400 text-white hover:bg-purple-600"
              }`}
              onClick={() => handleButtonClick("Add Members")}
            >
              Add Members
            </button>
            {/* Mess Members Button */}
            <button
              className={`py-2 px-4 rounded w-full md:w-auto ${
                activeButton === "Mess Members"
                  ? "bg-[#6f42c1] text-white transition-all"
                  : "bg-purple-400 text-white hover:bg-purple-600"
              }`}
              onClick={() => handleButtonClick("Mess Members")}
            >
              Mess Members
            </button>
          </div>
        </header>
        <div className="bg-white p-4 rounded-md shadow-md">
          {renderContent()}
        </div>
      </div>
    </Layout>
  );
};

export default MessPage;
