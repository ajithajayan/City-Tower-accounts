import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { MessType } from '@/types';

interface MessReport {
    id: number;
    customer_name: string;
    mobile_number: string;
    mess_type: MessType; // Assuming MessType is a string; adjust if it's an enum or different type
    total_amount: number;
    paid_amount: number;
    pending_amount: number;
    start_date: string;
    end_date: string;
    payment_method: string;
    grand_total: string;
    cash_amount: string;
    bank_amount: string;
}

interface MessEditModalProps {
    isOpen: boolean;
    report: MessReport | null;
    onClose: () => void;
}

const MessEditModal: React.FC<MessEditModalProps> = ({ isOpen, report, onClose }) => {
    const [formData, setFormData] = useState<MessReport | null>(report);

    useEffect(() => {
        setFormData(report);
    }, [report]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (formData) {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleSave = async () => {
        if (!formData) return;

        try {
            await api.patch(`/messes/${formData.id}/`, formData);
            onClose();
        } catch (error) {
            console.error("Failed to update mess report:", error);
        }
    };
    
    if (!isOpen) return null;

    if (!report) return null;

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white p-4 rounded shadow-lg w-96">
                <h2 className="text-lg font-bold mb-4">Edit Mess Report</h2>
                <div className="mb-4">
                    <label className="block text-gray-700">Customer Name</label>
                    <input
                        type="text"
                        name="customer_name"
                        value={formData?.customer_name || ""}
                        onChange={handleChange}
                        className="w-full border rounded px-2 py-1"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Mobile Number</label>
                    <input
                        type="text"
                        name="mobile_number"
                        value={formData?.mobile_number || ""}
                        onChange={handleChange}
                        className="w-full border rounded px-2 py-1"
                    />
                </div>
                {/* You can add more fields here as needed */}
                <div className="flex justify-end">
                    <button onClick={onClose} className="bg-gray-500 text-white py-1 px-4 rounded mr-2">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="bg-blue-500 text-white py-1 px-4 rounded">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessEditModal;
