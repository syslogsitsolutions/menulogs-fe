import { ChefHat, MapPin, Phone, Mail, Facebook, Instagram, Twitter, Linkedin, Youtube, Loader2 } from 'lucide-react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { usePublicMenuBySlug } from '../hooks/usePublicMenu';

const Footer = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const isRootPage = location.pathname === '/';
  
  // Only fetch business data if we have a slug (hook already handles enabled: !!slug)
  const { data, isLoading } = usePublicMenuBySlug(slug || '');

  const locationData = data?.location;
  const business = locationData?.business;

  // Format opening hours for display
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

    const days = Object.entries(hours).slice(0, 7);
    if (days.length === 0) return null;

    // Group consecutive days with same hours
    const groups: Array<{ days: string[]; hours: string }> = [];
    let currentGroup: { days: string[]; hours: string } | null = null;

    days.forEach(([day, dayHours]: [string, any]) => {
      const dayName = dayNames[day] || day;
      const hoursStr = dayHours?.isOpen 
        ? `${dayHours.openTime || '09:00'} - ${dayHours.closeTime || '22:00'}`
        : 'Closed';

      if (!currentGroup || currentGroup.hours !== hoursStr) {
        if (currentGroup) groups.push(currentGroup);
        currentGroup = { days: [dayName], hours: hoursStr };
      } else {
        currentGroup.days.push(dayName);
      }
    });

    if (currentGroup) groups.push(currentGroup);

    return groups.map(group => {
      const dayLabel = group.days.length === 1 
        ? group.days[0]
        : `${group.days[0]} - ${group.days[group.days.length - 1]}`;
      return { day: dayLabel, hours: group.hours };
    });
  };

  const hoursList = locationData?.openingHours ? formatHours(locationData.openingHours) : null;

  // Platform-wide footer for root page
  if (isRootPage) {
    return (
      <footer className="bg-dark-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <Link to="/" className="flex items-center space-x-2 mb-4 group">
                <div className="bg-gradient-to-br from-brand-500 to-brand-600 p-2 rounded-lg">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white font-serif">MenuLogs</h1>
                </div>
              </Link>
              <p className="text-sm text-gray-400 mb-4">
                The modern platform for restaurant menu management. Create, customize, and share your digital menus with ease.
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Powered by <span className="text-brand-400 font-medium">SysLogs IT Solutions</span>
              </p>
              <div className="flex space-x-4">
                <a href="https://facebook.com/menulogs" target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://instagram.com/menulogs" target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://twitter.com/menulogs" target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="https://linkedin.com/company/menulogs" target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-sm hover:text-brand-500 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-sm hover:text-brand-500 transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="text-sm hover:text-brand-500 transition-colors">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@menulogs.com" className="text-sm hover:text-brand-500 transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="https://docs.menulogs.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-brand-500 transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="https://blog.menulogs.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-brand-500 transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="mailto:contact@menulogs.com" className="text-sm hover:text-brand-500 transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="mailto:partners@menulogs.com" className="text-sm hover:text-brand-500 transition-colors">
                    Partnerships
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold mb-4">Get in Touch</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3 text-sm">
                  <Mail className="w-5 h-5 text-brand-500 flex-shrink-0" />
                  <a href="mailto:support@menulogs.com" className="hover:text-brand-500 transition-colors">
                    support@menulogs.com
                  </a>
                </li>
                <li className="flex items-center space-x-3 text-sm">
                  <Phone className="w-5 h-5 text-brand-500 flex-shrink-0" />
                  <a href="tel:+1234567890" className="hover:text-brand-500 transition-colors">
                    +91 97476 76079
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
              <p>&copy; {new Date().getFullYear()} MenuLogs by SysLogs IT Solutions. All rights reserved.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/privacy-policy" className="hover:text-brand-500 transition-colors">
                  Privacy Policy
                </Link>
                <span className="text-gray-600">•</span>
                <Link to="/terms-and-conditions" className="hover:text-brand-500 transition-colors">
                  Terms & Conditions
                </Link>
                <span className="text-gray-600">•</span>
                <Link to="/cookie-policy" className="hover:text-brand-500 transition-colors">
                  Cookie Policy
                </Link>
                <span className="text-gray-600">•</span>
                <Link to="/refund-policy" className="hover:text-brand-500 transition-colors">
                  Refund Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Business-specific footer for restaurant pages
  // Default values when no data
  const businessName = business?.name || 'Restaurant';
  const businessLogo = business?.logo;
  const brandDescription = business?.brandDescription || 'Experience culinary excellence with every dish.';
  const address = locationData?.address || '';
  const city = locationData?.city || '';
  const state = locationData?.state || '';
  const zipCode = locationData?.zipCode || '';
  const phone = locationData?.phone || '';
  const email = locationData?.email || '';

  const fullAddress = address ? `${address}, ${city}${state ? `, ${state}` : ''} ${zipCode}`.trim() : '';

  return (
    <footer className="bg-dark-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <Link to={slug ? `/${slug}` : '/'} className="flex items-center space-x-2 mb-4 group">
                {businessLogo ? (
                  <img src={businessLogo} alt={businessName} className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <div className="bg-gradient-to-br from-brand-500 to-brand-600 p-2 rounded-lg">
                    <ChefHat className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold text-white font-serif">{businessName}</h1>
                </div>
              </Link>
              <p className="text-sm text-gray-400 mb-4">
                {brandDescription}
              </p>
              <div className="flex space-x-4">
                {business?.facebookUrl && (
                  <a href={business.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {business?.instagramUrl && (
                  <a href={business.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {business?.twitterUrl && (
                  <a href={business.twitterUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {business?.linkedinUrl && (
                  <a href={business.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {business?.youtubeUrl && (
                  <a href={business.youtubeUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 transition-colors">
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to={slug ? `/${slug}` : '/'} className="text-sm hover:text-brand-500 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <a href="#categories" className="text-sm hover:text-brand-500 transition-colors">
                    Menu
                  </a>
                </li>
                {slug && (
                  <>
                    <li>
                      <Link to={`/${slug}/about`} className="text-sm hover:text-brand-500 transition-colors">
                        About Us
                      </Link>
                    </li>
                    <li>
                      <Link to={`/${slug}/contact`} className="text-sm hover:text-brand-500 transition-colors">
                        Contact
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Hours */}
            <div>
              <h3 className="text-white font-semibold mb-4">Opening Hours</h3>
              {hoursList && hoursList.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {hoursList.map((item, index) => (
                    <li key={index} className="flex justify-between">
                      <span>{item.day}</span>
                      <span className="text-brand-500">{item.hours}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Hours not available</p>
              )}
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-3">
                {fullAddress && (
                  <li className="flex items-start space-x-3 text-sm">
                    <MapPin className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                    <span>{fullAddress}</span>
                  </li>
                )}
                {phone && (
                  <li className="flex items-center space-x-3 text-sm">
                    <Phone className="w-5 h-5 text-brand-500 flex-shrink-0" />
                    <a href={`tel:${phone}`} className="hover:text-brand-500 transition-colors">
                      {phone}
                    </a>
                  </li>
                )}
                {email && (
                  <li className="flex items-center space-x-3 text-sm">
                    <Mail className="w-5 h-5 text-brand-500 flex-shrink-0" />
                    <a href={`mailto:${email}`} className="hover:text-brand-500 transition-colors">
                      {email}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} {businessName}. All rights reserved. Crafted with passion.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/privacy-policy" className="hover:text-brand-500 transition-colors">
                Privacy Policy
              </Link>
              <span className="text-gray-600">•</span>
              <Link to="/terms-and-conditions" className="hover:text-brand-500 transition-colors">
                Terms & Conditions
              </Link>
              <span className="text-gray-600">•</span>
              <Link to="/cookie-policy" className="hover:text-brand-500 transition-colors">
                Cookie Policy
              </Link>
              <span className="text-gray-600">•</span>
              <Link to="/refund-policy" className="hover:text-brand-500 transition-colors">
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

