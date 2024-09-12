import { ArrowLeft, ArrowRight } from "lucide-react";
import React from "react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="flex justify-between items-center mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex gap-2 items-center bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
      >
        <ArrowLeft size={20} />
        Previous
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex gap-2 items-center bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
      >
        Next
        <ArrowRight size={20} />
      </button>
    </div>
  );
};

export default PaginationControls;