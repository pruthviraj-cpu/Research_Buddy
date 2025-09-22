import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paperService } from '../services/paperService.js';

export const useAddPaper = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: paperService.addPaper,
    onSuccess: () => {
      // Invalidate and refetch papers and stats
      queryClient.invalidateQueries(['papers']);
      queryClient.invalidateQueries(['statistics']);
      queryClient.invalidateQueries(['recent-papers']);
    },
  });

  return {
    addPaper: mutation.mutate,
    loading: mutation.isLoading,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset
  };
};

export const useUpdatePaper = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }) => paperService.updatePaper(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['papers']);
      queryClient.invalidateQueries(['statistics']);
    },
  });

  return {
    updatePaper: mutation.mutate,
    loading: mutation.isLoading,
    error: mutation.error,
    isSuccess: mutation.isSuccess
  };
};

export const useDeletePaper = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: paperService.deletePaper,
    onSuccess: () => {
      queryClient.invalidateQueries(['papers']);
      queryClient.invalidateQueries(['statistics']);
      queryClient.invalidateQueries(['recent-papers']);
    },
  });

  return {
    deletePaper: mutation.mutate,
    loading: mutation.isLoading,
    error: mutation.error,
    isSuccess: mutation.isSuccess
  };
};
