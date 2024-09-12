import React from "react";

interface CreditTransaction {
  id: number;
  received_amount: number | string;
  cash_amount: number | string;
  bank_amount: number | string;
  payment_method: string;
  status: string;
  date: string;
}

interface CreditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: CreditTransaction[];
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatCurrency = (value: number | string): string => {
  const numericValue = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(numericValue)) {
    return "0.00"; // Fallback in case the value is not a valid number
  }
  return numericValue.toFixed(2);
};

const CreditTransactionModal: React.FC<CreditTransactionModalProps> = ({ isOpen, onClose, transactions }) => {
  if (!isOpen) return null;

  // Calculate totals
  const totalReceivedAmount = transactions.reduce((sum, transaction) => sum + parseFloat(transaction.received_amount as string), 0);
  const totalCashAmount = transactions.reduce((sum, transaction) => sum + parseFloat(transaction.cash_amount as string), 0);
  const totalBankAmount = transactions.reduce((sum, transaction) => sum + parseFloat(transaction.bank_amount as string), 0);
  // const totalPendingAmount = totalReceivedAmount - (totalCashAmount + totalBankAmount);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-w-4xl relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
        <h2 className="text-lg font-bold mb-4">Credit Transactions</h2>
        {transactions.length > 0 ? (
          <>
            <table className="min-w-full bg-white">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-4 border-b text-left">ID</th>
                  <th className="py-2 px-4 border-b text-left">Date</th>
                  <th className="py-2 px-4 border-b text-left">Payment Type</th>
                  <th className="py-2 px-4 border-b text-left">Status</th>
                  <th className="py-2 px-4 border-b text-left">Received </th>
                  <th className="py-2 px-4 border-b text-left">Cash </th>
                  <th className="py-2 px-4 border-b text-left">Bank </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border-b">{transaction.id}</td>
                    <td className="py-2 px-4 border-b">{formatDate(transaction.date)}</td>
                    <td className="py-2 px-4 border-b">{transaction.payment_method}</td>
                    <td className="py-2 px-4 border-b">{transaction.status}</td>
                    <td className="py-2 px-4 border-b">{formatCurrency(transaction.received_amount)}</td>
                    <td className="py-2 px-4 border-b">{formatCurrency(transaction.cash_amount)}</td>
                    <td className="py-2 px-4 border-b">{formatCurrency(transaction.bank_amount)}</td>
                  </tr>
                ))}
                {/* Totals Row */}
                <tr className="bg-gray-100 font-bold">
                  <td className="py-2 px-4 border-b" colSpan={3}></td>
                  <td className="py-2 px-4 border-b text-right" colSpan={1}>Totals</td>
                  <td className="py-2 px-4 border-b">{formatCurrency(totalReceivedAmount)}</td>
                  <td className="py-2 px-4 border-b">{formatCurrency(totalCashAmount)}</td>
                  <td className="py-2 px-4 border-b">{formatCurrency(totalBankAmount)}</td>
                </tr>
              </tbody>
            </table>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">No transactions available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditTransactionModal;
