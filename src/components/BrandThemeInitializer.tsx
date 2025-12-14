/**
 * Brand Theme Initializer
 * Initializes brand theme from location data
 */

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePublicMenuBySlug } from '../hooks/usePublicMenu';
import { useBrandThemeStore } from '../store/brandThemeStore';

interface BrandThemeInitializerProps {
  children: React.ReactNode;
}

const BrandThemeInitializer = ({ children }: BrandThemeInitializerProps) => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = usePublicMenuBySlug(slug || '');
  const { setBrandColor, brandColor, applyThemeToDOM } = useBrandThemeStore();

  // Track current slug to detect location changes
  const [currentSlug, setCurrentSlug] = React.useState<string | undefined>(slug);

  // Initialize with default on mount
  useEffect(() => {
    // Apply default theme immediately so page doesn't flash unstyled
    applyThemeToDOM();
  }, [applyThemeToDOM]);

  // Reset theme when slug changes (different location)
  useEffect(() => {
    if (slug && slug !== currentSlug) {
      console.log('[BrandTheme] Location changed, resetting theme');
      setCurrentSlug(slug);
      // Reset to default temporarily while new data loads
      setBrandColor('#ee6620');
    }
  }, [slug, currentSlug, setBrandColor]);

  // Update theme when data loads or changes
  useEffect(() => {
    if (isLoading) {
      console.log('[BrandTheme] Loading location data...');
      return;
    }

    if (!data?.location) {
      console.log('[BrandTheme] No location data available');
      return;
    }

    console.log('[BrandTheme] Location data loaded:', {
      locationName: data.location.name,
      brandColor: data.location.brandColor,
      currentBrandColor: brandColor
    });

    // Always update theme when brandColor from API changes
    // This handles navigation between different locations
    const apiBrandColor = data.location.brandColor || '#ee6620';
    
    // Always update if different (handles location changes and updates)
    if (apiBrandColor !== brandColor) {
      console.log('[BrandTheme] Setting brand color from API:', apiBrandColor);
      setBrandColor(apiBrandColor);
    } else {
      console.log('[BrandTheme] Brand color already set to:', apiBrandColor);
    }
  }, [data?.location?.brandColor, data?.location?.name, brandColor, setBrandColor, isLoading]);

  return <>{children}</>;
};

export default BrandThemeInitializer;

