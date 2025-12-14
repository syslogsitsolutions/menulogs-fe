/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */

import apiClient from '../lib/apiClient';
import config from '../lib/config';
import type {
  LoginRequest,
  SignupRequest,
  AuthResponse,
  RefreshTokenResponse,
  MessageResponse,
} from './types';

class AuthService {
  /**
   * User signup
   */
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/signup', data);
    
    // Store tokens
    if (response.data.accessToken) {
      localStorage.setItem(config.storageKeys.accessToken, response.data.accessToken);
    }
    
    // Store user data
    if (response.data.user) {
      localStorage.setItem(config.storageKeys.user, JSON.stringify(response.data.user));
    }
    
    if (response.data.business) {
      localStorage.setItem(config.storageKeys.business, JSON.stringify(response.data.business));
    }
    
    return response.data;
  }

  /**
   * User login
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data, {
      withCredentials: true,
    });
    
    // Store tokens
    if (response.data.accessToken) {
      localStorage.setItem(config.storageKeys.accessToken, response.data.accessToken);
    }
    
    // Store user data
    if (response.data.user) {
      localStorage.setItem(config.storageKeys.user, JSON.stringify(response.data.user));
    }
    
    if (response.data.business) {
      localStorage.setItem(config.storageKeys.business, JSON.stringify(response.data.business));
    }
    
    if (response.data.locations && response.data.locations.length > 0) {
      localStorage.setItem(
        config.storageKeys.currentLocation,
        JSON.stringify(response.data.locations[0])
      );
    }
    
    return response.data;
  }

  /**
   * Refresh access token
   * Note: Refresh token is stored in httpOnly cookie, so we don't need to pass it
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>(
      '/auth/refresh',
      {}, // Empty body - refresh token comes from httpOnly cookie
      { withCredentials: true }
    );
    
    if (response.data.accessToken) {
      localStorage.setItem(config.storageKeys.accessToken, response.data.accessToken);
    }
    
    return response.data;
  }

  /**
   * User logout
   */
  async logout(): Promise<MessageResponse> {
    try {
      const response = await apiClient.post<MessageResponse>('/auth/logout', {}, {
        withCredentials: true,
      });
      
      return response.data;
    } finally {
      // Clear local storage regardless of API response
      this.clearLocalStorage();
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<AuthResponse> {
    const response = await apiClient.get<AuthResponse>('/auth/me');
    
    // Update stored user data
    if (response.data.user) {
      localStorage.setItem(config.storageKeys.user, JSON.stringify(response.data.user));
    }
    
    if (response.data.business) {
      localStorage.setItem(config.storageKeys.business, JSON.stringify(response.data.business));
    }
    
    return response.data;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(config.storageKeys.accessToken);
    return !!token;
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(config.storageKeys.accessToken);
  }

  /**
   * Clear local storage (logout)
   */
  clearLocalStorage(): void {
    localStorage.removeItem(config.storageKeys.accessToken);
    localStorage.removeItem(config.storageKeys.refreshToken);
    localStorage.removeItem(config.storageKeys.user);
    localStorage.removeItem(config.storageKeys.business);
    localStorage.removeItem(config.storageKeys.currentLocation);
  }

  /**
   * Request password reset (forgot password)
   */
  async forgotPassword(email: string): Promise<{ message: string; token?: string }> {
    const response = await apiClient.post<{ message: string; token?: string }>('/auth/forgot-password', { email });
    return response.data;
  }

  /**
   * Reset password using token
   */
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', { token, password });
    return response.data;
  }

  /**
   * Change password (authenticated users)
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  }
}

export default new AuthService();

