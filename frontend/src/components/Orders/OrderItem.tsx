import React from "react";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderItemProps {
  orderItem: {
    id: number;
    name: string;
    price: number | string;
    image: string;
    quantity: number;
    category: string | number;
  };
  incrementQuantity: (id: number) => void;
  decrementQuantity: (id: number) => void;
  removeItem: (id: number) => void;
}

const OrderItem: React.FC<OrderItemProps> = ({
  orderItem,
  incrementQuantity,
  decrementQuantity,
  removeItem,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between bg-white shadow-md rounded-lg p-4 mb-2 transition-all hover:shadow-lg">
      <div className="flex items-center w-full sm:w-auto mb-4 sm:mb-0">
        <Button
          variant="ghost"
          size="icon"
          className="text-red-500 mr-2"
          onClick={() => removeItem(orderItem.id)}
        >
          <X size={16} />
        </Button>
        <img
          src={orderItem.image || "/placeholder-image.png"}
          alt={orderItem.name}
          className="w-16 h-16 object-cover rounded-md"
        />
        <div className="ml-4 flex-grow">
          <h4 className="font-semibold text-lg">{orderItem.name}</h4>
          <span className="text-red-500 font-medium">
            QAR {orderItem.price}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center sm:items-end">
        <div className="flex items-center mb-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => decrementQuantity(orderItem.id)}
          >
            <Minus size={16} />
          </Button>
          <span className="mx-3 font-semibold">{orderItem.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => incrementQuantity(orderItem.id)}
          >
            <Plus size={16} />
          </Button>
        </div>
        <span className="font-semibold text-lg text-green-600">
          QAR {(Number(orderItem.price) * orderItem.quantity).toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default OrderItem;
