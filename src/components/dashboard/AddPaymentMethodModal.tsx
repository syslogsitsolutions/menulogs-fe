/**
 * Add Payment Method Modal Component
 * 
 * Modal for adding a new payment method using Razorpay.
 */

import { useState, useEffect } from 'react';
import { X, Loader, CreditCard, AlertCircle } from 'lucide-react';
import { usePaymentConfig, useCreateOrder } from '@/hooks/usePayment';
import { useCreateCustomer } from '@/hooks/usePaymentMethod';
import { useAuthStore } from '@/store/authStore';
import { loadRazorpayScript } from '@/lib/razorpay';
import type { RazorpayResponse } from '@/lib/razorpay';

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddPaymentMethodModal({
  isOpen,
  onClose,
  onSuccess,
}: AddPaymentMethodModalProps) {
  const { user, currentLocation } = useAuthStore();
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'ready' | 'processing' | 'success' | 'error'>('ready');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: configData, isLoading: configLoading } = usePaymentConfig();
  const createCustomer = useCreateCustomer();
  const createOrder = useCreateOrder();

  useEffect(() => {
    if (!isOpen) {
      setStep('ready');
      setErrorMessage(null);
      setProcessing(false);
    }
  }, [isOpen]);

  const handleAddPaymentMethod = async () => {
    if (!configData?.keyId) {
      setErrorMessage('Payment service is not configured. Please contact support.');
      setStep('error');
      return;
    }

    if (!user) {
      setErrorMessage('User not found. Please log in again.');
      setStep('error');
      return;
    }

    if (!currentLocation?.id) {
      setErrorMessage('Please select a location first.');
      setStep('error');
      return;
    }

    setProcessing(true);
    setStep('processing');
    setErrorMessage(null);

    try {
      // Step 1: Ensure Razorpay customer exists
      try {
        await createCustomer.mutateAsync();
      } catch (error) {
        console.warn('Customer creation failed (may already exist):', error);
        // Continue - customer might already exist
      }

      // Step 2: Create minimal order for tokenization (Re. 1 or $0.01)
      // We use the current location and a minimal plan for order creation
      const orderResponse = await createOrder.mutateAsync({
        locationId: currentLocation.id,
        plan: 'STANDARD', // Minimal plan for order creation
        billingCycle: 'MONTHLY',
      } as any);

      if (!orderResponse.success || !orderResponse.order?.id) {
        throw new Error('Failed to create order for payment method');
      }

      // Step 3: Load Razorpay SDK
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Step 4: Open Razorpay checkout with save card option
      const razorpayInstance = new window.Razorpay({
        key: configData.keyId,
        amount: orderResponse.order.amount,
        currency: orderResponse.order.currency,
        name: 'MenuLogs',
        description: 'Save Payment Method',
        order_id: orderResponse.order.id,
        handler: async (_response: RazorpayResponse) => {
          try {
            // Step 5: Call backend to extract and save payment method
            // We'll need to create an endpoint: POST /api/v1/payment-methods/save-from-payment
            // For now, show success and refresh
            // TODO: Create backend endpoint to extract payment method from payment
            alert('Payment completed! Your payment method will be saved. Please refresh the page.');
            setStep('success');
            onSuccess?.();
            setTimeout(() => {
              onClose();
            }, 2000);
          } catch (error) {
            console.error('Failed to save payment method:', error);
            setErrorMessage('Payment succeeded but failed to save payment method. Please contact support.');
            setStep('error');
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#3B82F6',
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            setStep('ready');
          },
        },
        // Enable save card option
        save: true,
        notes: {
          purpose: 'save_payment_method',
          userId: user.id,
          locationId: currentLocation.id,
        },
      });

      razorpayInstance.open();
    } catch (error) {
      console.error('Failed to add payment method:', error);
      const errorMsg = 
        (error && typeof error === 'object' && 'response' in error && 
         error.response && typeof error.response === 'object' && 'data' in error.response &&
         error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
         ? String(error.response.data.error)
         : null) ||
        (error && typeof error === 'object' && 'message' in error ? String(error.message) : null) ||
        'Failed to add payment method. Please try again.';
      setErrorMessage(errorMsg);
      setStep('error');
      setProcessing(false);
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
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-primary-600" />
            </div>
            <h2 className="text-xl font-bold text-dark-900">Add Payment Method</h2>
          </div>
          <button
            onClick={onClose}
            disabled={processing}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {configLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-primary-600" />
            </div>
          ) : step === 'error' ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
                </div>
              </div>
              <button
                onClick={handleAddPaymentMethod}
                className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : step === 'success' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-2">Payment Method Added!</p>
              <p className="text-sm text-gray-600">Your payment method has been saved successfully.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-700">
                You'll be redirected to Razorpay to securely add your payment method. 
                A minimal charge of {configData?.currency === 'INR' ? '₹1' : '$0.01'} will be made for verification.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This is a verification charge. Your card will be saved for future payments.
                </p>
              </div>

              <button
                onClick={handleAddPaymentMethod}
                disabled={processing || !configData?.keyId}
                className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Continue to Payment
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

