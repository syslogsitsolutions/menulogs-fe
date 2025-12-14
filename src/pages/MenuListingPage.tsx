import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowLeft, Leaf, Flame, Loader2, SlidersHorizontal } from 'lucide-react';
import MenuItemCard from '../components/MenuItemCard';
import { usePublicCategoryItemsBySlug, usePublicMenuBySlug } from '../hooks/usePublicMenu';
import type { MenuItem } from '../types/menu';

const MenuListingPage = () => {
  const { slug, categoryId } = useParams<{ slug: string; categoryId: string }>();
  const { data, isLoading, error } = usePublicCategoryItemsBySlug(slug || '', categoryId || '');
  const { data: menuData } = usePublicMenuBySlug(slug || '');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const category = data?.category;
  const categoryItems = category?.menuItems || [];
  const location = data?.location;
  const allCategories = menuData?.categories || [];

  const maxPrice = categoryItems.length > 0 ? Math.max(...categoryItems.map((item: any) => Number(item.price))) : 200;

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    return categoryItems.filter((item: any) => {
      // Search filter
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error || !category || !location) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Category not found</h1>
          <Link to={`/${slug}`} className="text-brand-600 hover:underline">
            Return to menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="relative h-48 md:h-56 bg-dark-900 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={category.image} 
            alt={category.name}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-900/90 to-dark-900/60"></div>
        </div>
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center py-6">
          <Link 
            to={`/${slug}`}
            className="inline-flex items-center text-white/80 hover:text-white mb-2 sm:mb-3 group w-fit text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Menu
          </Link>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2 font-serif"
          >
            {category.name}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-base text-gray-200 max-w-2xl line-clamp-2"
          >
            {category.description}
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Categories Navigation */}
        {allCategories.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              {/* <h2 className="text-lg sm:text-xl font-semibold text-dark-900">Browse Categories</h2> */}
              <Link 
                to={`/${slug}`}
                className="text-sm text-brand-600 hover:text-brand-700 font-medium hidden sm:inline-flex items-center gap-1"
              >
                View All
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 category-scroll">
              {allCategories.map((cat) => {
                const isActive = cat.id === categoryId;
                return (
                  <motion.div
                    key={cat.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to={`/${slug}/category/${cat.id}`}
                      className={`
                        relative flex flex-col items-center gap-1.5 min-w-[80px] sm:min-w-[90px] p-2.5 sm:p-3 rounded-lg transition-all cursor-pointer
                        ${isActive 
                          ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg' 
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-brand-300 hover:shadow-md'
                        }
                      `}
                    >
                      {/* Category Image */}
                      <div className={`
                        relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden
                        ${isActive ? 'ring-2 ring-white/50 shadow-lg bg-white' : 'ring-2 ring-gray-100'}
                      `}>
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className={`w-full h-full object-cover transition-all ${
                            isActive ? 'brightness-110 scale-105' : ''
                          }`}
                        />
                      </div>
                      
                      {/* Category Name */}
                      <div className="text-center">
                        <p className={`
                          text-[11px] sm:text-xs font-semibold line-clamp-1
                          ${isActive ? 'text-white' : 'text-gray-900'}
                        `}>
                          {cat.name}
                        </p>
                        {(cat as any).menuItems && (cat as any).menuItems.length > 0 && (
                          <p className={`
                            text-[9px] sm:text-[10px] mt-0.5
                            ${isActive ? 'text-white/80' : 'text-gray-500'}
                          `}>
                            {/* {(cat as any).menuItems.length} */}
                          </p>
                        )}
                      </div>

                      {/* Active Indicator */}
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-1.5 right-1.5 w-2 h-2 bg-white rounded-full shadow-md"
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Search Bar with Filter Icon */}
        <div className="mb-4 sticky top-20 z-40 bg-gray-50 py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 sm:py-3 rounded-full border border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all text-sm sm:text-base"
              />
            </div>
            
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 sm:py-3 rounded-full border transition-all flex items-center justify-center space-x-2 whitespace-nowrap ${
                showFilters || selectedFilters.length > 0 || priceRange[0] > 0 || priceRange[1] < maxPrice || searchQuery
                  ? 'bg-brand-500 text-white border-brand-500 shadow-md'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="font-medium hidden sm:inline">Filters</span>
              {(selectedFilters.length > 0 || priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                <span className="bg-white text-brand-600 text-xs px-2 py-0.5 rounded-full font-semibold">
                  {selectedFilters.length + (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Filters Panel - Expandable */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-3 lg:gap-4 pb-2">
                  {/* Dietary Filters - Inline */}
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { id: 'vegetarian', label: 'Vegetarian', icon: Leaf },
                      { id: 'vegan', label: 'Vegan', icon: Leaf },
                      { id: 'gluten-free', label: 'Gluten Free', icon: null },
                      { id: 'spicy', label: 'Spicy', icon: Flame }
                    ].map(filter => {
                      const Icon = filter.icon;
                      return (
                        <button
                          key={filter.id}
                          onClick={() => toggleFilter(filter.id)}
                          className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                            selectedFilters.includes(filter.id)
                              ? 'bg-brand-500 text-white shadow-md'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          }`}
                        >
                          {Icon && <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                          <span className="hidden sm:inline">{filter.label}</span>
                          <span className="sm:hidden">{filter.label.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Price Range - Compact */}
                  <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-2 rounded-full border border-gray-300">
                    <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                      ${priceRange[0]} - ${priceRange[1]}
                    </span>
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-20 sm:w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
                    />
                  </div>

                  {/* Clear Filters Button - Only show when filters are active */}
                  {(selectedFilters.length > 0 || priceRange[0] > 0 || priceRange[1] < maxPrice || searchQuery) && (
                    <button
                      onClick={clearFilters}
                      className="px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-300 hover:bg-gray-50 transition-colors flex items-center space-x-1.5 whitespace-nowrap"
                    >
                      <X className="w-4 h-4" />
                      <span className="hidden sm:inline">Clear</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-dark-900">{filteredItems.length}</span> of {categoryItems.length} items
          </p>
          {(searchQuery || selectedFilters.length > 0 || priceRange[0] > 0 || priceRange[1] < maxPrice) && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-dark-900 flex items-center space-x-1"
            >
              <X className="w-4 h-4" />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
          >
            {filteredItems.map((item: MenuItem, index: number) => (
              <MenuItemCard key={item.id} item={item} index={index} slug={slug} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-2xl font-semibold text-dark-900 mb-2">No items found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
            <button
              onClick={clearFilters}
              className="bg-brand-500 text-white px-6 py-3 rounded-full hover:bg-brand-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuListingPage;

