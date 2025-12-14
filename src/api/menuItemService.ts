/**
 * Menu Item API Service
 */

import apiClient from '../lib/apiClient';
import type { MenuItemRequest, MenuItemResponse, MenuItemListResponse, MessageResponse } from './types';

export interface MenuItemRequestWithFiles extends Omit<MenuItemRequest, 'image' | 'images'> {
  image?: string | File;
  images?: (string | File)[];
}

class MenuItemService {
  async list(locationId: string, params?: { categoryId?: string; availability?: string; search?: string }) {
    const response = await apiClient.get<MenuItemListResponse>(`/menu-items/locations/${locationId}`, { params });
    return response.data;
  }

  async create(locationId: string, data: MenuItemRequestWithFiles) {
    // Check if any images are File objects
    const hasFileImages = data.images?.some((img) => img instanceof File) || data.image instanceof File;
    
    if (hasFileImages) {
      // Send as FormData
      const formData = new FormData();
      formData.append('categoryId', data.categoryId);
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', String(data.price));
      
      // Only append File objects to file fields - strings will be in req.body
      if (data.image instanceof File) {
        formData.append('image', data.image);
      }
      // If image is a string URL, it will be in req.body automatically if not in file fields

      // Append multiple images (only File objects)
      if (data.images) {
        data.images.forEach((img) => {
          if (img instanceof File) {
            formData.append('images', img);
          }
        });
      }
      
      // Append string URLs as JSON if we have mixed File/string images
      // The backend will handle combining them
      const stringImages = data.images?.filter((img) => typeof img === 'string') || [];
      if (stringImages.length > 0 || (data.image && typeof data.image === 'string')) {
        const allStringImages = data.image && typeof data.image === 'string' 
          ? [data.image, ...stringImages]
          : stringImages;
        formData.append('existingImages', JSON.stringify(allStringImages));
      }

      // Append other optional fields
      if (data.video) formData.append('video', data.video);
      if (data.ingredients) {
        data.ingredients.forEach((ing) => formData.append('ingredients[]', ing));
      }
      if (data.allergens) {
        data.allergens.forEach((all) => formData.append('allergens[]', all));
      }
      if (data.tags) {
        data.tags.forEach((tag) => formData.append('tags[]', tag));
      }
      if (data.nutritionalInfo) {
        formData.append('nutritionalInfo', JSON.stringify(data.nutritionalInfo));
      }
      if (data.isVegetarian !== undefined) formData.append('isVegetarian', String(data.isVegetarian));
      if (data.isVegan !== undefined) formData.append('isVegan', String(data.isVegan));
      if (data.isGlutenFree !== undefined) formData.append('isGlutenFree', String(data.isGlutenFree));
      if (data.spicyLevel !== undefined) formData.append('spicyLevel', String(data.spicyLevel));
      if (data.availability) formData.append('availability', data.availability);
      if (data.preparationTime) formData.append('preparationTime', data.preparationTime);

      const response = await apiClient.post<MenuItemResponse>(`/menu-items/locations/${locationId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }

    // Otherwise send as JSON (backward compatible)
    const response = await apiClient.post<MenuItemResponse>(`/menu-items/locations/${locationId}`, data);
    return response.data;
  }

  async update(id: string, data: Partial<MenuItemRequestWithFiles>) {
    // Check if any images are File objects
    const hasFileImages = data.images?.some((img) => img instanceof File) || data.image instanceof File;
    
    if (hasFileImages) {
      // Send as FormData
      const formData = new FormData();
      if (data.categoryId) formData.append('categoryId', data.categoryId);
      if (data.name) formData.append('name', data.name);
      if (data.description !== undefined) formData.append('description', data.description);
      if (data.price !== undefined) formData.append('price', String(data.price));
      
      // Send files and preserve order with imageOrder
      // Track which file index maps to which array position
      let fileIndex = 0;
      
      if (data.images && data.images.length > 0) {
        // Build the ordered array structure while collecting files
        const orderedImages: (string | { type: 'file'; fileIndex: number })[] = [];
        
        data.images.forEach((img) => {
          if (img instanceof File) {
            formData.append('images', img);
            orderedImages.push({ type: 'file' as const, fileIndex });
            fileIndex++;
          } else {
            orderedImages.push(img as string);
          }
        });
        
        formData.append('imageOrder', JSON.stringify(orderedImages));
      } else if (data.image instanceof File) {
        formData.append('image', data.image);
        formData.append('imageOrder', JSON.stringify([{ type: 'file' as const, fileIndex: 0 }]));
      }

      // Append other optional fields
      if (data.video !== undefined) {
        formData.append('video', data.video || '');
      }
      if (data.ingredients) {
        data.ingredients.forEach((ing) => formData.append('ingredients[]', ing));
      }
      if (data.allergens) {
        data.allergens.forEach((all) => formData.append('allergens[]', all));
      }
      if (data.tags) {
        data.tags.forEach((tag) => formData.append('tags[]', tag));
      }
      if (data.nutritionalInfo) {
        formData.append('nutritionalInfo', JSON.stringify(data.nutritionalInfo));
      }
      if (data.isVegetarian !== undefined) formData.append('isVegetarian', String(data.isVegetarian));
      if (data.isVegan !== undefined) formData.append('isVegan', String(data.isVegan));
      if (data.isGlutenFree !== undefined) formData.append('isGlutenFree', String(data.isGlutenFree));
      if (data.spicyLevel !== undefined) formData.append('spicyLevel', String(data.spicyLevel));
      if (data.availability) formData.append('availability', data.availability);
      if (data.preparationTime) formData.append('preparationTime', data.preparationTime);

      const response = await apiClient.put<MenuItemResponse>(`/menu-items/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }

    // Otherwise send as JSON (backward compatible)
    const response = await apiClient.put<MenuItemResponse>(`/menu-items/${id}`, data);
    return response.data;
  }

  async delete(id: string) {
    const response = await apiClient.delete<MessageResponse>(`/menu-items/${id}`);
    return response.data;
  }

  async updateAvailability(id: string, availability: 'IN_STOCK' | 'OUT_OF_STOCK' | 'HIDDEN') {
    const response = await apiClient.patch<MenuItemResponse>(`/menu-items/${id}/availability`, { availability });
    return response.data;
  }
}

export default new MenuItemService();

