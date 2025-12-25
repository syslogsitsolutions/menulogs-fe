import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock,
  CheckCircle,
  AlertCircle,
  Volume2,
  VolumeX,
  Maximize,
  X,
  ChefHat,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useKitchenSocket } from '../../hooks';
import { orderService } from '../../api';
import { toast } from 'react-hot-toast';
import type { KitchenOrder } from '../../types/order.types';
import type { Order as ApiOrder } from '../../api/orderService';

const KitchenDisplayPage = () => {
  const { currentLocation } = useAuthStore();
  const locationId = currentLocation?.id || '';

  // Kitchen-specific socket hook
  const { 
    kitchenOrders: socketKitchenOrders, 
    pendingOrders: socketPendingOrders, 
    preparingOrders: socketPreparingOrders, 
    readyOrders: socketReadyOrders,
    isConnected,
    soundEnabled,
    toggleSound 
  } = useKitchenSocket(locationId);

  // Local state for API-loaded orders
  const [apiKitchenOrders, setApiKitchenOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Load initial kitchen orders from API
  useEffect(() => {
    if (!locationId) return;

    const loadKitchenOrders = async () => {
      try {
        setLoading(true);
        const orders = await orderService.getKitchenOrders(locationId);
        // Transform API orders to KitchenOrder format
        const toNumber = (value: number | { toNumber?: () => number } | undefined): number => {
          if (typeof value === 'number') return value;
          if (value && typeof value === 'object' && 'toNumber' in value && typeof value.toNumber === 'function') {
            return value.toNumber();
          }
          return 0;
        };

        const transformedOrders: KitchenOrder[] = (orders || []).map((apiOrder: ApiOrder) => {
          const createdAt = new Date(apiOrder.createdAt);
          const now = new Date();
          const prepTime = Math.floor((now.getTime() - createdAt.getTime()) / 60000);
          
          return {
            id: apiOrder.id,
            orderNumber: apiOrder.orderNumber,
            type: apiOrder.type.toUpperCase().replace('-', '_') as 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY',
            status: apiOrder.status.toUpperCase() as KitchenOrder['status'],
            tableId: apiOrder.tableId,
            tableName: apiOrder.table?.name,
            tableNumber: apiOrder.table?.number,
            customerName: apiOrder.customerName,
            customerPhone: apiOrder.customerPhone,
            items: apiOrder.items.map(item => ({
              id: item.id,
              menuItemId: item.menuItemId,
              menuItemName: item.menuItem?.name || 'Unknown Item',
              quantity: item.quantity,
              unitPrice: toNumber(item.unitPrice),
              totalPrice: toNumber(item.totalPrice),
              notes: item.notes,
              status: item.status.toUpperCase(),
            })),
            subtotal: toNumber(apiOrder.subtotal),
            taxAmount: toNumber(apiOrder.taxAmount),
            totalAmount: toNumber(apiOrder.totalAmount),
            notes: apiOrder.notes,
            createdAt: apiOrder.createdAt,
            createdBy: {
              id: apiOrder.createdById,
              name: apiOrder.createdBy?.name || 'Unknown',
              role: 'STAFF',
            },
            prepTime,
            isRush: prepTime > 15,
          };
        });
        setApiKitchenOrders(transformedOrders);
      } catch (error) {
        console.error('Failed to load kitchen orders:', error);
        toast.error('Failed to load kitchen orders');
      } finally {
        setLoading(false);
      }
    };

    loadKitchenOrders();
  }, [locationId]);

  // Merge API orders with socket orders (socket takes precedence for real-time updates)
  const allKitchenOrders = useMemo(() => {
    console.log('🔄 Merging kitchen orders:', { 
      socketCount: socketKitchenOrders?.length || 0, 
      apiCount: apiKitchenOrders?.length || 0 
    });
    
    // Create a map of socket orders by ID (socket orders take precedence)
    const socketOrderMap = new Map(socketKitchenOrders.map(o => [o.id, o]));
    
    // Add API orders that aren't in socket orders
    const apiOnly = apiKitchenOrders.filter(o => !socketOrderMap.has(o.id));
    
    // Combine: socket orders first (real-time), then API-only orders
    const merged = [...socketKitchenOrders, ...apiOnly];
    
    console.log('✅ Merged kitchen orders:', merged.length);
    return merged;
  }, [socketKitchenOrders, apiKitchenOrders]);

  // Filter orders by status (exclude PENDING - those need confirmation first)
  const pendingOrders = allKitchenOrders.filter(
    (order) => order.status === 'CONFIRMED' // Only CONFIRMED orders, not PENDING
  );
  const preparingOrders = allKitchenOrders.filter(
    (order) => order.status === 'PREPARING'
  );
  const readyOrders = allKitchenOrders.filter(
    (order) => order.status === 'READY'
  );

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Update order status
  const handleStatusChange = async (orderId: string, newStatus: 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED') => {
    try {
      setUpdating(true);
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success(`Order marked as ${newStatus.toLowerCase()}`);
    } catch (error: any) {
      console.error('Failed to update order:', error);
      toast.error(error.response?.data?.error || 'Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  // Calculate elapsed time
  const getElapsedTime = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diff = Math.floor((now.getTime() - created.getTime()) / 1000 / 60); // minutes
    return diff;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // No location
  if (!locationId) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p>Please select a location first</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChefHat className="w-8 h-8 text-orange-500" />
            <div>
              <h1 className="text-2xl font-bold">Kitchen Display System</h1>
              <p className="text-gray-400 text-sm">{currentLocation?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isConnected 
                ? 'bg-green-900 text-green-300' 
                : 'bg-red-900 text-red-300'
            }`}>
              {isConnected ? '🟢 Live' : '🔴 Offline'}
            </div>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              {soundEnabled ? 'Sound ON' : 'Sound OFF'}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              {isFullscreen ? <X className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>

            {/* Current Time */}
            <div className="text-2xl font-mono">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="p-6 h-[calc(100vh-88px)] overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Pending Orders */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-yellow-500" />
              Pending ({pendingOrders.length})
            </h2>
            <div className="space-y-4">
              {pendingOrders && pendingOrders.length > 0 ? (
                pendingOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    bgColor="bg-yellow-900/30"
                    borderColor="border-yellow-600"
                    onStatusChange={handleStatusChange}
                    nextStatus="PREPARING"
                    nextStatusLabel="Start Cooking"
                    nextStatusColor="bg-orange-600 hover:bg-orange-700"
                    updating={updating}
                    getElapsedTime={getElapsedTime}
                  />
                ))
              ) : (
                <EmptyState icon={Clock} message="No pending orders" />
              )}
            </div>
          </div>

          {/* Preparing Orders */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ChefHat className="w-6 h-6 text-orange-500" />
              Preparing ({preparingOrders.length})
            </h2>
            <div className="space-y-4">
              {preparingOrders && preparingOrders.length > 0 ? (
                preparingOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    bgColor="bg-orange-900/30"
                    borderColor="border-orange-600"
                    onStatusChange={handleStatusChange}
                    nextStatus="READY"
                    nextStatusLabel="Mark Ready"
                    nextStatusColor="bg-green-600 hover:bg-green-700"
                    updating={updating}
                    getElapsedTime={getElapsedTime}
                  />
                ))
              ) : (
                <EmptyState icon={ChefHat} message="No orders being prepared" />
              )}
            </div>
          </div>

          {/* Ready Orders */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Ready ({readyOrders.length})
            </h2>
            <div className="space-y-4">
              {readyOrders && readyOrders.length > 0 ? (
                readyOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    bgColor="bg-green-900/30"
                    borderColor="border-green-600"
                    onStatusChange={handleStatusChange}
                    nextStatus="SERVED"
                    nextStatusLabel="Mark Served"
                    nextStatusColor="bg-purple-600 hover:bg-purple-700"
                    updating={updating}
                    getElapsedTime={getElapsedTime}
                  />
                ))
              ) : (
                <EmptyState icon={CheckCircle} message="No orders ready" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Order Card Component
interface OrderCardProps {
  order: any;
  bgColor: string;
  borderColor: string;
  onStatusChange: (orderId: string, status: string) => void;
  nextStatus: string;
  nextStatusLabel: string;
  nextStatusColor: string;
  updating: boolean;
  getElapsedTime: (createdAt: string) => number;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  bgColor,
  borderColor,
  onStatusChange,
  nextStatus,
  nextStatusLabel,
  nextStatusColor,
  updating,
  getElapsedTime,
}) => {
  const elapsedTime = getElapsedTime(order.createdAt);
  const isRush = elapsedTime > 15 || order.isRush;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`${bgColor} border-2 ${borderColor} rounded-lg p-4 ${
        isRush ? 'ring-2 ring-red-500 animate-pulse' : ''
      }`}
    >
      {/* Order Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xl font-bold">Order #{order.orderNumber}</h3>
          {order.tableNumber && (
            <p className="text-sm text-gray-400">Table {order.tableNumber}</p>
          )}
          {order.tableName && (
            <p className="text-sm text-gray-400">{order.tableName}</p>
          )}
          {order.customerName && (
            <p className="text-sm text-gray-400">{order.customerName}</p>
          )}
        </div>
        <div className={`text-right ${isRush ? 'text-red-400' : 'text-gray-400'}`}>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span className="text-lg font-mono">
              {elapsedTime} min
            </span>
          </div>
          {isRush && (
            <span className="text-xs text-red-400 font-semibold">RUSH!</span>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="space-y-2 mb-4">
        {order.items && order.items.map((item: any) => (
          <div key={item.id} className="bg-gray-800/50 rounded p-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-medium">{item.quantity}x</span>
                <span className="ml-2">{item.menuItemName}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                item.status === 'PENDING' ? 'bg-yellow-900 text-yellow-300' :
                item.status === 'PREPARING' ? 'bg-orange-900 text-orange-300' :
                'bg-green-900 text-green-300'
              }`}>
                {item.status}
              </span>
            </div>
            {item.notes && (
              <p className="text-sm text-gray-400 mt-1 italic">Note: {item.notes}</p>
            )}
          </div>
        ))}
      </div>

      {/* Order Notes */}
      {order.notes && (
        <div className="bg-blue-900/30 border border-blue-600 rounded p-2 mb-4">
          <p className="text-sm text-blue-300">
            <strong>Special Instructions:</strong> {order.notes}
          </p>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={() => onStatusChange(order.id, nextStatus)}
        disabled={updating}
        className={`w-full py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed ${nextStatusColor}`}
      >
        {updating ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Updating...
          </span>
        ) : (
          nextStatusLabel
        )}
      </button>
    </motion.div>
  );
};

// Empty State Component
interface EmptyStateProps {
  icon: React.ElementType;
  message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, message }) => (
  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
    <Icon className="w-16 h-16 mb-4" />
    <p>{message}</p>
  </div>
);

export default KitchenDisplayPage;
