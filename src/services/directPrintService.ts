/**
 * Direct Print Service Client
 * Connects directly to local Print Service (ws://localhost:9999)
 * Bypasses backend for printing operations
 */

interface PrintJob {
  id: string;
  type: 'KOT' | 'BILL';
  orderId: string;
  data: {
    pdf?: string;
    html?: string;
  };
  printer?: string | null;
  copies?: number;
}

interface PrintResponse {
  type: 'print-success' | 'print-error' | 'connected' | 'pong' | 'error';
  jobId?: string;
  message?: string;
  error?: string;
}

class DirectPrintService {
  private ws: WebSocket | null = null;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private isConnected = false;
  private connectionCallbacks: Set<(connected: boolean) => void> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  /**
   * Connect to print service
   */
  connect(): Promise<boolean> {
    return new Promise((resolve) => {
      // Don't try to connect if already connected
      if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
        resolve(true);
        return;
      }

      try {
        this.ws = new WebSocket('ws://localhost:9999');
        
        this.ws.onopen = () => {
          console.log('✅ Connected to print service');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.clearReconnect();
          this.notifyConnectionChange(true);
          resolve(true);
        };
        
        this.ws.onmessage = (event) => {
          try {
            const message: PrintResponse = JSON.parse(event.data);
            
            if (message.type === 'connected') {
              console.log('📱 Print service ready:', message.message);
            } else if (message.type === 'print-success') {
              console.log('✅ Print job completed:', message.jobId);
            } else if (message.type === 'print-error') {
              console.error('❌ Print job failed:', message.error);
            } else if (message.type === 'error') {
              console.error('❌ Print service error:', message.error);
            }
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        };
        
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnected = false;
          this.notifyConnectionChange(false);
          resolve(false);
        };
        
        this.ws.onclose = () => {
          console.log('Disconnected from print service');
          this.isConnected = false;
          this.notifyConnectionChange(false);
          
          // Only reconnect if we haven't exceeded max attempts
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.startReconnect();
          } else {
            console.log('Max reconnect attempts reached');
          }
        };
      } catch (error) {
        console.error('Failed to connect to print service:', error);
        this.isConnected = false;
        this.notifyConnectionChange(false);
        resolve(false);
      }
    });
  }

  /**
   * Print KOT
   */
  async printKOT(orderId: string, pdfBase64: string, printer?: string): Promise<void> {
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Print service not connected. Please ensure the print service is running.');
    }
    
    const printJob: PrintJob = {
      id: `kot-${orderId}-${Date.now()}`,
      type: 'KOT',
      orderId,
      data: {
        pdf: pdfBase64
      },
      printer: printer || null,
      copies: 1
    };
    
    const message = {
      type: 'print-job' as const,
      job: printJob
    };
    
    this.ws.send(JSON.stringify(message));
    console.log('📤 Sent KOT print job:', printJob.id);
  }

  /**
   * Print Bill
   */
  async printBill(orderId: string, pdfBase64: string, printer?: string): Promise<void> {
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Print service not connected. Please ensure the print service is running.');
    }
    
    const printJob: PrintJob = {
      id: `bill-${orderId}-${Date.now()}`,
      type: 'BILL',
      orderId,
      data: {
        pdf: pdfBase64
      },
      printer: printer || null,
      copies: 1
    };
    
    const message = {
      type: 'print-job' as const,
      job: printJob
    };
    
    this.ws.send(JSON.stringify(message));
    console.log('📤 Sent Bill print job:', printJob.id);
  }

  /**
   * Subscribe to connection status changes
   */
  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionCallbacks.add(callback);
    
    // Immediately call with current status
    callback(this.isConnected);
    
    // Return unsubscribe function
    return () => {
      this.connectionCallbacks.delete(callback);
    };
  }

  private notifyConnectionChange(connected: boolean) {
    this.connectionCallbacks.forEach(cb => {
      try {
        cb(connected);
      } catch (error) {
        console.error('Error in connection callback:', error);
      }
    });
  }

  private startReconnect() {
    if (this.reconnectInterval) return;
    
    this.reconnectInterval = setInterval(() => {
      this.reconnectAttempts++;
      console.log(`🔄 Reconnecting to print service... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.clearReconnect();
        console.log('❌ Max reconnect attempts reached. Print service unavailable.');
        return;
      }
      
      this.connect();
    }, 5000); // Try every 5 seconds
  }

  private clearReconnect() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
  }

  /**
   * Disconnect from print service
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.clearReconnect();
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Check if print service is available
   */
  async checkAvailability(): Promise<boolean> {
    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      return true;
    }
    
    try {
      return await this.connect();
    } catch {
      return false;
    }
  }

  /**
   * Send ping to check connection
   */
  ping(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'ping' }));
    }
  }
}

export const directPrintService = new DirectPrintService();

