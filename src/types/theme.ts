/**
 * Theme type definitions for brand customization
 */

export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface BrandTheme {
  brandColor: string;
  palette: ColorPalette;
  textOnBrand: string; // White or black based on contrast
}

export const DEFAULT_BRAND_COLOR = '#ee6620';

