import React, { useState, useRef } from "react";
import Swal from "sweetalert2";
import { Order, Dish, CreditUser } from "../../types";
import OrderItems from "./OrderItems";
import { useReactToPrint } from "react-to-print";
import KitchenPrint from "./KitchenPrint";
import SalesPrint from "./SalesPrint";
import AddProductModal from "./AddProductModal";
import PrintConfirmationModal from "./PrintConfirmationModal";
import { api, updateOrderStatusNew} from "../../services/api";
import ReactSelect from "react-select";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { BadgeInfo, Bike, Mail, Phone, PlusCircle } from "lucide-react";
import { CreditUserModal } from "../modals/CreditUserModal";
import { Button } from "../ui/button"; // Assuming you have a Button component
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"; // Assuming you have Popover components
import { ChevronsUpDown, Check } from "lucide-react"; // Icons from lucide-react library
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command"; // Assuming you have a Command component and related subcomponents
import { DeliveryDriver } from "@/types";
import { useQuery } from "react-query";
import { fetchDeliveryDrivers } from "@/services/api";
// import { string } from "yup";
// import { object } from "yup";

interface OrderCardProps {
  order: Order;
  dishes: Dish[];
  creditUsers: CreditUser[];
  onCreditUserChange: () => void;
  selectedOrders: number[];
  onOrderSelection: (selectedOrderIds: number[]) => void;
  onStatusUpdated: () => void;
  logoInfo: {
    logoUrl: string;
    companyName: string;
    phoneNumber: string;
    location: string;
  } | null;
}

type OrderType = "dining" | "takeaway" | "delivery" | string;

type PaymentType = "cash" | "bank" | "cash-bank" | "credit" | string;

const OrderCard: React.FC<OrderCardProps> = ({
  order: initialOrder,
  dishes,
  creditUsers,
  selectedOrders,
  onOrderSelection,
  onStatusUpdated,
  onCreditUserChange,
  logoInfo,
}) => {
  const [status, setStatus] = useState(initialOrder.status);
  const [showModal, setShowModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPrintConfirmationModal, setShowPrintConfirmationModal] =
    useState(false);
  const [billType, setBillType] = useState<"kitchen" | "sales">("kitchen");
  const [paymentMethod, setPaymentMethod] = useState<PaymentType>("cash");
  const [cashAmount, setCashAmount] = useState(0);
  const [bankAmount, setBankAmount] = useState(0);
  const [order, setOrder] = useState<Order>(initialOrder);

  const kitchenPrintRef = useRef(null);
  const salesPrintRef = useRef(null);
  const [selectedCreditUser, setSelectedCreditUser] =
    useState<CreditUser | null>(null);
  const [isCreditUserModalOpen, setIsCreditUserModalOpen] = useState(false);

  // for changing the order type
  // const orderTypeDisplay = order?.order_type || "N/A";
  // type OrderType = "dining" | "takeaway" | "delivery";

  const [showOrderTypeModal, setShowOrderTypeModal] = useState(false);
  const [newOrderType, setNewOrderType] = useState<OrderType>(order.order_type);
  const [customerName, setCustomerName] = useState<string>("");
  const [deliveryAddress, setDeliveryAddress] = useState<string>("");
  const [customerMobileNumber, setCustomerMobileNumber] = useState<string>("");
  const [deliveryCharge, setDeliveryCharge] = useState<string>("0.00");
  const [selectedDriver, setSelectedDriver] = useState<DeliveryDriver | null>(
    null
  );
  const [openDriverSelect, setOpenDriverSelect] = useState<boolean>(false);

  const {
    data: deliveryDriversList
  } = useQuery<{ results: DeliveryDriver[] }>(
    "deliveryDrivers",
    fetchDeliveryDrivers
  );

  // Separate print handlers
  const handlePrintKitchenBill = useReactToPrint({
    content: () => kitchenPrintRef.current,
  });

  const handlePrintSalesBill = useReactToPrint({
    content: () => salesPrintRef.current,
  });

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = e.target.value;
    // setStatus(newStatus);

    if (newStatus === "approved") {
      setBillType("kitchen");
      setShowModal(true);
      setStatus(newStatus);
      console.log(newStatus);

      try {
        await updateOrderStatusNew(order.id, "approved");
        onStatusUpdated(); // Refresh orders after status change
      } catch (error) {
        console.error("Error updating status to approved:", error);
        Swal.fire("Error", "Failed to update status to approved.", "error");
      }
    } else if (newStatus === "delivered") {
      setShowPaymentModal(true);
    } else if (newStatus === "cancelled") {
      Swal.fire({
        title: "Are you sure?",
        text: "Do you want to cancel the order?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, cancel it!",
        cancelButtonText: "No, keep it",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await updateOrderStatusNew(order.id, "cancelled");
            setStatus("cancelled");
            Swal.fire("Cancelled!", "The order has been cancelled.", "success");
            onStatusUpdated(); // Refresh orders after status change
          } catch (error) {
            console.error("Error cancelling order:", error);
            Swal.fire(
              "Error",
              "There was an error cancelling the order.",
              "error"
            );
          }
        } else {
          setStatus(order.status); // Revert to previous status if canceled
        }
      });
    } else {
      try {
        await updateOrderStatusNew(order.id, newStatus as "pending" | "approved" | "cancelled" | "delivered");
        onStatusUpdated(); // Refresh orders after status change
      } catch (error) {
        console.error("Error updating status:", error);
        setStatus(order.status); // Revert status if update failed
      }
    }
  };

  const handleOrderSelection = () => {
    onOrderSelection(
      selectedOrders.includes(order.id)
        ? selectedOrders.filter((id) => id !== order.id)
        : [...selectedOrders, order.id]
    );
  };

  const disableAllActions = () => {
    setShowModal(false);
    setShowAddProductModal(false);
    setShowPaymentModal(false);
  };

  const handleAddProductSubmit = async (
    products: { dish: Dish; quantity: number }[]
  ) => {
    try {
      const newTotalAmount = products.reduce(
        (sum, product) => sum + product.quantity * product.dish.price,
        order.total_amount // Start from the existing total amount
      );

      const response = await api.put(`/orders/${order.id}/`, {
        items: products.map((product) => ({
          dish: product.dish.id,
          quantity: product.quantity,
          total_amount: product.quantity * product.dish.price,
          is_newly_added: true, // Mark as newly added
        })),
        total_amount: newTotalAmount.toFixed(2),
      });

      if (response.status === 200) {
        setShowAddProductModal(false);

        // Fetch the updated order data after adding the product
        const updatedOrderResponse = await api.get(`/orders/${order.id}/`);
        if (updatedOrderResponse.status === 200) {
          const updatedOrder = updatedOrderResponse.data;
          setOrder(updatedOrder);
        }
        onStatusUpdated(); // Refresh orders after adding product
      }
    } catch (error) {
      console.error("Failed to add products to the order:", error);
    }
  };

  const handleGenerate = () => {
    if (billType === "kitchen") {
      handlePrintKitchenBill();
    } else {
      handlePrintSalesBill();
    }
    setShowModal(false);
    onStatusUpdated(); // Refresh orders after status change
  };

  const handlePaymentMethodChange = (method: PaymentType) => {
    setPaymentMethod(method);
    if (method === "cash-bank") {
      setCashAmount(order.total_amount / 2);
      setBankAmount(order.total_amount / 2);
    } else {
      setCashAmount(order.total_amount);
      setBankAmount(0);
    }
  };

  const handleCashAmountChange = (amount: number) => {
    if (amount < 0) {
      amount = 0;
    }
    if (amount > order.total_amount) {
      amount = order.total_amount;
    }
    setCashAmount(amount);
    setBankAmount(order.total_amount - amount);
  };

  const handlePaymentSubmit = async () => {
    try {
      let additionalData;

      // Prepare the payload based on the selected payment method
      if (paymentMethod === "cash") {
        additionalData = {
          payment_method: "cash",
          cash_amount: order.total_amount, // Set the entire amount to cash
          bank_amount: 0, // Explicitly set to 0 to avoid NULL constraint issues
        };
      } else if (paymentMethod === "bank") {
        additionalData = {
          payment_method: "bank",
          cash_amount: 0, // Explicitly set to 0
          bank_amount: order.total_amount, // Set the entire amount to bank
        };
      } else if (paymentMethod === "cash-bank") {
        additionalData = {
          payment_method: "cash-bank",
          cash_amount: cashAmount,
          bank_amount: bankAmount,
        };
      } else if (paymentMethod === "credit") {
        additionalData = {
          payment_method: "credit",
          cash_amount: 0, // Explicitly set to 0
          bank_amount: 0, // Explicitly set to 0
          credit_user_id: selectedCreditUser
            ? selectedCreditUser.id
            : undefined,
        };
      }

      // Send the updated status and additional payment-related data to the API

      const response = await updateOrderStatusNew(
        order.id,
        "delivered",
        additionalData
      );

      if (response && response.detail) {
        // Ensure the API call was successful
        // Call the bills API after successful status update
        const billsResponse = await api.post("/bills/", {
          order_id: order.id, // Use order_id here
          total_amount: order.total_amount,
          paid: true,
        });

        if (billsResponse && billsResponse.status === 201) {
          setShowPaymentModal(false);
          setStatus("delivered");
          disableAllActions();

          // Trigger the print confirmation modal
          setShowPrintConfirmationModal(true);

          // Trigger the order list refresh after payment submission
          onStatusUpdated(); // Refresh orders after status change
          window.location.reload();
        } else {
          throw new Error("Failed to create the bill");
        }
      } else {
        throw new Error("Failed to update the order status");
      }
      setShowPaymentModal(false);
      setStatus("delivered");
      disableAllActions();

      // Trigger the print confirmation modal
      setShowPrintConfirmationModal(true);

      // Trigger the order list refresh after payment submission
      onStatusUpdated(); // Refresh orders after status change
    } catch (error) {
      console.error("Failed to update payment method and status:", error);
      Swal.fire(
        "Error",
        "Failed to process the payment and update status.",
        "error"
      );
    }
  };

  const handlePrintConfirmation = () => {
    setBillType("sales");
    setShowModal(true); // Show the print modal
    setShowPrintConfirmationModal(false); // Close the print confirmation modal
  };

  const handleCreditUserCreated = (newCreditUser: CreditUser | undefined) => {
    if (newCreditUser) {
      setSelectedCreditUser(newCreditUser);
    }
    onCreditUserChange();
  };

  // for changing the order type
  const handleOrderTypeChange = async () => {
    if (order.status === "delivered") {
      Swal.fire(
        "Error",
        "You cannot change the order type after it is delivered.",
        "error"
      );
      return;
    }

    const deliveryData =
      newOrderType === "delivery"
        ? {
            customer_name: customerName,
            address: deliveryAddress,
            customer_phone_number: customerMobileNumber,
            delivery_charge: parseFloat(deliveryCharge),
            delivery_driver_id: selectedDriver?.id,
            delivery_order_status: "pending",
          }
        : {};

    try {
      const response = await api.put(`/order-type/${order.id}/change-type/`, {
        order_type: newOrderType,
        ...deliveryData,
      });

      if (response.status === 200) {
        const updatedOrderData = response.data;
        setOrder(updatedOrderData);
        setShowOrderTypeModal(false);
        window.location.reload();
      } else {
        Swal.fire("Error", "Failed to update order type.", "error");
      }
    } catch (error) {
      console.error("Failed to update order type:", error);
      Swal.fire("Error", "Failed to update order type.", "error");
    }
  };

  return (
    <div
      key={order.id}
      className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-200"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={selectedOrders.includes(order.id)}
            onChange={handleOrderSelection}
            className="mr-4 w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            Order #{order.id}
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-0">
          {/* Print Icon for Kitchen Bill */}
          {status === "approved" && (
            <button
              onClick={handlePrintKitchenBill}
              className="text-gray-700 hover:text-blue-500 focus:outline-none"
              title="Print Kitchen Bill"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 9V2h12v7M6 18h12v5H6v-5zm2-3h8v3H8v-3zM6 11h12v4H6v-4z"
                ></path>
              </svg>
            </button>
          )}

          {/* Print Icon for Sales Bill */}
          {status === "delivered" && (
            <button
              onClick={handlePrintSalesBill}
              className="text-green-500 hover:text-gray-700 focus:outline-none"
              title="Print Sales Bill"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 9V2h12v7M6 18h12v5H6v-5zm2-3h8v3H8v-3zM6 11h12v4H6v-4z"
                ></path>
              </svg>
            </button>
          )}

          <select
            value={status}
            onChange={handleStatusChange}
            className="border rounded-md p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={status === "delivered" || status === "cancelled"}
          >
            <option value="pending" disabled={status === "approved"}>
              Pending
            </option>
            <option value="approved">Kitchen Bill</option>
            <option value="cancelled">Cancelled</option>
            <option value="delivered">Order Success</option>
          </select>

          <button
            onClick={() => setShowAddProductModal(true)}
            className={`w-full sm:w-auto px-4 py-2 rounded-md flex items-center transition 
    ${
      status === "delivered" || status === "cancelled"
        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
        : "bg-blue-500 text-white hover:bg-blue-600"
    }`}
            disabled={status === "delivered" || status === "cancelled"}
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
            Add Product
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Ordered on: {new Date(order.created_at).toLocaleString()}
      </p>

      <div className="space-y-3">
        {order.items && Array.isArray(order.items) && order.items.length > 0 ? (
          order.items.map((item, index) => (
            <OrderItems
              key={index}
              orderItem={item}
              dishes={dishes}
              isNewlyAdded={item.is_newly_added} // Pass the newly added status
            />
          ))
        ) : (
          <p>No items found for this order.</p> // You can display a message or handle it in another way
        )}
      </div>
      <div className="mt-4 flex justify-between items-center">
        {order?.order_type === "delivery" && (
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="link">
                <BadgeInfo size={16} className="mr-1" />
                <span>Delivery Status</span>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-48 p-4">
              <div className="space-y-2">
                {/* Delivery Status */}
                <div className="flex items-center space-x-2">
                  {order?.delivery_order_status === "pending" ? (
                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  ) : order?.delivery_order_status === "delivered" ? (
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                  ) : order?.delivery_order_status === "accepted" ||
                    order?.delivery_order_status === "in_progress" ? (
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                  )}
                  <span className="text-sm font-semibold capitalize">
                    {order?.delivery_order_status?.replace("_", " ")}
                  </span>
                </div>

                {/* Delivery Driver Details */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Bike size={16} className="text-gray-500" />
                    <span className="text-sm font-medium">
                      {order?.delivery_driver?.username}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone size={16} className="text-gray-500" />
                    <span className="text-sm font-medium">
                      {order?.delivery_driver?.mobile_number}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail size={16} className="text-gray-500" />
                    <span className="text-sm font-medium">
                      {order?.delivery_driver?.email}
                    </span>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="flex flex-col justify-between items-start pt-2 border-t mt-2">
                  <div>
                    <div className="text-sm font-bold">
                      {order?.customer_phone_number}
                    </div>
                    <div className="text-sm font-bold">{order?.address}</div>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        )}

        {order?.order_type !== "delivery" && (
          <button
            className="font-bold italic"
            onClick={() => setShowOrderTypeModal(true)}
          >
            {order?.order_type?.charAt(0).toUpperCase() +
              order?.order_type?.slice(1)}
          </button>
        )}

        <span className="text-lg font-semibold text-gray-800">
          Total: QAR {order.total_amount}
        </span>
        {/* <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            {order.order_type}
          </h2> */}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {billType === "kitchen" ? "Kitchen Bill" : "Sales Bill"}
            </h3>
            {status === "delivered" && (
              <select
                value={billType}
                onChange={(e) =>
                  setBillType(e.target.value as "kitchen" | "sales")
                }
                className="border rounded-md p-2 w-full mb-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="sales">Sales Bill</option>
                <option value="kitchen">Kitchen Bill</option>
              </select>
            )}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
                disabled={!billType}
              >
                Generate Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <AddProductModal
          onClose={() => setShowAddProductModal(false)}
          onSubmit={handleAddProductSubmit}
        />
      )}

      {/* Add the Print Confirmation Modal */}
      <PrintConfirmationModal
        isOpen={showPrintConfirmationModal}
        onClose={() => setShowPrintConfirmationModal(false)}
        onPrint={handlePrintConfirmation}
      />

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Choose Payment Method
            </h3>
            <select
              value={paymentMethod}
              onChange={(e) => handlePaymentMethodChange(e.target.value)}
              className="border rounded-md p-2 w-full mb-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="cash-bank">Cash with Bank</option>
              <option value="credit">Credit</option>
            </select>

            {paymentMethod === "cash-bank" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">
                    Cash Amount
                  </label>
                  <input
                    type="number"
                    value={cashAmount}
                    onChange={(e) =>
                      handleCashAmountChange(Number(e.target.value))
                    }
                    className="border rounded-md p-2 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">
                    Bank Amount
                  </label>
                  <input
                    type="number"
                    value={bankAmount}
                    readOnly
                    className="border rounded-md p-2 w-full text-gray-700 bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {paymentMethod === "credit" && (
              <div className="mt-4">
                <div className="flex justify-between">
                  <label className="block text-gray-700 mb-1">
                    Select Credit User
                  </label>
                  <PlusCircle
                    size={24}
                    className="cursor-pointer"
                    onClick={() => setIsCreditUserModalOpen(true)}
                  />
                </div>
                <ReactSelect
                  options={creditUsers.map((user) => ({
                    value: user.id,
                    label: user.username,
                  }))}
                  value={
                    selectedCreditUser
                      ? {
                          value: selectedCreditUser.id,
                          label: selectedCreditUser.username,
                        }
                      : null
                  }
                  onChange={(selectedOption) =>
                    setSelectedCreditUser(
                      creditUsers.find(
                        (user) => user.id === selectedOption?.value
                      ) || null
                    )
                  }
                  placeholder="Search for a credit user..."
                  isSearchable
                />
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentSubmit}
                className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
      {/* credit modal for selecting credit users */}
      <CreditUserModal
        isOpen={isCreditUserModalOpen}
        onClose={() => setIsCreditUserModalOpen(false)}
        creditUserId={null}
        onCreditUserChange={handleCreditUserCreated}
      />

      {/* modal for changing the order type */}
      {showOrderTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-96 transform transition-all duration-300 ease-out">
            <h3 className="text-xl font-bold mb-6 text-gray-900">
              Change Order Type
            </h3>

            <div className="space-y-4">
              {/* Radio buttons to select order type */}
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="orderType"
                  value="dining"
                  checked={newOrderType === "dining"}
                  onChange={(e) => setNewOrderType(e.target.value)}
                  className="h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 rounded-full transition duration-200 ease-in-out"
                />
                <span className="text-base text-gray-700">Dining</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="orderType"
                  value="takeaway"
                  checked={newOrderType === "takeaway"}
                  onChange={(e) => setNewOrderType(e.target.value)}
                  className="h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 rounded-full transition duration-200 ease-in-out"
                />
                <span className="text-base text-gray-700">Takeaway</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="orderType"
                  value="delivery"
                  checked={newOrderType === "delivery"}
                  onChange={(e) => setNewOrderType(e.target.value)}
                  className="h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 rounded-full transition duration-200 ease-in-out"
                />
                <span className="text-base text-gray-700">Delivery</span>
              </label>

              {/* If the selected order type is delivery, show additional fields */}
              {newOrderType === "delivery" && (
                <div className="mt-6 space-y-4">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="customerName"
                      className="text-sm font-medium text-gray-700"
                    >
                      Customer Name
                    </label>
                    <input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                      className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="deliveryAddress"
                      className="text-sm font-medium text-gray-700"
                    >
                      Delivery Address
                    </label>
                    <input
                      id="deliveryAddress"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter delivery address"
                      className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="customerMobileNumber"
                      className="text-sm font-medium text-gray-700"
                    >
                      Customer Number
                    </label>
                    <input
                      id="customerMobileNumber"
                      value={customerMobileNumber}
                      onChange={(e) => setCustomerMobileNumber(e.target.value)}
                      placeholder="Enter customer contact number"
                      className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="deliveryCharge"
                      className="text-sm font-medium text-gray-700"
                    >
                      Delivery Charge
                    </label>
                    <input
                      id="deliveryCharge"
                      value={deliveryCharge}
                      onChange={(e) => setDeliveryCharge(e.target.value)}
                      placeholder="Enter delivery charge"
                      className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Select Delivery Driver
                    </label>
                    <Popover
                      open={openDriverSelect}
                      onOpenChange={setOpenDriverSelect}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="p-2 border border-gray-300 rounded-md bg-white w-full text-left text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-between items-center"
                        >
                          {selectedDriver
                            ? selectedDriver.username
                            : "Select driver..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full m-10">
                        <Command>
                          <CommandInput placeholder="Search drivers..." />
                          <CommandList>
                            <CommandEmpty>No driver found.</CommandEmpty>
                            <CommandGroup>
                              {deliveryDriversList?.results?.map((driver) => (
                                <CommandItem
                                  key={driver.id}
                                  value={driver.username}
                                  onSelect={() => {
                                    setSelectedDriver(driver);
                                    setOpenDriverSelect(false);
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      selectedDriver?.id === driver.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    }`}
                                  />
                                  {driver.username}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowOrderTypeModal(false)}
                  className="px-5 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors duration-200 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOrderTypeChange}
                  className="px-5 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 ease-in-out"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="hidden">
        <div ref={kitchenPrintRef}>
          <KitchenPrint order={order} dishes={dishes} />
        </div>
        <div ref={salesPrintRef}>
          <SalesPrint order={order} dishes={dishes} logoInfo={logoInfo} />
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
