import { useMutation, useQueryClient } from 'react-query';
import { generateBill as generateBillAPI } from '../services/api';

export const useGenerateBill = () => {
  const queryClient = useQueryClient();

  const { mutate, isLoading, error } = useMutation(
    ({ orderId, totalAmount }: {orderId: number, totalAmount: number}) => generateBillAPI(orderId, totalAmount),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('orders');
        queryClient.invalidateQueries('bills');
      },
    }
  );

  return {
    generateBill: mutate,
    isLoading,
    error,
  };
};
