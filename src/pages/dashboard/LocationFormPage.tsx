import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Loader2, AlertCircle, Clock, 
  MapPin, Mail, CheckCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useLocations, useCreateLocation, useUpdateLocation } from '@/hooks';
import { locationService } from '@/api';
import type { OpeningHours } from '@/types/dashboard';
import { parseAPIError, getUserFriendlyErrorMessage } from '@/lib/apiError';
import { SingleImageUpload } from '@/components/common';
import type { SingleImageUploadValue } from '@/components/common/SingleImageUpload';
import { ColorPicker } from '@/components/ui';
import { fetchPostalCodeData } from '@/utils/postalCode';

const defaultHours: OpeningHours = {
  monday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
  tuesday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
  wednesday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
  thursday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
  friday: { isOpen: true, openTime: '09:00', closeTime: '23:00' },
  saturday: { isOpen: true, openTime: '10:00', closeTime: '23:00' },
  sunday: { isOpen: true, openTime: '10:00', closeTime: '21:00' }
};

const dayNames: Record<keyof OpeningHours, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
};

const LocationFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const { business } = useAuthStore();
  
  // React Query hooks
  const { data: locationsData } = useLocations();
  const location = isEditMode ? locationsData?.locations.find(loc => loc.id === id) : null;
  
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    phone: '',
    email: '',
    isActive: true,
    openingHours: defaultHours,
    contactContent: '',
    contactImage: '',
    contactImageFile: undefined as File | undefined,
    mapEmbedUrl: '',
    brandColor: '#ee6620'
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  
  // Postal code API state
  const [loadingPincode, setLoadingPincode] = useState(false);
  const [pincodeError, setPincodeError] = useState('');
  
  // Section expand/collapse state
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    openingHours: true,
    contactPage: true,
    brandCustomization: true,
  });
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Load existing data in edit mode
  useEffect(() => {
    if (isEditMode && location) {
      // Ensure openingHours has all days with proper structure
      const mergedOpeningHours = { ...defaultHours };
      if (location.openingHours && typeof location.openingHours === 'object') {
        Object.keys(defaultHours).forEach((day) => {
          const dayKey = day as keyof OpeningHours;
          const locationDayHours = (location.openingHours as any)?.[dayKey];
          if (locationDayHours) {
            mergedOpeningHours[dayKey] = {
              isOpen: locationDayHours.isOpen ?? defaultHours[dayKey].isOpen,
              openTime: locationDayHours.openTime || defaultHours[dayKey].openTime,
              closeTime: locationDayHours.closeTime || defaultHours[dayKey].closeTime,
            };
          }
        });
      }

      setFormData({
        name: location.name,
        slug: location.slug,
        address: location.address,
        city: location.city,
        state: location.state,
        zipCode: location.zipCode,
        country: location.country,
        phone: location.phone,
        email: location.email,
        isActive: location.isActive,
        openingHours: mergedOpeningHours,
        contactContent: location.contactContent || '',
        contactImage: location.contactImage || '',
        contactImageFile: undefined,
        mapEmbedUrl: location.mapEmbedUrl || '',
        brandColor: location.brandColor || '#ee6620'
      });
      setSlugTouched(true); // Slug is already set in edit mode
    }
  }, [isEditMode, location]);

  // Auto-generate slug from name and city (only in create mode)
  useEffect(() => {
    if (!isEditMode && !slugTouched && formData.name && formData.city) {
      const generatedSlug = locationService.generateSlug(formData.name, formData.city);
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, formData.city, slugTouched, isEditMode]);

  // Check slug availability
  useEffect(() => {
    if (!formData.slug || formData.slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setCheckingSlug(true);
      try {
        const result = await locationService.checkSlug(formData.slug, isEditMode ? id : undefined);
        setSlugAvailable(result.available);
      } catch {
        setSlugAvailable(null);
      } finally {
        setCheckingSlug(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.slug, isEditMode, id]);

  // Handle postal code change and fetch location data (for Indian pincodes)
  const handleZipCodeChange = async (value: string) => {
    const cleanValue = value.replace(/\D/g, ''); // Remove non-digits
    setFormData(prev => ({ ...prev, zipCode: cleanValue }));
    setPincodeError('');

    // Only fetch if we have 6 digits (try for Indian pincodes)
    if (cleanValue.length === 6) {
      setLoadingPincode(true);
      try {
        const postalData = await fetchPostalCodeData(cleanValue);
        if (postalData) {
          // If successful, auto-set country to India and fill city/state
          setFormData(prev => ({
            ...prev,
            country: 'India',
            city: postalData.district || postalData.city || prev.city,
            state: postalData.state || prev.state,
          }));
          setPincodeError('');
        } else {
          // Only show error if country is India, otherwise it might be a non-Indian postal code
          if (formData.country.toLowerCase() === 'india') {
            setPincodeError('Invalid pincode. Please enter a valid 6-digit Indian pincode.');
          }
          // Don't clear city/state if user manually entered them
        }
      } catch (error) {
        console.error('Error fetching postal code:', error);
        if (formData.country.toLowerCase() === 'india') {
          setPincodeError('Unable to fetch location details. Please enter manually.');
        }
      } finally {
        setLoadingPincode(false);
      }
    } else if (cleanValue.length > 6) {
      // Prevent entering more than 6 digits for Indian pincodes
      if (formData.country.toLowerCase() === 'india') {
        setFormData(prev => ({ ...prev, zipCode: cleanValue.slice(0, 6) }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!business?.id) {
      setErrorMessage('Business ID is missing. Please refresh the page.');
      return;
    }

    if (!isEditMode && !slugAvailable) {
      setErrorMessage('Please choose an available slug for your location');
      return;
    }

    setErrorMessage(null);

    const locationData = {
      businessId: business.id,
      name: formData.name.trim(),
      slug: isEditMode ? undefined : formData.slug?.trim(), // Don't send slug in edit mode
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      zipCode: formData.zipCode.trim(),
      country: formData.country.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      isActive: formData.isActive,
      openingHours: formData.openingHours as unknown as Record<string, { isOpen: boolean; openTime: string; closeTime: string; }>,
      contactContent: formData.contactContent?.trim() || undefined,
      contactImage: formData.contactImageFile || formData.contactImage?.trim() || undefined,
      mapEmbedUrl: formData.mapEmbedUrl?.trim() || undefined,
      brandColor: formData.brandColor || undefined
    };

    if (isEditMode) {
      updateLocation.mutate(
        { id: id!, data: locationData },
        {
          onSuccess: () => {
            navigate('/dashboard/locations');
          },
          onError: (error) => {
            console.error('Update location error:', error);
            const apiError = parseAPIError(error);
            setErrorMessage(getUserFriendlyErrorMessage(apiError));
          },
        }
      );
    } else {
      createLocation.mutate(locationData, {
        onSuccess: () => {
          navigate('/dashboard/locations');
        },
        onError: (error) => {
          console.error('Create location error:', error);
          const apiError = parseAPIError(error);
          setErrorMessage(getUserFriendlyErrorMessage(apiError));
        },
      });
    }
  };

  const updateOpeningHours = (day: keyof OpeningHours, field: 'isOpen' | 'openTime' | 'closeTime', value: boolean | string) => {
    setFormData(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleContactImageChange = (value: SingleImageUploadValue) => {
    setFormData(prev => ({
      ...prev,
      contactImage: value.preview,
      contactImageFile: value.file
    }));
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/locations')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Locations</span>
        </button>
        <h1 className="text-3xl font-bold text-dark-900 font-serif">
          {isEditMode ? 'Edit Location' : 'Add New Location'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode ? 'Update location details and settings' : 'Create a new restaurant location'}
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{errorMessage}</p>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <button
            type="button"
            onClick={() => toggleSection('basicInfo')}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <MapPin className="w-5 h-5 text-primary-600" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold text-dark-900 font-serif">Basic Information</h2>
                <p className="text-sm text-gray-600 mt-0.5">Location details and contact information</p>
              </div>
            </div>
            {expandedSections.basicInfo ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          {expandedSections.basicInfo && (
            <div className="px-6 pb-6 space-y-5">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="e.g., Downtown Branch"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Slug {isEditMode ? '' : '*'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => {
                    setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') });
                    setSlugTouched(true);
                  }}
                  className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none ${
                    slugAvailable === false ? 'border-red-300 bg-red-50' : 
                    slugAvailable === true ? 'border-green-300 bg-green-50' : 
                    'border-gray-300'
                  }`}
                  placeholder="e.g., downtown-branch-nyc"
                  required={!isEditMode}
                  disabled={isEditMode}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {checkingSlug && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
                  {!checkingSlug && !isEditMode && slugAvailable === true && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {!checkingSlug && !isEditMode && slugAvailable === false && <AlertCircle className="w-5 h-5 text-red-500" />}
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Public URL: <span className="font-mono text-primary-600">/{formData.slug || 'your-slug'}</span>
                {isEditMode && <span className="text-amber-600 ml-2">(Cannot be changed after creation)</span>}
              </p>
              {!isEditMode && slugAvailable === false && (
                <p className="mt-1 text-xs text-red-600">This slug is already taken. Please choose another.</p>
              )}
              {!isEditMode && slugAvailable === true && (
                <p className="mt-1 text-xs text-green-600">✓ This slug is available!</p>
              )}
            </div>

            <div className="space-y-4">
              {/* Pincode and City */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => handleZipCodeChange(e.target.value)}
                      maxLength={6}
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
                        pincodeError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter 6-digit pincode"
                      required
                    />
                    {loadingPincode && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                      </div>
                    )}
                  </div>
                  {pincodeError && (
                    <p className="mt-1 text-xs text-red-600">{pincodeError}</p>
                  )}
                  {formData.zipCode.length === 6 && !loadingPincode && !pincodeError && (
                    <p className="mt-1 text-xs text-green-600">✓ Location details fetched</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="City"
                    required
                  />
                </div>
              </div>

              {/* State and Country */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="State"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => {
                      const newCountry = e.target.value;
                      setFormData({ ...formData, country: newCountry });
                      // Clear pincode error when country changes
                      if (newCountry.toLowerCase() !== 'india') {
                        setPincodeError('');
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="Country"
                    required
                  />
                </div>
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g., 123 Main Street, Building Name"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Location is active</span>
              </label>
            </div>
            </div>
          )}
        </motion.div>

        {/* Opening Hours Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <button
            type="button"
            onClick={() => toggleSection('openingHours')}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Clock className="w-5 h-5 text-primary-600" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold text-dark-900 font-serif">Opening Hours</h2>
                <p className="text-sm text-gray-600 mt-0.5">Set your business hours for each day of the week</p>
              </div>
            </div>
            {expandedSections.openingHours ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          {expandedSections.openingHours && (
            <div className="px-6 pb-6 space-y-5">
            
            <div className="space-y-3">
              {(Object.keys(dayNames) as Array<keyof OpeningHours>).map((day) => {
                const dayHours = formData.openingHours?.[day] || { isOpen: false, openTime: '09:00', closeTime: '22:00' };
                return (
                  <div key={day} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-24">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dayHours.isOpen}
                          onChange={(e) => updateOpeningHours(day, 'isOpen', e.target.checked)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-gray-700">{dayNames[day]}</span>
                      </label>
                    </div>
                    {dayHours.isOpen ? (
                      <div className="flex-1 flex items-center space-x-3">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Open Time</label>
                          <input
                            type="time"
                            value={dayHours.openTime || '09:00'}
                            onChange={(e) => updateOpeningHours(day, 'openTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                          />
                        </div>
                        <span className="text-gray-400 mt-6">-</span>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Close Time</label>
                          <input
                            type="time"
                            value={dayHours.closeTime || '22:00'}
                            onChange={(e) => updateOpeningHours(day, 'closeTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 text-sm text-gray-500">Closed</div>
                    )}
                  </div>
                );
              })}
            </div>
            </div>
          )}
        </motion.div>

        {/* Contact Page Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <button
            type="button"
            onClick={() => toggleSection('contactPage')}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Mail className="w-5 h-5 text-primary-600" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold text-dark-900 font-serif">Contact Page</h2>
                <p className="text-sm text-gray-600 mt-0.5">Customize the content for your public contact page</p>
              </div>
            </div>
            {expandedSections.contactPage ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          {expandedSections.contactPage && (
            <div className="px-6 pb-6 space-y-5">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Page Content
              </label>
              <textarea
                value={formData.contactContent}
                onChange={(e) => setFormData({ ...formData, contactContent: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                rows={6}
                placeholder="Additional information for your contact page (e.g., directions, parking info, special instructions)"
              />
              <p className="mt-1 text-xs text-gray-500">You can use basic HTML formatting or plain text.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Page Hero Image
              </label>
              <div className="max-w-2xl">
                <SingleImageUpload
                  image={formData.contactImage}
                  onChange={handleContactImageChange}
                  label="Upload hero image for contact page"
                  maxSizeMB={10}
                  aspectRatio="aspect-video"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Upload a hero image for your Contact page. Recommended size: 1920x1080px. Max size: 10MB.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Map Embed URL
              </label>
              <input
                type="url"
                value={formData.mapEmbedUrl}
                onChange={(e) => setFormData({ ...formData, mapEmbedUrl: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Get embed URL from Google Maps: Share → Embed a map → Copy HTML src URL
              </p>
            </div>
            </div>
          )}
        </motion.div>

        {/* Brand Customization Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <button
            type="button"
            onClick={() => toggleSection('brandCustomization')}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-dark-900 font-serif">Brand Customization</h3>
                <p className="text-sm text-gray-600 mt-0.5">Choose your brand color for public menu pages</p>
              </div>
            </div>
            {expandedSections.brandCustomization ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          {expandedSections.brandCustomization && (
            <div className="px-6 pb-6 space-y-5">
              <p className="text-sm text-gray-600">
                Select a brand color that will be applied to your public menu pages. This color will be used for buttons, links, and other accent elements.
              </p>
              <ColorPicker
                label="Brand Color"
                value={formData.brandColor}
                onChange={(color) => setFormData({ ...formData, brandColor: color })}
              />
            </div>
          )}
        </motion.div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/locations')}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createLocation.isPending || updateLocation.isPending || (!isEditMode && !slugAvailable)}
            className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg text-sm font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {(createLocation.isPending || updateLocation.isPending) && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            <span>{isEditMode ? 'Update' : 'Create'} Location</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default LocationFormPage;

