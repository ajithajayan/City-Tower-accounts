import React, { useEffect, useState, useRef } from 'react';
import { api } from '@/services/api';
import ShareUserTransactionsModal from '@/components/modals/ShareUserTransactionsModal';
import ReactToPrint from 'react-to-print';

interface ShareUser {
    id: number;
    name: string;
    category: string;
}

interface ShareUserTransaction {
    share_user_data: ShareUser;
    profit_lose: string;
    percentage: string;
    amount: string;
    percentage_amount: string;
}

interface ProfitLossShareTransaction {
    transaction_no: string;
    created_date: string;
    period_from: string;
    period_to: string;
    total_percentage: string;
    total_amount: string;
    status: string;
    profit_amount: string;
    loss_amount: string;
    share_user_transactions: ShareUserTransaction[];
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(); // Adjust the format as needed
};

const ProfitLoseShareReport: React.FC = () => {
    const [transactions, setTransactions] = useState<ProfitLossShareTransaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTransaction, setSelectedTransaction] = useState<ShareUserTransaction[] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // Pagination states
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [previousPageUrl, setPreviousPageUrl] = useState<string | null>(null);
    const [currentPageUrl, setCurrentPageUrl] = useState<string>('/profit-loss-share-transactions/');

    // Reference for ReactToPrint
    const printRef = useRef<HTMLTableElement | null>(null);

    useEffect(() => {
        const fetchTransactions = async (url: string) => {
            try {
                setLoading(true);
                const response = await api.get(url);

                // Log the API response for debugging
                console.log('API Response:', response.data);

                // Extract transactions from the 'results' field and update pagination URLs
                if (Array.isArray(response.data.results)) {
                    setTransactions(response.data.results);
                    setNextPageUrl(response.data.next || null);
                    setPreviousPageUrl(response.data.previous || null);
                } else {
                    throw new Error('Unexpected response format');
                }
            } catch (err) {
                setError('Failed to fetch transactions.');
                console.error('Error fetching transactions:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions(currentPageUrl);
    }, [currentPageUrl]);

    const handleViewClick = (transaction: ProfitLossShareTransaction) => {
        setSelectedTransaction(transaction.share_user_transactions);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTransaction(null);
    };

    const handleNextPage = () => {
        if (nextPageUrl) {
            setCurrentPageUrl(nextPageUrl);
        }
    };

    const handlePreviousPage = () => {
        if (previousPageUrl) {
            setCurrentPageUrl(previousPageUrl);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-2 sm:mb-0">Profit Loss Share Transactions</h1>
            
            {transactions.length > 0 && (
                <div className="flex justify-end mb-4">
                    <ReactToPrint
                        trigger={() => <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Print</button>}
                        content={() => printRef.current}
                    />
                </div>
            )}
            
            <table className="min-w-full divide-y divide-gray-200 mt-4" ref={printRef}>
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period From</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period To</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Percentage</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loss Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print-hide">View</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                        <tr key={transaction.transaction_no}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.transaction_no}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(transaction.created_date)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.period_from}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.period_to}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parseFloat(transaction.total_percentage).toFixed(2)} %</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.status}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.profit_amount}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.loss_amount}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 cursor-pointer print-hide" onClick={() => handleViewClick(transaction)}>View</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-between mt-4">
                <button
                    onClick={handlePreviousPage}
                    disabled={!previousPageUrl}
                    className={`px-4 py-2 bg-gray-300 rounded ${!previousPageUrl ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-400'}`}
                >
                    Previous
                </button>
                <button
                    onClick={handleNextPage}
                    disabled={!nextPageUrl}
                    className={`px-4 py-2 bg-gray-300 rounded ${!nextPageUrl ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-400'}`}
                >
                    Next
                </button>
            </div>

            {isModalOpen && selectedTransaction && (
                <ShareUserTransactionsModal
                    transactions={selectedTransaction}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default ProfitLoseShareReport;
