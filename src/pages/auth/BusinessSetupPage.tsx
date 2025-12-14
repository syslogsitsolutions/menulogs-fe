import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Image as ImageIcon, FileText, ArrowRight, Upload, X } from 'lucide-react';
import { useCreateBusiness } from '@/hooks';

const BusinessSetupPage = () => {
  const navigate = useNavigate();
  const { mutate: createBusiness, isPending } = useCreateBusiness();
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [logoFile, setLogoFile] = useState<File | undefined>(undefined);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} exceeds 10MB limit`);
        return;
      }

      // Store the File object
      setLogoFile(file);
      
      // Create preview URL (blob URL for preview)
      const preview = URL.createObjectURL(file);
      setLogoPreview(preview);
    }
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const handleRemoveLogo = () => {
    // Cleanup blob URL if it exists
    if (logoPreview && logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoFile(undefined);
    setLogoPreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    createBusiness(
      {
        name: businessName,
        logo: logoFile || logoPreview || undefined, // Send File object if available, otherwise URL/base64
        description: description || undefined,
      },
      {
        onSuccess: () => {
          // Cleanup blob URL on success
          if (logoPreview && logoPreview.startsWith('blob:')) {
            URL.revokeObjectURL(logoPreview);
          }
          navigate('/location-setup');
        },
        onError: (error) => {
          console.error('Business setup error:', error);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-primary-600"></div>
            <div className="w-16 h-1 bg-primary-200"></div>
            <div className="w-3 h-3 rounded-full bg-primary-200"></div>
            <div className="w-16 h-1 bg-primary-200"></div>
            <div className="w-3 h-3 rounded-full bg-primary-200"></div>
          </div>
          <p className="text-center text-sm text-gray-600">Step 1 of 3: Business Information</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
              <Building2 className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-dark-900 mb-2 font-serif">Setup Your Business</h1>
            <p className="text-gray-600">Tell us about your restaurant business</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g., Fine Dining Group"
                  required
                />
              </div>
            </div>

            {/* Business Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Logo (Optional)
              </label>
              <div className="flex items-center space-x-4">
                {logoPreview ? (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 group">
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Remove logo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <label className="flex-1 cursor-pointer">
                  <div className="px-6 py-3 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-500 transition-colors text-center">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-600">{logoPreview ? 'Change logo' : 'Click to upload logo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Description (Optional)
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
                  rows={4}
                  placeholder="Brief description of your business..."
                />
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isPending || !businessName}
                className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
              >
                <span>{isPending ? 'Saving...' : 'Continue'}</span>
                {!isPending && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default BusinessSetupPage;

