import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, AlertCircle, Loader2, LogOut } from 'lucide-react';
import authService from '@/api/authService';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose?: () => void; // Optional since it's mandatory now
  isMandatory?: boolean; // If true, modal cannot be dismissed
}

export default function EmailVerificationModal({ 
  isOpen, 
  onClose, 
  isMandatory = true 
}: EmailVerificationModalProps) {
  const [isSending, setIsSending] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  if (!isOpen || !isAuthenticated || !user) {
    return null;
  }

  // Don't show if email is already verified
  if (user.emailVerified) {
    return null;
  }

  const handleClose = () => {
    if (!isMandatory && onClose) {
      onClose();
    }
  };

  const handleResendEmail = async () => {
    setIsSending(true);
    try {
      await authService.sendVerificationEmail();
      toast.success('Verification email sent! Please check your inbox.');
      // Don't fetch user data here - let the periodic check in DashboardLayout handle it
      // This prevents duplicate API calls
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to send verification email');
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      // Clear auth store
      useAuthStore.setState({
        user: null,
        business: null,
        locations: [],
        currentLocation: null,
        isAuthenticated: false,
      });
      // Navigate to login
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to logout');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative">
        {/* Close Button - Only show if not mandatory */}
        {!isMandatory && onClose && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
            Verify Your Email Address
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-center mb-4">
            We've sent a verification email to <strong className="text-gray-900">{user.email}</strong>.
            Please check your inbox and click the verification link to complete your account setup.
          </p>

          {/* Mandatory Notice */}
          {isMandatory && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-red-800 text-center">
                <strong>Email verification is required</strong> to access dashboard features.
              </p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-orange-800">
                  <strong>Didn't receive the email?</strong> Check your spam folder or click the button below to resend.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleResendEmail}
              disabled={isSending}
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  <span>Resend Verification Email</span>
                </>
              )}
            </button>

            {/* Only show "Verify later" button if not mandatory */}
            {!isMandatory && onClose && (
              <button
                onClick={handleClose}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                I'll verify later
              </button>
            )}

            {/* Logout button - Always available */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

