import React, { useEffect, useState } from "react";
import { api } from "@/services/api"; // Assuming you have an API service

interface MainGroup {
  id: number;
  name: string;
  nature_group: { name: string };
}

const MainGroups: React.FC = () => {
  const [mainGroups, setMainGroups] = useState<MainGroup[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    api.get(`/main-groups/?page=${currentPage}`)
      .then((response) => {
        setMainGroups(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 10)); // Assuming 10 items per page
      })
      .catch((error) => {
        console.error("Error fetching main groups:", error);
      });
  }, [currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Main Groups</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-md">
          <thead>
            <tr>
              <th className="py-2 px-4 bg-gray-200 text-left">Main Group</th>
              <th className="py-2 px-4 bg-gray-200 text-left">Nature Group</th>
            </tr>
          </thead>
          <tbody>
            {mainGroups.map((group) => (
              <tr key={group.id}>
                <td className="py-2 px-4 border-b">{group.name}</td>
                <td className="py-2 px-4 border-b">{group.nature_group.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="bg-gray-300 text-gray-700 py-2 px-4 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="bg-gray-300 text-gray-700 py-2 px-4 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default MainGroups;
