import { useState, useEffect } from "react";
import { api } from "@/services/api";

// Define the Menu type
interface Menu {
  id: number;
  sub_total: string; // Assuming sub_total is stored as a string, adjust if needed
}

// Define the Member type
interface Member {
  id: number;
  customer_name: string;
  mess_type: {
    id: number;
  };
}

// Define the prop types for the RenewMessModal component
interface RenewMessModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  onRenew: () => void;
}

const RenewMessModal: React.FC<RenewMessModalProps> = ({ isOpen, onClose, member, onRenew }) => {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [menus, setMenus] = useState<Menu[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState("0");
  const [paidAmount, setPaidAmount] = useState("0");
  const [pendingAmount, setPendingAmount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashAmount, setCashAmount] = useState("0.00");
  const [bankAmount, setBankAmount] = useState("0.00");

  useEffect(() => {
    if (member && member.mess_type) {
      api
        .get(`/menus/?mess_type=${member.mess_type.id}`)
        .then((response) => {
          setMenus(response.data.results || []);
        })
        .catch((error) => console.error("Error fetching menus:", error));
    }
  }, [member]);

  useEffect(() => {
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(startDateObj.getDate() + selectedWeek * 7);
    setEndDate(endDateObj.toISOString().split("T")[0]);
  }, [selectedWeek, startDate]);

  useEffect(() => {
    const weeklyTotal = menus.reduce((sum, menu) => sum + parseFloat(menu.sub_total || "0"), 0);
    const total = weeklyTotal * selectedWeek;
    setTotalAmount(total);
  }, [menus, selectedWeek]);

  useEffect(() => {
    const grandTotal = totalAmount - parseFloat(discountAmount || "0");
    setGrandTotal(grandTotal);
  }, [totalAmount, discountAmount]);

  useEffect(() => {
    const pending = grandTotal - parseFloat(paidAmount || "0");
    setPendingAmount(pending.toFixed(2));
  }, [paidAmount, grandTotal]);

  useEffect(() => {
    if (paymentMethod === "cash_and_bank") {
      const bankBalance = grandTotal - parseFloat(cashAmount || "0");
      setBankAmount(bankBalance.toFixed(2));
    } else {
      setCashAmount(paidAmount);
      setBankAmount("0.00");
    }
  }, [cashAmount, grandTotal, paymentMethod, paidAmount]);

  const handleRenew = () => {
    const updatedMember = {
      ...member,
      start_date: startDate,
      end_date: endDate,
      mess_type_id: member.mess_type.id, // Ensure you're sending the ID of the mess_type
      total_amount: totalAmount.toFixed(2),
      grand_total: grandTotal.toFixed(2),
      discount_amount: discountAmount,
      paid_amount: paidAmount,
      pending_amount: pendingAmount,
      payment_method: paymentMethod,
      cash_amount: cashAmount,
      bank_amount: bankAmount,
      menus: menus.map((menu) => menu.id),
    };

    api
      .put(`/messes/${member.id}/`, updatedMember)
      .then(() => {
        onRenew();
        onClose();
      })
      .catch((error) => console.error("Error renewing mess:", error));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Renew Mess for {member.customer_name}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="week" className="block text-sm font-medium text-gray-700">
              Select Weeks
            </label>
            <select
              id="week"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            >
              {Array.from({ length: 4 }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1} Week(s)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              readOnly
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600"
            />
          </div>

          <div>
            <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700">
              Total Amount
            </label>
            <input
              id="totalAmount"
              type="number"
              value={totalAmount}
              readOnly
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600"
            />
          </div>

          <div>
            <label htmlFor="discountAmount" className="block text-sm font-medium text-gray-700">
              Discount Amount
            </label>
            <input
              id="discountAmount"
              type="text"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="grandTotal" className="block text-sm font-medium text-gray-700">
              Grand Total
            </label>
            <input
              id="grandTotal"
              type="text"
              value={grandTotal}
              readOnly
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600"
            />
          </div>

          <div>
            <label htmlFor="paidAmount" className="block text-sm font-medium text-gray-700">
              Paid Amount
            </label>
            <input
              id="paidAmount"
              type="text"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="pendingAmount" className="block text-sm font-medium text-gray-700">
              Pending Amount
            </label>
            <input
              id="pendingAmount"
              type="text"
              value={pendingAmount}
              readOnly
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600"
            />
          </div>

          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
              Payment Method
            </label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="cash_and_bank">Cash and Bank</option>
            </select>
          </div>

          {paymentMethod === "cash_and_bank" && (
            <>
              <div>
                <label htmlFor="cashAmount" className="block text-sm font-medium text-gray-700">
                  Cash Amount
                </label>
                <input
                  type="number"
                  id="cashAmount"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="bankAmount" className="block text-sm font-medium text-gray-700">
                  Bank Amount
                </label>
                <input
                  type="number"
                  id="bankAmount"
                  value={bankAmount}
                  readOnly
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600"
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleRenew}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Renew
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenewMessModal;
