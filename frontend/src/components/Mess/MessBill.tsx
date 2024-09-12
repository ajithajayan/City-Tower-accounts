import React from 'react';

interface MessBillProps {
  data: any;
}

const MessBill: React.FC<MessBillProps> = ({ data }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  // const formatTime = (dateString: string) => {
  //   const date = new Date(dateString);
  //   const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  //   return date.toLocaleTimeString(undefined, options);
  // };

  return (
    <div className="mess-bill p-4 text-sm bg-white border border-dashed border-gray-300 rounded-lg mx-auto w-64">
      <div className="text-center mb-2">
        <img src="/images/logo.png" alt="Company Logo" className="w-24 h-auto mx-auto" />
      </div>
      <h1 className="text-center text-lg font-bold mb-1">Mess Bill</h1>
      <div className="border-t border-gray-300 mt-1 mb-2"></div>
      <div className="mb-1">Name: {data.customer_name}</div>
      <div className="mb-1">Mobile No: {data.mobile_number}</div>
      <div className="mb-1">Start Date: {formatDate(data.start_date)}</div>
      <div className="mb-1">End Date: {formatDate(data.end_date)}</div>
      <div className="mb-1">Payment Method: {data.payment_method}</div>
      <div className="mb-1">Total Amount: QR{data.total_amount}</div>
      <div className="mb-1">Paid Amount: QR{data.paid_amount}</div>
      <div className="mb-1">Pending Amount: QR{data.pending_amount}</div>
      <div className="border-t border-gray-300 mt-2"></div>
      <div className="text-center text-xs mt-2 text-gray-500">Thank you for your payment!</div>
    </div>
  );
};

export default MessBill;
