import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Scale, AlertTriangle, CheckCircle } from 'lucide-react';

const TermsAndConditionsPage = () => {
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
              <Scale className="w-8 h-8" />
              <h1 className="text-4xl md:text-5xl font-bold font-serif">Terms and Conditions</h1>
            </div>
            <p className="text-xl text-white/90">
              Please read these terms carefully before using MenuLogs services.
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
              {/* Agreement */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif flex items-center space-x-2">
                  <FileText className="w-6 h-6 text-brand-500" />
                  <span>Agreement to Terms</span>
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  These Terms and Conditions ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and MenuLogs ("we," "us," or "our") regarding your use of our restaurant menu management platform and related services (collectively, the "Service").
                </p>
                <p className="text-gray-700 leading-relaxed">
                  By accessing or using MenuLogs, you agree to be bound by these Terms. If you do not agree to these Terms, you may not use our Service. These Terms apply to all users, including restaurant owners, customers, and visitors.
                </p>
              </motion.div>

              {/* Eligibility */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif">Eligibility and Account Registration</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  To use MenuLogs, you must:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li>Be at least 18 years of age or have parental consent</li>
                  <li>Have the legal capacity to enter into binding agreements</li>
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and update your account information to keep it accurate</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Notify us immediately of any unauthorized access to your account</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  You are responsible for all activities that occur under your account. We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent or harmful activities.
                </p>
              </motion.div>

              {/* Service Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif">Service Description</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  MenuLogs provides a Software-as-a-Service (SaaS) platform that enables restaurant owners to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li>Create and manage digital menus with categories, items, prices, and images</li>
                  <li>Manage multiple restaurant locations</li>
                  <li>Customize branding, colors, and design elements</li>
                  <li>Display menus to customers via public-facing URLs</li>
                  <li>Generate QR codes for easy menu access</li>
                  <li>Manage subscriptions and billing</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, with or without notice. We do not guarantee uninterrupted or error-free service.
                </p>
              </motion.div>

              {/* Subscription and Payment */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif">Subscription Plans and Payment</h2>
                <h3 className="text-xl font-semibold text-dark-900 mt-6 mb-3">Subscription Plans</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  MenuLogs offers various subscription plans with different features and pricing. Subscription fees are billed in advance on a monthly or annual basis, as selected during signup.
                </p>

                <h3 className="text-xl font-semibold text-dark-900 mt-6 mb-3">Payment Processing</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Payments are processed securely through Razorpay, our third-party payment processor. By providing payment information, you authorize us to charge your payment method for all fees associated with your subscription.
                </p>

                <h3 className="text-xl font-semibold text-dark-900 mt-6 mb-3">Automatic Renewal</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Subscriptions automatically renew at the end of each billing period unless you cancel before the renewal date. You can cancel your subscription at any time through your account dashboard.
                </p>

                <h3 className="text-xl font-semibold text-dark-900 mt-6 mb-3">Price Changes</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We reserve the right to modify subscription prices. Price changes will be communicated to you at least 30 days in advance. Continued use of the Service after a price change constitutes acceptance of the new pricing.
                </p>

                <h3 className="text-xl font-semibold text-dark-900 mt-6 mb-3">Refunds</h3>
                <p className="text-gray-700 leading-relaxed">
                  Refund policies are detailed in our <Link to="/refund-policy" className="text-brand-600 hover:underline">Refund Policy</Link>. Generally, subscription fees are non-refundable except as required by law or as specified in the Refund Policy.
                </p>
              </motion.div>

              {/* User Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif">User Content and Intellectual Property</h2>
                <h3 className="text-xl font-semibold text-dark-900 mt-6 mb-3">Your Content</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You retain ownership of all content you upload to MenuLogs, including menu items, images, descriptions, and branding materials ("User Content"). By uploading User Content, you grant us a worldwide, non-exclusive, royalty-free license to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li>Store, display, and distribute your content through our Service</li>
                  <li>Use your content to provide and improve our services</li>
                  <li>Display your content to customers as part of public menu pages</li>
                </ul>

                <h3 className="text-xl font-semibold text-dark-900 mt-6 mb-3">Content Standards</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You agree not to upload content that:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li>Violates any laws, regulations, or third-party rights</li>
                  <li>Is defamatory, obscene, or offensive</li>
                  <li>Infringes on intellectual property rights</li>
                  <li>Contains malware, viruses, or harmful code</li>
                  <li>Is false, misleading, or deceptive</li>
                </ul>

                <h3 className="text-xl font-semibold text-dark-900 mt-6 mb-3">Our Intellectual Property</h3>
                <p className="text-gray-700 leading-relaxed">
                  The MenuLogs platform, including its design, features, and software, is owned by us and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or create derivative works of our Service without our written permission.
                </p>
              </motion.div>

              {/* Prohibited Uses */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif flex items-center space-x-2">
                  <AlertTriangle className="w-6 h-6 text-brand-500" />
                  <span>Prohibited Uses</span>
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You agree not to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li>Use the Service for any illegal purpose or in violation of any laws</li>
                  <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                  <li>Interfere with or disrupt the Service or servers</li>
                  <li>Use automated systems (bots, scrapers) to access the Service without permission</li>
                  <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                  <li>Resell, sublicense, or redistribute the Service without authorization</li>
                  <li>Impersonate any person or entity or misrepresent your affiliation</li>
                  <li>Collect or harvest information about other users without consent</li>
                </ul>
              </motion.div>

              {/* Service Availability */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif">Service Availability and Modifications</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We strive to provide reliable service but do not guarantee:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li>Uninterrupted or error-free operation</li>
                  <li>That the Service will meet all your requirements</li>
                  <li>That errors will be corrected immediately</li>
                  <li>That the Service is free from viruses or harmful components</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  We may perform scheduled maintenance, updates, or modifications that may temporarily interrupt service. We will provide reasonable notice when possible.
                </p>
              </motion.div>

              {/* Termination */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif">Termination</h2>
                <h3 className="text-xl font-semibold text-dark-900 mt-6 mb-3">Termination by You</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You may cancel your subscription and terminate your account at any time through your account settings or by contacting support. Upon termination, your access to the Service will cease, and your data may be deleted in accordance with our data retention policies.
                </p>

                <h3 className="text-xl font-semibold text-dark-900 mt-6 mb-3">Termination by Us</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may suspend or terminate your account immediately if:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li>You violate these Terms</li>
                  <li>You engage in fraudulent or illegal activities</li>
                  <li>You fail to pay subscription fees</li>
                  <li>We are required to do so by law</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Upon termination, you will lose access to your account and data. We are not obligated to provide refunds for terminated accounts.
                </p>
              </motion.div>

              {/* Disclaimers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif">Disclaimers</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li>Warranties of merchantability, fitness for a particular purpose, or non-infringement</li>
                  <li>Warranties that the Service will be uninterrupted, secure, or error-free</li>
                  <li>Warranties regarding the accuracy, reliability, or completeness of content</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  We do not warrant that the Service will meet your specific requirements or that any errors will be corrected.
                </p>
              </motion.div>

              {/* Limitation of Liability */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif">Limitation of Liability</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, MENULOGS SHALL NOT BE LIABLE FOR:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li>Indirect, incidental, special, consequential, or punitive damages</li>
                  <li>Loss of profits, revenue, data, or business opportunities</li>
                  <li>Damages resulting from your use or inability to use the Service</li>
                  <li>Damages resulting from unauthorized access to or alteration of your data</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Our total liability for any claims arising from or related to the Service shall not exceed the amount you paid us in the 12 months preceding the claim, or $100, whichever is greater.
                </p>
              </motion.div>

              {/* Indemnification */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif">Indemnification</h2>
                <p className="text-gray-700 leading-relaxed">
                  You agree to indemnify, defend, and hold harmless MenuLogs, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Service, violation of these Terms, or infringement of any rights of another party.
                </p>
              </motion.div>

              {/* Governing Law */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif">Governing Law and Dispute Resolution</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Any disputes arising from or related to these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of [Arbitration Organization], except where prohibited by law. You waive your right to a jury trial and to participate in class action lawsuits.
                </p>
              </motion.div>

              {/* Changes to Terms */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif">Changes to Terms</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We reserve the right to modify these Terms at any time. Material changes will be communicated to you via email or through the Service. Your continued use of the Service after changes become effective constitutes acceptance of the updated Terms.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  If you do not agree to the modified Terms, you must stop using the Service and cancel your subscription.
                </p>
              </motion.div>

              {/* Contact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.3 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif flex items-center space-x-2">
                  <CheckCircle className="w-6 h-6 text-brand-500" />
                  <span>Contact Information</span>
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have questions about these Terms, please contact us:
                </p>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <p className="text-gray-700 mb-2">
                    <strong>Email:</strong> legal@menulogs.com
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Support:</strong> support@menulogs.com
                  </p>
                  <p className="text-gray-700">
                    We will respond to your inquiry within 5 business days.
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

export default TermsAndConditionsPage;

