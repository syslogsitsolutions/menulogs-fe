/**
 * Payment Method API Service
 * 
 * Handles saved payment methods management.
 */

import apiClient from '../lib/apiClient';
import type {
  PaymentMethodListResponse,
  PaymentMethodResponse,
  AddPaymentMethodRequest,
  AddPaymentMethodResponse,
  MessageResponse,
} from './types';

class PaymentMethodService {
  /**
   * Get all saved payment methods
   */
  async getPaymentMethods() {
    const response = await apiClient.get<PaymentMethodListResponse>('/payment-methods');
    return response.data;
  }

  /**
   * Get a specific payment method
   */
  async getPaymentMethod(id: string) {
    const response = await apiClient.get<PaymentMethodResponse>(`/payment-methods/${id}`);
    return response.data;
  }

  /**
   * Add a new payment method
   */
  async addPaymentMethod(data: AddPaymentMethodRequest) {
    const response = await apiClient.post<AddPaymentMethodResponse>('/payment-methods', data);
    return response.data;
  }

  /**
   * Set a payment method as default
   */
  async setDefaultPaymentMethod(id: string) {
    const response = await apiClient.patch<MessageResponse>(`/payment-methods/${id}/set-default`);
    return response.data;
  }

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(id: string) {
    const response = await apiClient.delete<MessageResponse>(`/payment-methods/${id}`);
    return response.data;
  }

  /**
   * Create Razorpay customer
   */
  async createCustomer() {
    const response = await apiClient.post('/payment-methods/create-customer');
    return response.data;
  }
}

export default new PaymentMethodService();

