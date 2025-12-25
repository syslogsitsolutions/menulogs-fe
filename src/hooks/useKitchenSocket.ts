// React Hook for Kitchen Display Real-Time Updates
// Optimized for kitchen staff to track order preparation

import { useEffect, useState, useCallback } from 'react';
import { useSocket } from './useSocket';
import { orderService } from '../api';
import type { KitchenOrder } from '../types/order.types';

export function useKitchenSocket(locationId: string) {
  const { socket, isConnected, joinKitchen } = useSocket({ locationId });
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Helper functions (defined early so they can be used in useEffect)
  const playKitchenAlert = useCallback(() => {
    try {
      const audio = new Audio('/sounds/kitchen-alert.mp3');
      audio.volume = 0.7;
      audio.play().catch(() => {});
    } catch {
      // Ignore
    }
  }, []);

  const playUrgentAlert = useCallback(() => {
    try {
      const audio = new Audio('/sounds/urgent-alert.mp3');
      audio.volume = 0.9;
      audio.play().catch(() => {});
    } catch {
      // Ignore
    }
  }, []);

  // Join kitchen room on mount and when socket connects
  useEffect(() => {
    if (socket && isConnected && locationId) {
      console.log('🍳 Attempting to join kitchen room:', locationId);
      joinKitchen(locationId);
    }
  }, [socket, isConnected, locationId, joinKitchen]);

  // Listen for kitchen join confirmation
  useEffect(() => {
    if (!socket) return;

    const handleJoinedKitchen = (data: { locationId: string; success: boolean }) => {
      console.log('✅ Joined kitchen room:', data);
    };

    socket.on('joined-kitchen', handleJoinedKitchen);

    return () => {
      socket.off('joined-kitchen', handleJoinedKitchen);
    };
  }, [socket]);

  // Listen for kitchen-specific events
  useEffect(() => {
    if (!socket || !isConnected) {
      console.log('⚠️ Socket not ready for kitchen:', { socket: !!socket, isConnected });
      return;
    }

    console.log('👂 Setting up kitchen event listeners on socket:', socket.id);

    // New order for kitchen (only CONFIRMED orders are sent to kitchen)
    socket.on('order:created', (data: { order: any; metadata: any }) => {
      console.log('🍳 New order for kitchen:', data.order);
      
      // Only process CONFIRMED orders (PENDING orders should not reach kitchen)
      if (data.order.status?.toUpperCase() !== 'CONFIRMED') {
        console.log('⚠️ Ignoring non-CONFIRMED order in kitchen:', data.order.status);
        return;
      }
      
      // Transform socket order to KitchenOrder format
      const createdAt = new Date(data.order.createdAt || new Date());
      const now = new Date();
      const prepTime = Math.floor((now.getTime() - createdAt.getTime()) / 60000);
      
      const kitchenOrder: KitchenOrder = {
        id: data.order.id,
        orderNumber: data.order.orderNumber,
        type: (data.order.type?.toUpperCase().replace('-', '_') || 'DINE_IN') as KitchenOrder['type'],
        status: (data.order.status?.toUpperCase() || 'CONFIRMED') as KitchenOrder['status'],
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
        prepTime,
        isRush: prepTime > 15,
      };

      console.log('🍳 Transformed kitchen order:', kitchenOrder);

      setKitchenOrders((prev) => {
        // Check if order already exists (avoid duplicates)
        const exists = prev.some(o => o.id === kitchenOrder.id);
        if (exists) {
          console.log('⚠️ Kitchen order already exists, updating instead');
          return prev.map(o => o.id === kitchenOrder.id ? kitchenOrder : o);
        }
        console.log('✅ Adding new kitchen order, total:', prev.length + 1);
        return [kitchenOrder, ...prev];
      });

      // Play kitchen alert sound
      if (soundEnabled) {
        playKitchenAlert();
      }
    });

    // Order status changed
    socket.on('order:status-changed', async (data: any) => {
      console.log('🔄 Kitchen order status changed:', data);
      
      const newStatus = (data.newStatus?.toUpperCase() || '') as KitchenOrder['status'];
      const oldStatus = (data.oldStatus?.toUpperCase() || '') as KitchenOrder['status'];
      
      console.log(`🔄 Status change: ${oldStatus} → ${newStatus} for order ${data.orderId}`);
      
      setKitchenOrders((prev) => {
        const orderExists = prev.some(o => o.id === data.orderId);
        
        // If order is confirmed and not in kitchen list, fetch it
        if (!orderExists && newStatus === 'CONFIRMED') {
          console.log('✅ Order confirmed, fetching details for kitchen:', data.orderId);
          
          // Fetch the order details from API
          orderService.getOrder(data.orderId)
            .then((order) => {
              // Transform API order to KitchenOrder format (same as KitchenDisplayPage)
              const toNumber = (value: number | { toNumber?: () => number } | undefined): number => {
                if (typeof value === 'number') return value;
                if (value && typeof value === 'object' && 'toNumber' in value && typeof value.toNumber === 'function') {
                  return value.toNumber();
                }
                return 0;
              };
              
              const createdAt = new Date(order.createdAt);
              const now = new Date();
              const prepTime = Math.floor((now.getTime() - createdAt.getTime()) / 60000);
              
              const kitchenOrder: KitchenOrder = {
                id: order.id,
                orderNumber: order.orderNumber,
                type: (order.type?.toUpperCase().replace('-', '_') || 'DINE_IN') as KitchenOrder['type'],
                status: (order.status?.toUpperCase() || 'CONFIRMED') as KitchenOrder['status'],
                tableId: order.tableId,
                tableName: order.table?.name,
                tableNumber: order.table?.number,
                customerName: order.customerName,
                customerPhone: order.customerPhone,
                items: order.items.map((item: any) => ({
                  id: item.id,
                  menuItemId: item.menuItemId,
                  menuItemName: item.menuItem?.name || item.menuItemName || 'Unknown Item',
                  quantity: item.quantity,
                  unitPrice: toNumber(item.unitPrice),
                  totalPrice: toNumber(item.totalPrice),
                  notes: item.notes,
                  status: (item.status?.toUpperCase() || 'PENDING'),
                })),
                subtotal: toNumber(order.subtotal),
                taxAmount: toNumber(order.taxAmount),
                totalAmount: toNumber(order.totalAmount),
                notes: order.notes,
                createdAt: order.createdAt,
                createdBy: {
                  id: order.createdBy?.id || order.createdById || 'unknown',
                  name: order.createdBy?.name || 'Unknown',
                  role: 'STAFF',
                },
                prepTime,
                isRush: prepTime > 15,
              };
              
              // Add to kitchen orders
              setKitchenOrders((current) => {
                const exists = current.some(o => o.id === kitchenOrder.id);
                if (exists) {
                  console.log('🔄 Order already exists, updating:', kitchenOrder.orderNumber);
                  return current.map(o => o.id === kitchenOrder.id ? kitchenOrder : o);
                }
                console.log('✅ Added confirmed order to kitchen display:', kitchenOrder.orderNumber);
                return [kitchenOrder, ...current];
              });
            })
            .catch((error) => {
              console.error('Failed to fetch confirmed order:', error);
            });
        }
        
        // Update existing orders with new status
        if (orderExists) {
          const orderIndex = prev.findIndex(o => o.id === data.orderId);
          if (orderIndex === -1) {
            console.warn('⚠️ Order exists check passed but not found in array:', data.orderId);
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
          console.log(`🔄 Updated kitchen orders list, total: ${updated.length}, changed index: ${orderIndex}`);
          
          return updated;
        }
        
        // Order doesn't exist - if it's a kitchen-relevant status, fetch it
        if (['CONFIRMED', 'PREPARING', 'READY'].includes(newStatus)) {
          console.log(`⚠️ Order ${data.orderId} not found in kitchen orders, fetching for status: ${newStatus}`);
          
          // Fetch the order from API
          orderService.getOrder(data.orderId)
            .then((order) => {
              // Only add if status is still kitchen-relevant
              if (!['CONFIRMED', 'PREPARING', 'READY'].includes(order.status.toUpperCase())) {
                console.log(`⚠️ Order ${order.orderNumber} status changed to ${order.status}, not adding to kitchen`);
                return;
              }
              
              // Transform API order to KitchenOrder format
              const toNumber = (value: number | { toNumber?: () => number } | undefined): number => {
                if (typeof value === 'number') return value;
                if (value && typeof value === 'object' && 'toNumber' in value && typeof value.toNumber === 'function') {
                  return value.toNumber();
                }
                return 0;
              };
              
              const createdAt = new Date(order.createdAt);
              const now = new Date();
              const prepTime = Math.floor((now.getTime() - createdAt.getTime()) / 60000);
              
              const kitchenOrder: KitchenOrder = {
                id: order.id,
                orderNumber: order.orderNumber,
                type: (order.type?.toUpperCase().replace('-', '_') || 'DINE_IN') as KitchenOrder['type'],
                status: (order.status?.toUpperCase() || newStatus) as KitchenOrder['status'],
                tableId: order.tableId,
                tableName: order.table?.name,
                tableNumber: order.table?.number,
                customerName: order.customerName,
                customerPhone: order.customerPhone,
                items: order.items.map((item: any) => ({
                  id: item.id,
                  menuItemId: item.menuItemId,
                  menuItemName: item.menuItem?.name || item.menuItemName || 'Unknown Item',
                  quantity: item.quantity,
                  unitPrice: toNumber(item.unitPrice),
                  totalPrice: toNumber(item.totalPrice),
                  notes: item.notes,
                  status: (item.status?.toUpperCase() || 'PENDING'),
                })),
                subtotal: toNumber(order.subtotal),
                taxAmount: toNumber(order.taxAmount),
                totalAmount: toNumber(order.totalAmount),
                notes: order.notes,
                createdAt: order.createdAt,
                createdBy: {
                  id: order.createdBy?.id || order.createdById || 'unknown',
                  name: order.createdBy?.name || 'Unknown',
                  role: 'STAFF',
                },
                prepTime,
                isRush: prepTime > 15,
              };
              
              // Add to kitchen orders
              setKitchenOrders((current) => {
                const exists = current.some(o => o.id === kitchenOrder.id);
                if (exists) {
                  console.log('🔄 Order already exists, updating:', kitchenOrder.orderNumber);
                  return current.map(o => o.id === kitchenOrder.id ? kitchenOrder : o);
                }
                console.log('✅ Added order to kitchen display:', kitchenOrder.orderNumber);
                return [kitchenOrder, ...current];
              });
            })
            .catch((error) => {
              console.error('Failed to fetch order for kitchen:', error);
            });
        } else {
          console.log(`⚠️ Order ${data.orderId} not found in kitchen orders, status: ${newStatus} (not kitchen-relevant)`);
        }
        
        return prev;
      });

      // Remove completed/cancelled orders from kitchen view
      if (['COMPLETED', 'CANCELLED'].includes(newStatus)) {
        setTimeout(() => {
          setKitchenOrders((prev) => {
            const filtered = prev.filter((order) => order.id !== data.orderId);
            console.log(`🗑️ Removed ${newStatus} order from kitchen, remaining: ${filtered.length}`);
            return filtered;
          });
        }, 3000); // Keep for 3 seconds before removing
      }
    });

    // Kitchen alert (rush orders, delays, etc.)
    socket.on('kitchen:alert', (data: {
      severity: 'LOW' | 'MEDIUM' | 'HIGH';
      message: string;
      orderId?: string;
      orderNumber?: number;
    }) => {
      console.log('⚠️ Kitchen alert:', data);

      // Mark order as rush if applicable
      if (data.orderId) {
        setKitchenOrders((prev) =>
          prev.map((order) =>
            order.id === data.orderId
              ? { ...order, isRush: true }
              : order
          )
        );
      }

      // Play alert sound based on severity
      if (soundEnabled) {
        if (data.severity === 'HIGH') {
          playUrgentAlert();
        } else {
          playKitchenAlert();
        }
      }
    });

    return () => {
      if (socket) {
        console.log('🧹 Cleaning up kitchen event listeners');
        socket.off('order:created');
        socket.off('order:status-changed');
        socket.off('kitchen:alert');
      }
    };
  }, [socket, isConnected, soundEnabled, playKitchenAlert, playUrgentAlert]);

  // Update prep time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setKitchenOrders((prev) =>
        prev.map((order) => {
          const createdAt = new Date(order.createdAt);
          const now = new Date();
          const prepTime = Math.floor((now.getTime() - createdAt.getTime()) / 60000);
          const isRush = prepTime > 15; // Mark as rush if > 15 minutes

          return {
            ...order,
            prepTime,
            isRush: isRush || order.isRush,
          };
        })
      );
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Helper function for toggling sound (other helpers moved above)

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  // Filter orders by status
  const pendingOrders = kitchenOrders.filter(
    (order) => order.status === 'PENDING' || order.status === 'CONFIRMED'
  );
  const preparingOrders = kitchenOrders.filter(
    (order) => order.status === 'PREPARING'
  );
  const readyOrders = kitchenOrders.filter(
    (order) => order.status === 'READY'
  );

  return {
    kitchenOrders,
    pendingOrders,
    preparingOrders,
    readyOrders,
    isConnected,
    soundEnabled,
    toggleSound,
  };
}

