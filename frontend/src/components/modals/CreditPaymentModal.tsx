import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/services/api";

interface CreditPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditUserId: number | null;
  onCreditUserChange: () => void; 
}

export function CreditPaymentModal({
  isOpen,
  onClose,
  creditUserId,
  onCreditUserChange,
}: CreditPaymentModalProps) {
  const [paymentAmount, setPaymentAmount] = useState<number | string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [cashAmount, setCashAmount] = useState<number | string>("0.00");
  const [bankAmount, setBankAmount] = useState<number | string>("0.00");
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "cash_amount") {
      setCashAmount(value);
    } else if (name === "bank_amount") {
      setBankAmount(value);
    } else if (name === "received_amount") {
      setPaymentAmount(value);
    }
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPaymentMethod(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (creditUserId === null) return;

    try {
      await api.post(`/credit-transactions/`, {
        received_amount: paymentAmount,
        cash_amount: paymentMethod !== "bank" ? cashAmount : "0.00",
        bank_amount: paymentMethod !== "cash" ? bankAmount : "0.00",
        payment_method: paymentMethod,
        credit_user: creditUserId, 
      });
      onCreditUserChange(); // Optionally refresh data after successful payment
      onClose();
    } catch (error) {
      setError("Error making payment. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Make Payment</DialogTitle>
          <DialogDescription>Enter payment details below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 items-center gap-4">
              <Label htmlFor="received_amount">Payment Amount</Label>
              <Input
                id="received_amount"
                name="received_amount"
                type="number"
                value={paymentAmount}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="grid grid-cols-1 items-center gap-4">
              <Label htmlFor="payment_method">Payment Method</Label>
              <select
                id="payment_method"
                name="payment_method"
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
                className="border border-gray-300 rounded-md p-2"
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="cash-bank">Cash and Bank</option>
              </select>
            </div>

            {paymentMethod === "cash" && (
              <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="cash_amount">Cash Amount</Label>
                <Input
                  id="cash_amount"
                  name="cash_amount"
                  type="number"
                  value={cashAmount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                />
              </div>
            )}

            {paymentMethod === "bank" && (
              <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="bank_amount">Bank Amount</Label>
                <Input
                  id="bank_amount"
                  name="bank_amount"
                  type="number"
                  value={bankAmount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                />
              </div>
            )}

            {error && <div className="text-red-600">{error}</div>}
          </div>

          <DialogFooter>
            <Button type="submit">Submit</Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
