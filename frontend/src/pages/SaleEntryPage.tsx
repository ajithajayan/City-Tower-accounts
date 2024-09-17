import React, { useState, useEffect } from "react";
import LedgerCreationModal from "@/components/modals/LedgerCreationModal";
import { api } from "@/services/api";
import Layout from "@/components/Layout/Layout";
import SalesCashSheetModal from "@/components/modals/SalesCashSheetModal";

interface Ledger {
    id: number;
    name: string;
    mobile_no: string;
    opening_balance: string;
    debit_credit: string;
    group: { name: string };
}

// interface TransactionData {
//     ledger_id: string;
//     particulars_id: string;
//     date: string;
//     debit_amount: number;
//     credit_amount: number;
//     remarks: string;
//     ref_no?: string;
//     debit_credit: string;
//     transaction_type: string;
// }

// type PayOutRequest = {
//     salescashtransaction1: TransactionData;
//     salescashtransaction2: TransactionData;
//     salesbanktransaction1: TransactionData;
//     salesbanktransaction2: TransactionData;
//     purchasetransaction1: TransactionData;
//     purchasetransaction2: TransactionData;
// };

const SalesEntryPage: React.FC = () => {
    const [ledgerOptions, setLedgerOptions] = useState<Ledger[]>([]);
    const [selectedCash, setSelectedCash] = useState<string>("");
    const [selectedBank, setSelectedBank] = useState<string>("");
    const [selectedSaleParticulars, setSelectedSaleParticulars] = useState<string>("");
    const [selectedPurchaseParticulars, setSelectedPurchaseParticulars] = useState<string>("");

    const [selectedPurchase, setselectedPurchase] = useState<string>("");

    const [date, setDate] = useState<string>("");
    const [cashdebitAmount, setCashDebitAmount] = useState<string>("");
    const [bankdebitAmount, setBankDebitAmount] = useState<string>("");
    const [purchasedebitAmount, setPurchaseDebitAmount] = useState<string>("");
    const [salecreditAmount, setSaleCreditAmount] = useState<string>("");
    const [purchaseCashcreditAmount, setPurchaseCashCreditAmount] = useState<string>("");
    const [remarks, setRemarks] = useState<string>("");
    const [refNo, setRefNo] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isCashSheetModalOpen, setCashSheetModalOpen] = useState(false);

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

            // Set default values for dropdowns
            const defaultCashLedger = allLedgers.find((ledger) =>
                ledger.name.toLowerCase().includes("cash account")
            );
            if (defaultCashLedger) {
                setSelectedCash(defaultCashLedger.id.toString());
            }

            const defaultBankLedger = allLedgers.find((ledger) =>
                ledger.group.name.toLowerCase().includes("bank account")
            );
            if (defaultBankLedger) {
                setSelectedBank(defaultBankLedger.id.toString());
            }

            // Set default value for Sales dropdown
            const d = allLedgers.find((ledger) =>
                ledger.name.toLowerCase().includes("sales account")
            );
            if (d) {
                setSelectedSaleParticulars(d.id.toString());
            }
        };

        fetchAllLedgers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setError(null);


    // Convert string amounts to numbers for comparison
    const saleAmount = parseFloat(salecreditAmount) || 0;
    const cashAmount = parseFloat(cashdebitAmount) || 0;
    const bankAmount = parseFloat(bankdebitAmount) || 0;
    const purchaseAmount = parseFloat(purchasedebitAmount) || 0;
    const purchaseCashAmount = parseFloat(purchaseCashcreditAmount) || 0;
  
    if (saleAmount !== cashAmount + bankAmount) {
      setError("The sale amount does not match the sum of cash and bank amounts.");
      setIsSubmitting(false);
      return;
  }

  if (purchaseAmount !== purchaseCashAmount) {
    setError("The purchase debit amount does not match the purchase cash credit amount.");
    setIsSubmitting(false);
    return;
}

        // Initialize an empty object to store request data
        let requestData: { [key: string]: any } = {
            transaction_type: 'salesentry', // Specify the transaction type
        };

        // Conditional Sales Cash Transactions - both debit and credit must be non-zero
        if (parseFloat(cashdebitAmount) && parseFloat(salecreditAmount)) {
            requestData.salescashtransaction1 = {
                ledger_id: selectedCash,
                particulars_id: selectedSaleParticulars,
                date,
                debit_amount: parseFloat(salecreditAmount),
                credit_amount: 0,
                remarks,
                debit_credit: "debit",
            };
            requestData.salescashtransaction2 = {
                ledger_id: selectedSaleParticulars,
                particulars_id: selectedCash,
                date,
                debit_amount: 0,
                credit_amount: parseFloat(cashdebitAmount),
                remarks,
                debit_credit: "credit",
            };
        }

        // Conditional Sales Bank Transactions - both debit and credit must be non-zero
        if (parseFloat(bankdebitAmount) && parseFloat(salecreditAmount)) {
            requestData.salesbanktransaction1 = {
                ledger_id: selectedBank,
                particulars_id: selectedSaleParticulars,
                date,
                debit_amount: parseFloat(salecreditAmount),
                credit_amount: 0,
                remarks,
                debit_credit: "debit",
            };
            requestData.salesbanktransaction2 = {
                ledger_id: selectedSaleParticulars,
                particulars_id: selectedBank,
                date,
                debit_amount: 0,
                credit_amount: parseFloat(bankdebitAmount),
                remarks,
                debit_credit: "credit",
            };
        }

        // Conditional Purchase Transactions - both debit and credit must be non-zero
        if (parseFloat(purchasedebitAmount) && parseFloat(purchaseCashcreditAmount)) {
            requestData.purchasetransaction1 = {
                ledger_id: selectedPurchase,
                particulars_id: selectedPurchaseParticulars,
                date,
                debit_amount: parseFloat(purchasedebitAmount),
                credit_amount: 0,
                remarks,
                debit_credit: "debit",
            };
            requestData.purchasetransaction2 = {
                ledger_id: selectedPurchaseParticulars,
                particulars_id: selectedPurchase,
                date,
                debit_amount: 0,
                credit_amount: parseFloat(purchaseCashcreditAmount),
                remarks,
                debit_credit: "credit",
            };
        }


        if (refNo.trim() !== "") {
            Object.values(requestData).forEach(transaction => {
                if (typeof transaction === 'object') {
                    (transaction as any).ref_no = refNo;
                }
            });
        }
        console.log("requsested data", requestData);


        console.log("requestedData :", requestData);

        if (Object.keys(requestData).length > 1) { // Length > 1 because 'transaction_type' is always present
            // Send the requestData to the API
            api.post('/transactions/', requestData)  // Adjust the endpoint if needed
                .then(response => {
                    console.log('Transaction successful:', response.data);
                    setIsSubmitting(false);
                    setDate("");
                    setCashDebitAmount("");
                    setBankDebitAmount("");
                    setPurchaseDebitAmount("");
                    setSaleCreditAmount("");
                    setPurchaseCashCreditAmount("");
                    setRemarks("");
                    setRefNo("");
        
                    // You can also add a success message or redirection here
                    alert("Form submitted successfully!");
                })
                .catch(error => {
                    console.error('Error submitting transaction:', error);
                    // You can show an error message to the user or handle specific error codes here
                });
        } else {
            console.log('No data to send. Please fill out the required fields.');
        }
    };

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleOpenCashSheetModal = () => setCashSheetModalOpen(true);
    const handleCloseCashSheetModal = () => setCashSheetModalOpen(false);

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

        // Set default values for dropdowns
        const defaultCashLedger = allLedgers.find((ledger) =>
            ledger.name.toLowerCase().includes("cash account")
        );
        if (defaultCashLedger) {
            setSelectedCash(defaultCashLedger.id.toString());
        }

        const defaultBankLedger = allLedgers.find((ledger) =>
            ledger.group.name.toLowerCase().includes("bank account")
        );
        if (defaultBankLedger) {
            setSelectedBank(defaultBankLedger.id.toString());
        }

        // Set default value for Sales dropdown
        const d = allLedgers.find((ledger) =>
            ledger.name.toLowerCase().includes("sales account")
        );
        if (d) {
            setSelectedSaleParticulars(d.id.toString());
        }
        const defaultPurchaseLedger = allLedgers.find((ledger) =>
            ledger.name.toLowerCase().includes("purchase account")
        );
        if (defaultPurchaseLedger) {
            setselectedPurchase(defaultPurchaseLedger.id.toString());
        }


    };

    return (
 <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2 sm:mb-0">Sales Entry</h1>
              <div className="flex gap-4">
                <button
                  onClick={handleOpenModal}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                  Create Ledger
                </button>
                <button
                  onClick={handleOpenCashSheetModal}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                  Cash Sheet
                </button>
              </div>
            </div>
            {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                                <strong className="font-bold">Error: </strong>
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div >
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 block w-full sm:w-3/4 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    required
                  />
                </div>

                <div className="flex flex-col items-end">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference No.</label>
                  <input
                    type="text"
                    value={refNo}
                    onChange={(e) => setRefNo(e.target.value)}
                    className="mt-1 block w-full sm:w-3/4 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-right"
                  />
                </div>
              </div>

              {/* Sales Section */}
              <div className="bg-purple-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-purple-800 mb-4">Sales</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sales Account</label>
                    <select
                      value={selectedSaleParticulars}
                      onChange={(e) => setSelectedSaleParticulars(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    >
                      <option value="">Select an account</option>
                      {ledgerOptions
                        .filter((ledger) => ledger.name.toLowerCase().includes("sales account"))
                        .map((ledger) => (
                          <option key={ledger.id} value={ledger.id}>
                            {ledger.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input
                      type="text"
                      value={salecreditAmount}
                      onChange={(e) => setSaleCreditAmount(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-4 ml-16">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cash</label>
                      <select
                        value={selectedCash}
                        onChange={(e) => setSelectedCash(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      >
                        <option value="">Select an account</option>
                        {ledgerOptions
                          .filter((ledger) => ledger.name.toLowerCase().includes("cash account"))
                          .map((ledger) => (
                            <option key={ledger.id} value={ledger.id}>
                              {ledger.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                      <input
                        type="text"
                        value={cashdebitAmount}
                        onChange={(e) => setCashDebitAmount(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bank</label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      >
                        <option value="">Select an account</option>
                        {ledgerOptions
                          .filter((ledger) => ledger.group.name.toLowerCase().includes("bank account"))
                          .map((ledger) => (
                            <option key={ledger.id} value={ledger.id}>
                              {ledger.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                      <input
                        type="text"
                        value={bankdebitAmount}
                        onChange={(e) => setBankDebitAmount(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase Section */}
              <div className="bg-green-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-green-800 mb-4">Purchase</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Account</label>
                    <select
                      value={selectedPurchase}
                      onChange={(e) => setselectedPurchase(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    >
                      <option value="">Select an account</option>
                      {ledgerOptions
                        .filter((ledger) => ledger.name.toLowerCase().includes("purchase account"))
                        .map((ledger) => (
                          <option key={ledger.id} value={ledger.id}>
                            {ledger.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input
                      type="text"
                      value={purchasedebitAmount}
                      onChange={(e) => setPurchaseDebitAmount(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 ml-16">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cash</label>
                    <select
                      value={selectedPurchaseParticulars}
                      onChange={(e) => setSelectedPurchaseParticulars(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    >
                      <option value="">Select an account</option>
                      {ledgerOptions
                        .filter((ledger) => ledger.name.toLowerCase().includes("cash account"))
                        .map((ledger) => (
                          <option key={ledger.id} value={ledger.id}>
                            {ledger.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input
                      type="text"
                      value={purchaseCashcreditAmount}
                      onChange={(e) => setPurchaseCashCreditAmount(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  rows={3}
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex justify-center">
                <button
                  type="submit"
                  className={`bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <LedgerCreationModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          refreshLedgerOptions={refreshLedgerOptions}
        />
      )}
      <SalesCashSheetModal isOpen={isCashSheetModalOpen} onClose={handleCloseCashSheetModal} />
    </Layout>
    );

};

export default SalesEntryPage;
