/**
 * Menu Item Hooks using React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { menuItemService } from '@/api';
import type { MenuItemRequestWithFiles } from '@/api/menuItemService';

interface MenuItemFilters {
  categoryId?: string;
  availability?: string;
  search?: string;
}

export const useMenuItems = (locationId: string, filters?: MenuItemFilters) => {
  return useQuery({
    queryKey: ['menuItems', locationId, filters],
    queryFn: () => menuItemService.list(locationId, filters),
    enabled: !!locationId,
  });
};

export const useCreateMenuItem = (locationId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: MenuItemRequestWithFiles) => menuItemService.create(locationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems', locationId] });
    },
  });
};

export const useUpdateMenuItem = (locationId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MenuItemRequestWithFiles> }) =>
      menuItemService.update(id, { ...data, locationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems', locationId] });
    },
  });
};

export const useDeleteMenuItem = (locationId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => menuItemService.delete(id, locationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems', locationId] });
    },
  });
};

export const useUpdateMenuItemAvailability = (locationId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, availability }: { id: string; availability: 'IN_STOCK' | 'OUT_OF_STOCK' | 'HIDDEN' }) =>
      menuItemService.updateAvailability(id, availability, locationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems', locationId] });
    },
  });
};


