import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Star, Clock, Flame, Leaf, AlertCircle, 
  ChevronLeft, ChevronRight, Play, Loader2
} from 'lucide-react';
import { usePublicMenuItem, usePublicCategoryItemsBySlug } from '../../hooks/usePublicMenu';

const MenuItemDetailPage = () => {
  const { slug, itemId } = useParams<{ slug: string; itemId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = usePublicMenuItem(itemId || '');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
  const restaurantLogo = item?.location?.business?.logo || null;

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

  // Build images array, filtering out undefined values
  const images = (item.images && item.images.length > 0) 
    ? item.images 
    : (item.image ? [item.image] : (restaurantLogo ? [restaurantLogo] : []));

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-gray-600 hover:text-dark-900 mb-4 group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="sticky top-20">
              {/* Main Image */}
              <div className="relative h-80 lg:h-[450px] rounded-xl overflow-hidden bg-dark-900 shadow-xl mb-3">
                {images.length > 0 ? (
                  <AnimatePresence mode="wait">
                    {!item.image && restaurantLogo && images[0] === restaurantLogo ? (
                      <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-full h-full bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex flex-col items-center justify-center p-8 lg:p-12"
                      >
                        {/* Restaurant Logo with Grayscale Filter */}
                        <div className="relative flex-1 w-full flex items-center justify-center mb-4">
                          <div className="relative">
                            <img 
                              src={images[currentImageIndex]}
                              alt="Restaurant Logo"
                              className="max-w-full max-h-[60%] object-contain drop-shadow-lg grayscale opacity-60 transition-opacity duration-300"
                              style={{ filter: 'grayscale(100%)' }}
                            />
                            {/* Subtle overlay for additional depth */}
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-400/20 to-transparent pointer-events-none"></div>
                          </div>
                        </div>
                        {/* Image Not Available Badge */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200/50">
                          <p className="text-sm text-gray-700 font-medium whitespace-nowrap">
                            Image not available
                          </p>
                        </div>
                      </motion.div>
                    ) : (
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
                    )}
                  </AnimatePresence>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 flex items-center justify-center">
                    <div className="text-center p-6">
                      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/80 backdrop-blur-sm mb-4 shadow-sm">
                        <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-600 font-medium text-lg">Image not available</p>
                    </div>
                  </div>
                )}

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
            <div className="flex flex-wrap gap-2 mb-3">
              {item.chefSpecial && (
                <span className="px-2.5 py-1 bg-brand-500 text-white text-xs font-semibold rounded-full flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>Chef's Special</span>
                </span>
              )}
              {item.isVegetarian && (
                <span className="px-2.5 py-1 bg-green-500 text-white text-xs font-semibold rounded-full flex items-center space-x-1">
                  <Leaf className="w-3.5 h-3.5" />
                  <span>Vegetarian</span>
                </span>
              )}
              {item.isVegan && (
                <span className="px-2.5 py-1 bg-green-600 text-white text-xs font-semibold rounded-full flex items-center space-x-1">
                  <Leaf className="w-3.5 h-3.5" />
                  <span>Vegan</span>
                </span>
              )}
              {item.isGlutenFree && (
                <span className="px-2.5 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                  Gluten Free
                </span>
              )}
              {item.spicyLevel && (
                <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center space-x-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Spicy Level {item.spicyLevel}</span>
                </span>
              )}
            </div>

            {/* Title and Price */}
            <h1 className="text-3xl md:text-4xl font-bold text-dark-900 mb-3 font-serif">
              {item.name}
            </h1>
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-3xl font-bold text-brand-600">₹{item.price}</span>
              {item.preparationTime && (
                <span className="flex items-center text-gray-600 text-sm">
                  <Clock className="w-4 h-4 mr-1.5" />
                  {item.preparationTime}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-base text-gray-700 leading-relaxed mb-5">
              {item.description}
            </p>

            {/* Ingredients */}
            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200 mb-4">
              <h3 className="text-lg font-bold text-dark-900 mb-3 font-serif">Ingredients</h3>
              <div className="flex flex-wrap gap-2">
                {item.ingredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>

            {/* Allergens */}
            {item.allergens && item.allergens.length > 0 && (
              <div className="bg-amber-50 rounded-xl p-4 sm:p-5 border border-amber-200 mb-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-base font-bold text-amber-900 mb-1.5">Allergen Information</h3>
                    <p className="text-sm text-amber-800">
                      This dish contains: <span className="font-semibold">{item.allergens.join(', ')}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Nutritional Information */}
            {item.nutritionalInfo && (
              <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-dark-900 mb-3 font-serif">Nutritional Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-brand-600 mb-1">
                      {item.nutritionalInfo.calories}
                    </div>
                    <div className="text-xs text-gray-600">Calories</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-brand-600 mb-1">
                      {item.nutritionalInfo.protein}
                    </div>
                    <div className="text-xs text-gray-600">Protein</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-brand-600 mb-1">
                      {item.nutritionalInfo.carbs}
                    </div>
                    <div className="text-xs text-gray-600">Carbs</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-brand-600 mb-1">
                      {item.nutritionalInfo.fat}
                    </div>
                    <div className="text-xs text-gray-600">Fat</div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

            {/* Related Items */}
        {relatedItems.length > 0 && (
          <div className="mt-10 sm:mt-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-dark-900 mb-5 sm:mb-6 font-serif">
              More from {category?.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedItems.map((relatedItem: any) => {
                const relatedItemImage = relatedItem.image || restaurantLogo;
                const isRelatedRestaurantLogo = !relatedItem.image && restaurantLogo;
                return (
                  <motion.div
                    key={relatedItem.id}
                    whileHover={{ y: -8 }}
                    onClick={() => navigate(`/${slug}/item/${relatedItem.id}`)}
                    className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <div className={`relative h-40 overflow-hidden ${isRelatedRestaurantLogo ? 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50' : ''}`}>
                      {relatedItemImage ? (
                        isRelatedRestaurantLogo ? (
                          <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                            {/* Restaurant Logo with Grayscale Filter */}
                            <div className="relative flex-1 w-full flex items-center justify-center">
                              <div className="relative">
                                <img
                                  src={relatedItemImage}
                                  alt="Restaurant Logo"
                                  className="max-w-full max-h-[70%] object-contain drop-shadow-sm grayscale opacity-60 transition-opacity duration-300"
                                  style={{ filter: 'grayscale(100%)' }}
                                />
                                {/* Subtle overlay for additional depth */}
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-400/20 to-transparent pointer-events-none"></div>
                              </div>
                            </div>
                            {/* Image Not Available Badge */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm border border-gray-200/50">
                              <p className="text-[9px] text-gray-600 font-medium whitespace-nowrap">
                                Image not available
                              </p>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={relatedItemImage}
                            alt={relatedItem.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        )
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 flex items-center justify-center">
                          <div className="text-center p-3">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm mb-2 shadow-sm">
                              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <p className="text-[10px] text-gray-600 font-medium">Image not available</p>
                          </div>
                        </div>
                      )}
                    </div>
                  <div className="p-4">
                    <h3 className="font-bold text-dark-900 mb-1 group-hover:text-brand-600 transition-colors">
                      {relatedItem.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {relatedItem.description}
                    </p>
                    <span className="text-lg font-bold text-brand-600">
                      ₹{Number(relatedItem.price).toFixed(2)}
                    </span>
                  </div>
                </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuItemDetailPage;

