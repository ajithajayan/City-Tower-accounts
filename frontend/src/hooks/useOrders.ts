import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getOrders, createOrder, fetchOrders } from '../services/api';
import { UseOrdersReturn, OrderFormData, Order } from '../types';
import { api } from "../services/api";


export const updateOrderStatusAPI = async (orderId: number, status: string) => {
  const response = await api.patch(`/orders/${orderId}/`, { status });
  return response.data;
};

export const useOrders = (): UseOrdersReturn => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery('orders', getOrders);

  const createOrderMutation = useMutation((orderData: OrderFormData) => createOrder(orderData), {
    onSuccess: () => {
      queryClient.invalidateQueries('orders');
    },
  });

  return {
    orders: data,
    isLoading,
    isError,
    createOrder: createOrderMutation.mutate,
    refetch,
  };
};

export const usePaginatedOrders = (page: number) => {
  return useQuery(['orders', page], () => fetchOrders(page), {
    keepPreviousData: true,
  });
};

export const useOrderById = (id: string) => {
  return useQuery<Order, Error>(["order", id], async () => {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  const { mutate, isLoading, error } = useMutation(
    ({ orderId, status }: { orderId: number; status: Order["status"] }) =>
      updateOrderStatusAPI(orderId, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("orders");
      },
    }
  );

  return {
    updateOrderStatus: mutate,
    isLoading,
    error,
  };
};
