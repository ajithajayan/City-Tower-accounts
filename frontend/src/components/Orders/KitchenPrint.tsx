import React from "react";
import { Order, Dish } from "../../types";

interface KitchenPrintProps {
  order: Order;
  dishes: Dish[];
}

const KitchenPrint: React.FC<KitchenPrintProps> = ({ order, dishes }) => {
  const formatDate = (datetime: string) => {
    const date = new Date(datetime);
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
  };

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    const options: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "numeric", second: "numeric" };
    return date.toLocaleTimeString(undefined, options);
  };

  const newlyAddedItems = Array.isArray(order.items) ? order.items.filter((item) => item.is_newly_added) : [];

  const regularItems = Array.isArray(order.items) ? order.items.filter((item) => !item.is_newly_added) : [];


  const renderItems = (items: any[]) => {
    return items.map((item, index) => {
      const dish = dishes.find((dish) => dish.id === item.dish);
      const itemTotal = dish ? (dish.price * item.quantity).toFixed(2) : "0.00";

      return (
        <tr key={index} className="print-item">
          <td className="print-item-name">
            {dish ? dish.name : "Unknown Dish"}
            {item.variants.length > 0 && (
              <ul className="text-xs text-gray-500 mt-1">
                {item.variants.map((variant: any, variantIndex: number) => (
                  <li key={variantIndex}>
                    {variant.name} - Qty: {variant.quantity}
                  </li>
                ))}
              </ul>
            )}
          </td>
          <td className="print-item-quantity text-right">x {item.quantity}</td>
          <td className="print-item-total text-right">QAR {itemTotal}</td>
        </tr>
      );
    });
  };

  return (
    <div className="print-container w-full max-w-md mx-auto p-4 text-sm bg-white border-2 border-dashed rounded-lg">
      <h1 className="text-center text-lg font-bold mb-2">Kitchen Order</h1>
      <div className="print-order-id mb-2">Order_id #{order.id}</div>
      <div className="print-date mb-2">Date: {formatDate(order.created_at)}</div>
      <div className="print-time mb-2">Time: {formatTime(order.created_at)}</div>

      <div className="print-items">
        {regularItems.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Order Items:</h4>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Item</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>{renderItems(regularItems)}</tbody>
            </table>
          </div>
        )}

        {newlyAddedItems.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-center mb-2">
              <hr className="flex-grow border-gray-300" />
              <span className="mx-4 text-red-500 font-semibold">Newly Added</span>
              <hr className="flex-grow border-gray-300" />
            </div>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Item</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>{renderItems(newlyAddedItems)}</tbody>
            </table>
          </div>
        )}
      </div>

      {order.kitchen_note && (
        <div className="print-kitchen-note mt-4">
          <hr className="border-gray-300 mb-2" />
          <p className="font-bold italic">Note: {order.kitchen_note}</p>
        </div>
      )}
    </div>
  );
};

export default KitchenPrint;
