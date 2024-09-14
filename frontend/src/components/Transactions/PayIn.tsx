import React, { useState, useEffect } from "react";
import LedgerCreationModal from "@/components/modals/LedgerCreationModal";
import CashCountSheet from "@/components/modals/CashCountSheet"; // Import CashCountSheet Modal
import { api } from "@/services/api";
import CashCountSheetModal from "../modals/CashCountSheetModal";

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
  cash_count?: any; // Add cash_count field to include values from CashCountSheet
}

type PayOutRequest = {
  transaction1: TransactionData;
  transaction2: TransactionData;
};

const PayIn: React.FC = () => {
  const [ledgerOptions, setLedgerOptions] = useState<Ledger[]>([]);
  const [selectedCashBank, setSelectedCashBank] = useState<string>("");
  const [selectedParticulars, setSelectedParticulars] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [debitAmount, setDebitAmount] = useState<string>("");
  const [creditAmount, setCreditAmount] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [refNo, setRefNo] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCashCountModalOpen, setIsCashCountModalOpen] = useState<boolean>(false); // State for CashCountSheet Modal
  const [cashCountValues, setCashCountValues] = useState<any>(null); // State to hold values from CashCountSheet
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
    if (isSubmitting) return;
  
    setIsSubmitting(true);
    setError(null);
  
    // Construct Transaction Data for Transaction API
    const transactionData1: TransactionData = {
      ledger_id: selectedCashBank!,
      particulars_id: selectedParticulars!,
      date,
      debit_amount: debitAmount ? parseFloat(debitAmount) : 0,
      credit_amount: 0,
      remarks,
      debit_credit: "debit",
      cash_count: cashCountValues, // Include cash count values
    };
  
    const transactionData2: TransactionData = {
      ledger_id: selectedParticulars!,
      particulars_id: selectedCashBank!,
      date,
      debit_amount: 0,
      credit_amount: creditAmount ? parseFloat(creditAmount) : 0,
      remarks,
      debit_credit: "credit",
      cash_count: cashCountValues, // Include cash count values
    };
  
    if (refNo.trim() !== "") {
      transactionData1.ref_no = refNo;
      transactionData2.ref_no = refNo;
    }
  
    // Prepare the PayOutRequest that includes both transactions
    const requestData: PayOutRequest = {
      transaction1: transactionData1,
      transaction2: transactionData2,
    };
  
    // Format Cash Count Values for the CashCount API (if applicable)
    const cashCountRequestData = cashCountValues?.map(item => ({
      currency: item.currency,
      nos: item.nos,
      amount: item.amount,
      created_date: date, // Same as the transaction date
    }));
  
    try {
      // 1. Submit PayIn transaction
      await api.post("/transactions/", requestData);
      console.log("Transactions successful");
  
      // 2. Submit Cash Count data (if available)
      if (cashCountRequestData && cashCountRequestData.length > 0) {
        const cashSheetData = {
          created_date: date,
          voucher_number: refNo ? parseInt(refNo, 10) : null,
          amount: debitAmount ? parseFloat(debitAmount) : 0, // Total amount
          transaction_type: "payin", // or 'payout' depending on the context
          items: cashCountRequestData,
        };
  
        await api.post("/cashsheet/", cashSheetData);  // Adjust the endpoint if needed
        console.log("Cash Count Sheet submitted successfully");
      }
  
      // Reset form fields and cash count values after successful submission
      setSelectedCashBank("");
      setSelectedParticulars("");
      setDate("");
      setDebitAmount("");
      setCreditAmount("");
      setRemarks("");
      setRefNo("");
      setCashCountValues(null); // Reset Cash Count Sheet values
  
    } catch (error) {
      console.error("There was an error posting the transaction or cash count!", error);
      setError("There was an error submitting the transaction. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleOpenCashCountModal = () => setIsCashCountModalOpen(true); // Open CashCountSheet Modal
  const handleCloseCashCountModal = (values: any) => {
    setIsCashCountModalOpen(false);
    setCashCountValues(values); // Capture cash count values
  };
  


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
    <div className="bg-green-300">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">Pay In</h1>
        <div className="space-x-4">
          <button
            onClick={handleOpenModal}
            className="bg-[#6f42c1] text-white py-2 px-4 rounded"
          >
            Create Ledger
          </button>
          <button
            onClick={handleOpenCashCountModal}
            className="bg-blue-500 text-white py-2 px-4 rounded"
          >
            Open Cash Count
          </button>
        </div>
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
            <label className="block mb-2 text-lg font-bold">Cash/Bank</label>
            <select
              value={selectedCashBank}
              onChange={(e) => setSelectedCashBank(e.target.value)}
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
            <label className="block mb-2 text-lg font-bold">Income/Partners/Receivables</label>
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
              rows={3}
            />
          </div>
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          className={`bg-blue-500 text-white py-2 px-4 rounded ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      {isModalOpen && (
        <LedgerCreationModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          refreshLedgerOptions={refreshLedgerOptions} // Pass the callback to the modal
        />
      )}

      {isCashCountModalOpen && (
        <CashCountSheetModal
          isOpen={isCashCountModalOpen}
          onClose={handleCloseCashCountModal} // Close modal and get values
        />
      )}
    </div>
  );
};

export default PayIn;
