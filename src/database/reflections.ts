import { getDatabase } from './database';
import type { AvatarKey, Reflection } from '../types/reflection';

interface ReflectionRow {
  id: number;
  week_start: string;
  s1: string;
  s2: string;
  s3: string;
  avatar_key: string;
  is_crisis: number;
  created_at: string;
}

function mapRow(row: ReflectionRow): Reflection {
  return {
    id: row.id,
    week_start: row.week_start,
    s1: row.s1,
    s2: row.s2,
    s3: row.s3,
    avatar_key: row.avatar_key as AvatarKey,
    is_crisis: row.is_crisis === 1,
    created_at: row.created_at,
  };
}

export async function insertReflection(
  weekStart: string,
  s1: string,
  s2: string,
  s3: string,
  avatarKey: AvatarKey,
  isCrisis: boolean,
): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO reflections (week_start, s1, s2, s3, avatar_key, is_crisis) VALUES (?, ?, ?, ?, ?, ?)',
    weekStart,
    s1,
    s2,
    s3,
    avatarKey,
    isCrisis ? 1 : 0,
  );
}

export async function getReflectionForWeek(
  weekStart: string,
): Promise<Reflection | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<ReflectionRow>(
    'SELECT * FROM reflections WHERE week_start = ?',
    weekStart,
  );
  return row ? mapRow(row) : null;
}

export async function getLatestReflection(): Promise<Reflection | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<ReflectionRow>(
    'SELECT * FROM reflections ORDER BY week_start DESC LIMIT 1',
  );
  return row ? mapRow(row) : null;
}

export async function getReflectionCountThisMonth(): Promise<number> {
  const db = getDatabase();
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM reflections WHERE week_start >= ?',
    monthStart,
  );
  return row?.count ?? 0;
}
