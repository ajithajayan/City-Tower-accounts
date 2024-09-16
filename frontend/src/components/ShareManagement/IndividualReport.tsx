import React, { useState, useEffect, useRef } from "react";
import ReactToPrint from "react-to-print";
import { api } from "@/services/api";
import EditTransactionModal from '@/components/modals/EditShareUserTransactionModal';
import PaymentModal from "../modals/SharePaymentModal";
import SharePaymentHistoryModal from '@/components/modals/SharePaymentHistoryModal';

interface ShareUser {
  id: number;
  name: string;
}

interface Transaction {
  id: number;
  transaction: {
    id: number;
    transaction_no: string;
    created_date: string;
    period_from: string;
    period_to: string;
    status: string;
    total_percentage: string;
    total_amount: string;
  };
  profit_lose: string;
  percentage: string;
  amount: string;
  percentage_amount: string;
  paid_amount: string;
  balance_amount: string;
}

const IndividualReport: React.FC = () => {
  const [shareUsers, setShareUsers] = useState<ShareUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<number>(0);
  const [selectedBalanceAmount, setSelectedBalanceAmount] = useState<string>('');
  const [selectedTransactionId, setSelectedTransactionId] = useState<number>(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchShareUsers = async () => {
      try {
        const response = await api.get('/share-user-management/');
        setShareUsers(response.data.results);
      } catch (error) {
        console.error("Error fetching share users:", error);
      }
    };
    fetchShareUsers();
  }, []);

  const fetchTransactions = async (userId: number) => {
    setLoading(true);
    try {
      const response = await api.get(`/share-user-management/${userId}/transactions/`);
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = parseInt(event.target.value);
    setSelectedUserId(userId);
    setSelectedUser(userId);
    fetchTransactions(userId);
  };

  const handleEditTransaction = (transactionId: number, userId: number) => {
    setSelectedTransactionId(transactionId);
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  const handlePayment = (transactionId: number,balanceAmount: string) => {
    setSelectedBalanceAmount(balanceAmount);
    setSelectedTransactionId(transactionId);
    setIsPaymentModalOpen(true);
  };

  const handleViewPaymentHistory = (transactionId: number) => {
    setSelectedTransactionId(transactionId);
    setIsHistoryModalOpen(true);
  };

  const totalPercentageAmount = transactions.reduce((sum, transaction) => sum + parseFloat(transaction.percentage_amount || '0'), 0);
  const totalBalanceAmount = transactions.reduce((sum, transaction) => sum + parseFloat(transaction.balance_amount || '0'), 0);
  const totalPaidAmount = transactions.reduce((sum, transaction) => {
    const paidAmount = transaction.balance_amount === "0"
      ? 0
      : parseFloat(transaction.percentage_amount) - parseFloat(transaction.balance_amount);
    return sum + paidAmount;
  }, 0);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6">Individual Report</h1>

      <div className="mb-6">
        <label className="block mb-2">Select Share User:</label>
        <select
          className="border p-2 w-full"
          value={selectedUser || ""}
          onChange={handleUserChange}
        >
          <option value="">Select User</option>
          {shareUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading transactions...</p>}

      {!loading && transactions.length > 0 && (
        <div className="mb-6 flex justify-end">
          <ReactToPrint
            trigger={() => <button className="bg-blue-500 text-white px-4 py-2 rounded">Print Report</button>}
            content={() => componentRef.current}
          />
        </div>
      )}

      {!loading && transactions.length > 0 && (
        <div ref={componentRef}>
          <table className="table-auto w-full border-collapse border">
            <thead>
              <tr>
                <th className="border px-4 py-2">Transaction No</th>
                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2">Period From</th>
                <th className="border px-4 py-2">Period To</th>
                <th className="border px-4 py-2">Profit/Loss</th>
                <th className="border px-4 py-2">Percentage</th>
                <th className="border px-4 py-2">Percentage Amount</th>
                <th className="border px-4 py-2">Balance Amount</th>
                <th className="border px-4 py-2">Paid Amount</th>
                <th className="border px-4 py-2 print-hide">Pay</th> {/* Hide in print */}
                <th className="border px-4 py-2 print-hide">Payment History</th> {/* Hide in print */}
                <th className="border px-4 py-2 print-hide">Actions</th> {/* Hide in print */}
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => {
                const paidAmount = transaction.balance_amount === "0"
                  ? 0
                  : parseFloat(transaction.percentage_amount) - parseFloat(transaction.balance_amount);

                return (
                  <tr key={transaction.transaction.id}>
                    <td className="border px-4 py-2">{transaction.transaction.transaction_no}</td>
                    <td className="border px-4 py-2">{new Date(transaction.transaction.created_date).toLocaleDateString()}</td>
                    <td className="border px-4 py-2">{transaction.transaction.period_from}</td>
                    <td className="border px-4 py-2">{transaction.transaction.period_to}</td>
                    <td className="border px-4 py-2">{transaction.profit_lose}</td>
                    <td className="border px-4 py-2">{transaction.percentage}%</td>
                    <td className="border px-4 py-2">{transaction.percentage_amount}</td>
                    <td className="border px-4 py-2">{transaction.balance_amount}</td>
                    <td className="border px-4 py-2">{paidAmount.toFixed(2)}</td>

                    <td className="border px-4 py-2 print-hide">
                      <button
                        className="bg-green-500 text-white px-2 py-1 rounded"
                        onClick={() => handlePayment(transaction.id, transaction.balance_amount)}
                      >
                        Pay
                      </button>
                    </td>

                    <td className="border px-4 py-2 print-hide">
                      <button
                        className="bg-yellow-500 text-white px-2 py-1 rounded"
                        onClick={() => handleViewPaymentHistory(transaction.id)}
                      >
                        View
                      </button>
                    </td>

                    <td className="border px-4 py-2 print-hide">
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                        onClick={() => handleEditTransaction(transaction.id, selectedUserId)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}

              <tr>
                <th className="border px-4 py-2 font-semibold">Total</th>
                <td className="border px-4 py-2"></td>
                <td className="border px-4 py-2"></td>
                <td className="border px-4 py-2"></td>
                <td className="border px-4 py-2"></td>
                <td className="border px-4 py-2"></td>
                <td className="border px-4 py-2 font-semibold">{totalPercentageAmount.toFixed(2)}</td>
                <td className="border px-4 py-2 font-semibold">{totalBalanceAmount.toFixed(2)}</td>
                <td className="border px-4 py-2 font-semibold">{totalPaidAmount.toFixed(2)}</td>
                <td className="border px-4 py-2 print-hide"></td>
                <td className="border px-4 py-2 print-hide"></td>
                <td className="border px-4 py-2 print-hide"></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <EditTransactionModal
          selectedUserId={selectedUserId}
          transactionId={selectedTransactionId}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          refreshTransactions={() => fetchTransactions(selectedUserId)}
        />
      )}

      {isPaymentModalOpen && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          transactionId={selectedTransactionId}
          balanceAmount={selectedBalanceAmount}
          refreshTransactions={() => fetchTransactions(selectedUserId)}
        />
      )}

      {isHistoryModalOpen && (
        <SharePaymentHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          transactionId={selectedTransactionId}
        />
      )}
    </div>
  );
};

export default IndividualReport;
