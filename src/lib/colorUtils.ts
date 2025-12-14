/**
 * Color utility functions for brand theming
 * Generates color palettes and calculates contrast for accessibility
 */

import type { ColorPalette } from '../types/theme';

/**
 * Convert hex color to HSL
 */
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s, l };
}

/**
 * Convert HSL to hex
 */
function hslToHex(h: number, s: number, l: number): string {
  h = h % 360;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h < 60) {
    r = c; g = x; b = 0;
  } else if (h < 120) {
    r = x; g = c; b = 0;
  } else if (h < 180) {
    r = 0; g = c; b = x;
  } else if (h < 240) {
    r = 0; g = x; b = c;
  } else if (h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Calculate relative luminance for contrast calculation
 */
function getLuminance(hex: string): number {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const [rs, gs, bs] = [r, g, b].map((val) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Generate a full color palette (50-900) from a base color
 * Uses HSL manipulation to create lighter and darker shades
 */
export function generateColorPalette(baseColor: string): ColorPalette {
  // Validate hex color
  if (!/^#[0-9A-Fa-f]{6}$/.test(baseColor)) {
    console.warn(`Invalid color format: ${baseColor}, using default`);
    baseColor = '#ee6620';
  }

  const { h, s, l } = hexToHsl(baseColor);

  // Generate shades by adjusting lightness
  // 50 is lightest, 900 is darkest
  const shades: ColorPalette = {
    50: hslToHex(h, Math.max(0, s - 0.3), Math.min(0.95, l + 0.45)), // Very light
    100: hslToHex(h, Math.max(0, s - 0.25), Math.min(0.9, l + 0.35)),
    200: hslToHex(h, Math.max(0, s - 0.2), Math.min(0.85, l + 0.25)),
    300: hslToHex(h, Math.max(0, s - 0.1), Math.min(0.75, l + 0.15)),
    400: hslToHex(h, Math.max(0, s - 0.05), Math.min(0.65, l + 0.05)),
    500: baseColor, // Base color
    600: hslToHex(h, Math.min(1, s + 0.05), Math.max(0.25, l - 0.1)),
    700: hslToHex(h, Math.min(1, s + 0.1), Math.max(0.2, l - 0.2)),
    800: hslToHex(h, Math.min(1, s + 0.15), Math.max(0.15, l - 0.3)),
    900: hslToHex(h, Math.min(1, s + 0.2), Math.max(0.1, l - 0.4)), // Very dark
  };

  return shades;
}

/**
 * Determine the best text color (black or white) for a background color
 * Returns white for dark backgrounds, black for light backgrounds
 */
export function getContrastTextColor(backgroundColor: string): string {
  const whiteContrast = getContrastRatio(backgroundColor, '#ffffff');
  const blackContrast = getContrastRatio(backgroundColor, '#000000');

  // Use the color with higher contrast
  // WCAG AA requires 4.5:1 for normal text, but we'll use whichever is higher
  return whiteContrast > blackContrast ? '#ffffff' : '#000000';
}

/**
 * Validate hex color format
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Normalize hex color (ensure uppercase, add # if missing)
 */
export function normalizeHexColor(color: string): string {
  color = color.trim();
  if (!color.startsWith('#')) {
    color = '#' + color;
  }
  return color.toUpperCase();
}

