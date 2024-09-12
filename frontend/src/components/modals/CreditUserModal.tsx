import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { startOfToday } from 'date-fns';

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
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { api } from "@/services/api";
import { CreditUser, CreditUserForm } from "@/types";

interface CreditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditUserId: number | null;
  onCreditUserChange: (newCreditUser?: CreditUser) => void;
}

export function CreditUserModal({
  isOpen,
  onClose,
  creditUserId,
  onCreditUserChange,
}: CreditUserModalProps) {
  const [creditUser, setCreditUser] = useState<CreditUserForm>({
    username: "",
    mobile_number: "",
    limit_amount:"",
    time_period: null,
    is_active: true,
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (creditUserId) {
      fetchCreditUser();
    } else {
      resetForm();
    }
  }, [creditUserId]);

  const fetchCreditUser = async () => {
    try {
      const response = await api.get(`/credit-users/${creditUserId}/`);
      const data = response.data;
      setCreditUser({
        ...data,
        time_period: data.time_period ? new Date(data.time_period) : null,
      });
      setSelectedDate(data.time_period ? new Date(data.time_period) : null);
    } catch (error) {
      console.error("Error fetching credit user:", error);
    }
  };

  const resetForm = () => {
    setCreditUser({
      username: "",
      mobile_number: "",
      limit_amount:"",
      time_period: null,
      is_active: true,
    });
    setSelectedDate(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCreditUser({
      ...creditUser,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date || null);
    setCreditUser({
      ...creditUser,
      time_period: date || null,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let response;
      if (creditUserId) {
        response = await api.put(`/credit-users/${creditUserId}/`, creditUser);
      } else {
        response = await api.post("/credit-users/", creditUser);
      }
      onCreditUserChange(response.data);
      onClose();
    } catch (error) {
      console.error("Error saving credit user:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {creditUserId ? "Edit Credit User" : "Add New Credit User"}
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Name Field */}
            <div className="grid gap-2">
              <Label htmlFor="username" className="text-left">
                Name
              </Label>
              <Input
                id="username"
                name="username"
                value={creditUser.username}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>

            {/* Mobile No Field */}
            <div className="grid gap-2">
              <Label htmlFor="mobile_number" className="text-left">
                Mobile No
              </Label>
              <Input
                id="mobile_number"
                name="mobile_number"
                value={creditUser.mobile_number}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>

            {/* Limit Amount Field */}
            <div className="grid gap-2">
              <Label htmlFor="mobile_number" className="text-left">
                Limit Amount
              </Label>
              <Input
                id="limit_amount"
                name="limit_amount"
                value={creditUser.limit_amount}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>

            {/* Time Period Field */}
            <div className="grid gap-2">
              <Label htmlFor="time_period" className="text-left">
                Time Period
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`col-span-3 justify-start text-left font-normal ${selectedDate ? "" : "text-muted-foreground"
                      }`}
                  >
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate || undefined}
                    onSelect={handleDateChange}
                    fromDate={startOfToday()} // Restrict selection to today and future dates
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Active Field */}
            <div className="grid gap-2">
              <Label htmlFor="is_active" className="text-left">
                Active
              </Label>
              <Checkbox
                id="is_active"
                name="is_active"
                checked={creditUser.is_active}
                onCheckedChange={(checked) =>
                  setCreditUser({ ...creditUser, is_active: !!checked })
                }
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>

      </DialogContent>
    </Dialog>
  );
}
