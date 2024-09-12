import React, { useState, useEffect } from "react";
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
}

type PayOutRequest = {
    transaction1: TransactionData;
    transaction2: TransactionData;
};

interface CreditTransaction {
    id: number;
    received_amount: string;
    status: string;
    credit_user_details: { mobile_number: string };
    date: string;
}

interface PayInModalProps {
    isOpen: boolean;
    onClose: () => void;
    creditUserId: number | null;
}

const PayInModal: React.FC<PayInModalProps> = ({ isOpen, onClose, creditUserId }) => {
    const [ledgerOptions, setLedgerOptions] = useState<Ledger[]>([]);
    const [selectedCashBank, setSelectedCashBank] = useState<string>("");
    const [selectedParticulars, setSelectedParticulars] = useState<string>("");
    const [date, setDate] = useState<string>("");
    const [debitAmount, setDebitAmount] = useState<string>("");
    const [creditAmount, setCreditAmount] = useState<string>("");
    const [remarks, setRemarks] = useState<string>("");
    const [refNo, setRefNo] = useState<string>("");
    const [mobileNumber, setMobileNumber] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        if (isOpen) {
            api.get("/ledgers/")
                .then((response) => {
                    const data = response.data.results;
                    if (Array.isArray(data)) {
                        setLedgerOptions(data);
                    } else {
                        console.error("Unexpected API response format", data);
                    }
                })
                .catch((error) => {
                    console.error("There was an error fetching the ledgers!", error);
                });
        }
    }, [isOpen]);

    useEffect(() => {
        if (creditUserId && ledgerOptions.length > 0) {
            api.get(`/credit-transactions/latest_transaction/?credit_user=${creditUserId}&ordering=-date&limit=1`)
                .then((response) => {
                    const latestTransaction: CreditTransaction = response.data;
                    if (latestTransaction) {
                        setMobileNumber(latestTransaction.credit_user_details.mobile_number);
                        setDebitAmount(latestTransaction.received_amount);
                        setCreditAmount(latestTransaction.received_amount);
                        setDate(latestTransaction.date);

                        const matchingLedger = ledgerOptions.find(ledger => ledger.mobile_no === latestTransaction.credit_user_details.mobile_number);
                        if (matchingLedger) {
                            setSelectedCashBank(matchingLedger.id.toString());
                        } else {
                            console.log("No matching ledger found for the mobile number.");
                        }
                    } else {
                        console.log("No transaction found for the user.");
                    }
                })
                .catch((error) => {
                    console.error("Error fetching the latest transaction!", error);
                });
        }
    }, [creditUserId, ledgerOptions]);
console.log(mobileNumber);

    useEffect(() => {
        if (!isOpen) {
            // Reset form fields when modal is closed
            setSelectedCashBank("");
            setSelectedParticulars("");
            setDate("");
            setDebitAmount("");
            setCreditAmount("");
            setRemarks("");
            setRefNo("");
            setMobileNumber("");
        }
    }, [isOpen]);

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
        };

        const transactionData2: TransactionData = {
            ledger_id: selectedParticulars!,
            particulars_id: selectedCashBank!,
            date,
            debit_amount: 0,
            credit_amount: creditAmount ? parseFloat(creditAmount) : 0,
            remarks,
            debit_credit: "credit",
        };

        if (refNo.trim() !== "") {
            transactionData1.ref_no = refNo;
            transactionData2.ref_no = refNo;
        }

        const requestData: PayOutRequest = {
            transaction1: transactionData1,
            transaction2: transactionData2,
        };

        try {
            await api.post("/transactions/", requestData);
            console.log("Transactions successful");

            // Reset form fields
            setSelectedCashBank("");
            setSelectedParticulars("");
            setDate("");
            setDebitAmount("");
            setCreditAmount("");
            setRemarks("");
            setRefNo("");
            setMobileNumber("");

            onClose();
        } catch (error) {
            console.error("There was an error posting the transaction!", error);
            setError("There was an error submitting the transaction. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-75">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
                >
                    &times;
                </button>
                <h2 className="text-xl font-bold mb-4">Pay In</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="border rounded p-2 w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium">Reference No.</label>
                            <input
                                type="text"
                                value={refNo}
                                onChange={(e) => setRefNo(e.target.value)}
                                className="border rounded p-2 w-full"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium">Cash/Bank</label>
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
                            <label className="block mb-2 text-sm font-medium">Debit Amount</label>
                            <input
                                type="number"
                                value={debitAmount}
                                onChange={(e) => setDebitAmount(e.target.value)}
                                className="border rounded p-2 w-full"
                                step="0.01"
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium">Income/Partners/Receivables</label>
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
                            <label className="block mb-2 text-sm font-medium">Credit Amount</label>
                            <input
                                type="number"
                                value={creditAmount}
                                onChange={(e) => setCreditAmount(e.target.value)}
                                className="border rounded p-2 w-full"
                                step="0.01"
                                min="0"
                            />
                        </div>

                        <div className="col-span-1 sm:col-span-2">
                            <label className="block mb-2 text-sm font-medium">Remarks</label>
                            <textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="border rounded p-2 w-full"
                                rows={3}
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="flex justify-end mt-4">
                        <button
                            type="submit"
                            className={`px-4 py-2 text-white rounded ${isSubmitting ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"} `}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PayInModal;
