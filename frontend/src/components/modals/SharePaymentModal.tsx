import React, { useState } from "react";
import { api } from "@/services/api"; // Import your API service

interface PaymentModalProps {
    transactionId: number;
    balanceAmount: string;
    isOpen: boolean;
    onClose: () => void;
    refreshTransactions: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
    transactionId,
    balanceAmount,
    isOpen,
    onClose,
    refreshTransactions
}) => {
    const [paidDate, setPaidDate] = useState<string>('');
    const [paidAmount, setPaidAmount] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    // Handle payment submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                share_user_transaction: transactionId, // Reference to ShareUserTransaction
                paid_date: paidDate,
                paid_amount: paidAmount,
            };
            await api.post(`/share-payment-history/`, payload); // POST request to create a new payment record
            refreshTransactions(); // Refresh the transactions after successful payment
            onClose(); // Close the modal
        } catch (error) {
            console.error("Error making payment:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null; // Don't render if the modal is closed

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-1/3">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">Make Payment</h2>
                    <span className="text-lg font-semibold">Balance: {balanceAmount}</span> {/* Example balance */}
                </div>


                <form onSubmit={handleSubmit}>
                    {/* Paid Date Field */}
                    <div className="mb-4">
                        <label className="block mb-2">Paid Date</label>
                        <input
                            type="date"
                            className="border p-2 w-full"
                            value={paidDate}
                            onChange={(e) => setPaidDate(e.target.value)}
                            required
                        />
                    </div>

                    {/* Paid Amount Field */}
                    <div className="mb-4">
                        <label className="block mb-2">Paid Amount</label>
                        <input
                            type="number"
                            step="0.01"
                            className="border p-2 w-full"
                            value={paidAmount}
                            onChange={(e) => setPaidAmount(e.target.value)}
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Pay'}
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
            </div>
        </div>
    );
};

export default PaymentModal;
