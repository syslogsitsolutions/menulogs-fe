/**
 * Single Image Upload Component
 * Professional single image upload with improved UI
 * Supports both File objects (for S3 upload) and URLs/base64 (backward compatible)
 */

import { useRef, useState, useEffect } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export interface SingleImageUploadValue {
  /** Preview URL (blob URL for File objects, or URL/base64 for existing images) */
  preview: string;
  /** File object if a new file was selected (undefined for existing URLs/base64) */
  file?: File;
}

export interface SingleImageUploadProps {
  /** Current image (base64 string or URL) */
  image: string;
  /** Callback when image changes - provides preview URL and optional File object */
  onChange: (value: SingleImageUploadValue) => void;
  /** Maximum file size in MB (default: 10) */
  maxSizeMB?: number;
  /** Label for the upload area */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Custom class name */
  className?: string;
  /** Aspect ratio for image preview (default: 'aspect-video') */
  aspectRatio?: 'aspect-square' | 'aspect-video' | 'aspect-auto';
}

const SingleImageUpload = ({
  image = '',
  onChange,
  maxSizeMB = 10,
  label,
  error,
  required = false,
  className = '',
  aspectRatio = 'aspect-video',
}: SingleImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [_selectedFile, setSelectedFile] = useState<File | null>(null);

  // Generate preview URL for File object
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    // If image prop changes externally (e.g., loaded from server), clear file selection
    if (image && !image.startsWith('blob:')) {
      setSelectedFile(null);
      // Clean up old blob URL if it exists
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl('');
    }
  }, [image, previewUrl]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(`${file.name} is not an image file`);
      return;
    }

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`${file.name} exceeds ${maxSizeMB}MB limit`);
      return;
    }

    // Store file object
    setSelectedFile(file);

    // Create preview URL (blob URL for File objects)
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    // Call onChange with preview URL and File object
    onChange({ preview, file });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemoveImage = () => {
    // Clean up blob URL if it exists
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl('');
    onChange({ preview: '', file: undefined });
  };

  // Determine which image to display (preview URL or image prop)
  const displayImage = previewUrl || image;

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Image Preview */}
      {displayImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group mb-4"
        >
          <div 
            className={`relative ${aspectRatio} rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-sm cursor-pointer`}
            onClick={handleClickUpload}
          >
            <img
              src={displayImage}
              alt="Upload preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            {/* Remove Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage();
              }}
              className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg z-10"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
            {/* Overlay on hover with replace hint */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white bg-opacity-90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
                  <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Click to replace
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Upload Area */}
      {!displayImage && (
        <div
          onClick={handleClickUpload}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            w-full flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-all py-12
            ${isDragging 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }
            ${error ? 'border-red-300 bg-red-50' : ''}
          `}
        >
          <div className="flex flex-col items-center justify-center">
            <Upload className={`w-10 h-10 mb-3 ${isDragging ? 'text-primary-600' : 'text-gray-400'}`} />
            <p className="text-sm text-center text-gray-600 font-medium mb-1">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-center text-gray-500">
              PNG, JPG, WebP, GIF up to {maxSizeMB}MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      )}

      {/* Replace Image Button (when image exists) */}
      {/* {image && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleClickUpload();
          }}
          className="w-full px-4 py-2.5 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 hover:border-primary-300 transition-colors"
        >
          Replace Image
        </button>
      )} */}

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

export default SingleImageUpload;

