/**
 * Location API Service
 */

import apiClient from '../lib/apiClient';
import type { LocationRequest, LocationResponse, LocationListResponse, MessageResponse, SlugCheckResponse } from './types';

export interface LocationRequestWithFile extends Omit<LocationRequest, 'contactImage'> {
  contactImage?: string | File;
}

class LocationService {
  async list() {
    const response = await apiClient.get<LocationListResponse>('/locations');
    return response.data;
  }

  async create(data: LocationRequestWithFile) {
    // If contactImage is a File, send as FormData
    if (data.contactImage instanceof File) {
      const formData = new FormData();
      formData.append('businessId', data.businessId);
      formData.append('name', data.name);
      if (data.slug) formData.append('slug', data.slug);
      formData.append('address', data.address);
      formData.append('city', data.city);
      formData.append('state', data.state);
      formData.append('zipCode', data.zipCode);
      formData.append('country', data.country);
      formData.append('phone', data.phone);
      formData.append('email', data.email);
      formData.append('isActive', data.isActive ? 'true' : 'false');
      formData.append('openingHours', JSON.stringify(data.openingHours));
      if (data.contactContent) formData.append('contactContent', data.contactContent);
      formData.append('contactImage', data.contactImage);
      if (data.mapEmbedUrl) formData.append('mapEmbedUrl', data.mapEmbedUrl);
      if (data.googleReviewUrl) formData.append('googleReviewUrl', data.googleReviewUrl);

      const response = await apiClient.post<LocationResponse>('/locations', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }

    // Otherwise send as JSON (backward compatible)
    const response = await apiClient.post<LocationResponse>('/locations', data);
    return response.data;
  }

  async get(id: string) {
    const response = await apiClient.get<LocationResponse>(`/locations/${id}`);
    return response.data;
  }

  async update(id: string, data: Partial<LocationRequestWithFile>) {
    // If contactImage is a File, send as FormData
    if (data.contactImage instanceof File) {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.address) formData.append('address', data.address);
      if (data.city) formData.append('city', data.city);
      if (data.state) formData.append('state', data.state);
      if (data.zipCode) formData.append('zipCode', data.zipCode);
      if (data.country) formData.append('country', data.country);
      if (data.phone) formData.append('phone', data.phone);
      if (data.email) formData.append('email', data.email);
      if (data.isActive !== undefined) formData.append('isActive', data.isActive ? 'true' : 'false');
      if (data.openingHours) formData.append('openingHours', JSON.stringify(data.openingHours));
      if (data.contactContent !== undefined) formData.append('contactContent', data.contactContent || '');
      formData.append('contactImage', data.contactImage);
      if (data.mapEmbedUrl !== undefined) formData.append('mapEmbedUrl', data.mapEmbedUrl || '');
      if (data.googleReviewUrl !== undefined) formData.append('googleReviewUrl', data.googleReviewUrl || '');
      if (data.brandColor) formData.append('brandColor', data.brandColor);

      const response = await apiClient.put<LocationResponse>(`/locations/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }

    // Otherwise send as JSON (backward compatible)
    const response = await apiClient.put<LocationResponse>(`/locations/${id}`, data);
    return response.data;
  }

  async delete(id: string) {
    const response = await apiClient.delete<MessageResponse>(`/locations/${id}`);
    return response.data;
  }

  async checkSlug(slug: string, excludeId?: string) {
    const response = await apiClient.get<SlugCheckResponse>(`/locations/check-slug/${slug}`, {
      params: excludeId ? { excludeId } : {},
    });
    return response.data;
  }

  // Helper method to generate slug from name
  generateSlug(name: string, city?: string): string {
    const text = city ? `${name}-${city}` : name;
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

export default new LocationService();

