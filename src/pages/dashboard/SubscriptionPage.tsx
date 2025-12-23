import { useState } from 'react';
import { CreditCard, Calendar, AlertCircle, Loader } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { SubscriptionUpgrade } from '../../components/dashboard/SubscriptionUpgrade';
import { BillingHistory } from '../../components/dashboard/BillingHistory';
import { ChangePlanModal } from '../../components/dashboard/ChangePlanModal';
import { CancelSubscriptionDialog } from '../../components/dashboard/CancelSubscriptionDialog';
import { UsageDashboard } from '../../components/dashboard/UsageDashboard';
import { useSubscription, usePaymentMethods } from '@/hooks';
import { format } from 'date-fns';

const SubscriptionPage = () => {
  const { currentLocation, updateLocation } = useAuthStore();
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Fetch subscription data
  const { 
    data: subscriptionData, 
    isLoading: subscriptionLoading,
    error: subscriptionError,
    refetch: refetchSubscription 
  } = useSubscription(currentLocation?.id || '');

  // Fetch payment methods
  const { 
    data: paymentMethodsData, 
    isLoading: paymentMethodsLoading 
  } = usePaymentMethods();

  const subscription = subscriptionData?.subscription;
  const paymentMethods = paymentMethodsData?.paymentMethods || [];
  const defaultPaymentMethod = paymentMethods.find(pm => pm.isDefault) || paymentMethods[0];

  // Normalize plan name to uppercase for component
  // Backend returns uppercase enums, frontend types use lowercase
  const planName = subscription?.plan || currentLocation?.subscriptionPlan || 'FREE';
  const currentPlan = typeof planName === 'string' 
    ? (planName.toUpperCase() as 'FREE' | 'STANDARD' | 'PROFESSIONAL' | 'CUSTOM')
    : 'FREE';
  
  // Normalize status - backend uses uppercase, frontend may use lowercase
  const rawStatus = subscription?.status || currentLocation?.subscriptionStatus || 'TRIAL';
  const subscriptionStatus = typeof rawStatus === 'string' 
    ? (rawStatus.toUpperCase() as 'TRIAL' | 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'CANCELLED')
    : 'TRIAL';

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    if (currency === 'INR') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format payment method display
  const formatPaymentMethod = (pm: typeof defaultPaymentMethod) => {
    if (!pm) return null;
    
    const brand = pm.brand || pm.type.toUpperCase();
    const last4 = pm.last4 || '****';
    const expiry = pm.expiryMonth && pm.expiryYear 
      ? `${String(pm.expiryMonth).padStart(2, '0')}/${String(pm.expiryYear).slice(-2)}`
      : null;
    
    return { brand, last4, expiry };
  };

  const pmDisplay = defaultPaymentMethod ? formatPaymentMethod(defaultPaymentMethod) : null;

  // Handle successful subscription changes
  const handleSubscriptionChange = async () => {
    await refetchSubscription();
    // Update location in store if subscription changed
    if (subscription && currentLocation) {
      const plan = typeof subscription.plan === 'string' 
        ? subscription.plan.toLowerCase() as 'free' | 'standard' | 'professional' | 'custom'
        : 'free';
      const status = typeof subscription.status === 'string'
        ? subscription.status.toLowerCase() as 'active' | 'inactive' | 'trial' | 'expired'
        : 'trial';
      
      await updateLocation(currentLocation.id, {
        subscriptionPlan: plan,
        subscriptionStatus: status,
      });
    }
    window.location.reload(); // Refresh to ensure all data is updated
  };

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-dark-900 font-serif">Subscription & Billing</h1>
        <p className="text-gray-600 mt-1">Manage your subscription and billing details</p>
      </div>

      {/* Current Subscription */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold">{currentPlan} Plan</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                subscriptionStatus === 'ACTIVE' 
                  ? 'bg-green-500/20 text-green-100' 
                  : subscriptionStatus === 'TRIAL'
                  ? 'bg-blue-500/20 text-blue-100'
                  : 'bg-gray-500/20 text-gray-100'
              }`}>
                {subscriptionStatus}
              </span>
            </div>
            <p className="text-primary-100">
              {currentLocation?.name || 'No location selected'}
            </p>
            {subscriptionStatus.toUpperCase() === 'TRIAL' && (
              <p className="text-sm text-primary-100 mt-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                Trial ends in 14 days
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {subscription && subscription.id ? (
              <>
                <button 
                  onClick={() => setShowChangePlanModal(true)}
                  className="px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                >
                  Change Plan
                </button>
                {subscriptionStatus.toUpperCase() === 'ACTIVE' && (
                  <button 
                    onClick={() => setShowCancelDialog(true)}
                    className="px-6 py-3 border-2 border-white/30 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
                  >
                    Cancel Subscription
                  </button>
                )}
              </>
            ) : (
              <p className="text-primary-100 text-sm">
                Subscribe to a plan to manage your subscription
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Usage Dashboard */}
      {currentLocation?.id ? (
        <UsageDashboard
          locationId={currentLocation.id}
          onUpgrade={() => setShowChangePlanModal(true)}
        />
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800 font-semibold">Location Required</p>
          <p className="text-yellow-600 text-sm mt-2">
            Please select a location to view usage and limits.
          </p>
        </div>
      )}

      {/* Plans - Using SubscriptionUpgrade Component */}
      {currentLocation?.id ? (
        <SubscriptionUpgrade
          locationId={currentLocation.id}
          currentPlan={currentPlan.toUpperCase()}
          onSuccess={() => {
            // Refresh the page or update state
            window.location.reload();
          }}
        />
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800 font-semibold">Location Required</p>
          <p className="text-yellow-600 text-sm mt-2">
            Please select a location to view and upgrade subscription plans.
          </p>
        </div>
      )}

      {/* Payment Method */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-dark-900">Payment Method</h3>
            {defaultPaymentMethod && (
              <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                Update
              </button>
            )}
          </div>

          {paymentMethodsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-primary-600" />
            </div>
          ) : defaultPaymentMethod && pmDisplay ? (
            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <CreditCard className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-dark-900">
                  {pmDisplay.brand} ending in {pmDisplay.last4}
                </p>
                {pmDisplay.expiry && (
                  <p className="text-sm text-gray-600">Expires {pmDisplay.expiry}</p>
                )}
                {defaultPaymentMethod.isDefault && (
                  <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                    Default
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <CreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-2">No payment method added</p>
              <p className="text-sm text-gray-500">
                Payment method will be saved during subscription checkout
              </p>
            </div>
          )}
        </div>

        {/* Next Billing */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-dark-900 mb-6">Next Billing</h3>
          
          {subscriptionLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-primary-600" />
            </div>
          ) : subscriptionError ? (
            <div className="text-center py-8">
              <p className="text-red-600 text-sm">Failed to load billing information</p>
            </div>
          ) : subscription && subscription.id ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Plan</span>
                <span className="font-semibold">{currentPlan}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Billing Cycle</span>
                <span className="font-semibold">
                  {typeof subscription.billingCycle === 'string' && subscription.billingCycle.toUpperCase() === 'YEARLY' 
                    ? 'Yearly' 
                    : 'Monthly'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Next Payment</span>
                <span className="font-semibold flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {subscription.nextBillingDate 
                    ? format(new Date(subscription.nextBillingDate), 'MMM dd, yyyy')
                    : 'N/A'}
                </span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-dark-900">Total</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {formatCurrency(
                      typeof subscription.price === 'number' 
                        ? subscription.price 
                        : typeof subscription.price === 'string'
                        ? parseFloat(subscription.price)
                        : 0,
                      subscription.currency || 'USD'
                    )}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="flex flex-col items-center">
                <Calendar className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-gray-600 font-medium mb-1">No Active Subscription</p>
                <p className="text-sm text-gray-500">
                  Subscribe to a plan to see billing details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Billing History */}
      {currentLocation?.id ? (
        <BillingHistory locationId={currentLocation.id} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-dark-900 mb-4">Billing History</h3>
          <p className="text-gray-600">Please select a location to view billing history.</p>
        </div>
      )}

      {/* Change Plan Modal */}
      {subscription && currentLocation?.id && (
        <ChangePlanModal
          isOpen={showChangePlanModal}
          onClose={() => setShowChangePlanModal(false)}
          subscriptionId={subscription.id}
          locationId={currentLocation.id}
          currentPlan={currentPlan}
          currentBillingCycle={
            typeof subscription.billingCycle === 'string' && subscription.billingCycle.toUpperCase() === 'YEARLY'
              ? 'YEARLY'
              : 'MONTHLY'
          }
          onSuccess={handleSubscriptionChange}
        />
      )}

      {/* Cancel Subscription Dialog */}
      {subscription && currentLocation?.id && (
        <CancelSubscriptionDialog
          isOpen={showCancelDialog}
          onClose={() => setShowCancelDialog(false)}
          subscriptionId={subscription.id}
          locationId={currentLocation.id}
          planName={currentPlan}
          onSuccess={handleSubscriptionChange}
        />
      )}
    </div>
  );
};

export default SubscriptionPage;

