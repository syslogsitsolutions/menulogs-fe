/**
 * Public API Service (Customer-facing, no authentication required)
 */

import apiClient from '../lib/apiClient';
import type { PublicMenuResponse, PublicMenuItemResponse, PublicSearchResponse, AboutPageResponse, ContactPageResponse } from './types';

class PublicService {
  // Slug-based methods (NEW - Primary)
  async getLocationMenuBySlug(slug: string) {
    const response = await apiClient.get<PublicMenuResponse>(`/public/locations/by-slug/${slug}/menu`);
    return response.data;
  }

  async getCategoryItemsBySlug(slug: string, categoryId: string) {
    const response = await apiClient.get<{ location: any; category: any }>(`/public/locations/by-slug/${slug}/categories/${categoryId}`);
    return response.data;
  }

  // UUID-based methods (Backward compatibility)
  async getLocationMenu(locationId: string) {
    const response = await apiClient.get<PublicMenuResponse>(`/public/locations/${locationId}/menu`);
    return response.data;
  }

  async getCategoryItems(locationId: string, categoryId: string) {
    const response = await apiClient.get<{ category: any }>(`/public/locations/${locationId}/categories/${categoryId}`);
    return response.data;
  }

  // Item and search methods
  async getMenuItem(itemId: string) {
    const response = await apiClient.get<PublicMenuItemResponse>(`/public/menu-items/${itemId}`);
    return response.data;
  }

  async searchMenuItems(query: string, locationId: string) {
    const response = await apiClient.get<PublicSearchResponse>('/public/search', {
      params: { q: query, locationId },
    });
    return response.data;
  }

  // About and Contact pages
  async getAboutPage(slug: string) {
    const response = await apiClient.get<AboutPageResponse>(`/public/locations/by-slug/${slug}/about`);
    return response.data;
  }

  async getContactPage(slug: string) {
    const response = await apiClient.get<ContactPageResponse>(`/public/locations/by-slug/${slug}/contact`);
    return response.data;
  }
}

export default new PublicService();

