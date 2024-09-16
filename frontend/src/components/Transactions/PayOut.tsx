import React, { useState, useEffect } from "react";
import LedgerCreationModal from "@/components/modals/LedgerCreationModal";
import CashCountSheetModal from "@/components/modals/CashCountSheetModal";
import { api } from "@/services/api";

interface Ledger {
  id: number;
  name: string;
  mobile_no: string;
  opening_balance: string;
  debit_credit: string;
  group: { name: string };
}

interface CashCountItem {
  currency: string;
  nos: number;
  amount: number;
  created_date: string;
}


interface TransactionData {
  ledger_id: string;
  particulars_id: string;
  date: string;
  debit_amount: number;
  credit_amount: number;
  remarks: string;
  ref_no?: string;
  debit_credit: string;
  transaction_type: "payout";
}

type PayOutRequest = {
  transaction_type: "payout";
  transaction1: TransactionData;
  transaction2: TransactionData;
};

const PayOut: React.FC = () => {
  const [ledgerOptions, setLedgerOptions] = useState<Ledger[]>([]);
  const [selectedExpensePayables, setSelectedExpensePayables] =
    useState<string>("");
  const [selectedParticulars, setSelectedParticulars] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [debitAmount, setDebitAmount] = useState<string>("");
  const [creditAmount, setCreditAmount] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [refNo, setRefNo] = useState<string>("");
  const [cashCountValues, setCashCountValues] = useState<
    CashCountItem[] | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCashCountModalOpen, setIsCashCountModalOpen] =
    useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchAllLedgers = async () => {
      let allLedgers: Ledger[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        try {
          const response = await api.get(`/ledgers/?page=${page}`);
          const data = response.data;
          if (Array.isArray(data.results)) {
            allLedgers = [...allLedgers, ...data.results];
            hasMore = data.next !== null;
            page += 1;
          } else {
            console.error("Unexpected API response format", data);
            hasMore = false;
          }
        } catch (error) {
          console.error("There was an error fetching the ledgers!", error);
          hasMore = false;
        }
      }

      setLedgerOptions(allLedgers);
    };

    fetchAllLedgers();
  }, []);

  const handleOpenCashCountModal = () => setIsCashCountModalOpen(true);

  const handleCloseCashCountModal = (entries: CashCountItem[]) => {
    setCashCountValues(entries);
    setIsCashCountModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const transactionData1: TransactionData = {
      ledger_id: selectedExpensePayables!,
      particulars_id: selectedParticulars!,
      date,
      debit_amount: debitAmount ? parseFloat(debitAmount) : 0,
      credit_amount: 0,
      remarks,
      debit_credit: "debit",
      transaction_type: "payout",
      ref_no: refNo.trim() || undefined,
    };

    const transactionData2: TransactionData = {
      ledger_id: selectedParticulars!,
      particulars_id: selectedExpensePayables!,
      date,
      debit_amount: 0,
      credit_amount: creditAmount ? parseFloat(creditAmount) : 0,
      remarks,
      debit_credit: "credit",
      transaction_type: "payout",
      ref_no: refNo.trim() || undefined,
    };

    const requestData: PayOutRequest = {
      transaction_type: "payout",
      transaction1: transactionData1,
      transaction2: transactionData2,
    };

    try {
      await api.post("/transactions/", requestData);

      if (cashCountValues && cashCountValues.length > 0) {
        const cashSheetData = {
          created_date: date,
          voucher_number: refNo ? parseInt(refNo, 10) : null,
          amount: debitAmount ? parseFloat(debitAmount) : 0,
          transaction_type: "payout",
          items: cashCountValues,
        };

        await api.post("/cashsheet/", cashSheetData);
      }

      setSelectedExpensePayables("");
      setSelectedParticulars("");
      setDate("");
      setDebitAmount("");
      setCreditAmount("");
      setRemarks("");
      setRefNo("");
      setCashCountValues(null);
    } catch (error) {
      console.error("Error posting transactions or cash count", error);
      setError(
        "There was an error submitting the transaction. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const refreshLedgerOptions = async () => {
    let allLedgers: Ledger[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await api.get(`/ledgers/?page=${page}`);
        const data = response.data;
        if (Array.isArray(data.results)) {
          allLedgers = [...allLedgers, ...data.results];
          hasMore = data.next !== null;
          page += 1;
        } else {
          console.error("Unexpected API response format", data);
          hasMore = false;
        }
      } catch (error) {
        console.error("There was an error fetching the ledgers!", error);
        hasMore = false;
      }
    }

    setLedgerOptions(allLedgers);
  };

  return (
    <div className="bg-blue-100 p-6 rounded-lg shadow-lg">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">Pay Out</h1>
        <div className="space-x-4">
          <button
            onClick={handleOpenModal}
            className="bg-[#6f42c1] text-white py-2 px-4 rounded shadow hover:bg-[#5a2d91]"
          >
            Create Ledger
          </button>
          <button
            onClick={handleOpenCashCountModal}
            className="bg-blue-500 text-white py-2 px-4 rounded shadow hover:bg-blue-600"
          >
            Cash Count
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Flexbox for Date and Reference No. */}
        <div className="flex justify-between gap-4">
          {/* Date Field */}
          <div className="flex-1 max-w-xs">
            <label className="block text-lg font-semibold mb-1 text-black">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full"
              required
            />
          </div>

          {/* Reference No. Field */}
          <div className="flex-1 max-w-xs">
            <label className="block text-lg font-semibold mb-1 text-black">
              Reference No.
            </label>
            <input
              type="text"
              value={refNo}
              onChange={(e) => setRefNo(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full"
            />
          </div>
        </div>

        {/* Rest of the form in grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Expense/Payables Field */}
          <div>
            <label className="block text-lg font-semibold mb-1">
              Expense/Payables
            </label>
            <select
              value={selectedExpensePayables}
              onChange={(e) => setSelectedExpensePayables(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full"
              required
            >
              <option value="">Select a ledger</option>
              {ledgerOptions.map((ledger) => (
                <option key={ledger.id} value={ledger.id}>
                  {ledger.name}
                </option>
              ))}
            </select>
          </div>

          {/* Debit Amount Field */}
          <div>
            <label className="block text-lg font-semibold mb-1">
              Debit Amount
            </label>
            <input
              type="number"
              value={debitAmount}
              onChange={(e) => setDebitAmount(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full"
              step="0.01"
              required
            />
          </div>

          {/* Cash/Bank/Creditors Field */}
          <div>
            <label className="block text-lg font-semibold mb-1">
              Cash/Bank/Creditors
            </label>
            <select
              value={selectedParticulars}
              onChange={(e) => setSelectedParticulars(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full"
              required
            >
              <option value="">Select a ledger</option>
              {ledgerOptions.map((ledger) => (
                <option key={ledger.id} value={ledger.id}>
                  {ledger.name}
                </option>
              ))}
            </select>
          </div>

          {/* Credit Amount Field */}
          <div>
            <label className="block text-lg font-semibold mb-1">
              Credit Amount
            </label>
            <input
              type="number"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full"
              step="0.01"
              required
            />
          </div>
        </div>

        {/* Remarks Field */}
        <div>
          <label className="block text-lg font-semibold mb-1">Remarks</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full"
            rows={3}
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#6f42c1] text-white py-2 px-4 rounded shadow hover:bg-[#5a2d91]"
        >
          {isSubmitting ? "Processing..." : "Submit"}
        </button>

        {/* Error Message */}
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>

      <LedgerCreationModal
        isOpen={isModalOpen}
        refreshLedgerOptions={refreshLedgerOptions}
        onClose={handleCloseModal}
      />

      <CashCountSheetModal
        isOpen={isCashCountModalOpen}
        onClose={(data: any) => handleCloseCashCountModal(data)}
        onSubmit={(data: any) => setCashCountValues(data)}
      />
    </div>
  );
};

export default PayOut;
