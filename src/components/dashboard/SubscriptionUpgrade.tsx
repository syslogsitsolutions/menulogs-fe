/**
 * Subscription Upgrade Component
 * 
 * Displays pricing plans and handles Razorpay checkout flow.
 */

import { useState } from 'react';
import { Check, Loader, CreditCard, Building2, Sparkles, Headphones, Zap } from 'lucide-react';
import { usePricingPlans } from '@/hooks/useSubscription';
import { usePaymentConfig, useCreateOrder, useVerifyPayment } from '@/hooks/usePayment';
import { createSubscriptionPayment } from '@/lib/razorpay';
import type { RazorpayResponse } from '@/lib/razorpay';
import type { CreateOrderRequest } from '@/api/types';

interface SubscriptionUpgradeProps {
  locationId: string;
  currentPlan: string;
  onSuccess?: () => void;
}

export function SubscriptionUpgrade({
  locationId,
  currentPlan,
  onSuccess,
}: SubscriptionUpgradeProps) {
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const { data: plansData, isLoading: plansLoading } = usePricingPlans();
  const { data: configData, isLoading: configLoading, error: configError } = usePaymentConfig();
  const createOrder = useCreateOrder();
  const verifyPayment = useVerifyPayment();

  const plans = plansData?.plans || [];

  // Debug logging
  console.log('SubscriptionUpgrade render:', {
    locationId,
    currentPlan,
    plansLoading,
    configLoading,
    configData,
    configError,
    plansCount: plans.length,
  });

  const handleUpgrade = async (plan: string) => {
    console.log('handleUpgrade called with plan:', plan);
    
    if (plan === 'FREE' || plan === currentPlan) {
      console.log('Plan is FREE or current plan, returning early');
      return;
    }

    if (!locationId) {
      console.error('Location ID is missing');
      alert('Please select a location first');
      return;
    }

    if (!configData?.keyId) {
      console.error('Razorpay key ID is missing');
      alert('Payment service is not configured. Please contact support.');
      return;
    }

    setSelectedPlan(plan);
    setProcessing(true);

    try {
      console.log('Creating payment order...', { locationId, plan, billingCycle });
      
      // Handle CUSTOM plan - redirect to contact sales
      if (plan === 'CUSTOM') {
        alert('Please contact our sales team for custom pricing. Redirecting to contact page...');
        window.open(`${window.location.origin}/contact?plan=CUSTOM&locationId=${locationId}`, '_blank');
        setProcessing(false);
        setSelectedPlan(null);
        return;
      }

      // Create payment order
      const orderResponse = await createOrder.mutateAsync({
        locationId,
        plan: plan as 'STANDARD' | 'PROFESSIONAL' | 'CUSTOM',
        billingCycle,
      } as CreateOrderRequest);

      console.log('Order response:', orderResponse);

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create order');
      }

      if (!orderResponse.order?.id) {
        throw new Error('Order ID is missing from response');
      }

      if (!configData.keyId) {
        throw new Error('Razorpay key ID is not configured');
      }

      console.log('Opening Razorpay checkout...', {
        orderId: orderResponse.order.id,
        amount: orderResponse.order.amount,
        keyId: configData.keyId,
      });

      // Open Razorpay checkout
      await createSubscriptionPayment({
        orderId: orderResponse.order.id,
        amount: orderResponse.order.amount,
        currency: orderResponse.order.currency,
        plan,
        billingCycle,
        locationId,
        locationName: 'Location', // Should come from props
        userName: orderResponse.config?.prefill?.name || '',
        userEmail: orderResponse.config?.prefill?.email || '',
        razorpayKey: configData.keyId,
        onSuccess: async (response: RazorpayResponse) => {
          console.log('Payment success callback:', response);
          try {
            // Verify payment on backend
            await verifyPayment.mutateAsync({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              locationId,
              plan: plan as 'STANDARD' | 'PROFESSIONAL' | 'CUSTOM',
              billingCycle,
            });

            alert('Subscription activated successfully!');
            onSuccess?.();
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed. Please contact support.');
          } finally {
            setProcessing(false);
            setSelectedPlan(null);
          }
        },
        onFailure: (error) => {
          console.error('Payment failed:', error);
          alert('Payment failed. Please try again.');
          setProcessing(false);
          setSelectedPlan(null);
        },
        onDismiss: () => {
          console.log('Payment modal dismissed');
          setProcessing(false);
          setSelectedPlan(null);
        },
      });
    } catch (error: unknown) {
      console.error('Upgrade failed:', error);
      const errorMessage = 
        (error && typeof error === 'object' && 'response' in error && 
         error.response && typeof error.response === 'object' && 'data' in error.response &&
         error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
         ? String(error.response.data.error)
         : null) ||
        (error && typeof error === 'object' && 'message' in error ? String(error.message) : null) ||
        'Failed to start checkout. Please try again.';
      alert(errorMessage);
      setProcessing(false);
      setSelectedPlan(null);
    }
  };

  if (plansLoading || configLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading payment configuration...</span>
      </div>
    );
  }

  if (configError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800 font-semibold">Payment Configuration Error</p>
        <p className="text-red-600 text-sm mt-2">
          Failed to load payment configuration. Please refresh the page or contact support.
        </p>
      </div>
    );
  }

  if (!configData?.keyId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800 font-semibold">Payment Not Configured</p>
        <p className="text-yellow-600 text-sm mt-2">
          Payment gateway is not configured. Please contact support.
        </p>
      </div>
    );
  }

  if (!locationId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800 font-semibold">Location Required</p>
        <p className="text-yellow-600 text-sm mt-2">
          Please select a location to upgrade subscription.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setBillingCycle('MONTHLY')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            billingCycle === 'MONTHLY'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle('YEARLY')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            billingCycle === 'YEARLY'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Yearly
          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
            Save 17%
          </span>
        </button>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans
          .filter((plan) => plan.id !== 'FREE')
          .map((plan) => {
            const isCustomPlan = plan.id === 'CUSTOM';
            const price = billingCycle === 'YEARLY' ? (plan.priceYearly ?? plan.price * 12 * 0.85) : plan.price;
            const isCurrentPlan = plan.id === currentPlan;
            const isProcessing = processing && selectedPlan === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative rounded-xl border-2 p-6 bg-white ${
                  plan.id === 'PROFESSIONAL'
                    ? 'border-primary-600 shadow-lg'
                    : isCustomPlan
                    ? 'border-primary-500 shadow-lg bg-gradient-to-br from-primary-50 to-primary-100'
                    : 'border-gray-200 shadow-sm'
                } ${isCurrentPlan ? 'opacity-60' : ''}`}
              >
                {plan.id === 'PROFESSIONAL' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Popular
                    </span>
                  </div>
                )}

                {isCustomPlan && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Enterprise
                    </span>
                  </div>
                )}

                {isCustomPlan ? (
                  // Custom Plan - Contact Sales UI
                  <>
                    <div className="text-center mb-6">
                      <div className="flex justify-center mb-4">
                        <div className="p-4 bg-primary-100 rounded-full">
                          <Building2 className="w-8 h-8 text-primary-600" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-dark-900 mb-2">{plan.name}</h3>
                      <p className="text-base text-gray-700 font-medium">
                        Tailored Solutions for Growing Restaurant Chains
                      </p>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100">
                        <div className="p-2 bg-primary-100 rounded-lg">
                          <Zap className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-dark-900 text-sm">Unlimited Everything</p>
                          <p className="text-xs text-gray-600">No limits on menu items, locations, or features</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100">
                        <div className="p-2 bg-primary-100 rounded-lg">
                          <Headphones className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-dark-900 text-sm">Dedicated Support</p>
                          <p className="text-xs text-gray-600">Priority support with dedicated account manager</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100">
                        <div className="p-2 bg-primary-100 rounded-lg">
                          <Sparkles className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-dark-900 text-sm">Custom Features</p>
                          <p className="text-xs text-gray-600">White-label, SSO, custom integrations & more</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-4 mb-6 text-white text-center">
                      <p className="text-sm font-semibold mb-1">Flexible Pricing</p>
                      <p className="text-xs opacity-90">Custom pricing based on your needs</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Button clicked for plan:', plan.id);
                        window.open(`${window.location.origin}/contact?plan=CUSTOM&locationId=${locationId}`, '_blank');
                      }}
                      className="w-full py-3 px-4 rounded-lg font-semibold transition-colors bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                    >
                      <Headphones className="w-5 h-5" />
                      Contact Sales Team
                    </button>
                  </>
                ) : (
                  // Standard Plans - Regular UI
                  <>
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-dark-900">{plan.name}</h3>
                      {plan.description && (
                        <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
                      )}
                      <div className="mt-4">
                        <span className="text-4xl font-bold text-dark-900">
                          {configData?.currency === 'INR' ? '₹' : '$'}
                          {price}
                        </span>
                        <span className="text-gray-600">
                          /{billingCycle === 'YEARLY' ? 'year' : 'month'}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {Object.entries(plan.features)
                        .filter(([, value]) => {
                          // Only show features that are enabled/available
                          if (typeof value === 'boolean') {
                            return value === true; // Only show true boolean features
                          }
                          if (typeof value === 'number') {
                            return value > 0 || value === -1; // Show positive numbers or unlimited (-1)
                          }
                          if (typeof value === 'string') {
                            return value.length > 0; // Show non-empty strings
                          }
                          return false; // Hide undefined/null values
                        })
                        .map(([key, value]) => (
                          <li key={key} className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">
                              {typeof value === 'number' && value === -1
                                ? `Unlimited ${key.replace(/([A-Z])/g, ' $1').trim()}`
                                : typeof value === 'boolean'
                                ? key.replace(/([A-Z])/g, ' $1').trim()
                                : `${value} ${key.replace(/([A-Z])/g, ' $1').trim()}`}
                            </span>
                          </li>
                        ))}
                    </ul>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Button clicked for plan:', plan.id);
                        handleUpgrade(plan.id);
                      }}
                      disabled={isCurrentPlan || (isProcessing && !isCustomPlan) || (processing && !isCustomPlan) || (!locationId && !isCustomPlan) || (!configData?.keyId && !isCustomPlan)}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                        isCurrentPlan
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : plan.id === 'PROFESSIONAL'
                          ? 'bg-primary-600 text-white hover:bg-primary-700'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      } ${(isProcessing || processing) && !isCurrentPlan ? 'opacity-50' : ''} ${
                        (!locationId || !configData?.keyId) && !isCurrentPlan ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : isCurrentPlan ? (
                        'Current Plan'
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5" />
                          Upgrade Now
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            );
          })}
      </div>

      {/* Trust Badges */}
      <div className="text-center text-sm text-gray-600 space-y-2">
        <p className="flex items-center justify-center gap-2">
          <Check className="w-4 h-4 text-green-600" />
          Secure payment powered by Razorpay
        </p>
        <p className="flex items-center justify-center gap-2">
          <Check className="w-4 h-4 text-green-600" />
          Cancel anytime, no questions asked
        </p>
      </div>
    </div>
  );
}

