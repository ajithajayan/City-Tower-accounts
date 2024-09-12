import React, { useState } from "react";
import { api } from "@/services/api";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: {
    id: number;
    startTime: string;
    endTime: string;
    seatsCount: number;
    isReady: boolean;
  } | null;
  onUpdate: () => void; // Callback to refresh data after update
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, table, onUpdate }) => {
  const [startTime, setStartTime] = useState(table?.startTime || '');
  const [endTime, setEndTime] = useState(table?.endTime || '');
  const [seatsCount, setSeatsCount] = useState(table?.seatsCount || 0);
  const [isReady, setIsReady] = useState(table?.isReady || false);

  if (!isOpen || !table) return null;

  const handleSave = async () => {
    try {
      await api.patch(`/tables/${table.id}/`, {
        start_time: startTime,
        end_time: endTime,
        seats_count: seatsCount,
        is_ready: isReady,
      });
      onUpdate(); // Refresh data after update
      onClose();
    } catch (error) {
      console.error("Error updating table:", error);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"></div>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-80 relative">
          <h2 className="text-xl font-bold mb-4">Edit Table</h2>
          <div className="flex flex-wrap -mx-2">
            <div className="w-1/2 px-2 mb-4">
              <label className="block mb-1">Start Time</label>
              <input
                type="time"
                className="w-full border border-gray-300 p-2 rounded"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="w-1/2 px-2 mb-4">
              <label className="block mb-1">End Time</label>
              <input
                type="time"
                className="w-full border border-gray-300 p-2 rounded"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
            <div className="w-1/2 px-2 mb-4">
              <label className="block mb-1">Seats Count</label>
              <input
                type="number"
                className="w-full border border-gray-300 p-2 rounded"
                value={seatsCount}
                onChange={(e) => setSeatsCount(parseInt(e.target.value))}
              />
            </div>
            <div className="w-1/2 px-2 mb-4">
              <label className="block mb-1">Ready</label>
              <select
                className="w-full border border-gray-300 p-2 rounded"
                value={isReady ? "Yes" : "No"}
                onChange={(e) => setIsReady(e.target.value === "Yes")}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button className="bg-red-500 text-white py-2 px-4 rounded mr-2" onClick={onClose}>
              Cancel
            </button>
            <button className="bg-blue-500 text-white py-2 px-4 rounded" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
