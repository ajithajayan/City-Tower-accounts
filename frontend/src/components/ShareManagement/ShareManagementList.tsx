import React, { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Pencil } from 'lucide-react';
import ShareUserEditModal from '@/components/modals/ShareUserEditModal'; 

interface ShareManagementItem {
    id: number;
    name: string;
    category: string;
    profitlose_share: string;
    mobile_no: string;
    address: string;
}

const ShareManagementList: React.FC = () => {
    const [data, setData] = useState<ShareManagementItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await api.get('/share-user-management/');
            console.log('API response:', response.data);
            setData(Array.isArray(response.data) ? response.data : response.data.results); // Adjust as needed
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleEdit = (id: number) => {
        setSelectedItemId(id);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItemId(null);
    };

    const handleUpdate = async () => {
        await fetchData(); // Refresh data after update
    };

    return (
        <div>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit/Loss %</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map(item => (
                        <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.profitlose_share}%</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.mobile_no}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.address}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                    onClick={() => handleEdit(item.id)}
                                    className="text-indigo-600 hover:text-indigo-900"
                                >
                                    <Pencil />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isModalOpen && (
                <ShareUserEditModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    itemId={selectedItemId}
                    onUpdate={handleUpdate} 

                />
            )}
        </div>
    );
};

export default ShareManagementList;
