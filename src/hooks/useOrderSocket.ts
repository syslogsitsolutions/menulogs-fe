// React Hook for Order Real-Time Updates
// Listens to order events and updates local state

import { useEffect, useState, useCallback } from 'react';
import { useSocket } from './useSocket';
import { orderService } from '../api';
import type { Order, OrderStatusChangedData } from '../types/order.types';

export function useOrderSocket(locationId: string) {
  const { socket, isConnected } = useSocket({ locationId });
  const [orders, setOrders] = useState<Order[]>([]);
  const [lastEvent, setLastEvent] = useState<{
    type: string;
    data: any;
    timestamp: string;
  } | null>(null);

  // Helper to play notification sound (defined early so it can be used in useEffect)
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Ignore autoplay errors
      });
    } catch {
      // Ignore sound errors
    }
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Listen for order events
  useEffect(() => {
    if (!socket || !isConnected) {
      console.log('⚠️ Socket not ready:', { socket: !!socket, isConnected });
      return;
    }

    console.log('👂 Setting up order event listeners on socket:', socket.id);

    // New order created
    socket.on('order:created', (data: { order: any; metadata: any }) => {
      console.log('📦 New order received:', data.order);
      
      // Transform socket order to match UI format
      const transformedOrder: Order = {
        id: data.order.id,
        orderNumber: data.order.orderNumber,
        type: (data.order.type?.toUpperCase().replace('-', '_') || 'DINE_IN') as Order['type'],
        status: (data.order.status?.toUpperCase() || 'PENDING') as Order['status'],
        tableId: data.order.tableId,
        tableName: data.order.tableName,
        tableNumber: data.order.tableNumber,
        customerName: data.order.customerName,
        customerPhone: data.order.customerPhone,
        items: (data.order.items || []).map((item: any) => ({
          id: item.id,
          menuItemId: item.menuItemId,
          menuItemName: item.menuItemName || 'Unknown Item',
          quantity: item.quantity,
          unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : Number(item.unitPrice) || 0,
          totalPrice: typeof item.totalPrice === 'number' ? item.totalPrice : Number(item.totalPrice) || 0,
          notes: item.notes,
          status: item.status?.toUpperCase() || 'PENDING',
        })),
        subtotal: typeof data.order.subtotal === 'number' ? data.order.subtotal : Number(data.order.subtotal) || 0,
        taxAmount: typeof data.order.taxAmount === 'number' ? data.order.taxAmount : Number(data.order.taxAmount) || 0,
        totalAmount: typeof data.order.totalAmount === 'number' ? data.order.totalAmount : Number(data.order.totalAmount) || 0,
        notes: data.order.notes,
        createdAt: data.order.createdAt || new Date().toISOString(),
        createdBy: data.order.createdBy || {
          id: 'unknown',
          name: 'Unknown',
          role: 'STAFF',
        },
      };
      
      console.log('📦 Transformed order:', transformedOrder);
      
      setOrders((prev) => {
        // Check if order already exists (avoid duplicates)
        const exists = prev.some(o => o.id === transformedOrder.id);
        if (exists) {
          console.log('⚠️ Order already exists, updating instead');
          return prev.map(o => o.id === transformedOrder.id ? transformedOrder : o);
        }
        console.log('✅ Adding new order, total:', prev.length + 1);
        return [transformedOrder, ...prev];
      });
      
      setLastEvent({
        type: 'order:created',
        data: transformedOrder,
        timestamp: new Date().toISOString(),
      });

      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Order', {
          body: `Order #${transformedOrder.orderNumber} - ${transformedOrder.type}`,
          icon: '/logo.png',
          tag: `order-${transformedOrder.id}`,
        });
      }

      // Play sound
      playNotificationSound();
    });

    // Order status changed
    socket.on('order:status-changed', (data: OrderStatusChangedData) => {
      console.log('🔄 Order status changed:', data);
      const newStatus = (data.newStatus?.toUpperCase() || '') as Order['status'];
      const oldStatus = data.oldStatus?.toUpperCase() || '';
      
      console.log(`🔄 Orders Page: Status change ${oldStatus} → ${newStatus} for order ${data.orderId}`);
      
      setOrders((prev) => {
        const orderIndex = prev.findIndex(o => o.id === data.orderId);
        
        if (orderIndex === -1) {
          console.log('⚠️ Order not found in orders list, fetching from API:', data.orderId);
          
          // Fetch the order from API
          orderService.getOrder(data.orderId)
            .then((order) => {
              // Transform API order to UI format
              const transformedOrder: Order = {
                id: order.id,
                orderNumber: order.orderNumber,
                type: order.type,
                status: order.status,
                tableId: order.tableId,
                tableName: order.table?.name,
                tableNumber: order.table?.number,
                customerName: order.customerName,
                customerPhone: order.customerPhone,
                items: order.items.map((item: any) => ({
                  id: item.id,
                  menuItemId: item.menuItemId,
                  menuItemName: item.menuItem?.name || 'Unknown Item',
                  quantity: item.quantity,
                  unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : Number(item.unitPrice) || 0,
                  totalPrice: typeof item.totalPrice === 'number' ? item.totalPrice : Number(item.totalPrice) || 0,
                  notes: item.notes,
                  status: item.status?.toUpperCase() || 'PENDING',
                })),
                subtotal: typeof order.subtotal === 'number' ? order.subtotal : Number(order.subtotal) || 0,
                taxAmount: typeof order.taxAmount === 'number' ? order.taxAmount : Number(order.taxAmount) || 0,
                totalAmount: typeof order.totalAmount === 'number' ? order.totalAmount : Number(order.totalAmount) || 0,
                notes: order.notes,
                createdAt: order.createdAt,
                createdBy: {
                  id: order.createdBy?.id || order.createdById || 'unknown',
                  name: order.createdBy?.name || 'Unknown',
                  role: 'STAFF',
                },
              };
              
              // Add to orders list
              setOrders((current) => {
                const exists = current.some(o => o.id === transformedOrder.id);
                if (exists) {
                  console.log('🔄 Order already exists, updating:', transformedOrder.orderNumber);
                  return current.map(o => o.id === transformedOrder.id ? transformedOrder : o);
                }
                console.log('✅ Added order to orders list:', transformedOrder.orderNumber);
                return [transformedOrder, ...current];
              });
            })
            .catch((error) => {
              console.error('Failed to fetch order:', error);
            });
          
          return prev;
        }
        
        const currentOrder = prev[orderIndex];
        if (currentOrder.status === newStatus) {
          console.log(`ℹ️ Order ${currentOrder.orderNumber} already has status ${newStatus}, skipping update`);
          return prev;
        }
        
        // Create new array with updated order
        const updated = [...prev];
        updated[orderIndex] = {
          ...currentOrder,
          status: newStatus
        };
        
        console.log(`✅ Updated order ${currentOrder.orderNumber} status: ${currentOrder.status} → ${newStatus}`);
        console.log(`🔄 Updated orders list, total: ${updated.length}, changed index: ${orderIndex}`);
        
        return updated;
      });

      setLastEvent({
        type: 'order:status-changed',
        data,
        timestamp: new Date().toISOString(),
      });

      // Notify if order is ready
      if (data.newStatus === 'READY' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Order Ready', {
          body: `Order #${data.orderNumber} is ready!`,
          icon: '/logo.png',
          tag: `order-${data.orderId}`,
        });
        playNotificationSound();
      }
    });

    // Order cancelled
    socket.on('order:cancelled', (data: { orderId: string; orderNumber: number; reason?: string }) => {
      console.log('❌ Order cancelled:', data);
      
      setOrders((prev) => prev.filter((order) => order.id !== data.orderId));
      
      setLastEvent({
        type: 'order:cancelled',
        data,
        timestamp: new Date().toISOString(),
      });
    });

    // Order payment completed
    socket.on('order:payment-completed', (data: { orderId: string; orderNumber: number; amount: number; method: string }) => {
      console.log('💰 Payment completed:', data);
      
      setOrders((prev) =>
        prev.map((order) =>
          order.id === data.orderId
            ? { ...order, status: 'COMPLETED' as any }
            : order
        )
      );

      setLastEvent({
        type: 'order:payment-completed',
        data,
        timestamp: new Date().toISOString(),
      });
    });

    // Cleanup
    return () => {
      if (socket) {
        console.log('🧹 Cleaning up order event listeners');
        socket.off('order:created');
        socket.off('order:status-changed');
        socket.off('order:cancelled');
        socket.off('order:payment-completed');
      }
    };
  }, [socket, isConnected]);

  // Helper function moved above (playNotificationSound)

  // Helper to manually add order (for optimistic updates)
  const addOrder = useCallback((order: Order) => {
    setOrders((prev) => [order, ...prev]);
  }, []);

  // Helper to update order status
  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  }, []);

  // Helper to remove order
  const removeOrder = useCallback((orderId: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== orderId));
  }, []);

  return {
    orders,
    isConnected,
    lastEvent,
    addOrder,
    updateOrderStatus,
    removeOrder,
  };
}

