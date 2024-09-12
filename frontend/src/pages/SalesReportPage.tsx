import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import PaginationControls from "../components/Layout/PaginationControls";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { RotateCcw, Eye, Pencil } from "lucide-react";
import SalesPrint from "@/components/SalesReport/SalesPrint";
import { api } from "@/services/api";
import TransactionsModal from "@/components/Mess/TransactionsModal";
import SalesHistoryModal from "@/components/SalesReport/SalesHistoryModal";
import SalesEditModal from "@/components/SalesReport/SalesEditModal";
import MessEditModal from "@/components/SalesReport/MessEditModal";
import { format } from "date-fns";

interface SalesReport {
  id: number;
  total_amount: number;
  status: string;
  order_type: string;
  payment_method: string;
  created_at: string;
  invoice_number: string;
  cash_amount: string;
  bank_amount: string;
  customer_phone_number: string;
  customer_name: string;
}

interface MessType {
  id: number;
  name: string;
}

interface MessReport {
  id: number;
  customer_name: string;
  mobile_number: string;
  mess_type: MessType;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  start_date: string;
  end_date: string;
  payment_method: string;
  grand_total: string;
  cash_amount: string;
  bank_amount: string;
  status: string;
}

export interface Transaction {
  id: number;
  received_amount: number;
  cash_amount: number;
  bank_amount: number;
  payment_method: string;
  status: string;
  date: string;
}

interface Sales {
  id: number;
  total_amount: number | string;
  status: string;
  order_type: string;
  payment_method: string;
  created_at: string;
  invoice_number: string;
  cash_amount: string | number;
  bank_amount: string | number;
  customer_phone_number: string;
}

const SalesReportPage: React.FC = () => {
  const [reportType, setReportType] = useState<"sales" | "mess">("sales");
  const [reports, setReports] = useState<SalesReport[]>([]);
  const [messReports, setMessReports] = useState<MessReport[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [activeButton, setActiveButton] = useState<string>("All"); // Default to "All"
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);
  const [isSalesHistoryModalOpen, setIsSalesHistoryModalOpen] = useState(false);
  const [isSalesEditModalOpen, setIsSalesEditModalOpen] = useState(false);
  const [isMessEditModalOpen, setIsMessEditModalOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState<
    SalesReport | MessReport | null
  >(null);
  const [, setIsAllButtonActive] = useState(true);
  const [showCancelledOrders, setShowCancelledOrders] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [orderHistory, setOrderHistory] = useState<Sales[]>([]);
  const [currentMember, setCurrentMember] = useState<
    SalesReport | MessReport | null
  >(null);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchDataWithFilter({});
  }, [reportType, fromDate, toDate, showCancelledOrders]);

  const fetchDataWithFilter = async (filter: Record<string, string>) => {
    try {
      const baseUrl =
        reportType === "sales"
          ? `${import.meta.env.VITE_APP_API_URL}/orders/sales_report/`
          : `${import.meta.env.VITE_APP_API_URL}/messes/mess_report/`;

      const url = new URL(baseUrl);
      const token = localStorage.getItem("token");

      const convertToUTCDate = (date: Date) => {
        const utcDate = new Date(
          Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
        );
        return utcDate.toISOString().split("T")[0];
      };

      if (fromDate) {
        url.searchParams.append("from_date", convertToUTCDate(fromDate));
      }
      if (toDate) {
        url.searchParams.append("to_date", convertToUTCDate(toDate));
      }

      // Default to delivered orders unless showCancelledOrders is true
      if (!showCancelledOrders) {
        url.searchParams.append("order_status", "delivered");
      } else {
        url.searchParams.append("order_status", "cancelled");
      }

      Object.entries(filter).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (reportType === "sales") {
          setReports(data);
        } else {
          setMessReports(data);
        }
        setCurrentPage(1);
      } else {
        console.error("HTTP error! status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const fetchTransactions = async (memberId: number) => {
    try {
      const response = await api.get(`/transactions/?mess_id=${memberId}`);
      if (response.data && Array.isArray(response.data.results)) {
        setTransactions(response.data.results);
      } else {
        console.error("Unexpected response format:", response.data);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  const fetchOrderHistory = async (mobileNumber: string) => {
    try {
      const response = await api.get(
        `/orders/user_order_history/?customer_phone_number=${mobileNumber}`
      );
      if (response.data && Array.isArray(response.data)) {
        setOrderHistory(response.data);
      } else {
        console.error("Unexpected response format:", response.data);
      }
    } catch (err) {
      console.error("Error fetching order history:", err);
    }
  };

  const handleShowCancelledOrdersClick = () => {
    setShowCancelledOrders(!showCancelledOrders);
  };
  const handleButtonClick = (buttonName: string) => {
    let filter: Record<string, string> = {};
    setActiveButton(buttonName);

    if (buttonName === "All") {
      setFromDate(null);
      setToDate(null);
      setCurrentPage(1);
      fetchDataWithFilter({});
    } else if (reportType === "sales") {
      switch (buttonName) {
        case "Dining":
          filter = { order_type: "dining" };
          break;
        case "Takeaway":
          filter = { order_type: "takeaway" };
          break;
        case "Delivery":
          filter = { order_type: "delivery" };
          break;
        case "Cash":
          filter = { payment_method: "cash" };
          break;
        case "Bank":
          filter = { payment_method: "bank" };
          break;
        case "Cash-Bank":
          filter = { payment_method: "cash-bank" };
          break;
        case "Credit":
          filter = { payment_method: "credit" };
          break;
        case "Canceled":
          filter = { order_status: "cancelled" };
          break;
        case "Delivered":
          filter = { order_status: "delivered" };
          break;
        default:
          filter = {};
      }
    } else if (reportType === "mess") {
      switch (buttonName) {
        case "Cash":
          filter = { payment_method: "cash" };
          break;
        case "Bank":
          filter = { payment_method: "bank" };
          break;
        case "Cash-Bank":
          filter = { payment_method: "cash-bank" };
          break;
        case "Credit":
          filter = { credit: "credit" };
          break;
        case "Breakfast and Lunch":
          filter = { mess_type: "breakfast_lunch" };
          break;
        case "Breakfast and Dinner":
          filter = { mess_type: "lunch_dinner" };
          break;
        case "Lunch and Dinner":
          filter = { mess_type: "breakfast_dinner" };
          break;
        case "Breakfast and Lunch and Dinner":
          filter = { mess_type: "breakfast_lunch_dinner" };
          break;
        default:
          filter = {};
      }
    }

    fetchDataWithFilter(filter);
  };

  const handleSalesMobileClick = async (report: SalesReport) => {
    await fetchOrderHistory(report.customer_phone_number);
    setCurrentMember(report);
    setIsSalesHistoryModalOpen(true);
  };

  const handleMobileClick = async (report: MessReport) => {
    await fetchTransactions(report.id);
    setCurrentMember(report);
    setIsTransactionsModalOpen(true);
  };

  const handleSalesEditClick = (report: SalesReport) => {
    setCurrentReport(report);
    setIsSalesEditModalOpen(true);
  };

  const handleMessEditClick = (report: MessReport) => {
    setCurrentReport(report);
    setIsMessEditModalOpen(true);
  };

  const handleModalClose = () => {
    setIsTransactionsModalOpen(false);
    setIsSalesHistoryModalOpen(false);
    setIsSalesEditModalOpen(false);
    setIsMessEditModalOpen(false);
    setCurrentReport(null);
    setCurrentMember(null);
  };

  const handleReset = () => {
    setFromDate(null);
    setToDate(null);
    setIsAllButtonActive(true);
    setActiveButton("All");
    setCurrentPage(1);
    fetchDataWithFilter({});
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = reports.slice(startIndex, startIndex + itemsPerPage);
  const paginatedMessReports = messReports.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const totalAmount =
    reportType === "sales"
      ? reports.reduce(
          (acc, report) => acc + parseFloat(report.total_amount.toString()),
          0
        )
      : messReports.reduce(
          (acc, report) => acc + parseFloat(report.grand_total.toString()),
          0
        );

  const totalCashAmount =
    reportType === "sales"
      ? reports.reduce(
          (acc, report) => acc + parseFloat(report.cash_amount.toString()),
          0
        )
      : messReports.reduce(
          (acc, report) => acc + parseFloat(report.cash_amount.toString()),
          0
        );

  const totalCardAmount =
    reportType === "sales"
      ? reports.reduce(
          (acc, report) => acc + parseFloat(report.bank_amount.toString()),
          0
        )
      : messReports.reduce(
          (acc, report) => acc + parseFloat(report.bank_amount.toString()),
          0
        );

  const totalBankAmount = reports
    .filter((report) => report.payment_method === "bank")
    .reduce((acc, report) => acc + parseFloat(report.bank_amount || "0"), 0); // Ensure bank_amount is parsed as float

  // If you don't have a credit_amount, you can sum based on payment_method 'credit'
  const totalCreditAmount = reports
    .filter((report) => report.payment_method === "credit")
    .reduce(
      (acc, report) => acc + parseFloat(report.total_amount.toString() || "0"),
      0
    );

  return (
    <Layout>
      <div className="p-4">
        <div className="flex flex-col ">
          <div className="flex flex-col space-y-4 mb-4">
            {/* Report Buttons */}
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
              <button
                onClick={() => setReportType("sales")}
                className={`w-full md:w-auto p-4 rounded-lg shadow-md cursor-pointer ${
                  reportType === "sales"
                    ? "bg-purple-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                Sales Report
              </button>
              <button
                onClick={() => setReportType("mess")}
                className={`w-full md:w-auto p-4 rounded-lg shadow-md cursor-pointer ${
                  reportType === "mess"
                    ? "bg-purple-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                Mess Report
              </button>

              <button
                onClick={handleShowCancelledOrdersClick}
                className={`w-full md:w-auto p-4 rounded-lg shadow-md cursor-pointer ${
                  showCancelledOrders ? "bg-red-500 text-white" : "bg-gray-200"
                }`}
              >
                {showCancelledOrders
                  ? "Show All Orders"
                  : "Show Cancelled Orders"}
              </button>
            </div>

            {/* Date Inputs, Reset Button, and Print Button */}
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 items-center">
              {/* Align date inputs and reset button on the same line */}
              <div className="w-full lg:w-auto lg:ml-auto lg:flex lg:items-center lg:space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    From Date
                  </label>
                  <DatePicker
                    selected={fromDate}
                    onChange={(date) => setFromDate(date)}
                    dateFormat="yyyy-MM-dd"
                    className="w-full mt-1 p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    To Date
                  </label>
                  <DatePicker
                    selected={toDate}
                    onChange={(date) => setToDate(date)}
                    dateFormat="yyyy-MM-dd"
                    className="w-full mt-1 p-2 border rounded"
                  />
                </div>

                {/* Reset button */}
                <button
                  onClick={handleReset}
                  className="p-2 mt-2 md:mt-6 rounded-full bg-red-500 text-white shadow-md lg:mt-0"
                  title="Reset"
                >
                  <RotateCcw size={20} />
                </button>
              </div>

              {/* Print Button positioned below date fields */}
              <div className="lg:mt-2 lg:ml-4">
                <SalesPrint
                  reportType={reportType}
                  reports={reports}
                  messReports={messReports}
                  totalAmount={totalAmount}
                  totalCashAmount={totalCashAmount}
                  totalCardAmount={totalCardAmount}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => handleButtonClick("All")}
            className={`p-2 rounded w-auto ${
              activeButton === "All" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            All
          </button>
          {reportType === "sales" ? (
            <>
              {[
                "Dining",
                "Takeaway",
                "Delivery",
                "Cash",
                "Bank",
                "Cash-Bank",
                "Credit",
                // "Canceled",
                "Delivered",
              ].map((type) => (
                <button
                  key={type}
                  onClick={() => handleButtonClick(type)}
                  className={`p-2 rounded w-auto md:w-auto sm:w-1/2 ${
                    activeButton === type
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </>
          ) : (
            <>
              {[
                "Cash",
                "Bank",
                "Cash-Bank",
                "Credit",
                "Breakfast and Lunch",
                "Breakfast and Dinner",
                "Lunch and Dinner",
                "Breakfast and Lunch and Dinner",
              ].map((type) => (
                <button
                  key={type}
                  onClick={() => handleButtonClick(type)}
                  className={`p-2 rounded w-full md:w-auto sm:w-1/3 ${
                    activeButton === type
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr>
                {reportType === "sales" ? (
                  <>
                    <th className="py-2 px-4 bg-gray-200">Invoice</th>
                    <th className="py-2 px-4 bg-gray-200">Mobile</th>
                    <th className="py-2 px-4 bg-gray-200">Date</th>
                    <th className="py-2 px-4 bg-gray-200">Order Type</th>
                    <th className="py-2 px-4 bg-gray-200">Payment Method</th>
                    <th className="py-2 px-4 bg-gray-200">Order Status</th>
                    <th className="py-2 px-4 bg-gray-200">Total Amount</th>
                    <th className="py-2 px-4 bg-gray-200">Cash Amount</th>
                    <th className="py-2 px-4 bg-gray-200">Bank Amount</th>
                    <th className="py-2 px-4 bg-gray-200">History</th>
                    <th className="py-2 px-4 bg-gray-200">Actions</th>
                  </>
                ) : (
                  <>
                    <th className="py-2 px-4 bg-gray-200">Name</th>
                    <th className="py-2 px-4 bg-gray-200">Mobile</th>
                    <th className="py-2 px-4 bg-gray-200">Mess Type</th>
                    <th className="py-2 px-4 bg-gray-200">Total</th>
                    <th className="py-2 px-4 bg-gray-200">Paid</th>
                    <th className="py-2 px-4 bg-gray-200">Pending</th>
                    <th className="py-2 px-4 bg-gray-200">Start Date</th>
                    <th className="py-2 px-4 bg-gray-200">End Date</th>
                    <th className="py-2 px-4 bg-gray-200">Payment Method</th>
                    <th className="py-2 px-4 bg-gray-200">Order Status</th>
                    <th className="py-2 px-4 bg-gray-200">Transactions</th>
                    <th className="py-2 px-4 bg-gray-200">Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {reportType === "sales"
                ? paginatedReports.map((report) => (
                    <tr key={report.id}>
                      <td className="border px-4 py-2">
                        {report.invoice_number}
                      </td>
                      <td className="border px-4 py-2">
                        {report.customer_phone_number || "N/A"}
                      </td>
                      <td className="border px-4 py-2">
                        {format(new Date(report.created_at), "dd-MM-yyyy")}
                      </td>
                      <td className="border px-4 py-2">{report.order_type}</td>
                      <td className="border px-4 py-2">
                        {report.payment_method}
                      </td>
                      <td className="border px-4 py-2">{report.status}</td>
                      <td className="border px-4 py-2">
                        {report.total_amount}
                      </td>
                      <td className="border px-4 py-2">{report.cash_amount}</td>
                      <td className="border px-4 py-2">{report.bank_amount}</td>
                      <td className="border px-4 py-2">
                        <button
                          onClick={() => handleSalesMobileClick(report)}
                          className="text-blue-500 hover:underline"
                        >
                          <Eye />
                        </button>
                      </td>
                      <td className="border px-4 py-2">
                        <button onClick={() => handleSalesEditClick(report)}>
                          <Pencil />
                        </button>
                      </td>
                    </tr>
                  ))
                : paginatedMessReports.map((report) => (
                    <tr key={report.id}>
                      <td className="border px-4 py-2">
                        {report.customer_name}
                      </td>
                      <td className="border px-4 py-2">
                        {report.mobile_number}
                      </td>
                      <td className="border px-4 py-2">
                        {report.mess_type.name}
                      </td>
                      <td className="border px-4 py-2">{report.grand_total}</td>
                      <td className="border px-4 py-2">{report.paid_amount}</td>
                      <td className="border px-4 py-2">
                        {report.pending_amount}
                      </td>
                      <td className="border px-4 py-2">
                        {format(new Date(report.start_date), "dd-MM-yyyy")}
                      </td>
                      <td className="border px-4 py-2">
                        {format(new Date(report.end_date), "dd-MM-yyyy")}
                      </td>
                      <td className="border px-4 py-2">
                        {report.payment_method}
                      </td>
                      <td className="border px-4 py-2">{report.status}</td>
                      <td className="border px-4 py-2">
                        <button
                          onClick={() => handleMobileClick(report)}
                          className="text-blue-500 hover:underline"
                        >
                          <Eye />
                        </button>
                      </td>
                      <td className="border px-4 py-2">
                        <button onClick={() => handleMessEditClick(report)}>
                          <Pencil />
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-md">
          <div className="flex justify-end space-x-4">
            <p className="font-bold text-lg">Cash Amount:</p>
            <p className="font-bold text-lg">₹{totalCashAmount.toFixed(2)}</p>
          </div>

          <div className="flex justify-end space-x-4 mt-2">
            <p className="font-bold text-lg">Bank Amount:</p>
            <p className="font-bold text-lg">
              ₹{totalBankAmount.toFixed(2)}
            </p>{" "}
            {/* Ensure totalBankAmount is properly set */}
          </div>

          <div className="flex justify-end space-x-4 mt-2">
            <p className="font-bold text-lg">Credit Amount:</p>
            <p className="font-bold text-lg">
              ₹{totalCreditAmount.toFixed(2)}
            </p>{" "}
            {/* Ensure totalCreditAmount is properly set */}
          </div>

          <div className="flex justify-end space-x-4 mt-2">
            <p className="font-bold text-lg">Total Amount:</p>
            <p className="font-bold text-lg">₹{totalAmount.toFixed(2)}</p>
          </div>
        </div>

        <PaginationControls
          currentPage={currentPage}
          totalPages={Math.ceil(
            (reportType === "sales" ? reports.length : messReports.length) /
              itemsPerPage
          )}
          onPageChange={setCurrentPage}
        />

        {isTransactionsModalOpen && currentMember && (
          <TransactionsModal
            transactions={transactions}
            isOpen={isTransactionsModalOpen}
            onClose={handleModalClose}
          />
        )}

        {isSalesHistoryModalOpen && currentMember && (
          <SalesHistoryModal
            orderhistory={orderHistory}
            isOpen={isSalesHistoryModalOpen}
            onClose={handleModalClose}
          />
        )}

        {isSalesEditModalOpen && (
          <SalesEditModal
            isOpen={isSalesEditModalOpen}
            onClose={handleModalClose}
            report={currentReport as SalesReport}
          />
        )}

        {isMessEditModalOpen && (
          <MessEditModal
            isOpen={isMessEditModalOpen}
            onClose={handleModalClose}
            report={currentReport as MessReport}
          />
        )}
      </div>
    </Layout>
  );
};

export default SalesReportPage;
