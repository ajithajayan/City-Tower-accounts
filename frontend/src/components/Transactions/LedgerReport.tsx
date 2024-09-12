import React, { useEffect, useState } from "react";
import { api } from "@/services/api"; // Assuming you have an API service

interface Transaction {
  id: number;
  ledger: { name: string };
  date: string;
  transaction_type: string;
  particulars: { name: string };
  voucher_no: string;
  debit_amount: string;
  credit_amount: string;
  remarks: string | null;
  balance_amount: string;
  debit_credit: string;
}

interface Ledger {
  id: number;
  name: string;
}

const LedgerReport: React.FC = () => {
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [selectedLedger, setSelectedLedger] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLedgers = async () => {
      let allLedgers: Ledger[] = [];
      let nextPageUrl = "/ledgers/";

      while (nextPageUrl) {
        try {
          const response = await api.get(nextPageUrl);
          allLedgers = [...allLedgers, ...response.data.results];
          nextPageUrl = response.data.next; // Get the URL for the next page, if any
        } catch (error) {
          console.error("Error fetching ledgers:", error);
          setError("Could not load ledgers. Please try again later.");
          return;
        }
      }

      setLedgers(allLedgers);
    };

    fetchLedgers();
  }, []);

  const handleSearch = () => {
    if (selectedLedger && fromDate && toDate) {
      setIsSearching(true);
      api
        .get(
          `/transactions/ledger_report/?ledger=${selectedLedger}&from_date=${fromDate}&to_date=${toDate}`
        )
        .then((response) => {
          setTransactions(response.data || []);
        })
        .catch((error) => {
          console.error("There was an error fetching the transactions!", error);
          setError("Could not load transactions. Please try again later.");
        })
        .finally(() => {
          setIsSearching(false);
        });
    }
  };

  // Calculate totals
  const totalDebitAmount = transactions.reduce(
    (sum, transaction) => sum + parseFloat(transaction.debit_amount || "0"),
    0
  );
  const totalCreditAmount = transactions.reduce(
    (sum, transaction) => sum + parseFloat(transaction.credit_amount || "0"),
    0
  );

  // New balance logic
  const totalBalanceAmount =
    totalDebitAmount > totalCreditAmount
      ? totalDebitAmount - totalCreditAmount
      : totalCreditAmount - totalDebitAmount;

  const balanceType =
    totalDebitAmount > totalCreditAmount ? "Debit Amount" : "Credit Amount";

  let runningDebitTotal = 0;
  let runningCreditTotal = 0;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6">Transactions</h1>

      {/* Form Inputs */}
      <div className="bg-white p-6 shadow-md rounded-lg mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Select Account */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Account
            </label>
            <select
              value={selectedLedger}
              onChange={(e) => setSelectedLedger(e.target.value)}
              className="block w-full py-2 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none"
            >
              <option value="">Select a ledger</option>
              {ledgers.map((ledger) => (
                <option key={ledger.id} value={ledger.id}>
                  {ledger.name}
                </option>
              ))}
            </select>
          </div>

          {/* From Date */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="block w-full py-2 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none"
            />
          </div>

          {/* To Date */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="block w-full py-2 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Search Button */}
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg shadow-sm transition duration-300 ease-in-out disabled:opacity-50"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* Error Handling */}
      {error && <p className="text-red-500 mb-6">{error}</p>}

      {/* Transaction Table */}
      {transactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr>
                <th className="py-3 px-4 bg-gray-100 text-left text-sm font-medium text-gray-600">
                  Date
                </th>
                <th className="py-3 px-4 bg-gray-100 text-left text-sm font-medium text-gray-600">
                  Voucher No
                </th>
                <th className="py-3 px-4 bg-gray-100 text-left text-sm font-medium text-gray-600">
                  Particulars
                </th>
                <th className="py-3 px-4 bg-gray-100 text-right text-sm font-medium text-gray-600">
                  Debit Amount
                </th>
                <th className="py-3 px-4 bg-gray-100 text-right text-sm font-medium text-gray-600">
                  Credit Amount
                </th>
                <th className="py-3 px-4 bg-gray-100 text-center text-sm font-medium text-gray-600">
                  Dr/Cr
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => {
                runningDebitTotal += parseFloat(transaction.debit_amount || "0");
                runningCreditTotal += parseFloat(transaction.credit_amount || "0");

                return (
                  <tr key={transaction.id}>
                    <td className="py-2 px-4 border-b text-left text-sm text-gray-700">
                      {transaction.date}
                    </td>
                    <td className="py-2 px-4 border-b text-left text-sm text-gray-700">
                      {transaction.voucher_no}
                    </td>
                    <td className="py-2 px-4 border-b text-left text-sm text-gray-700">
                      {transaction.particulars.name}
                    </td>
                    <td className="py-2 px-4 border-b text-right text-sm text-gray-700">
                      {transaction.debit_amount}
                    </td>
                    <td className="py-2 px-4 border-b text-right text-sm text-gray-700">
                      {transaction.credit_amount}
                    </td>
                    <td className="py-2 px-4 border-b text-center text-sm text-gray-700">
                      {transaction.debit_credit}
                    </td>
                  </tr>
                );
              })}

              {/* Total Debit and Credit */}
              <tr>
                <td colSpan={1} className="py-2 px-4 text-left text-sm font-semibold text-black">
                  Current Total
                </td>
                <td colSpan={2} className="py-2 px-4 text-left text-sm font-semibold text-black"></td>
                <td className="py-2 px-4 text-right text-sm font-semibold text-black">
                  {runningDebitTotal.toFixed(2)}
                </td>
                <td className="py-2 px-4 text-right text-sm font-semibold text-black">
                  {runningCreditTotal.toFixed(2)}
                </td>
                <td className="py-2 px-4 text-center text-sm font-semibold text-black"></td>
              </tr>

              {/* Closing Balance */}
              <tr>
                <td colSpan={1} className="py-2 px-4 text-left text-sm font-semibold text-black">
                  Closing Balance
                </td>
                <td colSpan={2} className="py-2 px-4 text-left text-sm font-semibold text-black"></td>
                <td className="py-2 px-4 text-right text-sm font-semibold text-black">
                  {balanceType === "Debit Amount" ? totalBalanceAmount.toFixed(2) : ""}
                </td>
                <td className="py-2 px-4 text-right text-sm font-semibold text-black">
                  {balanceType === "Credit Amount" ? totalBalanceAmount.toFixed(2) : ""}
                </td>
                <td className="py-2 px-4 text-center text-sm font-semibold text-black"></td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No transactions found.</p>
      )}
    </div>
  );
};

export default LedgerReport;
