/**
 * Category Hooks using React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/api';
import type { CategoryRequestWithFile } from '@/api/categoryService';

export const useCategories = (locationId: string) => {
  return useQuery({
    queryKey: ['categories', locationId],
    queryFn: () => categoryService.list(locationId),
    enabled: !!locationId,
  });
};

export const useCreateCategory = (locationId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CategoryRequestWithFile) => categoryService.create(locationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', locationId] });
    },
  });
};

export const useUpdateCategory = (locationId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CategoryRequestWithFile> }) =>
      categoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', locationId] });
    },
  });
};

export const useDeleteCategory = (locationId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', locationId] });
      // Also invalidate menu items as they depend on categories
      queryClient.invalidateQueries({ queryKey: ['menuItems', locationId] });
    },
  });
};

export const useToggleCategoryVisibility = (locationId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => categoryService.toggleVisibility(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', locationId] });
    },
  });
};


