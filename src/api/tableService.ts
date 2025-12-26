/**
 * Table API Service
 * Handles all table-related API calls
 */

import apiClient from '../lib/apiClient';

// Types
export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';

export interface Table {
  id: string;
  locationId: string;
  number: number;
  name?: string;
  capacity: number;
  status: TableStatus;
  qrCode?: string;
  sortOrder: number;
  isActive: boolean;
  currentOrder?: {
    id: string;
    orderNumber: number;
    total: number;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTableDTO {
  number: number;
  name?: string;
  capacity: number;
}

export interface UpdateTableDTO {
  number?: number;
  name?: string;
  capacity?: number;
  isActive?: boolean;
  sortOrder?: number;
}

export interface TableListResponse {
  tables: Table[];
  total: number;
}

export interface TableResponse {
  message: string;
  table: Table;
}

class TableService {
  /**
   * Get all tables for a location
   */
  async getTables(locationId: string, includeInactive = false): Promise<Table[]> {
    const response = await apiClient.get<TableListResponse>(
      `/locations/${locationId}/tables`,
      { params: { includeInactive } }
    );
    return response.data.tables;
  }

  /**
   * Get a single table by ID
   */
  async getTable(tableId: string): Promise<Table> {
    const response = await apiClient.get<{ table: Table }>(`/tables/${tableId}`);
    return response.data.table;
  }

  /**
   * Create a new table
   */
  async createTable(locationId: string, data: CreateTableDTO): Promise<Table> {
    const response = await apiClient.post<TableResponse>(
      `/locations/${locationId}/tables`,
      data
    );
    return response.data.table;
  }

  /**
   * Update a table
   */
  async updateTable(tableId: string, data: UpdateTableDTO): Promise<Table> {
    const response = await apiClient.patch<TableResponse>(
      `/tables/${tableId}`,
      data
    );
    return response.data.table;
  }

  /**
   * Update table status
   */
  async updateTableStatus(tableId: string, status: TableStatus): Promise<Table> {
    const response = await apiClient.patch<TableResponse>(
      `/tables/${tableId}/status`,
      { status }
    );
    return response.data.table;
  }

  /**
   * Delete a table
   */
  async deleteTable(tableId: string): Promise<void> {
    await apiClient.delete(`/tables/${tableId}`);
  }

  /**
   * Reorder tables
   */
  async reorderTables(locationId: string, tableIds: string[]): Promise<void> {
    await apiClient.post(`/locations/${locationId}/tables/reorder`, { tableIds });
  }

  /**
   * Generate QR code for table
   */
  async generateQRCode(tableId: string): Promise<{ qrCode: string; qrUrl: string }> {
    const response = await apiClient.post<{ qrCode: string; qrUrl: string }>(
      `/tables/${tableId}/qrcode`
    );
    return response.data;
  }

  /**
   * Get table with current order
   */
  async getTableWithOrder(tableId: string): Promise<Table & { currentOrder?: unknown }> {
    const response = await apiClient.get<{ table: Table }>(`/tables/${tableId}?includeOrder=true`);
    return response.data.table;
  }

  /**
   * Bulk create tables
   */
  async bulkCreateTables(locationId: string, count: number, startNumber: number, capacity: number): Promise<Table[]> {
    const response = await apiClient.post<{ tables: Table[] }>(
      `/locations/${locationId}/tables/bulk`,
      { count, startNumber, capacity }
    );
    return response.data.tables;
  }
}

export default new TableService();

