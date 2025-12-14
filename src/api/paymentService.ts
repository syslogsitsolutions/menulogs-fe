/**
 * Payment API Service
 * 
 * Handles payment order creation, verification, and processing.
 */

import apiClient from '../lib/apiClient';
import type {
  PaymentConfigResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  PaymentResponse,
  RefundRequest,
  RefundResponse,
} from './types';

class PaymentService {
  /**
   * Get Razorpay configuration
   */
  async getConfig() {
    const response = await apiClient.get<PaymentConfigResponse>('/payments/config');
    return response.data;
  }

  /**
   * Create payment order for subscription
   */
  async createOrder(data: CreateOrderRequest) {
    const response = await apiClient.post<CreateOrderResponse>('/payments/create-order', data);
    return response.data;
  }

  /**
   * Verify payment after Razorpay checkout
   */
  async verifyPayment(data: VerifyPaymentRequest) {
    const response = await apiClient.post<VerifyPaymentResponse>('/payments/verify', data);
    return response.data;
  }

  /**
   * Get payment details
   */
  async getPayment(paymentId: string) {
    const response = await apiClient.get<PaymentResponse>(`/payments/${paymentId}`);
    return response.data;
  }

  /**
   * Get order details
   */
  async getOrder(orderId: string) {
    const response = await apiClient.get(`/payments/orders/${orderId}`);
    return response.data;
  }

  /**
   * Request refund
   */
  async refundPayment(paymentId: string, data: Omit<RefundRequest, 'paymentId'>) {
    const response = await apiClient.post<RefundResponse>(`/payments/${paymentId}/refund`, data);
    return response.data;
  }
}

export default new PaymentService();

