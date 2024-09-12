// ProfitLoseShareReport.tsx
import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import ShareUserTransactionsModal from '@/components/modals/ShareUserTransactionsModal';

interface ShareUser {
    id: number;
    name: string;
    category: string;
}

interface ShareUserTransaction {
    share_user_data: ShareUser; // Ensure the name is consistent
    profit_lose: string;
    percentage: number;
    amount: string;
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

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await api.get('/profit-loss-share-transactions/');
                
                // Log the API response for debugging
                console.log('API Response:', response.data);

                // Extract transactions from the 'results' field
                if (Array.isArray(response.data.results)) {
                    setTransactions(response.data.results);
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

        fetchTransactions();
    }, []);

    const handleViewClick = (transaction: ProfitLossShareTransaction) => {
        setSelectedTransaction(transaction.share_user_transactions);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTransaction(null);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-2 sm:mb-0">Profit Loss Share Transactions</h1>
            <table className="min-w-full divide-y divide-gray-200 mt-4">
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">View</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                        <tr key={transaction.transaction_no}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.transaction_no}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(transaction.created_date)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.period_from}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.period_to}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.total_percentage}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.status}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.profit_amount}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.loss_amount}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 cursor-pointer" onClick={() => handleViewClick(transaction)}>View</td>
                        </tr>
                    ))}
                </tbody>
            </table>
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
