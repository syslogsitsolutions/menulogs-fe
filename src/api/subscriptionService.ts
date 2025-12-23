/**
 * Subscription API Service
 */

import apiClient from '../lib/apiClient';
import type {
  PlansResponse,
  SubscriptionResponse,
  CreateSubscriptionRequest,
  ChangePlanRequest,
  BillingHistoryResponse,
  UsageResponse,
  CheckoutResponse,
} from './types';

class SubscriptionService {
  async getPlans() {
    const response = await apiClient.get<PlansResponse>('/subscriptions/plans');
    return response.data;
  }

  async getSubscription(locationId: string) {
    const response = await apiClient.get<SubscriptionResponse>(`/subscriptions/${locationId}`);
    return response.data;
  }

  async createSubscription(data: CreateSubscriptionRequest) {
    const response = await apiClient.post<SubscriptionResponse>('/subscriptions', data);
    return response.data;
  }

  async changePlan(subscriptionId: string, data: ChangePlanRequest) {
    const response = await apiClient.put<SubscriptionResponse>(`/subscriptions/${subscriptionId}/change-plan`, data);
    return response.data;
  }

  async cancelSubscription(subscriptionId: string) {
    const response = await apiClient.post<SubscriptionResponse>(`/subscriptions/${subscriptionId}/cancel`);
    return response.data;
  }

  async getBillingHistory(locationId: string) {
    const response = await apiClient.get<BillingHistoryResponse>(`/subscriptions/${locationId}/billing-history`);
    return response.data;
  }

  async getUsage(locationId: string) {
    const response = await apiClient.get<UsageResponse>(`/subscriptions/${locationId}/usage`);
    return response.data;
  }

  async createCheckoutSession(locationId: string, plan: string, billingCycle: 'MONTHLY' | 'YEARLY') {
    const response = await apiClient.post<CheckoutResponse>(`/subscriptions/${locationId}/checkout`, {
      plan,
      billingCycle,
    });
    return response.data;
  }

  async getFeatures(plan: string) {
    const response = await apiClient.get(`/subscriptions/features/${plan}`);
    return response.data;
  }

  async checkFeatureAccess(plan: string, feature: string) {
    const response = await apiClient.get(`/subscriptions/check-feature/${plan}/${feature}`);
    return response.data;
  }
}

export default new SubscriptionService();

