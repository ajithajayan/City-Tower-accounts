import React from "react";

interface PrintConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
}

const PrintConfirmationModal: React.FC<PrintConfirmationModalProps> = ({
  isOpen,
  onClose,
  onPrint,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Do you want to print the sales bill?
        </h3>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={onPrint}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
          >
            Print Sales Bill
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintConfirmationModal;
