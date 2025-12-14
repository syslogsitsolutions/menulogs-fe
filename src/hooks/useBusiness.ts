/**
 * Business Hooks using React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { businessService } from '@/api';
import type { BusinessRequestWithFile } from '@/api/businessService';
import { useAuthStore } from '@/store/authStore';

export const useBusinesses = () => {
  return useQuery({
    queryKey: ['businesses'],
    queryFn: () => businessService.list(),
  });
};

export const useBusiness = (id: string) => {
  return useQuery({
    queryKey: ['business', id],
    queryFn: () => businessService.get(id),
    enabled: !!id,
  });
};

export const useCreateBusiness = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: BusinessRequestWithFile) => businessService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      
      // Update auth store with new business
      useAuthStore.setState({ business: response.business });
    },
  });
};

export const useUpdateBusiness = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BusinessRequestWithFile> }) =>
      businessService.update(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      queryClient.invalidateQueries({ queryKey: ['business', variables.id] });
      
      // Update auth store if current business
      const currentBusiness = useAuthStore.getState().business;
      if (currentBusiness?.id === variables.id) {
        useAuthStore.setState({ business: response.business });
      }
    },
  });
};

export const useDeleteBusiness = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => businessService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  });
};


