export const COLORS = {
  background: '#1a1a2e',
  surface: '#16213e',
  surfaceLight: '#1f2f50',
  primary: '#e2e2f0',
  secondary: '#a0a0c0',
  muted: '#6a6a8a',
  accent: '#7b7fda',
  white: '#ffffff',
  black: '#000000',
  danger: '#e74c3c',
  success: '#2ecc71',
} as const;

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  emoji: 64,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const SHADOWS = {
  card: {
    shadowColor: '#7b7fda',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  glow: {
    shadowColor: '#7b7fda',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
};

export const BORDERS = {
  card: {
    borderWidth: 1 as const,
    borderColor: 'rgba(123, 127, 218, 0.15)',
  },
  subtle: {
    borderWidth: 1 as const,
    borderColor: 'rgba(226, 226, 240, 0.08)',
  },
  accent: {
    borderWidth: 1 as const,
    borderColor: 'rgba(123, 127, 218, 0.4)',
  },
};
