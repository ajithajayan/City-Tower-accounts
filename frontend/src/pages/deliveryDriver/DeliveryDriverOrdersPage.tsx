import React, { useState, useEffect } from "react";
import { DeliveryOrder, PaginatedResponse } from "@/types";
import {
  fetchDriverOrders,
  updateDeliveryOrderStatus,
  deleteDeliveryOrder,
} from "@/services/api";
import { DeliveryDriverHeader } from "@/components/Layout/DeliveryDriverHeader";
import { UserRoundPenIcon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import Loader from "@/components/Layout/Loader";
import { DrawerDialogDemo } from "@/components/ui/DrawerDialogDemo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { format } from "date-fns";

export const STATUS_CHOICES: [string, string][] = [
  ["pending", "Pending"],
  ["accepted", "Accepted"],
  ["in_progress", "In Progress"],
  ["delivered", "Delivered"],
  ["cancelled", "Cancelled"],
];

export const DeliveryDriverOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getOrders();
  }, []);

  const getOrders = async () => {
    try {
      const response = await fetchDriverOrders();
      const data: PaginatedResponse<DeliveryOrder> = response.data;
      setOrders(data.results);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateDeliveryOrderStatus(orderId, newStatus);
      getOrders(); // Refresh orders after status update
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    try {
      await deleteDeliveryOrder(orderId);
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderId)
      );
    } catch (error) {
      console.error("Failed to delete order:", error);
    }
  };

  const OrderCard: React.FC<{ order: DeliveryOrder }> = ({ order }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold">Order #{order.id}</h3>
            <p className="text-sm text-gray-500">
              {format(new Date(order.created_at), "PPpp")}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {STATUS_CHOICES.map(([value, label]) => (
                <DropdownMenuItem
                  key={value}
                  onSelect={() => handleStatusChange(order.id, value)}
                >
                  {label}
                </DropdownMenuItem>
              ))}
              {order.status === "cancelled" && (
                <DropdownMenuItem
                  onClick={() => handleDeleteOrder(order.id)}
                  className="text-red-500"
                >
                  Delete Order
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <p>
          <strong>Customer:</strong> {order.order.customer_name}
        </p>
        <p>
          <strong>Address:</strong> {order.order.address}
        </p>
        <p>
          <strong>Phone:</strong> {order.order.customer_phone_number}
        </p>
        <p>
          <strong>Payment:</strong> {order.order.payment_method}
        </p>
        <p>
          <strong>Total:</strong> QAR {order.order.total_amount}
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          {STATUS_CHOICES.find(([value]) => value === order.status)?.[1] ||
            "Unknown Status"}
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="container mt-10 px-4">
      <DeliveryDriverHeader />

      <div className="flex justify-between items-center mt-6 mb-2">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <DrawerDialogDemo>
          <Avatar className="cursor-pointer flex items-center justify-center">
            <UserRoundPenIcon size={28} className="flex items-center" />
          </Avatar>
        </DrawerDialogDemo>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <div>
          {orders.length > 0 ? (
            orders.map((order) => <OrderCard key={order.id} order={order} />)
          ) : (
            <p className="text-center py-4">No orders available.</p>
          )}
        </div>
      )}
    </div>
  );
};
