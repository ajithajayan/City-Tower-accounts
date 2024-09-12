import { api } from "@/services/api";
import React, { useState } from "react";

interface LedgerGroup {
    name: string;
}

interface Ledger {
    name: string;
    group: LedgerGroup;
}

interface Transaction {
    ledger: Ledger;
    debit_amount?: string;
    credit_amount?: string;
}

interface ProfitAndLossResponse {
    total_expense: number;
    total_income: number;
    net_profit: number;
    net_loss: number;
}

const BalanceSheet: React.FC = () => {
    const [liabilitiesData, setLiabilitiesData] = useState<Transaction[]>([]);
    const [assetData, setAssetData] = useState<Transaction[]>([]);
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");
    const [isSearching, setIsSearching] = useState(false);
    const [profitAndLossData, setProfitAndLossData] = useState<ProfitAndLossResponse | null>(null);

    const handleSearch = async () => {
        if (!fromDate || !toDate) {
            alert("Please select both from and to dates");
            return;
        }

        setIsSearching(true);

        try {
            // Fetch liabilities (Liability) data
            const expenseResponse = await api.get('/transactions/filter-by-nature-group/', {
                params: { nature_group_name: 'Liability', from_date: fromDate, to_date: toDate },
            });

            // Fetch assets (Asset) data
            const incomeResponse = await api.get('/transactions/filter-by-nature-group/', {
                params: { nature_group_name: 'Asset', from_date: fromDate, to_date: toDate },
            });

            // New API call for profit and loss data
            const profitAndLossResponse = await api.get('/transactions/profit-and-loss/', {
                params: { from_date: fromDate, to_date: toDate },
            });

            // Store profit and loss data
            setProfitAndLossData(profitAndLossResponse.data);

            // Log the profit and loss response data
            console.log('Profit and Loss Data:', profitAndLossResponse.data);

            if (Array.isArray(expenseResponse.data)) {
                setLiabilitiesData(expenseResponse.data);
            } else {
                console.error('Unexpected data format for liabilities:', expenseResponse.data);
            }

            if (Array.isArray(incomeResponse.data)) {
                setAssetData(incomeResponse.data);
            } else {
                console.error('Unexpected data format for assets:', incomeResponse.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const parseAmount = (amount?: string) => Number(amount) || 0;

    const groupBy = (data: Transaction[], key: keyof LedgerGroup) => {
        return data.reduce((groups, item) => {
            const groupName = item.ledger.group[key];
            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(item);
            return groups;
        }, {} as Record<string, Transaction[]>);
    };

    const aggregateLedgerTotals = (transactions: Transaction[]) => {
        return transactions.reduce((acc, transaction) => {
            const ledgerName = transaction.ledger.name;

            if (!acc[ledgerName]) {
                acc[ledgerName] = { debit: 0, credit: 0, balance: 0 };
            }

            acc[ledgerName].debit += parseAmount(transaction.debit_amount);
            acc[ledgerName].credit += parseAmount(transaction.credit_amount);

            acc[ledgerName].balance = Math.abs(acc[ledgerName].debit - acc[ledgerName].credit);

            return acc;
        }, {} as Record<string, { debit: number; credit: number; balance: number }>);
    };

    const liabilitiesGroups = groupBy(liabilitiesData, 'name');
    const assetGroups = groupBy(assetData, 'name');

    // Calculate the grand total for liabilities and assets
    const liabilitiesGrandTotal = (profitAndLossData?.net_profit || 0) + Object.values(liabilitiesGroups).reduce((acc, transactions) => {
        return acc + Object.values(aggregateLedgerTotals(transactions))
            .reduce((groupAcc, { balance }) => groupAcc + balance, 0);
    }, 0);

    const assetsGrandTotal = (profitAndLossData?.net_loss || 0) + Object.values(assetGroups).reduce((acc, transactions) => {
        return acc + Object.values(aggregateLedgerTotals(transactions))
            .reduce((groupAcc, { balance }) => groupAcc + balance, 0);
    }, 0);

    return (
        <div className="p-4">
            {/* Search Form */}
            <div className="bg-white p-6 shadow-md rounded-lg mb-6">
                <div className="flex flex-col md:flex-row items-end gap-4">
                    {/* From Date */}
                    <div className="flex-1">
                        <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700">From Date</label>
                        <input
                            type="date"
                            id="fromDate"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    {/* To Date */}
                    <div className="flex-1">
                        <label htmlFor="toDate" className="block text-sm font-medium text-gray-700">To Date</label>
                        <input
                            type="date"
                            id="toDate"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    {/* Search Button */}
                    <div className="mt-1">
                        <button
                            type="button"
                            onClick={handleSearch}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {isSearching ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Display Results after Search */}
            {liabilitiesData.length > 0 || assetData.length > 0 ? (
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Liabilities Section */}
                    <div className="flex-1 bg-white shadow-md rounded-md flex flex-col">
                        <h2 className="text-2xl font-bold mb-4 text-center">Liabilities</h2>
                        <div className="flex-1 overflow-auto">
                            {Object.entries(liabilitiesGroups).map(([groupName, transactions]) => (
                                <div key={groupName} className="mb-6">
                                    <table className="min-w-full table-auto border-collapse">
                                        <thead>
                                            <tr>
                                                <th className=" px-4 py-2 text-left">{groupName}</th>
                                                <th className=" px-4 py-2 text-right">
                                                    QAR {Object.values(aggregateLedgerTotals(transactions))
                                                        .reduce((acc, { balance }) => acc + balance, 0)
                                                        .toFixed(2)}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(aggregateLedgerTotals(transactions)).map(([ledgerName, totals]) => (
                                                <tr key={ledgerName}>
                                                    <td className=" px-4 py-2">{ledgerName}</td>
                                                    <td className=" px-4 py-2 text-right">
                                                        {totals.balance.toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                            <div className="mb-6">
                                <table className="min-w-full table-auto border-collapse">
                                    <thead>
                                        <tr>
                                            <th className=" px-4 py-2 text-left">Profit</th>
                                            <th className=" px-4 py-2 text-right">
                                                {profitAndLossData ? (
                                                    <>
                                                        {profitAndLossData.net_profit > 0 ? `QAR ${profitAndLossData.net_profit.toFixed(2)}` : '0.00'}
                                                    </>
                                                ) : 'Loading...'}
                                            </th>
                                        </tr>
                                    </thead>
                                </table>
                            </div>
                        </div>
                        <div className="bg-green-300 px-4 py-2 font-bold flex justify-between">
                            <span>Total</span>
                            <span>QAR {liabilitiesGrandTotal.toFixed(2)}</span>
                        </div>

                    </div>

                    {/* Assets Section */}
                    <div className="flex-1 bg-white shadow-md rounded-md flex flex-col">
                        <h2 className="text-2xl font-bold mb-4 text-center">Assets</h2>
                        <div className="flex-1 overflow-auto">
                            {Object.entries(assetGroups).map(([groupName, transactions]) => (
                                <div key={groupName} className="mb-6">
                                    <table className="min-w-full table-auto border-collapse">
                                        <thead>
                                            <tr>
                                                <th className=" px-4 py-2 text-left">{groupName}</th>
                                                <th className=" px-4 py-2 text-right">
                                                    QAR {Object.values(aggregateLedgerTotals(transactions))
                                                        .reduce((acc, { balance }) => acc + balance, 0)
                                                        .toFixed(2)}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(aggregateLedgerTotals(transactions)).map(([ledgerName, totals]) => (
                                                <tr key={ledgerName}>
                                                    <td className=" px-4 py-2">{ledgerName}</td>
                                                    <td className=" px-4 py-2 text-right">
                                                        {totals.balance.toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                            <div className="mb-6">
                                <table className="min-w-full table-auto border-collapse">
                                    <thead>
                                        <tr>
                                            <th className=" px-4 py-2 text-left">Loss</th>
                                            <th className=" px-4 py-2 text-right">
                                                {profitAndLossData ? (
                                                    <>
                                                        {profitAndLossData.net_loss > 0 ? `QAR ${profitAndLossData.net_loss.toFixed(2)}` : '0.00'}
                                                    </>
                                                ) : 'Loading...'}
                                            </th>
                                        </tr>
                                    </thead>
                                </table>
                            </div>
                        </div>
                        <div className="bg-green-300 px-4 py-2 font-bold flex justify-between">
                            <span>Total</span>
                            <span>QAR {assetsGrandTotal.toFixed(2)}</span>
                        </div>

                    </div>
                </div>
            ) : (
                <div className="text-center text-gray-500">No data available</div>
            )}
        </div>
    );
};

export default BalanceSheet;
