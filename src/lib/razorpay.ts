/**
 * Razorpay Frontend Integration
 * 
 * Handles Razorpay checkout, payment processing, and SDK initialization.
 * Follows industry best practices for secure payment handling.
 * 
 * @module lib/razorpay
 */

// Razorpay types
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  notes?: Record<string, string>;
  save?: boolean; // Razorpay option to save card
  [key: string]: unknown; // Allow additional Razorpay options
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open(): void;
  close(): void;
  on(event: string, callback: (response: any) => void): void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

/**
 * Load Razorpay SDK dynamically
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      resolve(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

/**
 * Open Razorpay checkout
 */
export const openRazorpayCheckout = async (
  options: Omit<RazorpayOptions, 'key'>,
  razorpayKey: string
): Promise<void> => {
  const isLoaded = await loadRazorpayScript();

  if (!isLoaded) {
    throw new Error('Failed to load Razorpay SDK');
  }

  if (!window.Razorpay) {
    throw new Error('Razorpay SDK not available');
  }

  const razorpay = new window.Razorpay({
    key: razorpayKey,
    ...options,
  } as RazorpayOptions);

  razorpay.open();
};

/**
 * Create payment options for subscription
 */
export interface CreateSubscriptionPaymentOptions {
  orderId: string;
  amount: number;
  currency: string;
  plan: string;
  billingCycle: string;
  locationId: string;
  locationName: string;
  userName?: string;
  userEmail?: string;
  razorpayKey: string;
  onSuccess: (response: RazorpayResponse) => void;
  onFailure?: (error: Error) => void;
  onDismiss?: () => void;
}

export const createSubscriptionPayment = async (
  options: CreateSubscriptionPaymentOptions
): Promise<void> => {
  const razorpayOptions: Omit<RazorpayOptions, 'key'> = {
    amount: options.amount,
    currency: options.currency,
    name: 'MenuLogs',
    description: `${options.plan} Plan - ${options.billingCycle} Subscription`,
    order_id: options.orderId,
    handler: options.onSuccess,
    prefill: {
      name: options.userName,
      email: options.userEmail,
    },
    theme: {
      color: '#3B82F6',
    },
    modal: {
      ondismiss: options.onDismiss,
    },
    notes: {
      locationId: options.locationId,
      locationName: options.locationName,
      plan: options.plan,
      billingCycle: options.billingCycle,
    },
  };

  try {
    await openRazorpayCheckout(razorpayOptions, options.razorpayKey);
  } catch (error) {
    console.error('Payment failed:', error);
    if (options.onFailure) {
      options.onFailure(error as Error);
    }
  }
};

/**
 * Save payment method (tokenization)
 */
export interface SavePaymentMethodOptions {
  customerId: string;
  razorpayKey: string;
  userName?: string;
  userEmail?: string;
  onSuccess: (response: { razorpay_payment_id: string; razorpay_signature: string }) => void;
  onFailure?: (error: Error) => void;
  onDismiss?: () => void;
}

export const savePaymentMethod = async (
  options: SavePaymentMethodOptions
): Promise<void> => {
  const razorpayOptions: Omit<RazorpayOptions, 'key' | 'order_id'> & { customer_id?: string } = {
    amount: 100, // Minimal amount for tokenization (Re. 1)
    currency: 'INR',
    name: 'MenuLogs',
    description: 'Save Payment Method',
    handler: options.onSuccess as any,
    prefill: {
      name: options.userName,
      email: options.userEmail,
    },
    theme: {
      color: '#3B82F6',
    },
    modal: {
      ondismiss: options.onDismiss,
    },
    notes: {
      purpose: 'save_payment_method',
    },
  };

  try {
    await openRazorpayCheckout(razorpayOptions as any, options.razorpayKey);
  } catch (error) {
    console.error('Save payment method failed:', error);
    if (options.onFailure) {
      options.onFailure(error as Error);
    }
  }
};

/**
 * Format amount for display
 */
export const formatAmount = (amount: number, currency: string): string => {
  const amountInMainUnit = amount / 100; // Convert paise/cents to main unit
  
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amountInMainUnit);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amountInMainUnit);
};

/**
 * Validate Razorpay configuration
 */
export const validateRazorpayConfig = (keyId: string): boolean => {
  if (!keyId) {
    console.error('Razorpay key ID is missing');
    return false;
  }

  if (!keyId.startsWith('rzp_')) {
    console.error('Invalid Razorpay key ID format');
    return false;
  }

  return true;
};

export type { RazorpayOptions, RazorpayResponse, RazorpayInstance };

