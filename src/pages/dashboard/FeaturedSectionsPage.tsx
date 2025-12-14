import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, EyeOff, Image as ImageIcon, Loader2, AlertCircle, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useFeaturedSections, useCreateFeaturedSection, useUpdateFeaturedSection, useDeleteFeaturedSection, useToggleFeaturedSectionActive, useLocations } from '@/hooks';
import type { FeaturedSection } from '@/types/dashboard';
import { parseAPIError, getUserFriendlyErrorMessage } from '@/lib/apiError';
import { SingleImageUpload } from '@/components/common';

const FeaturedSectionsPage = () => {
  const { currentLocation } = useAuthStore();
  const locationId = currentLocation?.id || '';

  // React Query hooks
  const { data } = useFeaturedSections(locationId);
  const { data: locationsData } = useLocations();
  const createFeaturedSection = useCreateFeaturedSection(locationId);
  const updateFeaturedSection = useUpdateFeaturedSection(locationId);
  const deleteFeaturedSection = useDeleteFeaturedSection(locationId);
  const toggleActive = useToggleFeaturedSectionActive(locationId);

  const featuredSections = data?.featuredSections || [];
  const allLocations = locationsData?.locations || [];

  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState<FeaturedSection | null>(null);
  const [originalFormData, setOriginalFormData] = useState<typeof formData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    features: [{ title: '', description: '' }] as Array<{ title: string; description: string }>,
    buttonText: '',
    buttonLink: '',
    imagePosition: 'left' as 'left' | 'right',
    isActive: true,
    applyToAllLocations: false,
  });
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);

  // Helper function to check if form data has changed
  const hasChanges = (): boolean => {
    if (!editingSection || !originalFormData) return true;
    
    return (
      formData.title.trim() !== originalFormData.title.trim() ||
      formData.description.trim() !== (originalFormData.description.trim() || '') ||
      formData.image !== originalFormData.image ||
      JSON.stringify(formData.features) !== JSON.stringify(originalFormData.features) ||
      formData.buttonText !== (originalFormData.buttonText || '') ||
      formData.buttonLink !== (originalFormData.buttonLink || '') ||
      formData.imagePosition !== originalFormData.imagePosition ||
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
      setErrorMessage('Title is required');
      return;
    }

    if (!formData.image) {
      setErrorMessage('Image is required');
      return;
    }

    if (formData.features.length === 0 || formData.features.some(f => !f.title.trim() || !f.description.trim())) {
      setErrorMessage('All features must have both title and description');
      return;
    }

    setErrorMessage(null);

    if (editingSection) {
      if (!hasChanges()) {
        setErrorMessage('No changes detected. Please modify the section before saving.');
        return;
      }

      const changes: any = {};
      if (formData.title.trim() !== originalFormData!.title.trim()) changes.title = formData.title.trim();
      if (formData.description.trim() !== (originalFormData!.description.trim() || '')) changes.description = formData.description.trim() || undefined;
      if (formData.image !== originalFormData!.image) {
        changes.image = imageFile || formData.image;
      }
      if (JSON.stringify(formData.features) !== JSON.stringify(originalFormData!.features)) changes.features = formData.features;
      if (formData.buttonText !== (originalFormData!.buttonText || '')) changes.buttonText = formData.buttonText || undefined;
      if (formData.buttonLink !== (originalFormData!.buttonLink || '')) changes.buttonLink = formData.buttonLink || undefined;
      if (formData.imagePosition !== originalFormData!.imagePosition) changes.imagePosition = formData.imagePosition;
      if (formData.isActive !== originalFormData!.isActive) changes.isActive = formData.isActive;

      updateFeaturedSection.mutate(
        { id: editingSection.id, data: changes },
        {
          onSuccess: () => {
            handleCloseModal();
          },
          onError: (error) => {
            console.error('Update featured section error:', error);
            const apiError = parseAPIError(error);
            setErrorMessage(getUserFriendlyErrorMessage(apiError));
          },
        }
      );
    } else {
      const sectionData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        image: imageFile || formData.image,
        features: formData.features,
        buttonText: formData.buttonText.trim() || undefined,
        buttonLink: formData.buttonLink.trim() || undefined,
        imagePosition: formData.imagePosition,
        isActive: formData.isActive,
        applyToAllLocations: formData.applyToAllLocations,
      };

      createFeaturedSection.mutate(sectionData, {
        onSuccess: () => {
          handleCloseModal();
        },
        onError: (error) => {
          console.error('Create featured section error:', error);
          const apiError = parseAPIError(error);
          setErrorMessage(getUserFriendlyErrorMessage(apiError));
        },
      });
    }
  };

  const handleEdit = (section: FeaturedSection) => {
    setEditingSection(section);
    const initialFormData = {
      title: section.title,
      description: section.description || '',
      image: section.image,
      features: section.features.length > 0 ? section.features : [{ title: '', description: '' }],
      buttonText: section.buttonText || '',
      buttonLink: section.buttonLink || '',
      imagePosition: section.imagePosition,
      isActive: section.isActive,
      applyToAllLocations: false, // Not applicable for edit
    };
    setFormData(initialFormData);
    setOriginalFormData(initialFormData);
    setImageFile(undefined);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    deleteFeaturedSection.mutate(id, {
      onSuccess: () => {
        setDeleteConfirm(null);
      },
      onError: (error) => {
        const apiError = parseAPIError(error);
        alert(getUserFriendlyErrorMessage(apiError));
      },
    });
  };

  const handleToggleActive = (section: FeaturedSection) => {
    toggleActive.mutate(section.id, {
      onError: (error) => {
        const apiError = parseAPIError(error);
        alert(getUserFriendlyErrorMessage(apiError));
      },
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSection(null);
    setOriginalFormData(null);
    setFormData({
      title: '',
      description: '',
      image: '',
      features: [{ title: '', description: '' }],
      buttonText: '',
      buttonLink: '',
      imagePosition: 'left',
      isActive: true,
      applyToAllLocations: false,
    });
    setImageFile(undefined);
    setErrorMessage(null);
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, { title: '', description: '' }],
    });
  };

  const removeFeature = (index: number) => {
    if (formData.features.length > 1) {
      setFormData({
        ...formData,
        features: formData.features.filter((_, i) => i !== index),
      });
    }
  };

  const updateFeature = (index: number, field: 'title' | 'description', value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setFormData({ ...formData, features: newFeatures });
  };

  // Get locations that will be affected if applyToAllLocations is checked
  const affectedLocations = formData.applyToAllLocations && currentLocation?.businessId
    ? allLocations.filter(loc => loc.businessId === currentLocation.businessId)
    : [];

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 font-serif">Featured Sections</h1>
          <p className="text-gray-600 mt-1">Manage featured sections for your landing page</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={!currentLocation}
          className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <Plus className="w-5 h-5" />
          <span>Add Featured Section</span>
        </button>
      </div>

      {/* Featured Sections List */}
      {featuredSections.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-dark-900 mb-2">No featured sections yet</h3>
          <p className="text-gray-600 mb-6">Create your first featured section to showcase your restaurant</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center space-x-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add First Featured Section</span>
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {featuredSections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all ${
                !section.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex flex-col md:flex-row">
                {/* Section Preview */}
                <div className="relative w-full md:w-80 h-48 bg-gray-100">
                  <img
                    src={section.image}
                    alt={section.title}
                    className="w-full h-full object-cover"
                  />
                  {!section.isActive && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-semibold">
                        Inactive
                      </span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {section.imagePosition === 'left' ? 'Image Left' : 'Image Right'}
                    </span>
                  </div>
                </div>

                {/* Section Info */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-dark-900 mb-1">{section.title}</h3>
                      {section.description && (
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{section.description}</p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs text-gray-500">{section.features.length} feature(s)</span>
                        {section.buttonText && (
                          <span className="text-xs text-gray-500">• Button: {section.buttonText}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleActive(section)}
                        disabled={toggleActive.isPending}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          section.isActive
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {toggleActive.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : section.isActive ? (
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
                        onClick={() => handleEdit(section)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Edit featured section"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(section.id)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        title="Delete featured section"
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
              onClick={createFeaturedSection.isPending || updateFeaturedSection.isPending ? undefined : handleCloseModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold text-dark-900 mb-6 font-serif">
                  {editingSection ? 'Edit Featured Section' : 'Add New Featured Section'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      placeholder="e.g., Crafted by Master Chefs"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      placeholder="e.g., Our team of internationally acclaimed chefs..."
                      rows={3}
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
                    label="Section Image *"
                    error={errorMessage && !formData.image ? errorMessage : undefined}
                    required
                    aspectRatio="aspect-video"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image Position
                    </label>
                    <select
                      value={formData.imagePosition}
                      onChange={(e) => setFormData({ ...formData, imagePosition: e.target.value as 'left' | 'right' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    >
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>

                  {/* Features List */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Features *
                      </label>
                      <button
                        type="button"
                        onClick={addFeature}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Feature</span>
                      </button>
                    </div>
                    <div className="space-y-3">
                      {formData.features.map((feature, index) => (
                        <div key={index} className="flex gap-3 items-start">
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={feature.title}
                              onChange={(e) => updateFeature(index, 'title', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                              placeholder="Feature title"
                              required
                            />
                            <input
                              type="text"
                              value={feature.description}
                              onChange={(e) => updateFeature(index, 'description', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                              placeholder="Feature description"
                              required
                            />
                          </div>
                          {formData.features.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeFeature(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Button Text (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.buttonText}
                      onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      placeholder="e.g., Meet Our Chefs"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Button Link (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.buttonLink}
                      onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      placeholder="https://example.com/about"
                    />
                  </div>

                  {/* Apply to All Locations (only in create mode) */}
                  {!editingSection && (
                    <div>
                      <label className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.applyToAllLocations}
                          onChange={(e) => setFormData({ ...formData, applyToAllLocations: e.target.checked })}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-1"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-700">Apply to all locations</span>
                          <p className="text-xs text-gray-500 mt-1">
                            Create this featured section for all locations in your business
                          </p>
                          {formData.applyToAllLocations && affectedLocations.length > 0 && (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-xs font-medium text-blue-900 mb-1">
                                This will be created for {affectedLocations.length} location(s):
                              </p>
                              <ul className="text-xs text-blue-800 space-y-1">
                                {affectedLocations.map((loc) => (
                                  <li key={loc.id}>• {loc.name} ({loc.city})</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  )}

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
                      disabled={createFeaturedSection.isPending || updateFeaturedSection.isPending}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createFeaturedSection.isPending || updateFeaturedSection.isPending}
                      className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {(createFeaturedSection.isPending || updateFeaturedSection.isPending) && (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      )}
                      <span>{editingSection ? 'Update' : 'Create'} Featured Section</span>
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
              <h3 className="text-xl font-bold text-dark-900 mb-3">Delete Featured Section?</h3>
              <p className="text-gray-600 mb-6">
                This will permanently delete this featured section. This action cannot be undone.
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
                  disabled={deleteFeaturedSection.isPending}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {deleteFeaturedSection.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
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

export default FeaturedSectionsPage;

