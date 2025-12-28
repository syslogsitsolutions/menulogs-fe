/**
 * QZ Tray Service
 * Handles connection and printing via QZ Tray desktop application
 * 
 * QZ Tray must be installed on the user's machine for this to work.
 * Download: https://qz.io/download/
 */

// @ts-expect-error - qz-tray doesn't have TypeScript definitions
import qz from 'qz-tray';
import type { KOTData, BillData } from '../api/printService';

export interface QZPrinter {
  name: string;
  driver?: string;
}

export class QZTrayService {
  private static isConnected = false;
  private static connectionPromise: Promise<void> | null = null;
  private static defaultPrinter: string | null = null;

  /**
   * Check if QZ Tray is available
   */
  static async isAvailable(): Promise<boolean> {
    try {
      // Try to connect to QZ Tray
      if (!this.isConnected) {
        await this.connect();
      }
      return this.isConnected;
    } catch (error) {
      console.warn('QZ Tray not available:', error);
      return false;
    }
  }

  /**
   * Connect to QZ Tray
   */
  static async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = (async () => {
      try {
        // Connect to QZ Tray
        // Note: We let QZ Tray handle certificate/signature authentication natively
        // This works for both development and production:
        // - Users will see security dialog first time
        // - After clicking "Allow" and checking "Remember this decision", it's remembered
        // - For production with Premium Support, you can add proper certificate handling here
        await qz.websocket.connect();
        this.isConnected = true;
        
        // Log connection (only in development)
        if (import.meta.env.DEV) {
          console.log('✅ Connected to QZ Tray');
        }

        // Get default printer
        try {
          const printers = await qz.printers.find();
          if (printers && printers.length > 0) {
            this.defaultPrinter = printers[0];
            if (import.meta.env.DEV) {
              console.log('✅ Default printer:', this.defaultPrinter);
            }
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes('blocked') || errorMessage.includes('Request blocked')) {
            console.warn('⚠️ Printer access blocked by user. Please click "Allow" in the QZ Tray security dialog.');
            throw new Error('Printer access was blocked. Please allow printer access in the QZ Tray security dialog and try again.');
          }
          console.warn('Could not get default printer:', error);
        }
      } catch (error: unknown) {
        this.isConnected = false;
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to connect to QZ Tray: ${errorMessage}`);
      } finally {
        this.connectionPromise = null;
      }
    })();

    return this.connectionPromise;
  }

  /**
   * Disconnect from QZ Tray
   */
  static async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await qz.websocket.disconnect();
      this.isConnected = false;
      this.defaultPrinter = null;
      console.log('Disconnected from QZ Tray');
    } catch (error) {
      console.error('Error disconnecting from QZ Tray:', error);
    }
  }

  /**
   * Get list of available printers
   */
  static async getPrinters(): Promise<QZPrinter[]> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const printers = await qz.printers.find();
      return printers.map((name: string) => ({ name }));
    } catch (error) {
      console.error('Error getting printers:', error);
      throw error;
    }
  }

  /**
   * Set default printer
   */
  static setDefaultPrinter(printerName: string): void {
    this.defaultPrinter = printerName;
  }

  /**
   * Get default printer
   */
  static getDefaultPrinter(): string | null {
    return this.defaultPrinter;
  }

  /**
   * Print KOT using QZ Tray
   */
  static async printKOT(kotData: KOTData, printerName?: string): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }

    const printer = printerName || this.defaultPrinter;
    if (!printer) {
      throw new Error('No printer selected');
    }

    try {
      // Generate ESC/POS commands for thermal printer
      const escposCommands = this.generateKOTEscPos(kotData);

      // Print using raw ESC/POS commands
      await qz.print({
        printer: printer,
        data: [
          {
            type: 'raw',
            format: 'plain',
            data: escposCommands,
          },
        ],
      });

      if (import.meta.env.DEV) {
        console.log('✅ KOT printed via QZ Tray');
      }
    } catch (error) {
      console.error('Error printing KOT via QZ Tray:', error);
      throw error;
    }
  }

  /**
   * Print Bill using QZ Tray
   */
  static async printBill(billData: BillData, printerName?: string): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }

    const printer = printerName || this.defaultPrinter;
    if (!printer) {
      throw new Error('No printer selected');
    }

    try {
      // Generate ESC/POS commands for thermal printer
      const escposCommands = this.generateBillEscPos(billData);

      // Print using raw ESC/POS commands
      await qz.print({
        printer: printer,
        data: [
          {
            type: 'raw',
            format: 'plain',
            data: escposCommands,
          },
        ],
      });

      if (import.meta.env.DEV) {
        console.log('✅ Bill printed via QZ Tray');
      }
    } catch (error) {
      console.error('Error printing Bill via QZ Tray:', error);
      throw error;
    }
  }

  /**
   * Generate ESC/POS commands for KOT
   */
  private static generateKOTEscPos(kot: KOTData): string {
    const { order, location, business } = kot;
    const date = new Date(order.createdAt).toLocaleString();

    let commands = '';

    // Initialize printer
    commands += '\x1B\x40'; // ESC @ - Initialize printer

    // Center align and bold
    commands += '\x1B\x61\x01'; // ESC a 1 - Center align
    commands += '\x1B\x45\x01'; // ESC E 1 - Bold on
    commands += `${business.name}\n`;
    commands += '\x1B\x45\x00'; // ESC E 0 - Bold off

    // Location info
    commands += `${location.name}\n`;
    commands += `${location.address}, ${location.city}\n`;
    commands += `Phone: ${location.phone}\n`;

    // Separator
    commands += '\x1B\x61\x00'; // ESC a 0 - Left align
    commands += '--------------------------------\n';

    // Order info
    commands += `KOT #${order.orderNumber}\n`;
    commands += `Date: ${date}\n`;
    if (order.table) {
      commands += `Table: ${order.table.number}${order.table.name ? ` (${order.table.name})` : ''}\n`;
    }
    commands += `Type: ${order.type.replace('_', ' ')}\n`;
    if (order.customerName) {
      commands += `Customer: ${order.customerName}\n`;
    }

    // Separator
    commands += '--------------------------------\n';

    // Items
    commands += 'Item                    Qty\n';
    commands += '--------------------------------\n';
    for (const item of order.items) {
      const itemName = item.menuItemName.substring(0, 24).padEnd(24);
      commands += `${itemName}${item.quantity.toString().padStart(3)}\n`;
      if (item.notes) {
        commands += `  Note: ${item.notes}\n`;
      }
    }

    // Separator
    commands += '--------------------------------\n';

    // Footer
    commands += '\x1B\x61\x01'; // Center align
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
    commands += `Total Items: ${totalItems}\n`;
    commands += `Prepared by: ${order.createdBy.name}\n`;
    commands += 'Thank you!\n';

    // Feed and cut
    commands += '\n\n\n';
    commands += '\x1D\x56\x00'; // GS V 0 - Full cut

    return commands;
  }

  /**
   * Generate ESC/POS commands for Bill
   */
  private static generateBillEscPos(bill: BillData): string {
    const { order, location, business, payments } = bill;
    const date = new Date(order.createdAt).toLocaleString();
    const completedDate = order.completedAt ? new Date(order.completedAt).toLocaleString() : null;

    let commands = '';

    // Initialize printer
    commands += '\x1B\x40'; // ESC @ - Initialize printer

    // Center align and bold
    commands += '\x1B\x61\x01'; // ESC a 1 - Center align
    commands += '\x1B\x45\x01'; // ESC E 1 - Bold on
    commands += `${business.name}\n`;
    commands += '\x1B\x45\x00'; // ESC E 0 - Bold off

    // Location info
    commands += `${location.name}\n`;
    commands += `${location.address}\n`;
    commands += `${location.city}, ${location.state} ${location.zipCode}\n`;
    commands += `Phone: ${location.phone}\n`;
    if (location.email) {
      commands += `Email: ${location.email}\n`;
    }

    // Separator
    commands += '\x1B\x61\x00'; // ESC a 0 - Left align
    commands += '--------------------------------\n';

    // Invoice info
    commands += '\x1B\x45\x01'; // Bold on
    commands += `Invoice #${order.orderNumber}\n`;
    commands += '\x1B\x45\x00'; // Bold off
    commands += `Date: ${date}\n`;
    if (completedDate) {
      commands += `Completed: ${completedDate}\n`;
    }
    if (order.table) {
      commands += `Table: ${order.table.number}${order.table.name ? ` (${order.table.name})` : ''}\n`;
    }
    commands += `Type: ${order.type.replace('_', ' ')}\n`;
    if (order.customerName) {
      commands += `Customer: ${order.customerName}\n`;
    }
    if (order.customerPhone) {
      commands += `Phone: ${order.customerPhone}\n`;
    }
    if (order.customerEmail) {
      commands += `Email: ${order.customerEmail}\n`;
    }

    // Separator
    commands += '--------------------------------\n';

    // Items table
    commands += 'Item              Qty  Price  Total\n';
    commands += '--------------------------------\n';
    for (const item of order.items) {
      const itemName = item.menuItemName.substring(0, 16).padEnd(16);
      const qty = item.quantity.toString().padStart(3);
      const price = `₹${item.unitPrice.toFixed(2)}`.padStart(7);
      const total = `₹${item.totalPrice.toFixed(2)}`.padStart(8);
      commands += `${itemName}${qty}${price}${total}\n`;
      if (item.notes) {
        commands += `  ${item.notes}\n`;
      }
    }

    // Separator
    commands += '--------------------------------\n';

    // Totals
    commands += `Subtotal:                    ₹${order.subtotal.toFixed(2)}\n`;
    if (order.taxRate > 0) {
      commands += `Tax (${order.taxRate}%):                ₹${order.taxAmount.toFixed(2)}\n`;
    }
    if (order.discountAmount > 0) {
      commands += `Discount:                   -₹${order.discountAmount.toFixed(2)}\n`;
    }
    if (order.tipAmount > 0) {
      commands += `Tip:                        ₹${order.tipAmount.toFixed(2)}\n`;
    }
    commands += '\x1B\x45\x01'; // Bold on
    commands += `TOTAL:                      ₹${order.totalAmount.toFixed(2)}\n`;
    commands += '\x1B\x45\x00'; // Bold off

    // Payments
    if (payments.length > 0) {
      commands += '--------------------------------\n';
      commands += 'Payment Details:\n';
      for (const payment of payments) {
        commands += `${payment.method.toUpperCase()}:                    ₹${payment.amount.toFixed(2)}\n`;
        if (payment.transactionId) {
          commands += `  Txn: ${payment.transactionId}\n`;
        }
      }
    }

    // Separator
    commands += '--------------------------------\n';

    // Footer
    commands += '\x1B\x61\x01'; // Center align
    commands += 'Thank you for your visit!\n';
    if (order.notes) {
      commands += `${order.notes}\n`;
    }

    // Feed and cut
    commands += '\n\n\n';
    commands += '\x1D\x56\x00'; // GS V 0 - Full cut

    return commands;
  }
}

