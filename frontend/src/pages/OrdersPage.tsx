import React, { lazy, useState, useEffect, useRef } from "react";
import Layout from "../components/Layout/Layout";
import { usePaginatedOrders } from "../hooks/useOrders";
import { useDishes } from "../hooks/useDishes";
import { SearchIcon } from "lucide-react";
import {
  api,
  fetchActiveCreditUsers,
  updateOrderStatusNew,
} from "@/services/api";
import KitchenPrint from "../components/Orders/KitchenPrint";
import SalesPrint from "../components/Orders/SalesPrint";
import { CreditUser } from "@/types";

const OrderCard = lazy(() => import("../components/Orders/OrderCard"));
const PaginationControls = lazy(
  () => import("../components/Layout/PaginationControls")
);

const OrdersPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [creditUsers, setCreditUsers] = useState<CreditUser[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showActionButton, setShowActionButton] = useState<boolean>(false);
  const [printType, setPrintType] = useState<"kitchen" | "sales" | null>(null);
  const [logoInfo, setLogoInfo] = useState<{
    logoUrl: string;
    companyName: string;
    phoneNumber: string;
    location: string;
  } | null>(null);

  useEffect(() => {
    loadCreditCardUsers();
  }, []);

  // Inside your component or useEffect hook where you fetch the data

  useEffect(() => {
    const fetchLogoInfo = async () => {
      try {
        const response = await api.get("/logo-info/");
        const results = response.data.results;
        if (results && results.length > 0) {
          const logoData = {
            logoUrl: results[0].print_logo, // This is where the print logo is located
            companyName: results[0].company_name,
            phoneNumber: results[0].phone_number,
            location: results[0].location,
          };
          setLogoInfo(logoData);
        } else {
          // Handle case when no logo info is available
          setLogoInfo(null);
        }
      } catch (error) {
        console.error("Failed to fetch logo info:", error);
        setLogoInfo(null);
      }
    };

    fetchLogoInfo();
  }, []);

  const loadCreditCardUsers = async () => {
    try {
      const users = await fetchActiveCreditUsers();
      setCreditUsers(users);
    } catch (error) {
      console.error("Failed to load credit card users:", error);
    }
  };

  const {
    data: orders,
    isLoading: ordersLoading,
    isError: ordersError,
    refetch: refetchOrders,
  } = usePaginatedOrders(currentPage);

  const {
    dishes,
    isLoading: dishesLoading,
    isError: dishesError,
  } = useDishes();

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (orders) {
      setFilteredOrders(orders.results);
    }
  }, [orders]);

  useEffect(() => {
    if (orders && searchQuery) {
      const filtered = orders.results.filter((order: any) =>
        order.id.toString().includes(searchQuery)
      );
      setFilteredOrders(filtered);
    } else if (orders) {
      setFilteredOrders(orders.results);
    }
  }, [searchQuery, orders]);

  const handleSearch = () => {
    if (orders && searchQuery) {
      const filtered = orders.results.filter((order: any) =>
        order.id.toString().includes(searchQuery)
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders.results);
    }
  };

  const handleFilterOrders = (status: string) => {
    setStatusFilter(status);
    setSelectedOrders(
      orders.results
        .filter((order: any) => order.status === status)
        .map((order: any) => order.id)
    );
    setShowActionButton(true);

    // Determine the print type and button action based on the status
    if (status === "pending") {
      setPrintType("kitchen");
    } else if (status === "approved") {
      setPrintType("sales");
    }
  };

  // const calculateCashAmount = (orderId: number) => {
  //   const order = filteredOrders.find(order => order.id === orderId);
  //   if (!order) return 0;

  //   // Customize the calculation logic if necessary
  //   return order.total_amount;
  // };

  const handleGenerateKitchenBills = async () => {
    try {
      await Promise.all(
        selectedOrders.map((orderId) =>
          updateOrderStatusNew(orderId, "approved")
        )
      );
      triggerPrint("kitchen");
    } catch (error) {
      console.error("Error generating kitchen bills:", error);
    }
  };

  const handlePrintSalesBills = async () => {
    try {
      // First, update the status of each selected order to "delivered"
      await Promise.all(
        selectedOrders.map(async (orderId) => {
          const order = filteredOrders.find((order) => order.id === orderId);
          if (!order) return null;

          const cashAmount = order.total_amount; // Set the total amount as cash amount

          // Update order status to delivered
          await updateOrderStatusNew(orderId, "delivered", {
            payment_method: "cash",
            cash_amount: cashAmount, // Set cash_amount to the total amount
            bank_amount: 0, // Explicitly set bank_amount to 0
          });

          // Create a bill for each order
          const billsResponse = await api.post("/bills/", {
            order_id: order.id, // Use order_id here
            total_amount: order.total_amount,
            paid: true,
          });

          if (!billsResponse || billsResponse.status !== 201) {
            throw new Error(
              `Failed to create the bill for order ID ${orderId}`
            );
          }
        })
      );

      // Trigger the print for sales bills after updating all orders and creating the bills
      triggerPrint("sales");
    } catch (error) {
      console.error("Error printing sales bills:", error);
    }
  };

  const triggerPrint = (type: "kitchen" | "sales") => {
    if (!type || !printRef.current) return;

    const printWindow = window.open("", "PRINT", "height=600,width=800");

    if (printWindow) {
      printWindow.document.write("<html><head><title>Print</title>");
      printWindow.document.write("<style>");
      printWindow.document.write(`
            body { font-family: Arial, sans-serif; padding: 20px; }
            .bill-container { 
                width: 300px; 
                padding: 20px; 
                border: 2px dashed gray; 
                margin: 0 auto; 
                text-align: left; 
                background-color: #fff;
            }
            h2 { text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 20px; }
            p { margin: 5px 0; font-size: 14px; }
            h4 { margin-top: 20px; font-size: 16px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { padding: 5px 0; }
            th { text-align: left; font-weight: bold; border-bottom: 1px solid #ccc; }
            .kitchen-bill-table td, .sales-bill-table td { padding: 5px 0; }
            .sales-bill-table th, .sales-bill-table td { text-align: right; }
            .sales-bill-table th:nth-child(1), .sales-bill-table td:nth-child(1) { text-align: left; }
            .total-row { font-weight: bold; border-top: 1px solid #ccc; padding-top: 10px; }
            .newly-added { color: red; margin-top: 20px; display: block; text-align: center; }
        `);
      printWindow.document.write("</style>");
      printWindow.document.write("</head><body>");
      printWindow.document.write(printRef.current.innerHTML);
      printWindow.document.write("</body></html>");

      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
        printWindow.close();

        setSelectedOrders([]);
        setShowActionButton(false);

        // Forcefully refresh the page after printing
        window.location.reload();
      }, 100);
    }
  };

  if (ordersLoading || dishesLoading)
    return <Layout>Loading orders and dishes...</Layout>;

  if (ordersError || dishesError)
    return (
      <Layout>Error loading orders or dishes. Please try again later.</Layout>
    );

  if (!dishes || !dishes.results) {
    return <Layout>No dish data available.</Layout>;
  }

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
          Your Orders
        </h1>
        <div className="flex w-full sm:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders by ID..."
            className="border border-gray-300 rounded px-4 py-2 w-full"
          />
          <button
            onClick={handleSearch}
            className="ml-2 text-black rounded p-2 bg-gray-200 hover:bg-gray-300"
          >
            <SearchIcon />
          </button>
        </div>
      </div>

      {/* Buttons for filtering */}
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 justify-between mb-4">
        <button
          onClick={() => handleFilterOrders("pending")}
          className={`w-full sm:w-auto px-4 py-2 rounded-md text-center ${
            statusFilter === "pending"
              ? "bg-blue-700 text-white"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Select All Pending Orders
        </button>

        <button
          onClick={() => handleFilterOrders("approved")}
          className={`w-full sm:w-auto px-4 py-2 rounded-md text-center ${
            statusFilter === "approved"
              ? "bg-yellow-700 text-white"
              : "bg-yellow-500 text-white hover:bg-yellow-600"
          }`}
        >
          Select All Kitchen Orders
        </button>
      </div>

      {/* Centered action button */}
      {showActionButton && selectedOrders.length > 0 && (
        <div className="flex justify-center mb-4">
          <button
            onClick={
              statusFilter === "pending"
                ? handleGenerateKitchenBills
                : handlePrintSalesBills
            }
            className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600"
          >
            {statusFilter === "pending"
              ? "Generate Kitchen Bills"
              : "Print Sales Bills"}
          </button>
        </div>
      )}

      {filteredOrders.length ? (
        <>
          {filteredOrders.map((order: any) => (
            <OrderCard
              key={order.id}
              order={order}
              dishes={dishes.results}
              creditUsers={creditUsers}
              onCreditUserChange={loadCreditCardUsers}
              selectedOrders={selectedOrders}
              onOrderSelection={setSelectedOrders}
              onStatusUpdated={refetchOrders}
              logoInfo={logoInfo}
            />
          ))}
          <PaginationControls
            currentPage={currentPage}
            totalPages={Math.ceil(orders.count / 10)}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <p className="text-gray-600">No orders found for the provided ID.</p>
      )}

      {/* Hidden print area */}
      <div ref={printRef} style={{ display: "none" }}>
        {filteredOrders
          .filter((order: any) => selectedOrders.includes(order.id))
          .map((order: any) => (
            <div key={order.id} style={{ pageBreakAfter: "always" }}>
              {printType === "kitchen" ? (
                <KitchenPrint order={order} dishes={dishes.results} />
              ) : (
                <SalesPrint
                  order={order}
                  dishes={dishes.results}
                  logoInfo={logoInfo}
                />
              )}
            </div>
          ))}
      </div>
    </Layout>
  );
};

export default OrdersPage;
