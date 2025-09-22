import { useQuery } from '@tanstack/react-query';
import { paperService } from '../services/paperService.js';

export const useStats = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['statistics'],
    queryFn: paperService.getStatistics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time feel
  });

  return {
    stats: data,
    loading: isLoading,
    error,
    refetch
  };
};

export const useDomains = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['domains'],
    queryFn: paperService.getDomains,
    staleTime: Infinity, // Domains rarely change
  });

  return {
    domains: data || [],
    loading: isLoading
  };
};

export const useCategories = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: paperService.getCategories,
    staleTime: Infinity, // Categories rarely change
  });

  return {
    categories: data || [],
    loading: isLoading
  };
};
