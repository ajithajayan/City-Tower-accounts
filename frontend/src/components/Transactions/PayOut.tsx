import React, { useState, useEffect } from "react";
import LedgerCreationModal from "@/components/modals/LedgerCreationModal";
import { api } from "@/services/api";

interface Ledger {
  id: number;
  name: string;
  mobile_no: string;
  opening_balance: string;
  debit_credit: string;
  group: { name: string };
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
  transaction_type: 'payout',

}

type PayOutRequest = {
  transaction_type: 'payout',
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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
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

      // Log the fetched ledgers to verify data
      console.log("Fetched ledgers:", allLedgers);
      setLedgerOptions(allLedgers);
    };

    fetchAllLedgers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent further submissions during ongoing request

    setIsSubmitting(true); // Set submitting state to true
    setError(null); // Reset error state

    const transactionData1: TransactionData = {
      ledger_id: selectedExpensePayables!,
      particulars_id: selectedParticulars!,
      date,
      debit_amount: debitAmount ? parseFloat(debitAmount) : 0,
      credit_amount: 0,
      remarks,
      debit_credit: "debit",
      transaction_type: 'payout',

    };

    const transactionData2: TransactionData = {
      ledger_id: selectedParticulars!,
      particulars_id: selectedExpensePayables!,
      date,
      debit_amount: 0,
      credit_amount: creditAmount ? parseFloat(creditAmount) : 0,
      remarks,
      debit_credit: "credit",
      transaction_type: 'payout',

    };

    if (refNo.trim() !== "") {
      transactionData1.ref_no = refNo;
      transactionData2.ref_no = refNo;
    }

    const requestData: PayOutRequest = {
      transaction_type: 'payout',
      transaction1: transactionData1,
      transaction2: transactionData2,
    };

    try {
      // Post both transactions in a single request
      await api.post("/transactions/", requestData);
      console.log("Transactions successful");

      // Reset form fields
      setSelectedExpensePayables("");
      setSelectedParticulars("");
      setDate("");
      setDebitAmount("");
      setCreditAmount("");
      setRemarks("");
      setRefNo("");
    } catch (error) {
      console.error("There was an error posting the transaction!", error);
      setError("There was an error submitting the transaction. Please try again.");
    } finally {
      setIsSubmitting(false); // Reset submitting state to false after the request completes
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

    // Log the fetched ledgers to verify data
    console.log("Fetched ledgers:", allLedgers);
    setLedgerOptions(allLedgers);
  };


  return (
    <div className="bg-blue-200">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">Pay Out</h1>
        <button
          onClick={handleOpenModal}
          className="bg-[#6f42c1] text-white py-2 px-4 rounded w-full sm:w-auto"
        >
          Create Ledger
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
              <option value="">Select an account</option>
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
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-lg font-bold">Cash/Bank/Creditors</label>
            <select
              value={selectedParticulars}
              onChange={(e) => setSelectedParticulars(e.target.value)}
              className="border rounded p-2 w-full"
              required
            >
              <option value="">Select an account</option>
              {ledgerOptions.map((ledger) => (
                <option key={ledger.id} value={ledger.id}>
                  {ledger.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-lg font-bold">Credit Amount</label>
            <input
              type="number"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              className="border rounded p-2 w-full"
              step="0.01"
              required
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <label className="block mb-2 text-lg font-bold">Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="border rounded p-2 w-full"
            />
          </div>
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <div className="flex justify-center mt-4">
          <button
            type="submit"
            className="bg-[#6f42c1] text-white py-2 px-4 rounded w-full sm:w-auto"
            disabled={isSubmitting}  // Disable the button when submitting
          >
            Submit
          </button>
        </div>
      </form>

      <LedgerCreationModal isOpen={isModalOpen} refreshLedgerOptions={refreshLedgerOptions} onClose={handleCloseModal} />
    </div>
  );
};

export default PayOut;
