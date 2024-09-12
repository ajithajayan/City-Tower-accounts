import React, { useState } from "react";
import Modal from "./Modal"; // Import the Modal component
import { api } from "@/services/api";

interface TableProps {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  seatsCount: number;
  capacity: number; // Ensure capacity is included here
  isReady: boolean;
  onModalOpen: () => void;
  onModalClose: () => void;
}

const Table: React.FC<TableProps> = ({
  id,
  name,
  startTime,
  endTime,
  seatsCount,
  capacity,
  isReady,
  onModalOpen,
  onModalClose
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tableDetails, setTableDetails] = useState({
    id,
    startTime,
    endTime,
    seatsCount,
    isReady,
  });

  const handleEditClick = async () => {
    try {
      const response = await api.get(`/tables/${id}/`);
      setTableDetails(response.data);
      setIsModalOpen(true);
      onModalOpen();
    } catch (error) {
      console.error("Error fetching table details:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    onModalClose();
  };

  const handleUpdate = () => {
    // Refresh data after update
    setIsModalOpen(false);
    onModalClose();
  };

  return (
    <>
      <div
        className="bg-customLightPurple p-4 rounded-lg text-white text-center font-bold shadow-md transition-transform transform hover:scale-105 hover:shadow-lg relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span className="block text-xl md:text-2xl lg:text-3xl">{name}</span>
        <div className="mt-2">
          <p className="text-sm md:text-md flex items-center">
            Start Time: {startTime}
          </p>
          <p className="text-sm md:text-md flex items-center">
            End Time: {endTime}
          </p>
          <p className="text-sm md:text-md">Seats: {seatsCount}</p>
          <p className="text-sm md:text-md">Capacity: {capacity}</p>
          <p className="text-sm md:text-md">Ready: {isReady ? "Yes" : "No"}</p>
        </div>
        {isHovered && (
          <button
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded absolute bottom-4 left-1/2 transform -translate-x-1/2"
            onClick={handleEditClick}
          >
            Update
          </button>
        )}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        table={tableDetails} 
        onUpdate={handleUpdate} 
      />
    </>
  );
};

export default Table;
