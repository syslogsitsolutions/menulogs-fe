import { useState, useEffect, useMemo, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import EmailVerificationModal from '../../components/dashboard/EmailVerificationModal';
import { useAuthStore } from '../../store/authStore';
import authService from '../../api/authService';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, business, locations } = useAuthStore();
  const hasFetchedInitialData = useRef(false);
  const isCheckingVerification = useRef(false);

  // Fetch current user data when component mounts to ensure we have emailVerified status
  // Only fetch once on mount, and only if we don't already have complete user data
  useEffect(() => {
    // Early return if already fetched or not authenticated
    if (hasFetchedInitialData.current || !authService.isAuthenticated()) {
      return;
    }

    // Check if we already have complete user data with emailVerified
    const currentState = useAuthStore.getState();
    if (
      currentState.user?.emailVerified !== undefined &&
      currentState.business &&
      currentState.locations.length > 0
    ) {
      hasFetchedInitialData.current = true;
      return;
    }

    const fetchUserData = async () => {
      // Double-check to prevent concurrent calls
      if (hasFetchedInitialData.current) return;
      
      hasFetchedInitialData.current = true;
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser.user) {
          useAuthStore.setState({ 
            user: currentUser.user,
            business: currentUser.business || null,
            locations: currentUser.locations || []
          });
        }
      } catch (error) {
        // Ignore errors - user might not be authenticated or network issue
        console.error('Failed to fetch user data:', error);
        hasFetchedInitialData.current = false; // Reset on error to allow retry
      }
    };

    fetchUserData();
  }, []); // Run only once on mount - intentionally no dependencies to prevent re-fetching on store updates

  // Compute whether to show verification modal
  // Show verification modal if:
  // 1. User is authenticated
  // 2. User email is not verified (explicitly false or undefined)
  // 3. User has completed onboarding (has business and at least one location)
  const showVerificationModal = useMemo(() => {
    if (!user || !business || !locations || locations.length === 0) {
      return false;
    }
    
    // Show modal if emailVerified is explicitly false or undefined
    return user.emailVerified !== true;
  }, [user, business, locations]);

  // Periodically check email verification status (every 15 seconds when modal should be shown)
  // Only check if modal is actually showing (user is not verified)
  useEffect(() => {
    // Early return if modal shouldn't be shown or user is already verified
    if (!showVerificationModal || !user || user.emailVerified === true) {
      return;
    }

    const checkVerificationStatus = async () => {
      // Prevent multiple concurrent checks
      if (isCheckingVerification.current) return;
      isCheckingVerification.current = true;

      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser.user?.emailVerified) {
          // User verified, update store (modal will close automatically via useMemo)
          useAuthStore.setState({ user: currentUser.user });
        }
      } catch {
        // Ignore errors - user might not be authenticated or network issue
      } finally {
        isCheckingVerification.current = false;
      }
    };

    // Set up interval only (don't check immediately to avoid duplicate calls on mount)
    const interval = setInterval(checkVerificationStatus, 15000); // Check every 15 seconds
    
    return () => {
      clearInterval(interval);
      isCheckingVerification.current = false; // Reset on cleanup
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showVerificationModal, user?.id, user?.emailVerified]); // Only depend on stable user identifiers, not the whole user object

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Disable interaction when verification modal is shown */}
      <div className={showVerificationModal ? 'pointer-events-none opacity-50' : ''}>
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content - Disable interaction when verification modal is shown */}
      <div className={`flex-1 flex flex-col overflow-hidden ${showVerificationModal ? 'pointer-events-none opacity-50' : ''}`}>
        {/* Header */}
        <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Email Verification Modal - Mandatory, blocking */}
      <EmailVerificationModal
        isOpen={showVerificationModal}
        isMandatory={true}
      />
    </div>
  );
};

export default DashboardLayout;

