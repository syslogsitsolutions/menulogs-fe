/**
 * QR Code API Service
 */

import apiClient from '../lib/apiClient';
import type { QRCodeInfoResponse, QRCodeDataURLResponse } from './types';

class QRCodeService {
  /**
   * Get QR code information (public URL and location details)
   */
  async getInfo(locationId: string) {
    const response = await apiClient.get<QRCodeInfoResponse>(
      `/qrcode/locations/${locationId}/info`
    );
    return response.data;
  }

  /**
   * Generate QR code as data URL (base64)
   */
  async generateDataURL(locationId: string, options?: { size?: number; margin?: number }) {
    const params: Record<string, string> = { format: 'data-url' };
    if (options?.size) params.size = options.size.toString();
    if (options?.margin) params.margin = options.margin.toString();

    const response = await apiClient.get<QRCodeDataURLResponse>(
      `/qrcode/locations/${locationId}`,
      { params }
    );
    return response.data;
  }

  /**
   * Download QR code as PNG file
   * Note: Uses blob download to handle authentication
   */
  async downloadQRCode(locationId: string, size: number = 500): Promise<void> {
    try {
      const response = await apiClient.get(
        `/qrcode/locations/${locationId}/download`,
        {
          params: { size },
          responseType: 'blob',
        }
      );

      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get location info for filename
      const info = await this.getInfo(locationId);
      link.download = `qrcode-${info.location.slug || locationId}.png`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      throw error;
    }
  }
}

export default new QRCodeService();

