/**
 * Change Plan Modal Component
 * 
 * Modal for selecting and changing subscription plan.
 * Handles payment flow for upgrades and plan changes.
 */

import { useState } from 'react';
import { X, Loader } from 'lucide-react';
import { usePricingPlans, useChangePlan } from '@/hooks/useSubscription';
import { usePaymentConfig, useCreateOrder, useVerifyPayment } from '@/hooks/usePayment';
import { createSubscriptionPayment } from '@/lib/razorpay';
import type { RazorpayResponse } from '@/lib/razorpay';
import type { PricingPlan } from '@/api/types';
import type { CreateOrderRequest } from '@/api/types';

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionId: string;
  locationId: string;
  currentPlan: string;
  currentBillingCycle: 'MONTHLY' | 'YEARLY';
  onSuccess?: () => void;
}

// Plan hierarchy for determining upgrades/downgrades
const PLAN_HIERARCHY: Record<string, number> = {
  FREE: 0,
  STANDARD: 1,
  PROFESSIONAL: 2,
  CUSTOM: 3,
};

export function ChangePlanModal({
  isOpen,
  onClose,
  subscriptionId,
  locationId,
  currentPlan,
  currentBillingCycle,
  onSuccess,
}: ChangePlanModalProps) {
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>(currentBillingCycle);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  const { data: plansData, isLoading: plansLoading } = usePricingPlans();
  const { data: configData, isLoading: configLoading } = usePaymentConfig();
  const createOrder = useCreateOrder();
  const verifyPayment = useVerifyPayment();
  const changePlan = useChangePlan(locationId);

  const plans = plansData?.plans || [];

  /**
   * Check if payment is required for plan change
   */
  const requiresPayment = (newPlan: string): boolean => {
    // FREE plan never requires payment
    if (newPlan === 'FREE') {
      return false;
    }

    // If current plan is FREE, payment is required
    if (currentPlan === 'FREE') {
      return true;
    }

    // If upgrading (higher tier), payment is required
    const currentTier = PLAN_HIERARCHY[currentPlan] || 0;
    const newTier = PLAN_HIERARCHY[newPlan] || 0;
    
    return newTier > currentTier;
  };

  /**
   * Handle plan change with payment flow if needed
   */
  const handleChangePlan = async (planId: string) => {
    if (planId === currentPlan) {
      return;
    }

    setSelectedPlan(planId);

    // If no payment required (downgrade or FREE), update directly
    if (!requiresPayment(planId)) {
      try {
        await changePlan.mutateAsync({
          subscriptionId,
          data: {
            plan: planId as 'FREE' | 'STANDARD' | 'PROFESSIONAL' | 'CUSTOM',
            billingCycle,
          },
        });

        alert('Plan changed successfully!');
        onSuccess?.();
        onClose();
      } catch (error) {
        console.error('Failed to change plan:', error);
        const errorMessage = 
          (error && typeof error === 'object' && 'response' in error && 
           error.response && typeof error.response === 'object' && 'data' in error.response &&
           error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
           ? String(error.response.data.error)
           : null) ||
          (error && typeof error === 'object' && 'message' in error ? String(error.message) : null) ||
          'Failed to change plan. Please try again.';
        alert(errorMessage);
      } finally {
        setSelectedPlan(null);
      }
      return;
    }

    // Payment required - proceed with payment flow
    if (!configData?.keyId) {
      alert('Payment service is not configured. Please contact support.');
      setSelectedPlan(null);
      return;
    }

    try {
      // Handle CUSTOM plan
      if (planId === 'CUSTOM') {
        alert('Please contact our sales team for custom pricing.');
        window.open(`${window.location.origin}/contact?plan=CUSTOM&locationId=${locationId}`, '_blank');
        setSelectedPlan(null);
        return;
      }

      // Create payment order
      const orderResponse = await createOrder.mutateAsync({
        locationId,
        plan: planId as 'STANDARD' | 'PROFESSIONAL' | 'CUSTOM',
        billingCycle,
      } as CreateOrderRequest);

      if (!orderResponse.success || !orderResponse.order?.id) {
        throw new Error(orderResponse.message || 'Failed to create order');
      }

      // Open Razorpay checkout
      await createSubscriptionPayment({
        orderId: orderResponse.order.id,
        amount: orderResponse.order.amount,
        currency: orderResponse.order.currency,
        plan: planId,
        billingCycle,
        locationId,
        locationName: 'Location', // Could be passed as prop
        userName: orderResponse.config?.prefill?.name || '',
        userEmail: orderResponse.config?.prefill?.email || '',
        razorpayKey: configData.keyId,
        onSuccess: async (response: RazorpayResponse) => {
          try {
            // Verify payment on backend
            // This will automatically update the subscription with the new plan
            await verifyPayment.mutateAsync({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              locationId,
              plan: planId as 'STANDARD' | 'PROFESSIONAL' | 'CUSTOM',
              billingCycle,
            });

            alert('Plan changed and payment processed successfully!');
            onSuccess?.();
            onClose();
          } catch (error) {
            console.error('Payment verification failed:', error);
            const errorMessage = 
              (error && typeof error === 'object' && 'response' in error && 
               error.response && typeof error.response === 'object' && 'data' in error.response &&
               error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
               ? String(error.response.data.error)
               : null) ||
              (error && typeof error === 'object' && 'message' in error ? String(error.message) : null) ||
              'Payment processed but verification failed. Please contact support.';
            alert(errorMessage);
          } finally {
            setSelectedPlan(null);
          }
        },
        onFailure: (error) => {
          console.error('Payment failed:', error);
          alert('Payment failed. Please try again.');
          setSelectedPlan(null);
        },
        onDismiss: () => {
          console.log('Payment modal dismissed');
          setSelectedPlan(null);
        },
      });
    } catch (error) {
      console.error('Failed to start payment:', error);
      const errorMessage = 
        (error && typeof error === 'object' && 'response' in error && 
         error.response && typeof error.response === 'object' && 'data' in error.response &&
         error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
         ? String(error.response.data.error)
         : null) ||
        (error && typeof error === 'object' && 'message' in error ? String(error.message) : null) ||
        'Failed to start checkout. Please try again.';
      alert(errorMessage);
      setSelectedPlan(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-dark-900">Change Subscription Plan</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
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

          {/* Plans Grid */}
          {plansLoading || configLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : !configData?.keyId ? (
            <div className="text-center py-12">
              <p className="text-red-600 font-medium">Payment service not configured</p>
              <p className="text-sm text-gray-600 mt-2">Please contact support to enable plan changes.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((plan: PricingPlan) => {
                const price = billingCycle === 'YEARLY' 
                  ? (plan.priceYearly ?? plan.price * 12 * 0.85) 
                  : plan.price;
                const isCurrentPlan = plan.id === currentPlan;
                const isProcessing = changePlan.isPending && selectedPlan === plan.id;

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-xl border-2 p-4 ${
                      isCurrentPlan
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    {isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Current
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                      <div className="mt-2">
                        <span className="text-2xl font-bold text-gray-900">
                          ${price}
                        </span>
                        <span className="text-gray-600 text-sm">
                          /{billingCycle === 'YEARLY' ? 'year' : 'month'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleChangePlan(plan.id)}
                      disabled={isCurrentPlan || isProcessing}
                      className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                        isCurrentPlan
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      } ${isProcessing ? 'opacity-50' : ''}`}
                    >
                      {isProcessing ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Changing...
                        </>
                      ) : isCurrentPlan ? (
                        'Current Plan'
                      ) : (
                        'Select Plan'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

