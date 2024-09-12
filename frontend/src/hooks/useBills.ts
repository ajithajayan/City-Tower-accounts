// useBills.ts
import { useQuery } from 'react-query';
import { fetchBills } from '../services/api';

export const useBills = (page: number) => {
  return useQuery(['bills', page], () => fetchBills(page), {
    keepPreviousData: true,
  });
};
