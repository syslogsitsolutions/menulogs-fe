import { create } from 'zustand';
import type { Category, DashboardMenuItem, Banner, Analytics } from '../types/dashboard';
import { analyticsService } from '../api';

interface DashboardState {
  categories: Category[];
  menuItems: DashboardMenuItem[];
  banners: Banner[];
  analytics: Analytics | null;
  isLoading: boolean;

  // Category Actions
  fetchCategories: (locationId: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Menu Item Actions
  fetchMenuItems: (locationId: string) => Promise<void>;
  addMenuItem: (item: Omit<DashboardMenuItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMenuItem: (id: string, data: Partial<DashboardMenuItem>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  reorderMenuItems: (items: DashboardMenuItem[]) => Promise<void>;

  // Banner Actions
  fetchBanners: (locationId: string) => Promise<void>;
  addBanner: (banner: Omit<Banner, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBanner: (id: string, data: Partial<Banner>) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  reorderBanners: (banners: Banner[]) => Promise<void>;

  // Analytics
  fetchAnalytics: (locationId: string) => Promise<void>;
}

// Mock data generators
const generateMockCategories = (locationId: string): Category[] => [
  {
    id: 'cat-1',
    locationId,
    name: 'Starters',
    description: 'Begin your culinary journey',
    image: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=800&h=600&fit=crop',
    icon: 'ChefHat',
    isVisible: true,
    sortOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat-2',
    locationId,
    name: 'Main Course',
    description: 'Our signature dishes',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
    icon: 'Utensils',
    isVisible: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const generateMockMenuItems = (locationId: string): DashboardMenuItem[] => [
  {
    id: 'item-1',
    locationId,
    categoryId: 'cat-1',
    name: 'Truffle Burrata',
    description: 'Creamy burrata cheese with black truffle',
    price: 24,
    image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&h=600&fit=crop',
    images: ['https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&h=600&fit=crop'],
    ingredients: ['Burrata', 'Black truffle', 'Tomatoes'],
    allergens: ['Dairy'],
    tags: ['Popular', 'Premium'],
    isVegetarian: true,
    availability: 'IN_STOCK', 
    sortOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const generateMockBanners = (locationId: string): Banner[] => [
  {
    id: 'banner-1',
    locationId,
    title: 'Special Weekend Offer',
    subtitle: '20% off on all main courses',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&h=600&fit=crop',
    isActive: true,
    sortOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const generateMockAnalytics = (): Analytics => ({
  totalViews: 12543,
  popularItems: [
    { itemId: 'item-1', itemName: 'Truffle Burrata', views: 1245, orders: 342 },
    { itemId: 'item-2', itemName: 'Wagyu Steak', views: 1102, orders: 298 }
  ],
  categoryPerformance: [
    { categoryId: 'cat-1', categoryName: 'Starters', views: 3421, items: 8 },
    { categoryId: 'cat-2', categoryName: 'Main Course', views: 5632, items: 12 }
  ],
  recentActivity: [
    { id: '1', type: 'view', description: 'Menu viewed by customer', timestamp: new Date().toISOString() },
    { id: '2', type: 'update', description: 'Updated Truffle Burrata price', timestamp: new Date().toISOString() }
  ],
  periodComparison: {
    viewsChange: 12.5,
    ordersChange: 8.3,
    revenueChange: 15.7
  }
});

export const useDashboardStore = create<DashboardState>((set, get) => ({
  categories: [],
  menuItems: [],
  banners: [],
  analytics: null,
  isLoading: false,

  // Categories
  fetchCategories: async (locationId: string) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ categories: generateMockCategories(locationId), isLoading: false });
  },

  addCategory: async (category) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set({ categories: [...get().categories, newCategory], isLoading: false });
  },

  updateCategory: async (id, data) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({
      categories: get().categories.map(cat =>
        cat.id === id ? { ...cat, ...data, updatedAt: new Date().toISOString() } : cat
      ),
      isLoading: false
    });
  },

  deleteCategory: async (id) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({
      categories: get().categories.filter(cat => cat.id !== id),
      isLoading: false
    });
  },

  // Menu Items
  fetchMenuItems: async (locationId: string) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ menuItems: generateMockMenuItems(locationId), isLoading: false });
  },

  addMenuItem: async (item) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    const newItem: DashboardMenuItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set({ menuItems: [...get().menuItems, newItem], isLoading: false });
  },

  updateMenuItem: async (id, data) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({
      menuItems: get().menuItems.map(item =>
        item.id === id ? { ...item, ...data, updatedAt: new Date().toISOString() } : item
      ),
      isLoading: false
    });
  },

  deleteMenuItem: async (id) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({
      menuItems: get().menuItems.filter(item => item.id !== id),
      isLoading: false
    });
  },

  reorderMenuItems: async (items) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 300));
    set({ menuItems: items, isLoading: false });
  },

  // Banners
  fetchBanners: async (locationId: string) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ banners: generateMockBanners(locationId), isLoading: false });
  },

  addBanner: async (banner) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    const newBanner: Banner = {
      ...banner,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set({ banners: [...get().banners, newBanner], isLoading: false });
  },

  updateBanner: async (id, data) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({
      banners: get().banners.map(banner =>
        banner.id === id ? { ...banner, ...data, updatedAt: new Date().toISOString() } : banner
      ),
      isLoading: false
    });
  },

  deleteBanner: async (id) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({
      banners: get().banners.filter(banner => banner.id !== id),
      isLoading: false
    });
  },

  reorderBanners: async (banners) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 300));
    set({ banners, isLoading: false });
  },

  // Analytics
  fetchAnalytics: async (locationId: string) => {
    set({ isLoading: true });
    try {
      const analyticsData = await analyticsService.getAnalytics(locationId);
      
      // Transform API response to match Analytics interface
      const analytics: Analytics = {
        totalViews: analyticsData.totalViews,
        totalOrders: analyticsData.totalOrders,
        totalRevenue: analyticsData.totalRevenue,
        averageOrderValue: analyticsData.averageOrderValue,
        popularItems: analyticsData.popularItems.map(item => ({
          itemId: item.itemId,
          itemName: item.itemName,
          views: item.views,
          orders: item.orders,
        })),
        categoryPerformance: analyticsData.categoryPerformance.map(cat => ({
          categoryId: cat.categoryId,
          categoryName: cat.categoryName,
          views: cat.views,
          items: cat.items,
          orders: cat.orders,
          revenue: cat.revenue,
        })),
        recentActivity: analyticsData.recentActivity.map(activity => ({
          id: activity.id,
          type: activity.type,
          description: activity.description,
          timestamp: activity.timestamp,
        })),
        periodComparison: analyticsData.periodComparison,
        viewsData: analyticsData.viewsData,
        categoryOrderData: analyticsData.categoryOrderData,
      };
      
      set({ analytics, isLoading: false });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Fallback to mock data on error
      set({ analytics: generateMockAnalytics(), isLoading: false });
    }
  }
}));

