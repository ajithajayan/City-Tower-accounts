import React, { useState, useEffect } from "react";
import MenuCards from "./MenuCard";
import CustomMenu from "./CustomMenu";
import SuccessModal from "./SucessModal";
import { api } from "@/services/api";
interface MessType {
  id: number;
  name: string;
}

interface MenuItem {
  id: number;
  dish: {
    name: string;
    price: string | number | null;
    image: string;
  };
  meal_type: string;
}

interface Menu {
  id: number;
  name: string;
  sub_total: string | number;
  menu_items: MenuItem[];
  created_by: string;
}

const AddMembers: React.FC = () => {
  const [customerName, setCustomerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [messType, setMessType] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashAmount, setCashAmount] = useState('');
  const [bankAmount, setBankAmount] = useState('');
  const [menuType, setMenuType] = useState("own_menu");
  const [messTypes, setMessTypes] = useState<MessType[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [paidAmount, setPaidAmount] = useState<string>("");
  const [pendingAmount, setPendingAmount] = useState<string>("");
  const [discountAmount, setDiscountAmount] = useState<string>("0");
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // State for modal visibility
  const [responseData, setResponseData] = useState<any>(null); // State for response data
  const [isPendingManuallyEdited, setIsPendingManuallyEdited] = useState(false);

  useEffect(() => {
    api
      .get<{ results: MessType[] }>("/mess-types/")
      .then((response) => {
        if (Array.isArray(response.data.results)) {
          setMessTypes(response.data.results);
        } else {
          console.error("Unexpected response data:", response.data);
        }
      })
      .catch((error) => console.error("Error fetching mess types:", error));
  }, []);

  useEffect(() => {
    if (menuType && messType !== null) {
      const createdBy = menuType === "custom_menu" ? mobileNumber : "admin";

      api
        .get<{ results: Menu[] }>(`/menus/?mess_type=${messType}&is_custom=${menuType === "custom_menu"}&created_by=${createdBy}`)
        .then((response) => {
          setMenus(response.data.results);
        })
        .catch((error) => console.error("Error fetching menus:", error));
    }
  }, [menuType, messType]);

  useEffect(() => {
    const total = menus.reduce((sum, menu) => sum + parseFloat(menu.sub_total as string), 0);
    setTotalAmount(total * selectedWeek);
  }, [menus, selectedWeek]);

  useEffect(() => {
    const grandTotal = totalAmount - parseFloat(discountAmount || "0");
    setGrandTotal(grandTotal);
  }, [totalAmount, discountAmount]);

  // Automatically calculate pending amount if not manually edited
  useEffect(() => {
    if (!isPendingManuallyEdited) {
      const pending = grandTotal - parseFloat(paidAmount || "0");
      setPendingAmount(pending.toFixed(2));
    }
  }, [paidAmount, grandTotal, discountAmount, isPendingManuallyEdited]);

  useEffect(() => {
    if (startDate && selectedWeek) {
      const start = new Date(startDate);
      start.setDate(start.getDate() + (selectedWeek * 7) - 1);
      setEndDate(start.toISOString().split('T')[0]); // Format as YYYY-MM-DD
    }

  }, [startDate, selectedWeek]);

  const handleDiscountAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDiscountAmount(value);
  };

  const handlePendingAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPendingAmount(e.target.value);
    setIsPendingManuallyEdited(true);
  };

  const menuIds = menuType === "own_menu"
    ? menus.map(menu => menu.id)
    : menus.filter(menu => menu.created_by === mobileNumber).map(menu => menu.id);
  console.log("menuIds", menuIds)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (messType === null) {
      alert("Please select a mess type");
      return;
    }

    const menuIds = menuType === "own_menu"
      ? menus.map(menu => menu.id)
      : menus.filter(menu => menu.created_by === mobileNumber).map(menu => menu.id);

    const newMember = {
      customer_name: customerName,
      mobile_number: mobileNumber,
      start_date: startDate,
      end_date: endDate,
      mess_type_id: messType,
      payment_method: paymentMethod,
      cash_amount: cashAmount !== null && cashAmount !== undefined && cashAmount !== '' ? cashAmount : "0.00",
      bank_amount: bankAmount !== null && bankAmount !== undefined && bankAmount !== '' ? bankAmount : "0.00",
      menu_type: menuType,
      total_amount: totalAmount,
      paid_amount: parseFloat(paidAmount),
      pending_amount: parseFloat(pendingAmount),
      discount_amount: discountAmount,
      grand_total: grandTotal,
      menus: menuIds,
    };

    api
      .post("/messes/", newMember)
      .then((response) => {
        console.log("Member added:", response.data);
        setResponseData(response.data); // Set the response data
        setIsSuccessModalOpen(true); // Open the success modal
        // Reset state
        setCustomerName("");
        setMobileNumber("");
        setStartDate("");
        setEndDate("");
        setMessType(null);
        setPaymentMethod("cash");
        setMenuType("own_menu");
        setTotalAmount(0);
        setDiscountAmount("0");
        setGrandTotal(0);
        setSelectedWeek(1);
        setPaidAmount("");
        setPendingAmount("");
      })
      .catch((error) => console.error("Error adding member:", error));
  };



  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-wrap gap-4">
          {/* Row 1 */}
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
              Customer Name
            </label>
            <input
              id="customerName"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
              Mobile Number
            </label>
            <input
              id="mobileNumber"
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={today}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Row 2 */}
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              readOnly
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label htmlFor="week" className="block text-sm font-medium text-gray-700">
              Select Week
            </label>
            <select
              id="week"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {Array.from({ length: 4 }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label htmlFor="messType" className="block text-sm font-medium text-gray-700">
              Mess Type
            </label>
            <select
              id="messType"
              value={messType || ""}
              onChange={(e) => setMessType(Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="" disabled>
                Select a mess type
              </option>
              {messTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Row 3 */}
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="menuType" className="block text-sm font-medium text-gray-700">
              Menu Type
            </label>
            <select
              id="menuType"
              value={menuType}
              onChange={(e) => setMenuType(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="own_menu">Own Menu</option>
              <option value="custom_menu">Custom Menu</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label htmlFor="paidAmount" className="block text-sm font-medium text-gray-700">
              Paid Amount
            </label>
            <input
              id="paidAmount"
              type="text"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              pattern="[0-9]*"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label htmlFor="pendingAmount" className="block text-sm font-medium text-gray-700">
              Pending Amount
            </label>
            <input
              id="pendingAmount"
              type="text"
              value={pendingAmount}
              onChange={handlePendingAmountChange}
              pattern="[0-9]*"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>


          <div className="flex-1 min-w-[200px]">
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
              Payment Method
            </label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="cash_and_bank">Cash and Bank</option>
            </select>
          </div>

          {paymentMethod === 'cash' && (
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="cashAmount" className="block text-sm font-medium text-gray-700">
                Cash Amount
              </label>
              <input
                type="number"
                id="cashAmount"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          )}

          {paymentMethod === 'bank' && (
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="bankAmount" className="block text-sm font-medium text-gray-700">
                Bank Amount
              </label>
              <input
                type="number"
                id="bankAmount"
                value={bankAmount}
                onChange={(e) => setBankAmount(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          )}

          {paymentMethod === 'cash_and_bank' && (
            <div className="space-y-4">
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="cashAmount" className="block text-sm font-medium text-gray-700">
                  Cash Amount
                </label>
                <input
                  type="number"
                  id="cashAmount"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="bankAmount" className="block text-sm font-medium text-gray-700">
                  Bank Amount
                </label>
                <input
                  type="number"
                  id="bankAmount"
                  value={bankAmount}
                  onChange={(e) => setBankAmount(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          )}

          {/* Row 4 */}
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700">
              Total Amount
            </label>
            <input
              id="totalAmount"
              type="number"
              value={totalAmount}
              readOnly
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Discount Amount */}
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="discountAmount" className="block text-sm font-medium text-gray-700">
              Discount Amount
            </label>
            <input
              id="discountAmount"
              type="text"
              value={discountAmount}
              onChange={handleDiscountAmountChange}
              pattern="[0-9]*"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Grand Total */}
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="grandTotal" className="block text-sm font-medium text-gray-700">
              Grand Total
            </label>
            <input
              id="grandTotal"
              type="text"
              value={grandTotal}
              readOnly
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#6f42c1] transition-all mt-4 hover:bg-purple-600"
        >
          Submit
        </button>
      </form>
      {/* Conditionally Render Components */}
      {menuType === "own_menu" && <MenuCards menus={menus} totalAmount={totalAmount} />}
      {menuType === "custom_menu" && (
        <CustomMenu menus={menus} mobile_number={mobileNumber} onMenuAdded={() => {
          api
            .get<{ results: Menu[] }>(`/menus/?mess_type=${messType}&is_custom=${menuType === "custom_menu"}&created_by=${mobileNumber}`)
            .then((response) => {
              setMenus(response.data.results);
            })
            .catch((error) => console.error("Error fetching updated menus:", error));
        }} />
      )}


      <SuccessModal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} responseData={responseData} />

    </div>
  );
};

export default AddMembers;