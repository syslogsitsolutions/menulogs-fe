/**
 * Feature Gate Component
 * 
 * Conditionally renders children based on feature access.
 * Shows upgrade prompt if feature is not available.
 */

import { ReactNode } from 'react';
import { Lock, TrendingUp } from 'lucide-react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useAuthStore } from '@/store/authStore';

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  onUpgrade?: () => void;
}

export function FeatureGate({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  onUpgrade,
}: FeatureGateProps) {
  const { data: hasAccess, isLoading } = useFeatureAccess(feature);
  const { currentLocation } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="p-3 bg-gray-200 rounded-full">
          <Lock className="w-6 h-6 text-gray-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Feature Not Available</h3>
          <p className="text-sm text-gray-600 mb-4">
            This feature is not available in your current plan.
          </p>
          {onUpgrade ? (
            <button
              onClick={onUpgrade}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <TrendingUp className="w-4 h-4" />
              Upgrade Plan
            </button>
          ) : (
            <a
              href={`/dashboard/subscription?locationId=${currentLocation?.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              Upgrade Plan
            </a>
          )}
        </div>
      </div>
    </div>
  );
}


