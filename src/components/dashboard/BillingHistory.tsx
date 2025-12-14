/**
 * Billing History Component
 * 
 * Displays invoice history and payment details.
 */

import { Download, Check, X, Clock, AlertCircle } from 'lucide-react';
import { useBillingHistory } from '@/hooks/useSubscription';
import { format } from 'date-fns';

interface BillingHistoryProps {
  locationId: string;
}

export function BillingHistory({ locationId }: BillingHistoryProps) {
  const { data, isLoading, error } = useBillingHistory(locationId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'FAILED':
        return <X className="w-5 h-5 text-red-600" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'CANCELLED':
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'INR') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      }).format(amount);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Failed to load billing history. Please try again.
      </div>
    );
  }

  const invoices = data?.invoices || [];

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No billing history yet</p>
        <p className="text-sm text-gray-500 mt-1">
          Your invoices will appear here after payment
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Billing History</h3>
        <span className="text-sm text-gray-600">{invoices.length} invoices</span>
      </div>

      <div className="space-y-3">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="mt-1">{getStatusIcon(invoice.status)}</div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{invoice.description}</h4>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                        invoice.status
                      )}`}
                    >
                      {invoice.status}
                    </span>
                  </div>

                  <div className="mt-1 space-y-1 text-sm text-gray-600">
                    <p>
                      Amount:{' '}
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(
                          typeof invoice.amount === 'number'
                            ? invoice.amount
                            : parseFloat(String(invoice.amount)),
                          invoice.currency
                        )}
                      </span>
                    </p>
                    <p>
                      Date:{' '}
                      {invoice.paidAt
                        ? format(new Date(invoice.paidAt), 'MMM dd, yyyy')
                        : format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                    </p>
                    {invoice.razorpayPaymentId && (
                      <p className="font-mono text-xs">
                        Payment ID: {invoice.razorpayPaymentId}
                      </p>
                    )}
                  </div>
                </div>

                {(invoice.status === 'PAID' || invoice.status === 'paid') && invoice.invoiceUrl && (
                  <button
                    onClick={() => window.open(invoice.invoiceUrl!, '_blank')}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

