import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit2, Trash2, Search, Package, 
  Loader2, AlertCircle
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCategories } from '@/hooks';
import { useMenuItems, useDeleteMenuItem, useUpdateMenuItemAvailability } from '@/hooks';
import { parseAPIError, getUserFriendlyErrorMessage } from '@/lib/apiError';

const MenuItemsPage = () => {
  const navigate = useNavigate();
  const { currentLocation } = useAuthStore();
  const locationId = currentLocation?.id || '';

  // React Query hooks
  const { data: categoriesData } = useCategories(locationId);
  const categories = categoriesData?.categories || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAvailability, setFilterAvailability] = useState<string>('all');

  // Build filters for API
  const filters = useMemo(() => {
    const apiFilters: { categoryId?: string; availability?: string; search?: string } = {};
    if (filterCategory !== 'all') apiFilters.categoryId = filterCategory;
    if (filterAvailability !== 'all') {
      // Map UI values to API values
      const availabilityMap: Record<string, 'IN_STOCK' | 'OUT_OF_STOCK' | 'HIDDEN'> = {
        'in-stock': 'IN_STOCK',
        'out-of-stock': 'OUT_OF_STOCK',
        'hidden': 'HIDDEN',
      };
      apiFilters.availability = availabilityMap[filterAvailability];
    }
    if (searchQuery.trim()) apiFilters.search = searchQuery.trim();
    return apiFilters;
  }, [filterCategory, filterAvailability, searchQuery]);

  const { data, isLoading, error } = useMenuItems(locationId, filters);
  const deleteMenuItem = useDeleteMenuItem(locationId);
  const updateAvailability = useUpdateMenuItemAvailability(locationId);

  const menuItems = data?.menuItems || [];

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    deleteMenuItem.mutate(id, {
      onSuccess: () => {
        setDeleteConfirm(null);
      },
      onError: (error) => {
        const apiError = parseAPIError(error);
        alert(getUserFriendlyErrorMessage(apiError));
      },
    });
  };

  const quickUpdateAvailability = (item: any, availability: 'IN_STOCK' | 'OUT_OF_STOCK' | 'HIDDEN') => {
    updateAvailability.mutate(
      { id: item.id, availability },
      {
        onError: (error) => {
          const apiError = parseAPIError(error);
          alert(getUserFriendlyErrorMessage(apiError));
        },
      }
    );
  };

  const getAvailabilityBadge = (availability: string) => {
    // Handle both API format (IN_STOCK) and display format (in-stock)
    const normalized = availability.toUpperCase().replace('-', '_');
    switch (normalized) {
      case 'IN_STOCK':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">In Stock</span>;
      case 'OUT_OF_STOCK':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">Out of Stock</span>;
      case 'HIDDEN':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">Hidden</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">{availability}</span>;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading menu items...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    const apiError = parseAPIError(error);
    return (
      <div className="p-4 lg:p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-1">Error Loading Menu Items</h3>
            <p className="text-red-800">{getUserFriendlyErrorMessage(apiError)}</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if location is selected
  if (!currentLocation) {
    return (
      <div className="p-4 lg:p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-900 mb-1">No Location Selected</h3>
            <p className="text-yellow-800">Please select a location from the location selector to manage menu items.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 font-serif">Menu Items</h1>
          <p className="text-gray-600 mt-1">Manage your menu items and availability for {currentLocation.name}</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/menu-items/new')}
          className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Menu Item</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu items..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Availability Filter */}
          <select
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            <option value="all">All Status</option>
            <option value="in-stock">In Stock</option>
            <option value="out-of-stock">Out of Stock</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {menuItems.length} item{menuItems.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Menu Items Grid */}
      {menuItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-dark-900 mb-2">No menu items found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || filterCategory !== 'all' || filterAvailability !== 'all'
              ? 'Try adjusting your filters'
              : 'Add your first menu item to get started'}
          </p>
          {!searchQuery && filterCategory === 'all' && filterAvailability === 'all' && (
            <button
              onClick={() => navigate('/dashboard/menu-items/new')}
              className="inline-flex items-center space-x-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add First Item</span>
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => {
            const category = categories.find(c => c.id === item.categoryId);
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    {getAvailabilityBadge(item.availability)}
                  </div>
                  <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow-lg">
                    <span className="font-bold text-primary-600">${item.price}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-dark-900 mb-1 font-serif truncate">
                        {item.name}
                      </h3>
                      {category && (
                        <p className="text-xs text-gray-500">{category.name}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {item.description}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => {
                        const newAvailability = item.availability === 'IN_STOCK' ? 'OUT_OF_STOCK' : 'IN_STOCK';
                        quickUpdateAvailability(item, newAvailability);
                      }}
                      disabled={updateAvailability.isPending}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        item.availability === 'IN_STOCK'
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.availability === 'IN_STOCK' ? 'In Stock' : 'Out of Stock'}
                    </button>
                    <button
                      onClick={() => navigate(`/dashboard/menu-items/${item.id}/edit`)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(item.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setDeleteConfirm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-dark-900 mb-3">Delete Menu Item?</h3>
              <p className="text-gray-600 mb-6">
                This will permanently delete this menu item. This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm!)}
                  disabled={deleteMenuItem.isPending}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {deleteMenuItem.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MenuItemsPage;
