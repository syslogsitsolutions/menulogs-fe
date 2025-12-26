import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutGrid,
  List,
  Plus,
  Edit,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Users
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTables } from '../../hooks';
import type { Table, TableStatus } from '../../api/tableService';

type ViewMode = 'grid' | 'list';

const TablesPage = () => {
  const { currentLocation } = useAuthStore();
  const locationId = currentLocation?.id || '';

  // Use tables hook
  const {
    tables,
    loading,
    isConnected,
    stats,
    createTable,
    updateTable,
    updateTableStatus,
    deleteTable,
  } = useTables(locationId);

  // Local UI state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState({
    number: 1,
    name: '',
    capacity: 4,
  });
  const [submitting, setSubmitting] = useState(false);

  // Create or update table
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      if (editingTable) {
        // Update existing table
        await updateTable(editingTable.id, formData);
      } else {
        // Create new table
        await createTable(formData);
      }

      setShowModal(false);
      setEditingTable(null);
      setFormData({ number: (tables?.length || 0) + 1, name: '', capacity: 4 });
    } catch (error) {
      console.error('Failed to save table:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete table
  const handleDelete = async (tableId: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;
    await deleteTable(tableId);
  };

  // Change table status
  const handleStatusChange = async (tableId: string, newStatus: TableStatus) => {
    await updateTableStatus(tableId, newStatus);
  };

  // Open edit modal
  const handleEdit = (table: Table) => {
    setEditingTable(table);
    setFormData({
      number: table.number,
      name: table.name || '',
      capacity: table.capacity,
    });
    setShowModal(true);
  };

  // Open create modal
  const handleCreate = () => {
    setEditingTable(null);
    setFormData({ number: (tables?.length || 0) + 1, name: '', capacity: 4 });
    setShowModal(true);
  };

  // Loading state
  if (loading && (!tables || tables.length === 0)) {
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
            <h1 className="text-2xl font-bold text-gray-900">Tables</h1>
            <p className="text-gray-600">Manage restaurant tables and layout</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isConnected 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {isConnected ? '🟢 Live' : '🔴 Offline'}
            </div>
            <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid'
                    ? 'bg-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list'
                    ? 'bg-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Table
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Tables</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 mb-1">Available</p>
            <p className="text-2xl font-bold text-green-700">{stats.available}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-sm text-red-600 mb-1">Occupied</p>
            <p className="text-2xl font-bold text-red-700">{stats.occupied}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm text-yellow-600 mb-1">Reserved</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.reserved}</p>
          </div>
        </div>
      </div>

      {/* Tables Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tables && tables.length > 0 ? (
            tables.map(table => (
              <motion.div
                key={table.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-white rounded-lg shadow-sm p-4 border-2 ${getStatusBorderColor(table.status)}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Table {table.number}
                    </h3>
                    {table.name && (
                      <p className="text-sm text-gray-600">{table.name}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(table.status)}`}>
                    {table.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Users className="w-4 h-4" />
                  <span>{table.capacity} seats</span>
                </div>

                {/* Status Actions */}
                <div className="space-y-2 mb-3">
                  {table.status !== 'AVAILABLE' && (
                    <button
                      onClick={() => handleStatusChange(table.id, 'AVAILABLE')}
                      className="w-full px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                    >
                      Mark Available
                    </button>
                  )}
                  {table.status === 'AVAILABLE' && (
                    <button
                      onClick={() => handleStatusChange(table.id, 'OCCUPIED')}
                      className="w-full px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                    >
                      Mark Occupied
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(table)}
                    className="flex-1 px-3 py-1 bg-blue-50 text-blue-600 rounded text-sm hover:bg-blue-100 flex items-center justify-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(table.id)}
                    className="flex-1 px-3 py-1 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100 flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center h-64 text-gray-400">
              <LayoutGrid className="w-16 h-16 mb-4" />
              <p>No tables found</p>
              <button
                onClick={handleCreate}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Add Your First Table
              </button>
            </div>
          )}
        </div>
      ) : (
        // List View
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Table #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tables && tables.length > 0 ? (
                tables.map(table => (
                  <tr key={table.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold">{table.number}</td>
                    <td className="px-6 py-4 text-gray-600">{table.name || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{table.capacity} seats</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(table.status)}`}>
                        {table.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(table)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(table.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No tables found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-lg max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingTable ? 'Edit Table' : 'Add New Table'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Table Number *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Table Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Window Seat, VIP Booth"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 4 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Saving...' : editingTable ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper functions
const getStatusColor = (status: string) => {
  const colors = {
    AVAILABLE: 'bg-green-100 text-green-700',
    OCCUPIED: 'bg-red-100 text-red-700',
    RESERVED: 'bg-yellow-100 text-yellow-700',
    CLEANING: 'bg-gray-100 text-gray-700',
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
};

const getStatusBorderColor = (status: string) => {
  const colors = {
    AVAILABLE: 'border-green-500',
    OCCUPIED: 'border-red-500',
    RESERVED: 'border-yellow-500',
    CLEANING: 'border-gray-500',
  };
  return colors[status as keyof typeof colors] || 'border-gray-300';
};

export default TablesPage;
