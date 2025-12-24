import { motion } from 'framer-motion';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import HeroCarousel from '../components/HeroCarousel';
import CategoryGrid from '../components/CategoryGrid';
import FeaturedSectionCarousel from '../components/FeaturedSectionCarousel';
import { usePublicMenuBySlug } from '../hooks/usePublicMenu';
import type { MenuItem } from '../types/menu';

const LandingPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = usePublicMenuBySlug(slug || '');
  
  // Redirect to home if no slug
  useEffect(() => {
    if (!slug) {
      navigate('/');
    }
  }, [slug, navigate]);
  
  if (!slug) {
    return null;
  }

  // Loading state
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

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark-900 mb-2">Restaurant Not Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find a restaurant with the name "{slug}". Please check the URL and try again.
          </p>
          <a 
            href="/"
            className="inline-flex items-center space-x-2 bg-brand-500 text-white px-6 py-3 rounded-lg hover:bg-brand-600 transition-colors"
          >
            <span>Go Home</span>
          </a>
        </div>
      </div>
    );
  }

  const { location, categories, banners, featuredSections } = data;

  return (
    <div className="min-h-screen">
      {/* Business CTA Banner */}
      {/* <div className="bg-gradient-to-r from-primary-500 to-primary-600 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <p className="text-white text-sm md:text-base">
            <span className="font-semibold">Restaurant Owner?</span> Transform your menu with MenuLogs
          </p>
          <Link 
            to="/business"
            className="inline-flex items-center space-x-2 bg-white text-primary-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-50 transition-all duration-300 hover:scale-105"
          >
            <span>Learn More</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div> */}

      {/* Hero Carousel */}
      {banners && banners.length > 0 && <HeroCarousel banners={banners} />}

      {/* Welcome Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-dark-900 mb-6 font-serif">
              Welcome to {location.name}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              {location.business?.description || 'Experience fine dining at its best with our carefully crafted menu featuring the finest ingredients and exceptional service.'}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {categories && categories.length > 0 ? (
                <Link 
                  to={`/${slug}/category/${categories[0].id}`}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-brand-500 to-brand-600 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <span>Explore Our Menu</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <a 
                  href="#categories" 
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-brand-500 to-brand-600 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <span>Explore Our Menu</span>
                  <ArrowRight className="w-5 h-5" />
                </a>
              )}
              <button className="inline-flex items-center space-x-2 border-2 border-dark-900 text-dark-900 px-8 py-3 rounded-full font-medium hover:bg-dark-900 hover:text-white transition-all duration-300">
                <span>Book a Table</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-br from-brand-500 to-brand-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: `${categories.reduce((acc, cat) => acc + ((cat as { menuItems?: MenuItem[] }).menuItems?.length || 0), 0)}+`, label: 'Menu Items' },
              { number: `${categories.length}+`, label: 'Categories' },
              // { number: location.city, label: 'Location' },
              // { number: location. || 0, label: 'Outlets' },
              { number: '5★', label: 'Quality Service' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold mb-2 font-serif">{stat.number}</div>
                <div className="text-brand-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-dark-900 mb-3 font-serif">
              Our Menu Categories
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Discover our carefully curated selection of dishes, each category offering 
              a unique journey through flavors and culinary traditions.
            </p>
          </motion.div>

          <CategoryGrid categories={categories} slug={slug || ''} />
        </div>
      </section>

      {/* Featured Section */}
      {featuredSections && featuredSections.length > 0 && (
        <FeaturedSectionCarousel sections={featuredSections} />
      )}
    </div>
  );
};

export default LandingPage;

