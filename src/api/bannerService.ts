/**
 * Banner API Service
 */

import apiClient from '../lib/apiClient';
import type { BannerRequest, BannerResponse, BannerListResponse, MessageResponse } from './types';

export interface BannerRequestWithFile extends Omit<BannerRequest, 'image'> {
  image: string | File;
}

class BannerService {
  async list(locationId: string) {
    const response = await apiClient.get<BannerListResponse>(`/banners/locations/${locationId}`);
    return response.data;
  }

  async create(locationId: string, data: BannerRequestWithFile) {
    // If image is a File, send as FormData
    if (data.image instanceof File) {
      const formData = new FormData();
      formData.append('title', data.title);
      if (data.subtitle) formData.append('subtitle', data.subtitle);
      if (data.video) formData.append('video', data.video);
      if (data.link) formData.append('link', data.link);
      if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
      formData.append('image', data.image);

      const response = await apiClient.post<BannerResponse>(`/banners/locations/${locationId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }

    // Otherwise send as JSON (backward compatible)
    const response = await apiClient.post<BannerResponse>(`/banners/locations/${locationId}`, data);
    return response.data;
  }

  async update(id: string, data: Partial<BannerRequestWithFile>) {
    // If image is a File, send as FormData
    if (data.image instanceof File) {
      const formData = new FormData();
      if (data.title) formData.append('title', data.title);
      if (data.subtitle !== undefined) {
        formData.append('subtitle', data.subtitle || '');
      }
      if (data.video) formData.append('video', data.video);
      if (data.link) formData.append('link', data.link);
      if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
      formData.append('image', data.image);

      const response = await apiClient.put<BannerResponse>(`/banners/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }

    // Otherwise send as JSON (backward compatible)
    const response = await apiClient.put<BannerResponse>(`/banners/${id}`, data);
    return response.data;
  }

  async delete(id: string) {
    const response = await apiClient.delete<MessageResponse>(`/banners/${id}`);
    return response.data;
  }

  async toggleActive(id: string) {
    const response = await apiClient.patch<BannerResponse>(`/banners/${id}/toggle`);
    return response.data;
  }
}

export default new BannerService();

