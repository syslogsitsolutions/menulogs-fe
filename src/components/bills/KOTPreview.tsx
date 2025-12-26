/**
 * KOT Preview Component
 * Displays KOT content for printing
 */

import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import type { KOTData } from '../../api/printService';
import { PrintService } from '../../utils/printService';

interface KOTPreviewProps {
  kotData: KOTData;
  onClose?: () => void;
  autoPrint?: boolean;
}

export function KOTPreview({ kotData, onClose, autoPrint = false }: KOTPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoPrint && containerRef.current) {
      // Auto-print after a short delay to ensure content is rendered
      setTimeout(() => {
        handlePrint();
      }, 500);
    }
  }, [autoPrint]);

  const handlePrint = async () => {
    try {
      await PrintService.printKOT(kotData);
    } catch (error) {
      console.error('Failed to print KOT:', error);
      throw error;
    }
  };

  const { order, location, business } = kotData;
  const date = new Date(order.createdAt).toLocaleString();

  return (
    <div className="bg-white p-6 max-w-md mx-auto text-gray-900">
      {/* Print Container - Hidden but used for PDF generation */}
      <div
        ref={containerRef}
        id="kot-print-container"
        className="bg-white p-4 text-gray-900"
        style={{
          width: '80mm',
          fontFamily: 'monospace',
          fontSize: '12px',
          lineHeight: '1.4',
          color: '#111827',
        }}
      >
        {/* Header */}
        <div className="text-center mb-4 text-gray-900">
          <h2 className="text-lg font-bold mb-1 text-gray-900">{business.name}</h2>
          <p className="text-xs mb-1 text-gray-700">{location.name}</p>
          <p className="text-xs text-gray-700">{location.address}, {location.city}</p>
          <p className="text-xs text-gray-700">Phone: {location.phone}</p>
        </div>

        <hr className="border-dashed border-gray-400 my-4" />

        {/* Order Info */}
        <div className="mb-4 text-gray-900">
          <p className="font-bold mb-1 text-gray-900">KOT #{order.orderNumber}</p>
          <p className="text-xs mb-1 text-gray-700">Date: {date}</p>
          {order.table && (
            <p className="text-xs mb-1 text-gray-700">
              Table: {order.table.number}
              {order.table.name && ` (${order.table.name})`}
            </p>
          )}
          <p className="text-xs mb-1 text-gray-700">Type: {order.type.replace('_', ' ')}</p>
          {order.customerName && (
            <p className="text-xs mb-1 text-gray-700">Customer: {order.customerName}</p>
          )}
        </div>

        <hr className="border-dashed border-gray-400 my-4" />

        {/* Items */}
        <div className="mb-4 text-gray-900">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-2 text-gray-900">Item</th>
                <th className="text-center py-2 text-gray-900">Qty</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-2 text-gray-900">
                    <strong className="text-gray-900">{item.menuItemName}</strong>
                    {item.notes && (
                      <div className="text-xs italic text-gray-600 mt-1">
                        Note: {item.notes}
                      </div>
                    )}
                  </td>
                  <td className="text-center py-2 text-gray-900">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <hr className="border-dashed border-gray-400 my-4" />

        {/* Footer */}
        <div className="text-center mt-4 text-gray-900">
          <p className="text-xs mb-2 text-gray-700">
            Total Items: {order.items.reduce((sum, item) => sum + item.quantity, 0)}
          </p>
          <p className="text-xs mb-2 text-gray-700">Prepared by: {order.createdBy.name}</p>
          <p className="text-xs mt-4 text-gray-700">Thank you!</p>
        </div>
      </div>

      {/* Action Buttons */}
      {!autoPrint && (
        <div className="mt-6 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
          >
            <span>📄</span>
            Download PDF
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      )}
    </div>
  );
}

