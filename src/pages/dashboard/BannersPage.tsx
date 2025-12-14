import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, EyeOff, Image as ImageIcon, Loader2, AlertCircle, GripVertical } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useBanners, useCreateBanner, useUpdateBanner, useDeleteBanner, useToggleBannerActive } from '@/hooks';
import type { Banner } from '@/types/dashboard';
import { parseAPIError, getUserFriendlyErrorMessage } from '@/lib/apiError';
import { SingleImageUpload } from '@/components/common';

const BannersPage = () => {
  const { currentLocation } = useAuthStore();
  const locationId = currentLocation?.id || '';

  // React Query hooks
  const { data } = useBanners(locationId);
  const createBanner = useCreateBanner(locationId);
  const updateBanner = useUpdateBanner(locationId);
  const deleteBanner = useDeleteBanner(locationId);
  const toggleActive = useToggleBannerActive(locationId);

  const banners = data?.banners || [];

  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [originalFormData, setOriginalFormData] = useState<typeof formData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    video: '',
    link: '',
    isActive: true
  });
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);

  // Helper function to check if form data has changed
  const hasChanges = (): boolean => {
    if (!editingBanner || !originalFormData) return true; // Always allow create
    
    return (
      formData.title.trim() !== originalFormData.title.trim() ||
      formData.subtitle.trim() !== (originalFormData.subtitle.trim() || '') ||
      formData.image !== originalFormData.image ||
      formData.video !== (originalFormData.video || '') ||
      formData.link !== (originalFormData.link || '') ||
      formData.isActive !== originalFormData.isActive
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentLocation) {
      setErrorMessage('Please select a location first');
      return;
    }

    if (!formData.title.trim()) {
      setErrorMessage('Banner title is required');
      return;
    }

    if (!formData.image) {
      setErrorMessage('Image is required');
      return;
    }

    setErrorMessage(null);

    if (editingBanner) {
      // Check if any changes were made
      if (!hasChanges()) {
        setErrorMessage('No changes detected. Please modify the banner before saving.');
        return;
      }

      // Only send changed fields
      const changes: {
        title?: string;
        subtitle?: string;
        image?: string | File;
        video?: string;
        link?: string;
        isActive?: boolean;
      } = {};
      if (formData.title.trim() !== originalFormData!.title.trim()) changes.title = formData.title.trim();
      if (formData.subtitle.trim() !== (originalFormData!.subtitle.trim() || '')) changes.subtitle = formData.subtitle.trim() || undefined;
      if (formData.image !== originalFormData!.image) {
        // Send File object if new file was selected, otherwise send URL
        changes.image = imageFile || formData.image;
      }
      if (formData.video !== (originalFormData!.video || '')) changes.video = formData.video || undefined;
      if (formData.link !== (originalFormData!.link || '')) changes.link = formData.link || undefined;
      if (formData.isActive !== originalFormData!.isActive) changes.isActive = formData.isActive;

      updateBanner.mutate(
        { id: editingBanner.id, data: changes },
        {
          onSuccess: () => {
            handleCloseModal();
          },
          onError: (error) => {
            console.error('Update banner error:', error);
            const apiError = parseAPIError(error);
            setErrorMessage(getUserFriendlyErrorMessage(apiError));
          },
        }
      );
    } else {
      // Create new banner
      const bannerData = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim() || undefined,
        image: imageFile || formData.image, // Send File object if available, otherwise URL/base64
        video: formData.video || undefined,
        link: formData.link || undefined,
        isActive: formData.isActive,
      };

      createBanner.mutate(bannerData, {
        onSuccess: () => {
          handleCloseModal();
        },
        onError: (error) => {
          console.error('Create banner error:', error);
          const apiError = parseAPIError(error);
          setErrorMessage(getUserFriendlyErrorMessage(apiError));
        },
      });
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    const initialFormData = {
      title: banner.title,
      subtitle: banner.subtitle || '',
      image: banner.image,
      video: banner.video || '',
      link: banner.link || '',
      isActive: banner.isActive
    };
    setFormData(initialFormData);
    setOriginalFormData(initialFormData);
    setImageFile(undefined); // Clear any previously selected file
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    deleteBanner.mutate(id, {
      onSuccess: () => {
        setDeleteConfirm(null);
      },
      onError: (error) => {
        const apiError = parseAPIError(error);
        alert(getUserFriendlyErrorMessage(apiError));
      },
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBanner(null);
    setOriginalFormData(null);
    setErrorMessage(null);
    setImageFile(undefined);
    setFormData({
      title: '',
      subtitle: '',
      image: '',
      video: '',
      link: '',
      isActive: true
    });
  };

  const handleToggleActive = (banner: Banner) => {
    toggleActive.mutate(banner.id, {
      onError: (error) => {
        const apiError = parseAPIError(error);
        alert(getUserFriendlyErrorMessage(apiError));
      },
    });
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 font-serif">Banners & Promotions</h1>
          <p className="text-gray-600 mt-1">Manage promotional banners for your menu</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Banner</span>
        </button>
      </div>

      {/* Banners List */}
      {banners.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-dark-900 mb-2">No banners yet</h3>
          <p className="text-gray-600 mb-6">Create your first promotional banner</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center space-x-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add First Banner</span>
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner, index) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all ${
                !banner.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex flex-col md:flex-row">
                {/* Banner Preview */}
                <div className="relative w-full md:w-80 h-48 bg-gray-100">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  {!banner.isActive && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-semibold">
                        Inactive
                      </span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Order: {index + 1}
                    </span>
                  </div>
                </div>

                {/* Banner Info */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-dark-900 mb-1">{banner.title}</h3>
                      {banner.subtitle && (
                        <p className="text-gray-600">{banner.subtitle}</p>
                      )}
                    </div>
                    <button
                      className="p-2 text-gray-400 hover:text-gray-600 cursor-move"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-5 h-5" />
                    </button>
                  </div>

                  {banner.link && (
                    <div className="mb-4">
                      <span className="text-sm text-gray-500">Link: </span>
                      <a 
                        href={banner.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:underline"
                      >
                        {banner.link}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleActive(banner)}
                        disabled={toggleActive.isPending}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          banner.isActive
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {toggleActive.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : banner.isActive ? (
                          <>
                            <Eye className="w-4 h-4" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(banner)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Edit banner"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(banner.id)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        title="Delete banner"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={createBanner.isPending || updateBanner.isPending ? undefined : handleCloseModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold text-dark-900 mb-6 font-serif">
                  {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Banner Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      placeholder="e.g., Weekend Special Offer"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      placeholder="e.g., 20% off on all main courses"
                    />
                  </div>

                  {errorMessage && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">{errorMessage}</p>
                    </div>
                  )}

                  <SingleImageUpload
                    image={formData.image}
                    onChange={(value) => {
                      setFormData({ ...formData, image: value.preview });
                      setImageFile(value.file);
                    }}
                    maxSizeMB={10}
                    label="Banner Image *"
                    error={errorMessage && !formData.image ? errorMessage : undefined}
                    required
                    aspectRatio="aspect-video"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Video URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.video}
                      onChange={(e) => setFormData({ ...formData, video: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      placeholder="https://example.com/video.mp4"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      placeholder="https://example.com/promotion"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Active (visible to customers)</span>
                    </label>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      disabled={createBanner.isPending || updateBanner.isPending}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createBanner.isPending || updateBanner.isPending}
                      className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {(createBanner.isPending || updateBanner.isPending) && (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      )}
                      <span>{editingBanner ? 'Update' : 'Create'} Banner</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              <h3 className="text-xl font-bold text-dark-900 mb-3">Delete Banner?</h3>
              <p className="text-gray-600 mb-6">
                This will permanently delete this banner. This action cannot be undone.
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
                  disabled={deleteBanner.isPending}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {deleteBanner.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
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

export default BannersPage;

