import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { publicService } from '../../api';

const ContactPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['contactPage', slug],
    queryFn: () => publicService.getContactPage(slug || ''),
    enabled: !!slug,
  });

  if (!slug) {
    navigate('/');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading contact page...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark-900 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find the contact page for this restaurant.
          </p>
          <Link
            to={`/${slug}`}
            className="inline-flex items-center space-x-2 bg-brand-500 text-white px-6 py-3 rounded-lg hover:bg-brand-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Menu</span>
          </Link>
        </div>
      </div>
    );
  }

  const { location } = data;
  const contactContent = location.contactContent;
  const contactImage = location.contactImage;
  const mapEmbedUrl = location.mapEmbedUrl;

  // Format opening hours
  const formatHours = (hours: Record<string, any>) => {
    if (!hours) return null;
    
    const dayNames: Record<string, string> = {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
    };

    return Object.entries(hours).map(([day, dayHours]: [string, any]) => {
      const dayName = dayNames[day] || day;
      const hoursStr = dayHours?.isOpen 
        ? `${dayHours.openTime || '09:00'} - ${dayHours.closeTime || '22:00'}`
        : 'Closed';
      return { day: dayName, hours: hoursStr };
    });
  };

  const hoursList = formatHours(location.openingHours);

  const fullAddress = `${location.address}, ${location.city}, ${location.state} ${location.zipCode}`;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[350px] flex items-center justify-center overflow-hidden">
        {contactImage ? (
          <div className="absolute inset-0">
            <img
              src={contactImage}
              alt={location.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-brand-600" />
        )}
        
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 font-serif">
              Contact Us
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              We'd love to hear from you. Get in touch with us!
            </p>
          </motion.div>
        </div>

        {/* Back Button */}
        <Link
          to={`/${slug}`}
          className="absolute top-6 left-6 z-20 flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </Link>
      </section>

      {/* Contact Information Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-dark-900 mb-6 font-serif">
                  Get in Touch
                </h2>
                {contactContent && (
                  <div
                    className="text-gray-700 leading-relaxed mb-6 whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: contactContent }}
                  />
                )}
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-900 mb-1">Address</h3>
                    <p className="text-gray-600">{fullAddress}</p>
                    <p className="text-gray-600">{location.country}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-900 mb-1">Phone</h3>
                    <a href={`tel:${location.phone}`} className="text-brand-600 hover:text-brand-700 transition-colors">
                      {location.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-900 mb-1">Email</h3>
                    <a href={`mailto:${location.email}`} className="text-brand-600 hover:text-brand-700 transition-colors">
                      {location.email}
                    </a>
                  </div>
                </div>

                {hoursList && hoursList.length > 0 && (
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-brand-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-dark-900 mb-3">Opening Hours</h3>
                      <ul className="space-y-2">
                        {hoursList.map((item, index) => (
                          <li key={index} className="flex justify-between text-gray-600">
                            <span>{item.day}</span>
                            <span className="font-medium text-brand-600">{item.hours}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-dark-900 mb-6 font-serif">
                Find Us
              </h2>
              {mapEmbedUrl ? (
                <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
                  <iframe
                    src={mapEmbedUrl}
                    width="100%"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full"
                  />
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-gray-100 h-[450px] flex items-center justify-center">
                  <div className="text-center p-8">
                    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Map not available</p>
                    <p className="text-sm text-gray-500 mt-2">{fullAddress}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-brand-500 to-brand-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-serif">
              Visit Us Today
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              We're here to serve you. Come experience our exceptional cuisine and warm hospitality.
            </p>
            <Link
              to={`/${slug}`}
              className="inline-flex items-center space-x-2 bg-white text-brand-600 px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <span>View Our Menu</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;

