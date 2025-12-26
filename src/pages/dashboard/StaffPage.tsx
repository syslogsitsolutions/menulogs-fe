import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus,
  Edit,
  X,
  LogIn,
  LogOut,
  Loader2,
  AlertCircle,
  Key,
  Mail,
  Phone,
  User
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useStaff } from '../../hooks';
import type { Staff, StaffRole } from '../../api/staffService';

const StaffPage = () => {
  const { currentLocation } = useAuthStore();
  const locationId = currentLocation?.id || '';

  // Use staff hook
  const {
    staff,
    loading,
    isConnected,
    stats,
    createStaff,
    updateStaff,
    clockIn,
    clockOut,
  } = useStaff(locationId);

  // Local UI state
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'WAITER' as StaffRole,
    pin: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('all');

  // Generate random PIN
  const generatePIN = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setFormData({ ...formData, pin });
  };

  // Create or update staff
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const staffData = {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        role: formData.role,
        pin: formData.pin,
      };

      if (editingStaff) {
        await updateStaff(editingStaff.id, staffData);
      } else {
        await createStaff(staffData);
      }

      setShowModal(false);
      setEditingStaff(null);
      setFormData({ name: '', email: '', phone: '', role: 'WAITER', pin: '' });
    } catch (error) {
      console.error('Failed to save staff:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Clock in/out
  const handleClockInOut = async (staffId: string, action: 'in' | 'out') => {
    if (action === 'in') {
      await clockIn(staffId);
    } else {
      await clockOut(staffId);
    }
  };

  // Open edit modal
  const handleEdit = (member: Staff) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      email: member.email || '',
      phone: member.phone || '',
      role: member.role,
      pin: member.pin || '',
    });
    setShowModal(true);
  };

  // Open create modal
  const handleCreate = () => {
    setEditingStaff(null);
    setFormData({ name: '', email: '', phone: '', role: 'WAITER', pin: '' });
    generatePIN(); // Auto-generate PIN for new staff
    setShowModal(true);
  };

  // Filter staff by role
  const filteredStaff = selectedRole === 'all' 
    ? staff 
    : staff.filter(s => s.role === selectedRole);

  // Loading state
  if (loading && (!staff || staff.length === 0)) {
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
            <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-gray-600">Manage your team members and shifts</p>
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
              onClick={handleCreate}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Staff
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 mb-1">Total Staff</p>
            <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 mb-1">Active</p>
            <p className="text-2xl font-bold text-green-700">{stats.active}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-orange-600 mb-1">On Shift</p>
            <p className="text-2xl font-bold text-orange-700">{stats.onShift}</p>
          </div>
        </div>
      </div>

      {/* Role Filter */}
      <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { key: 'all', label: 'All Staff' },
            { key: 'MANAGER', label: 'Managers' },
            { key: 'CASHIER', label: 'Cashiers' },
            { key: 'WAITER', label: 'Waiters' },
            { key: 'KITCHEN', label: 'Kitchen Staff' },
          ].map(role => (
            <button
              key={role.key}
              onClick={() => setSelectedRole(role.key)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedRole === role.key
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {role.label}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff && filteredStaff.length > 0 ? (
          filteredStaff.map(member => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">{member.name}</h3>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getRoleColor(member.role)}`}>
                    {member.role}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(member)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-3 text-sm text-gray-600">
                {member.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {member.email}
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {member.phone}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  PIN: {member.pin || 'N/A'}
                </div>
              </div>

              {/* Shift Status */}
              <div className="mb-3 p-2 bg-gray-50 rounded">
                {member.currentShift && !member.currentShift.clockOut ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium">On Shift</span>
                    </div>
                    <span className="text-xs text-gray-600">
                      Since {new Date(member.currentShift.clockIn).toLocaleTimeString()}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    <span className="text-sm">Off Shift</span>
                  </div>
                )}
              </div>

              {/* Clock In/Out Button */}
              <button
                onClick={() => handleClockInOut(
                  member.id,
                  member.currentShift && !member.currentShift.clockOut ? 'out' : 'in'
                )}
                disabled={!member.isActive}
                className={`w-full py-2 rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  member.currentShift && !member.currentShift.clockOut
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {member.currentShift && !member.currentShift.clockOut ? (
                  <>
                    <LogOut className="w-4 h-4" />
                    Clock Out
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Clock In
                  </>
                )}
              </button>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center h-64 text-gray-400">
            <User className="w-16 h-16 mb-4" />
            <p>No staff members found</p>
            <button
              onClick={handleCreate}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Add Your First Staff Member
            </button>
          </div>
        )}
      </div>

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
                  {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
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
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="WAITER">Waiter</option>
                    <option value="CASHIER">Cashier</option>
                    <option value="KITCHEN">Kitchen Staff</option>
                    <option value="MANAGER">Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PIN (4 digits) *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      pattern="[0-9]{4}"
                      maxLength={4}
                      value={formData.pin}
                      onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={generatePIN}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Generate
                    </button>
                  </div>
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
                    {submitting ? 'Saving...' : editingStaff ? 'Update' : 'Create'}
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

// Helper function for role colors
const getRoleColor = (role: string) => {
  const colors = {
    MANAGER: 'bg-purple-100 text-purple-700',
    CASHIER: 'bg-blue-100 text-blue-700',
    WAITER: 'bg-green-100 text-green-700',
    KITCHEN: 'bg-orange-100 text-orange-700',
  };
  return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-700';
};

export default StaffPage;
