/**
 * Bill Preview Component
 * Displays Bill/Invoice content for printing
 */

import { useEffect, useRef, useCallback } from 'react';
import type { BillData } from '../../api/printService';
import { PrintService } from '../../utils/printService';

interface BillPreviewProps {
  billData: BillData;
  onClose?: () => void;
  autoPrint?: boolean;
}

export function BillPreview({ billData, onClose, autoPrint = false }: BillPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePrint = useCallback(async () => {
    try {
      await PrintService.printBill(billData);
    } catch (error) {
      console.error('Failed to print Bill:', error);
      throw error;
    }
  }, [billData]);

  useEffect(() => {
    if (autoPrint && containerRef.current) {
      // Auto-print after a short delay to ensure content is rendered
      setTimeout(() => {
        handlePrint();
      }, 500);
    }
  }, [autoPrint, handlePrint]);

  const { order, location, business, payments } = billData;
  const date = new Date(order.createdAt).toLocaleString();
  const completedDate = order.completedAt ? new Date(order.completedAt).toLocaleString() : null;

  return (
    <>
      {/* Print Container - Hidden, used only for PDF generation */}
      <div
        ref={containerRef}
        id="bill-print-container"
        className="absolute left-[-9999px] bg-white p-4"
        style={{
          width: '80mm',
          fontFamily: 'monospace',
          fontSize: '11px',
          lineHeight: '1.4',
        }}
      >
        {/* Header */}
        <div className="text-center mb-4">
          {business.logo && (
            <img
              src={business.logo}
              alt={business.name}
              className="max-w-[60px] mx-auto mb-2"
            />
          )}
          <h1 className="text-base font-bold mb-1">{business.name}</h1>
          <p className="text-xs mb-0.5">{location.name}</p>
          <p className="text-[10px]">{location.address}</p>
          <p className="text-[10px]">
            {location.city}, {location.state} {location.zipCode}
          </p>
          <p className="text-[10px]">Phone: {location.phone}</p>
          {location.email && <p className="text-[10px]">Email: {location.email}</p>}
        </div>

        <hr className="border-t border-gray-800 my-2" />

        {/* Order Info */}
        <div className="mb-3">
          <h2 className="text-sm font-bold mb-1">Invoice #{order.orderNumber}</h2>
          <p className="text-[10px] mb-0.5"><strong>Date:</strong> {date}</p>
          {completedDate && (
            <p className="text-[10px] mb-0.5"><strong>Completed:</strong> {completedDate}</p>
          )}
          {order.table && (
            <p className="text-[10px] mb-0.5">
              <strong>Table:</strong> {order.table.number}
              {order.table.name && ` (${order.table.name})`}
            </p>
          )}
          <p className="text-[10px] mb-0.5"><strong>Type:</strong> {order.type.replace('_', ' ')}</p>
          {order.customerName && (
            <p className="text-[10px] mb-0.5"><strong>Customer:</strong> {order.customerName}</p>
          )}
          {order.customerPhone && (
            <p className="text-[10px] mb-0.5"><strong>Phone:</strong> {order.customerPhone}</p>
          )}
          {order.customerEmail && (
            <p className="text-[10px] mb-0.5"><strong>Email:</strong> {order.customerEmail}</p>
          )}
        </div>

        <hr className="border-t border-gray-400 my-2" />

        {/* Items Table */}
        <div className="mb-3">
          <table className="w-full border-collapse text-[10px]">
            <thead>
              <tr>
                <th className="text-left border-b border-gray-800 py-1 px-1">Item</th>
                <th className="text-center border-b border-gray-800 py-1 px-1">Qty</th>
                <th className="text-right border-b border-gray-800 py-1 px-1">Price</th>
                <th className="text-right border-b border-gray-800 py-1 px-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-1 px-1">
                    <strong className="text-[10px]">{item.menuItemName}</strong>
                    {item.notes && (
                      <div className="text-[9px] text-gray-600 italic mt-0.5">{item.notes}</div>
                    )}
                  </td>
                  <td className="text-center py-1 px-1 text-[10px]">{item.quantity}</td>
                  <td className="text-right py-1 px-1 text-[10px]">₹{item.unitPrice.toFixed(2)}</td>
                  <td className="text-right py-1 px-1 text-[10px]">₹{item.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="w-full mb-3">
          <table className="w-full border-collapse text-[10px]">
            <tbody>
              <tr>
                <td className="py-0.5 text-right"><strong>Subtotal:</strong></td>
                <td className="py-0.5 text-right">₹{order.subtotal.toFixed(2)}</td>
              </tr>
              {order.taxRate > 0 && (
                <tr>
                  <td className="py-0.5 text-right">Tax ({order.taxRate}%):</td>
                  <td className="py-0.5 text-right">₹{order.taxAmount.toFixed(2)}</td>
                </tr>
              )}
              {order.discountAmount > 0 && (
                <tr>
                  <td className="py-0.5 text-right">Discount:</td>
                  <td className="py-0.5 text-right">-₹{order.discountAmount.toFixed(2)}</td>
                </tr>
              )}
              {order.tipAmount > 0 && (
                <tr>
                  <td className="py-0.5 text-right">Tip:</td>
                  <td className="py-0.5 text-right">₹{order.tipAmount.toFixed(2)}</td>
                </tr>
              )}
              <tr className="border-t border-gray-800">
                <td className="py-1 text-right"><strong>Total:</strong></td>
                <td className="py-1 text-right"><strong>₹{order.totalAmount.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payments */}
        {payments.length > 0 && (
          <div className="mt-3 mb-3">
            <h3 className="text-xs font-bold mb-1">Payment Details</h3>
            <table className="w-full border-collapse text-[10px]">
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="py-0.5">{payment.method.toUpperCase()}</td>
                    <td className="py-0.5 text-right">₹{payment.amount.toFixed(2)}</td>
                    {payment.transactionId && (
                      <td className="py-0.5 text-[9px] text-gray-600">
                        Txn: {payment.transactionId}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <hr className="border-t border-gray-400 my-3" />

        {/* Footer */}
        <div className="text-center mt-3">
          <p className="text-xs font-bold mb-1">Thank you for your visit!</p>
          {order.notes && (
            <p className="text-[10px] text-gray-600">{order.notes}</p>
          )}
        </div>
      </div>

      {/* Visible Preview Content - Compact Design */}
      <div className="bg-white p-3 max-w-md mx-auto text-gray-900">
        {/* Header */}
        <div className="text-center mb-2">
          {business.logo && (
            <img
              src={business.logo}
              alt={business.name}
              className="w-10 h-10 mx-auto mb-1 object-contain"
            />
          )}
          <h1 className="text-sm font-bold mb-0.5 text-gray-900">{business.name}</h1>
          <p className="text-xs text-gray-600 mb-0.5">{location.name}</p>
          <p className="text-xs text-gray-600">{location.address}</p>
          <p className="text-xs text-gray-600">
            {location.city}, {location.state} {location.zipCode}
          </p>
          <p className="text-xs text-gray-600">Phone: {location.phone}</p>
          {location.email && <p className="text-xs text-gray-600">Email: {location.email}</p>}
        </div>

        <hr className="border-t border-gray-300 my-1.5" />

        {/* Order Info */}
        <div className="mb-2">
          <h2 className="text-xs font-bold mb-1 text-gray-900">Invoice #{order.orderNumber}</h2>
          <div className="space-y-0.5 text-xs text-gray-700">
            <div><span className="font-medium">Date:</span> {date}</div>
            {completedDate && (
              <div><span className="font-medium">Completed:</span> {completedDate}</div>
            )}
            {order.table && (
              <div>
                <span className="font-medium">Table:</span> {order.table.number}
                {order.table.name && ` (${order.table.name})`}
              </div>
            )}
            <div><span className="font-medium">Type:</span> {order.type.replace('_', ' ')}</div>
            {order.customerName && (
              <div><span className="font-medium">Customer:</span> {order.customerName}</div>
            )}
            {order.customerPhone && (
              <div><span className="font-medium">Phone:</span> {order.customerPhone}</div>
            )}
            {order.customerEmail && (
              <div><span className="font-medium">Email:</span> {order.customerEmail}</div>
            )}
          </div>
        </div>

        <hr className="border-t border-gray-300 my-1.5" />

        {/* Items Table */}
        <div className="mb-2">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left border-b border-gray-300 py-0.5 px-1 text-xs font-semibold text-gray-700">Item</th>
                <th className="text-center border-b border-gray-300 py-0.5 px-0.5 text-xs font-semibold text-gray-700 w-6">Qty</th>
                <th className="text-right border-b border-gray-300 py-0.5 px-1 text-xs font-semibold text-gray-700 w-12">Price</th>
                <th className="text-right border-b border-gray-300 py-0.5 px-1 text-xs font-semibold text-gray-700 w-12">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-1 px-1 text-gray-900">
                    <div className="font-medium text-xs break-words">{item.menuItemName}</div>
                    {item.notes && (
                      <div className="text-xs text-gray-500 italic mt-0.5 break-words">{item.notes}</div>
                    )}
                  </td>
                  <td className="text-center py-1 px-0.5 text-gray-700 text-xs">{item.quantity}</td>
                  <td className="text-right py-1 px-1 text-gray-700 text-xs">₹{item.unitPrice.toFixed(2)}</td>
                  <td className="text-right py-1 px-1 text-gray-900 font-medium text-xs">₹{item.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="w-full mb-2">
          <div className="flex justify-end">
            <div className="text-right text-xs">
              <div className="py-0.5">
                <span className="text-gray-700">Subtotal: </span>
                <span className="text-gray-900 font-medium">₹{order.subtotal.toFixed(2)}</span>
              </div>
              {order.taxRate > 0 && (
                <div className="py-0.5">
                  <span className="text-gray-700">Tax ({order.taxRate}%): </span>
                  <span className="text-gray-900">₹{order.taxAmount.toFixed(2)}</span>
                </div>
              )}
              {order.discountAmount > 0 && (
                <div className="py-0.5">
                  <span className="text-gray-700">Discount: </span>
                  <span className="text-red-600">-₹{order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              {order.tipAmount > 0 && (
                <div className="py-0.5">
                  <span className="text-gray-700">Tip: </span>
                  <span className="text-gray-900">₹{order.tipAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t-2 border-gray-300 pt-1 mt-0.5">
                <span className="font-bold text-gray-900">Total: </span>
                <span className="font-bold text-sm text-gray-900">₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payments */}
        {payments.length > 0 && (
          <div className="mt-1.5 mb-1.5">
            <h3 className="text-xs font-semibold mb-0.5 text-gray-900">Payment Details</h3>
            <div className="space-y-0.5">
              {payments.map((payment) => (
                <div key={payment.id} className="flex justify-between items-center text-xs">
                  <span className="text-gray-700">{payment.method.toUpperCase()}</span>
                  <div className="text-right">
                    <span className="font-medium text-gray-900">₹{payment.amount.toFixed(2)}</span>
                    {payment.transactionId && (
                      <div className="text-xs text-gray-500">Txn: {payment.transactionId}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <hr className="border-t border-gray-300 my-1.5" />

        {/* Footer */}
        <div className="text-center mt-1.5">
          <p className="text-xs font-semibold text-gray-900 mb-0.5">Thank you for your visit!</p>
          {order.notes && (
            <p className="text-xs text-gray-600">{order.notes}</p>
          )}
        </div>

        {/* Action Buttons */}
        {!autoPrint && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 bg-orange-500 text-white py-2 px-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <span>📄</span>
              Download PDF
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                Close
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
