import React, { useState, useEffect } from 'react';
import { api } from '@/services/api'; // Adjust import path as needed

interface ShareUserEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemId: number | null;
    onUpdate: () => void;
}

const ShareUserEditModal: React.FC<ShareUserEditModalProps> = ({ isOpen, onClose, itemId,onUpdate }) => {
    const [formData, setFormData] = useState({
        name: '',
        mobile_no: '',
        category: '',
        profitlose_share: '',
        address: '',
    });

    useEffect(() => {
        if (itemId !== null) {
            fetchItem();
        }
    }, [itemId]);

    const fetchItem = async () => {
        try {
            const response = await api.get(`/share-user-management/${itemId}/`);
            const data = response.data;
            setFormData({
                name: data.name,
                mobile_no: data.mobile_no,
                category: data.category,
                profitlose_share: data.profitlose_share,
                address: data.address,
            });
        } catch (error) {
            console.error('Error fetching item:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSave = async () => {
        try {
            await api.put(`/share-user-management/${itemId}/`, formData);
            onClose();
            onUpdate(); 
        } catch (error) {
            console.error('Error updating item:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-1/3">
                <h2 className="text-lg font-bold mb-4">Edit Share User</h2>
                <form>
                    <div className="mb-4">
                        <label className="block text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Mobile Number</label>
                        <input
                            type="text"
                            name="mobile_no"
                            value={formData.mobile_no}
                            onChange={handleChange}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="border rounded p-2 w-full"
                        >
                            <option value="">Select Category</option>
                            <option value="partners">Partners</option>
                            <option value="managements">Managements</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Profit/Loss Share (%)</label>
                        <input
                            type="number"
                            name="profitlose_share"
                            value={formData.profitlose_share}
                            onChange={handleChange}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Address</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleSave}
                            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-500 text-white px-4 py-2 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShareUserEditModal;
