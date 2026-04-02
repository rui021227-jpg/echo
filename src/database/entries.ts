import { getDatabase } from './database';
import type { Entry, EmojiScore } from '../types/entry';
import { todayISO, getWeekDates } from '../utils/dateHelpers';

export class EntryAlreadyExistsError extends Error {
  constructor(date: string) {
    super(`Entry already exists for ${date}`);
    this.name = 'EntryAlreadyExistsError';
  }
}

export function isDuplicateEntryError(error: unknown): boolean {
  return error instanceof EntryAlreadyExistsError;
}

export async function insertEntry(
  date: string,
  emojiScore: EmojiScore,
  word: string,
  breathTaken: boolean,
): Promise<void> {
  const db = getDatabase();
  try {
    await db.runAsync(
      'INSERT INTO entries (date, emoji_score, word, breath_taken) VALUES (?, ?, ?, ?)',
      date,
      emojiScore,
      word.trim(),
      breathTaken ? 1 : 0,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('UNIQUE constraint failed')) {
      throw new EntryAlreadyExistsError(date);
    }

    throw error;
  }
}

export async function getEntryByDate(date: string): Promise<Entry | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<{
    id: number;
    date: string;
    emoji_score: number;
    word: string;
    breath_taken: number;
    created_at: string;
  }>('SELECT * FROM entries WHERE date = ?', date);

  if (!row) return null;

  return {
    id: row.id,
    date: row.date,
    emoji_score: row.emoji_score as EmojiScore,
    word: row.word,
    breath_taken: row.breath_taken === 1,
    created_at: row.created_at,
  };
}

export async function getEntriesForWeek(weekStart: string): Promise<Entry[]> {
  const db = getDatabase();
  const dates = getWeekDates(weekStart);
  const placeholders = dates.map(() => '?').join(',');
  const rows = await db.getAllAsync<{
    id: number;
    date: string;
    emoji_score: number;
    word: string;
    breath_taken: number;
    created_at: string;
  }>(`SELECT * FROM entries WHERE date IN (${placeholders}) ORDER BY date`, ...dates);

  return rows.map((row) => ({
    id: row.id,
    date: row.date,
    emoji_score: row.emoji_score as EmojiScore,
    word: row.word,
    breath_taken: row.breath_taken === 1,
    created_at: row.created_at,
  }));
}

export async function hasEntryToday(): Promise<boolean> {
  const entry = await getEntryByDate(todayISO());
  return entry !== null;
}
