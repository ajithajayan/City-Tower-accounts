import React, { useRef, useState, useEffect } from "react";
import ReactToPrint from "react-to-print";
import { api } from "@/services/api";

interface Transaction {
  created_date: string;
  transaction_type: string;
  amount: string;
  items: Array<{
    currency: number;
    nos: number;
  }>;
}

type Denomination = 500 | 200 | 100 | 50 | 10 | 5 | 1;

interface GrandTotal {
  cashCount: Record<Denomination, number>;
  total: number;
}

const CashCountSheet: React.FC = () => {
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState<string>("2024-09-01");
  const [toDate, setToDate] = useState<string>(today);
  const [filteredData, setFilteredData] = useState<Transaction[]>([]);
  const [isSearched, setIsSearched] = useState(false);

  const componentRef = useRef<HTMLDivElement>(null);

  // Fetch data from API
  const fetchData = async () => {
    try {
      const response = await api.get("/cashsheet/");
      const data = response.data.results;
      if (Array.isArray(data)) {
        setFilteredData(data);
      } else {
        console.error("Unexpected data format:", data);
        setFilteredData([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = () => {
    setIsSearched(true);
    // Filter data by date range
    const filteredTransactions = filteredData.filter((transaction) => {
      const transactionDate = new Date(transaction.created_date);
      const startDate = new Date(fromDate);
      const endDate = new Date(toDate);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    // Group transactions by date
    const groupedTransactions = filteredTransactions.reduce((acc: Record<string, Transaction[]>, transaction) => {
      const date = transaction.created_date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    }, {});

    // Flatten and sort grouped transactions
    const sortedGroupedTransactions = Object.entries(groupedTransactions).flatMap(([, transactions]) =>
      transactions.sort((a, b) =>
        a.transaction_type.localeCompare(b.transaction_type)
      )
    );

    setFilteredData(sortedGroupedTransactions);
  };

  // Grand total calculation with transaction type (payin/payout)
  const grandTotal: GrandTotal = filteredData.reduce(
    (acc, item) => {
      const multiplier = item.transaction_type === "payin" ? 1 : -1;
      item.items.forEach(({ currency, nos }) => {
        if (currency in acc.cashCount) {
          acc.cashCount[currency as Denomination] += nos * multiplier;
        }
      });
      acc.total += parseFloat(item.amount) * multiplier;
      return acc;
    },
    {
      cashCount: { 500: 0, 200: 0, 100: 0, 50: 0, 10: 0, 5: 0, 1: 0 },
      total: 0,
    }
  );

  const denominations: Denomination[] = [500, 200, 100, 50, 10, 5, 1];

  return (
    <div className="p-6 bg-blue-200">
      <h1 className="text-2xl font-bold mb-4">Cash Count Sheet</h1>

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
            className="bg-blue-600 text-white py-2 px-6 rounded-lg shadow hover:bg-blue-700"
          >
            Search
          </button>
        </div>
      </div>

      <ReactToPrint
        trigger={() => <button className="bg-green-600 text-white py-2 px-6 rounded-lg shadow hover:bg-green-700">Print Table</button>}
        content={() => componentRef.current}
      />

      {isSearched && filteredData.length > 0 ? (
        <div className="overflow-x-auto" ref={componentRef}>
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
              {filteredData.map((transaction, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border-b text-left text-sm text-gray-700">{transaction.created_date}</td>
                  <td className="py-2 px-4 border-b text-left text-sm text-gray-700">{transaction.transaction_type}</td>
                  {denominations.map((denom) => (
                    <td key={denom} className="py-2 px-4 border-b text-center text-sm text-gray-700">
                      {transaction.items.find(item => item.currency === denom)?.nos || 0}
                    </td>
                  ))}
                  <td className="py-2 px-4 border-b text-right text-sm text-gray-700">{transaction.amount}</td>
                </tr>
              ))}

              {/* Grand Total Row */}
              <tr>
                <td colSpan={2} className="py-2 px-4 text-left text-sm font-semibold text-black">Grand Total</td>
                {denominations.map((denom) => (
                  <td key={denom} className="py-2 px-4 text-center text-sm font-semibold text-black">
                    {grandTotal.cashCount[denom]}
                  </td>
                ))}
                <td className="py-2 px-4 text-right text-sm font-semibold text-black">{grandTotal.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : isSearched ? (
        <p>No transactions found for the selected date range.</p>
      ) : (
        <p>Please select a date range and click 'Search' to view the transactions.</p>
      )}
    </div>
  );
};

export default CashCountSheet;
