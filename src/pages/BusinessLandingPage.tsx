import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle, 
  Smartphone, 
  Zap, 
  Globe, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Menu, 
  QrCode,
  PieChart,
  Shield,
  Clock,
  Star,
  ChefHat
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const BusinessLandingPage = () => {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo-full-black.png" alt="MenuLogs" className="h-8 object-cover" />
            </Link>
            <div className="flex items-center space-x-6">
              <Link to="#features" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Features
              </Link>
              <Link to="#pricing" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Pricing
              </Link>
              <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Login
              </Link>
              <Link 
                to="/signup" 
                className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2.5 rounded-full font-medium hover:shadow-lg transition-all duration-300"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div 
                variants={fadeInUp}
                className="inline-block mb-4"
              >
                <span className="bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold">
                  🚀 The Future of Restaurant Menus
                </span>
              </motion.div>
              
              <motion.h1 
                variants={fadeInUp}
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-dark-900 mb-6 font-serif leading-tight"
              >
                Transform Your Restaurant's Digital Presence
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className="text-xl text-gray-600 mb-8 leading-relaxed"
              >
                MenuLogs empowers restaurants to create stunning digital menus, manage multiple locations, 
                and delight customers with seamless dining experiences.
              </motion.p>
              
              <motion.div 
                variants={fadeInUp}
                className="flex flex-wrap gap-4"
              >
                <Link 
                  to="/signup" 
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-full font-medium text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a 
                  href="#demo" 
                  className="inline-flex items-center space-x-2 border-2 border-dark-900 text-dark-900 px-8 py-4 rounded-full font-medium text-lg hover:bg-dark-900 hover:text-white transition-all duration-300"
                >
                  <span>Watch Demo</span>
                </a>
              </motion.div>

              <motion.div 
                variants={fadeInUp}
                className="mt-8 flex items-center space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">14-day free trial</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Image/Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl shadow-2xl p-8 overflow-hidden">
                {/* Mock Dashboard Preview */}
                <div className="bg-white rounded-2xl shadow-xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-primary-100 p-2 rounded-lg">
                      <ChefHat className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-dark-900">Your Restaurant</h3>
                      <p className="text-sm text-gray-500">Dashboard Overview</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-900">Total Views</span>
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-green-900 mt-1">12,458</p>
                      <p className="text-xs text-green-700 mt-1">↑ 23% from last month</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <Menu className="w-5 h-5 text-blue-600 mb-2" />
                        <p className="text-xs text-blue-900 font-medium">Menu Items</p>
                        <p className="text-xl font-bold text-blue-900">86</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <QrCode className="w-5 h-5 text-purple-600 mb-2" />
                        <p className="text-xs text-purple-900 font-medium">QR Scans</p>
                        <p className="text-xl font-bold text-purple-900">3,241</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-dark-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '1,000+', label: 'Restaurants' },
              { number: '50K+', label: 'Menu Items' },
              { number: '2M+', label: 'Monthly Views' },
              { number: '99.9%', label: 'Uptime' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold mb-2 text-primary-400 font-serif">
                  {stat.number}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-dark-900 mb-4 font-serif">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to help restaurants modernize their operations and enhance customer experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Smartphone className="w-8 h-8" />,
                title: 'Mobile-First Design',
                description: 'Beautiful, responsive menus that look perfect on any device. Your customers will love the experience.',
                color: 'bg-blue-500'
              },
              {
                icon: <QrCode className="w-8 h-8" />,
                title: 'QR Code Menus',
                description: 'Generate instant QR codes for contactless menu viewing. Safe, modern, and convenient for everyone.',
                color: 'bg-purple-500'
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: 'Instant Updates',
                description: 'Update your menu in real-time. Changes go live immediately across all locations.',
                color: 'bg-yellow-500'
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: 'Multi-Location Support',
                description: 'Manage multiple restaurant locations from a single dashboard. Perfect for growing businesses.',
                color: 'bg-green-500'
              },
              {
                icon: <PieChart className="w-8 h-8" />,
                title: 'Analytics & Insights',
                description: 'Track menu views, popular items, and customer behavior. Make data-driven decisions.',
                color: 'bg-pink-500'
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: 'Customer Engagement',
                description: 'Beautiful banners, featured sections, and promotional content to boost sales.',
                color: 'bg-indigo-500'
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'Secure & Reliable',
                description: 'Enterprise-grade security with 99.9% uptime. Your data is always safe and accessible.',
                color: 'bg-red-500'
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: 'Quick Setup',
                description: 'Get started in minutes. No technical knowledge required. We guide you every step of the way.',
                color: 'bg-teal-500'
              },
              {
                icon: <DollarSign className="w-8 h-8" />,
                title: 'Affordable Pricing',
                description: 'Flexible plans for restaurants of all sizes. Start free and upgrade as you grow.',
                color: 'bg-orange-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className={`${feature.color} w-16 h-16 rounded-xl flex items-center justify-center text-white mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-dark-900 mb-3 font-serif">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-dark-900 mb-4 font-serif">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Launch your digital menu in minutes, not days
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Lines (Hidden on mobile) */}
            <div className="hidden md:block absolute top-1/3 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600"></div>

            {[
              {
                step: '01',
                title: 'Sign Up & Setup',
                description: 'Create your account and add your restaurant details. Takes less than 2 minutes.',
                icon: <Users className="w-8 h-8" />
              },
              {
                step: '02',
                title: 'Build Your Menu',
                description: 'Add categories, items, and images. Our intuitive interface makes it easy.',
                icon: <Menu className="w-8 h-8" />
              },
              {
                step: '03',
                title: 'Go Live!',
                description: 'Share your menu link or QR code. Start delighting customers instantly.',
                icon: <Zap className="w-8 h-8" />
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-primary-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 relative z-10">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 w-16 h-16 rounded-full flex items-center justify-center text-white mb-6 shadow-lg">
                    {step.icon}
                  </div>
                  <div className="text-primary-300 text-6xl font-bold absolute top-4 right-6 opacity-20 font-serif">
                    {step.step}
                  </div>
                  <h3 className="text-2xl font-bold text-dark-900 mb-3 font-serif">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-serif">
              Loved by Restaurant Owners
            </h2>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Join hundreds of satisfied restaurants already using MenuLogs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Owner, Downtown Pizza',
                image: '👩‍🍳',
                quote: 'MenuLogs transformed our customer experience. Digital menus are amazing, and the QR codes are a game-changer!'
              },
              {
                name: 'Michael Chen',
                role: 'Manager, Bistro Square',
                image: '👨‍🍳',
                quote: 'Managing 3 locations is now effortless. Real-time updates save us hours every week. Highly recommended!'
              },
              {
                name: 'Emily Rodriguez',
                role: 'Chef & Founder, Spice Kitchen',
                image: '👩‍🍳',
                quote: 'The analytics help us understand what customers love. We\'ve increased sales by 30% since launching!'
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl hover:bg-white/20 transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-primary-50 mb-6 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <div className="text-4xl mr-4">{testimonial.image}</div>
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-primary-200 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-dark-900 mb-4 font-serif">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect plan for your restaurant. Upgrade or downgrade anytime.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '₹999',
                period: '/month',
                description: 'Perfect for small restaurants',
                features: [
                  '1 Location',
                  '50 Menu Items',
                  'QR Code Menu',
                  'Basic Analytics',
                  'Email Support'
                ],
                cta: 'Start Free Trial',
                popular: false
              },
              {
                name: 'Professional',
                price: '₹2,499',
                period: '/month',
                description: 'Best for growing businesses',
                features: [
                  '3 Locations',
                  'Unlimited Menu Items',
                  'QR Code Menus',
                  'Advanced Analytics',
                  'Priority Support',
                  'Custom Branding'
                ],
                cta: 'Start Free Trial',
                popular: true
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: '',
                description: 'For restaurant chains',
                features: [
                  'Unlimited Locations',
                  'Unlimited Everything',
                  'White Label Solution',
                  'Dedicated Support',
                  'Custom Integrations',
                  'SLA Guarantee'
                ],
                cta: 'Contact Sales',
                popular: false
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 ${
                  plan.popular ? 'ring-4 ring-primary-500 transform scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-dark-900 mb-2 font-serif">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-dark-900 font-serif">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/signup"
                  className={`block text-center py-3 rounded-full font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-lg'
                      : 'bg-gray-100 text-dark-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-dark-900 to-dark-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold mb-6 font-serif"
            >
              Ready to Transform Your Restaurant?
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-300 mb-8"
            >
              Join thousands of restaurants already using MenuLogs. Start your free trial today—no credit card required.
            </motion.p>
            <motion.div 
              variants={fadeInUp}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link 
                to="/signup" 
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-full font-medium text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <span>Start Your Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a 
                href="mailto:sales@menulogs.com" 
                className="inline-flex items-center space-x-2 border-2 border-white text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-white hover:text-dark-900 transition-all duration-300"
              >
                <span>Contact Sales</span>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default BusinessLandingPage;

