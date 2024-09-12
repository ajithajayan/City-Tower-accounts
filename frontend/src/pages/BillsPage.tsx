import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import BillCard from "../components/Bills/BillCard";
import PaginationControls from "../components/Layout/PaginationControls";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { RotateCcw } from "lucide-react";
import { Bill } from "../types";
import Loader from "../components/Layout/Loader";
import { api } from "@/services/api";

const BillsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [allBills, setAllBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showCancelled, setShowCancelled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const itemsPerPage = 10;

  const fetchBills = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/bills/");
      setAllBills(response.data.results); // `response.data` already contains the parsed JSON data
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching bills:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  useEffect(() => {
    let filtered = allBills;

    if (fromDate && toDate) {
      const from = new Date(fromDate).setHours(0, 0, 0, 0);
      const to = new Date(toDate).setHours(23, 59, 59, 999);

      filtered = filtered.filter((bill) => {
        const billDate = new Date(bill.billed_at).getTime();
        return billDate >= from && billDate <= to;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter((bill) =>
        bill.id.toString().includes(searchTerm)
      );
    }

    if (showCancelled) {
      filtered = filtered.filter((bill) => bill.order.status === "cancelled");
    }

    setFilteredBills(filtered);
    setCurrentPage(1);
  }, [fromDate, toDate, searchTerm, showCancelled, allBills]);

  const handleReset = () => {
    setFromDate(null);
    setToDate(null);
    setSearchTerm("");
    setShowCancelled(false);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBills = filteredBills.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Generated Bills</h1>
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0">
        {/* Date Pickers and Reset */}
        <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
          {/* From Date */}
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700">
              From Date
            </label>
            <DatePicker
              selected={fromDate}
              onChange={(date) => setFromDate(date)}
              dateFormat="yyyy-MM-dd"
              className="mt-1 p-2 border rounded w-full"
              placeholderText="Select from date"
            />
          </div>

          {/* To Date */}
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700">
              To Date
            </label>
            <DatePicker
              selected={toDate}
              onChange={(date) => setToDate(date)}
              dateFormat="yyyy-MM-dd"
              className="mt-1 p-2 border rounded w-full"
              placeholderText="Select to date"
            />
          </div>

          {/* Reset Button */}
          <div className="flex items-center justify-center md:items-end">
            <button
              onClick={handleReset}
              className="p-2 rounded-full bg-red-500 text-white shadow-md ml-0 md:ml-4 mt-4"
              title="Reset"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>

        {/* Show Cancelled Bills Button */}
        <div className="flex justify-center w-full md:w-auto">
          <button
            onClick={() => setShowCancelled(!showCancelled)}
            className={`p-3 rounded-full ${
              showCancelled ? "bg-blue-500" : "bg-gray-500"
            } text-white shadow-md ml-0 md:ml-4`}
          >
            {showCancelled ? "Show All Bills" : "Show Cancelled Bills"}
          </button>
        </div>
      </div>

      {/* Bills Display */}
      {isLoading ? (
        <Loader />
      ) : paginatedBills.length ? (
        <>
          {paginatedBills.map((bill: Bill) => (
            <BillCard key={bill.id} bill={bill} onCancel={fetchBills} />
          ))}
          <PaginationControls
            currentPage={currentPage}
            totalPages={Math.ceil(filteredBills.length / itemsPerPage)}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <p className="text-gray-600">No bills found.</p>
      )}
    </Layout>
  );
};

export default BillsPage;
