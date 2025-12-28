/**
 * Print Service Utility
 * Handles PDF generation and printing for KOT and Bills
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { KOTData, BillData } from '../api/printService';

export class PrintService {
  /**
   * Generate and download KOT as PDF
   */
  static async printKOT(kotData: KOTData): Promise<void> {
    try {
      // Create a temporary container for KOT content
      const container = document.createElement('div');
      container.id = 'kot-print-container';
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '80mm'; // Thermal printer width
      container.style.padding = '10mm';
      container.style.backgroundColor = 'white';
      container.style.fontFamily = 'monospace';
      container.style.fontSize = '12px';
      container.style.lineHeight = '1.4';

      // Build KOT HTML content
      container.innerHTML = this.generateKOTHTML(kotData);

      // Append to body temporarily
      document.body.appendChild(container);

      // Wait for content to render
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Convert to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 300, // 80mm ≈ 300px at 96 DPI
        backgroundColor: '#ffffff',
      });

      // Remove temporary container
      document.body.removeChild(container);

      // Create PDF (80mm width, auto height)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 200], // Thermal printer size
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 80; // mm
      const pageHeight = 200; // mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Auto-download PDF
      pdf.save(`KOT-${kotData.order.orderNumber}.pdf`);
    } catch (error) {
      console.error('Failed to generate KOT PDF:', error);
      throw error;
    }
  }

  /**
   * Generate and download Bill as PDF
   */
  static async printBill(billData: BillData): Promise<void> {
    try {
      // Create a temporary container for Bill content
      const container = document.createElement('div');
      container.id = 'bill-print-container';
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '80mm'; // Standard receipt width (thermal printer)
      container.style.padding = '10mm';
      container.style.backgroundColor = 'white';
      container.style.fontFamily = 'monospace';
      container.style.fontSize = '11px';
      container.style.lineHeight = '1.4';

      // Build Bill HTML content
      container.innerHTML = this.generateBillHTML(billData);

      // Append to body temporarily
      document.body.appendChild(container);

      // Wait for content to render
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Convert to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 300, // 80mm ≈ 300px at 96 DPI
        backgroundColor: '#ffffff',
      });

      // Remove temporary container
      document.body.removeChild(container);

      // Create PDF (80mm width, auto height)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 200], // Thermal printer size
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 80; // Standard receipt width in mm
      const pageHeight = 200; // mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Auto-download PDF
      pdf.save(`Bill-${billData.order.orderNumber}.pdf`);
    } catch (error) {
      console.error('Failed to generate Bill PDF:', error);
      throw error;
    }
  }

  /**
   * Generate KOT HTML content
   */
  private static generateKOTHTML(kot: KOTData): string {
    const { order, location, business } = kot;
    const date = new Date(order.createdAt).toLocaleString();

    return `
      <div style="text-align: center; margin-bottom: 10px;">
        <h2 style="margin: 0; font-size: 18px; font-weight: bold;">${business.name}</h2>
        <p style="margin: 5px 0; font-size: 11px;">${location.name}</p>
        <p style="margin: 2px 0; font-size: 10px;">${location.address}, ${location.city}</p>
        <p style="margin: 2px 0; font-size: 10px;">Phone: ${location.phone}</p>
      </div>
      
      <hr style="border: none; border-top: 1px dashed #000; margin: 10px 0;">
      
      <div style="margin-bottom: 10px;">
        <p style="margin: 5px 0;"><strong>KOT #${order.orderNumber}</strong></p>
        <p style="margin: 2px 0; font-size: 10px;">Date: ${date}</p>
        ${order.table ? `<p style="margin: 2px 0; font-size: 10px;">Table: ${order.table.number}${order.table.name ? ` (${order.table.name})` : ''}</p>` : ''}
        <p style="margin: 2px 0; font-size: 10px;">Type: ${order.type.replace('_', ' ')}</p>
        ${order.customerName ? `<p style="margin: 2px 0; font-size: 10px;">Customer: ${order.customerName}</p>` : ''}
      </div>
      
      <hr style="border: none; border-top: 1px dashed #000; margin: 10px 0;">
      
      <div style="margin-bottom: 10px;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align: left; border-bottom: 1px solid #000; padding: 5px 0;">Item</th>
              <th style="text-align: center; border-bottom: 1px solid #000; padding: 5px 0;">Qty</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item) => `
              <tr>
                <td style="padding: 5px 0;">
                  <strong>${item.menuItemName}</strong>
                  ${item.notes ? `<br><span style="font-size: 10px; font-style: italic;">Note: ${item.notes}</span>` : ''}
                </td>
                <td style="text-align: center; padding: 5px 0;">${item.quantity}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
      
      <hr style="border: none; border-top: 1px dashed #000; margin: 10px 0;">
      
      <div style="text-align: center; margin-top: 10px;">
        <p style="margin: 5px 0; font-size: 10px;">Total Items: ${order.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
        <p style="margin: 5px 0; font-size: 10px;">Prepared by: ${order.createdBy.name}</p>
        <p style="margin: 10px 0; font-size: 9px;">Thank you!</p>
      </div>
    `;
  }

  /**
   * Generate Bill HTML content
   */
  private static generateBillHTML(bill: BillData): string {
    const { order, location, business, payments } = bill;
    const date = new Date(order.createdAt).toLocaleString();
    const completedDate = order.completedAt ? new Date(order.completedAt).toLocaleString() : null;

    return `
      <div style="text-align: center; margin-bottom: 10px;">
        ${business.logo ? `<img src="${business.logo}" alt="${business.name}" style="max-width: 60px; margin-bottom: 5px;">` : ''}
        <h1 style="margin: 0; font-size: 16px; font-weight: bold;">${business.name}</h1>
        <p style="margin: 3px 0; font-size: 11px;">${location.name}</p>
        <p style="margin: 1px 0; font-size: 10px;">${location.address}</p>
        <p style="margin: 1px 0; font-size: 10px;">${location.city}, ${location.state} ${location.zipCode}</p>
        <p style="margin: 1px 0; font-size: 10px;">Phone: ${location.phone}</p>
        ${location.email ? `<p style="margin: 1px 0; font-size: 10px;">Email: ${location.email}</p>` : ''}
      </div>
      
      <hr style="border: none; border-top: 1px dashed #000; margin: 8px 0;">
      
      <div style="margin-bottom: 8px;">
        <h2 style="margin: 0 0 5px 0; font-size: 14px;">Invoice #${order.orderNumber}</h2>
        <p style="margin: 2px 0; font-size: 10px;"><strong>Date:</strong> ${date}</p>
        ${completedDate ? `<p style="margin: 2px 0; font-size: 10px;"><strong>Completed:</strong> ${completedDate}</p>` : ''}
        ${order.table ? `<p style="margin: 2px 0; font-size: 10px;"><strong>Table:</strong> ${order.table.number}${order.table.name ? ` (${order.table.name})` : ''}</p>` : ''}
        <p style="margin: 2px 0; font-size: 10px;"><strong>Type:</strong> ${order.type.replace('_', ' ')}</p>
        ${order.customerName ? `<p style="margin: 2px 0; font-size: 10px;"><strong>Customer:</strong> ${order.customerName}</p>` : ''}
        ${order.customerPhone ? `<p style="margin: 2px 0; font-size: 10px;"><strong>Phone:</strong> ${order.customerPhone}</p>` : ''}
        ${order.customerEmail ? `<p style="margin: 2px 0; font-size: 10px;"><strong>Email:</strong> ${order.customerEmail}</p>` : ''}
      </div>
      
      <hr style="border: none; border-top: 1px dashed #000; margin: 8px 0;">
      
      <div style="margin-bottom: 8px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
          <thead>
            <tr>
              <th style="text-align: left; border-bottom: 1px solid #000; padding: 3px 0;">Item</th>
              <th style="text-align: center; border-bottom: 1px solid #000; padding: 3px 0;">Qty</th>
              <th style="text-align: right; border-bottom: 1px solid #000; padding: 3px 0;">Price</th>
              <th style="text-align: right; border-bottom: 1px solid #000; padding: 3px 0;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item) => `
              <tr>
                <td style="padding: 3px 0; border-bottom: 1px dashed #ccc;">
                  <strong style="font-size: 10px;">${item.menuItemName}</strong>
                  ${item.notes ? `<br><span style="font-size: 9px; color: #666; font-style: italic;">${item.notes}</span>` : ''}
                </td>
                <td style="text-align: center; padding: 3px 0; border-bottom: 1px dashed #ccc; font-size: 10px;">${item.quantity}</td>
                <td style="text-align: right; padding: 3px 0; border-bottom: 1px dashed #ccc; font-size: 10px;">₹${item.unitPrice.toFixed(2)}</td>
                <td style="text-align: right; padding: 3px 0; border-bottom: 1px dashed #ccc; font-size: 10px;">₹${item.totalPrice.toFixed(2)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
      
      <div style="margin-top: 8px; width: 100%;">
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
          <tr>
            <td style="padding: 2px 0; text-align: right;"><strong>Subtotal:</strong></td>
            <td style="padding: 2px 0; text-align: right;">₹${order.subtotal.toFixed(2)}</td>
          </tr>
          ${order.taxRate > 0 ? `
          <tr>
            <td style="padding: 2px 0; text-align: right;">Tax (${order.taxRate}%):</td>
            <td style="padding: 2px 0; text-align: right;">₹${order.taxAmount.toFixed(2)}</td>
          </tr>
          ` : ''}
          ${order.discountAmount > 0 ? `
          <tr>
            <td style="padding: 2px 0; text-align: right;">Discount:</td>
            <td style="padding: 2px 0; text-align: right;">-₹${order.discountAmount.toFixed(2)}</td>
          </tr>
          ` : ''}
          ${order.tipAmount > 0 ? `
          <tr>
            <td style="padding: 2px 0; text-align: right;">Tip:</td>
            <td style="padding: 2px 0; text-align: right;">₹${order.tipAmount.toFixed(2)}</td>
          </tr>
          ` : ''}
          <tr style="border-top: 1px solid #000;">
            <td style="padding: 4px 0; text-align: right;"><strong>Total:</strong></td>
            <td style="padding: 4px 0; text-align: right;"><strong>₹${order.totalAmount.toFixed(2)}</strong></td>
          </tr>
        </table>
      </div>
      
      ${payments.length > 0 ? `
      <div style="margin-top: 8px;">
        <h3 style="margin: 0 0 5px 0; font-size: 11px;">Payment Details</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
          ${payments
            .map(
              (payment) => `
            <tr>
              <td style="padding: 2px 0;">${payment.method.toUpperCase()}</td>
              <td style="padding: 2px 0; text-align: right;">₹${payment.amount.toFixed(2)}</td>
              ${payment.transactionId ? `<td style="padding: 2px 0; font-size: 9px; color: #666;">Txn: ${payment.transactionId}</td>` : ''}
            </tr>
          `
            )
            .join('')}
        </table>
      </div>
      ` : ''}
      
      <hr style="border: none; border-top: 1px dashed #000; margin: 10px 0;">
      
      <div style="text-align: center; margin-top: 10px;">
        <p style="margin: 5px 0; font-size: 11px;"><strong>Thank you for your visit!</strong></p>
        ${order.notes ? `<p style="margin: 5px 0; font-size: 10px; color: #666;">${order.notes}</p>` : ''}
      </div>
    `;
  }
}

