import type { EmojiScore } from '../types/entry';

export interface EmojiOption {
  score: EmojiScore;
  emoji: string;
  color: string;
}

export const EMOJI_SCALE: EmojiOption[] = [
  { score: 1, emoji: '😔', color: '#4a4a6a' },
  { score: 2, emoji: '😕', color: '#6a6a8a' },
  { score: 3, emoji: '😐', color: '#8a8aaa' },
  { score: 4, emoji: '🙂', color: '#aaaacc' },
  { score: 5, emoji: '😊', color: '#ccccee' },
];
