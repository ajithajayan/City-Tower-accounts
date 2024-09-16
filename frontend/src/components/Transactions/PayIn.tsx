import React, { useState, useEffect } from "react";
import LedgerCreationModal from "@/components/modals/LedgerCreationModal";
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
  transaction_type: string;
  cash_count?: any;
}

type PayOutRequest = {
  transaction_type: "payin";
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
  const [isCashCountModalOpen, setIsCashCountModalOpen] =
    useState<boolean>(false);
  const [cashCountValues, setCashCountValues] = useState<any>(null);
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

    const transactionData1: TransactionData = {
      ledger_id: selectedCashBank!,
      particulars_id: selectedParticulars!,
      date,
      debit_amount: debitAmount ? parseFloat(debitAmount) : 0,
      credit_amount: 0,
      remarks,
      debit_credit: "debit",
      transaction_type: "payin",
      cash_count: cashCountValues,
    };

    const transactionData2: TransactionData = {
      ledger_id: selectedParticulars!,
      particulars_id: selectedCashBank!,
      date,
      debit_amount: 0,
      credit_amount: creditAmount ? parseFloat(creditAmount) : 0,
      remarks,
      debit_credit: "credit",
      transaction_type: "payin",
      cash_count: cashCountValues,
    };

    if (refNo.trim() !== "") {
      transactionData1.ref_no = refNo;
      transactionData2.ref_no = refNo;
    }

    const requestData: PayOutRequest = {
      transaction_type: "payin",
      transaction1: transactionData1,
      transaction2: transactionData2,
    };

    const cashCountRequestData = cashCountValues?.map(
      (item: { currency: any; nos: any; amount: any }) => ({
        currency: item.currency,
        nos: item.nos,
        amount: item.amount,
        created_date: date,
      })
    );

    try {
      await api.post("/transactions/", requestData);
      console.log("Transactions successful");

      if (cashCountRequestData && cashCountRequestData.length > 0) {
        const cashSheetData = {
          created_date: date,
          voucher_number: refNo ? parseInt(refNo, 10) : null,
          amount: debitAmount ? parseFloat(debitAmount) : 0,
          transaction_type: "payin",
          items: cashCountRequestData,
        };

        await api.post("/cashsheet/", cashSheetData);
        console.log("Cash Count Sheet submitted successfully");
      }

      setSelectedCashBank("");
      setSelectedParticulars("");
      setDate("");
      setDebitAmount("");
      setCreditAmount("");
      setRemarks("");
      setRefNo("");
      setCashCountValues(null);
    } catch (error) {
      console.error(
        "There was an error posting the transaction or cash count!",
        error
      );
      setError(
        "There was an error submitting the transaction. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleOpenCashCountModal = () => setIsCashCountModalOpen(true);
  const handleCloseCashCountModal = (values: any) => {
    setIsCashCountModalOpen(false);
    setCashCountValues(values);
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
    <div className="bg-blue-300 p-6 rounded-lg shadow-lg">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0 text-white">Pay In</h1>
        <div className="space-x-4">
          <button
            onClick={handleOpenModal}
            className="bg-[#6f42c1] text-white py-2 px-4 rounded shadow hover:bg-[#5a2d91]"
          >
            Create Ledger
          </button>
          <button
            onClick={handleOpenCashCountModal}
            className="bg-blue-700 text-white py-2 px-4 rounded shadow hover:bg-blue-800"
          >
            Open Cash Count
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-between gap-4">
          {/* Date Field */}
          <div className="flex-1 max-w-xs">
            <label className="block text-lg font-semibold mb-1 text-white">
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
            <label className="block text-lg font-semibold mb-1 text-white">
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

        {/* Rest of the form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-lg font-semibold mb-1 text-white">
              Cash/Bank
            </label>
            <select
              value={selectedCashBank}
              onChange={(e) => setSelectedCashBank(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full"
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
            <label className="block text-lg font-semibold mb-1 text-white">
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

          <div>
            <label className="block text-lg font-semibold mb-1 text-white">
              Income/Partners/Receivables
            </label>
            <select
              value={selectedParticulars}
              onChange={(e) => setSelectedParticulars(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full"
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
            <label className="block text-lg font-semibold mb-1 text-white">
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

          <div className="col-span-1 sm:col-span-2">
            <label className="block text-lg font-semibold mb-1 text-white">
              Remarks
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full"
              rows={3}
            />
          </div>
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          className={`bg-blue-700 text-white py-2 px-4 rounded shadow hover:bg-blue-800 ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>

      {isModalOpen && (
        <LedgerCreationModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          refreshLedgerOptions={refreshLedgerOptions}
        />
      )}

      {isCashCountModalOpen && (
        <CashCountSheetModal
          isOpen={isCashCountModalOpen}
          onClose={handleCloseCashCountModal}
        />
      )}
    </div>
  );
};

export default PayIn;
