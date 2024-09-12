import React, { useState } from 'react';

interface KitchenNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
}

const KitchenNoteModal: React.FC<KitchenNoteModalProps> = ({ isOpen, onClose, onSave }) => {
  const [note, setNote] = useState('');

  const handleSave = () => {
    onSave(note);
    onClose(); // Close the modal after saving
  };

  if (!isOpen) {
    return null; // Do not render the modal if it's not open
  }

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Kitchen Note</h2>
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md resize-none mb-4"
          placeholder="Enter your kitchen note here..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={5}
        />
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default KitchenNoteModal;
