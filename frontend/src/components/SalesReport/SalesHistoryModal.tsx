import React from "react";

interface Sales {
  id: number;
  total_amount: number | string;
  status: string;
  order_type: string;
  payment_method: string;
  created_at: string;
  invoice_number: string;
  cash_amount: string | number;
  bank_amount: string | number;
  customer_phone_number: string;
}

interface SalesHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderhistory: Sales[];
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
  return numericValue.toFixed(2);
};

const SalesHistoryModal: React.FC<SalesHistoryModalProps> = ({ isOpen, onClose, orderhistory }) => {
  if (!isOpen) return null;

  // Calculate totals
  const totalCashAmount = orderhistory.reduce((sum, transaction) => sum + parseFloat(transaction.cash_amount as string), 0);
  const totalBankAmount = orderhistory.reduce((sum, transaction) => sum + parseFloat(transaction.bank_amount as string), 0);
  const totalAmount = orderhistory.reduce((sum, transaction) => sum + parseFloat(transaction.total_amount as string), 0);

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
        <h2 className="text-lg font-bold mb-4">Sales History</h2>
        {orderhistory.length > 0 ? (
          <>
            <table className="min-w-full bg-white">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-4 border-b text-left">ID</th>
                  <th className="py-2 px-4 border-b text-left">Invoice Number</th>
                  <th className="py-2 px-4 border-b text-left">Date</th>
                  <th className="py-2 px-4 border-b text-left">Payment Method</th>
                  <th className="py-2 px-4 border-b text-left">Order Type</th>
                  <th className="py-2 px-4 border-b text-left">Cash Amount</th>
                  <th className="py-2 px-4 border-b text-left">Bank Amount</th>
                  <th className="py-2 px-4 border-b text-left">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {orderhistory.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border-b">{transaction.id}</td>
                    <td className="py-2 px-4 border-b">{transaction.invoice_number}</td>
                    <td className="py-2 px-4 border-b">{formatDate(transaction.created_at)}</td>
                    <td className="py-2 px-4 border-b">{transaction.payment_method}</td>
                    <td className="py-2 px-4 border-b">{transaction.order_type}</td>
                    <td className="py-2 px-4 border-b">{formatCurrency(transaction.cash_amount)}</td>
                    <td className="py-2 px-4 border-b">{formatCurrency(transaction.bank_amount)}</td>
                    <td className="py-2 px-4 border-b">{formatCurrency(transaction.total_amount)}</td>
                  </tr>
                ))}
                {/* Totals Row */}
                <tr className="bg-gray-100 font-bold">
                  <td className="py-2 px-4 border-b text-right" colSpan={5}>Totals</td>
                  <td className="py-2 px-4 border-b">{formatCurrency(totalCashAmount)}</td>
                  <td className="py-2 px-4 border-b">{formatCurrency(totalBankAmount)}</td>
                  <td className="py-2 px-4 border-b">{formatCurrency(totalAmount)}</td>
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

export default SalesHistoryModal;
