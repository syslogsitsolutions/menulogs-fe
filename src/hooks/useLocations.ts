/**
 * Location Hooks using React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { locationService } from '@/api';
import type { LocationRequestWithFile } from '@/api/locationService';
import { useAuthStore } from '@/store/authStore';

export const useLocations = () => {
  return useQuery({
    queryKey: ['locations'],
    queryFn: () => locationService.list(),
  });
};

export const useLocation = (id: string) => {
  return useQuery({
    queryKey: ['location', id],
    queryFn: () => locationService.get(id),
    enabled: !!id,
  });
};

export const useCreateLocation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: LocationRequestWithFile) => locationService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      
      // Set as current location if first location
      const locations = useAuthStore.getState().currentLocation;
      if (!locations) {
        useAuthStore.setState({ currentLocation: response.location });
      }
    },
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LocationRequestWithFile> }) =>
      locationService.update(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['location', variables.id] });
      
      // Invalidate public menu cache for this location (important for brand color updates)
      // This ensures the public view gets fresh data with updated brandColor
      if (response.location?.slug) {
        queryClient.invalidateQueries({ queryKey: ['publicMenu', 'slug', response.location.slug] });
      }
      
      // Update current location if it's the one being updated
      const currentLocation = useAuthStore.getState().currentLocation;
      if (currentLocation?.id === variables.id) {
        useAuthStore.setState({ currentLocation: response.location });
      }
    },
  });
};

export const useDeleteLocation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => locationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
};


