import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Receipt,
  User,
  MapPin,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useOrderSocket } from '../../hooks';
import { orderService, printService } from '../../api';
import { toast } from 'react-hot-toast';
import { KOTPreview } from '../../components/bills/KOTPreview';
import { BillPreview } from '../../components/bills/BillPreview';
import { Printer, FileText } from 'lucide-react';
import type { Order } from '../../types/order.types';
import type { Order as ApiOrder } from '../../api/orderService';

// Transform API order to UI order format
const transformOrder = (apiOrder: ApiOrder): Order => {
  const toNumber = (value: number | string | { toNumber?: () => number } | undefined): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      if (isNaN(parsed)) {
        console.warn('⚠️ Failed to parse string to number:', value);
        return 0;
      }
      return parsed;
    }
    if (value && typeof value === 'object' && 'toNumber' in value && typeof value.toNumber === 'function') {
      return value.toNumber();
    }
    if (value !== undefined && value !== null) {
      console.warn('⚠️ Unexpected value type in toNumber:', typeof value, value);
    }
    return 0;
  };

  return {
    id: apiOrder.id,
    orderNumber: apiOrder.orderNumber,
    type: apiOrder.type.toUpperCase().replace('-', '_') as 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY',
    status: apiOrder.status.toUpperCase() as Order['status'],
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
  };
};

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';

const OrdersPage = () => {
  const { currentLocation } = useAuthStore();
  const locationId = currentLocation?.id || '';

  // Socket.IO for real-time updates
  const { orders: socketOrders, isConnected } = useOrderSocket(locationId);

  // Local state
  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [showKOTPreview, setShowKOTPreview] = useState(false);
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [kotData, setKOTData] = useState<any>(null);
  const [billData, setBillData] = useState<any>(null);
  const [loadingPrint, setLoadingPrint] = useState(false);

  // Load initial orders
  useEffect(() => {
    if (!locationId) return;

    const loadOrders = async () => {
      try {
        setLoading(true);
        const response = await orderService.getOrders(locationId, {
          status: selectedStatus === 'all' ? undefined : (selectedStatus as 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED'),
        });
        // API returns { orders, total, page, limit }
        // Transform API orders to UI format
        const transformedOrders = (response.orders || []).map(transformOrder);
        setLocalOrders(transformedOrders);
      } catch (error) {
        console.error('Failed to load orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [locationId, selectedStatus]);

  // Merge socket orders with local orders (socket takes precedence for real-time updates)
  const allOrders = useMemo(() => {
    console.log('🔄 Merging orders:', { 
      socketCount: socketOrders?.length || 0, 
      localCount: localOrders?.length || 0 
    });
    
    if (!socketOrders || socketOrders.length === 0) {
      console.log('📋 Using local orders only');
      return localOrders;
    }
    
    // Create a map of socket orders by ID (socket orders take precedence)
    const socketOrderMap = new Map(socketOrders.map(o => [o.id, o]));
    
    // Add local orders that aren't in socket orders
    const localOnly = localOrders.filter(o => !socketOrderMap.has(o.id));
    
    // Combine: socket orders first (real-time), then local-only orders
    const merged = [...socketOrders, ...localOnly];
    
    // Sort by creation date (newest first)
    const sorted = merged.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    console.log('✅ Merged orders:', sorted.length);
    return sorted;
  }, [socketOrders, localOrders]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return allOrders.filter(order => {
      const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
      const matchesSearch = 
        order.orderNumber.toString().includes(searchQuery) ||
        order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerPhone?.includes(searchQuery);
      return matchesStatus && matchesSearch;
    });
  }, [allOrders, selectedStatus, searchQuery]);

  console.log('filteredOrders', filteredOrders);

  // Update order status
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdating(true);
      // Backend expects uppercase status values
      await orderService.updateOrderStatus(orderId, newStatus);
      
      // Update local state optimistically
      setLocalOrders(prev => 
        prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
      );
      
      // Socket will broadcast the update automatically
      toast.success('Order status updated');
      
      // Close detail panel if it's the selected order
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error: unknown) {
      console.error('Failed to update order:', error);
      const errorMessage = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to update order';
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  // Print KOT
  const handlePrintKOT = async () => {
    if (!selectedOrder) return;

    try {
      setLoadingPrint(true);
      const kot = await printService.getKOT(selectedOrder.id);
      setKOTData(kot);
      setShowKOTPreview(true);
    } catch (error: any) {
      console.error('Failed to load KOT:', error);
      toast.error(error.response?.data?.error || 'Failed to load KOT');
    } finally {
      setLoadingPrint(false);
    }
  };

  // Print Bill
  const handlePrintBill = async () => {
    if (!selectedOrder) return;

    try {
      setLoadingPrint(true);
      const bill = await printService.getBill(selectedOrder.id);
      setBillData(bill);
      setShowBillPreview(true);
    } catch (error: any) {
      console.error('Failed to load Bill:', error);
      toast.error(error.response?.data?.error || 'Failed to load Bill');
    } finally {
      setLoadingPrint(false);
    }
  };

  // Cancel order
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      setUpdating(true);
      await orderService.cancelOrder(orderId, 'Cancelled by staff');
      
      // Remove from local state
      setLocalOrders(prev => prev.filter(o => o.id !== orderId));
      toast.success('Order cancelled');
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    } catch (error: unknown) {
      console.error('Failed to cancel order:', error);
      const errorMessage = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to cancel order';
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  // Get status counts
  const statusCounts = useMemo(() => {
    return {
      all: allOrders.length,
      PENDING: allOrders.filter(o => o.status === 'PENDING').length,
      CONFIRMED: allOrders.filter(o => o.status === 'CONFIRMED').length,
      PREPARING: allOrders.filter(o => o.status === 'PREPARING').length,
      READY: allOrders.filter(o => o.status === 'READY').length,
      SERVED: allOrders.filter(o => o.status === 'SERVED').length,
      COMPLETED: allOrders.filter(o => o.status === 'COMPLETED').length,
    };
  }, [allOrders]);

  // Loading state
  if (loading && allOrders.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // No location
  if (!locationId) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-500">Please select a location first</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600">Manage and track all orders</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isConnected 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {isConnected ? '🟢 Live' : '🔴 Offline'}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by order number, customer name, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Status Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { key: 'all', label: 'All', count: statusCounts.all },
            { key: 'PENDING', label: 'Pending', count: statusCounts.PENDING },
            { key: 'CONFIRMED', label: 'Confirmed', count: statusCounts.CONFIRMED },
            { key: 'PREPARING', label: 'Preparing', count: statusCounts.PREPARING },
            { key: 'READY', label: 'Ready', count: statusCounts.READY },
            { key: 'SERVED', label: 'Served', count: statusCounts.SERVED },
            { key: 'COMPLETED', label: 'Completed', count: statusCounts.COMPLETED },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedStatus(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedStatus === tab.key
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders && filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer"
              onClick={() => setSelectedOrder(order)}
            >
              {/* Order Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    Order #{order.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              {/* Order Details */}
              <div className="space-y-2 mb-3">
                {order.tableNumber && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    Table {order.tableNumber}
                  </div>
                )}
                {order.customerName && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    {order.customerName}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Receipt className="w-4 h-4" />
                  {order.items?.length || 0} items
                </div>
              </div>

              {/* Total */}
              <div className="pt-3 border-t flex items-center justify-between">
                <span className="text-sm text-gray-600">Total</span>
                <span className="font-bold text-gray-900">
                  ₹{order.totalAmount?.toFixed(2) || '0.00'}
                </span>
              </div>

              {/* Quick Actions */}
              <div className="mt-3 flex gap-2">
                {order.status === 'PENDING' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(order.id, 'CONFIRMED');
                    }}
                    disabled={updating}
                    className="flex-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-300"
                  >
                    Confirm
                  </button>
                )}
                {order.status === 'CONFIRMED' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(order.id, 'PREPARING');
                    }}
                    disabled={updating}
                    className="flex-1 px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 disabled:bg-gray-300"
                  >
                    Start Preparing
                  </button>
                )}
                {order.status === 'READY' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(order.id, 'SERVED');
                    }}
                    disabled={updating}
                    className="flex-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:bg-gray-300"
                  >
                    Mark Served
                  </button>
                )}
                {order.status === 'SERVED' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(order.id, 'COMPLETED');
                    }}
                    disabled={updating}
                    className="flex-1 px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 disabled:bg-gray-300"
                  >
                    Complete Order
                  </button>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center h-64 text-gray-400">
            <Receipt className="w-16 h-16 mb-4" />
            <p>No orders found</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Order #{selectedOrder.orderNumber}
                    </h2>
                    <p className="text-gray-600">
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Status */}
                <div className="mb-6">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items && selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b">
                        <div>
                          <p className="font-medium">{item.menuItemName}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          {item.notes && (
                            <p className="text-sm text-gray-500 italic">{item.notes}</p>
                          )}
                        </div>
                        <span className="font-semibold">
                          ₹{(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="mb-6 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{selectedOrder.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>₹{selectedOrder.taxAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                    <span>Total</span>
                    <span>₹{selectedOrder.totalAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>

                {/* Status Change in Detail Modal */}
                {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'COMPLETED' && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Change Status</h3>
                    <div className="flex gap-2 flex-wrap">
                      {selectedOrder.status === 'PENDING' && (
                        <button
                          onClick={() => handleStatusChange(selectedOrder.id, 'CONFIRMED')}
                          disabled={updating}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
                        >
                          Confirm Order
                        </button>
                      )}
                      {selectedOrder.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleStatusChange(selectedOrder.id, 'PREPARING')}
                          disabled={updating}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300"
                        >
                          Start Preparing
                        </button>
                      )}
                      {selectedOrder.status === 'PREPARING' && (
                        <button
                          onClick={() => handleStatusChange(selectedOrder.id, 'READY')}
                          disabled={updating}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-gray-300"
                        >
                          Mark Ready
                        </button>
                      )}
                      {selectedOrder.status === 'READY' && (
                        <button
                          onClick={() => handleStatusChange(selectedOrder.id, 'SERVED')}
                          disabled={updating}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300"
                        >
                          Mark Served
                        </button>
                      )}
                      {selectedOrder.status === 'SERVED' && (
                        <button
                          onClick={() => handleStatusChange(selectedOrder.id, 'COMPLETED')}
                          disabled={updating}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300"
                        >
                          Complete Order
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Print Actions */}
                <div className="mb-6 flex gap-3">
                  {(selectedOrder.status === 'CONFIRMED' || selectedOrder.status === 'PREPARING' || selectedOrder.status === 'READY') && (
                    <button
                      onClick={handlePrintKOT}
                      disabled={loadingPrint}
                      className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 flex items-center justify-center gap-2"
                    >
                      {loadingPrint ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Printer className="w-4 h-4" />
                          Print KOT
                        </>
                      )}
                    </button>
                  )}
                  {(selectedOrder.status === 'COMPLETED' || selectedOrder.status === 'SERVED') && (
                    <button
                      onClick={handlePrintBill}
                      disabled={loadingPrint}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 flex items-center justify-center gap-2"
                    >
                      {loadingPrint ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          Print Bill
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleCancelOrder(selectedOrder.id)}
                      disabled={updating}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300"
                    >
                      Cancel Order
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>

        {/* KOT Preview Modal */}
        <AnimatePresence>
          {showKOTPreview && kotData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => {
                setShowKOTPreview(false);
                setKOTData(null);
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">KOT Preview</h2>
                    <button
                      onClick={() => {
                        setShowKOTPreview(false);
                        setKOTData(null);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  <KOTPreview
                    kotData={kotData}
                    onClose={() => {
                      setShowKOTPreview(false);
                      setKOTData(null);
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bill Preview Modal */}
        <AnimatePresence>
          {showBillPreview && billData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => {
                setShowBillPreview(false);
                setBillData(null);
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Bill Preview</h2>
                    <button
                      onClick={() => {
                        setShowBillPreview(false);
                        setBillData(null);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  <BillPreview
                    billData={billData}
                    onClose={() => {
                      setShowBillPreview(false);
                      setBillData(null);
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
};

// Helper function for status colors
const getStatusColor = (status: string) => {
  const colors = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    PREPARING: 'bg-orange-100 text-orange-700',
    READY: 'bg-green-100 text-green-700',
    SERVED: 'bg-purple-100 text-purple-700',
    COMPLETED: 'bg-gray-100 text-gray-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
};

export default OrdersPage;
