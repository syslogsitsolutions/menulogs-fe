import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Building2, Lock, Bell, Save, Facebook, Instagram, Twitter, Linkedin, Youtube, Loader2, AlertCircle, CheckCircle, ChevronDown, ChevronUp, FileText, Globe } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUpdateBusiness } from '../../hooks/useBusiness';
import { parseAPIError, getUserFriendlyErrorMessage } from '../../lib/apiError';
import { SingleImageUpload } from '../../components/common';
import { authService } from '../../api';

const SettingsPage = () => {
  const { user, business } = useAuthStore();
  const [activeTab, setActiveTab] = useState('account');

  // Account form
  const [accountData, setAccountData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  // Business form
  const [businessData, setBusinessData] = useState({
    name: business?.name || '',
    description: business?.description || '',
    logo: business?.logo || '',
    logoFile: undefined as File | undefined, // For file uploads
    // Brand section
    brandDescription: business?.brandDescription || '',
    facebookUrl: business?.facebookUrl || '',
    instagramUrl: business?.instagramUrl || '',
    twitterUrl: business?.twitterUrl || '',
    linkedinUrl: business?.linkedinUrl || '',
    youtubeUrl: business?.youtubeUrl || '',
    // About page
    aboutContent: business?.aboutContent || '',
    aboutImage: business?.aboutImage || '',
    aboutImageFile: undefined as File | undefined, // For file uploads
  });

  const updateBusiness = useUpdateBusiness();
  const [businessError, setBusinessError] = useState<string | null>(null);
  const [businessSuccess, setBusinessSuccess] = useState(false);
  
  // Section expand/collapse state for business settings
  const [expandedBusinessSections, setExpandedBusinessSections] = useState({
    basicInfo: true,
    brandSection: true,
    aboutPage: true,
  });
  
  const toggleBusinessSection = (section: keyof typeof expandedBusinessSections) => {
    setExpandedBusinessSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Update form when business data changes
  useEffect(() => {
    if (business) {
      setBusinessData({
        name: business.name || '',
        description: business.description || '',
        logo: business.logo || '',
        logoFile: undefined,
        brandDescription: business.brandDescription || '',
        facebookUrl: business.facebookUrl || '',
        instagramUrl: business.instagramUrl || '',
        twitterUrl: business.twitterUrl || '',
        linkedinUrl: business.linkedinUrl || '',
        youtubeUrl: business.youtubeUrl || '',
        aboutContent: business.aboutContent || '',
        aboutImage: business.aboutImage || '',
        aboutImageFile: undefined,
      });
    }
  }, [business]);

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notifications
  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailReviews: true,
    emailMarketing: false,
    pushOrders: true,
    pushReviews: false
  });

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    // Save account data
    console.log('Saving account:', accountData);
  };

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business?.id) {
      setBusinessError('Business ID is missing. Please refresh the page.');
      return;
    }

    setBusinessError(null);
    setBusinessSuccess(false);

    updateBusiness.mutate(
      {
        id: business.id,
        data: {
          name: businessData.name.trim(),
          description: businessData.description?.trim() || undefined,
          logo: businessData.logoFile || businessData.logo?.trim() || undefined, // Use file if available, otherwise URL
          brandDescription: businessData.brandDescription?.trim() || undefined,
          facebookUrl: businessData.facebookUrl?.trim() || undefined,
          instagramUrl: businessData.instagramUrl?.trim() || undefined,
          twitterUrl: businessData.twitterUrl?.trim() || undefined,
          linkedinUrl: businessData.linkedinUrl?.trim() || undefined,
          youtubeUrl: businessData.youtubeUrl?.trim() || undefined,
          aboutContent: businessData.aboutContent?.trim() || undefined,
          aboutImage: businessData.aboutImageFile || businessData.aboutImage?.trim() || undefined, // Use file if available, otherwise URL
        },
      },
      {
        onSuccess: () => {
          setBusinessSuccess(true);
          setTimeout(() => setBusinessSuccess(false), 3000);
        },
        onError: (error) => {
          const apiError = parseAPIError(error);
          setBusinessError(getUserFriendlyErrorMessage(apiError));
        },
      }
    );
  };

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordSuccess(true);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      // Logout user after password change (they'll need to login again)
      setTimeout(() => {
        const { logout } = useAuthStore.getState();
        logout();
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      const apiError = parseAPIError(err);
      setPasswordError(getUserFriendlyErrorMessage(apiError));
    }
  };

  const handleSaveNotifications = () => {
    console.log('Saving notifications:', notifications);
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'business', label: 'Business', icon: Building2 },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-dark-900 font-serif">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Tabs Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-200 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary-600' : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Account Settings */}
          {activeTab === 'account' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <h2 className="text-2xl font-bold text-dark-900 mb-6 font-serif">Account Settings</h2>
              <form onSubmit={handleSaveAccount} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={accountData.name}
                    onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={accountData.email}
                    onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </button>
              </form>
            </motion.div>
          )}

          {/* Business Settings */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-dark-900 font-serif">Business Settings</h2>
              
              {/* Success/Error Messages */}
              {businessSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Business settings saved successfully!</span>
                </motion.div>
              )}
              {businessError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span>{businessError}</span>
                </motion.div>
              )}

              <form onSubmit={handleSaveBusiness} className="space-y-6">
                {/* Basic Information Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleBusinessSection('basicInfo')}
                    className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <Building2 className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-dark-900 font-serif">Basic Information</h3>
                        <p className="text-sm text-gray-600 mt-0.5">Business name, description, and logo</p>
                      </div>
                    </div>
                    {expandedBusinessSections.basicInfo ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  {expandedBusinessSections.basicInfo && (
                    <div className="px-6 pb-6 space-y-5">
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      value={businessData.name}
                      onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={businessData.description}
                      onChange={(e) => setBusinessData({ ...businessData, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                      rows={4}
                      placeholder="Brief description of your business"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo
                    </label>
                    <div className="max-w-48">
                      <SingleImageUpload
                        image={businessData.logo}
                        onChange={(value) => {
                          setBusinessData({
                            ...businessData,
                            logo: value.preview,
                            logoFile: value.file,
                          });
                        }}
                        label="Upload logo image"
                        maxSizeMB={10}
                        aspectRatio="aspect-square"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Upload a logo image or use a URL. Recommended size: 512x512px. Max size: 10MB.
                    </p>
                  </div>
                    </div>
                  )}
                </motion.div>

                {/* Brand Section (Footer) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleBusinessSection('brandSection')}
                    className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <Globe className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-dark-900 font-serif">Brand Section (Footer)</h3>
                        <p className="text-sm text-gray-600 mt-0.5">Brand description and social media links</p>
                      </div>
                    </div>
                    {expandedBusinessSections.brandSection ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  {expandedBusinessSections.brandSection && (
                    <div className="px-6 pb-6 space-y-5">
                      <p className="text-sm text-gray-600">These details will appear in the footer of your public menu pages.</p>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand Description
                    </label>
                    <textarea
                      value={businessData.brandDescription}
                      onChange={(e) => setBusinessData({ ...businessData, brandDescription: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                      rows={3}
                      placeholder="Short description for footer (e.g., 'Experience culinary excellence with every dish')"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Facebook className="w-4 h-4 inline mr-2" />
                        Facebook URL
                      </label>
                      <input
                        type="url"
                        value={businessData.facebookUrl}
                        onChange={(e) => setBusinessData({ ...businessData, facebookUrl: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        placeholder="https://facebook.com/yourpage"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Instagram className="w-4 h-4 inline mr-2" />
                        Instagram URL
                      </label>
                      <input
                        type="url"
                        value={businessData.instagramUrl}
                        onChange={(e) => setBusinessData({ ...businessData, instagramUrl: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        placeholder="https://instagram.com/yourpage"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Twitter className="w-4 h-4 inline mr-2" />
                        Twitter URL
                      </label>
                      <input
                        type="url"
                        value={businessData.twitterUrl}
                        onChange={(e) => setBusinessData({ ...businessData, twitterUrl: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        placeholder="https://twitter.com/yourpage"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Linkedin className="w-4 h-4 inline mr-2" />
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        value={businessData.linkedinUrl}
                        onChange={(e) => setBusinessData({ ...businessData, linkedinUrl: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        placeholder="https://linkedin.com/company/yourpage"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Youtube className="w-4 h-4 inline mr-2" />
                        YouTube URL
                      </label>
                      <input
                        type="url"
                        value={businessData.youtubeUrl}
                        onChange={(e) => setBusinessData({ ...businessData, youtubeUrl: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        placeholder="https://youtube.com/@yourchannel"
                      />
                    </div>
                    </div>
                    </div>
                  )}
                </motion.div>

                {/* About Page */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleBusinessSection('aboutPage')}
                    className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <FileText className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-dark-900 font-serif">About Page</h3>
                        <p className="text-sm text-gray-600 mt-0.5">Content and hero image for your public About page</p>
                      </div>
                    </div>
                    {expandedBusinessSections.aboutPage ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  {expandedBusinessSections.aboutPage && (
                    <div className="px-6 pb-6 space-y-5">
                      <p className="text-sm text-gray-600">Content for your public About page.</p>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      About Content
                    </label>
                    <textarea
                      value={businessData.aboutContent}
                      onChange={(e) => setBusinessData({ ...businessData, aboutContent: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                      rows={8}
                      placeholder="Tell your story... Share your journey, values, and what makes your business special."
                    />
                    <p className="mt-1 text-xs text-gray-500">You can use basic HTML formatting or plain text.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      About Page Hero Image
                    </label>
                    <div className="max-w-2xl">
                      <SingleImageUpload
                        image={businessData.aboutImage}
                        onChange={(value) => {
                          setBusinessData({
                            ...businessData,
                            aboutImage: value.preview,
                            aboutImageFile: value.file,
                          });
                        }}
                        label="Upload hero image for about page"
                        maxSizeMB={10}
                        aspectRatio="aspect-video"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Upload a hero image for your About page. Recommended size: 1920x1080px. Max size: 10MB.
                    </p>
                  </div>
                    </div>
                  )}
                </motion.div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={updateBusiness.isPending}
                    className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg text-sm font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {updateBusiness.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Password Settings */}
          {activeTab === 'password' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <h2 className="text-2xl font-bold text-dark-900 mb-6 font-serif">Change Password</h2>
              
              {passwordSuccess && (
                <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 mb-6">
                  <CheckCircle className="w-5 h-5" />
                  <span>Password changed successfully! Redirecting to login...</span>
                </div>
              )}
              {passwordError && (
                <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 mb-6">
                  <AlertCircle className="w-5 h-5" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  <Lock className="w-5 h-5" />
                  <span>Update Password</span>
                </button>
              </form>
            </motion.div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <h2 className="text-2xl font-bold text-dark-900 mb-6 font-serif">Notification Preferences</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-dark-900 mb-4">Email Notifications</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-medium text-dark-900">New Orders</p>
                        <p className="text-sm text-gray-600">Get notified when you receive new orders</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.emailOrders}
                        onChange={(e) => setNotifications({ ...notifications, emailOrders: e.target.checked })}
                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-medium text-dark-900">Customer Reviews</p>
                        <p className="text-sm text-gray-600">Get notified about new customer reviews</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.emailReviews}
                        onChange={(e) => setNotifications({ ...notifications, emailReviews: e.target.checked })}
                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-medium text-dark-900">Marketing & Updates</p>
                        <p className="text-sm text-gray-600">Receive tips, updates and special offers</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.emailMarketing}
                        onChange={(e) => setNotifications({ ...notifications, emailMarketing: e.target.checked })}
                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-dark-900 mb-4">Push Notifications</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-medium text-dark-900">New Orders</p>
                        <p className="text-sm text-gray-600">Instant notifications for new orders</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.pushOrders}
                        onChange={(e) => setNotifications({ ...notifications, pushOrders: e.target.checked })}
                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-medium text-dark-900">Customer Reviews</p>
                        <p className="text-sm text-gray-600">Instant notifications for reviews</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.pushReviews}
                        onChange={(e) => setNotifications({ ...notifications, pushReviews: e.target.checked })}
                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleSaveNotifications}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Preferences</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

