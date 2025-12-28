/**
 * React Hook for QZ Tray Status
 * Provides connection status and printer information
 */

import { useState, useEffect } from 'react';
import { QZTrayService, type QZPrinter } from '../utils/qzTrayService';

export interface QZTrayStatus {
  isAvailable: boolean;
  isConnected: boolean;
  printers: QZPrinter[];
  defaultPrinter: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useQZTray() {
  const [status, setStatus] = useState<QZTrayStatus>({
    isAvailable: false,
    isConnected: false,
    printers: [],
    defaultPrinter: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const checkQZTray = async () => {
      try {
        setStatus((prev) => ({ ...prev, isLoading: true, error: null }));

        const isAvailable = await QZTrayService.isAvailable();
        
        if (!mounted) return;

        if (isAvailable) {
          try {
            const printers = await QZTrayService.getPrinters();
            const defaultPrinter = QZTrayService.getDefaultPrinter();

            setStatus({
              isAvailable: true,
              isConnected: true,
              printers,
              defaultPrinter,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to get printers';
            // Check if it's a permission/blocked error
            const isBlocked = errorMessage.includes('blocked') || errorMessage.includes('Request blocked');
            
            setStatus({
              isAvailable: true,
              isConnected: false,
              printers: [],
              defaultPrinter: null,
              isLoading: false,
              error: isBlocked 
                ? 'Printer access blocked. Please click "Allow" in the QZ Tray security dialog.'
                : errorMessage,
            });
          }
        } else {
          setStatus({
            isAvailable: false,
            isConnected: false,
            printers: [],
            defaultPrinter: null,
            isLoading: false,
            error: 'QZ Tray is not available. Install QZ Tray for direct printing.',
          });
        }
      } catch (error) {
        if (!mounted) return;

        setStatus({
          isAvailable: false,
          isConnected: false,
          printers: [],
          defaultPrinter: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to check QZ Tray',
        });
      }
    };

    // Check immediately
    checkQZTray();

    // Check periodically (every 5 seconds)
    const interval = setInterval(checkQZTray, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const refresh = async () => {
    setStatus((prev) => ({ ...prev, isLoading: true }));
    // Trigger re-check by updating a dependency
    await new Promise((resolve) => setTimeout(resolve, 100));
  };

  return {
    ...status,
    refresh,
  };
}

