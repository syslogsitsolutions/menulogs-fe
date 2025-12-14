/**
 * Public Menu Hooks using React Query (No authentication required)
 */

import { useQuery } from '@tanstack/react-query';
import { publicService } from '@/api';

// Slug-based hooks (NEW - Primary)
export const usePublicMenuBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['publicMenu', 'slug', slug],
    queryFn: () => publicService.getLocationMenuBySlug(slug),
    enabled: !!slug,
    retry: 1,
  });
};

export const usePublicCategoryItemsBySlug = (slug: string, categoryId: string) => {
  return useQuery({
    queryKey: ['publicCategoryItems', 'slug', slug, categoryId],
    queryFn: () => publicService.getCategoryItemsBySlug(slug, categoryId),
    enabled: !!slug && !!categoryId,
    retry: 1,
  });
};

// UUID-based hooks (Backward compatibility)
export const usePublicMenu = (locationId: string) => {
  return useQuery({
    queryKey: ['publicMenu', locationId],
    queryFn: () => publicService.getLocationMenu(locationId),
    enabled: !!locationId,
  });
};

export const usePublicCategoryItems = (locationId: string, categoryId: string) => {
  return useQuery({
    queryKey: ['publicCategoryItems', locationId, categoryId],
    queryFn: () => publicService.getCategoryItems(locationId, categoryId),
    enabled: !!locationId && !!categoryId,
  });
};

// Item and search hooks (work with both)
export const usePublicMenuItem = (itemId: string) => {
  return useQuery({
    queryKey: ['publicMenuItem', itemId],
    queryFn: () => publicService.getMenuItem(itemId),
    enabled: !!itemId,
  });
};

export const usePublicSearch = (query: string, locationId: string) => {
  return useQuery({
    queryKey: ['publicSearch', query, locationId],
    queryFn: () => publicService.searchMenuItems(query, locationId),
    enabled: !!query && !!locationId,
  });
};


