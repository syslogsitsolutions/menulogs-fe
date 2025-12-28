import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ChefHat,
  Receipt,
  MessageSquare,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useCategories, useMenuItems, useTables, useOrderSocket } from '../../../hooks';
import { orderService } from '../../../api';
import { toast } from 'react-hot-toast';

interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

type OrderType = 'DINE_IN' | 'TAKEAWAY';

const POSPage = () => {
  const { currentLocation, business } = useAuthStore();
  const locationId = currentLocation?.id || '';
  const restaurantLogo = business?.logo || null;

  // API Hooks
  const { data: categoriesData, isLoading: loadingCategories } = useCategories(locationId);
  const { data: menuItemsData, isLoading: loadingMenuItems } = useMenuItems(locationId);
  console.log(menuItemsData);
  const { tables, loading: loadingTables, getAvailableTables } = useTables(locationId);  
  const { isConnected } = useOrderSocket(locationId);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Prepare categories with "All" option
  const categories = useMemo(() => {
    if (!categoriesData?.categories) return [];
    return [
      { id: 'all', name: 'All Items', icon: '🍽️', isVisible: true },
      ...categoriesData.categories,
    ];
  }, [categoriesData]);

  // Filter menu items
  const filteredItems = useMemo(() => {
    if (!menuItemsData?.menuItems) return [];
    
    return menuItemsData.menuItems.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      // Backend returns 'IN_STOCK', 'OUT_OF_STOCK', 'HIDDEN' (uppercase with underscores)
      const isAvailable = item.availability === 'IN_STOCK';
      return matchesCategory && matchesSearch && isAvailable;
    });
  }, [menuItemsData, selectedCategory, searchQuery]);

  // Calculate totals
  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  // Default tax rate to 10% (Location type doesn't have taxRate property)
  const taxRate = 0.10;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  // Add item to order
  const addToOrder = (menuItem: any) => {
    setOrderItems(prev => {
      const existing = prev.find(item => item.menuItemId === menuItem.id);
      if (existing) {
        return prev.map(item =>
          item.menuItemId === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: Number(menuItem.price),
        quantity: 1,
      }];
    });
  };

  // Update item quantity
  const updateQuantity = (menuItemId: string, delta: number) => {
    setOrderItems(prev => {
      return prev.map(item => {
        if (item.menuItemId === menuItemId) {
          const newQuantity = item.quantity + delta;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  // Remove item from order
  const removeItem = (menuItemId: string) => {
    setOrderItems(prev => prev.filter(item => item.menuItemId !== menuItemId));
  };

  // Send order to kitchen
  const handleSendToKitchen = async () => {
    if (orderItems.length === 0) {
      toast.error('Please add items to the order');
      return;
    }

    if (orderType === 'DINE_IN' && !selectedTable) {
      toast.error('Please select a table');
      return;
    }

    setSubmitting(true);

    try {
      const orderData = {
        type: orderType,
        tableId: orderType === 'DINE_IN' && selectedTable ? selectedTable : undefined,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        notes: orderNotes || undefined,
        status: 'CONFIRMED' as const, // Send directly to kitchen with CONFIRMED status
        items: orderItems.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          notes: item.notes,
        })),
      };

      await orderService.createOrder(locationId, orderData);
      
      toast.success('Order sent to kitchen!');
      
      // Reset form
      setOrderItems([]);
      setSelectedTable(null);
      setCustomerName('');
      setCustomerPhone('');
      setOrderNotes('');
      
    } catch (error: any) {
      console.error('Failed to create order:', error);
      toast.error(error.response?.data?.error || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendForConfirmation = async () => {
    if (orderItems.length === 0) {
      toast.error('Please add items to the order');
      return;
    }

    if (orderType === 'DINE_IN' && !selectedTable) {
      toast.error('Please select a table');
      return;
    }

    setSubmitting(true);

    try {
      const orderData = {
        type: orderType,
        tableId: orderType === 'DINE_IN' && selectedTable ? selectedTable : undefined,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        notes: orderNotes || undefined,
        status: 'PENDING' as const, // Send for confirmation with PENDING status
        items: orderItems.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          notes: item.notes,
        })),
      };

      await orderService.createOrder(locationId, orderData);
      
      toast.success('Order sent for confirmation!');
      
      // Reset form
      setOrderItems([]);
      setSelectedTable(null);
      setCustomerName('');
      setCustomerPhone('');
      setOrderNotes('');
      
    } catch (error: any) {
      console.error('Failed to create order:', error);
      toast.error(error.response?.data?.error || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loadingCategories || loadingMenuItems || loadingTables) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // No location selected
  if (!locationId) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-500">Please select a location first</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Left Panel - Menu */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isConnected 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {isConnected ? '🟢 Live' : '🔴 Offline'}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white border-b px-6 py-3 overflow-x-auto">
          <div className="flex gap-2">
            {categories && categories.length > 0 ? (
              categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {'image' in category && category.image && (
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="mr-2 w-5 h-5 object-cover rounded"
                    />
                  )}
                  {category.name}
                </button>
              ))
            ) : (
              <div className="text-gray-400">No categories available</div>
            )}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems && filteredItems.length > 0 && filteredItems.map(item => (
              <motion.button
                key={item.id}
                onClick={() => addToOrder(item)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 text-left"
              >
                <div className={`relative w-full h-32 rounded-lg mb-3 overflow-hidden ${!item.image && restaurantLogo ? 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50' : 'bg-gray-100'}`}>
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : restaurantLogo ? (
                    <div className="relative w-full h-full flex flex-col items-center justify-center p-3">
                      {/* Restaurant Logo with Grayscale Filter */}
                      <div className="relative flex-1 w-full flex items-center justify-center">
                        <div className="relative">
                          <img
                            src={restaurantLogo}
                            alt="Restaurant Logo"
                            className="max-w-full max-h-[70%] object-contain drop-shadow-sm grayscale opacity-60 transition-opacity duration-300"
                            style={{ filter: 'grayscale(100%)' }}
                          />
                          {/* Subtle overlay for additional depth */}
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-400/20 to-transparent pointer-events-none"></div>
                        </div>
                      </div>
                      {/* Image Not Available Badge */}
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-1.5 py-0.5 rounded-full shadow-sm border border-gray-200/50">
                        <p className="text-[8px] text-gray-600 font-medium whitespace-nowrap">
                          No image
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center p-2">
                        <svg className="w-8 h-8 mx-auto text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-[8px] text-gray-600 font-medium">No image</p>
                      </div>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                <p className="text-orange-500 font-bold">₹{Number(item.price).toFixed(2)}</p>
                {item.isVegetarian && (
                  <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                    🌱 Veg
                  </span>
                )}
              </motion.button>
            ))}
          </div>

          {(!filteredItems || filteredItems.length === 0) && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <ChefHat className="w-16 h-16 mb-4" />
              <p>No items found</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Order Summary */}
      <div className="w-96 bg-white border-l flex flex-col">
        {/* Order Type Toggle */}
        <div className="p-4 border-b">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setOrderType('DINE_IN');
                setSelectedTable(null);
              }}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                orderType === 'DINE_IN'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              🍽️ Dine In
            </button>
            <button
              onClick={() => {
                setOrderType('TAKEAWAY');
                setSelectedTable(null);
              }}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                orderType === 'TAKEAWAY'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              📦 Takeaway
            </button>
          </div>
        </div>

        {/* Table Selection (for Dine In) */}
        {orderType === 'DINE_IN' && (
          <div className="p-4 border-b">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Table
            </label>
            <select
              value={selectedTable || ''}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Choose a table...</option>
              {tables && tables.length > 0 ? (
                getAvailableTables().map(table => (
                  <option key={table.id} value={table.id}>
                    Table {table.number} {table.name ? `- ${table.name}` : ''}
                  </option>
                ))
              ) : (
                <option value="" disabled>No tables available</option>
              )}
            </select>
          </div>
        )}

        {/* Customer Info */}
        <div className="p-4 border-b space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name (Optional)
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Enter phone..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Order Items */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
          
          {orderItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Receipt className="w-16 h-16 mb-4" />
              <p className="text-center">No items added yet<br />Select items from menu</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orderItems.map(item => (
                <div key={item.menuItemId} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">₹{item.price.toFixed(2)} each</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.menuItemId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.menuItemId, -1)}
                        className="w-8 h-8 rounded-lg bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menuItemId, 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="font-semibold text-gray-900">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Notes */}
        <div className="p-4 border-t">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Order Notes
          </label>
          <textarea
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            placeholder="Special requests, allergies, etc..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 resize-none"
          />
        </div>

        {/* Totals */}
        <div className="p-4 border-t space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
            <span>₹{taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t space-y-2">
          <button
            onClick={handleSendToKitchen}
            disabled={orderItems.length === 0 || submitting || (orderType === 'DINE_IN' && !selectedTable)}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <ChefHat className="w-5 h-5" />
                Send to Kitchen
              </>
            )}
          </button>
          <button
            onClick={handleSendForConfirmation}
            disabled={orderItems.length === 0 || submitting || (orderType === 'DINE_IN' && !selectedTable)}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Send for Confirmation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POSPage;
