// Export all hooks

// Auth hooks
export { useLogin, useSignup, useLogout, useCurrentUser } from './useAuth';

// Business hooks
export { useBusiness, useBusinesses, useCreateBusiness, useUpdateBusiness, useDeleteBusiness } from './useBusiness';

// Location hooks
export { useLocations, useLocation, useCreateLocation, useUpdateLocation, useDeleteLocation } from './useLocations';

// Category hooks
export { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useToggleCategoryVisibility } from './useCategories';

// Menu Item hooks
export { useMenuItems, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem, useUpdateMenuItemAvailability } from './useMenuItems';

// Banner hooks
export { useBanners, useCreateBanner, useUpdateBanner, useDeleteBanner, useToggleBannerActive } from './useBanners';

// Featured Section hooks
export { useFeaturedSections, useCreateFeaturedSection, useUpdateFeaturedSection, useDeleteFeaturedSection, useToggleFeaturedSectionActive } from './useFeaturedSections';

// Public Menu hooks
export { usePublicMenu, usePublicMenuBySlug, usePublicCategoryItems, usePublicCategoryItemsBySlug, usePublicMenuItem } from './usePublicMenu';

// Payment hooks
export { usePayment, usePaymentConfig, useCreateOrder, useVerifyPayment, useOrder } from './usePayment';
export { usePaymentMethods, usePaymentMethod, useAddPaymentMethod, useSetDefaultPaymentMethod, useDeletePaymentMethod } from './usePaymentMethod';

// Subscription hooks
export { usePricingPlans, useSubscription, useCreateSubscription, useChangePlan, useCancelSubscription } from './useSubscription';

// Feature access hooks
export { useFeatureAccess, usePlanFeatures } from './useFeatureAccess';

// Socket.IO / Real-time hooks
export { useSocket } from './useSocket';
export { useOrderSocket } from './useOrderSocket';
export { useKitchenSocket } from './useKitchenSocket';
export { useTables } from './useTables';
export { useStaff } from './useStaff';

// Print hooks
export { useQZTray } from './useQZTray';

// Re-export types
export type { Order, KitchenOrder, OrderStatusChangedData } from '../types/order.types';
