/**
 * Business API Service
 */

import apiClient from '../lib/apiClient';
import type { BusinessRequest, BusinessResponse, BusinessListResponse, MessageResponse } from './types';

export interface BusinessRequestWithFile extends Omit<BusinessRequest, 'logo' | 'aboutImage'> {
  logo?: string | File;
  aboutImage?: string | File;
}

class BusinessService {
  async list() {
    const response = await apiClient.get<BusinessListResponse>('/businesses');
    return response.data;
  }

  async create(data: BusinessRequestWithFile) {
    // If logo is a File, send as FormData
    if (data.logo instanceof File) {
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      formData.append('image', data.logo); // Use 'image' field name to match Multer middleware

      const response = await apiClient.post<BusinessResponse>('/businesses', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }

    // Otherwise send as JSON (backward compatible)
    const response = await apiClient.post<BusinessResponse>('/businesses', data);
    return response.data;
  }

  async get(id: string) {
    const response = await apiClient.get<BusinessResponse>(`/businesses/${id}`);
    return response.data;
  }

  async update(id: string, data: Partial<BusinessRequestWithFile>) {
    // If logo or aboutImage is a File, send as FormData
    if (data.logo instanceof File || data.aboutImage instanceof File) {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.description !== undefined) {
        formData.append('description', data.description || '');
      }
      
      // Handle logo file upload
      if (data.logo instanceof File) {
        formData.append('image', data.logo); // Use 'image' field name to match Multer middleware
      } else if (data.logo !== undefined && typeof data.logo === 'string') {
        formData.append('logo', data.logo);
      }
      
      // Handle aboutImage file upload
      if (data.aboutImage instanceof File) {
        formData.append('aboutImage', data.aboutImage);
      } else if (data.aboutImage !== undefined && typeof data.aboutImage === 'string') {
        formData.append('aboutImage', data.aboutImage);
      }
      
      // Append other optional fields
      if (data.brandDescription !== undefined) {
        formData.append('brandDescription', data.brandDescription || '');
      }
      if (data.facebookUrl !== undefined) {
        formData.append('facebookUrl', data.facebookUrl || '');
      }
      if (data.instagramUrl !== undefined) {
        formData.append('instagramUrl', data.instagramUrl || '');
      }
      if (data.twitterUrl !== undefined) {
        formData.append('twitterUrl', data.twitterUrl || '');
      }
      if (data.linkedinUrl !== undefined) {
        formData.append('linkedinUrl', data.linkedinUrl || '');
      }
      if (data.youtubeUrl !== undefined) {
        formData.append('youtubeUrl', data.youtubeUrl || '');
      }
      if (data.aboutContent !== undefined) {
        formData.append('aboutContent', data.aboutContent || '');
      }

      const response = await apiClient.put<BusinessResponse>(`/businesses/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }

    // Otherwise send as JSON (backward compatible)
    const response = await apiClient.put<BusinessResponse>(`/businesses/${id}`, data);
    return response.data;
  }

  async delete(id: string) {
    const response = await apiClient.delete<MessageResponse>(`/businesses/${id}`);
    return response.data;
  }
}

export default new BusinessService();

