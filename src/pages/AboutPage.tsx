import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, ChefHat, Heart, Award } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { publicService } from '../api';

const AboutPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['aboutPage', slug],
    queryFn: () => publicService.getAboutPage(slug || ''),
    enabled: !!slug,
  });

  if (!slug) {
    navigate('/');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading about page...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark-900 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find the about page for this restaurant.
          </p>
          <Link
            to={`/${slug}`}
            className="inline-flex items-center space-x-2 bg-brand-500 text-white px-6 py-3 rounded-lg hover:bg-brand-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Menu</span>
          </Link>
        </div>
      </div>
    );
  }

  const { business } = data;
  const aboutContent = business.aboutContent || business.description || 'Welcome to our restaurant!';
  const aboutImage = business.aboutImage || business.logo;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        {aboutImage ? (
          <div className="absolute inset-0">
            <img
              src={aboutImage}
              alt={business.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-brand-600" />
        )}
        
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 font-serif">
              About {business.name}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              {business.description || 'Discover our story and passion for culinary excellence'}
            </p>
          </motion.div>
        </div>

        {/* Back Button */}
        <Link
          to={`/${slug}`}
          className="absolute top-6 left-6 z-20 flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </Link>
      </section>

      {/* Content Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="prose prose-lg max-w-none"
          >
            <div
              className="text-gray-700 leading-relaxed whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: aboutContent }}
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-dark-900 mb-4 font-serif">
              Why Choose Us
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              What makes us special
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ChefHat,
                title: 'Master Chefs',
                description: 'Our team of experienced chefs brings decades of culinary expertise to every dish.',
              },
              {
                icon: Heart,
                title: 'Made with Love',
                description: 'Every dish is crafted with passion and attention to detail, using only the finest ingredients.',
              },
              {
                icon: Award,
                title: 'Award Winning',
                description: 'Recognized for excellence in culinary arts and exceptional dining experiences.',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow"
                >
                  <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-brand-600" />
                  </div>
                  <h3 className="text-xl font-bold text-dark-900 mb-3 font-serif">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-brand-500 to-brand-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-serif">
              Experience the Difference
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join us for an unforgettable dining experience. We look forward to serving you!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to={`/${slug}`}
                className="inline-flex items-center space-x-2 bg-white text-brand-600 px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <span>View Our Menu</span>
              </Link>
              <Link
                to={`/${slug}/contact`}
                className="inline-flex items-center space-x-2 border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-all duration-300"
              >
                <span>Contact Us</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

