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
    profit_lose_amount: string;
    percentage_amount:string;
}

interface ShareUser {
    id: number;
    name: string;
    category: string;
    profitlose_share: string;  // This represents the profit/loss share value
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
            profit_lose_amount: '',
            percentage_amount:'',
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
                // Map status to backend values
                const profitLossValue = value === 'Profit' ? 'profit' : value === 'Loss' ? 'lose' : '';
                setNameSections(prevSections => prevSections.map(section => ({
                    ...section,
                    profitLoss: profitLossValue
                })));
            }

            if (name === 'profitAmount') {
                const profitAmount = parseFloat(value) || 0;
                setNameSections(prevSections => prevSections.map(section => ({
                    ...section,
                    amount: calculateAmount(section.percentage, profitAmount)
                })));
            }

            if (name === 'lossAmount') {
                const lossAmount = parseFloat(value) || 0;
                setNameSections(prevSections => prevSections.map(section => ({
                    ...section,
                    amount: calculateAmount(section.percentage, lossAmount)
                })));
            }

            return newFields;
        });
    };

    const handleSectionChange = (id: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updatedSections = nameSections.map(section => {
            if (section.id === id) {
                let newValue = value;

                if (name === 'percentage') {
                    newValue = value;
                    const amount = commonFields.status === 'Profit'
                        ? parseFloat(commonFields.profitAmount) || 0
                        : commonFields.status === 'Loss'
                            ? parseFloat(commonFields.lossAmount) || 0
                            : 0;
                    return {
                        ...section,
                        [name]: newValue,
                        amount: calculateAmount(newValue, amount)
                    };
                }

                if (name === 'optionName') {
                    const selectedUser = shareUsers.find(user => user.id === Number(value));
                    return {
                        ...section,
                        [name]: value,
                        category: selectedUser ? selectedUser.category : section.category,
                        percentage: selectedUser ? selectedUser.profitlose_share : section.percentage,
                        profitLoss: commonFields.status === 'Profit' ? 'profit' : commonFields.status === 'Loss' ? 'lose' : section.profitLoss
                    };
                }

                return { ...section, [name]: newValue };
            }
            return section;
        });
        setNameSections(updatedSections);
    };


    const calculateAmount = (percentage: string, amount: number) => {
        const percent = parseFloat(percentage) || 0;
        return ((percent / 100) * amount).toFixed(2);
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
                profit_lose_amount: '',
                percentage_amount:''
            }
        ]);
    };

    const removeNameSection = (id: number) => {
        setNameSections(nameSections.filter(section => section.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Calculate total_amount and total_percentage
        const totalAmount = nameSections.reduce((sum, section) => sum + (parseFloat(section.profit_lose_amount) || 0), 0).toFixed(2);
        const totalPercentage = Math.round(nameSections.reduce((sum, section) => sum + (parseFloat(section.percentage) || 0), 0));

        // Default profit_lose_amount and loss_amount to '0' if they are empty
        const profitAmount = commonFields.profitAmount || '0';
        const lossAmount = commonFields.lossAmount || '0';

        const data = {
            created_date: commonFields.date,
            period_from: commonFields.periodFrom,
            period_to: commonFields.periodTo,
            status: commonFields.status === 'Profit' ? 'profit' : commonFields.status === 'Loss' ? 'lose' : '',
            profit_lose_amount: parseFloat(profitAmount) || 0,  // Ensure profitAmount is a number
            loss_amount: parseFloat(lossAmount) || 0,    // Ensure lossAmount is a number
            total_amount: parseFloat(totalAmount) || 0, // Ensure totalAmount is a number
            total_percentage: totalPercentage,
            share_user_transactions: nameSections.map(section => ({
                share_user: section.optionName,
                profit_lose: section.profitLoss,
                percentage: parseInt(section.percentage, 10),  // Ensure percentage is an integer
                profit_lose_amount: parseFloat(section.profit_lose_amount) || 0,  // Ensure amount is a number
                percentage_amount:parseFloat(section.percentage_amount) || 0 
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
                profit_lose_amount: '',
                percentage_amount:''
            }]);

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error submitting data:', error.response ? error.response.data : error.message);
            } else {
                console.error('Unexpected Error:', error);
            }
        }
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
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Profit Loss</label>
                        <select
                            id="status"
                            name="status"
                            value={commonFields.status}
                            onChange={handleCommonChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                        >
                            <option value="">Select Profit Loss</option>
                            <option value="Profit">Profit</option>
                            <option value="Loss">Loss</option>
                        </select>
                    </div>

                    {commonFields.status === 'Profit' && (
                        <div className="mt-4">
                            <label htmlFor="profitAmount" className="block text-sm font-medium text-gray-700">Profit Amount:</label>
                            <input
                                type="number"
                                id="profitAmount"
                                name="profitAmount"
                                value={commonFields.profitAmount}
                                onChange={handleCommonChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                            />
                        </div>
                    )}

                    {commonFields.status === 'Loss' && (
                        <div className="mt-4">
                            <label htmlFor="lossAmount" className="block text-sm font-medium text-gray-700">Loss Amount:</label>
                            <input
                                type="number"
                                id="lossAmount"
                                name="lossAmount"
                                value={commonFields.lossAmount}
                                onChange={handleCommonChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                            />
                        </div>
                    )}
                </div>

                {/* Name Sections */}
                {nameSections.map((section, index) => (
                    <div key={section.id} className="border p-4 rounded-md shadow-sm mt-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Share {index + 1}</h2>
                            <button
                                type="button"
                                onClick={() => removeNameSection(section.id)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex flex-wrap space-x-4">
                            <div className="flex-1">
                                <label htmlFor={`optionName-${section.id}`} className="block text-sm font-medium text-gray-700">Option Name:</label>
                                <select
                                    id={`optionName-${section.id}`}
                                    name="optionName"
                                    value={section.optionName}
                                    onChange={(e) => handleSectionChange(section.id, e)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                                >
                                    <option value="">Select User</option>
                                    {shareUsers.map(user => (
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
                                    readOnly
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                                />
                            </div>
                            <div className="flex-1">
                                <label htmlFor={`profitLoss-${section.id}`} className="block text-sm font-medium text-gray-700">Profit/Loss:</label>
                                <input
                                    type="text"
                                    id={`profitLoss-${section.id}`}
                                    name="profitLoss"
                                    value={section.profitLoss}
                                    readOnly
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                                />
                            </div>
                            <div className="flex-1">
                                <label htmlFor={`percentage-${section.id}`} className="block text-sm font-medium text-gray-700">Percentage:</label>
                                <input
                                    type="number"
                                    id={`percentage-${section.id}`}
                                    name="percentage"
                                    value={section.percentage}
                                    onChange={(e) => handleSectionChange(section.id, e)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                                />
                            </div>
                            <div className="flex-1">
                                <label htmlFor={`percentage_amount-${section.id}`} className="block text-sm font-medium text-gray-700">Percentage Amount:</label>
                                <input
                                    type="number"
                                    id={`percentage_amount-${section.id}`}
                                    name="percentage_amount"
                                    value={section.percentage_amount}
                                    readOnly
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                                />
                            </div>
                            <div className="flex-1">
                                <label htmlFor={`profit_lose_amount-${section.id}`} className="block text-sm font-medium text-gray-700">Profit Loss Amount:</label>
                                <input
                                    type="number"
                                    id={`profit_lose_amount-${section.id}`}
                                    name="profit_lose_amount"
                                    value={section.profit_lose_amount}
                                    readOnly
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>

                ))}
                <div className="flex justify-between items-center mt-4">
                    <div className="flex-grow text-center">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                        >
                            Submit
                        </button>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={addNameSection}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            Add Section
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProfitLossShareTransaction;
