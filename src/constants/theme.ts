export const COLORS = {
  background: '#fcf9f1',
  surface: '#ffffff',
  surfaceLight: '#fef6e8',
  surfaceGlass: 'rgba(255,255,255,0.80)',
  primary: '#586a48',
  primaryLight: '#7a9060',
  primaryContainer: 'rgba(88,106,72,0.10)',
  accent: '#ffcf93',
  accentLight: '#ffdcc4',
  accentWarm: '#f5c07a',
  onBackground: '#1c1c17',
  onSurface: '#2e2e28',
  secondary: '#6b6b5e',
  muted: '#9e9e8e',
  placeholder: '#b5b5a3',
  white: '#ffffff',
  black: '#000000',
  danger: '#c0392b',
  success: '#586a48',
} as const;

export const GRADIENTS = {
  primary: ['#ffcf93', '#ffdcc4'] as const,
  accent: ['#586a48', '#7a9060'] as const,
  background: ['#fcf9f1', '#fef6e8'] as const,
  glass: ['rgba(255,255,255,0.85)', 'rgba(255,255,255,0.65)'] as const,
  glow: ['rgba(255,207,147,0.15)', 'rgba(255,220,196,0.05)'] as const,
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
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  full: 9999,
} as const;

export const SHADOWS = {
  card: {
    shadowColor: '#586a48',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 24,
    elevation: 4,
  },
  glow: {
    shadowColor: '#ffcf93',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.20,
    shadowRadius: 20,
    elevation: 6,
  },
  soft: {
    shadowColor: '#1c1c17',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
};

export const GRAIN_OPACITY = 0.04;
