import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle,
  MessageSquare,
  Building2,
  Headphones,
  X,
  Menu,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { publicService } from '../api';

const BusinessContactPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    plan: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get plan from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get('plan');
    if (planParam) {
      setFormData(prev => ({ ...prev, plan: planParam }));
    }
  }, []);

  // Handle smooth scroll for anchor links
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Close mobile menu when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await publicService.submitContactForm({
        name: formData.name,
        email: formData.email,
        company: formData.company || undefined,
        phone: formData.phone || undefined,
        plan: formData.plan ? (formData.plan as 'STANDARD' | 'PROFESSIONAL' | 'CUSTOM') : undefined,
        message: formData.message,
      });

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        plan: '',
        message: ''
      });
    } catch (error) {
      console.error('Contact form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <Link to="/" className="flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
              <img src="/logo-full-black.png" alt="MenuLogs" className="h-8 object-cover" />
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/business" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Home
              </Link>
              <a 
                href="/business#features" 
                onClick={(e) => handleAnchorClick(e, '#features')}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors cursor-pointer"
              >
                Features
              </a>
              <a 
                href="/business#pricing" 
                onClick={(e) => handleAnchorClick(e, '#pricing')}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors cursor-pointer"
              >
                Pricing
              </a>
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-200"
            >
              <div className="px-4 py-4 space-y-4">
                <Link
                  to="/business"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-700 hover:text-primary-600 font-medium transition-colors py-2"
                >
                  Home
                </Link>
                <a
                  href="/business#features"
                  onClick={(e) => handleAnchorClick(e, '#features')}
                  className="block text-gray-700 hover:text-primary-600 font-medium transition-colors py-2 cursor-pointer"
                >
                  Features
                </a>
                <a
                  href="/business#pricing"
                  onClick={(e) => handleAnchorClick(e, '#pricing')}
                  className="block text-gray-700 hover:text-primary-600 font-medium transition-colors py-2 cursor-pointer"
                >
                  Pricing
                </a>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-700 hover:text-primary-600 font-medium transition-colors py-2"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2.5 rounded-full font-medium hover:shadow-lg transition-all duration-300 text-center"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div 
              variants={fadeInUp}
              className="inline-block mb-4"
            >
              <span className="bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold">
                📧 Let's Talk
              </span>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-dark-900 mb-6 font-serif leading-tight"
            >
              Get in Touch
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-600 mb-8 leading-relaxed"
            >
              Have questions about MenuLogs? Want to discuss a custom plan? Our team is here to help you transform your restaurant's digital presence.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-dark-900 font-serif">Send us a Message</h2>
                    <p className="text-sm text-gray-600">We'll get back to you within 24 hours</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-dark-900 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-dark-900 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        placeholder="john@restaurant.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="company" className="block text-sm font-semibold text-dark-900 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        placeholder="Your Restaurant"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-dark-900 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        placeholder="+91 99999-12345"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="plan" className="block text-sm font-semibold text-dark-900 mb-2">
                      Interested Plan
                    </label>
                    <select
                      id="plan"
                      name="plan"
                      value={formData.plan}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white"
                    >
                      <option value="">Select a plan (optional)</option>
                      <option value="STANDARD">Standard Plan</option>
                      <option value="PROFESSIONAL">Professional Plan</option>
                      <option value="CUSTOM">Custom/Enterprise Plan</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-dark-900 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
                      placeholder="Tell us about your restaurant and how we can help..."
                    />
                  </div>

                  {submitStatus === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <p className="text-green-800 text-sm">
                        Thank you! Your message has been sent. We'll get back to you soon.
                      </p>
                    </motion.div>
                  )}

                  {submitStatus === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <p className="text-red-800 text-sm">
                        Something went wrong. Please try again or email us directly at{' '}
                        <a href="mailto:sales@menulogs.com" className="underline hover:text-red-900">
                          sales@menulogs.com
                        </a>
                      </p>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-dark-900 mb-4 font-serif">
                  Contact Information
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Prefer to reach out directly? Use any of the methods below. Our sales team is ready to help you find the perfect solution for your restaurant.
                </p>
              </div>

              <div className="space-y-6">
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-4 p-6 bg-gradient-to-br from-primary-50 to-white rounded-xl border border-primary-100 hover:shadow-lg transition-all"
                >
                  <div className="p-3 bg-primary-100 rounded-lg flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-900 mb-1">Email Us</h3>
                    <a 
                      href="mailto:sales@menulogs.com" 
                      className="text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      sales@menulogs.com
                    </a>
                    <p className="text-sm text-gray-600 mt-1">We respond within 24 hours</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-4 p-6 bg-gradient-to-br from-primary-50 to-white rounded-xl border border-primary-100 hover:shadow-lg transition-all"
                >
                  <div className="p-3 bg-primary-100 rounded-lg flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-900 mb-1">Call Us</h3>
                    <a 
                      href="tel:+1234567890" 
                      className="text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      +91 9747676079
                    </a>
                    <p className="text-sm text-gray-600 mt-1">Mon-Fri, 9 AM - 6 PM EST</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-4 p-6 bg-gradient-to-br from-primary-50 to-white rounded-xl border border-primary-100 hover:shadow-lg transition-all"
                >
                  <div className="p-3 bg-primary-100 rounded-lg flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-900 mb-1">Visit Us</h3>
                    <p className="text-gray-600">
                      SysLogs IT Solutions<br />
                      3rd Floor, KP Towers, <br />
                      Near GJHS School Naduvattam <br />
                      Naduvattam - 679308, Kerala, India
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-4 p-6 bg-gradient-to-br from-primary-50 to-white rounded-xl border border-primary-100 hover:shadow-lg transition-all"
                >
                  <div className="p-3 bg-primary-100 rounded-lg flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-900 mb-1">Business Hours</h3>
                    <div className="text-gray-600 space-y-1 text-sm">
                      <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p>Saturday: 10:00 AM - 4:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <div className="pt-8 border-t border-gray-200">
                <h3 className="font-semibold text-dark-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    to="/signup"
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-primary-600" />
                      <span className="text-gray-700 font-medium">Start Free Trial</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                  </Link>
                  
                  <a
                    href="/business#pricing"
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Headphones className="w-5 h-5 text-primary-600" />
                      <span className="text-gray-700 font-medium">View Pricing Plans</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                  </a>
                </div>
              </div>
            </motion.div>
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
              Ready to Get Started?
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
              <Link 
                to="/business" 
                className="inline-flex items-center space-x-2 border-2 border-white text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-white hover:text-dark-900 transition-all duration-300"
              >
                <span>Learn More</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default BusinessContactPage;

