/**
 * Payment Method Hooks
 * 
 * React Query hooks for managing saved payment methods.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentMethodService } from '@/api';
import type { AddPaymentMethodRequest } from '@/api/types';

/**
 * Get all payment methods
 */
export const usePaymentMethods = () => {
  return useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => paymentMethodService.getPaymentMethods(),
  });
};

/**
 * Get a specific payment method
 */
export const usePaymentMethod = (id: string) => {
  return useQuery({
    queryKey: ['paymentMethod', id],
    queryFn: () => paymentMethodService.getPaymentMethod(id),
    enabled: !!id,
  });
};

/**
 * Add new payment method
 */
export const useAddPaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddPaymentMethodRequest) =>
      paymentMethodService.addPaymentMethod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    },
  });
};

/**
 * Set default payment method
 */
export const useSetDefaultPaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => paymentMethodService.setDefaultPaymentMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    },
  });
};

/**
 * Delete payment method
 */
export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => paymentMethodService.deletePaymentMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    },
  });
};

/**
 * Create Razorpay customer
 */
export const useCreateCustomer = () => {
  return useMutation({
    mutationFn: () => paymentMethodService.createCustomer(),
  });
};

