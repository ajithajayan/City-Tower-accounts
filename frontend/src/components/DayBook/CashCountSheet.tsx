import React, { useState, useEffect } from "react";
import { api } from "@/services/api"; // Assuming you have an API service file

interface CashCountSheetData {
    id: number;
    created_date: string;
    currency: number;
    nos: number;
    amount: string;
}

const CashCountSheet: React.FC = () => {
    const [data, setData] = useState<CashCountSheetData[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");
    const [searchPerformed, setSearchPerformed] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                let url = `/cashcount-sheet/?page=${currentPage}`;
                if (searchPerformed && fromDate && toDate) {
                    url += `&from_date=${fromDate}&to_date=${toDate}`;
                }
                const response = await api.get(url);
                setData(response.data.results);
                setTotalPages(Math.ceil(response.data.count / 10));
            } catch (err) {
                setError("Failed to fetch data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [currentPage, fromDate, toDate, searchPerformed]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearch = () => {
        setSearchPerformed(true);
        setCurrentPage(1); // Reset to first page on new search
    };

    // Calculate the grand total of all amounts
    const calculateGrandTotal = () => {
        return data.reduce((total, item) => total + parseFloat(item.amount), 0).toFixed(2);
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-2">Cash Count Sheet</h1>

            {/* Search Section */}
            <div className="mb-6 p-4 border border-gray-300 rounded bg-gray-50">
                <h2 className="text-xl font-semibold mb-2">Filter Options</h2>
                <div className="flex flex-wrap items-center">
                    <div className="mb-4 sm:mb-0 sm:mr-4 flex-1">
                        <label className="block mb-1">From Date:</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded w-full"
                        />
                    </div>
                    <div className="mb-4 sm:mb-0 sm:mr-4 flex-1">
                        <label className="block mb-1">To Date:</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded w-full"
                        />
                    </div>
                    <div className="flex-shrink-0">
                        <button
                            onClick={handleSearch}
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            {searchPerformed && (
                <>
                    {isLoading && <p>Loading...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {data.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 table-fixed">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 bg-gray-50 text-left">ID</th>
                                        <th className="px-6 py-3 bg-gray-50 text-left">Date</th>
                                        <th className="px-6 py-3 bg-gray-50 text-left">Currency</th>
                                        <th className="px-6 py-3 bg-gray-50 text-left">Nos</th>
                                        <th className="px-6 py-3 bg-gray-50 text-left">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {data.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 text-left">{item.id}</td>
                                            <td className="px-6 py-4 text-left">{item.created_date}</td>
                                            <td className="px-6 py-4 text-left">{item.currency}</td>
                                            <td className="px-6 py-4 text-left">{item.nos}</td>
                                            <td className="px-6 py-4 text-left">{item.amount}</td>
                                        </tr>
                                    ))}
                                    {/* Grand Total Row */}
                                    <tr>
                                        <td className="px-6 py-4 font-semibold text-left" colSpan={4}>
                                            Grand Total
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-left">
                                            {calculateGrandTotal()}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p>No data available for the selected date range.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default CashCountSheet;
