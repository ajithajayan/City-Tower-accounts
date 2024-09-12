import React, { useState, useEffect } from "react";
import { api } from "@/services/api";

interface ModalProps {
  onClose: () => void;
  onMenuAdded: () => void; // Add this callback prop
}

const AddMenuModal: React.FC<ModalProps> = ({ onClose, onMenuAdded }) => {
  const [name, setName] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [messType, setMessType] = useState<string>("");
  const [createdBy, setCreatedBy] = useState("");
  const [messTypes, setMessTypes] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    api
      .get<{ results: { id: number; name: string }[] }>("/mess-types/")
      .then((response) => {
        if (Array.isArray(response.data.results)) {
          setMessTypes(response.data.results);
        } else {
          console.error("Unexpected response data:", response.data);
        }
      })
      .catch((error) => console.error("Error fetching mess types:", error));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/menus/', {
        name: name,
        day_of_week: dayOfWeek.toLowerCase(),
        mess_type: messType,
        created_by: createdBy,
        is_custom: true
      });
      
      console.log('Form submitted successfully:', response.data);
      onMenuAdded(); // Call callback after adding menu
      onClose(); 
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
        <h2 className="text-xl font-semibold mb-4">Add Menu</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-700">
              Day of Week
            </label>
            <select
              id="dayOfWeek"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="" disabled>Select a day</option>
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="messType" className="block text-sm font-medium text-gray-700">
              Mess Type
            </label>
            <select
              id="messType"
              value={messType}
              onChange={(e) => setMessType(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="" disabled>Select a mess type</option>
              {messTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="createdBy" className="block text-sm font-medium text-gray-700">
              Created By
            </label>
            <input
              id="createdBy"
              type="text"
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMenuModal;
