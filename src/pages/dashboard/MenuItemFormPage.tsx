import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Loader2, AlertCircle, X, Plus, 
  Clock, Flame,
  IndianRupee
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCategories } from '@/hooks';
import { useMenuItems, useCreateMenuItem, useUpdateMenuItem } from '@/hooks';
import { parseAPIError, getUserFriendlyErrorMessage } from '@/lib/apiError';
import { UnifiedImageUpload } from '@/components/common';

const MenuItemFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const { currentLocation } = useAuthStore();
  const locationId = currentLocation?.id || '';

  // React Query hooks
  const { data: categoriesData } = useCategories(locationId);
  const categories = categoriesData?.categories || [];

  const { data: menuItemsData } = useMenuItems(locationId);
  const menuItem = isEditMode ? menuItemsData?.menuItems.find(item => item.id === id) : null;

  const createMenuItem = useCreateMenuItem(locationId);
  const updateMenuItem = useUpdateMenuItem(locationId);

  // Form state
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    description: '',
    price: 0,
    image: '',
    images: [] as string[],
    video: '',
    ingredients: [] as string[],
    allergens: [] as string[],
    tags: [] as string[],
    nutritionalInfo: {
      calories: 0,
      protein: '',
      carbs: '',
      fat: '',
    },
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    spicyLevel: 0,
    availability: 'IN_STOCK' as 'IN_STOCK' | 'OUT_OF_STOCK' | 'HIDDEN',
    preparationTime: '',
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ingredientInput, setIngredientInput] = useState('');
  const [allergenInput, setAllergenInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [imageFiles, setImageFiles] = useState<(File | undefined)[]>([]);

  // Load existing data in edit mode
  useEffect(() => {
    if (isEditMode && menuItem) {
      // Normalize images: ensure main image is at index 0
      let imagesArray = menuItem.images || [];
      if (menuItem.image) {
        // If image exists, ensure it's at index 0
        imagesArray = imagesArray.filter(img => img !== menuItem.image);
        imagesArray.unshift(menuItem.image);
      }
      // Ensure max 3 images
      imagesArray = imagesArray.slice(0, 3);
      
      setImageFiles([]); // Clear any previously selected files
      setFormData({
        categoryId: menuItem.categoryId,
        name: menuItem.name,
        description: menuItem.description,
        price: Number(menuItem.price),
        image: imagesArray[0] || menuItem.image || '',
        images: imagesArray,
        video: menuItem.video || '',
        ingredients: menuItem.ingredients || [],
        allergens: menuItem.allergens || [],
        tags: menuItem.tags || [],
        nutritionalInfo: (menuItem.nutritionalInfo as typeof formData.nutritionalInfo) || {
          calories: 0,
          protein: '',
          carbs: '',
          fat: '',
        },
        isVegetarian: menuItem.isVegetarian || false,
        isVegan: menuItem.isVegan || false,
        isGlutenFree: menuItem.isGlutenFree || false,
        spicyLevel: 0,
        availability: menuItem.availability as 'IN_STOCK' | 'OUT_OF_STOCK' | 'HIDDEN',
        preparationTime: menuItem.preparationTime || '',
      });
    }
  }, [isEditMode, menuItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentLocation) {
      setErrorMessage('Please select a location first');
      return;
    }

    if (!formData.name.trim()) {
      setErrorMessage('Menu item name is required');
      return;
    }

    if (!formData.categoryId) {
      setErrorMessage('Please select a category');
      return;
    }

    if (formData.price <= 0) {
      setErrorMessage('Price must be greater than 0');
      return;
    }

    setErrorMessage(null);

    // Ensure main image is at index 0 and both image and images fields are set for backward compatibility
    const imagesArray = (formData.images || []).slice(0, 3); // Max 3 images
    const mainImage = imagesArray[0];
    
    // Prepare images: use File objects if available, otherwise use URLs/base64
    const imageFilesArray = imageFiles.slice(0, 3);
    const imagesForApi = imageFilesArray.map((file, index) => file || imagesArray[index]).filter(Boolean);
    
    const menuItemData = {
      categoryId: formData.categoryId,
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: formData.price,
      image: imageFilesArray[0] || mainImage || undefined, // Main image - File object if available, otherwise URL/base64, or undefined
      images: imagesForApi.length > 0 ? imagesForApi : undefined, // All images - File objects if available, otherwise URLs/base64, or undefined
      video: formData.video || undefined,
      ingredients: formData.ingredients,
      allergens: formData.allergens,
      tags: formData.tags,
      nutritionalInfo: formData.nutritionalInfo.calories > 0 ? formData.nutritionalInfo : undefined,
      isVegetarian: formData.isVegetarian,
      isVegan: formData.isVegan,
      isGlutenFree: formData.isGlutenFree,
      spicyLevel: formData.spicyLevel || undefined,
      availability: formData.availability,
      preparationTime: formData.preparationTime || undefined,
    };

    if (isEditMode) {
      updateMenuItem.mutate(
        { id: id!, data: menuItemData },
        {
          onSuccess: () => {
            navigate('/dashboard/menu-items');
          },
          onError: (error) => {
            console.error('Update menu item error:', error);
            const apiError = parseAPIError(error);
            setErrorMessage(getUserFriendlyErrorMessage(apiError));
          },
        }
      );
    } else {
      createMenuItem.mutate(menuItemData, {
        onSuccess: () => {
          navigate('/dashboard/menu-items');
        },
        onError: (error) => {
          console.error('Create menu item error:', error);
          const apiError = parseAPIError(error);
          setErrorMessage(getUserFriendlyErrorMessage(apiError));
        },
      });
    }
  };

  const addIngredient = () => {
    if (ingredientInput.trim() && !formData.ingredients.includes(ingredientInput.trim())) {
      setFormData({
        ...formData,
        ingredients: [...formData.ingredients, ingredientInput.trim()],
      });
      setIngredientInput('');
    }
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    });
  };

  const addAllergen = () => {
    if (allergenInput.trim() && !formData.allergens.includes(allergenInput.trim())) {
      setFormData({
        ...formData,
        allergens: [...formData.allergens, allergenInput.trim()],
      });
      setAllergenInput('');
    }
  };

  const removeAllergen = (index: number) => {
    setFormData({
      ...formData,
      allergens: formData.allergens.filter((_, i) => i !== index),
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index),
    });
  };

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
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/menu-items')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Menu Items</span>
        </button>
        <h1 className="text-3xl font-bold text-dark-900 font-serif">
          {isEditMode ? 'Edit Menu Item' : 'Add New Menu Item'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode ? 'Update menu item details' : 'Create a new menu item for your restaurant'}
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{errorMessage}</p>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Basic Information */}
        <div className="space-y-5">
          <h2 className="text-xl font-semibold text-dark-900 border-b pb-2">Basic Information</h2>
          
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="e.g., Wagyu Beef Tenderloin"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                required
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preparation Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.preparationTime}
                  onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="e.g., 25 mins"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
              rows={4}
              placeholder="Describe your dish..."
              required
            />
          </div>
        </div>

        {/* Images & Video */}
        <div className="space-y-5">
          <h2 className="text-xl font-semibold text-dark-900 border-b pb-2">Media</h2>
          
          <UnifiedImageUpload
            images={formData.images}
            onChange={(value) => {
              setFormData({ 
                ...formData, 
                images: value.previews,
                image: value.previews[0] || '' // Keep image field in sync with images[0]
              });
              setImageFiles(value.files || []);
            }}
            maxImages={3}
            maxSizeMB={10}
            label="Menu Item Images *"
            error={errorMessage && (!formData.images || formData.images.length === 0) ? errorMessage : undefined}
            required
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
        </div>

        {/* Ingredients & Allergens */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Ingredients</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addIngredient();
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="Add ingredient..."
              />
              <button
                type="button"
                onClick={addIngredient}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.ingredients.map((ingredient, index) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                >
                  <span>{ingredient}</span>
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Allergens</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={allergenInput}
                onChange={(e) => setAllergenInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAllergen();
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="Add allergen..."
              />
              <button
                type="button"
                onClick={addAllergen}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.allergens.map((allergen, index) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                >
                  <span>{allergen}</span>
                  <button
                    type="button"
                    onClick={() => removeAllergen(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Tags</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="Add tag (e.g., Chef Special, Premium)..."
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Nutritional Information */}
        <div className="space-y-5">
          <h2 className="text-xl font-semibold text-dark-900 border-b pb-2">Nutritional Information (Optional)</h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calories
              </label>
              <input
                type="number"
                value={formData.nutritionalInfo.calories}
                onChange={(e) => setFormData({
                  ...formData,
                  nutritionalInfo: { ...formData.nutritionalInfo, calories: parseInt(e.target.value) || 0 }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Protein
              </label>
              <input
                type="text"
                value={formData.nutritionalInfo.protein}
                onChange={(e) => setFormData({
                  ...formData,
                  nutritionalInfo: { ...formData.nutritionalInfo, protein: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="e.g., 52g"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Carbohydrates
              </label>
              <input
                type="text"
                value={formData.nutritionalInfo.carbs}
                onChange={(e) => setFormData({
                  ...formData,
                  nutritionalInfo: { ...formData.nutritionalInfo, carbs: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="e.g., 18g"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fat
              </label>
              <input
                type="text"
                value={formData.nutritionalInfo.fat}
                onChange={(e) => setFormData({
                  ...formData,
                  nutritionalInfo: { ...formData.nutritionalInfo, fat: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="e.g., 46g"
              />
            </div>
          </div>
        </div>

        {/* Dietary Options & Settings */}
        <div className="space-y-5">
          <h2 className="text-xl font-semibold text-dark-900 border-b pb-2">Dietary Options & Settings</h2>
          
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Dietary Options</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isVegetarian}
                    onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Vegetarian</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isVegan}
                    onChange={(e) => setFormData({ ...formData, isVegan: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Vegan</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isGlutenFree}
                    onChange={(e) => setFormData({ ...formData, isGlutenFree: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Gluten Free</span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spicy Level
              </label>
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-gray-400" />
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={formData.spicyLevel}
                  onChange={(e) => setFormData({ ...formData, spicyLevel: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm text-gray-700 w-8">{formData.spicyLevel}/5</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Availability
            </label>
            <select
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value as 'IN_STOCK' | 'OUT_OF_STOCK' | 'HIDDEN' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="IN_STOCK">In Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
              <option value="HIDDEN">Hidden</option>
            </select>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate('/dashboard/menu-items')}
            disabled={createMenuItem.isPending || updateMenuItem.isPending}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMenuItem.isPending || updateMenuItem.isPending}
            className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {(createMenuItem.isPending || updateMenuItem.isPending) && (
              <Loader2 className="w-5 h-5 animate-spin" />
            )}
            <span>{isEditMode ? 'Update' : 'Create'} Menu Item</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default MenuItemFormPage;

