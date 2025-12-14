/**
 * Banner Hooks using React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bannerService } from '@/api';
import type { BannerRequestWithFile } from '@/api/bannerService';

export const useBanners = (locationId: string) => {
  return useQuery({
    queryKey: ['banners', locationId],
    queryFn: () => bannerService.list(locationId),
    enabled: !!locationId,
  });
};

export const useCreateBanner = (locationId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: BannerRequestWithFile) => bannerService.create(locationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners', locationId] });
    },
  });
};

export const useUpdateBanner = (locationId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BannerRequestWithFile> }) =>
      bannerService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners', locationId] });
    },
  });
};

export const useDeleteBanner = (locationId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => bannerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners', locationId] });
    },
  });
};

export const useToggleBannerActive = (locationId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => bannerService.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners', locationId] });
    },
  });
};


