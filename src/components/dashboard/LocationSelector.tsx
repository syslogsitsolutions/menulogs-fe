import { useState, useEffect } from 'react';
import { ChevronDown, MapPin, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useLocations } from '@/hooks';
import { useNavigate } from 'react-router-dom';

const LocationSelector = () => {
  const navigate = useNavigate();
  const { currentLocation, setCurrentLocation } = useAuthStore();
  const { data: locationsData, isLoading } = useLocations();
  const locations = locationsData?.locations || [];
  const [isOpen, setIsOpen] = useState(false);

  // Sync locations to authStore and auto-select first location if none selected
  useEffect(() => {
    if (locations.length > 0) {
      // Update locations in store
      useAuthStore.setState({ locations });
      
      // Auto-select first location if none selected
      const currentLoc = useAuthStore.getState().currentLocation;
      if (!currentLoc) {
        setCurrentLocation(locations[0]);
      } else {
        // Update currentLocation if it exists but might be stale
        const updatedCurrentLocation = locations.find(loc => loc.id === currentLoc.id);
        if (updatedCurrentLocation && updatedCurrentLocation !== currentLoc) {
          setCurrentLocation(updatedCurrentLocation);
        }
      }
    }
  }, [locations, setCurrentLocation]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MapPin className="w-5 h-5 text-primary-600" />
        <div className="text-left">
          <p className="text-xs text-gray-500">Location</p>
          <p className="text-sm font-semibold text-dark-900">
            {currentLocation?.name || 'Select Location'}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20 max-h-96 overflow-y-auto"
            >
              <div className="px-3 py-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Your Locations
                </p>
              </div>

              {locations.length === 0 && !isLoading && (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No locations found. Add your first location to get started.
                </div>
              )}
              
              {locations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => {
                    setCurrentLocation(location);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    currentLocation?.id === location.id ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <MapPin className={`w-5 h-5 mt-0.5 ${
                      currentLocation?.id === location.id ? 'text-primary-600' : 'text-gray-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${
                        currentLocation?.id === location.id ? 'text-primary-900' : 'text-dark-900'
                      }`}>
                        {location.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {location.address}, {location.city}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          location.subscriptionStatus === 'active'
                            ? 'bg-green-100 text-green-700'
                            : location.subscriptionStatus === 'trial'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {location.subscriptionStatus}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {location.subscriptionPlan}
                        </span>
                      </div>
                    </div>
                    {currentLocation?.id === location.id && (
                      <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                    )}
                  </div>
                </button>
              ))}

              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={() => {
                    navigate('/dashboard/locations?action=add');
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-primary-600 hover:bg-primary-50 transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Location</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LocationSelector;

