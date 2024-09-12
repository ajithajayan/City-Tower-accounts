import React, { useState, useEffect } from "react";
import { api } from "@/services/api";
import Layout from "../components/Layout/Layout";
import Table from "../components/DiningTable/Table";
import  {
  FloorName,
} from "../components/DiningTable/FloorSelector";
import RealTimeClock from "../components/DiningTable/RealTimeClock";

interface Table {
  id: number;
  table_name: string;
  start_time: string;
  end_time: string;
  seats_count: number;
  capacity: number;
  is_ready: boolean;
}

export interface Floor {
  id: number;
  name: FloorName;
}

const DiningTablePage: React.FC = () => {
  const [selectedFloor, setSelectedFloor] = useState<FloorName | null>(null);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchFloors = async () => {
      try {
        const response = await api.get<Floor[]>("/floors");
        setFloors(response.data);
        if (response.data.length > 0) {
          setSelectedFloor(response.data[0].name);
        }
      } catch (error) {
        console.error("Error fetching floors:", error);
        setError("Error fetching floors.");
      }
    };

    fetchFloors();
  }, []);

  const fetchTables = async () => {
    if (selectedFloor !== null) {
      setLoading(true);
      try {
        const floorId = floors.find(
          (floor) => floor.name === selectedFloor
        )?.id;
        if (floorId) {
          const response = await api.get<{ results: Table[] }>(
            `/tables?floor=${floorId}`
          );
          setTables(response.data.results);
          setError(null);
        }
      } catch (error) {
        console.error("Error fetching tables:", error);
        setError("Error fetching tables.");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchTables();
  }, [selectedFloor]);

  // const handleFloorChange = (floorName: FloorName) => {
  //   setSelectedFloor(floorName);
  // };

  // Define the handleFloorClick function
  const handleFloorClick = (floor: Floor) => {
    setSelectedFloor(floor.name); // Set the floor based on its name
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <Layout>
      <div
        className={`flex-1 flex flex-col p-4 bg-[#8D4CF957] ${
          isModalOpen ? "backdrop-blur-sm" : ""
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          {/* Dining Table Heading */}
          <div className="text-white text-2xl">Dining Table</div>

          {/* Real Time Clock */}
          <RealTimeClock />
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Tables Grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading ? (
              <div className="text-white text-center col-span-full">
                Loading...
              </div>
            ) : error ? (
              <div className="text-white text-center col-span-full">
                {error}
              </div>
            ) : tables.length > 0 ? (
              tables.map((table) => (
                <Table
                  key={table.id}
                  id={table.id}
                  name={table.table_name}
                  startTime={table.start_time}
                  endTime={table.end_time}
                  seatsCount={table.seats_count}
                  capacity={table.capacity}
                  isReady={table.is_ready}
                  onModalOpen={handleModalOpen}
                  onModalClose={handleModalClose}
                />
              ))
            ) : (
              <div className="text-white text-center col-span-full">
                No tables available for the selected floor.
              </div>
            )}
          </div>

          {/* Floor Selector */}
          <div className="lg:w-1/4 bg-[#6a0dad] p-4 rounded-lg text-white space-y-4">
            {/* New Floor Button */}
            <button
              className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 py-2 px-4 rounded-full w-full mb-4"
              onClick={() => {}}
            >
              New
            </button>

            {/* Floor List */}
            <ul className="space-y-2">
              {floors.map((floor) => (
                <li
                  key={floor.id}
                  className={`cursor-pointer p-2 rounded text-sm md:text-base 
                ${
                  selectedFloor === floor.name ? "bg-purple-900" : "bg-purple-700"
                } 
                hover:bg-purple-600`}
                  onClick={() => handleFloorClick(floor)}
                >
                  {floor.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DiningTablePage;
