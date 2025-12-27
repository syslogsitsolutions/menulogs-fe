import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Business, Location } from '../types/dashboard';

interface AuthState {
  user: User | null;
  business: Business | null;
  locations: Location[];
  currentLocation: Location | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setupBusiness: (business: Omit<Business, 'id' | 'ownerId' | 'createdAt'>) => Promise<void>;
  addLocation: (location: Omit<Location, 'id' | 'businessId' | 'createdAt'>) => Promise<void>;
  setCurrentLocation: (locationId: string | Location) => void;
  updateLocation: (locationId: string, data: Partial<Location>) => Promise<void>;
  deleteLocation: (locationId: string) => Promise<void>;
}

// Mock API calls - replace with real API
const mockLogin = async (email: string, _password: string): Promise<{ user: User; business: Business; locations: Location[] }> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const user: User = {
    id: '1',
    name: 'John Doe',
    email,
    createdAt: new Date().toISOString()
  };
  
  const business: Business = {
    id: 'bus-1',
    name: 'Fine Dining Group',
    logo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop',
    description: 'Premium restaurant chain',
    ownerId: user.id,
    createdAt: new Date().toISOString()
  };
  
  const locations: Location[] = [
    {
      id: 'loc-1',
      businessId: business.id,
      slug: 'downtown-branch',
      name: 'Downtown Branch',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      phone: '+91 99999-12345',
      email: 'downtown@restaurant.com',
      openingHours: {
        monday: { isOpen: true, openTime: '11:00', closeTime: '22:00' },
        tuesday: { isOpen: true, openTime: '11:00', closeTime: '22:00' },
        wednesday: { isOpen: true, openTime: '11:00', closeTime: '22:00' },
        thursday: { isOpen: true, openTime: '11:00', closeTime: '22:00' },
        friday: { isOpen: true, openTime: '11:00', closeTime: '23:00' },
        saturday: { isOpen: true, openTime: '10:00', closeTime: '23:00' },
        sunday: { isOpen: true, openTime: '10:00', closeTime: '21:00' }
      },
      isActive: true,
      subscriptionStatus: 'active',
      subscriptionPlan: 'professional',
      createdAt: new Date().toISOString()
    }
  ];
  
  return { user, business, locations };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      business: null,
      locations: [],
      currentLocation: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const { user, business, locations } = await mockLogin(email, password);
          set({
            user,
            business,
            locations,
            currentLocation: locations[0] || null,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (name: string, email: string, _password: string) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 1000));
        const user: User = {
          id: Date.now().toString(),
          name,
          email,
          createdAt: new Date().toISOString()
        };
        set({ user, isLoading: false });
      },

      logout: () => {
        set({
          user: null,
          business: null,
          locations: [],
          currentLocation: null,
          isAuthenticated: false
        });
      },

      setupBusiness: async (businessData) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 1000));
        const business: Business = {
          id: Date.now().toString(),
          ...businessData,
          ownerId: get().user!.id,
          createdAt: new Date().toISOString()
        };
        set({ business, isLoading: false });
      },

      addLocation: async (locationData) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 1000));
        const location: Location = {
          id: Date.now().toString(),
          ...locationData,
          businessId: get().business!.id,
          createdAt: new Date().toISOString()
        };
        const locations = [...get().locations, location];
        set({
          locations,
          currentLocation: get().currentLocation || location,
          isLoading: false
        });
      },

      setCurrentLocation: (locationIdOrLocation: string | Location) => {
        // If it's already a Location object, use it directly
        if (typeof locationIdOrLocation === 'object' && locationIdOrLocation !== null) {
          set({ currentLocation: locationIdOrLocation });
          return;
        }
        
        // Otherwise, try to find it in locations array
        const locationId = locationIdOrLocation as string;
        const location = get().locations.find(loc => loc.id === locationId);
        if (location) {
          set({ currentLocation: location });
        } else {
          // If not found in store, set it anyway (it might be from API)
          // The component will handle fetching the full location data
          console.warn(`Location ${locationId} not found in store. Make sure locations are loaded.`);
        }
      },

      updateLocation: async (locationId: string, data: Partial<Location>) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));
        const locations = get().locations.map(loc =>
          loc.id === locationId ? { ...loc, ...data } : loc
        );
        const currentLocation = get().currentLocation?.id === locationId
          ? { ...get().currentLocation!, ...data }
          : get().currentLocation;
        set({ locations, currentLocation, isLoading: false });
      },

      deleteLocation: async (locationId: string) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));
        const locations = get().locations.filter(loc => loc.id !== locationId);
        const currentLocation = get().currentLocation?.id === locationId
          ? locations[0] || null
          : get().currentLocation;
        set({ locations, currentLocation, isLoading: false });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        business: state.business,
        locations: state.locations,
        currentLocation: state.currentLocation,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

