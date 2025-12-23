/**
 * Feature Access Hook
 * 
 * Hook to check feature access based on subscription plan.
 */

import { useQuery } from '@tanstack/react-query';
import { subscriptionService } from '@/api';
import { useSubscription } from './useSubscription';
import { useAuthStore } from '@/store/authStore';

export const useFeatureAccess = (feature: string) => {
  const { currentLocation } = useAuthStore();
  const locationId = currentLocation?.id || '';
  
  const { data: subscriptionData } = useSubscription(locationId);
  const plan = subscriptionData?.subscription?.plan || currentLocation?.subscriptionPlan || 'FREE';

  return useQuery({
    queryKey: ['featureAccess', plan, feature],
    queryFn: () => subscriptionService.checkFeatureAccess(plan, feature),
    enabled: !!plan && !!feature,
    select: (data) => data?.hasAccess || false,
  });
};

export const usePlanFeatures = (plan: string) => {
  return useQuery({
    queryKey: ['planFeatures', plan],
    queryFn: () => subscriptionService.getFeatures(plan),
    enabled: !!plan,
  });
};


