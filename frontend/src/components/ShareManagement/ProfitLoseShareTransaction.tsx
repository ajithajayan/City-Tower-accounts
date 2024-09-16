import React, { useState, useEffect } from "react";
import { Trash2 } from 'lucide-react';
import axios from 'axios';
import { api } from "@/services/api";

interface NameSection {
    id: number;
    optionName: string;
    profitLoss: string;
    percentage: string;
    category: string;
    amount: string;
    percentage_amount: string;
}

interface ShareUser {
    id: number;
    name: string;
    category: string;
    profitlose_share: string;
}

const ProfitLossShareTransaction: React.FC = () => {
    const [commonFields, setCommonFields] = useState({
        date: '',
        periodFrom: '',
        periodTo: '',
        status: '',
        profitAmount: '',
        lossAmount: '',
    });

    const [nameSections, setNameSections] = useState<NameSection[]>([
        {
            id: Date.now(),
            optionName: '',
            profitLoss: '',
            percentage: '',
            category: '',
            amount: '',
            percentage_amount: ''
        }
    ]);

    const [shareUsers, setShareUsers] = useState<ShareUser[]>([]);

    useEffect(() => {
        const fetchShareUsers = async () => {
            try {
                const response = await api.get('/share-user-management/');
                if (Array.isArray(response.data.results)) {
                    setShareUsers(response.data.results);
                } else {
                    console.error('Unexpected data format:', response.data);
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    console.error('Error fetching share users:', error.response ? error.response.data : error.message);
                } else {
                    console.error('Unexpected Error:', error);
                }
            }
        };

        fetchShareUsers();
    }, []);

    const handleCommonChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCommonFields(prev => {
            const newFields = { ...prev, [name]: value };

            if (name === 'status') {
                const profitLossValue = value === 'Profit' ? 'profit' : value === 'Loss' ? 'lose' : '';
                setNameSections(prevSections => prevSections.map(section => ({
                    ...section,
                    profitLoss: profitLossValue
                })));
            }

            return newFields;
        });
    };

    const handleSectionChange = (id: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updatedSections = nameSections.map(section => {
            if (section.id === id) {
                const newSection = { ...section, [name]: value };

                if (name === 'percentage' || name === 'amount') {
                    const amount = parseFloat(newSection.amount) || 0;
                    const percentage = parseFloat(newSection.percentage) || 0;
                    newSection.percentage_amount = ((amount * percentage) / 100).toFixed(2);
                }

                if (name === 'optionName') {
                    const selectedUser = shareUsers.find(user => user.id === Number(value));
                    newSection.category = selectedUser ? selectedUser.category : section.category;
                    newSection.percentage = selectedUser ? selectedUser.profitlose_share : section.percentage;
                    newSection.profitLoss = commonFields.status === 'Profit' ? 'profit' : commonFields.status === 'Loss' ? 'lose' : section.profitLoss;

                    const amount = parseFloat(newSection.amount) || 0;
                    const percentage = parseFloat(newSection.percentage) || 0;
                    newSection.percentage_amount = ((amount * percentage) / 100).toFixed(2);
                }

                return newSection;
            }
            return section;
        });
        setNameSections(updatedSections);
    };

    const addNameSection = () => {
        setNameSections([
            ...nameSections,
            {
                id: Date.now(),
                optionName: '',
                profitLoss: commonFields.status === 'Profit' ? 'profit' : commonFields.status === 'Loss' ? 'lose' : '',
                percentage: '',
                category: '',
                amount: '',
                percentage_amount: ''
            }
        ]);
    };

    const removeNameSection = (id: number) => {
        setNameSections(nameSections.filter(section => section.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const totalAmount = nameSections.reduce((sum, section) => sum + (parseFloat(section.amount) || 0), 0).toFixed(2);
        const totalPercentage = Math.round(nameSections.reduce((sum, section) => sum + (parseFloat(section.percentage) || 0), 0));

        const profitAmount = commonFields.profitAmount || '0';
        const lossAmount = commonFields.lossAmount || '0';

        const data = {
            created_date: commonFields.date,
            period_from: commonFields.periodFrom,
            period_to: commonFields.periodTo,
            status: commonFields.status === 'Profit' ? 'profit' : commonFields.status === 'Loss' ? 'lose' : '',
            profit_amount: parseFloat(profitAmount) || 0,
            loss_amount: parseFloat(lossAmount) || 0,
            total_amount: parseFloat(totalAmount) || 0,
            total_percentage: totalPercentage,
            share_user_transactions: nameSections.map(section => ({
                share_user: section.optionName,
                profit_lose: section.profitLoss,
                percentage: parseInt(section.percentage, 10),
                amount: parseFloat(section.amount) || 0,
                percentage_amount: parseFloat(section.percentage_amount) || 0,
                balance_amount: parseFloat(section.percentage_amount) || 0
            }))
        };

        console.log("data", data);

        try {
            const response = await api.post('/profit-loss-share-transactions/', data, {
                headers: { 'Content-Type': 'application/json' },
            });

            console.log('Success:', response.data);
            setCommonFields({
                date: '',
                periodFrom: '',
                periodTo: '',
                status: '',
                profitAmount: '',
                lossAmount: '',
            });
            setNameSections([{
                id: Date.now(),
                optionName: '',
                profitLoss: '',
                percentage: '',
                category: '',
                amount: '',
                percentage_amount: ''
            }]);

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error submitting data:', error.response ? error.response.data : error.message);
            } else {
                console.error('Unexpected Error:', error);
            }
        }
    };

    const calculateRemainingAmount = () => {
        const totalPercentageAmount = nameSections.reduce((sum, section) => sum + (parseFloat(section.percentage_amount) || 0), 0);
        const baseAmount = parseFloat(commonFields.status === 'Profit' ? commonFields.profitAmount : commonFields.lossAmount) || 0;
        return baseAmount - totalPercentageAmount;
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Profit Loss Share Transaction</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Common Fields */}
                <div className="border p-4 rounded-md shadow-sm">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date:</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={commonFields.date}
                            onChange={handleCommonChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                        />
                    </div>
                    <div className="flex space-x-4 mt-4">
                        <div className="flex-1">
                            <label htmlFor="periodFrom" className="block text-sm font-medium text-gray-700">Period From:</label>
                            <input
                                type="date"
                                id="periodFrom"
                                name="periodFrom"
                                value={commonFields.periodFrom}
                                onChange={handleCommonChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="periodTo" className="block text-sm font-medium text-gray-700">Period To:</label>
                            <input
                                type="date"
                                id="periodTo"
                                name="periodTo"
                                value={commonFields.periodTo}
                                onChange={handleCommonChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Additional Option:</label>
                        <select
                            id="status"
                            name="status"
                            value={commonFields.status}
                            onChange={handleCommonChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                        >
                            <option value="">Select an option</option>
                            <option value="Profit">Profit</option>
                            <option value="Loss">Loss</option>
                        </select>
                    </div>
                    <div className="flex space-x-4 mt-4">
                        <div className="flex-1">
                            <label htmlFor="profitAmount" className="block text-sm font-medium text-gray-700">Profit Amount:</label>
                            <input
                                type="text"
                                id="profitAmount"
                                name="profitAmount"
                                value={commonFields.profitAmount}
                                onChange={handleCommonChange}
                                disabled={commonFields.status !== 'Profit'}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="lossAmount" className="block text-sm font-medium text-gray-700">Loss Amount:</label>
                            <input
                                type="text"
                                id="lossAmount"
                                name="lossAmount"
                                value={commonFields.lossAmount}
                                onChange={handleCommonChange}
                                disabled={commonFields.status !== 'Loss'}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Name Sections */}
                {nameSections.map((section, index) => (
                    <div key={section.id} className="border p-4 rounded-md shadow-sm mt-4">
                        <div className="flex space-x-4">
                            <div className="flex-1">
                                <label htmlFor={`optionName-${section.id}`} className="block text-sm font-medium text-gray-700">Option Name:</label>
                                <select
                                    id={`optionName-${section.id}`}
                                    name="optionName"
                                    value={section.optionName}
                                    onChange={(e) => handleSectionChange(section.id, e)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                                >
                                    <option value="">Select a user</option>
                                    {shareUsers.map((user) => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label htmlFor={`category-${section.id}`} className="block text-sm font-medium text-gray-700">Category:</label>
                                <input
                                    type="text"
                                    id={`category-${section.id}`}
                                    name="category"
                                    value={section.category}
                                    onChange={(e) => handleSectionChange(section.id, e)}
                                    disabled
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                                />
                            </div>
                            <div className="flex-1">
                                <label htmlFor={`percentage-${section.id}`} className="block text-sm font-medium text-gray-700">Percentage:</label>
                                <input
                                    type="text"
                                    id={`percentage-${section.id}`}
                                    name="percentage"
                                    value={section.percentage}
                                    onChange={(e) => handleSectionChange(section.id, e)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                                />
                            </div>
                            <div className="flex-1">
                                <label htmlFor={`amount-${section.id}`} className="block text-sm font-medium text-gray-700">Amount:</label>
                                <input
                                    type="text"
                                    id={`amount-${section.id}`}
                                    name="amount"
                                    value={section.amount}
                                    onChange={(e) => handleSectionChange(section.id, e)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                                />
                            </div>
                            <div className="flex-1">
                                <label htmlFor={`percentage_amount-${section.id}`} className="block text-sm font-medium text-gray-700">Percentage Amount:</label>
                                <input
                                    type="text"
                                    id={`percentage_amount-${section.id}`}
                                    name="percentage_amount"
                                    value={section.percentage_amount}
                                    onChange={(e) => handleSectionChange(section.id, e)}
                                    disabled
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                                />
                            </div>
                            <button type="button" onClick={() => removeNameSection(section.id)} className="mt-8 bg-red-500 text-white p-2 rounded-md">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Balance Display */}
                <div className="text-right mt-4">
                    <h2 className="text-lg font-bold">Remaining Balance: {calculateRemainingAmount().toFixed(2)}</h2>
                </div>

                <div className="flex justify-between items-center mt-4">
                    <button type="button" onClick={addNameSection} className="bg-blue-500 text-white p-2 rounded-md">
                        Add Option
                    </button>
                    <button type="submit" className="bg-green-500 text-white p-2 rounded-md">
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfitLossShareTransaction;
