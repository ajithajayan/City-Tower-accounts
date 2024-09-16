import React, { useState, useEffect } from "react";
import { api } from "@/services/api";
import CashCountSheetModal from "@/components/modals/CashCountSheetModal"; // Adjust the import path as needed

interface Transaction {
  id: number;
  date: string;
  particulars: { name: string };
  voucher_no: string;
  debit_amount: string;
  credit_amount: string;
  balance_amount: string;
  debit_credit: string;
}

type Denomination = 500 | 200 | 100 | 50 | 10 | 5 | 1;

interface CashCountSheetItem {
  currency: Denomination;
  nos: number;
}

interface CashCountSheet {
  id: number;
  created_date: string;
  transaction_type: string;
  items: CashCountSheetItem[];
  amount: string;
}

interface GrandTotal {
  cashCount: Record<Denomination, number>;
  total: number;
}

const denominations: Denomination[] = [500, 200, 100, 50, 10, 5, 1];

const DayBookReport: React.FC = () => {
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [, setCashCountSheets] = useState<CashCountSheet[]>([]);
  const [filteredCashCountSheets, setFilteredCashCountSheets] = useState<CashCountSheet[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (fromDate > toDate) {
      setFromDate(toDate);
    }
  }, [toDate, fromDate]);

  const handleSearch = () => {
    if (fromDate && toDate) {
      setIsSearching(true);
      setError(null);

      // Fetch transactions
      api
        .get(`/transactions/ledger_report/?ledger=Cash Account&from_date=${fromDate}&to_date=${toDate}`)
        .then((response) => {
          setTransactions(response.data || []);
        })
        .catch((error) => {
          console.error("There was an error fetching the transactions!", error);
          setError("Could not load transactions. Please try again later.");
        });

      // Fetch all cash count sheets (without date filtering)
      api
        .get(`/cashsheet/`)
        .then((response) => {
          console.log("Cash Count Sheets Response:", response.data);
          setCashCountSheets(response.data.results || []);
          filterCashCountSheets(response.data.results || [], fromDate, toDate);
        })
        .catch((error) => {
          console.error("There was an error fetching the cash count sheets!", error);
          setError("Could not load cash count sheets. Please try again later.");
        })
        .finally(() => {
          setIsSearching(false);
        });
    }
  };

  const filterCashCountSheets = (sheets: CashCountSheet[], startDate: string, endDate: string) => {
    const filtered = sheets.filter(sheet => {
      const sheetDate = new Date(sheet.created_date);
      return sheetDate >= new Date(startDate) && sheetDate <= new Date(endDate);
    });
    setFilteredCashCountSheets(filtered);
  };

  const handleCreateModalClose = () => {
    setIsModalOpen(false);
  };

  const totalDebitAmount = transactions.reduce(
    (sum, transaction) => sum + parseFloat(transaction.debit_amount || "0"),
    0
  );
  const totalCreditAmount = transactions.reduce(
    (sum, transaction) => sum + parseFloat(transaction.credit_amount || "0"),
    0
  );

  const totalBalanceAmount =
    totalDebitAmount > totalCreditAmount
      ? totalDebitAmount - totalCreditAmount
      : totalCreditAmount - totalDebitAmount;

  const balanceType =
    totalDebitAmount > totalCreditAmount ? "Debit Amount" : "Credit Amount";

  let runningDebitTotal = 0;
  let runningCreditTotal = 0;

  // Calculate grand totals for denominations
  const grandTotal: GrandTotal = filteredCashCountSheets.reduce(
    (totals, sheet) => {
      denominations.forEach((denom) => {
        const count = sheet.items.find((item) => item.currency === denom)?.nos || 0;
        totals.cashCount[denom] = (totals.cashCount[denom] || 0) + count;
      });
      totals.total += parseFloat(sheet.amount || "0");
      return totals;
    },
    { cashCount: {} as Record<Denomination, number>, total: 0 }
  );

  return (
    <div className="p-6 bg-blue-200">
      <h1 className="text-2xl font-bold mb-2 sm:mb-0">DayBook Report</h1>

      <div className="bg-white p-6 shadow-md rounded-lg mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="block w-full py-2 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="block w-full py-2 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg shadow-sm transition duration-300 ease-in-out disabled:opacity-50"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 mb-6">{error}</p>}

      {transactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr>
                <th className="py-3 px-4 bg-gray-100 text-left text-sm font-medium text-gray-600">Date</th>
                <th className="py-3 px-4 bg-gray-100 text-left text-sm font-medium text-gray-600">Voucher No</th>
                <th className="py-3 px-4 bg-gray-100 text-left text-sm font-medium text-gray-600">Particulars</th>
                <th className="py-3 px-4 bg-gray-100 text-right text-sm font-medium text-gray-600">Debit Amount</th>
                <th className="py-3 px-4 bg-gray-100 text-right text-sm font-medium text-gray-600">Credit Amount</th>
                <th className="py-3 px-4 bg-gray-100 text-center text-sm font-medium text-gray-600">Dr/Cr</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => {
                runningDebitTotal += parseFloat(transaction.debit_amount || "0");
                runningCreditTotal += parseFloat(transaction.credit_amount || "0");

                return (
                  <tr key={transaction.id}>
                    <td className="py-2 px-4 border-b text-left text-sm text-gray-700">{transaction.date}</td>
                    <td className="py-2 px-4 border-b text-left text-sm text-gray-700">{transaction.voucher_no}</td>
                    <td className="py-2 px-4 border-b text-left text-sm text-gray-700">{transaction.particulars.name}</td>
                    <td className="py-2 px-4 border-b text-right text-sm text-gray-700">{transaction.debit_amount}</td>
                    <td className="py-2 px-4 border-b text-right text-sm text-gray-700">{transaction.credit_amount}</td>
                    <td className="py-2 px-4 border-b text-center text-sm text-gray-700">{transaction.debit_credit}</td>
                  </tr>
                );
              })}
              <tr>
                <td colSpan={3} className="py-2 px-4 text-left text-sm font-semibold text-black">Current Total</td>
                <td className="py-2 px-4 text-right text-sm font-semibold text-black">{runningDebitTotal.toFixed(2)}</td>
                <td className="py-2 px-4 text-right text-sm font-semibold text-black">{runningCreditTotal.toFixed(2)}</td>
                <td className="py-2 px-4 text-center text-sm font-semibold text-black"></td>
              </tr>
              <tr>
                <td colSpan={3} className="py-2 px-4 text-left text-sm font-semibold text-black">Closing Balance</td>
                <td colSpan={2} className="py-2 px-4 text-right text-sm font-semibold text-black">
                  {totalBalanceAmount.toFixed(2)} ({balanceType})
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600 mt-6">No transactions found for the selected date range.</p>
      )}

      {filteredCashCountSheets.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Cash Sheet</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead>
                <tr>
                  <th className="py-3 px-4 bg-gray-100 text-left text-sm font-medium text-gray-600">Date</th>
                  <th className="py-3 px-4 bg-gray-100 text-left text-sm font-medium text-gray-600">Transaction Type</th>
                  {denominations.map((denom) => (
                    <th key={denom} className="py-3 px-4 bg-gray-100 text-center text-sm font-medium text-gray-600">{denom}</th>
                  ))}
                  <th className="py-3 px-4 bg-gray-100 text-right text-sm font-medium text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredCashCountSheets.map((sheet) => (
                  <tr key={sheet.id}>
                    <td className="py-2 px-4 border-b text-left text-sm text-gray-700">{sheet.created_date}</td>
                    <td className="py-2 px-4 border-b text-left text-sm text-gray-700">{sheet.transaction_type}</td>
                    {denominations.map((denom) => (
                      <td key={denom} className="py-2 px-4 border-b text-center text-sm text-gray-700">
                        {sheet.items.find(item => item.currency === denom)?.nos || 0}
                      </td>
                    ))}
                    <td className="py-2 px-4 border-b text-right text-sm text-gray-700">{sheet.amount}</td>
                  </tr>
                ))}

                {/* Grand Total Row */}
                <tr>
                  <td colSpan={2} className="py-2 px-4 text-left text-sm font-semibold text-black">Grand Total</td>
                  {denominations.map((denom) => (
                    <td key={denom} className="py-2 px-4 text-center text-sm font-semibold text-black">
                      {grandTotal.cashCount[denom] || 0}
                    </td>
                  ))}
                  <td className="py-2 px-4 text-right text-sm font-semibold text-black">{grandTotal.total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cash Count Sheet Modal */}
      {isModalOpen && <CashCountSheetModal isOpen={isModalOpen} onClose={handleCreateModalClose} />}
    </div>
  );
};

export default DayBookReport;
