import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Customer-facing pages
import Header from './components/Header';
import Footer from './components/Footer';
import BrandThemeInitializer from './components/BrandThemeInitializer';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import BusinessLandingPage from './pages/BusinessLandingPage';
import MenuListingPage from './pages/MenuListingPage';
import MenuItemDetailPage from './pages/MenuItemDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage';
import CookiePolicyPage from './pages/CookiePolicyPage';
import RefundPolicyPage from './pages/RefundPolicyPage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import BusinessSetupPage from './pages/auth/BusinessSetupPage';
import LocationSetupPage from './pages/auth/LocationSetupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Dashboard pages
import DashboardLayout from './pages/dashboard/DashboardLayout';
import OverviewPage from './pages/dashboard/OverviewPage';
import CategoriesPage from './pages/dashboard/CategoriesPage';
import MenuItemsPage from './pages/dashboard/MenuItemsPage';
import MenuItemFormPage from './pages/dashboard/MenuItemFormPage';
import BannersPage from './pages/dashboard/BannersPage';
import FeaturedSectionsPage from './pages/dashboard/FeaturedSectionsPage';
import LocationsPage from './pages/dashboard/LocationsPage';
import LocationFormPage from './pages/dashboard/LocationFormPage';
import SubscriptionPage from './pages/dashboard/SubscriptionPage';
import SettingsPage from './pages/dashboard/SettingsPage';

// POS & Order Management pages
import POSPage from './pages/dashboard/pos/POSPage';
import OrdersPage from './pages/dashboard/OrdersPage';
import KitchenDisplayPage from './pages/dashboard/KitchenDisplayPage';
import TablesPage from './pages/dashboard/TablesPage';
import StaffPage from './pages/dashboard/StaffPage';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Layout for customer-facing pages
const CustomerLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrandThemeInitializer>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    </BrandThemeInitializer>
  );
};

// Placeholder Dashboard Component (to be built) - kept for future use
export function DashboardPlaceholder() {
  const { user, business, currentLocation, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-dark-900 mb-6 font-serif">
          🎉 Welcome to Your Dashboard!
        </h1>
        <div className="space-y-4 mb-8">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">
              <strong>✅ Authentication Complete!</strong>
            </p>
            <p className="text-sm text-green-700 mt-2">
              User: {user?.name} ({user?.email})
            </p>
            {business && (
              <p className="text-sm text-green-700">
                Business: {business.name}
              </p>
            )}
            {currentLocation && (
              <p className="text-sm text-green-700">
                Location: {currentLocation.name}
              </p>
            )}
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-medium mb-2">
              🚧 Dashboard UI Coming Soon
            </p>
            <p className="text-sm text-blue-700">
              The dashboard pages are being built. You'll soon be able to manage:
            </p>
            <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
              <li>Categories</li>
              <li>Menu Items</li>
              <li>Banners & Promotions</li>
              <li>Analytics</li>
              <li>Subscriptions</li>
              <li>Multiple Locations</li>
            </ul>
          </div>
      </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 bg-primary-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors"
          >
            View Customer Menu
          </button>
          <button
            onClick={logout}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Logout
        </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <>
      <Routes>
        {/* Authentication Routes (No Header/Footer) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/business-setup" element={<BusinessSetupPage />} />
        <Route path="/location-setup" element={<LocationSetupPage />} />
        
        {/* Dashboard Routes (Protected) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<OverviewPage />} />
          {/* POS & Order Management */}
          <Route path="pos" element={<POSPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="kitchen" element={<KitchenDisplayPage />} />
          <Route path="tables" element={<TablesPage />} />
          <Route path="staff" element={<StaffPage />} />
          {/* Menu Management */}
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="menu-items" element={<MenuItemsPage />} />
          <Route path="menu-items/new" element={<MenuItemFormPage />} />
          <Route path="menu-items/:id/edit" element={<MenuItemFormPage />} />
          <Route path="banners" element={<BannersPage />} />
          <Route path="featured-sections" element={<FeaturedSectionsPage />} />
          {/* Business */}
          <Route path="locations" element={<LocationsPage />} />
          <Route path="locations/new" element={<LocationFormPage />} />
          <Route path="locations/:id/edit" element={<LocationFormPage />} />
          <Route path="subscription" element={<SubscriptionPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        
        {/* Customer-facing Routes */}
        {/* Home page - Restaurant selector */}
        <Route path="/" element={<HomePage />} />
        
        {/* Business Landing Page (B2B) */}
        <Route path="/business" element={<BusinessLandingPage />} />
        
        {/* Restaurant Menu Routes (slug-based) */}
        <Route path="/:slug" element={
          <CustomerLayout>
            <LandingPage />
          </CustomerLayout>
        } />
        <Route path="/:slug/category/:categoryId" element={
          <CustomerLayout>
            <MenuListingPage />
          </CustomerLayout>
        } />
        <Route path="/:slug/item/:itemId" element={
          <CustomerLayout>
            <MenuItemDetailPage />
          </CustomerLayout>
        } />
        <Route path="/:slug/about" element={
          <CustomerLayout>
            <AboutPage />
          </CustomerLayout>
        } />
        <Route path="/:slug/contact" element={
          <CustomerLayout>
            <ContactPage />
          </CustomerLayout>
        } />
        
        {/* Legal Pages (Platform-wide, no brand theme) */}
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
        <Route path="/cookie-policy" element={<CookiePolicyPage />} />
        <Route path="/refund-policy" element={<RefundPolicyPage />} />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

export default App;
