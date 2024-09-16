import React, { useState, useEffect } from 'react';
import { api } from '@/services/api'; // Import your API service

interface EditShareUserTransactionModalProps {
  selectedUserId: number;
  transactionId: number;
  isOpen: boolean;
  onClose: () => void;
  refreshTransactions: () => void;
}

const EditShareUserTransactionModal: React.FC<EditShareUserTransactionModalProps> = ({
  selectedUserId,
  transactionId,
  isOpen,
  onClose,
  refreshTransactions
}) => {
  const [percentage, setPercentage] = useState<string>('');
  const [profitLose, setProfitLose] = useState<string>('profit');
  const [amount, setAmount] = useState<string>('');
  const [percentageAmount, setPercentageAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  // Fetch the transaction details when the modal opens
  useEffect(() => {
    if (isOpen && transactionId) {
      const fetchTransactionDetails = async () => {
        try {
          setInitialLoading(true);
          const response = await api.get(`/share-user-transactions/${transactionId}/`);
          const data = response.data;

          // Populate the form with the fetched data
          setPercentage(data.percentage);
          setProfitLose(data.profit_lose);
          setAmount(data.amount);
          setPercentageAmount(data.percentage_amount);
        } catch (error) {
          console.error('Error fetching transaction details:', error);
        } finally {
          setInitialLoading(false);
        }
      };

      fetchTransactionDetails();
    }
  }, [isOpen, transactionId]);

  // Handle form submission to update the transaction
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        percentage,
        profit_lose: profitLose,
        amount,
        percentage_amount: percentageAmount,
        share_user:selectedUserId,
        transaction: Number(transactionId) 


      };
      await api.patch(`/share-user-transactions/${transactionId}/`, payload);
      refreshTransactions(); // Refresh the transactions after successful update
      onClose(); // Close the modal
    } catch (error) {
      console.error('Error updating transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null; // Don't render if the modal is closed

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-1/3">
        <h2 className="text-2xl font-semibold mb-4">Edit Transaction</h2>

        {/* Show loading spinner while fetching the transaction details */}
        {initialLoading ? (
          <p>Loading transaction details...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Percentage Field */}
            <div className="mb-4">
              <label className="block mb-2">Percentage</label>
              <input
                type="text"
                className="border p-2 w-full"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                required
              />
            </div>

            {/* Profit/Loss Field */}
            <div className="mb-4">
              <label className="block mb-2">Profit/Loss</label>
              <select
                className="border p-2 w-full"
                value={profitLose}
                onChange={(e) => setProfitLose(e.target.value)}
                required
              >
                <option value="profit">Profit</option>
                <option value="lose">Lose</option>
              </select>
            </div>

            {/* Amount Field */}
            <div className="mb-4">
              <label className="block mb-2">Amount</label>
              <input
                type="text"
                className="border p-2 w-full"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            {/* Percentage Amount Field */}
            <div className="mb-4">
              <label className="block mb-2">Percentage Amount</label>
              <input
                type="text"
                className="border p-2 w-full"
                value={percentageAmount}
                onChange={(e) => setPercentageAmount(e.target.value)}
                required
              />
              <p>userId:{selectedUserId}  transactionId{transactionId}</p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update'}
              </button>
              <button
                type="button"
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditShareUserTransactionModal;
