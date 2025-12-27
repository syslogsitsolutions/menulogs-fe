import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cookie, Settings, Shield, BarChart } from 'lucide-react';

const CookiePolicyPage = () => {
  const lastUpdated = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-brand-500 to-brand-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <Cookie className="w-8 h-8" />
              <h1 className="text-4xl md:text-5xl font-bold font-serif">Cookie Policy</h1>
            </div>
            <p className="text-xl text-white/90">
              Learn how we use cookies and similar technologies to enhance your experience.
            </p>
            <p className="text-sm text-white/80 mt-4">
              Last updated: {lastUpdated}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              {/* Introduction */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif">What Are Cookies?</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Cookies are small text files that are placed on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  MenuLogs uses cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and improve our services. This Cookie Policy explains what cookies we use, why we use them, and how you can manage your cookie preferences.
                </p>
              </motion.div>

              {/* Types of Cookies */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif flex items-center space-x-2">
                  <Settings className="w-6 h-6 text-brand-500" />
                  <span>Types of Cookies We Use</span>
                </h2>
                
                <h3 className="text-xl font-semibold text-dark-900 mt-6 mb-3">1. Essential Cookies</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  These cookies are necessary for the website to function properly. They enable core functionality such as:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li>User authentication and session management</li>
                  <li>Remembering your login status</li>
                  <li>Maintaining security and preventing fraud</li>
                  <li>Storing your preferences and settings</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>Duration:</strong> Session cookies (deleted when you close your browser) and persistent cookies (remain until expiration or deletion)
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Can you disable them?</strong> No, these cookies are essential for the Service to work. Disabling them may prevent you from accessing certain features.
                </p>

                <h3 className="text-xl font-semibold text-dark-900 mt-6 mb-3">2. Performance and Analytics Cookies</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. They enable us to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li>Track page views and navigation patterns</li>
                  <li>Identify popular features and areas for improvement</li>
                  <li>Measure website performance and loading times</li>
                  <li>Understand user behavior and preferences</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>Duration:</strong> Typically 1-2 years
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Can you disable them?</strong> Yes, you can disable these cookies through your browser settings, but this may limit our ability to improve the Service.
                </p>

                <h3 className="text-xl font-semibold text-dark-900 mt-6 mb-3">3. Functionality Cookies</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  These cookies allow the website to remember choices you make and provide enhanced, personalized features:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li>Language preferences</li>
                  <li>Theme and display preferences</li>
                  <li>Recently viewed menu items</li>
                  <li>Location-based settings</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>Duration:</strong> Typically 1 year
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Can you disable them?</strong> Yes, but disabling these cookies may result in a less personalized experience.
                </p>

                <h3 className="text-xl font-semibold text-dark-900 mt-6 mb-3">4. Targeting and Advertising Cookies</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Currently, MenuLogs does not use advertising cookies. If we introduce advertising features in the future, we will update this policy and provide opt-out options.
                </p>
              </motion.div>

              {/* Third-Party Cookies */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif">Third-Party Cookies</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may use third-party services that set cookies on your device. These include:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li><strong>Payment Processors (Razorpay):</strong> Cookies used for secure payment processing and fraud prevention</li>
                  <li><strong>Analytics Services:</strong> Cookies used to analyze website traffic and user behavior (if applicable)</li>
                  <li><strong>Cloud Storage (AWS):</strong> Cookies used for secure file upload and storage operations</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  These third parties have their own privacy policies and cookie practices. We encourage you to review their policies.
                </p>
              </motion.div>

              {/* Managing Cookies */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif flex items-center space-x-2">
                  <Shield className="w-6 h-6 text-brand-500" />
                  <span>Managing Your Cookie Preferences</span>
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You have several options for managing cookies:
                </p>

                <h3 className="text-xl font-semibold text-dark-900 mt-6 mb-3">Browser Settings</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Most web browsers allow you to control cookies through their settings. You can:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li>Block all cookies</li>
                  <li>Block third-party cookies only</li>
                  <li>Delete existing cookies</li>
                  <li>Set preferences for specific websites</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Here are links to cookie settings for popular browsers:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Google Chrome</a></li>
                  <li><a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Mozilla Firefox</a></li>
                  <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Safari</a></li>
                  <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Microsoft Edge</a></li>
                </ul>

                <h3 className="text-xl font-semibold text-dark-900 mt-6 mb-3">Opt-Out Tools</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You can also use opt-out tools provided by third-party services:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li><a href="http://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Digital Advertising Alliance</a></li>
                  <li><a href="http://www.youronlinechoices.eu/" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Your Online Choices (EU)</a></li>
                </ul>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Note:</strong> Blocking or deleting cookies may impact your ability to use certain features of MenuLogs. Essential cookies are required for the Service to function properly.
                  </p>
                </div>
              </motion.div>

              {/* Local Storage */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif flex items-center space-x-2">
                  <BarChart className="w-6 h-6 text-brand-500" />
                  <span>Local Storage and Similar Technologies</span>
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  In addition to cookies, we may use other storage technologies:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li><strong>Local Storage:</strong> Used to store user preferences and settings locally on your device</li>
                  <li><strong>Session Storage:</strong> Used to store temporary data during your browsing session</li>
                  <li><strong>Web Beacons:</strong> Small images embedded in emails or web pages to track engagement</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  You can manage these technologies through your browser settings, similar to cookies.
                </p>
              </motion.div>

              {/* Updates */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif">Updates to This Cookie Policy</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will notify you of any material changes by:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li>Posting the updated policy on this page</li>
                  <li>Updating the "Last updated" date</li>
                  <li>Sending you an email notification (for significant changes)</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies.
                </p>
              </motion.div>

              {/* Contact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif">Contact Us</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have questions about our use of cookies or this Cookie Policy, please contact us:
                </p>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <p className="text-gray-700 mb-2">
                    <strong>Email:</strong> privacy@menulogs.com
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Support:</strong> support@menulogs.com
                  </p>
                  <p className="text-gray-700">
                    We will respond to your inquiry within 30 days.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/privacy-policy"
              className="text-brand-600 hover:text-brand-700 font-medium"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              to="/terms-and-conditions"
              className="text-brand-600 hover:text-brand-700 font-medium"
            >
              Terms and Conditions
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              to="/refund-policy"
              className="text-brand-600 hover:text-brand-700 font-medium"
            >
              Refund Policy
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CookiePolicyPage;

