import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, MapPin, Phone, Mail, CheckCircle, XCircle, Loader2, AlertCircle, QrCode } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useLocations, useDeleteLocation } from '@/hooks';
import type { Location } from '@/types/dashboard';
import { parseAPIError, getUserFriendlyErrorMessage } from '@/lib/apiError';
import QRCodeModal from '@/components/dashboard/QRCodeModal';

const LocationsPage = () => {
  const navigate = useNavigate();
  const { business, currentLocation, setCurrentLocation } = useAuthStore();
  
  // React Query hooks
  const { data, isLoading, error } = useLocations();
  const deleteLocation = useDeleteLocation();

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [qrCodeLocation, setQrCodeLocation] = useState<{ id: string; name: string } | null>(null);

  const locations = data?.locations || [];

  const handleEdit = (location: Location) => {
    navigate(`/dashboard/locations/${location.id}/edit`);
  };

  const handleDelete = (id: string) => {
    deleteLocation.mutate(id, {
      onSuccess: () => {
        setDeleteConfirm(null);
        // If deleted location was current, select first available
        if (currentLocation?.id === id && locations.length > 1) {
          const remainingLocations = locations.filter(loc => loc.id !== id);
          if (remainingLocations.length > 0) {
            setCurrentLocation(remainingLocations[0]);
          }
        }
      },
      onError: (error) => {
        const apiError = parseAPIError(error);
        alert(getUserFriendlyErrorMessage(apiError));
      },
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading locations...</p>
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
            <h3 className="text-lg font-semibold text-red-900 mb-1">Error Loading Locations</h3>
            <p className="text-red-800">{getUserFriendlyErrorMessage(apiError)}</p>
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
          <h1 className="text-3xl font-bold text-dark-900 font-serif">Locations</h1>
          <p className="text-gray-600 mt-1">Manage your restaurant locations</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/locations/new')}
          disabled={!business?.id}
          className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <Plus className="w-5 h-5" />
          <span>Add Location</span>
        </button>
      </div>

      {/* Empty state */}
      {locations.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-dark-900 mb-2">No locations yet</h3>
          <p className="text-gray-600 mb-6">Create your first location to get started</p>
          <button
            onClick={() => navigate('/dashboard/locations/new')}
            className="inline-flex items-center space-x-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add First Location</span>
          </button>
        </motion.div>
      )}

      {/* Locations Grid */}
      {locations.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location, index) => (
          <motion.div
            key={location.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-dark-900">{location.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {location.isActive ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-xs font-medium ${location.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {location.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">
                {location.address}
              </p>
              <p className="text-sm text-gray-600">
                {location.city}, {location.state} {location.zipCode}
              </p>
            </div>

            {/* Contact */}
            <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{location.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="truncate">{location.email}</span>
              </div>
            </div>

            {/* Subscription Status */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Subscription</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  location.subscriptionStatus === 'active'
                    ? 'bg-green-100 text-green-700'
                    : location.subscriptionStatus === 'trial'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {location.subscriptionStatus}
                </span>
              </div>
              <p className="text-sm font-semibold text-dark-900 capitalize">
                {location.subscriptionPlan} Plan
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentLocation(location)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Select
              </button>
              <button
                onClick={() => handleEdit(location)}
                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                title="Edit location"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setQrCodeLocation({ id: location.id, name: location.name })}
                className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                title="Generate QR code"
              >
                <QrCode className="w-4 h-4" />
              </button>
              {locations.length > 1 && (
                <button
                  onClick={() => setDeleteConfirm(location.id)}
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  title="Delete location"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
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
              <h3 className="text-xl font-bold text-dark-900 mb-3">Delete Location?</h3>
              <p className="text-gray-600 mb-6">
                This will permanently delete this location and all associated data. This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleteLocation.isPending}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {deleteLocation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      {qrCodeLocation && (
        <QRCodeModal
          locationId={qrCodeLocation.id}
          locationName={qrCodeLocation.name}
          isOpen={!!qrCodeLocation}
          onClose={() => setQrCodeLocation(null)}
        />
      )}
    </div>
  );
};

export default LocationsPage;

