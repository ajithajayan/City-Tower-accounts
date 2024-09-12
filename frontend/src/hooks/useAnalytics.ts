import { useQuery } from "react-query";
import { getAnalytics } from "../services/api";
import { AnalyticsData } from "../types";

export const useAnalytics = (): any => {
  const { data, isLoading, isError } = useQuery<AnalyticsData>(
    "analytics",
    getAnalytics
  );

  return {
    data: data,
    isLoading,
    isError,
  };
};
