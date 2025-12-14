/**
 * Featured Section API Service
 */

import apiClient from '../lib/apiClient';
import type { FeaturedSectionRequest, FeaturedSectionResponse, FeaturedSectionListResponse, MessageResponse } from './types';

export interface FeaturedSectionRequestWithFile extends Omit<FeaturedSectionRequest, 'image'> {
  image: string | File;
  applyToAllLocations?: boolean;
}

class FeaturedSectionService {
  async list(locationId: string) {
    const response = await apiClient.get<FeaturedSectionListResponse>(`/featured-sections/locations/${locationId}`);
    return response.data;
  }

  async create(locationId: string, data: FeaturedSectionRequestWithFile) {
    // If image is a File, send as FormData
    if (data.image instanceof File) {
      const formData = new FormData();
      formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      formData.append('features', JSON.stringify(data.features));
      if (data.buttonText) formData.append('buttonText', data.buttonText);
      if (data.buttonLink) formData.append('buttonLink', data.buttonLink);
      if (data.imagePosition) formData.append('imagePosition', data.imagePosition);
      if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
      if (data.applyToAllLocations !== undefined) formData.append('applyToAllLocations', String(data.applyToAllLocations));
      formData.append('image', data.image);

      const response = await apiClient.post<FeaturedSectionResponse | { featuredSections: any[]; message: string }>(`/featured-sections/locations/${locationId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }

    // Otherwise send as JSON (backward compatible)
    const response = await apiClient.post<FeaturedSectionResponse>(`/featured-sections/locations/${locationId}`, data);
    return response.data;
  }

  async update(id: string, data: Partial<FeaturedSectionRequestWithFile>) {
    // If image is a File, send as FormData
    if (data.image instanceof File) {
      const formData = new FormData();
      if (data.title) formData.append('title', data.title);
      if (data.description !== undefined) {
        formData.append('description', data.description || '');
      }
      if (data.features) formData.append('features', JSON.stringify(data.features));
      if (data.buttonText !== undefined) {
        formData.append('buttonText', data.buttonText || '');
      }
      if (data.buttonLink !== undefined) {
        formData.append('buttonLink', data.buttonLink || '');
      }
      if (data.imagePosition) formData.append('imagePosition', data.imagePosition);
      if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
      formData.append('image', data.image);

      const response = await apiClient.put<FeaturedSectionResponse>(`/featured-sections/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }

    // Otherwise send as JSON (backward compatible)
    const jsonData: any = { ...data };
    if (data.features) {
      jsonData.features = data.features;
    }
    const response = await apiClient.put<FeaturedSectionResponse>(`/featured-sections/${id}`, jsonData);
    return response.data;
  }

  async delete(id: string) {
    const response = await apiClient.delete<MessageResponse>(`/featured-sections/${id}`);
    return response.data;
  }

  async toggleActive(id: string) {
    const response = await apiClient.patch<FeaturedSectionResponse>(`/featured-sections/${id}/toggle`);
    return response.data;
  }
}

export default new FeaturedSectionService();

