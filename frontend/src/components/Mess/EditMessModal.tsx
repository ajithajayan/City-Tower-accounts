import React, { useState, useEffect } from "react";
import { api } from "@/services/api";

interface EditMessModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: any; // Adjust type as needed
  onSave: (updatedMember: any) => void; // Adjust type as needed
}

const EditMessModal: React.FC<EditMessModalProps> = ({ isOpen, onClose, member, onSave }) => {
  const [formData, setFormData] = useState(member);

  useEffect(() => {
    setFormData(member);
  }, [member]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = async () => {
    try {
      const response = await api.patch(`/messes/${member.id}/`, formData);
      onSave(response.data);
      onClose();
    } catch (error) {
      console.error("Failed to update member:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white p-4 rounded shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Edit Mess</h2>
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
            name="mobile_number"
            value={formData.mobile_number}
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

export default EditMessModal;
