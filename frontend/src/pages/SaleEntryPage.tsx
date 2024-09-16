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
}

type PayOutRequest = {
    salescashtransaction1: TransactionData;
    salescashtransaction2: TransactionData;
    salesbanktransaction1: TransactionData;
    salesbanktransaction2: TransactionData;
    purchasetransaction1: TransactionData;
    purchasetransaction2: TransactionData;
};

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
                debit_amount: parseFloat(cashdebitAmount),
                credit_amount: 0,
                remarks,
                debit_credit: "debit",
            };
            requestData.salescashtransaction2 = {
                ledger_id: selectedSaleParticulars,
                particulars_id: selectedCash,
                date,
                debit_amount: 0,
                credit_amount: parseFloat(salecreditAmount),
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
                debit_amount: parseFloat(bankdebitAmount),
                credit_amount: 0,
                remarks,
                debit_credit: "debit",
            };
            requestData.salesbanktransaction2 = {
                ledger_id: selectedSaleParticulars,
                particulars_id: selectedBank,
                date,
                debit_amount: 0,
                credit_amount: parseFloat(salecreditAmount),
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
                    // You can also handle UI updates or reset the form here
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
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="max-w-4xl w-full">
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold mb-2 sm:mb-0">Sales Entry</h1>
                        <div className="flex justify-end gap-6 mb-4">
                            <button
                                onClick={handleOpenModal}
                                className="bg-[#6f42c1] text-white py-2 px-4 rounded"
                            >
                                Create Ledger
                            </button>   
                            <button
                                onClick={handleOpenCashSheetModal}
                                className="bg-[#6f42c1] text-white py-2 px-4 rounded"
                            >
                                Cash Sheet
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
    
                            {/* SalesSectionStart */}
                            <div>
                                <label className="block mb-2 text-lg font-bold">Sales</label>
                                <select
                                    value={selectedSaleParticulars}
                                    onChange={(e) => setSelectedSaleParticulars(e.target.value)}
                                    className="border rounded p-2 w-full"
                                >
                                    <option value="">Select an account</option>
                                    {ledgerOptions
                                        .filter((ledger) =>
                                            ledger.name.toLowerCase().includes("sales account")
                                        )
                                        .map((ledger) => (
                                            <option key={ledger.id} value={ledger.id}>
                                                {ledger.name}
                                            </option>
                                        ))}
                                </select>
                            </div>
    
                            <div>
                                <label className="block mb-2 text-lg font-bold">Amount</label>
                                <input
                                    type="number"
                                    value={salecreditAmount}
                                    onChange={(e) => setSaleCreditAmount(e.target.value)}
                                    className="border rounded p-2 w-full"
                                    step="0.01"
                                />
                            </div>
    
                            <div>
                                <label className="block mb-2 text-lg font-bold">Cash</label>
                                <select
                                    value={selectedCash}
                                    onChange={(e) => setSelectedCash(e.target.value)}
                                    className="border rounded p-2 w-full"
                                >
                                    <option value="">Select an account</option>
                                    {ledgerOptions
                                        .filter((ledger) =>
                                            ledger.name.toLowerCase().includes("cash account")
                                        )
                                        .map((ledger) => (
                                            <option key={ledger.id} value={ledger.id}>
                                                {ledger.name}
                                            </option>
                                        ))}
                                </select>
                            </div>
    
                            <div>
                                <label className="block mb-2 text-lg font-bold">Amount</label>
                                <input
                                    type="number"
                                    value={cashdebitAmount}
                                    onChange={(e) => setCashDebitAmount(e.target.value)}
                                    className="border rounded p-2 w-full"
                                    step="0.01"
                                />
                            </div>
    
                            <div>
                                <label className="block mb-2 text-lg font-bold">Bank</label>
                                <select
                                    value={selectedBank}
                                    onChange={(e) => setSelectedBank(e.target.value)}
                                    className="border rounded p-2 w-full"
                                >
                                    <option value="">Select an account</option>
                                    {ledgerOptions
                                        .filter((ledger) =>
                                            ledger.group.name.toLowerCase().includes("bank account")
                                        )
                                        .map((ledger) => (
                                            <option key={ledger.id} value={ledger.id}>
                                                {ledger.name}
                                            </option>
                                        ))}
                                </select>
                            </div>
    
                            <div>
                                <label className="block mb-2 text-lg font-bold">Amount</label>
                                <input
                                    type="number"
                                    value={bankdebitAmount}
                                    onChange={(e) => setBankDebitAmount(e.target.value)}
                                    className="border rounded p-2 w-full"
                                    step="0.01"
                                />
                            </div>
                            {/* SalesSectionEnd */}
    
                            {/* PurchaseSectionStart */}
                            <div>
                                <label className="block mb-2 text-lg font-bold">Purchase</label>
                                <select
                                    value={selectedPurchase}
                                    onChange={(e) => setselectedPurchase(e.target.value)}
                                    className="border rounded p-2 w-full"
                                >
                                    <option value="">Select an account</option>
                                    {ledgerOptions
                                        .filter((ledger) =>
                                            ledger.name.toLowerCase().includes("purchase account")
                                        )
                                        .map((ledger) => (
                                            <option key={ledger.id} value={ledger.id}>
                                                {ledger.name}
                                            </option>
                                        ))}
                                </select>
                            </div>
    
                            <div>
                                <label className="block mb-2 text-lg font-bold">Amount</label>
                                <input
                                    type="number"
                                    value={purchasedebitAmount}
                                    onChange={(e) => setPurchaseDebitAmount(e.target.value)}
                                    className="border rounded p-2 w-full"
                                    step="0.01"
                                />
                            </div>
    
                            <div>
                                <label className="block mb-2 text-lg font-bold">Cash</label>
                                <select
                                    value={selectedPurchaseParticulars}
                                    onChange={(e) => setSelectedPurchaseParticulars(e.target.value)}
                                    className="border rounded p-2 w-full"
                                >
                                    <option value="">Select an account</option>
                                    {ledgerOptions
                                        .filter((ledger) =>
                                            ledger.name.toLowerCase().includes("cash account")
                                        )
                                        .map((ledger) => (
                                            <option key={ledger.id} value={ledger.id}>
                                                {ledger.name}
                                            </option>
                                        ))}
                                </select>
                            </div>
    
                            <div>
                                <label className="block mb-2 text-lg font-bold">Amount</label>
                                <input
                                    type="number"
                                    value={purchaseCashcreditAmount}
                                    onChange={(e) => setPurchaseCashCreditAmount(e.target.value)}
                                    className="border rounded p-2 w-full"
                                    step="0.01"
                                />
                            </div>
                            {/* PurchaseSectionEnd */}
    
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
                            refreshLedgerOptions={refreshLedgerOptions}
                        />
                    )}
                    <SalesCashSheetModal
                        isOpen={isCashSheetModalOpen}
                        onClose={handleCloseCashSheetModal}
                    />
                </div>
            </div>
        </Layout>
    );
    
};

export default SalesEntryPage;
