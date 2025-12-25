/**
 * Order API Service
 * Handles all order-related API calls
 */

import apiClient from '../lib/apiClient';

// Types
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded';
export type OrderItemStatus = 'PENDING' | 'SENT_TO_KITCHEN' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  menuItem?: {
    id: string;
    name: string;
    image: string;
    price: number;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: OrderItemStatus;
  notes?: string;
  modifiers?: Record<string, unknown>;
  sentToKitchenAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  locationId: string;
  tableId?: string;
  table?: {
    id: string;
    number: number;
    name?: string;
  };
  orderNumber: number;
  type: OrderType;
  status: OrderStatus;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  tipAmount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  notes?: string;
  specialRequests?: string;
  createdById: string;
  servedById?: string;
  createdBy?: { id: string; name: string };
  servedBy?: { id: string; name: string };
  createdAt: string;
  confirmedAt?: string;
  preparingAt?: string;
  readyAt?: string;
  servedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  updatedAt: string;
}

export interface CreateOrderDTO {
  tableId?: string;
  type: OrderType;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: {
    menuItemId: string;
    quantity: number;
    notes?: string;
    modifiers?: Record<string, unknown>;
  }[];
  notes?: string;
  specialRequests?: string;
  status?: 'PENDING' | 'CONFIRMED'; // Optional: PENDING for confirmation, CONFIRMED for direct to kitchen
}

export interface AddOrderItemDTO {
  menuItemId: string;
  quantity: number;
  notes?: string;
  modifiers?: Record<string, unknown>;
}

export interface OrderPaymentDTO {
  amount: number;
  method: 'cash' | 'card' | 'upi' | 'razorpay';
  transactionId?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  type?: OrderType;
  tableId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

export interface OrderResponse {
  message: string;
  order: Order;
}

export interface OrderTimelineEntry {
  id: string;
  orderId: string;
  action: string;
  description: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

class OrderService {
  /**
   * Get all orders for a location
   */
  async getOrders(locationId: string, filters?: OrderFilters): Promise<OrderListResponse> {
    const response = await apiClient.get<OrderListResponse>(
      `/locations/${locationId}/orders`,
      { params: filters }
    );
    return response.data;
  }

  /**
   * Get a single order by ID
   */
  async getOrder(orderId: string): Promise<Order> {
    const response = await apiClient.get<{ order: Order }>(`/orders/${orderId}`);
    return response.data.order;
  }

  /**
   * Create a new order
   */
  async createOrder(locationId: string, data: CreateOrderDTO): Promise<Order> {
    const response = await apiClient.post<OrderResponse>(
      `/locations/${locationId}/orders`,
      data
    );
    return response.data.order;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const response = await apiClient.patch<OrderResponse>(
      `/orders/${orderId}/status`,
      { status }
    );
    return response.data.order;
  }

  /**
   * Add item to an existing order
   */
  async addOrderItem(orderId: string, item: AddOrderItemDTO): Promise<Order> {
    const response = await apiClient.post<OrderResponse>(
      `/orders/${orderId}/items`,
      item
    );
    return response.data.order;
  }

  /**
   * Update order item quantity
   */
  async updateOrderItem(itemId: string, data: { quantity?: number; notes?: string }): Promise<OrderItem> {
    const response = await apiClient.patch<{ orderItem: OrderItem }>(
      `/order-items/${itemId}`,
      data
    );
    return response.data.orderItem;
  }

  /**
   * Remove item from order
   */
  async removeOrderItem(itemId: string): Promise<void> {
    await apiClient.delete(`/order-items/${itemId}`);
  }

  /**
   * Update order item status (for kitchen)
   */
  async updateOrderItemStatus(itemId: string, status: OrderItemStatus): Promise<OrderItem> {
    const response = await apiClient.patch<{ orderItem: OrderItem }>(
      `/order-items/${itemId}/status`,
      { status }
    );
    return response.data.orderItem;
  }

  /**
   * Process payment for an order
   */
  async processPayment(orderId: string, payment: OrderPaymentDTO): Promise<Order> {
    const response = await apiClient.post<OrderResponse>(
      `/orders/${orderId}/payments`,
      payment
    );
    return response.data.order;
  }

  /**
   * Get order timeline
   */
  async getOrderTimeline(orderId: string): Promise<OrderTimelineEntry[]> {
    const response = await apiClient.get<{ timeline: OrderTimelineEntry[] }>(
      `/orders/${orderId}/timeline`
    );
    return response.data.timeline;
  }

  /**
   * Get kitchen orders (orders that need preparation)
   */
  async getKitchenOrders(locationId: string): Promise<Order[]> {
    const response = await apiClient.get<{ orders: Order[] }>(
      `/locations/${locationId}/kitchen-orders`
    );
    return response.data.orders;
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    const response = await apiClient.post<OrderResponse>(
      `/orders/${orderId}/cancel`,
      { reason }
    );
    return response.data.order;
  }

  /**
   * Print receipt
   */
  async printReceipt(orderId: string): Promise<Blob> {
    const response = await apiClient.get(`/orders/${orderId}/receipt`, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export default new OrderService();

