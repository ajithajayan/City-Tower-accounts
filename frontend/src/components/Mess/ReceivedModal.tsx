import React, { useState } from "react";
// import axios from "axios";
import { api } from "@/services/api";

interface ReceivedModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: number;
  onSave: (transaction: any) => void; // Ensure onSave expects a transaction argument
}

const ReceivedModal: React.FC<ReceivedModalProps> = ({ isOpen, onClose, memberId, onSave }) => {
  const [receivedAmount, setReceivedAmount] = useState<string>('');
  const [cashAmount, setCashAmount] = useState<string>('');
  const [bankAmount, setBankAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post("/mess-transactions/", {
        mess: memberId,
        received_amount: parseFloat(receivedAmount) || 0,
        cash_amount: (paymentMethod === 'cash' || paymentMethod === 'cash-bank') ? parseFloat(cashAmount) || 0 : 0,
        bank_amount: (paymentMethod === 'bank' || paymentMethod === 'cash-bank') ? parseFloat(bankAmount) || 0 : 0,
        payment_method: paymentMethod,
        status: parseFloat(receivedAmount) > 0 ? 'completed' : 'pending'
      });

      if (response.status === 201) {
        // Pass the transaction data to the onSave callback
        onSave(response.data);
        onClose();
      }
    } catch (err) {
      console.error("Error creating transaction:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-lg font-bold mb-4">Create Transaction</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Received Amount</label>
            <input
              type="number"
              value={receivedAmount}
              onChange={(e) => setReceivedAmount(e.target.value)}
              className="border rounded p-2 w-full"
              step="0.01"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="border rounded p-2 w-full"
              required
            >
              <option value="">Select Payment Method</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="cash-bank">Cash-Bank</option>
            </select>
          </div>
          {paymentMethod === 'cash' || paymentMethod === 'cash-bank' ? (
            <div className="mb-4">
              <label className="block text-gray-700">Cash Amount</label>
              <input
                type="number"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                className="border rounded p-2 w-full"
                step="0.01"
                min="0"
              />
            </div>
          ) : null}
          {paymentMethod === 'bank' || paymentMethod === 'cash-bank' ? (
            <div className="mb-4">
              <label className="block text-gray-700">Bank Amount</label>
              <input
                type="number"
                value={bankAmount}
                onChange={(e) => setBankAmount(e.target.value)}
                className="border rounded p-2 w-full"
                step="0.01"
                min="0"
              />
            </div>
          ) : null}
          <div className="flex justify-center mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-red-500 text-white py-2 px-4 rounded mr-2 hover:bg-red-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReceivedModal;
