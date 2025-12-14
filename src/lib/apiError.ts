/**
 * API Error Handling
 * Standardized error handling and user-friendly error messages
 */

import { AxiosError } from 'axios';

export interface APIError {
  message: string;
  status?: number;
  code?: string;
  errors?: Array<{
    path: string[];
    message: string;
  }>;
}

/**
 * Parse API error from Axios error
 */
export const parseAPIError = (error: unknown): APIError => {
  if (error instanceof AxiosError) {
    const response = error.response;
    
    // Network error
    if (!response) {
      return {
        message: 'Network error. Please check your internet connection.',
        status: 0,
        code: 'NETWORK_ERROR',
      };
    }
    
    // API error response
    const data = response.data;
    
    // Validation errors (Zod)
    if (data?.errors && Array.isArray(data.errors)) {
      return {
        message: data.error || 'Validation error',
        status: response.status,
        code: 'VALIDATION_ERROR',
        errors: data.errors,
      };
    }
    
    // Standard error
    return {
      message: data?.error || data?.message || 'An error occurred',
      status: response.status,
      code: data?.code,
    };
  }
  
  // Unknown error
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
    };
  }
  
  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  };
};

/**
 * Get user-friendly error message
 */
export const getUserFriendlyErrorMessage = (error: APIError): string => {
  // Common HTTP status codes
  switch (error.status) {
    case 400:
      return error.message || 'Invalid request. Please check your input.';
    case 401:
      return 'Authentication required. Please login again.';
    case 403:
      return 'You don\'t have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return error.message || 'A conflict occurred. The resource may already exist.';
    case 422:
      return error.message || 'Validation failed. Please check your input.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Service unavailable. Please try again later.';
    default:
      return error.message || 'An error occurred. Please try again.';
  }
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (errors?: APIError['errors']): string => {
  if (!errors || errors.length === 0) {
    return '';
  }
  
  return errors
    .map((err) => {
      const field = err.path.join('.');
      return `${field}: ${err.message}`;
    })
    .join('\n');
};

/**
 * Check if error is authentication error
 */
export const isAuthError = (error: APIError): boolean => {
  return error.status === 401 || error.code === 'UNAUTHORIZED';
};

/**
 * Check if error is validation error
 */
export const isValidationError = (error: APIError): boolean => {
  return error.code === 'VALIDATION_ERROR' || error.status === 422;
};

/**
 * Check if error is network error
 */
export const isNetworkError = (error: APIError): boolean => {
  return error.code === 'NETWORK_ERROR' || error.status === 0;
};

