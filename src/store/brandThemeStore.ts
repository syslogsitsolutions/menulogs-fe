/**
 * Brand Theme Store (Zustand)
 * Manages brand color and applies it to the DOM via CSS variables
 */

import React from 'react';
import { create } from 'zustand';
import { generateColorPalette, getContrastTextColor } from '../lib/colorUtils';
import type { ColorPalette } from '../types/theme';
import { DEFAULT_BRAND_COLOR } from '../types/theme';

interface BrandThemeState {
  // State
  brandColor: string;
  palette: ColorPalette;
  textOnBrand: string;
  isInitialized: boolean;

  // Actions
  setBrandColor: (color: string) => void;
  resetToDefault: () => void;
  applyThemeToDOM: () => void;
}

export const useBrandThemeStore = create<BrandThemeState>((set, get) => ({
  brandColor: DEFAULT_BRAND_COLOR,
  palette: generateColorPalette(DEFAULT_BRAND_COLOR),
  textOnBrand: '#ffffff',
  isInitialized: false,

  setBrandColor: (color: string) => {
    // Validate hex color
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      console.warn('Invalid color format, using default');
      color = DEFAULT_BRAND_COLOR;
    }

    const palette = generateColorPalette(color);
    const textOnBrand = getContrastTextColor(color);
    
    console.log('[BrandTheme] Generating palette for:', color);
    
    set({ 
      brandColor: color, 
      palette, 
      textOnBrand,
      isInitialized: true 
    });
    
    // Apply to DOM immediately
    get().applyThemeToDOM();
  },

  resetToDefault: () => {
    get().setBrandColor(DEFAULT_BRAND_COLOR);
  },

  applyThemeToDOM: () => {
    const { palette, textOnBrand } = get();
    const root = document.documentElement;
    
    // Set CSS variables for each shade
    Object.entries(palette).forEach(([shade, value]) => {
      root.style.setProperty(`--brand-${shade}`, value);
    });
    
    // Set computed values
    root.style.setProperty('--brand-text', textOnBrand);
    
    console.log('[BrandTheme] Applied to DOM:', {
      brandColor: get().brandColor,
      paletteKeys: Object.keys(palette),
      textOnBrand
    });
  },
}));

/**
 * Hook to initialize theme from API data
 * Use this in customer-facing pages to set brand color from location data
 */
export const useInitializeBrandTheme = (brandColor?: string) => {
  const { setBrandColor, isInitialized } = useBrandThemeStore();
  
  React.useEffect(() => {
    if (brandColor && !isInitialized) {
      setBrandColor(brandColor);
    } else if (!brandColor && !isInitialized) {
      setBrandColor(DEFAULT_BRAND_COLOR);
    }
  }, [brandColor, isInitialized, setBrandColor]);
};

