import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowLeft, Leaf, Flame, Loader2, SlidersHorizontal, Grid3x3, List, Star } from 'lucide-react';
import MenuItemCard from '../components/MenuItemCard';
import { usePublicCategoryItemsBySlug, usePublicMenuBySlug } from '../hooks/usePublicMenu';
import type { MenuItem } from '../types/menu';

// List View Component for Menu Items
const MenuItemListItem = ({ item, index, slug }: { item: MenuItem; index: number; slug?: string }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (slug) {
      navigate(`/${slug}/item/${item.id}`);
    } else {
      navigate(`/item/${item.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      onClick={handleClick}
      className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-200 hover:border-brand-300 transition-all duration-200"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image Container */}
        <div className="relative w-full sm:w-32 md:w-40 h-40 sm:h-32 md:h-36 flex-shrink-0 overflow-hidden">
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {item.chefSpecial && (
              <span className="px-2 py-0.5 bg-brand-500 text-white text-[10px] font-semibold rounded-full flex items-center">
                <Star className="w-2.5 h-2.5 fill-current mr-0.5" />
              </span>
            )}
            {item.isVegetarian && (
              <span className="px-2 py-0.5 bg-green-500 text-white text-[10px] font-semibold rounded-full">
                <Leaf className="w-2.5 h-2.5" />
              </span>
            )}
            {item.isVegan && (
              <span className="px-2 py-0.5 bg-green-600 text-white text-[10px] font-semibold rounded-full">
                <Leaf className="w-2.5 h-2.5" />
              </span>
            )}
            {item.spicyLevel && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-semibold rounded-full">
                <Flame className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-base sm:text-lg font-bold text-dark-900 group-hover:text-brand-600 transition-colors font-serif line-clamp-1 flex-1">
                {item.name}
              </h3>
              <div className="bg-white px-3 py-1 rounded-lg shadow-sm flex-shrink-0">
                <span className="text-base sm:text-lg font-bold text-brand-600">${item.price}</span>
              </div>
            </div>
            
            {item.description && (
              <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2 leading-relaxed">
                {item.description}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
              {item.preparationTime && (
                <span className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-1 mb-2">
                <span className="font-medium">Contains:</span> {item.allergens.join(', ')}
              </p>
            )}
          </div>

          {/* View Details Link */}
          <div className="flex items-center text-brand-600 font-medium text-xs sm:text-sm group-hover:text-brand-700 transition-colors mt-2 pt-2 border-t border-gray-100">
            <span>View Details</span>
            <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MenuListingPage = () => {
  const { slug, categoryId } = useParams<{ slug: string; categoryId: string }>();
  const { data, isLoading, error } = usePublicCategoryItemsBySlug(slug || '', categoryId || '');
  const { data: menuData } = usePublicMenuBySlug(slug || '');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const category = data?.category;
  const categoryItems = useMemo(() => category?.menuItems || [], [category?.menuItems]);
  const location = data?.location;
  const allCategories = menuData?.categories || [];

  const maxPrice = useMemo(() => {
    if (categoryItems.length > 0) {
      return Math.max(...categoryItems.map((item: MenuItem) => Number(item.price)));
    }
    return 200;
  }, [categoryItems]);

  // Initialize price range - defaults to maxPrice when available
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  
  // Update price range when maxPrice changes (only if still at default)
  if (priceRange[1] === 200 && maxPrice !== 200 && maxPrice > 0) {
    // This is safe as it only updates from default to actual value once
    setPriceRange([0, maxPrice]);
  }

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    return categoryItems.filter((item: MenuItem) => {
      // Search filter
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Price filter
      const itemPrice = Number(item.price);
      const matchesPrice = itemPrice >= priceRange[0] && itemPrice <= priceRange[1];
      
      // Dietary filters
      let matchesDietary = true;
      if (selectedFilters.length > 0) {
        if (selectedFilters.includes('vegetarian') && !item.isVegetarian) matchesDietary = false;
        if (selectedFilters.includes('vegan') && !item.isVegan) matchesDietary = false;
        if (selectedFilters.includes('gluten-free') && !item.isGlutenFree) matchesDietary = false;
        if (selectedFilters.includes('spicy') && !item.spicyLevel) matchesDietary = false;
      }
      
      return matchesSearch && matchesPrice && matchesDietary;
    });
  }, [categoryItems, searchQuery, priceRange, selectedFilters]);

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPriceRange([0, maxPrice]);
    setSelectedFilters([]);
  };

  const activeFilterCount = selectedFilters.length + (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error || !category || !location) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-dark-900">Category not found</h1>
          <Link to={`/${slug}`} className="text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Return to menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Modern Header Section */}
      <div className="bg-white border-b border-gray-200/60 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link 
              to={`/${slug}`}
              className="inline-flex items-center text-gray-600 hover:text-dark-900 group transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm sm:text-base">Back to Menu</span>
            </Link>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-label="Grid view"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        {/* Categories Navigation - Enhanced */}
        {allCategories.length > 0 && (
          <div className="mb-4 sm:mb-5">
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide scroll-smooth">
              {allCategories.map((cat) => {
                const isActive = cat.id === categoryId;
                return (
                  <motion.div
                    key={cat.id}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <Link
                      to={`/${slug}/category/${cat.id}`}
                      className={`
                        relative flex flex-col items-center gap-1.5 sm:gap-2 min-w-[80px] sm:min-w-[90px] p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-200 cursor-pointer group
                        ${isActive 
                          ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/15' 
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-brand-300 hover:shadow-md'
                        }
                      `}
                    >
                      {/* Category Image */}
                      <div className={`
                        relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden transition-all duration-200
                        ${isActive ? 'ring-2 ring-white/50 shadow-lg bg-white' : 'ring-1 ring-gray-100 group-hover:ring-brand-200 bg-white'}
                      `}>
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover transition-transform duration-200"
                          style={{ display: 'block' }}
                        />
                      </div>
                      
                      {/* Category Name */}
                      <div className="text-center w-full">
                        <p className={`
                          text-xs sm:text-sm font-semibold line-clamp-1 transition-colors
                          ${isActive ? 'text-white' : 'text-gray-900 group-hover:text-brand-600'}
                        `}>
                          {cat.name}
                        </p>
                      </div>

                      {/* Active Indicator */}
                      {isActive && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center">
                          <div className="w-2.5 h-2.5 bg-brand-500 rounded-full" />
                        </div>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Enhanced Search and Filter Section */}
        <div className="mb-4 sm:mb-5">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200/60 p-3 sm:p-4">
            <div className="flex flex-row items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              {/* Search Bar - Enhanced */}
              <div className="flex-1 relative min-w-0">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3.5 rounded-xl border border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200/50 outline-none transition-all text-sm sm:text-base bg-gray-50 focus:bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-200 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                  </button>
                )}
              </div>
              
              {/* Filter Toggle Button - Enhanced */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-xl border-2 transition-all flex items-center justify-center space-x-1.5 sm:space-x-2 whitespace-nowrap font-medium flex-shrink-0 ${
                  showFilters || activeFilterCount > 0
                    ? 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/20 hover:bg-brand-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-brand-300 hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="bg-white/20 text-white text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Enhanced Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 sm:pt-4 border-t border-gray-200">
                    <div className="space-y-3">
                      {/* Dietary Filters Section */}
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                          Dietary Preferences
                        </label>
                        <div className="flex flex-wrap items-center gap-2">
                          {[
                            { id: 'vegetarian', label: 'Vegetarian', icon: Leaf, color: 'green' },
                            { id: 'vegan', label: 'Vegan', icon: Leaf, color: 'emerald' },
                            { id: 'gluten-free', label: 'Gluten Free', icon: null, color: 'amber' },
                            { id: 'spicy', label: 'Spicy', icon: Flame, color: 'red' }
                          ].map(filter => {
                            const Icon = filter.icon;
                            const isActive = selectedFilters.includes(filter.id);
                            return (
                              <motion.button
                                key={filter.id}
                                onClick={() => toggleFilter(filter.id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 whitespace-nowrap ${
                                  isActive
                                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                                }`}
                              >
                                {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-600'}`} />}
                                <span>{filter.label}</span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Price Range Section */}
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                          Price Range
                        </label>
                        <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700">
                              ${priceRange[0].toFixed(0)}
                            </span>
                            <span className="text-lg font-bold text-brand-600">
                              ${priceRange[1].toFixed(0)}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max={maxPrice}
                            step="1"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>$0</span>
                            <span>${maxPrice}</span>
                          </div>
                        </div>
                      </div>

                      {/* Clear Filters Button */}
                      {activeFilterCount > 0 && (
                        <div className="flex justify-end pt-2">
                          <button
                            onClick={clearFilters}
                            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center space-x-2"
                          >
                            <X className="w-4 h-4" />
                            <span>Clear All Filters</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Results Count - Enhanced */}
        <div className="mb-4 sm:mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <p className="text-sm sm:text-base text-gray-600">
              Showing <span className="font-bold text-dark-900">{filteredItems.length}</span> of{' '}
              <span className="font-semibold text-gray-700">{categoryItems.length}</span> items
            </p>
            {filteredItems.length !== categoryItems.length && (
              <span className="px-2.5 py-1 bg-brand-100 text-brand-700 text-xs font-semibold rounded-full">
                Filtered
              </span>
            )}
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-dark-900 flex items-center space-x-1.5 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        {/* Menu Items Grid/List - Enhanced */}
        {filteredItems.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 gap-3 sm:gap-4 md:gap-5'
                : 'space-y-3 sm:space-y-4'
            }
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item: MenuItem, index: number) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                >
                  {viewMode === 'grid' ? (
                    <MenuItemCard item={item} index={index} slug={slug} />
                  ) : (
                    <MenuItemListItem item={item} index={index} slug={slug} />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-6">
              <div className="text-5xl">🍽️</div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-dark-900 mb-3 font-serif">
              No items found
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchQuery || activeFilterCount > 0
                ? "Try adjusting your filters or search query to find what you're looking for."
                : "This category doesn't have any items yet."}
            </p>
            {(searchQuery || activeFilterCount > 0) && (
              <button
                onClick={clearFilters}
                className="bg-brand-500 text-white px-8 py-3.5 rounded-xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 hover:shadow-xl font-semibold"
              >
                Clear All Filters
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MenuListingPage;

