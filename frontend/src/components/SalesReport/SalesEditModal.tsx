import React, { useState, useEffect } from "react";
import { api } from "@/services/api";

interface SalesReport {
    id: number;
    total_amount: number;
    status: string;
    order_type: string;
    payment_method: string;
    created_at: string;
    invoice_number: string;
    cash_amount: string;
    bank_amount: string;
    customer_phone_number: string;
    customer_name: string;
}

interface SalesEditModalProps {
    isOpen: boolean;
    report: SalesReport | null;
    onClose: () => void;
}

interface FormData {
    customer_name: string;
    customer_phone_number: string;
}

const SalesEditModal: React.FC<SalesEditModalProps> = ({ isOpen, report, onClose }) => {
    const [formData, setFormData] = useState<FormData>({
        customer_name: report?.customer_name || "",
        customer_phone_number: report?.customer_phone_number || "",
    });

    useEffect(() => {
        if (report) {
            setFormData({
                customer_name: report.customer_name,
                customer_phone_number: report.customer_phone_number,
            });
        }
    }, [report]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSave = async () => {
        if (!report) return;

        try {
            await api.patch(`/orders/${report.id}/`, formData);
            onClose();
        } catch (error) {
            console.error("Failed to update report:", error);
        }
    };

    if (!isOpen) return null;

    if (!report) return null;

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white p-4 rounded shadow-lg w-96">
                <h2 className="text-lg font-bold mb-4">Edit Sales Report</h2>
                <div className="mb-4">
                    <label className="block text-gray-700">Customer Name</label>
                    <input
                        type="text"
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={handleChange}
                        className="w-full border rounded px-2 py-1"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Mobile Number</label>
                    <input
                        type="text"
                        name="customer_phone_number"
                        value={formData.customer_phone_number}
                        onChange={handleChange}
                        className="w-full border rounded px-2 py-1"
                    />
                </div>
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

export default SalesEditModal;
