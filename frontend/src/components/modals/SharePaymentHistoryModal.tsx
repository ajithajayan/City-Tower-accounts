// components/modals/SharePaymentHistoryModal.tsx
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api'; // Import your API service

interface PaymentHistory {
  id: number;
  paid_date: string;
  paid_amount: string;
}

interface SharePaymentHistoryModalProps {
  transactionId: number;
  isOpen: boolean;
  onClose: () => void;
}

const SharePaymentHistoryModal: React.FC<SharePaymentHistoryModalProps> = ({
  transactionId,
  isOpen,
  onClose,
}) => {
  const [paymentHistories, setPaymentHistories] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalPaidAmount, setTotalPaidAmount] = useState<number>(0);

  useEffect(() => {
    if (transactionId && isOpen) {
      const fetchPaymentHistories = async () => {
        setLoading(true);
        try {
          const response = await api.get(`/share-payment-history/by-transaction/${transactionId}/`);
          const histories = response.data;
          setPaymentHistories(histories);

          // Calculate total paid amount
          const total = histories.reduce((sum: number, history: PaymentHistory) => sum + parseFloat(history.paid_amount), 0);
          setTotalPaidAmount(total);
        } catch (error) {
          console.error("Error fetching payment histories:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchPaymentHistories();
    }
  }, [transactionId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-1/2 max-w-4xl">
        <h2 className="text-2xl font-semibold mb-4">Payment History</h2>
        {loading ? (
          <p>Loading...</p>
        ) : paymentHistories.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-4 py-2 text-center">Paid Date</th>
                    <th className="border px-4 py-2 text-center">Paid Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paymentHistories.map((history) => (
                    <tr key={history.id}>
                      <td className="border px-4 py-2">{new Date(history.paid_date).toLocaleDateString()}</td>
                      <td className="border px-4 py-2 text-right">{history.paid_amount}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th className="px-4 py-2 text-left">Total</th>
                    <td className="px-4 py-2 text-right">{totalPaidAmount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        ) : (
          <p>No payment history available.</p>
        )}
        <div className="flex justify-end mt-4">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharePaymentHistoryModal;
