export type AvatarKey =
  | 'sunny'
  | 'mostly_sunny'
  | 'cloudy'
  | 'overcast'
  | 'rainy'
  | 'stormy'
  | 'foggy'
  | 'clearing'
  | 'moonlit';

export const VALID_AVATAR_KEYS: AvatarKey[] = [
  'sunny',
  'mostly_sunny',
  'cloudy',
  'overcast',
  'rainy',
  'stormy',
  'foggy',
  'clearing',
  'moonlit',
];

export interface Reflection {
  id: number;
  week_start: string; // YYYY-MM-DD (Monday)
  s1: string;
  s2: string;
  s3: string;
  avatar_key: AvatarKey;
  is_crisis: boolean;
  created_at: string;
}

export interface AIPayload {
  week_start: string;
  entries: Array<{
    day: string;
    emoji_score: number;
    word: string;
    breath: boolean;
  }>;
  entry_count: number;
  emoji_scale: string;
  user_locale: string;
}

export interface AIResponse {
  s1: string;
  s2: string;
  s3: string;
  avatar: AvatarKey;
  crisis?: boolean;
}
