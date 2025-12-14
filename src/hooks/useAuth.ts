/**
 * Authentication Hooks using React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/api';
import type { LoginRequest, SignupRequest } from '@/api/types';
import { useAuthStore } from '@/store/authStore';
import { parseAPIError, getUserFriendlyErrorMessage } from '@/lib/apiError';

export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      try {
        return await authService.login(data);
      } catch (error) {
        const apiError = parseAPIError(error);
        throw new Error(getUserFriendlyErrorMessage(apiError));
      }
    },
    onSuccess: (response) => {
      // Update auth store
      useAuthStore.setState({
        user: response.user,
        business: response.business,
        isAuthenticated: true,
        isLoading: false,
      });
      
      // Set current location if available
      if (response.locations && response.locations.length > 0) {
        useAuthStore.setState({ currentLocation: response.locations[0] });
      }
      
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries();
      
      // Navigate to dashboard
      navigate('/dashboard');
    },
  });
};

export const useSignup = () => {
  const navigate = useNavigate();
  
  return useMutation({
    mutationFn: async (data: SignupRequest) => {
      try {
        return await authService.signup(data);
      } catch (error) {
        const apiError = parseAPIError(error);
        throw new Error(getUserFriendlyErrorMessage(apiError));
      }
    },
    onSuccess: (response) => {
      useAuthStore.setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
      
      // Navigate to business setup
      navigate('/business-setup');
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear auth store
      useAuthStore.setState({
        user: null,
        business: null,
        currentLocation: null,
        isAuthenticated: false,
      });
      
      // Clear all queries
      queryClient.clear();
      
      // Navigate to login
      navigate('/login');
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getCurrentUser(),
    enabled: authService.isAuthenticated(),
    retry: false,
  });
};


