import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, CreditCard, Clock, CheckCircle, XCircle } from 'lucide-react';

const RefundPolicyPage = () => {
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
              <RefreshCw className="w-8 h-8" />
              <h1 className="text-4xl md:text-5xl font-bold font-serif">Refund Policy</h1>
            </div>
            <p className="text-xl text-white/90">
              Our refund policy for subscription payments and service fees.
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
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif">Introduction</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  This Refund Policy explains MenuLogs' policy regarding refunds for subscription fees and other charges. Please read this policy carefully before making a purchase or subscription.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  By subscribing to MenuLogs, you acknowledge that you have read, understood, and agree to be bound by this Refund Policy. If you do not agree with this policy, please do not subscribe to our services.
                </p>
              </motion.div>

              {/* General Policy */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif flex items-center space-x-2">
                  <CreditCard className="w-6 h-6 text-brand-500" />
                  <span>General Refund Policy</span>
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  MenuLogs operates on a subscription-based model. Our general refund policy is as follows:
                </p>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-4">
                  <p className="text-gray-700 font-semibold mb-2">
                    Subscription fees are generally non-refundable.
                  </p>
                  <p className="text-gray-700">
                    Once a subscription payment has been processed, refunds are typically not available except in the circumstances outlined below.
                  </p>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  This policy applies to all subscription plans, including monthly and annual subscriptions, as well as any plan upgrades or downgrades.
                </p>
              </motion.div>

              {/* Eligible Refunds */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif flex items-center space-x-2">
                  <CheckCircle className="w-6 h-6 text-brand-500" />
                  <span>Eligible Refund Scenarios</span>
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may provide refunds in the following circumstances:
                </p>

                <div className="space-y-6">
                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="text-xl font-semibold text-dark-900 mb-2">1. Service Unavailability</h3>
                    <p className="text-gray-700 leading-relaxed mb-2">
                      If MenuLogs is unavailable or non-functional for an extended period (more than 48 consecutive hours) due to our technical issues, you may be eligible for a prorated refund for the affected period.
                    </p>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      <strong>Process:</strong> Contact support with details of the outage period. We will investigate and process refunds on a case-by-case basis.
                    </p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="text-xl font-semibold text-dark-900 mb-2">2. Duplicate Charges</h3>
                    <p className="text-gray-700 leading-relaxed mb-2">
                      If you are charged multiple times for the same subscription period due to a billing error on our part, we will refund all duplicate charges immediately upon verification.
                    </p>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      <strong>Process:</strong> Report duplicate charges to support@menulogs.com with transaction details. Refunds are typically processed within 5-7 business days.
                    </p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="text-xl font-semibold text-dark-900 mb-2">3. Cancellation Within Trial Period</h3>
                    <p className="text-gray-700 leading-relaxed mb-2">
                      If we offer a free trial period and you cancel before the trial ends, you will not be charged. If you are charged during or after a trial period, you may be eligible for a full refund if cancellation occurs within 24 hours of the charge.
                    </p>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      <strong>Note:</strong> This applies only if a trial period is explicitly offered and you cancel within the specified timeframe.
                    </p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="text-xl font-semibold text-dark-900 mb-2">4. Legal Requirements</h3>
                    <p className="text-gray-700 leading-relaxed mb-2">
                      We will provide refunds as required by applicable consumer protection laws and regulations in your jurisdiction.
                    </p>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      <strong>Examples:</strong> Right of withdrawal in EU countries, consumer protection laws in various jurisdictions.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Non-Eligible Refunds */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif flex items-center space-x-2">
                  <XCircle className="w-6 h-6 text-red-500" />
                  <span>Non-Eligible Refund Scenarios</span>
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Refunds are generally not available for:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li>Change of mind or dissatisfaction with the service (after the initial cancellation period, if applicable)</li>
                  <li>Failure to use the service or access features</li>
                  <li>Account suspension or termination due to violation of Terms and Conditions</li>
                  <li>Downgrading or canceling a subscription after the billing period has started</li>
                  <li>Partial usage of a subscription period</li>
                  <li>Third-party payment processing fees (these are non-refundable)</li>
                  <li>Plan changes or upgrades (previous plan charges are not refunded)</li>
                </ul>
              </motion.div>

              {/* Cancellation Policy */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif flex items-center space-x-2">
                  <Clock className="w-6 h-6 text-brand-500" />
                  <span>Cancellation Policy</span>
                </h2>
                <h3 className="text-xl font-semibold text-dark-900 mt-6 mb-3">How to Cancel</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You can cancel your subscription at any time through:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li>Your account dashboard settings</li>
                  <li>Email request to support@menulogs.com</li>
                  <li>Contacting our support team</li>
                </ul>

                <h3 className="text-xl font-semibold text-dark-900 mt-6 mb-3">Cancellation Timing</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  When you cancel your subscription:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li><strong>Immediate Effect:</strong> Your subscription will remain active until the end of the current billing period</li>
                  <li><strong>No Renewal:</strong> Your subscription will not renew automatically after the current period ends</li>
                  <li><strong>Access:</strong> You will continue to have access to all features until the end of the paid period</li>
                  <li><strong>Data:</strong> Your data will be retained according to our data retention policy (typically 30 days after cancellation)</li>
                </ul>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Important:</strong> Canceling your subscription does not automatically entitle you to a refund. Refunds are only provided in the eligible scenarios outlined above.
                  </p>
                </div>
              </motion.div>

              {/* Refund Process */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif">Refund Process</h2>
                <h3 className="text-xl font-semibold text-dark-900 mt-6 mb-3">Step 1: Request a Refund</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  To request a refund, contact us at:
                </p>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                  <p className="text-gray-700 mb-2">
                    <strong>Email:</strong> support@menulogs.com
                  </p>
                  <p className="text-gray-700">
                    <strong>Subject:</strong> Refund Request - [Your Account Email]
                  </p>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Include the following information in your request:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li>Your account email address</li>
                  <li>Transaction ID or payment receipt</li>
                  <li>Reason for refund request</li>
                  <li>Supporting documentation (if applicable)</li>
                </ul>

                <h3 className="text-xl font-semibold text-dark-900 mt-6 mb-3">Step 2: Review Process</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We will review your refund request within 5-7 business days. We may contact you for additional information if needed.
                </p>

                <h3 className="text-xl font-semibold text-dark-900 mt-6 mb-3">Step 3: Refund Processing</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If your refund is approved:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li>Refunds will be processed to the original payment method</li>
                  <li>Processing time: 5-10 business days after approval</li>
                  <li>You will receive an email confirmation when the refund is processed</li>
                  <li>Your bank or payment provider may take additional time to reflect the refund</li>
                </ul>
              </motion.div>

              {/* Partial Refunds */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif">Partial Refunds and Proration</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  In some cases, we may provide prorated refunds:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li>Prorated refunds are calculated based on the unused portion of your subscription period</li>
                  <li>Refunds are calculated on a daily basis from the date of cancellation or service issue</li>
                  <li>Processing fees may be deducted from refund amounts (as permitted by law)</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Example: If you cancel an annual subscription after 3 months, you may receive a prorated refund for the remaining 9 months (if eligible under this policy).
                </p>
              </motion.div>

              {/* Payment Processor */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif">Payment Processor</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  MenuLogs uses Razorpay as our payment processor. Refunds are processed through Razorpay and will appear in your original payment method. Razorpay's processing fees are non-refundable.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  If you have questions about a refund that has been processed, you may also contact Razorpay support directly with your transaction ID.
                </p>
              </motion.div>

              {/* Disputes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif">Disputes and Chargebacks</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you are not satisfied with our refund decision, you may:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                  <li>Contact us again with additional information or clarification</li>
                  <li>Request escalation to a supervisor or manager</li>
                  <li>File a dispute with your payment provider (chargeback)</li>
                </ul>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <p className="text-red-800 text-sm">
                    <strong>Important:</strong> Filing a chargeback without first attempting to resolve the issue with us may result in account suspension. We encourage you to work with us directly to resolve any issues.
                  </p>
                </div>
              </motion.div>

              {/* Changes to Policy */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-dark-900 mb-4 font-serif">Changes to This Refund Policy</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately upon posting on this page. Material changes will be communicated to active subscribers via email.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Your continued use of MenuLogs after changes to this policy constitutes acceptance of the updated policy. Refund requests are processed according to the policy in effect at the time of your subscription purchase.
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
                  If you have questions about refunds or this Refund Policy, please contact us:
                </p>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <p className="text-gray-700 mb-2">
                    <strong>Email:</strong> support@menulogs.com
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Refund Requests:</strong> support@menulogs.com (Subject: Refund Request)
                  </p>
                  <p className="text-gray-700">
                    <strong>Response Time:</strong> We aim to respond to refund requests within 5-7 business days.
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
              to="/cookie-policy"
              className="text-brand-600 hover:text-brand-700 font-medium"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RefundPolicyPage;

