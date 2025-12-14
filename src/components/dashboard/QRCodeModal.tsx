import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Download, Check, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { qrcodeService } from '@/api';
import type { QRCodeInfoResponse } from '@/api/types';

interface QRCodeModalProps {
  locationId: string;
  locationName: string;
  isOpen: boolean;
  onClose: () => void;
}

const QRCodeModal = ({ locationId, locationName, isOpen, onClose }: QRCodeModalProps) => {
  const [info, setInfo] = useState<QRCodeInfoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && locationId) {
      loadQRCodeInfo();
    } else {
      // Reset state when modal closes
      setInfo(null);
      setError(null);
      setIsLoading(true);
      setCopied(false);
    }
  }, [isOpen, locationId]);

  const loadQRCodeInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await qrcodeService.getInfo(locationId);
      setInfo(data);
    } catch (err: any) {
      console.error('Error loading QR code info:', err);
      setError(err?.response?.data?.error || 'Failed to load QR code information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUrl = async () => {
    if (!info?.url) return;

    try {
      await navigator.clipboard.writeText(info.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleDownload = async () => {
    if (!locationId) return;
    try {
      await qrcodeService.downloadQRCode(locationId, 500);
    } catch (error) {
      console.error('Failed to download QR code:', error);
      setError('Failed to download QR code. Please try again.');
    }
  };

  const handleOpenMenu = () => {
    if (info?.url) {
      window.open(info.url, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white rounded-2xl shadow-xl max-w-md w-full my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-dark-900 font-serif">QR Code</h2>
                <p className="text-sm text-gray-600 mt-1">{locationName}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-4" />
                <p className="text-gray-600">Loading QR code...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-red-600 font-medium mb-2">Error</p>
                <p className="text-sm text-gray-600 text-center">{error}</p>
                <button
                  onClick={loadQRCodeInfo}
                  className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : info ? (
              <div className="space-y-6">
                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="p-4 bg-white border-2 border-gray-200 rounded-xl">
                    <QRCodeSVG
                      value={info.url}
                      size={256}
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                </div>

                {/* Public URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Public URL
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={info.url}
                      readOnly
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono text-gray-700"
                    />
                    <button
                      onClick={handleCopyUrl}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Copy URL"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                    <button
                      onClick={handleOpenMenu}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Open menu in new tab"
                    >
                      <ExternalLink className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  {copied && (
                    <p className="mt-2 text-sm text-green-600">URL copied to clipboard!</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download PNG</span>
                  </button>
                </div>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Print this QR code and place it on your restaurant tables.
                    Customers can scan it to view your menu instantly.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QRCodeModal;

