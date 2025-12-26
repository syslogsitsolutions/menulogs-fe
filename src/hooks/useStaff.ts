// React Hook for Staff Management
// Handles staff CRUD operations and real-time updates

import { useEffect, useState, useCallback } from 'react';
import { useSocket } from './useSocket';
import { staffService } from '../api';
import { toast } from 'react-hot-toast';
import type { Staff, CreateStaffDTO, UpdateStaffDTO, StaffRole } from '../api/staffService';

export function useStaff(locationId: string) {
  const { socket, isConnected } = useSocket({ locationId });
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load staff from API
  const loadStaff = useCallback(async () => {
    if (!locationId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await staffService.getStaff(locationId);
      setStaff(data);
    } catch (err: any) {
      console.error('Failed to load staff:', err);
      setError(err.response?.data?.error || 'Failed to load staff');
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  // Initial load
  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  // Listen for staff clock events via Socket.IO
  useEffect(() => {
    if (!socket) return;

    socket.on('staff:clock-in', (data: {
      staffId: string;
      staffName: string;
      locationId: string;
      timestamp: string;
    }) => {
      console.log('🕐 Staff clocked in:', data);
      
      // Reload staff to get updated shift status
      loadStaff();
      
      toast.success(`${data.staffName} clocked in`);
    });

    socket.on('staff:clock-out', (data: {
      staffId: string;
      staffName: string;
      locationId: string;
      timestamp: string;
    }) => {
      console.log('🕐 Staff clocked out:', data);
      
      // Reload staff to get updated shift status
      loadStaff();
      
      toast.success(`${data.staffName} clocked out`);
    });

    // Cleanup
    return () => {
      socket.off('staff:clock-in');
      socket.off('staff:clock-out');
    };
  }, [socket, loadStaff]);

  // Create staff
  const createStaff = useCallback(async (data: CreateStaffDTO): Promise<Staff | null> => {
    if (!locationId) {
      toast.error('No location selected');
      return null;
    }

    try {
      const newStaff = await staffService.createStaff(locationId, data);
      setStaff((prev) => [...prev, newStaff]);
      toast.success('Staff created successfully');
      return newStaff;
    } catch (err: any) {
      console.error('Failed to create staff:', err);
      toast.error(err.response?.data?.error || 'Failed to create staff');
      return null;
    }
  }, [locationId]);

  // Update staff
  const updateStaff = useCallback(async (staffId: string, data: UpdateStaffDTO): Promise<Staff | null> => {
    try {
      const updatedStaff = await staffService.updateStaff(staffId, data);
      setStaff((prev) =>
        prev.map((member) =>
          member.id === staffId ? updatedStaff : member
        )
      );
      toast.success('Staff updated successfully');
      return updatedStaff;
    } catch (err: any) {
      console.error('Failed to update staff:', err);
      toast.error(err.response?.data?.error || 'Failed to update staff');
      return null;
    }
  }, []);

  // Delete staff
  const deleteStaff = useCallback(async (staffId: string): Promise<boolean> => {
    try {
      await staffService.deleteStaff(staffId);
      setStaff((prev) => prev.filter((member) => member.id !== staffId));
      toast.success('Staff deleted successfully');
      return true;
    } catch (err: any) {
      console.error('Failed to delete staff:', err);
      toast.error(err.response?.data?.error || 'Failed to delete staff');
      return false;
    }
  }, []);

  // Clock in
  const clockIn = useCallback(async (staffId: string): Promise<boolean> => {
    try {
      await staffService.clockIn(staffId);
      // Socket will broadcast the update, but we can reload to get fresh data
      await loadStaff();
      return true;
    } catch (err: any) {
      console.error('Failed to clock in:', err);
      toast.error(err.response?.data?.error || 'Failed to clock in');
      return false;
    }
  }, [loadStaff]);

  // Clock out
  const clockOut = useCallback(async (staffId: string, notes?: string): Promise<boolean> => {
    try {
      await staffService.clockOut(staffId, notes);
      // Socket will broadcast the update, but we can reload to get fresh data
      await loadStaff();
      return true;
    } catch (err: any) {
      console.error('Failed to clock out:', err);
      toast.error(err.response?.data?.error || 'Failed to clock out');
      return false;
    }
  }, [loadStaff]);

  // Get staff by ID
  const getStaffMember = useCallback((staffId: string): Staff | undefined => {
    return staff.find((member) => member.id === staffId);
  }, [staff]);

  // Get staff by role
  const getStaffByRole = useCallback((role: StaffRole): Staff[] => {
    return staff.filter((member) => member.role === role);
  }, [staff]);

  // Get active staff
  const getActiveStaff = useCallback((): Staff[] => {
    return staff.filter((member) => member.isActive);
  }, [staff]);

  // Get staff on shift
  const getStaffOnShift = useCallback((): Staff[] => {
    return staff.filter((member) => 
      member.currentShift && !member.currentShift.clockOut
    );
  }, [staff]);

  // Calculate stats
  const stats = {
    total: staff.length,
    active: staff.filter((s) => s.isActive).length,
    onShift: staff.filter((s) => s.currentShift && !s.currentShift.clockOut).length,
    byRole: {
      MANAGER: staff.filter((s) => s.role === 'MANAGER').length,
      CASHIER: staff.filter((s) => s.role === 'CASHIER').length,
      WAITER: staff.filter((s) => s.role === 'WAITER').length,
      KITCHEN: staff.filter((s) => s.role === 'KITCHEN').length,
    },
  };

  return {
    staff,
    loading,
    error,
    isConnected,
    stats,
    loadStaff,
    createStaff,
    updateStaff,
    deleteStaff,
    clockIn,
    clockOut,
    getStaffMember,
    getStaffByRole,
    getActiveStaff,
    getStaffOnShift,
  };
}

