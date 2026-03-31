import type { AvatarKey } from '../types/reflection';

export interface AvatarConfig {
  key: AvatarKey;
  emoji: string;
  label: string;
  gradientStart: string;
  gradientEnd: string;
}

export const AVATAR_MAP: Record<AvatarKey, AvatarConfig> = {
  sunny: {
    key: 'sunny',
    emoji: '☀️',
    label: 'Sunny',
    gradientStart: '#f6d365',
    gradientEnd: '#fda085',
  },
  mostly_sunny: {
    key: 'mostly_sunny',
    emoji: '🌤️',
    label: 'Mostly Sunny',
    gradientStart: '#d4a574',
    gradientEnd: '#e8c89e',
  },
  cloudy: {
    key: 'cloudy',
    emoji: '☁️',
    label: 'Cloudy',
    gradientStart: '#a0a0c0',
    gradientEnd: '#c0c0d8',
  },
  overcast: {
    key: 'overcast',
    emoji: '🌥️',
    label: 'Overcast',
    gradientStart: '#6a6a8a',
    gradientEnd: '#8a8aaa',
  },
  rainy: {
    key: 'rainy',
    emoji: '🌧️',
    label: 'Rainy',
    gradientStart: '#4a6a8a',
    gradientEnd: '#6a8aaa',
  },
  stormy: {
    key: 'stormy',
    emoji: '⛈️',
    label: 'Stormy',
    gradientStart: '#2a2a4a',
    gradientEnd: '#4a4a6a',
  },
  foggy: {
    key: 'foggy',
    emoji: '🌫️',
    label: 'Foggy',
    gradientStart: '#8a8a9a',
    gradientEnd: '#aaaabb',
  },
  clearing: {
    key: 'clearing',
    emoji: '⛅',
    label: 'Clearing',
    gradientStart: '#6a8aaa',
    gradientEnd: '#aaccee',
  },
  moonlit: {
    key: 'moonlit',
    emoji: '🌙',
    label: 'Moonlit',
    gradientStart: '#1a1a3e',
    gradientEnd: '#2a2a5e',
  },
};
