import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, ArrowRight, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { locationService } from '../../api';
import { useCreateLocation } from '../../hooks';
import type { OpeningHours } from '../../types/dashboard';
import { fetchPostalCodeData } from '../../utils/postalCode';

const defaultHours: OpeningHours = {
  monday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
  tuesday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
  wednesday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
  thursday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
  friday: { isOpen: true, openTime: '09:00', closeTime: '23:00' },
  saturday: { isOpen: true, openTime: '10:00', closeTime: '23:00' },
  sunday: { isOpen: true, openTime: '10:00', closeTime: '21:00' }
};

const LocationSetupPage = () => {
  const navigate = useNavigate();
  const { business } = useAuthStore();
  const createLocation = useCreateLocation();
  const [locationName, setLocationName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('India');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  // Postal code API state
  const [loadingPincode, setLoadingPincode] = useState(false);
  const [pincodeError, setPincodeError] = useState('');

  // Restore address fields from localStorage (from business setup)
  useEffect(() => {
    const savedAddress = localStorage.getItem('business-setup-address');
    if (savedAddress) {
      try {
        const addressData = JSON.parse(savedAddress);
        if (addressData.address) setAddress(addressData.address);
        if (addressData.city) setCity(addressData.city);
        if (addressData.state) setState(addressData.state);
        if (addressData.pincode) setZipCode(addressData.pincode);
        if (addressData.country) setCountry(addressData.country);
      } catch (error) {
        console.error('Error parsing saved address data:', error);
      }
    }
  }, []);

  // Auto-generate slug from name and city
  useEffect(() => {
    if (!slugTouched && locationName) {
      const generatedSlug = locationService.generateSlug(locationName, city);
      setSlug(generatedSlug);
    }
  }, [locationName, city, slugTouched]);

  // Handle postal code change and fetch location data (for Indian pincodes)
  const handleZipCodeChange = async (value: string) => {
    const cleanValue = value.replace(/\D/g, ''); // Remove non-digits
    setZipCode(cleanValue);
    setPincodeError('');

    // Only fetch if we have 6 digits (try for Indian pincodes)
    if (cleanValue.length === 6) {
      setLoadingPincode(true);
      try {
        const postalData = await fetchPostalCodeData(cleanValue);
        if (postalData) {
          // If successful, auto-set country to India and fill city/state
          setCountry('India');
          setCity(postalData.district || postalData.city || city);
          setState(postalData.state || state);
          setPincodeError('');
        } else {
          // Only show error if country is India, otherwise it might be a non-Indian postal code
          if (country.toLowerCase() === 'india') {
            setPincodeError('Invalid pincode. Please enter a valid 6-digit Indian pincode.');
          }
        }
      } catch (error) {
        console.error('Error fetching postal code:', error);
        if (country.toLowerCase() === 'india') {
          setPincodeError('Unable to fetch location details. Please enter manually.');
        }
      } finally {
        setLoadingPincode(false);
      }
    } else if (cleanValue.length > 6) {
      // Prevent entering more than 6 digits for Indian pincodes
      if (country.toLowerCase() === 'india') {
        setZipCode(cleanValue.slice(0, 6));
      }
    }
  };

  // Check slug availability
  useEffect(() => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setCheckingSlug(true);
      try {
        const result = await locationService.checkSlug(slug);
        setSlugAvailable(result.available);
      } catch {
        setSlugAvailable(null);
      } finally {
        setCheckingSlug(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!slugAvailable) {
      alert('Please choose an available slug for your location');
      return;
    }

    if (!business?.id) {
      alert('Business information is missing. Please go back and complete business setup.');
      return;
    }

    const locationData = {
      businessId: business.id,
      name: locationName.trim(),
      slug: slug.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      country: country.trim(),
      phone: phone.trim(),
      email: email.trim(),
      openingHours: defaultHours as unknown as Record<string, { isOpen: boolean; openTime: string; closeTime: string }>,
      isActive: true,
    };

    createLocation.mutate(locationData, {
      onSuccess: (response) => {
        // Update auth store with the new location
        const { setCurrentLocation } = useAuthStore.getState();
        setCurrentLocation(response.location);
        // Clear temporary business setup address data from localStorage
        localStorage.removeItem('business-setup-address');
        navigate('/dashboard');
      },
      onError: (error) => {
        console.error('Location setup error:', error);
        alert('Failed to create location. Please try again.');
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-primary-600"></div>
            <div className="w-16 h-1 bg-primary-600"></div>
            <div className="w-3 h-3 rounded-full bg-primary-600"></div>
            <div className="w-16 h-1 bg-primary-200"></div>
            <div className="w-3 h-3 rounded-full bg-primary-200"></div>
          </div>
          <p className="text-center text-sm text-gray-600">Step 2 of 3: First Location</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
              <MapPin className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-dark-900 mb-2 font-serif">Add Your First Location</h1>
            <p className="text-gray-600">Enter the details for your restaurant location</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Name *
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="e.g., Downtown Branch"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Public URL Slug *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                    setSlugTouched(true);
                  }}
                  className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none ${
                    slugAvailable === false ? 'border-red-300 bg-red-50' : 
                    slugAvailable === true ? 'border-green-300 bg-green-50' : 
                    'border-gray-300'
                  }`}
                  placeholder="e.g., downtown-branch-nyc"
                  pattern="[a-z0-9-]+"
                  minLength={3}
                  maxLength={50}
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {checkingSlug && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
                  {!checkingSlug && slugAvailable === true && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {!checkingSlug && slugAvailable === false && <XCircle className="w-5 h-5 text-red-500" />}
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Your menu will be available at: <span className="font-mono text-primary-600">menulogs.com/{slug || 'your-slug'}</span>
              </p>
              {slugAvailable === false && (
                <p className="mt-1 text-xs text-red-600">This slug is already taken. Please choose another.</p>
              )}
              {slugAvailable === true && (
                <p className="mt-1 text-xs text-green-600">✓ This slug is available!</p>
              )}
            </div>

            {/* Address Fields - Arranged as per previous structure */}
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
                      value={zipCode}
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
                  {zipCode.length === 6 && !loadingPincode && !pincodeError && (
                    <p className="mt-1 text-xs text-green-600">✓ Location details fetched</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
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
                    value={state}
                    onChange={(e) => setState(e.target.value)}
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
                    value={country}
                    onChange={(e) => {
                      const newCountry = e.target.value;
                      setCountry(newCountry);
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
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g., 123 Main Street, Building Name"
                  required
                />
              </div>
            </div>

            {/* Contact */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="+91 99999-12345"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="location@restaurant.com"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Opening Hours</p>
                  <p>Default hours have been set (9 AM - 10 PM). You can customize them later in the dashboard.</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/business-setup')}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={createLocation.isPending || !slugAvailable}
                className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
              >
                <span>{createLocation.isPending ? 'Creating...' : 'Complete Setup'}</span>
                {!createLocation.isPending && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LocationSetupPage;

