import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, EyeOff, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useToggleCategoryVisibility } from '@/hooks';
import type { Category } from '@/types/dashboard';
import { parseAPIError, getUserFriendlyErrorMessage } from '@/lib/apiError';
import { SingleImageUpload } from '@/components/common';

const CategoriesPage = () => {
  const { currentLocation } = useAuthStore();
  const locationId = currentLocation?.id || '';

  // React Query hooks
  const { data, isLoading, error } = useCategories(locationId);
  const createCategory = useCreateCategory(locationId);
  const updateCategory = useUpdateCategory(locationId);
  const deleteCategory = useDeleteCategory(locationId);
  const toggleVisibility = useToggleCategoryVisibility(locationId);

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [originalFormData, setOriginalFormData] = useState<typeof formData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    icon: 'ChefHat',
    isVisible: true
  });
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);

  // Helper function to check if form data has changed
  const hasChanges = (): boolean => {
    if (!editingCategory || !originalFormData) return true; // Always allow create
    
    return (
      formData.name.trim() !== originalFormData.name.trim() ||
      formData.description.trim() !== (originalFormData.description.trim() || '') ||
      formData.image !== originalFormData.image ||
      formData.icon !== originalFormData.icon ||
      formData.isVisible !== originalFormData.isVisible
    );
  };

  const categories = data?.categories || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentLocation) {
      setErrorMessage('Please select a location first');
      return;
    }

    if (!formData.name.trim()) {
      setErrorMessage('Category name is required');
      return;
    }

    if (!formData.image || formData.image.trim() === '') {
      setErrorMessage('Image is required');
      return;
    }

    setErrorMessage(null);

    if (editingCategory) {
      // Check if any changes were made
      if (!hasChanges()) {
        setErrorMessage('No changes detected. Please modify the category before saving.');
        return;
      }

      // Only send changed fields to API
      const changes: Partial<typeof formData & { image?: string | File }> = {};
      
      if (formData.name.trim() !== originalFormData!.name.trim()) {
        changes.name = formData.name.trim();
      }
      if (formData.description.trim() !== (originalFormData!.description.trim() || '')) {
        changes.description = formData.description.trim() || undefined;
      }
      if (formData.image !== originalFormData!.image) {
        // Send File object if new file was selected, otherwise send URL
        if (imageFile) {
          changes.image = imageFile as any;
        } else {
          changes.image = formData.image.trim();
        }
      }
      if (formData.icon !== originalFormData!.icon) {
        changes.icon = formData.icon || undefined;
      }
      if (formData.isVisible !== originalFormData!.isVisible) {
        changes.isVisible = formData.isVisible;
      }

      updateCategory.mutate(
        { id: editingCategory.id, data: changes },
        {
          onSuccess: () => {
            handleCloseModal();
          },
          onError: (error) => {
            console.error('Update category error:', error);
            const apiError = parseAPIError(error);
            setErrorMessage(getUserFriendlyErrorMessage(apiError));
          },
        }
      );
    } else {
      // Prepare data for API - ensure image is not empty
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        image: imageFile || formData.image.trim(), // Send File object if available, otherwise URL/base64
        icon: formData.icon || undefined,
        isVisible: formData.isVisible,
      };

      console.log('Creating category with data:', categoryData, 'locationId:', locationId);
      
      if (!locationId) {
        setErrorMessage('Location ID is missing. Please refresh the page.');
        return;
      }

      createCategory.mutate(categoryData, {
        onSuccess: (response) => {
          console.log('Category created successfully:', response);
          handleCloseModal();
        },
        onError: (error) => {
          console.error('Create category error:', error);
          const apiError = parseAPIError(error);
          setErrorMessage(getUserFriendlyErrorMessage(apiError));
        },
      });
    }
  };


  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    const imageData = category.image || '';
    const initialFormData = {
      name: category.name,
      description: category.description || '',
      image: imageData,
      icon: category.icon || 'ChefHat',
      isVisible: category.isVisible
    };
    setFormData(initialFormData);
    setOriginalFormData(initialFormData); // Store original for comparison
    setImageFile(undefined); // Clear any previously selected file
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    deleteCategory.mutate(id, {
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
    setEditingCategory(null);
    setOriginalFormData(null);
    setErrorMessage(null);
    setImageFile(undefined);
    setFormData({
      name: '',
      description: '',
      image: '',
      icon: 'ChefHat',
      isVisible: true
    });
  };

  const handleToggleVisibility = (category: Category) => {
    toggleVisibility.mutate(category.id, {
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
          <p className="text-gray-600">Loading categories...</p>
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
            <h3 className="text-lg font-semibold text-red-900 mb-1">Error Loading Categories</h3>
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
            <p className="text-yellow-800">Please select a location from the location selector to manage categories.</p>
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
          <h1 className="text-3xl font-bold text-dark-900 font-serif">Categories</h1>
          <p className="text-gray-600 mt-1">Manage your menu categories for {currentLocation.name}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-dark-900 mb-2">No categories yet</h3>
          <p className="text-gray-600 mb-6">Create your first category to organize your menu</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center space-x-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add First Category</span>
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all ${
                !category.isVisible ? 'opacity-60' : ''
              }`}
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Hide broken image and show placeholder
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : null}
                {(!category.image || !category.image.trim()) && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <div className="text-center">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">No image</p>
                    </div>
                  </div>
                )}
                {!category.isVisible && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                      Hidden
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-xl font-bold text-dark-900 mb-2 font-serif">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {category.description}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleToggleVisibility(category)}
                    disabled={toggleVisibility.isPending}
                    className={`p-2 rounded-lg transition-colors ${
                      category.isVisible
                        ? 'bg-green-50 text-green-600 hover:bg-green-100'
                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={category.isVisible ? 'Hide category' : 'Show category'}
                  >
                    {category.isVisible ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      title="Edit category"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(category.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
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
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  handleCloseModal();
                }
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold text-dark-900 mb-6 font-serif">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>

                {errorMessage && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{errorMessage}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      placeholder="e.g., Appetizers"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                      rows={3}
                      placeholder="Brief description of this category"
                    />
                  </div>

                  <SingleImageUpload
                    image={formData.image}
                    onChange={(value) => {
                      setFormData({ ...formData, image: value.preview });
                      setImageFile(value.file);
                    }}
                    maxSizeMB={10}
                    label="Category Image *"
                    error={errorMessage && !formData.image ? errorMessage : undefined}
                    required
                    aspectRatio="aspect-video"
                  />

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isVisible}
                        onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Visible in customer menu</span>
                    </label>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createCategory.isPending || updateCategory.isPending}
                      className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {(createCategory.isPending || updateCategory.isPending) && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      <span>{editingCategory ? 'Update' : 'Create'} Category</span>
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
              <h3 className="text-xl font-bold text-dark-900 mb-3">Delete Category?</h3>
              <p className="text-gray-600 mb-6">
                This will permanently delete this category. This action cannot be undone.
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
                  disabled={deleteCategory.isPending}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {deleteCategory.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
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

export default CategoriesPage;

