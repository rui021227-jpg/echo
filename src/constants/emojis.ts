import type { EmojiScore } from '../types/entry';

export interface EmojiOption {
  score: EmojiScore;
  emoji: string;
  colors: readonly [string, string];
}

export const EMOJI_SCALE: EmojiOption[] = [
  { score: 1, emoji: '😔', colors: ['#2A2A40', '#4A4A6A'] },
  { score: 2, emoji: '😕', colors: ['#3A3A55', '#6A6A8A'] },
  { score: 3, emoji: '😐', colors: ['#4A4A6A', '#8A8AAA'] },
  { score: 4, emoji: '🙂', colors: ['#5A5A80', '#AAAACC'] },
  { score: 5, emoji: '😊', colors: ['#6C6CA5', '#CCCCEE'] },
];
