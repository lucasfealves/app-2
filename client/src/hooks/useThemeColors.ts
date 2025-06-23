import { useEffect } from 'react';
import { useSiteSettings } from './useSiteSettings';

// Utility function to convert hex to HSL
function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function useThemeColors() {
  const { data: siteSettings } = useSiteSettings();

  useEffect(() => {
    if (siteSettings && typeof siteSettings === 'object') {
      const settings = siteSettings as any;
      if (settings.primaryColor && settings.secondaryColor) {
        const root = document.documentElement;
        
        // Convert colors to HSL format for CSS variables
        const primaryHsl = hexToHsl(settings.primaryColor);
        const secondaryHsl = hexToHsl(settings.secondaryColor);
        
        // Update CSS custom properties
        root.style.setProperty('--primary', primaryHsl);
        root.style.setProperty('--ring', primaryHsl);
        
        // Create lighter variants for backgrounds
        const primaryRgb = settings.primaryColor.slice(1).match(/.{2}/g)?.map((x: string) => parseInt(x, 16));
        if (primaryRgb) {
          const [r, g, b] = primaryRgb;
          // Light background variant (10% opacity)
          root.style.setProperty('--primary-light', `${r}, ${g}, ${b}, 0.1`);
          // Medium background variant (20% opacity)
          root.style.setProperty('--primary-medium', `${r}, ${g}, ${b}, 0.2`);
        }
        
        // Secondary color for accents
        root.style.setProperty('--accent', secondaryHsl);
        
        // Store colors in CSS variables for direct use
        root.style.setProperty('--color-primary', settings.primaryColor);
        root.style.setProperty('--color-secondary', settings.secondaryColor);
      }
    }
  }, [siteSettings]);

  const settings = siteSettings as any;
  return {
    primaryColor: settings?.primaryColor || '#2563eb',
    secondaryColor: settings?.secondaryColor || '#7c3aed',
  };
}