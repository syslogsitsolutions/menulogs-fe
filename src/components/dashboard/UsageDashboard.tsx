/**
 * Usage Dashboard Component
 * 
 * Displays current usage vs limits for all resources with visual indicators.
 */

import { AlertCircle, TrendingUp, HardDrive, Upload, Users } from 'lucide-react';
import { useUsage } from '@/hooks/useSubscription';
import type { UsageResponse } from '@/api/types';

interface UsageDashboardProps {
  locationId: string;
  onUpgrade?: () => void;
}

export function UsageDashboard({ locationId, onUpgrade }: UsageDashboardProps) {
  const { data: usageData, isLoading, error } = useUsage(locationId);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-800 font-semibold">Failed to load usage data</p>
        <p className="text-red-600 text-sm mt-2">Please try refreshing the page.</p>
      </div>
    );
  }

  if (!usageData?.usage) {
    return null;
  }

  const usage = usageData.usage;
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProgressBgColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-100';
    if (percentage >= 80) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  const ResourceCard = ({ 
    title, 
    icon: Icon, 
    current, 
    limit, 
    percentage, 
    format = (v: number) => v.toString(),
    unit = ''
  }: {
    title: string;
    icon: any;
    current: number;
    limit: number;
    percentage: number;
    format?: (v: number) => string;
    unit?: string;
  }) => {
    const isUnlimited = limit === -1;
    const displayLimit = isUnlimited ? 'Unlimited' : format(limit);
    const displayCurrent = format(current);
    const displayPercentage = isUnlimited ? 0 : percentage;

    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-gray-600" />
            <h4 className="font-semibold text-gray-900">{title}</h4>
          </div>
          {displayPercentage >= 80 && !isUnlimited && (
            <AlertCircle className="w-5 h-5 text-yellow-500" />
          )}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {displayCurrent} {unit} / {displayLimit} {unit}
            </span>
            {!isUnlimited && (
              <span className={`font-semibold ${
                displayPercentage >= 100 ? 'text-red-600' :
                displayPercentage >= 80 ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {displayPercentage}%
              </span>
            )}
          </div>
          {!isUnlimited && (
            <div className={`h-2 rounded-full overflow-hidden ${getProgressBgColor(displayPercentage)}`}>
              <div
                className={`h-full transition-all duration-300 ${getProgressColor(displayPercentage)}`}
                style={{ width: `${Math.min(displayPercentage, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-dark-900">Usage & Limits</h3>
          <p className="text-sm text-gray-600 mt-1">
            Current plan: <span className="font-semibold">{usage.plan}</span>
          </p>
        </div>
        {usage.upgradeRecommended && onUpgrade && (
          <button
            onClick={onUpgrade}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Upgrade Plan
          </button>
        )}
      </div>

      {/* Grace Period Warning */}
      {usage.gracePeriod?.isActive && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800">Grace Period Active</p>
              <p className="text-sm text-yellow-700 mt-1">
                Your subscription is in a grace period. Please update your payment method to avoid service interruption.
                {usage.gracePeriod.endsAt && (
                  <span className="block mt-1">
                    Grace period ends: {new Date(usage.gracePeriod.endsAt).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Usage Warnings */}
      {usage.warnings && usage.warnings.length > 0 && (
        <div className="space-y-2">
          {usage.warnings.map((warning, index) => (
            <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-orange-800">{warning.message}</p>
                  {warning.upgradePlan && (
                    <button
                      onClick={onUpgrade}
                      className="text-sm text-orange-700 hover:text-orange-800 underline mt-1"
                    >
                      Upgrade to {warning.upgradePlan}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resource Usage Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ResourceCard
          title="Menu Items"
          icon={TrendingUp}
          current={usage.current.menuItems}
          limit={usage.limits.menuItems}
          percentage={usage.percentages.menuItems}
        />
        <ResourceCard
          title="Categories"
          icon={TrendingUp}
          current={usage.current.categories}
          limit={usage.limits.categories}
          percentage={usage.percentages.categories}
        />
        <ResourceCard
          title="Banners"
          icon={TrendingUp}
          current={usage.current.banners}
          limit={usage.limits.banners}
          percentage={usage.percentages.banners}
        />
        <ResourceCard
          title="Featured Sections"
          icon={TrendingUp}
          current={usage.current.featuredSections}
          limit={usage.limits.featuredSections}
          percentage={usage.percentages.featuredSections}
        />
        <ResourceCard
          title="Storage"
          icon={HardDrive}
          current={usage.current.storageBytes}
          limit={usage.limits.imageStorageBytes}
          percentage={usage.percentages.storage}
          format={formatBytes}
        />
        <ResourceCard
          title="Monthly Image Uploads"
          icon={Upload}
          current={usage.current.monthlyImageUploads}
          limit={usage.limits.monthlyImageUploads}
          percentage={usage.percentages.monthlyImageUploads}
        />
        <ResourceCard
          title="Monthly Video Uploads"
          icon={Upload}
          current={usage.current.monthlyVideoUploads}
          limit={usage.limits.monthlyVideoUploads}
          percentage={usage.percentages.monthlyVideoUploads}
        />
        <ResourceCard
          title="Team Members"
          icon={Users}
          current={0} // TODO: Get from API
          limit={usage.limits.teamMembers}
          percentage={0} // TODO: Calculate
        />
      </div>
    </div>
  );
}


