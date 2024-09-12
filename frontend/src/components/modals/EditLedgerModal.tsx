import React, { useState } from "react";
import { api } from "@/services/api"; // Assuming `api` is an Axios instance

interface Group {
  id: number;
  name: string;
}

interface Ledger {
  id: number;
  name: string;
  mobile_no: string;
  opening_balance: string;
  group: Group;
  debit_credit: string;
}

interface EditModalProps {
  ledger: Ledger;
  groups: Group[];
  onClose: () => void;
  onSave: (updatedLedger: Ledger) => void;
}

const EditLedgerModal: React.FC<EditModalProps> = ({ ledger, groups, onClose, onSave }) => {
  const [updatedLedger, setUpdatedLedger] = useState(ledger);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUpdatedLedger({
      ...updatedLedger,
      [name]: name === "group" ? groups.find(group => group.id === parseInt(value))! : value,
    });
  };

  const handleSave = async () => {
    try {
      const data = {
        name: updatedLedger.name,
        opening_balance: updatedLedger.opening_balance,
        group_id: updatedLedger.group.id,
        debit_credit: updatedLedger.debit_credit,
      };

      const response = await api.patch(`/ledgers/${updatedLedger.id}/`, data);

      onSave(response.data);
      onClose(); // Close the modal
    } catch (err) {
      console.error("Failed to update the ledger:", err);
      setError("There was an error updating the ledger. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">Edit Ledger</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="grid grid-cols-2 gap-4">
          <div className="mb-4 col-span-2">
            <label className="block text-sm font-medium mb-2" htmlFor="name">
              Ledger Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={updatedLedger.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4 col-span-1">
            <label className="block text-sm font-medium mb-2" htmlFor="opening_balance">
              Opening Balance
            </label>
            <input
              type="text"
              id="opening_balance"
              name="opening_balance"
              value={updatedLedger.opening_balance}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4 col-span-2">
            <label className="block text-sm font-medium mb-2" htmlFor="group">
              Group
            </label>
            <select
              id="group"
              name="group"
              value={updatedLedger.group.id}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="mr-2 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditLedgerModal;
