// App Theme and Colors
import { IS_PRO } from './config';

const muscleColors = {
  chest: '#E74C3C',
  back: '#3498DB',
  shoulders: '#9B59B6',
  biceps: '#E67E22',
  triceps: '#F39C12',
  quads: '#27AE60',
  hamstrings: '#16A085',
  glutes: '#E91E63',
  calves: '#00BCD4',
  core: '#FF5722',
};

export const lightColors = {
  // Primary palette
  primary: '#000000',
  primaryLight: IS_PRO ? '#763208' : '#1a5c2a',
  primaryDark: IS_PRO ? '#4c1e04' : '#0d3318',

  // Accent colors
  accent: IS_PRO ? '#d65a03' : '#009e6f',
  accentLight: IS_PRO ? '#ff9b0e' : '#09bf9f',

  // Semantic colors
  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C',

  // Neutrals
  white: '#FFFFFF',
  background: '#F5F6FA',
  card: '#FFFFFF',
  border: '#E0E0E0',

  // Text
  textPrimary: '#2C3E50',
  textSecondary: '#7F8C8D',
  textLight: '#BDC3C7',
  textOnPrimary: '#FFFFFF',

  // Muscle group colors (same in both themes)
  muscleColors,
};

export const darkColors = {
  // Primary palette
  primary: '#000000',
  primaryLight: IS_PRO ? '#8a3a0a' : '#1e6e34',
  primaryDark: IS_PRO ? '#4c1e04' : '#0d3318',

  // Accent colors
  accent: IS_PRO ? '#d65a03' : '#009e6f',
  accentLight: IS_PRO ? '#ff9b0e' : '#09bf9f',

  // Semantic colors
  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C',

  // Neutrals
  white: '#FFFFFF',
  background: '#121212',
  card: '#1e1e1e',
  border: '#333333',

  // Text
  textPrimary: '#EEEEEE',
  textSecondary: '#AAAAAA',
  textLight: '#666666',
  textOnPrimary: '#FFFFFF',

  // Muscle group colors (same in both themes)
  muscleColors,
};

// Backward-compat alias — screens not yet on useTheme() still get light colors
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
};

// Font families
export const fonts = {
  regular: 'JosefinSans',
  bold: 'JosefinSans-Bold',
  italic: 'JosefinSans-Italic',
  boldItalic: 'JosefinSans-BoldItalic',
  narrow: 'ArialNarrow',
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};
