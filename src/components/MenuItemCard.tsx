import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, Leaf, Flame } from 'lucide-react';
import type { MenuItem } from '../types/menu';

interface MenuItemCardProps {
  item: MenuItem;
  index: number;
  slug?: string;
  restaurantLogo?: string | null;
}

const MenuItemCard = ({ item, index, slug, restaurantLogo }: MenuItemCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (slug) {
      navigate(`/${slug}/item/${item.id}`);
    } else {
      navigate(`/item/${item.id}`);
    }
  };

  // Determine which image to display
  const displayImage = item.image || restaurantLogo;
  const isRestaurantLogo = !item.image && restaurantLogo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      onClick={handleClick}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300"
    >
      {/* Image Container */}
      <div className={`relative h-40 sm:h-48 md:h-56 overflow-hidden ${isRestaurantLogo ? 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50' : ''}`}>
        {displayImage ? (
          <>
            {isRestaurantLogo ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center p-6 sm:p-8">
                {/* Restaurant Logo with Grayscale Filter */}
                <div className="relative flex-1 w-full flex items-center justify-center mb-2">
                  <div className="relative">
                    <img 
                      src={displayImage} 
                      alt="Restaurant Logo"
                      className="max-w-full max-h-[60%] object-contain drop-shadow-sm grayscale opacity-60 transition-opacity duration-300"
                      style={{ filter: 'grayscale(100%)' }}
                    />
                    {/* Subtle overlay for additional depth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-400/20 to-transparent pointer-events-none"></div>
                  </div>
                </div>
                {/* Image Not Available Badge */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md border border-gray-200/50">
                  <p className="text-[10px] sm:text-xs text-gray-600 font-medium whitespace-nowrap">
                    Image not available
                  </p>
                </div>
              </div>
            ) : (
              <>
                <img 
                  src={displayImage} 
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/80 backdrop-blur-sm mb-3 shadow-sm">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Image not available</p>
            </div>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {item.chefSpecial && (
            <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-brand-500 text-white text-[10px] sm:text-xs font-semibold rounded-full flex items-center space-x-1">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
              <span className="hidden sm:inline">Chef's Special</span>
              <span className="sm:hidden">Chef</span>
            </span>
          )}
          {item.isVegetarian && (
            <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-green-500 text-white text-[10px] sm:text-xs font-semibold rounded-full flex items-center space-x-1">
              <Leaf className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Vegetarian</span>
            </span>
          )}
          {item.isVegan && (
            <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-green-600 text-white text-[10px] sm:text-xs font-semibold rounded-full flex items-center space-x-1">
              <Leaf className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Vegan</span>
            </span>
          )}
          {item.spicyLevel && (
            <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-red-500 text-white text-[10px] sm:text-xs font-semibold rounded-full flex items-center space-x-1">
              <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Spicy</span>
            </span>
          )}
        </div>

        {/* Price Tag */}
        <div className="absolute bottom-2 right-2 bg-white px-2.5 py-1 sm:px-4 sm:py-2 rounded-full shadow-lg">
          <span className="text-sm sm:text-lg font-bold text-brand-600">₹{item.price}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 md:p-5">
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-dark-900 mb-1 sm:mb-2 font-serif group-hover:text-brand-600 transition-colors line-clamp-1">
          {item.name}
        </h3>
        {/* <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2 sm:mb-4 leading-relaxed">
          {item.description}
        </p> */}

        {/* Meta Information */}
        <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500">
          {item.preparationTime && (
            <span className="flex items-center">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {item.preparationTime}
            </span>
          )}
          {item.nutritionalInfo && (
            <span>{item.nutritionalInfo.calories} cal</span>
          )}
        </div>

        {/* Allergen Warning */}
        {item.allergens && item.allergens.length > 0 && (
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
            <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-1">
              <span className="font-medium">Contains:</span> {item.allergens.join(', ')}
            </p>
          </div>
        )}

        {/* Hover Action */}
        <div className="mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-gray-100">
          <div className="flex items-center text-brand-600 font-medium text-xs sm:text-sm group-hover:text-brand-700 transition-colors">
            <span>View Details</span>
            <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MenuItemCard;

