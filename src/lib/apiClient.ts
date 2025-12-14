/**
 * API Client
 * Axios instance with interceptors for authentication and error handling
 */

import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import config from './config';

// Create axios instance
const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: config.apiTimeout,
  withCredentials: true, // Always send cookies (for refresh token)
  maxContentLength: 52428800, // 50MB - Increased to accommodate 3 base64-encoded images
  maxBodyLength: 52428800, // 50MB - Increased to accommodate 3 base64-encoded images
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (requestConfig: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(config.storageKeys.accessToken);
    
    if (token && requestConfig.headers) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    
    if (config.features.enableDebugMode) {
      console.log('[API Request]', {
        method: requestConfig.method?.toUpperCase(),
        url: requestConfig.url,
        data: requestConfig.data,
      });
    }
    
    return requestConfig;
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (config.features.enableDebugMode) {
      console.log('[API Response]', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    if (config.features.enableDebugMode) {
      console.error('[API Response Error]', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
      });
    }
    
    // Handle 401 Unauthorized - Try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Skip refresh for auth endpoints to avoid infinite loops
      if (originalRequest.url?.includes('/auth/login') || 
          originalRequest.url?.includes('/auth/signup') ||
          originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }
      
      try {
        // Refresh token is stored in httpOnly cookie, so we just call the endpoint
        // withCredentials ensures cookies are sent automatically
        if (config.features.enableDebugMode) {
          console.log('[Token Refresh] Attempting to refresh token...');
        }

        const response = await axios.post(
          `${config.apiUrl}/auth/refresh`,
          {}, // Empty body - refresh token comes from cookie
          {
            withCredentials: true, // Critical: must be true to send cookies
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (config.features.enableDebugMode) {
          console.log('[Token Refresh] Response:', {
            status: response.status,
            hasAccessToken: !!response.data?.accessToken,
          });
        }
        
        const { accessToken } = response.data;
        
        if (!accessToken) {
          throw new Error('No access token in refresh response');
        }

        // Update token in localStorage
        localStorage.setItem(config.storageKeys.accessToken, accessToken);
        
        if (config.features.enableDebugMode) {
          console.log('[Token Refresh] Token updated, retrying original request...');
        }
        
        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        // Ensure withCredentials is set for the retry
        originalRequest.withCredentials = true;
        
        return apiClient(originalRequest);
      } catch (refreshError: any) {
        console.error('[Token Refresh Failed]', {
          error: refreshError,
          message: refreshError?.message,
          response: refreshError?.response?.data,
          status: refreshError?.response?.status,
          url: refreshError?.config?.url,
        });
        
        // Refresh failed - Clear auth and redirect to login
        localStorage.removeItem(config.storageKeys.accessToken);
        localStorage.removeItem(config.storageKeys.refreshToken);
        localStorage.removeItem(config.storageKeys.user);
        localStorage.removeItem(config.storageKeys.business);
        localStorage.removeItem(config.storageKeys.currentLocation);
        
        // Clear authStore
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    return Promise.reject(error);
  }
);

export default apiClient;

