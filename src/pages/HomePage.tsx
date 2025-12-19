import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Loader2 } from 'lucide-react';
import Footer from '../components/Footer';

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Try to navigate directly if it looks like a slug
      const slug = searchQuery.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (slug.length >= 3) {
        navigate(`/${slug}`);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl text-center"
        >
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-dark-900 mb-4 font-serif">
              MenuLogs.
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover amazing restaurant menus
            </p>
          </div>

          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter restaurant name or slug (e.g., downtown-pizza)"
                className="w-full px-6 py-4 pl-14 pr-32 text-lg border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
              <MapPin className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-500 text-white px-6 py-2 rounded-full font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Go</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-12">
            <p className="text-gray-500 mb-4">Or visit a restaurant directly:</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => navigate('/downtown-pizza')}
                className="px-6 py-3 bg-white border-2 border-gray-200 rounded-full font-medium hover:border-primary-500 hover:text-primary-600 transition-colors"
              >
                Downtown Pizza
              </button>
              <button
                onClick={() => navigate('/times-square-bistro')}
                className="px-6 py-3 bg-white border-2 border-gray-200 rounded-full font-medium hover:border-primary-500 hover:text-primary-600 transition-colors"
              >
                Times Square Bistro
              </button>
            </div>
          </div>

          <div className="mt-16 text-sm text-gray-400">
            <p>Restaurant owners: <a href="/login" className="text-primary-600 hover:underline">Login to manage your menu</a></p>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;

