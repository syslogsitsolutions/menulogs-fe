// React Hook for Table Management
// Handles table CRUD operations and real-time updates

import { useEffect, useState, useCallback } from 'react';
import { useSocket } from './useSocket';
import { tableService } from '../api';
import { toast } from 'react-hot-toast';
import type { Table, CreateTableDTO, UpdateTableDTO, TableStatus } from '../api/tableService';

export function useTables(locationId: string) {
  const { socket, isConnected } = useSocket({ locationId });
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tables from API
  const loadTables = useCallback(async () => {
    if (!locationId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await tableService.getTables(locationId);
      setTables(data);
    } catch (err: any) {
      console.error('Failed to load tables:', err);
      setError(err.response?.data?.error || 'Failed to load tables');
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  // Initial load
  useEffect(() => {
    loadTables();
  }, [loadTables]);

  // Listen for table status changes via Socket.IO
  useEffect(() => {
    if (!socket) return;

    socket.on('table:status-changed', (data: {
      tableId: string;
      tableName: string;
      tableNumber: number;
      oldStatus: TableStatus;
      newStatus: TableStatus;
      changedBy?: { id: string; name: string };
      timestamp: string;
    }) => {
      console.log('🔄 Table status changed:', data);
      
      setTables((prev) =>
        prev.map((table) =>
          table.id === data.tableId
            ? { ...table, status: data.newStatus }
            : table
        )
      );
    });

    // Cleanup
    return () => {
      socket.off('table:status-changed');
    };
  }, [socket]);

  // Create table
  const createTable = useCallback(async (data: CreateTableDTO): Promise<Table | null> => {
    if (!locationId) {
      toast.error('No location selected');
      return null;
    }

    try {
      const newTable = await tableService.createTable(locationId, data);
      setTables((prev) => [...prev, newTable]);
      toast.success('Table created successfully');
      return newTable;
    } catch (err: any) {
      console.error('Failed to create table:', err);
      toast.error(err.response?.data?.error || 'Failed to create table');
      return null;
    }
  }, [locationId]);

  // Update table
  const updateTable = useCallback(async (tableId: string, data: UpdateTableDTO): Promise<Table | null> => {
    try {
      const updatedTable = await tableService.updateTable(tableId, data);
      setTables((prev) =>
        prev.map((table) =>
          table.id === tableId ? updatedTable : table
        )
      );
      toast.success('Table updated successfully');
      return updatedTable;
    } catch (err: any) {
      console.error('Failed to update table:', err);
      toast.error(err.response?.data?.error || 'Failed to update table');
      return null;
    }
  }, []);

  // Update table status
  const updateTableStatus = useCallback(async (tableId: string, status: TableStatus): Promise<boolean> => {
    try {
      await tableService.updateTableStatus(tableId, status);
      // Socket will broadcast the update, but we can optimistically update
      setTables((prev) =>
        prev.map((table) =>
          table.id === tableId ? { ...table, status } : table
        )
      );
      toast.success('Table status updated');
      return true;
    } catch (err: any) {
      console.error('Failed to update table status:', err);
      toast.error(err.response?.data?.error || 'Failed to update table status');
      return false;
    }
  }, []);

  // Delete table
  const deleteTable = useCallback(async (tableId: string): Promise<boolean> => {
    try {
      await tableService.deleteTable(tableId);
      setTables((prev) => prev.filter((table) => table.id !== tableId));
      toast.success('Table deleted successfully');
      return true;
    } catch (err: any) {
      console.error('Failed to delete table:', err);
      toast.error(err.response?.data?.error || 'Failed to delete table');
      return false;
    }
  }, []);

  // Get table by ID
  const getTable = useCallback((tableId: string): Table | undefined => {
    return tables.find((table) => table.id === tableId);
  }, [tables]);

  // Get available tables
  const getAvailableTables = useCallback((): Table[] => {
    return tables.filter((table) => table.status === 'AVAILABLE' as TableStatus && table.isActive);
  }, [tables]);

  // Calculate stats
  const stats = {
    total: tables.length,
    available: tables.filter((t) => t.status === 'AVAILABLE').length,
    occupied: tables.filter((t) => t.status === 'OCCUPIED').length,
    reserved: tables.filter((t) => t.status === 'RESERVED').length,
    cleaning: tables.filter((t) => t.status === 'CLEANING').length,
  };

  return {
    tables,
    loading,
    error,
    isConnected,
    stats,
    loadTables,
    createTable,
    updateTable,
    updateTableStatus,
    deleteTable,
    getTable,
    getAvailableTables,
  };
}

