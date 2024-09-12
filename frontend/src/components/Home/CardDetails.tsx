import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { RotateCcw } from "lucide-react";
import { api } from "@/services/api";

interface CardDetailsProps {
  selectedCard: {
    id: number;
    title: string;
    content: string;
    iconType: "Delivery" | "Dining" | "Takeaway";
  } | null;
}

interface Order {
  id: number;
  created_at: string;
  total_amount: string | number;
  status: string;
  order_type: "dining" | "takeaway" | "delivery";
  billed_at: string;
  items: { dish: number; quantity: number }[];
}

type StatusType = "pending" | "delivered" | "cancelled";

const CardDetails: React.FC<CardDetailsProps> = ({ selectedCard }) => {
  const [activeStatus, setActiveStatus] = useState<StatusType>("pending"); // Default to "pending"
  const [allOrders, setAllOrders] = useState<Order[] | null>(null); // Store all orders
  const [filteredOrders, setFilteredOrders] = useState<Order[] | null>(null); // Store filtered orders
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const ordersPerPage = 5;

  useEffect(() => {
    const fetchOrders = async () => {
      if (selectedCard) {
        setIsLoading(true);
        setIsError(false);

        const token = localStorage.getItem("token");

        const params: any = {
          order_type: selectedCard.iconType.toLowerCase(),
        };

        try {
          const response = await api.get(`/orders`, {
            params,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const orders = response.data.results;
          setAllOrders(orders);
          // Initially filter orders with the default status
          const initialFilteredOrders = orders.filter(
            (order: Order) => order.status === activeStatus
          );
          setFilteredOrders(initialFilteredOrders);
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching orders:", error);
          setIsError(true);
          setIsLoading(false);
        }
      }
    };

    fetchOrders();
  }, [selectedCard]);

  const handleStatusClick = (status: "pending" | "cancelled" | "delivered") => {
    setActiveStatus(status);
    setCurrentPage(1); // Reset to the first page when changing the status

    if (allOrders) {
      const statusFilteredOrders = allOrders.filter(
        (order) => order.status === status
      );
      setFilteredOrders(statusFilteredOrders);
    }
  };

  const handleReset = () => {
    setFromDate(null);
    setToDate(null);
    handleStatusClick(activeStatus); // Reset to the current active status
    setCurrentPage(1);
  };

  const handleDateFilter = () => {
    if (allOrders) {
      let filtered = allOrders.filter((order) => order.status === activeStatus); // Apply status filter first

      if (fromDate && toDate) {
        const from = new Date(fromDate).setHours(0, 0, 0, 0);
        const to = new Date(toDate).setHours(23, 59, 59, 999);

        filtered = filtered.filter((order) => {
          const billDate = new Date(order.billed_at).getTime();
          return billDate >= from && billDate <= to;
        });
      }

      setFilteredOrders(filtered);
      setCurrentPage(1); // Reset to the first page on new search/filter
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1)); // Decrease the page number but not below 1
  };

  const handleNextPage = () => {
    if (filteredOrders) {
      setCurrentPage((prevPage) =>
        prevPage < Math.ceil(filteredOrders.length / ordersPerPage)
          ? prevPage + 1
          : prevPage
      ); // Increase the page number but not beyond the total pages
    }
  };

  if (!selectedCard) {
    return (
      <div className="p-4 bg-white shadow">Select a card to see details</div>
    );
  }

  if (isError) {
    return <div className="p-4 bg-white shadow">Error loading orders.</div>;
  }

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders
    ? filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)
    : [];

  return (
    <div className="p-4 shadow h-full md:h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold">{selectedCard.title}</h2>
      </div>

      {/* Date Filters */}
      <div className="flex flex-col md:flex-row md:space-x-4 mb-4">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              From Date
            </label>
            <DatePicker
              selected={fromDate}
              onChange={(date) => setFromDate(date)}
              dateFormat="yyyy-MM-dd"
              className="mt-1 p-2 border rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              To Date
            </label>
            <DatePicker
              selected={toDate}
              onChange={(date) => setToDate(date)}
              dateFormat="yyyy-MM-dd"
              className="mt-1 p-2 border rounded w-full"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex space-x-2 items-center">
          <button
            onClick={handleDateFilter}
            className="p-2 bg-blue-500 text-white rounded w-full md:w-auto"
          >
            Search
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-red-500 text-white rounded-full w-10 h-10 flex justify-center items-center"
            title="Reset"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        {/* Status Buttons */}
        <div className="flex flex-wrap justify-between space-x-2">
          <button
            className={`p-2 rounded-lg shadow-md flex-grow ${
              activeStatus === "delivered" ? "bg-white" : "bg-purple-100"
            }`}
            onClick={() => handleStatusClick("delivered")}
          >
            <h3 className="text-sm font-bold text-center">Delivered</h3>
          </button>
          <button
            className={`p-2 rounded-lg shadow-md flex-grow ${
              activeStatus === "pending" ? "bg-white" : "bg-purple-100"
            }`}
            onClick={() => handleStatusClick("pending")}
          >
            <h3 className="text-sm font-bold text-center">Pending</h3>
          </button>
          <button
            className={`p-2 rounded-lg shadow-md flex-grow ${
              activeStatus === "cancelled" ? "bg-white" : "bg-purple-100"
            }`}
            onClick={() => handleStatusClick("cancelled")}
          >
            <h3 className="text-sm font-bold text-center">Cancelled</h3>
          </button>
        </div>
      </div>

      <div>
        {isLoading ? (
          <p>Loading orders...</p>
        ) : currentOrders.length === 0 ? (
          <p>No orders found for the current search or filters.</p>
        ) : (
          <>
            <ul className="space-y-4">
              {currentOrders.map((order) => (
                <li
                  key={order.id}
                  className="bg-gray-100 p-4 rounded-lg shadow-md"
                >
                  <div>
                    <strong>Order ID:</strong> {order.id}
                  </div>
                  <div>
                    <strong>Created At:</strong>{" "}
                    {new Date(order.created_at).toLocaleString()}
                  </div>
                  <div>
                    <strong>Total Amount:</strong> QAR
                    {Number(order.total_amount).toFixed(2)}
                  </div>
                  <div>
                    <strong>Status:</strong> {order.status}
                  </div>
                  <div>
                    <strong>Items:</strong>
                    <ul className="list-disc pl-5">
                      {order.items.map((item, index) => (
                        <li key={index}>
                          Dish ID: {item.dish}, Quantity: {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
            {filteredOrders && filteredOrders.length > ordersPerPage && (
              <div className="flex justify-between mt-4">
                <button
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded disabled:opacity-50"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded disabled:opacity-50"
                  onClick={handleNextPage}
                  disabled={
                    currentPage >=
                    Math.ceil(filteredOrders.length / ordersPerPage)
                  }
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CardDetails;
