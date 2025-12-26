/**
 * Print Service
 * Handles KOT and Bill generation API calls
 */

import apiClient from '../lib/apiClient';

export interface KOTData {
  order: {
    id: string;
    orderNumber: number;
    type: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
    createdAt: string;
    table: {
      number: number;
      name?: string;
    } | null;
    customerName?: string;
    customerPhone?: string;
    items: Array<{
      id: string;
      menuItemName: string;
      quantity: number;
      notes?: string;
      modifiers?: Record<string, unknown>;
      status: string;
    }>;
    createdBy: {
      name: string;
    };
  };
  location: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    email?: string;
  };
  business: {
    name: string;
    logo?: string;
  };
}

export interface BillData {
  order: {
    id: string;
    orderNumber: number;
    type: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
    createdAt: string;
    completedAt?: string;
    table: {
      number: number;
      name?: string;
    } | null;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    items: Array<{
      id: string;
      menuItemName: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      notes?: string;
    }>;
    subtotal: number;
    taxAmount: number;
    taxRate: number;
    discountAmount: number;
    tipAmount: number;
    totalAmount: number;
    notes?: string;
  };
  payments: Array<{
    id: string;
    method: string;
    amount: number;
    transactionId?: string;
    createdAt: string;
  }>;
  location: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    email?: string;
  };
  business: {
    name: string;
    logo?: string;
  };
}

class PrintService {
  /**
   * Get KOT data for an order
   */
  async getKOT(orderId: string): Promise<KOTData> {
    const response = await apiClient.get<{ kot: KOTData }>(`/orders/${orderId}/kot`);
    return response.data.kot;
  }

  /**
   * Get Bill/Invoice data for an order
   */
  async getBill(orderId: string): Promise<BillData> {
    const response = await apiClient.get<{ bill: BillData }>(`/orders/${orderId}/bill`);
    return response.data.bill;
  }
}

export const printService = new PrintService();

