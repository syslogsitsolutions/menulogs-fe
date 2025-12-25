/**
 * Staff API Service
 * Handles all staff-related API calls
 */

import apiClient from '../lib/apiClient';

// Types
export type StaffRole = 'MANAGER' | 'CASHIER' | 'WAITER' | 'KITCHEN';

export interface Staff {
  id: string;
  locationId: string;
  userId?: string;
  name: string;
  email?: string;
  phone?: string;
  role: StaffRole;
  pin?: string;
  isActive: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  currentShift?: {
    id: string;
    clockIn: string;
    clockOut?: string;
  };
  stats?: {
    ordersToday: number;
    revenueToday: number;
    averageOrderValue: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface StaffShift {
  id: string;
  staffId: string;
  staff?: Staff;
  clockIn: string;
  clockOut?: string;
  notes?: string;
  duration?: number; // in minutes
  createdAt: string;
}

export interface CreateStaffDTO {
  name: string;
  email?: string;
  phone?: string;
  role: StaffRole;
  pin?: string;
}

export interface UpdateStaffDTO {
  name?: string;
  email?: string;
  phone?: string;
  role?: StaffRole;
  pin?: string;
  isActive?: boolean;
}

export interface StaffLoginDTO {
  locationId: string;
  pin: string;
}

export interface StaffListResponse {
  staff: Staff[];
  total: number;
}

export interface StaffResponse {
  message: string;
  staff: Staff;
}

export interface StaffLoginResponse {
  message: string;
  staff: Staff;
  token: string;
}

class StaffService {
  /**
   * Get all staff for a location
   */
  async getStaff(locationId: string, includeInactive = false): Promise<Staff[]> {
    const response = await apiClient.get<StaffListResponse>(
      `/locations/${locationId}/staff`,
      { params: { includeInactive } }
    );
    return response.data.staff;
  }

  /**
   * Get a single staff member by ID
   */
  async getStaffMember(staffId: string): Promise<Staff> {
    const response = await apiClient.get<{ staff: Staff }>(`/staff/${staffId}`);
    return response.data.staff;
  }

  /**
   * Create a new staff member
   */
  async createStaff(locationId: string, data: CreateStaffDTO): Promise<Staff> {
    const response = await apiClient.post<StaffResponse>(
      `/locations/${locationId}/staff`,
      data
    );
    return response.data.staff;
  }

  /**
   * Update a staff member
   */
  async updateStaff(staffId: string, data: UpdateStaffDTO): Promise<Staff> {
    const response = await apiClient.patch<StaffResponse>(
      `/staff/${staffId}`,
      data
    );
    return response.data.staff;
  }

  /**
   * Delete a staff member
   */
  async deleteStaff(staffId: string): Promise<void> {
    await apiClient.delete(`/staff/${staffId}`);
  }

  /**
   * Staff PIN login (for POS/mobile app)
   */
  async pinLogin(data: StaffLoginDTO): Promise<StaffLoginResponse> {
    const response = await apiClient.post<StaffLoginResponse>(
      '/staff/pin-login',
      data
    );
    return response.data;
  }

  /**
   * Clock in staff member
   */
  async clockIn(staffId: string): Promise<StaffShift> {
    const response = await apiClient.post<{ shift: StaffShift }>(
      `/staff/${staffId}/clock-in`
    );
    return response.data.shift;
  }

  /**
   * Clock out staff member
   */
  async clockOut(staffId: string, notes?: string): Promise<StaffShift> {
    const response = await apiClient.post<{ shift: StaffShift }>(
      `/staff/${staffId}/clock-out`,
      { notes }
    );
    return response.data.shift;
  }

  /**
   * Get staff shifts
   */
  async getShifts(staffId: string, startDate?: string, endDate?: string): Promise<StaffShift[]> {
    const response = await apiClient.get<{ shifts: StaffShift[] }>(
      `/staff/${staffId}/shifts`,
      { params: { startDate, endDate } }
    );
    return response.data.shifts;
  }

  /**
   * Get staff statistics
   */
  async getStaffStats(staffId: string, period: 'today' | 'week' | 'month' = 'today'): Promise<Staff['stats']> {
    const response = await apiClient.get<{ stats: Staff['stats'] }>(
      `/staff/${staffId}/stats`,
      { params: { period } }
    );
    return response.data.stats;
  }

  /**
   * Reset staff PIN
   */
  async resetPin(staffId: string, newPin: string): Promise<void> {
    await apiClient.patch(`/staff/${staffId}/pin`, { pin: newPin });
  }

  /**
   * Get staff orders
   */
  async getStaffOrders(staffId: string, filters?: { date?: string; status?: string }): Promise<unknown[]> {
    const response = await apiClient.get<{ orders: unknown[] }>(
      `/staff/${staffId}/orders`,
      { params: filters }
    );
    return response.data.orders;
  }

  /**
   * Generate random PIN
   */
  generatePin(length: 4 | 6 = 4): string {
    const min = length === 4 ? 1000 : 100000;
    const max = length === 4 ? 9999 : 999999;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
  }
}

export default new StaffService();

