/**
 * Featured Section Hooks using React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { featuredSectionService } from '@/api';
import type { FeaturedSectionRequestWithFile } from '@/api/featuredSectionService';

export const useFeaturedSections = (locationId: string) => {
  return useQuery({
    queryKey: ['featuredSections', locationId],
    queryFn: () => featuredSectionService.list(locationId),
    enabled: !!locationId,
  });
};

export const useCreateFeaturedSection = (locationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FeaturedSectionRequestWithFile) => featuredSectionService.create(locationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featuredSections', locationId] });
      // Also invalidate public menu cache if needed
      queryClient.invalidateQueries({ queryKey: ['publicMenu'] });
    },
  });
};

export const useUpdateFeaturedSection = (locationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FeaturedSectionRequestWithFile> }) =>
      featuredSectionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featuredSections', locationId] });
      queryClient.invalidateQueries({ queryKey: ['publicMenu'] });
    },
  });
};

export const useDeleteFeaturedSection = (locationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => featuredSectionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featuredSections', locationId] });
      queryClient.invalidateQueries({ queryKey: ['publicMenu'] });
    },
  });
};

export const useToggleFeaturedSectionActive = (locationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => featuredSectionService.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featuredSections', locationId] });
      queryClient.invalidateQueries({ queryKey: ['publicMenu'] });
    },
  });
};

