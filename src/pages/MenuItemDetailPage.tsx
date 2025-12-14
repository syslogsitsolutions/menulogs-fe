import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Star, Clock, Flame, Leaf, AlertCircle, 
  ChevronLeft, ChevronRight, Play, ShoppingCart, Heart, Loader2
} from 'lucide-react';
import { usePublicMenuItem, usePublicCategoryItemsBySlug } from '../hooks/usePublicMenu';

const MenuItemDetailPage = () => {
  const { slug, itemId } = useParams<{ slug: string; itemId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = usePublicMenuItem(itemId || '');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Extract item data (hooks must be called before any conditional returns)
  const item = data?.menuItem;
  const category = item?.category;
  const categoryId = category?.id;

  // Fetch category items for related items (must be called before conditional returns)
  const { data: categoryData } = usePublicCategoryItemsBySlug(
    slug || '',
    categoryId || ''
  );

  // Calculate related items
  const relatedItems = categoryData?.category?.menuItems?.filter(
    (i: any) => i.id !== itemId
  ).slice(0, 4) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading item...</p>
        </div>
      </div>
    );
  }

  const location = item?.location;

  if (error || !item || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Item not found</h1>
          <Link to={`/${slug}`} className="text-brand-600 hover:underline">
            Return to menu
          </Link>
        </div>
      </div>
    );
  }

  const images = item.images || [item.image];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to={`/${slug}`} className="text-gray-500 hover:text-brand-600 transition-colors">
              {location?.name || 'Home'}
            </Link>
            <span className="text-gray-400">/</span>
            <Link 
              to={`/${slug}/category/${category.id}`}
              className="text-gray-500 hover:text-brand-600 transition-colors"
            >
              {category.name}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-dark-900 font-medium">{item.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-gray-600 hover:text-dark-900 mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="sticky top-24">
              {/* Main Image */}
              <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden bg-dark-900 shadow-2xl mb-4">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={images[currentImageIndex]}
                    alt={`${item.name} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all hover:scale-110"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all hover:scale-110"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Video Badge */}
                {item.video && (
                  <div className="absolute top-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
                    <Play className="w-4 h-4" />
                    <span>Video Available</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? 'border-brand-500 scale-105'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Item Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {item.chefSpecial && (
                <span className="px-3 py-1 bg-brand-500 text-white text-sm font-semibold rounded-full flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-current" />
                  <span>Chef's Special</span>
                </span>
              )}
              {item.isVegetarian && (
                <span className="px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full flex items-center space-x-1">
                  <Leaf className="w-4 h-4" />
                  <span>Vegetarian</span>
                </span>
              )}
              {item.isVegan && (
                <span className="px-3 py-1 bg-green-600 text-white text-sm font-semibold rounded-full flex items-center space-x-1">
                  <Leaf className="w-4 h-4" />
                  <span>Vegan</span>
                </span>
              )}
              {item.isGlutenFree && (
                <span className="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">
                  Gluten Free
                </span>
              )}
              {item.spicyLevel && (
                <span className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full flex items-center space-x-1">
                  <Flame className="w-4 h-4" />
                  <span>Spicy Level {item.spicyLevel}</span>
                </span>
              )}
            </div>

            {/* Title and Price */}
            <h1 className="text-4xl md:text-5xl font-bold text-dark-900 mb-4 font-serif">
              {item.name}
            </h1>
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-4xl font-bold text-brand-600">${item.price}</span>
              {item.preparationTime && (
                <span className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-2" />
                  {item.preparationTime}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {item.description}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <button className="flex-1 bg-gradient-to-r from-brand-500 to-brand-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2">
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Order</span>
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`px-6 py-4 rounded-full border-2 transition-all duration-300 hover:scale-105 ${
                  isFavorite
                    ? 'bg-red-50 border-red-500 text-red-500'
                    : 'bg-white border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'
                }`}
              >
                <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Ingredients */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
              <h3 className="text-xl font-bold text-dark-900 mb-4 font-serif">Ingredients</h3>
              <div className="flex flex-wrap gap-2">
                {item.ingredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>

            {/* Allergens */}
            {item.allergens && item.allergens.length > 0 && (
              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-bold text-amber-900 mb-2">Allergen Information</h3>
                    <p className="text-amber-800">
                      This dish contains: <span className="font-semibold">{item.allergens.join(', ')}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Nutritional Information */}
            {item.nutritionalInfo && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-dark-900 mb-4 font-serif">Nutritional Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-brand-600 mb-1">
                      {item.nutritionalInfo.calories}
                    </div>
                    <div className="text-sm text-gray-600">Calories</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-brand-600 mb-1">
                      {item.nutritionalInfo.protein}
                    </div>
                    <div className="text-sm text-gray-600">Protein</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-brand-600 mb-1">
                      {item.nutritionalInfo.carbs}
                    </div>
                    <div className="text-sm text-gray-600">Carbs</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-brand-600 mb-1">
                      {item.nutritionalInfo.fat}
                    </div>
                    <div className="text-sm text-gray-600">Fat</div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Related Items */}
        {relatedItems.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-dark-900 mb-8 font-serif">
              More from {category?.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedItems.map((relatedItem: any) => (
                <motion.div
                  key={relatedItem.id}
                  whileHover={{ y: -8 }}
                  onClick={() => navigate(`/${slug}/item/${relatedItem.id}`)}
                  className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={relatedItem.image}
                      alt={relatedItem.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-dark-900 mb-1 group-hover:text-brand-600 transition-colors">
                      {relatedItem.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {relatedItem.description}
                    </p>
                    <span className="text-lg font-bold text-brand-600">
                      ${Number(relatedItem.price).toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuItemDetailPage;

