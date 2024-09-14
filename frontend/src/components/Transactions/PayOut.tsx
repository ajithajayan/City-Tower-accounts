import React, { useState, useEffect } from "react";
import LedgerCreationModal from "@/components/modals/LedgerCreationModal";
import CashCountSheetModal from "@/components/modals/CashCountSheetModal"; // Import your Cash Count modal
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
}

type PayOutRequest = {
  transaction1: TransactionData;
  transaction2: TransactionData;
};

const PayOut: React.FC = () => {
  const [ledgerOptions, setLedgerOptions] = useState<Ledger[]>([]);
  const [selectedExpensePayables, setSelectedExpensePayables] = useState<string>("");
  const [selectedParticulars, setSelectedParticulars] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [debitAmount, setDebitAmount] = useState<string>("");
  const [creditAmount, setCreditAmount] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [refNo, setRefNo] = useState<string>("");
  const [cashCountValues, setCashCountValues] = useState<CashCountItem[] | null>(null); // Cash Count values
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCashCountModalOpen, setIsCashCountModalOpen] = useState<boolean>(false); // Track Cash Count modal state
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
            hasMore = data.next !== null; // Check if there's another page
            page += 1; // Move to the next page
          } else {
            console.error("Unexpected API response format", data);
            hasMore = false;
          }
        } catch (error) {
          console.error("There was an error fetching the ledgers!", error);
          hasMore = false;
        }
      }

      console.log("Fetched ledgers:", allLedgers);
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
    if (isSubmitting) return; // Prevent multiple submissions

    setIsSubmitting(true); // Set submitting state
    setError(null); // Reset any previous errors

    const transactionData1: TransactionData = {
      ledger_id: selectedExpensePayables!,
      particulars_id: selectedParticulars!,
      date,
      debit_amount: debitAmount ? parseFloat(debitAmount) : 0,
      credit_amount: 0,
      remarks,
      debit_credit: "debit",
      ref_no: refNo.trim() || undefined, // Set ref_no only if it's not empty
    };

    const transactionData2: TransactionData = {
      ledger_id: selectedParticulars!,
      particulars_id: selectedExpensePayables!,
      date,
      debit_amount: 0,
      credit_amount: creditAmount ? parseFloat(creditAmount) : 0,
      remarks,
      debit_credit: "credit",
      ref_no: refNo.trim() || undefined, // Set ref_no only if it's not empty
    };

    const requestData: PayOutRequest = {
      transaction1: transactionData1,
      transaction2: transactionData2,
    };

    try {
      // Submit both transactions
      console.log("Posting transactions with data:", requestData);
      await api.post("/transactions/", requestData);
      console.log("Transactions posted successfully");

      // Debugging: Log the cash count values
      console.log("Cash Count Values:", cashCountValues);

      // Now handle Cash Count submission (similar to PayIn)
      if (cashCountValues && cashCountValues.length > 0) {
        const cashSheetData = {
          created_date: date,
          voucher_number: refNo ? parseInt(refNo, 10) : null,
          amount: debitAmount ? parseFloat(debitAmount) : 0, // Total cash amount
          transaction_type: "payout",
          items: cashCountValues, // Cash count details
        };

        console.log("Submitting Cash Sheet Data:", cashSheetData);

        await api.post("/cashsheet/", cashSheetData); // Post Cash Count Sheet details
        console.log("Cash Count Sheet posted successfully");
      } else {
        console.log("No cash count values to submit.");
      }

      // Reset form fields
      setSelectedExpensePayables("");
      setSelectedParticulars("");
      setDate("");
      setDebitAmount("");
      setCreditAmount("");
      setRemarks("");
      setRefNo("");
      setCashCountValues(null); // Reset Cash Count state
    } catch (error) {
      console.error("Error posting transactions or cash count", error);
      setError("There was an error submitting the transaction. Please try again.");
    } finally {
      setIsSubmitting(false); // Reset submitting state
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

    console.log("Fetched ledgers:", allLedgers);
    setLedgerOptions(allLedgers);
  };

  return (
    <div className="bg-blue-200 p-4">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">Pay Out</h1>
        <button
          onClick={handleOpenModal}
          className="bg-[#6f42c1] text-white py-2 px-4 rounded w-full sm:w-auto"
        >
          Create Ledger
        </button>
        <button
          onClick={handleOpenCashCountModal} // Button to open Cash Count modal
          className="bg-[#6f42c1] text-white py-2 px-4 rounded w-full sm:w-auto ml-2"
        >
          Cash Count
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-lg font-bold">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded p-2 w-full"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-lg font-bold">Reference No.</label>
            <input
              type="text"
              value={refNo}
              onChange={(e) => setRefNo(e.target.value)}
              className="border rounded p-2 w-full"
            />
          </div>

          <div>
            <label className="block mb-2 text-lg font-bold">Expense/Payables</label>
            <select
              value={selectedExpensePayables}
              onChange={(e) => setSelectedExpensePayables(e.target.value)}
              className="border rounded p-2 w-full"
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

          <div>
            <label className="block mb-2 text-lg font-bold">Particulars</label>
            <select
              value={selectedParticulars}
              onChange={(e) => setSelectedParticulars(e.target.value)}
              className="border rounded p-2 w-full"
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

          <div>
            <label className="block mb-2 text-lg font-bold">Debit Amount</label>
            <input
              type="number"
              value={debitAmount}
              onChange={(e) => setDebitAmount(e.target.value)}
              className="border rounded p-2 w-full"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-lg font-bold">Credit Amount</label>
            <input
              type="number"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              className="border rounded p-2 w-full"
              required
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-lg font-bold">Remarks</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="border rounded p-2 w-full"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#6f42c1] text-white py-2 px-4 rounded"
        >
          {isSubmitting ? "Processing..." : "Submit"}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>

      <LedgerCreationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onLedgerCreated={refreshLedgerOptions}
      />

      <CashCountSheetModal
        isOpen={isCashCountModalOpen} // Open CashCountSheetModal when triggered
        onClose={(data: CashCountItem[]) => handleCloseCashCountModal(data)}
        onSubmit={(data: CashCountItem[]) => setCashCountValues(data)} // Capture cash count values and pass to state
      />
    </div>
  );
};

export default PayOut;
