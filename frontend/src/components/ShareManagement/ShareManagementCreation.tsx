import React, { useState } from "react";
import ShareManagementList from "./ShareManagementList";
import ShareManagementCreationFrom from "./ShareMangementCreationForm";

const ShareManagementCreation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"creation" | "list">("creation");


  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">ShareManagementCreation</h1>
      </div>

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
        <button
          className={`py-2 px-4 rounded ${
            activeTab === "creation" ? "bg-gray-400" : "bg-gray-200"
          } text-black hover:bg-gray-300 w-full sm:w-auto`}
          onClick={() => setActiveTab("creation")}
        >
          ShareMangementCreation
        </button>
        <button
          className={`py-2 px-4 rounded ${
            activeTab === "list" ? "bg-gray-400" : "bg-gray-200"
          } text-black hover:bg-gray-300 w-full sm:w-auto`}
          onClick={() => setActiveTab("list")}
        >
          ShareMnagementList
        </button>
      </div>

      <div>
        {activeTab === "creation" && <ShareManagementCreationFrom />}
        {activeTab === "list" && <ShareManagementList />}
      </div>

    </div>
  );
};

export default ShareManagementCreation;
