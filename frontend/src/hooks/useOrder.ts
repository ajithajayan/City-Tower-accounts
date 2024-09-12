import { useQuery } from "react-query";
import { fetchOrder } from "../services/api";

export const useOrder = (orderId: number) => {
  return useQuery(["order", orderId], () => fetchOrder(orderId), {
    enabled: !!orderId, // only run query if orderId is provided
  });
};
