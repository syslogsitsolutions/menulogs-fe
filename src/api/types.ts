/**
 * API Response Types
 * Type definitions for all API responses
 */

import type { User, Business, Location, Category, DashboardMenuItem, Banner as DashboardBanner, FeaturedSection as DashboardFeaturedSection, Subscription, Invoice } from '../types/dashboard';
import type { MenuCategory, MenuItem, Banner, FeaturedSection } from '../types/menu';

// Type aliases for dashboard
export type DashboardCategory = Category;
export type SubscriptionPlan = Subscription;
export type BillingHistory = Invoice;

// ==================== Auth ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  business?: Business;
  locations?: Location[];
  accessToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

// ==================== Business ====================

export interface BusinessRequest {
  name: string;
  logo?: string;
  description?: string;
  // Brand section fields
  brandDescription?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  // About page fields
  aboutContent?: string;
  aboutImage?: string;
}

export interface BusinessResponse {
  business: Business;
}

export interface BusinessListResponse {
  businesses: Business[];
}

// ==================== Location ====================

export interface LocationRequest {
  businessId: string;
  name: string;
  slug?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  isActive: boolean;
  openingHours: Record<string, {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  }>;
  // Contact page fields
  contactContent?: string;
  contactImage?: string;
  mapEmbedUrl?: string;
  googleReviewUrl?: string;
  // Brand customization
  brandColor?: string;
}

export interface SlugCheckResponse {
  available: boolean;
  slug: string;
  message?: string;
  error?: string;
}

export interface LocationResponse {
  location: Location;
}

export interface LocationListResponse {
  locations: Location[];
}

// ==================== Category ====================

export interface CategoryRequest {
  name: string;
  description?: string;
  image: string;
  icon?: string;
  isVisible?: boolean;
}

export interface CategoryResponse {
  category: DashboardCategory;
}

export interface CategoryListResponse {
  categories: DashboardCategory[];
}

// ==================== Menu Item ====================

export interface MenuItemRequest {
  categoryId: string;
  name: string;
  description: string;
  price: number;
  /** Main image URL or base64 data URL (should match images[0] if images array is provided) */
  image: string;
  /** Array of image URLs or base64 data URLs (max 3). Main image is at index 0 */
  images?: string[];
  video?: string;
  ingredients?: string[];
  allergens?: string[];
  tags?: string[];
  nutritionalInfo?: Record<string, unknown>;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  spicyLevel?: number;
  availability?: 'IN_STOCK' | 'OUT_OF_STOCK' | 'HIDDEN';
  preparationTime?: string;
}

export interface MenuItemResponse {
  menuItem: DashboardMenuItem;
}

export interface MenuItemListResponse {
  menuItems: DashboardMenuItem[];
}

// ==================== Banner ====================

export interface BannerRequest {
  title: string;
  subtitle?: string;
  image: string;
  video?: string;
  link?: string;
  isActive?: boolean;
}

export interface BannerResponse {
  banner: DashboardBanner;
}

export interface BannerListResponse {
  banners: DashboardBanner[];
}

// ==================== Featured Section ====================

export interface FeaturedSectionRequest {
  title: string;
  description?: string;
  image: string;
  features: Array<{ title: string; description: string }>;
  buttonText?: string;
  buttonLink?: string;
  imagePosition?: 'left' | 'right';
  isActive?: boolean;
}

export interface FeaturedSectionResponse {
  featuredSection: DashboardFeaturedSection;
}

export interface FeaturedSectionListResponse {
  featuredSections: DashboardFeaturedSection[];
}

// ==================== Subscription ====================

export interface PricingPlan {
  id: 'FREE' | 'STANDARD' | 'PROFESSIONAL' | 'CUSTOM';
  name: string;
  description?: string;
  price: number;
  priceYearly?: number;
  interval: 'MONTHLY' | 'YEARLY';
  features: {
    menuItems: number;
    categories: number;
    banners: number;
    featuredSections: number;
    analytics: string;
    support?: string;
    customDomain?: boolean;
    apiAccess?: boolean;
    whiteLabel?: boolean;
    multiLanguage?: boolean;
    menuVersioning?: boolean;
    abTesting?: boolean;
    customWorkflows?: boolean;
    sso?: boolean;
  };
  limits?: {
    menuItems: number;
    categories: number;
    banners: number;
    featuredSections: number;
    imageStorageBytes?: number;
    videoStorageBytes?: number;
    monthlyImageUploads?: number;
    monthlyVideoUploads?: number;
    teamMembers?: number;
  };
}

export interface CreateSubscriptionRequest {
  locationId: string;
  plan: 'FREE' | 'STANDARD' | 'PROFESSIONAL' | 'CUSTOM';
  billingCycle: 'MONTHLY' | 'YEARLY';
}

export interface ChangePlanRequest {
  plan: 'FREE' | 'STANDARD' | 'PROFESSIONAL' | 'CUSTOM';
  billingCycle?: 'MONTHLY' | 'YEARLY';
}

export interface SubscriptionResponse {
  subscription: SubscriptionPlan;
}

export interface PlansResponse {
  plans: PricingPlan[];
}

export interface BillingHistoryResponse {
  invoices: BillingHistory[];
}

export interface UsageResponse {
  usage: {
    plan: string;
    limits: {
      menuItems: number;
      categories: number;
      banners: number;
      featuredSections: number;
      imageStorageBytes: number;
      videoStorageBytes: number;
      monthlyImageUploads: number;
      monthlyVideoUploads: number;
      teamMembers: number;
    };
    current: {
      menuItems: number;
      categories: number;
      banners: number;
      featuredSections: number;
      storageBytes: number;
      monthlyImageUploads: number;
      monthlyVideoUploads: number;
    };
    percentages: {
      menuItems: number;
      categories: number;
      banners: number;
      featuredSections: number;
      storage: number;
      monthlyImageUploads: number;
      monthlyVideoUploads: number;
    };
    upgradeRecommended: boolean;
    warnings?: Array<{
      resource: string;
      percentage: number;
      message: string;
      upgradePlan?: string;
    }>;
    gracePeriod?: {
      isActive: boolean;
      endsAt?: string;
      status?: string;
    };
  };
}

export interface CheckoutResponse {
  checkout: {
    sessionId: string;
    amount: number;
    currency: string;
    plan: string;
    billingCycle: string;
    locationId: string;
    checkoutUrl: string;
  };
}

// ==================== Public API ====================

export interface PublicMenuResponse {
  location: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode?: string;
    phone: string;
    email: string;
    openingHours: Record<string, unknown>;
    brandColor?: string;
    mapEmbedUrl?: string;
    googleReviewUrl?: string;
    business: {
      name: string;
      logo: string;
      description: string;
      brandDescription?: string;
      facebookUrl?: string;
      instagramUrl?: string;
      twitterUrl?: string;
      linkedinUrl?: string;
      youtubeUrl?: string;
    };
  };
  categories: MenuCategory[];
  banners: Banner[];
  featuredSections?: FeaturedSection[];
}

export interface PublicMenuItemResponse {
  menuItem: MenuItem;
}

export interface PublicSearchResponse {
  results: MenuItem[];
  count: number;
}

export interface AboutPageResponse {
  location: {
    id: string;
    name: string;
    slug: string;
  };
  business: {
    id: string;
    name: string;
    logo: string | null;
    description: string | null;
    aboutContent: string | null;
    aboutImage: string | null;
  };
}

export interface ContactPageResponse {
  location: {
    id: string;
    name: string;
    slug: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
    email: string;
    openingHours: Record<string, unknown>;
    contactContent: string | null;
    contactImage: string | null;
    mapEmbedUrl: string | null;
  };
  business: {
    name: string;
    logo: string | null;
  };
}

// ==================== Payment ====================

export interface PaymentConfigResponse {
  keyId: string;
  currency: string;
}

export interface CreateOrderRequest {
  locationId: string;
  plan: 'STANDARD' | 'PROFESSIONAL' | 'CUSTOM';
  billingCycle: 'MONTHLY' | 'YEARLY';
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  order: {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
  };
  config: {
    keyId: string;
    name: string;
    description: string;
    prefill: {
      name: string;
      email: string;
    };
    theme: {
      color: string;
    };
  };
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  locationId: string;
  plan: 'STANDARD' | 'PROFESSIONAL' | 'CUSTOM';
  billingCycle: 'MONTHLY' | 'YEARLY';
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  subscription: {
    id: string;
    plan: string;
    status: string;
    startDate: string;
    endDate: string;
    nextBillingDate: string;
  };
}

export interface PaymentResponse {
  payment: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    method: string;
    createdAt: string;
    email?: string;
    contact?: string;
  };
}

export interface RefundRequest {
  paymentId: string;
  amount?: number;
  reason?: string;
}

export interface RefundResponse {
  success: boolean;
  message: string;
  refund: {
    id: string;
    amount: number;
    currency: string;
    status: string;
  };
}

// ==================== Payment Method ====================

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking' | 'wallet';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: string;
}

export interface PaymentMethodListResponse {
  paymentMethods: PaymentMethod[];
  count: number;
}

export interface PaymentMethodResponse {
  paymentMethod: PaymentMethod;
}

export interface AddPaymentMethodRequest {
  razorpayTokenId: string;
  type: 'card' | 'upi' | 'netbanking' | 'wallet';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
}

export interface AddPaymentMethodResponse {
  success: boolean;
  message: string;
  paymentMethod: {
    id: string;
    type: string;
    last4?: string;
    brand?: string;
    isDefault: boolean;
  };
}

// ==================== Common ====================

export interface MessageResponse {
  message: string;
}

// ==================== QR Code ====================

export interface QRCodeInfoResponse {
  url: string;
  location: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  };
}

export interface QRCodeDataURLResponse {
  dataUrl: string;
  url: string;
  location: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ErrorResponse {
  error: string;
  errors?: Array<{
    path: string[];
    message: string;
  }>;
}

// ==================== Pagination ====================

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

