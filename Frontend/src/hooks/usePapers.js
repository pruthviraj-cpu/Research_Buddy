import { useQuery } from '@tanstack/react-query';
import { paperService } from '../services/paperService.js';

export const usePapers = (filters = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['papers', filters],
    queryFn: () => paperService.getAllPapers(filters),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    papers: data?.papers || [],
    loading: isLoading,
    error,
    totalCount: data?.totalCount || 0,
    totalPages: data?.totalPages || 0,
    currentPage: data?.currentPage || 1,
    refetch
  };
};

export const usePaper = (id) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['paper', id],
    queryFn: () => paperService.getPaperById(id),
    enabled: !!id,
  });

  return {
    paper: data,
    loading: isLoading,
    error
  };
};

export const useRecentPapers = (limit = 5) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['recent-papers', limit],
    queryFn: () => paperService.getRecentPapers(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    papers: data || [],
    loading: isLoading,
    error
  };
};
