/**
 * Unified Image Upload Component
 * Supports up to 3 images with main image selection (main image at index 0)
 * Supports both File objects (for S3 upload) and URLs/base64 (backward compatible)
 */

import { useRef, useState, useEffect } from 'react';
import { Upload, X, Star, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export interface UnifiedImageUploadValue {
  /** Preview URLs (blob URLs for File objects, or URLs/base64 for existing images) - main image at index 0 */
  previews: string[];
  /** File objects if new files were selected (undefined entries for existing URLs/base64) */
  files?: (File | undefined)[];
}

export interface UnifiedImageUploadProps {
  /** Current images (base64 strings or URLs) - main image is at index 0 */
  images: string[];
  /** Callback when images change - provides preview URLs and optional File objects */
  onChange: (value: UnifiedImageUploadValue) => void;
  /** Maximum number of images allowed (default: 3) */
  maxImages?: number;
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
}

const UnifiedImageUpload = ({
  images = [],
  onChange,
  maxImages = 3,
  maxSizeMB = 10,
  label,
  error,
  required = false,
  className = '',
}: UnifiedImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<(File | undefined)[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previewUrls]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    fileArray.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name} is not an image file`);
        return;
      }

      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        errors.push(`${file.name} exceeds ${maxSizeMB}MB limit`);
        return;
      }

      validFiles.push(file);
    });

    // Check max images limit
    const totalImages = images.length + validFiles.length;
    if (totalImages > maxImages) {
      errors.push(`Maximum ${maxImages} image${maxImages > 1 ? 's' : ''} allowed`);
      return;
    }

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    // Create preview URLs for new files (blob URLs)
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    const newFiles: File[] = validFiles;

    // Merge with existing images
    const allPreviews = [...images, ...newPreviews];
    const allFiles = [...selectedFiles, ...newFiles];

    setSelectedFiles(allFiles);
    setPreviewUrls(newPreviews);

    // Call onChange with preview URLs and File objects
    onChange({ previews: allPreviews, files: allFiles });
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

  const handleRemoveImage = (index: number) => {
    // Clean up blob URL if it exists
    const previewToRemove = images[index];
    if (previewToRemove && previewToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(previewToRemove);
    }

    const newPreviews = images.filter((_, i) => i !== index);
    const newFiles = selectedFiles.filter((_, i) => i !== index);

    setSelectedFiles(newFiles);
    setPreviewUrls(previewUrls.filter((url) => url !== previewToRemove));

    onChange({ previews: newPreviews, files: newFiles });
  };

  const handleSetAsMain = (index: number) => {
    if (index === 0) return; // Already main image
    
    const newPreviews = [...images];
    const newFiles = [...selectedFiles];
    const [selectedPreview] = newPreviews.splice(index, 1);
    const [selectedFile] = newFiles.splice(index, 1);
    // Move selected image to the beginning (index 0)
    newPreviews.unshift(selectedPreview);
    newFiles.unshift(selectedFile);
    
    setSelectedFiles(newFiles);
    onChange({ previews: newPreviews, files: newFiles });
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleReplaceImage = (index: number) => {
    // Create a temporary input for replacement
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

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

      // Clean up old blob URL if it exists
      const oldPreview = images[index];
      if (oldPreview && oldPreview.startsWith('blob:')) {
        URL.revokeObjectURL(oldPreview);
      }

      // Create preview URL (blob URL for File object)
      const preview = URL.createObjectURL(file);
      const newPreviews = [...images];
      const newFiles = [...selectedFiles];
      newPreviews[index] = preview;
      newFiles[index] = file;

      setSelectedFiles(newFiles);
      setPreviewUrls((prev) => {
        if (oldPreview && prev.includes(oldPreview)) {
          return prev.map((url) => (url === oldPreview ? preview : url));
        }
        return [...prev, preview];
      });

      onChange({ previews: newPreviews, files: newFiles });
    };
    input.click();
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Images Row - Single horizontal layout */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4">
          {images.map((image, index) => {
            const isMain = index === 0;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group"
              >
                <div className={`
                  relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 shadow-sm transition-all
                  ${isMain 
                    ? 'ring-2 ring-yellow-400 ring-offset-2' 
                    : 'border border-gray-200 hover:border-gray-300'
                  }
                `}>
                  <img
                    src={image}
                    alt={isMain ? `Main image ${index + 1}` : `Image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  
                  {/* Main Image Badge */}
                  {isMain && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-yellow-400 bg-opacity-95 backdrop-blur-sm rounded-full">
                      <Star className="w-3 h-3 text-yellow-900 fill-yellow-900" />
                      <span className="text-xs font-semibold text-yellow-900">Main</span>
                    </div>
                  )}

                  {/* Hover Overlay with Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReplaceImage(index);
                        }}
                        className="p-2 bg-white rounded-lg shadow-md hover:bg-blue-50 hover:scale-110 transition-all"
                        title="Replace image"
                      >
                        <Upload className="w-4 h-4 text-blue-600" />
                      </button>
                      {!isMain && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetAsMain(index);
                          }}
                          className="p-2 bg-white rounded-lg shadow-md hover:bg-yellow-50 hover:scale-110 transition-all"
                          title="Set as main image"
                        >
                          <Star className="w-4 h-4 text-yellow-600" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(index);
                        }}
                        className="p-2 bg-white rounded-lg shadow-md hover:bg-red-50 hover:scale-110 transition-all"
                        title="Remove image"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Image Index Badge (for non-main images) */}
                  {!isMain && (
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black bg-opacity-60 backdrop-blur-sm rounded text-xs font-medium text-white">
                      {index + 1}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Upload Area - Full width */}
      {images.length < maxImages && (
        <div
          onClick={handleClickUpload}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            w-full flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-all py-8
            ${isDragging 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }
            ${error ? 'border-red-300 bg-red-50' : ''}
          `}
        >
          <div className="flex flex-col items-center justify-center">
            <Upload className={`w-8 h-8 mb-2 ${isDragging ? 'text-primary-600' : 'text-gray-400'}`} />
            <p className="text-sm text-center text-gray-600 font-medium mb-1">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-center text-gray-500">
              PNG, JPG, WebP, GIF up to {maxSizeMB}MB ({images.length} of {maxImages} images)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}

      {/* Helper Text */}
      {images.length > 0 && (
        <p className="mt-3 text-xs text-gray-500 flex items-start gap-1.5">
          <span className="text-yellow-500 mt-0.5">💡</span>
          <span>The first image is your main image. Click the star icon on any image to set it as main.</span>
        </p>
      )}
    </div>
  );
};

export default UnifiedImageUpload;

