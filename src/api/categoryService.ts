/**
 * Category API Service
 */

import apiClient from '../lib/apiClient';
import type { CategoryRequest, CategoryResponse, CategoryListResponse, MessageResponse } from './types';

export interface CategoryRequestWithFile extends Omit<CategoryRequest, 'image'> {
  image: string | File;
}

class CategoryService {
  async list(locationId: string) {
    const response = await apiClient.get<CategoryListResponse>(`/categories/locations/${locationId}`);
    return response.data;
  }

  async create(locationId: string, data: CategoryRequestWithFile) {
    // If image is a File, send as FormData
    if (data.image instanceof File) {
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      if (data.icon) formData.append('icon', data.icon);
      if (data.isVisible !== undefined) formData.append('isVisible', String(data.isVisible));
      formData.append('image', data.image);

      const response = await apiClient.post<CategoryResponse>(`/categories/locations/${locationId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }

    // Otherwise send as JSON (backward compatible)
    const response = await apiClient.post<CategoryResponse>(`/categories/locations/${locationId}`, data);
    return response.data;
  }

  async update(id: string, data: Partial<CategoryRequestWithFile>) {
    // If image is a File, send as FormData
    if (data.image instanceof File) {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.description !== undefined) {
        formData.append('description', data.description || '');
      }
      if (data.icon) formData.append('icon', data.icon);
      if (data.isVisible !== undefined) formData.append('isVisible', String(data.isVisible));
      formData.append('image', data.image);

      const response = await apiClient.put<CategoryResponse>(`/categories/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }

    // Otherwise send as JSON (backward compatible)
    const response = await apiClient.put<CategoryResponse>(`/categories/${id}`, data);
    return response.data;
  }

  async delete(id: string) {
    const response = await apiClient.delete<MessageResponse>(`/categories/${id}`);
    return response.data;
  }

  async toggleVisibility(id: string) {
    const response = await apiClient.patch<CategoryResponse>(`/categories/${id}/visibility`);
    return response.data;
  }
}

export default new CategoryService();

