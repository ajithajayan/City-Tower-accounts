import React from "react";

export interface SalesReport {
  id: number;
  invoice_number: string;
  created_at: string;
  order_type: string;
  payment_method: string;
  cash_amount: string;
  bank_amount: string;
  total_amount: number;
}

export interface MessReport {
  id: number;
  customer_name: string;
  mobile_number: string;
  mess_type: {
    name: string;
  };
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  start_date: string;
  end_date: string;
  payment_method: string;
  cash_amount: string;
  bank_amount: string;
}

interface SalesPrintProps {
  reportType: "sales" | "mess";
  reports: SalesReport[];
  messReports: MessReport[];
  totalAmount: number;
  totalCashAmount: number;
  totalCardAmount: number;
}

const SalesPrint: React.FC<SalesPrintProps> = ({
  reportType,
  reports,
  messReports,
  totalAmount,
  totalCashAmount,
  totalCardAmount,
}) => {
  const printContent = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const doc = printWindow.document;
    doc.open();
    doc.write(`
      <html>
      <head>
        <title>Print Report</title>
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f4f4f4;
          }
          tfoot td {
            font-weight: bold;
            text-align: right;
          }
        </style>
      </head>
      <body>
        <h1>${reportType === "sales" ? "Sales Report" : "Mess Report"}</h1>
        ${
          reportType === "sales"
            ? `
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Invoice No</th>
                <th>Date</th>
                <th>Order Type</th>
                <th>Payment Type</th>
                <th>Cash</th>
                <th>Bank</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${reports
                .map(
                  (report) => `
                <tr>
                  <td>${report.id}</td>
                  <td>${report.invoice_number}</td>
                  <td>${new Date(report.created_at).toLocaleDateString()}</td>
                  <td>${report.order_type}</td>
                  <td>${report.payment_method}</td>
                  <td>${report.cash_amount}</td>
                  <td>${report.bank_amount}</td>
                  <td>${report.total_amount}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6"></td>
                <td>Total Cash:</td>
                <td>₹${totalCashAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="6"></td>
                <td>Total Card:</td>
                <td>₹${totalCardAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="6"></td>
                <td>Grand Total:</td>
                <td>₹${totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        `
            : `
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Mobile No</th>
                <th>Mess Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Payment Type</th>
                <th>Pending</th>
                <th>Paid</th>
                <th>Cash</th>
                <th>Bank</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${messReports
                .map(
                  (report) => `
                <tr>
                  <td>${report.id}</td>
                  <td>${report.customer_name}</td>
                  <td>${report.mobile_number}</td>
                  <td>${report.mess_type.name}</td>
                  <td>${new Date(report.start_date).toLocaleDateString()}</td>
                  <td>${new Date(report.end_date).toLocaleDateString()}</td>
                  <td>${report.payment_method}</td>
                  <td>${report.pending_amount}</td>
                  <td>${report.paid_amount}</td>
                  <td>${report.cash_amount}</td>
                  <td>${report.bank_amount}</td>
                  <td>${report.total_amount}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="10"></td>
                <td>Total Cash:</td>
                <td>₹${totalCashAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="10"></td>
                <td>Total Card:</td>
                <td>₹${totalCardAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="10"></td>
                <td>Grand Total:</td>
                <td>₹${totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        `
        }
      </body>
      </html>
    `);
    doc.close();
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  };

  return (
    <div>
      <button
        onClick={printContent}
        className="p-2 bg-green-500 text-white rounded-lg"
      >
        Print Report
      </button>
    </div>
  );
};

export default SalesPrint;
