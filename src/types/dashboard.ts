export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Business {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  ownerId: string;
  createdAt: string;
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

export interface Location {
  id: string;
  businessId: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  openingHours: OpeningHours;
  isActive: boolean;
  subscriptionStatus: 'active' | 'inactive' | 'trial' | 'expired';
  subscriptionPlan: 'free' | 'standard' | 'professional' | 'custom';
  createdAt: string;
  // Contact page fields
  contactContent?: string;
  contactImage?: string;
  mapEmbedUrl?: string;
  // Brand customization
  brandColor?: string;

  trialEndsAt?: string;
}

export interface OpeningHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface Category {
  id: string;
  locationId: string;
  name: string;
  description: string;
  image: string;
  icon: string;
  isVisible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMenuItem {
  id: string;
  locationId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images: string[];
  video?: string;
  ingredients: string[];
  allergens: string[];
  tags: string[];
  nutritionalInfo?: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  spicyLevel?: number;
  preparationTime?: string;
  availability: 'IN_STOCK' | 'OUT_OF_STOCK' | 'HIDDEN';
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  locationId: string;
  title: string;
  subtitle?: string;
  image: string;
  video?: string;
  link?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeaturedSection {
  id: string;
  locationId: string;
  title: string;
  description?: string;
  image: string;
  features: Array<{ title: string; description: string }>;
  buttonText?: string;
  buttonLink?: string;
  imagePosition: 'left' | 'right';
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  totalViews: number;
  popularItems: {
    itemId: string;
    itemName: string;
    views: number;
    orders?: number;
  }[];
  categoryPerformance: {
    categoryId: string;
    categoryName: string;
    views: number;
    items: number;
  }[];
  recentActivity: {
    id: string;
    type: 'view' | 'order' | 'update';
    description: string;
    timestamp: string;
  }[];
  periodComparison: {
    viewsChange: number;
    ordersChange: number;
    revenueChange: number;
  };
}

export interface Subscription {
  id: string;
  locationId: string;
  plan: 'free' | 'standard' | 'professional' | 'custom';
  status: 'active' | 'inactive' | 'trial' | 'expired';
  billingCycle: 'monthly' | 'yearly';
  price: number;
  currency: string;
  nextBillingDate: string;
  startDate: string;
  endDate?: string;
  features: string[];
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  amount: number | string; // Can be Decimal from Prisma
  currency: string;
  status: 'PAID' | 'PENDING' | 'FAILED' | 'paid' | 'pending' | 'failed';
  dueDate: string;
  paidAt?: string | null;
  description: string;
  invoiceUrl?: string | null;
  razorpayInvoiceId?: string | null;
  razorpayPaymentId?: string | null;
  createdAt: string;
  updatedAt: string;
}

