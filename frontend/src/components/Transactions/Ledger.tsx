import React, { useState } from "react";
import LedgerCreationModal from "@/components/modals/LedgerCreationModal";
import LedgerInfo from "./LedgerInfo";
import MainGroups from "./MainGroups";

const Ledger: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "report">("info");

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">Ledger</h1>
        <button
          className="bg-[#6f42c1] text-white py-2 px-4 rounded w-full sm:w-auto hover:bg-purple-700"
          onClick={openModal}
        >
          Create Ledger
        </button>
      </div>

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
        <button
          className={`py-2 px-4 rounded ${
            activeTab === "info" ? "bg-gray-400" : "bg-gray-200"
          } text-black hover:bg-gray-300 w-full sm:w-auto`}
          onClick={() => setActiveTab("info")}
        >
          Ledger Info
        </button>
        <button
          className={`py-2 px-4 rounded ${
            activeTab === "report" ? "bg-gray-400" : "bg-gray-200"
          } text-black hover:bg-gray-300 w-full sm:w-auto`}
          onClick={() => setActiveTab("report")}
        >
          Main Groups
        </button>
      </div>

      <div>
        {activeTab === "info" && <LedgerInfo />}
        {activeTab === "report" && <MainGroups />}
      </div>

      {isModalOpen && <LedgerCreationModal isOpen={isModalOpen} onClose={closeModal} />}
    </div>
  );
};

export default Ledger;
