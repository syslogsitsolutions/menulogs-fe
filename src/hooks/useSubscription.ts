/**
 * Subscription Hooks using React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '@/api';
import type { CreateSubscriptionRequest, ChangePlanRequest } from '@/api/types';

export const usePricingPlans = () => {
  return useQuery({
    queryKey: ['pricingPlans'],
    queryFn: () => subscriptionService.getPlans(),
  });
};

export const useSubscription = (locationId: string) => {
  return useQuery({
    queryKey: ['subscription', locationId],
    queryFn: () => subscriptionService.getSubscription(locationId),
    enabled: !!locationId,
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSubscriptionRequest) => subscriptionService.createSubscription(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscription', variables.locationId] });
    },
  });
};

export const useChangePlan = (locationId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ subscriptionId, data }: { subscriptionId: string; data: ChangePlanRequest }) =>
      subscriptionService.changePlan(subscriptionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', locationId] });
    },
  });
};

export const useCancelSubscription = (locationId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (subscriptionId: string) => subscriptionService.cancelSubscription(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', locationId] });
    },
  });
};

export const useBillingHistory = (locationId: string) => {
  return useQuery({
    queryKey: ['billingHistory', locationId],
    queryFn: () => subscriptionService.getBillingHistory(locationId),
    enabled: !!locationId,
  });
};

export const useUsage = (locationId: string) => {
  return useQuery({
    queryKey: ['usage', locationId],
    queryFn: () => subscriptionService.getUsage(locationId),
    enabled: !!locationId,
  });
};

export const useCreateCheckout = () => {
  return useMutation({
    mutationFn: ({ locationId, plan, billingCycle }: { locationId: string; plan: string; billingCycle: 'MONTHLY' | 'YEARLY' }) =>
      subscriptionService.createCheckoutSession(locationId, plan, billingCycle),
  });
};


