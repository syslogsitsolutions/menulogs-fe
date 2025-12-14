/**
 * Payment Hooks
 * 
 * React Query hooks for payment operations including Razorpay integration.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/api';
import type {
  CreateOrderRequest,
  VerifyPaymentRequest,
  RefundRequest,
} from '@/api/types';

/**
 * Get Razorpay configuration
 */
export const usePaymentConfig = () => {
  return useQuery({
    queryKey: ['paymentConfig'],
    queryFn: () => paymentService.getConfig(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

/**
 * Create payment order
 */
export const useCreateOrder = () => {
  return useMutation({
    mutationFn: (data: CreateOrderRequest) => paymentService.createOrder(data),
  });
};

/**
 * Verify payment after Razorpay checkout
 */
export const useVerifyPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VerifyPaymentRequest) => paymentService.verifyPayment(data),
    onSuccess: (_, variables) => {
      // Invalidate subscription and location queries
      queryClient.invalidateQueries({ queryKey: ['subscription', variables.locationId] });
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['usage', variables.locationId] });
    },
  });
};

/**
 * Get payment details
 */
export const usePayment = (paymentId: string) => {
  return useQuery({
    queryKey: ['payment', paymentId],
    queryFn: () => paymentService.getPayment(paymentId),
    enabled: !!paymentId,
  });
};

/**
 * Get order details
 */
export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => paymentService.getOrder(orderId),
    enabled: !!orderId,
  });
};

/**
 * Request refund
 */
export const useRefundPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, ...data }: RefundRequest) =>
      paymentService.refundPayment(paymentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payment', variables.paymentId] });
      queryClient.invalidateQueries({ queryKey: ['billingHistory'] });
    },
  });
};

