export interface Entry {
  id: number;
  date: string; // YYYY-MM-DD
  emoji_score: 1 | 2 | 3 | 4 | 5;
  word: string;
  breath_taken: boolean;
  created_at: string;
}

export type EmojiScore = 1 | 2 | 3 | 4 | 5;
