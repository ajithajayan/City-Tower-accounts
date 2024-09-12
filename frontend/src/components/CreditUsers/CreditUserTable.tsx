  import { useState, useEffect } from "react";
  import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
  } from "@tanstack/react-table";
  import { ArrowUpDown, PlusCircle } from "lucide-react";

  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import { api } from "@/services/api";
  import { CreditUserModal } from "../modals/CreditUserModal";
  import ConfirmationModal from "../modals/ConfirmationModal";
  import { CreditPaymentModal } from "../modals/CreditPaymentModal";
  import CreditTransactionModal from "@/components/modals/CreditTransactionModal";
  import PayInModal from "../modals/PayInModal";

  interface CreditUser {
    id: number;
    username: string;
    mobile_number: string;
    last_payment_date: string;
    total_due: number;
    is_active: boolean;
  }

  export function CreditUserTable() {
    const [sorting, setSorting] = useState<any[]>([]);
    const [columnFilters, setColumnFilters] = useState<any[]>([]);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [rowSelection, setRowSelection] = useState({});
    const [data, setData] = useState<CreditUser[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedCreditUserId, setSelectedCreditUserId] = useState<
      number | null
    >(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [creditUserToDelete, setCreditUserToDelete] = useState<number | null>(
      null
    );
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [selectedUserTransactions, setSelectedUserTransactions] = useState([]);
    const [isPayInModalOpen, setIsPayInModalOpen] = useState(false);
    // const [selectedPayInData, setSelectedPayInData] = useState<CreditUser | null>(null);


    useEffect(() => {
      fetchCreditUsers();
    }, []);

    const fetchCreditUsers = async () => {
      try {
        const response = await api.get("/credit-users/");
        setData(response.data.results);
      } catch (error) {
        console.error("Error fetching credit users:", error);
      }
    };

    const handleMobileNumberClick = async (creditUserId: number) => {
      try {
        const response = await api.get(`/credit-transactions/?credit_user=${creditUserId}`);
        setSelectedUserTransactions(response.data.results);
        setIsTransactionModalOpen(true);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    const filterFn = (row: any, value: string) => {
      const usernameMatch = row.getValue("username").toLowerCase().includes(value.toLowerCase());
      const mobileNumberMatch = row.getValue("mobile_number").includes(value);
      return usernameMatch || mobileNumberMatch;
    };

    const handleAddCreditUser = () => {
      setSelectedCreditUserId(null);
      setIsModalOpen(true);
    };

    const handleEditCreditUser = (creditUserId: number) => {
      setSelectedCreditUserId(creditUserId);
      setIsModalOpen(true);
    };

    const handleDeleteCreditUser = (creditUserId: number) => {
      setCreditUserToDelete(creditUserId);
      setIsDeleteModalOpen(true);
    };

    const handleOpenPayInModal = (creditUserId: number) => {
      setSelectedCreditUserId(creditUserId);
      setIsPayInModalOpen(true);
    };


    const confirmDelete = async () => {
      if (creditUserToDelete) {
        try {
          await api.delete(`/credit-users/${creditUserToDelete}/`);
          setData((prevData) =>
            prevData.filter((creditUser) => creditUser.id !== creditUserToDelete)
          );
        } catch (error) {
          console.error("Error deleting credit user:", error);
        } finally {
          setIsDeleteModalOpen(false);
          setCreditUserToDelete(null);
        }
      }
    };

    const handleMakePayment = (creditUserId: number) => {
      setSelectedCreditUserId(creditUserId);
      setIsPaymentModalOpen(true);
    };

    const handleCreditUserChange = async () => {
      await fetchCreditUsers();
    };

    const columns = [
      {
        accessorKey: "username",
        header: ({ column }: any) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }: any) => <div>{row.getValue("username")}</div>,
        filterFn
      },
      {
        accessorKey: "mobile_number",
        header: ({ column }: any) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Mobile No
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }: any) => (
          <div
            onClick={() => handleMobileNumberClick(row.original.id)}
            className="cursor-pointer text-blue-600 underline"
          >
            {row.getValue("mobile_number")}
          </div>
        ),
        filterFn,
      },
      {
        accessorKey: "bill_date",
        header: "Bill Date",
        cell: ({ row }: any) => (
          <div>
            {new Date(row.getValue("bill_date")).toLocaleDateString()}
          </div>
        ),
      },
      {
        accessorKey: "due_date",
        header: "Due Date",
        cell: ({ row }: any) => (
          <div>{new Date(row.getValue("due_date")).toLocaleDateString()}</div>
        ),
      },
      {
        accessorKey: "total_due",
        header: () => <div className="text-right">Total Due</div>,
        cell: ({ row }: any) => {
          const amount = parseFloat(row.getValue("total_due"));
          const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "QAR",
          }).format(amount);
          return <div className="text-right font-medium">{formatted}</div>;
        },
      },
      {
        accessorKey: "limit_amount",
        header: () => <div className="text-right">Limit Amount</div>,
        cell: ({ row }: any) => {
          const amount = parseFloat(row.getValue("limit_amount"));
          const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "QAR",
          }).format(amount);
          return <div className="text-right font-medium">{formatted}</div>;
        },
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }: any) => (
          <div
            className={`font-medium ${row.getValue("is_active") ? "text-green-600" : "text-red-600"
              }`}
          >
            {row.getValue("is_active") ? "Active" : "Inactive"}
          </div>
        ),
      },
      {
        id: "make_payment",
        header: "Make Payment",
        cell: ({ row }: any) => {
          const creditUser = row.original;
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMakePayment(creditUser.id)}
              disabled={creditUser.total_due <= 0}
              className={`bg-green-500 ${creditUser.total_due <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Make Payment
            </Button>
          );
        },
      },
      {
        id: "pay_in",
        header: "Pay In",
        cell: ({ row }: any) => {
          const creditUser = row.original;
          return (
            <Button
              variant="outline"
              size="sm"
              disabled={creditUser.total_due <= 0}
              className={`bg-blue-400 ${creditUser.total_due <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => handleOpenPayInModal(creditUser.id)}
            >
              Pay In
            </Button>
          );
        },
      },

      {
        id: "edit",
        header: "Edit",
        cell: ({ row }: any) => {
          const creditUser = row.original;
          return (
            <Button variant="outline" size="sm" className="bg-[#6f42c1]" onClick={() => handleEditCreditUser(creditUser.id)}>
              Edit
            </Button>
          );
        },
      },
      {
        id: "delete",
        header: "Delete",
        cell: ({ row }: any) => {
          const creditUser = row.original;
          return (
            <Button variant="outline" size="sm" onClick={() => handleDeleteCreditUser(creditUser.id)}>
              Delete
            </Button>
          );
        },
      },
    ];

    const table = useReactTable({
      data,
      columns,
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      onColumnVisibilityChange: setColumnVisibility,
      onRowSelectionChange: setRowSelection,
      state: {
        sorting,
        columnFilters,
        columnVisibility,
        rowSelection,
      },
    });

    return (
      <div className="w-full">
        <div className="flex items-center justify-between py-4">
          <Input
            placeholder="Filter by name or mobile..."
            value={(table.getColumn("username")?.getFilterValue() as string) ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              table.getColumn("username")?.setFilterValue(value);
              table.getColumn("mobile_number")?.setFilterValue(value);
            }}
            className="max-w-sm"
          />

          <Button
            onClick={handleAddCreditUser}
            className="flex items-center justify-center gap-2"
          >
            <PlusCircle size={20} />
            <span>Add Credit Customer</span>
          </Button>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>

        <CreditUserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          creditUserId={selectedCreditUserId}
          onCreditUserChange={handleCreditUserChange}
        />

        <ConfirmationModal
          open={isDeleteModalOpen}
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          message="Are you sure you want to delete this credit user?"
          title="Confirm Action"  // Provide a title for the modal
          description="Are you sure you want to proceed with this action?"  // Provide a description for the modal

        />

        <CreditPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          creditUserId={selectedCreditUserId}
          onCreditUserChange={handleCreditUserChange}
        />

        <CreditTransactionModal
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          transactions={selectedUserTransactions}
        />
        <PayInModal
          isOpen={isPayInModalOpen}
          onClose={() => setIsPayInModalOpen(false)}
          creditUserId={selectedCreditUserId}  // Pass the selected user ID
        />


      </div>
    );
  }
