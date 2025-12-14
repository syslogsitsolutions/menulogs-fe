/**
 * Cancel Subscription Dialog Component
 * 
 * Confirmation dialog for cancelling subscription.
 */

import { X, AlertTriangle, Loader } from 'lucide-react';
import { useCancelSubscription } from '@/hooks/useSubscription';

interface CancelSubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionId: string;
  locationId: string;
  planName: string;
  onSuccess?: () => void;
}

export function CancelSubscriptionDialog({
  isOpen,
  onClose,
  subscriptionId,
  locationId,
  planName,
  onSuccess,
}: CancelSubscriptionDialogProps) {
  const cancelSubscription = useCancelSubscription(locationId);

  const handleCancel = async () => {
    try {
      await cancelSubscription.mutateAsync(subscriptionId);
      alert('Subscription cancelled successfully. You have been downgraded to the FREE plan.');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      const errorMessage = 
        (error && typeof error === 'object' && 'response' in error && 
         error.response && typeof error.response === 'object' && 'data' in error.response &&
         error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
         ? String(error.response.data.error)
         : null) ||
        (error && typeof error === 'object' && 'message' in error ? String(error.message) : null) ||
        'Failed to cancel subscription. Please try again.';
      alert(errorMessage);
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

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-dark-900">Cancel Subscription</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to cancel your <span className="font-semibold">{planName}</span> subscription?
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <ul className="space-y-2 text-sm text-yellow-800">
                <li className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span>You will be downgraded to the FREE plan immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span>All premium features will be disabled</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span>This action cannot be undone</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={cancelSubscription.isPending}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            Keep Subscription
          </button>
          <button
            onClick={handleCancel}
            disabled={cancelSubscription.isPending}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {cancelSubscription.isPending ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              'Cancel Subscription'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

