import Layout from "@/components/Layout/Layout";
import React, { useState } from "react";
import ShareManagementCreation from "@/components/ShareManagement/ShareManagementCreation";
import ProfitLossShareTransaction from "@/components/ShareManagement/ProfitLoseShareTransaction";
import ProfitLoseShareReport from "@/components/ShareManagement/ProfitLoseShareReport";
import IndividualReport from "@/components/ShareManagement/IndividualReport";
const ShareManagementPage: React.FC = () => {
    const [activeButton, setActiveButton] = useState("ShareManagementCreation");

    const handleButtonClick = (buttonName: string) => {
        setActiveButton(buttonName);
    };
    const renderContent = () => {
        switch (activeButton) {
            case "ShareManagementCreation":
                return <ShareManagementCreation />;
            case "ProfitLoseShareTransaction":
                return <ProfitLossShareTransaction />
            case "ProfitLoseShareReport":
                return <ProfitLoseShareReport />
            case "IndividualReport":
                return <IndividualReport />
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
                            className={`py-2 px-4 rounded ${activeButton === "ShareManagementCreation" ? "bg-[#6f42c1] text-white transition-all" : "bg-purple-400 text-white hover:bg-purple-600"
                                }`}
                            onClick={() => handleButtonClick("ShareManagementCreation")}
                        >
                            ShareMangement Creation
                        </button>
                        <button
                            className={`py-2 px-4 rounded ${activeButton === "ProfitLoseShareTransaction" ? "bg-[#6f42c1] text-white transition-all" : "bg-purple-400 text-white hover:bg-purple-600"
                                }`}
                            onClick={() => handleButtonClick("ProfitLoseShareTransaction")}
                        >
                            Profit or lose Share Transaction
                        </button>
                        <button
                            className={`py-2 px-4 rounded ${activeButton === "ProfitLoseShareReport" ? "bg-[#6f42c1] text-white transition-all" : "bg-purple-400 text-white hover:bg-purple-600"
                                }`}
                            onClick={() => handleButtonClick("ProfitLoseShareReport")}
                        >
                            ProfitLoseShareReport
                        </button>
                        <button
                            className={`py-2 px-4 rounded ${activeButton === "IndividualReport" ? "bg-[#6f42c1] text-white transition-all" : "bg-purple-400 text-white hover:bg-purple-600"
                                }`}
                            onClick={() => handleButtonClick("IndividualReport")}
                        >
                            IndividualReport
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

export default ShareManagementPage;
