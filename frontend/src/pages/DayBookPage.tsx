import React, { useState } from "react";
import Layout from "../components/Layout/Layout";
import DayBookReport from "@/components/DayBook/DayBookReport";
import CashCountSheet from "@/components/DayBook/CashCountSheet";

const DayBookPage: React.FC = () => {
  const [activeButton, setActiveButton] = useState("DayBookReport");

  const handleButtonClick = (buttonName: string) => {
    setActiveButton(buttonName);
  };

  const renderContent = () => {
    switch (activeButton) {
      case "DayBookReport":
        return <DayBookReport />;
      case "CashCountSheet":
        return <CashCountSheet />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="p-4 bg-gray-100 min-h-screen">
        <header className="bg-white p-4 shadow-md rounded-md mb-4">
          <div className="flex flex-wrap justify-around gap-2">
            <button
              className={`py-2 px-4 rounded ${
                activeButton === "DayBookReport" ? "bg-[#6f42c1] text-white transition-all" : "bg-purple-400 text-white hover:bg-purple-600"
              }`}
              onClick={() => handleButtonClick("DayBookReport")}
            >
              DayBookReport
            </button>
            <button
              className={`py-2 px-4 rounded ${
                activeButton === "CashCountSheet" ? "bg-[#6f42c1] text-white transition-all" : "bg-purple-400 text-white hover:bg-purple-600"
              }`}
              onClick={() => handleButtonClick("CashCountSheet")}
            >
              CashCountSheet
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

export default DayBookPage;
