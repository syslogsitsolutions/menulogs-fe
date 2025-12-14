import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';

const PrivacyPolicyPage = () => {
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
              <Shield className="w-8 h-8" />
              <h1 className="text-4xl md:text-5xl font-bold font-serif">Privacy Policy</h1>
            </div>
            <p className="text-xl text-white/90">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
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
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif flex items-center space-x-2">
                  <FileText className="w-6 h-6 text-brand-500" />
                  <span>Introduction</span>
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Welcome to MenuLogs ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our restaurant menu management platform and services.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  By using MenuLogs, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
                </p>
              </motion.div>

              {/* Information We Collect */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif flex items-center space-x-2">
                  <Eye className="w-6 h-6 text-brand-500" />
                  <span>Information We Collect</span>
                </h2>
                
                <h3 className="text-xl font-semibold text-dark-900 mt-6 mb-3">1. Personal Information</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  When you register for an account or use our services, we may collect:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li>Name and contact information (email address, phone number)</li>
                  <li>Business information (business name, address, tax identification numbers)</li>
                  <li>Payment information (processed securely through Razorpay, we do not store full payment card details)</li>
                  <li>Account credentials (username, encrypted password)</li>
                  <li>Profile information and preferences</li>
                </ul>

                <h3 className="text-xl font-semibold text-dark-900 mt-6 mb-3">2. Restaurant and Menu Data</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  As a restaurant owner using our platform, you may provide:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li>Menu items, descriptions, prices, and images</li>
                  <li>Location information and operating hours</li>
                  <li>Branding materials (logos, banners, color schemes)</li>
                  <li>Customer-facing content (about pages, contact information)</li>
                </ul>

                <h3 className="text-xl font-semibold text-dark-900 mt-6 mb-3">3. Usage Information</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We automatically collect information about how you interact with our platform:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li>Device information (IP address, browser type, operating system)</li>
                  <li>Usage patterns and navigation paths</li>
                  <li>Access times and dates</li>
                  <li>Cookies and similar tracking technologies (see our Cookie Policy)</li>
                </ul>
              </motion.div>

              {/* How We Use Your Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif flex items-center space-x-2">
                  <Lock className="w-6 h-6 text-brand-500" />
                  <span>How We Use Your Information</span>
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use the information we collect for the following purposes:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li><strong>Service Delivery:</strong> To provide, maintain, and improve our menu management platform</li>
                  <li><strong>Account Management:</strong> To create and manage your account, process subscriptions, and handle billing</li>
                  <li><strong>Communication:</strong> To send you service updates, support responses, and important notices</li>
                  <li><strong>Customer Support:</strong> To respond to your inquiries and provide technical assistance</li>
                  <li><strong>Analytics:</strong> To understand usage patterns and improve our services</li>
                  <li><strong>Security:</strong> To detect, prevent, and address fraud, security issues, and technical problems</li>
                  <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes</li>
                </ul>
              </motion.div>

              {/* Information Sharing */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif">Information Sharing and Disclosure</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We do not sell your personal information. We may share your information only in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li><strong>Service Providers:</strong> With trusted third-party service providers who assist in operating our platform (e.g., payment processors, cloud hosting, analytics)</li>
                  <li><strong>Public Menu Display:</strong> Restaurant information and menus are displayed publicly as part of our service to customers</li>
                  <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (with notice to users)</li>
                  <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
                </ul>
              </motion.div>

              {/* Data Security */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif">Data Security</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We implement industry-standard security measures to protect your information:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li>Encryption of data in transit (SSL/TLS) and at rest</li>
                  <li>Secure authentication and access controls</li>
                  <li>Regular security assessments and updates</li>
                  <li>Secure cloud infrastructure (AWS S3 for file storage)</li>
                  <li>Limited access to personal information on a need-to-know basis</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                </p>
              </motion.div>

              {/* Your Rights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif">Your Rights and Choices</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li><strong>Access:</strong> Request access to your personal information</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information through your account settings</li>
                  <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                  <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
                  <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications (service-related emails may still be sent)</li>
                  <li><strong>Cookie Preferences:</strong> Manage cookie settings through your browser</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  To exercise these rights, please contact us at the email address provided below.
                </p>
              </motion.div>

              {/* Data Retention */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif">Data Retention</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We retain your personal information for as long as necessary to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li>Provide our services to you</li>
                  <li>Comply with legal obligations</li>
                  <li>Resolve disputes and enforce agreements</li>
                  <li>Maintain business records as required by law</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal or legitimate business purposes.
                </p>
              </motion.div>

              {/* Children's Privacy */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif">Children's Privacy</h2>
                <p className="text-gray-700 leading-relaxed">
                  MenuLogs is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately, and we will take steps to delete such information.
                </p>
              </motion.div>

              {/* International Users */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif">International Data Transfers</h2>
                <p className="text-gray-700 leading-relaxed">
                  Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. By using our services, you consent to the transfer of your information to these countries. We take appropriate measures to ensure your information is protected in accordance with this Privacy Policy.
                </p>
              </motion.div>

              {/* Changes to Policy */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif">Changes to This Privacy Policy</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li>Posting the new Privacy Policy on this page</li>
                  <li>Updating the "Last updated" date</li>
                  <li>Sending you an email notification (for significant changes)</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Your continued use of our services after changes become effective constitutes acceptance of the updated policy.
                </p>
              </motion.div>

              {/* Contact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif">Contact Us</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
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
              to="/terms-and-conditions"
              className="text-brand-600 hover:text-brand-700 font-medium"
            >
              Terms and Conditions
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              to="/cookie-policy"
              className="text-brand-600 hover:text-brand-700 font-medium"
            >
              Cookie Policy
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

export default PrivacyPolicyPage;

