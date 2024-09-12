import { api } from "@/services/api";
import React, { useState } from "react";

interface Ledger {
    name: string;
}

interface Transaction {
    ledger: Ledger;
    debit_amount?: string;
    credit_amount?: string;
}

const IncomeStatement: React.FC = () => {
    const [expenseData, setExpenseData] = useState<Transaction[]>([]);
    const [incomeData, setIncomeData] = useState<Transaction[]>([]);
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async () => {
        if (!fromDate || !toDate) {
            alert("Please select both from and to dates");
            return;
        }

        setIsSearching(true);

        try {
            const expenseResponse = await api.get('/transactions/filter-by-nature-group/', {
                params: { nature_group_name: 'Expense', from_date: fromDate, to_date: toDate },
            });

            const incomeResponse = await api.get('/transactions/filter-by-nature-group/', {
                params: { nature_group_name: 'Income', from_date: fromDate, to_date: toDate },
            });

            if (Array.isArray(expenseResponse.data)) {
                setExpenseData(expenseResponse.data);
            } else {
                console.error('Unexpected data format for expenses:', expenseResponse.data);
            }

            if (Array.isArray(incomeResponse.data)) {
                setIncomeData(incomeResponse.data);
            } else {
                console.error('Unexpected data format for income:', incomeResponse.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const parseAmount = (amount?: string) => Number(amount) || 0;

    const calculateTotal = (data: Transaction[], key: 'debit_amount' | 'credit_amount') => {
        return data.reduce((total, item) => total + parseAmount(item[key]), 0);
    };

    const totalExpenses = calculateTotal(expenseData, 'debit_amount');
    const totalIncome = calculateTotal(incomeData, 'credit_amount');
    const netProfit = totalIncome - totalExpenses;
    const netLoss = totalExpenses > totalIncome ? totalExpenses - totalIncome : 0;
    const grandTotalExpenses = totalExpenses + (netProfit > 0 ? netProfit : 0);
    const grandTotalIncome = totalIncome + (netLoss > 0 ? netLoss : 0);

    return (
        <div className="p-4">
            {/* Search Form */}
            <div className="bg-white p-6 shadow-md rounded-lg mb-6">
                <div className="flex items-center space-x-4">
                    {/* From Date */}
                    <div className="flex-1">
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
                    <div className="flex-1">
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

                    {/* Search Button */}
                    <div className="flex-shrink-0">
                        <button
                            onClick={handleSearch}
                            disabled={isSearching}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-300 ease-in-out disabled:opacity-50"
                        >
                            {isSearching ? "Searching..." : "Search"}
                        </button>
                    </div>
                </div>
            </div>


            {/* Display Results after Search */}
            {expenseData.length > 0 || incomeData.length > 0 ? (
                <div className="grid grid-cols-12 gap-4">
                    {/* Expense Section */}
                    <div className="col-span-12 md:col-span-6 bg-white shadow-md rounded-md p-4 flex flex-col h-full">
                        <h2 className="text-2xl font-bold mb-4 text-center">Expense</h2>
                        <div className="flex-grow overflow-auto">
                            <table className="min-w-full table-auto border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-2 text-left">Particulars</th>
                                        <th className="px-4 py-2 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenseData.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2">{item.ledger.name}</td>
                                            <td className="px-4 py-2 text-right">
                                                {parseAmount(item.debit_amount).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Sticky Totals Section */}
                        <div className="mt-4 border-t border-gray-300 pt-2">
                            <div className="font-bold flex justify-between">
                                <span>Total</span>
                                <span>{totalExpenses.toFixed(2)}</span>
                            </div>
                            <div className="font-bold flex justify-between text-green-600">
                                <span>Net Profit</span>
                                <span>{netProfit > 0 ? netProfit.toFixed(2) : "0.00"}</span>
                            </div>
                            <div className="font-bold flex justify-between text-blue-600">
                                <span>Grand Total</span>
                                <span>{grandTotalExpenses.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Income Section */}
                    <div className="col-span-12 md:col-span-6 bg-white shadow-md rounded-md p-4 flex flex-col h-full">
                        <h2 className="text-2xl font-bold mb-4 text-center">Income</h2>
                        <div className="flex-grow overflow-auto">
                            <table className="min-w-full table-auto border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-2 text-left">Particulars</th>
                                        <th className="px-4 py-2 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {incomeData.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2">{item.ledger.name}</td>
                                            <td className="px-4 py-2 text-right">
                                                {parseAmount(item.credit_amount).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Sticky Totals Section */}
                        <div className="mt-4 border-t border-gray-300 pt-2">
                            <div className="font-bold flex justify-between">
                                <span>Total</span>
                                <span>{totalIncome.toFixed(2)}</span>
                            </div>
                            <div className="font-bold flex justify-between text-red-600">
                                <span>Net Loss</span>
                                <span>{netLoss > 0 ? netLoss.toFixed(2) : "0.00"}</span>
                            </div>
                            <div className="font-bold flex justify-between text-blue-600">
                                <span>Grand Total</span>
                                <span>{grandTotalIncome.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

            ) : (
                <p className="text-center text-gray-500">No data available. Please search to view results.</p>
            )}
        </div>
    );
};

export default IncomeStatement;
