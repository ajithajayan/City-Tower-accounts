    import React, { useState } from "react";
    import { api } from "@/services/api";
    import { toast } from 'react-toastify';

    const ShareManagementCreationForm: React.FC = () => {
        const [formData, setFormData] = useState({
            name: '',
            category: 'partners',
            profitlose_share: '',
            mobile_no: '',
            address: ''
        });

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            setFormData(prevData => ({
                ...prevData,
                [name]: value
            }));
        };

        const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            try {
                await api.post('/share-user-management/', formData);
                toast.success('Form submitted successfully');
                // Optionally clear form fields here
                setFormData({
                    name: '',
                    category: 'partners',
                    profitlose_share: '',
                    mobile_no: '',
                    address: ''
                });
            } catch (error) {
                toast.error('Error submitting form');
                console.error('Error submitting form:', error);
            }
        };

        return (
            <div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Row 1 */}
                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category:</label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="partners">Partners</option>
                                <option value="managements">Managements</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <label htmlFor="profitlose_share" className="block text-sm font-medium text-gray-700">Profit/Loss Share (%):</label>
                            <input
                                type="number"
                                id="profitlose_share"
                                name="profitlose_share"
                                value={formData.profitlose_share}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                max="100"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="mobile_no" className="block text-sm font-medium text-gray-700">Mobile:</label>
                            <input
                                type="text"
                                id="mobile_no"
                                name="mobile_no"
                                value={formData.mobile_no}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    {/* Row 3 */}
                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address:</label>
                            <textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-[#6f42c1] text-white font-semibold rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Submit
                    </button>
                </form>
            </div>
        );
    };

    export default ShareManagementCreationForm;
