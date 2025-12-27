/**
 * Analytics API Service
 * Handles all analytics and reporting-related API calls
 */

import apiClient from '../lib/apiClient';

// Types matching backend response
export interface PopularItem {
  itemId: string;
  itemName: string;
  views: number;
  orders: number;
}

export interface CategoryPerformance {
  categoryId: string;
  categoryName: string;
  views: number;
  items: number;
  orders?: number;
  revenue?: number;
}

export interface RecentActivity {
  id: string;
  type: 'view' | 'order' | 'update';
  description: string;
  timestamp: string;
}

export interface PeriodComparison {
  viewsChange: number;
  ordersChange: number;
  revenueChange: number;
}

export interface ViewsChartData {
  name: string;
  views: number;
  orders: number;
}

export interface CategoryOrderChartData {
  name: string;
  orders: number;
  revenue: number;
}

export interface AnalyticsResponse {
  totalViews: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  popularItems: PopularItem[];
  categoryPerformance: CategoryPerformance[];
  recentActivity: RecentActivity[];
  periodComparison: PeriodComparison;
  viewsData: ViewsChartData[];
  categoryOrderData: CategoryOrderChartData[];
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  period?: '7d' | '30d' | '90d' | '1y';
}

export interface AnalyticsApiResponse {
  success: boolean;
  data: AnalyticsResponse;
}

class AnalyticsService {
  /**
   * Get analytics for a location
   * @param locationId - Location ID
   * @param filters - Optional filters (startDate, endDate)
   */
  async getAnalytics(
    locationId: string,
    filters?: { startDate?: string; endDate?: string }
  ): Promise<AnalyticsResponse> {
    const params: Record<string, string> = {};
    
    if (filters?.startDate) {
      params.startDate = filters.startDate;
    }
    
    if (filters?.endDate) {
      params.endDate = filters.endDate;
    }

    const response = await apiClient.get<AnalyticsApiResponse>(
      `/analytics/locations/${locationId}`,
      { params }
    );
    
    return response.data.data;
  }

  /**
   * Get summary report for a location
   * @param locationId - Location ID
   * @param period - Time period (7d, 30d, 90d, 1y)
   */
  async getSummary(
    locationId: string,
    period: '7d' | '30d' | '90d' | '1y' = '7d'
  ): Promise<AnalyticsResponse & { period: string }> {
    const response = await apiClient.get<AnalyticsApiResponse & { data: AnalyticsResponse & { period: string } }>(
      `/analytics/locations/${locationId}/reports/summary`,
      { params: { period } }
    );
    
    return response.data.data;
  }
}

export default new AnalyticsService();

