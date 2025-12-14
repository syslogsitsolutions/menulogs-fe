import { Link, useNavigate, useParams } from 'react-router-dom';
import { Menu, X, ChefHat, LogIn, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { usePublicMenuBySlug } from '../hooks/usePublicMenu';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { data } = usePublicMenuBySlug(slug || '');
  
  const location = data?.location;
  const business = location?.business;
  const businessLogo = business?.logo;
  const businessName = business?.name || 'Luxe Dining';
  
  // Determine the home link - use slug if available, otherwise use root
  const homeLink = slug ? `/${slug}` : '/';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to={homeLink} className="flex items-center space-x-2 group">
            {businessLogo ? (
              <img 
                src={businessLogo} 
                alt={businessName} 
                className="h-10 w-10 rounded-lg object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="bg-gradient-to-br from-brand-500 to-brand-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-dark-900 font-serif">{businessName}</h1>
              {location?.name && (
                <p className="text-xs text-gray-500 -mt-1">{location.name}</p>
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to={homeLink} 
              className="text-dark-700 hover:text-brand-600 font-medium transition-colors duration-200"
            >
              Home
            </Link>
            <a 
              href="#categories" 
              className="text-dark-700 hover:text-brand-600 font-medium transition-colors duration-200"
            >
              Menu
            </a>
            <a 
              href="#about" 
              className="text-dark-700 hover:text-brand-600 font-medium transition-colors duration-200"
            >
              About
            </a>
            <a 
              href="#contact" 
              className="text-dark-700 hover:text-brand-600 font-medium transition-colors duration-200"
            >
              Contact
            </a>
            {isAuthenticated ? (
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-brand-500 to-brand-600 text-white px-6 py-2.5 rounded-full font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-brand-500 to-brand-600 text-white px-6 py-2.5 rounded-full font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-200 overflow-hidden"
            >
              <div className="py-4 space-y-3">
                <Link 
                  to={homeLink} 
                  className="block py-2 text-dark-700 hover:text-brand-600 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <a 
                  href="#categories" 
                  className="block py-2 text-dark-700 hover:text-brand-600 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Menu
                </a>
                <a 
                  href="#about" 
                  className="block py-2 text-dark-700 hover:text-brand-600 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  About
                </a>
                <a 
                  href="#contact" 
                  className="block py-2 text-dark-700 hover:text-brand-600 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Contact
                </a>
                {isAuthenticated ? (
                  <button 
                    onClick={() => { navigate('/dashboard'); setIsOpen(false); }}
                    className="w-full bg-gradient-to-r from-brand-500 to-brand-600 text-white px-6 py-2.5 rounded-full font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => { navigate('/login'); setIsOpen(false); }}
                    className="w-full bg-gradient-to-r from-brand-500 to-brand-600 text-white px-6 py-2.5 rounded-full font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Header;

