// Order Type Definitions
// Shared types for order management

export interface Order {
  id: string;
  orderNumber: number;
  type: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
  tableId?: string;
  tableName?: string;
  tableNumber?: number;
  customerName?: string;
  customerPhone?: string;
  items: Array<{
    id: string;
    menuItemId: string;
    menuItemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
    status: string;
  }>;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
}

export interface KitchenOrder extends Order {
  prepTime?: number; // Minutes since order was placed
  isRush?: boolean; // If order is taking too long
}

export interface OrderStatusChangedData {
  orderId: string;
  orderNumber: number;
  oldStatus: string;
  newStatus: string;
  changedBy: {
    id: string;
    name: string;
    role: string;
  };
  timestamp: string;
}

