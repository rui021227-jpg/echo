import { getSetting, setSetting } from '../database/database';
import { getAllEntries, mergeEntries } from '../database/entries';
import { getAllReflections, mergeReflection } from '../database/reflections';
import { RUNTIME_CONFIG, warnMissingRuntimeConfig } from '../config';
import type { AvatarKey } from '../types/reflection';

const DEVICE_ID_KEY = 'cloud_sync_device_id';
const NO_BACKUP_ERROR_MESSAGE = 'No backup found. Back up first to enable restore.';

async function getOrCreateDeviceId(url: string): Promise<string> {
  const existing = await getSetting(DEVICE_ID_KEY);
  if (existing) return existing;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'register' }),
  });

  if (!response.ok) {
    throw new Error(`Register failed: ${response.status}`);
  }

  const data = (await response.json()) as { device_id: string };
  if (!data.device_id) throw new Error('No device_id in register response');

  await setSetting(DEVICE_ID_KEY, data.device_id);
  return data.device_id;
}

function getSyncUrl(): string {
  if (!RUNTIME_CONFIG.supabaseCloudSyncUrl) {
    warnMissingRuntimeConfig(
      'supabaseCloudSyncUrl',
      'Cloud sync is disabled until EXPO_PUBLIC_SUPABASE_CLOUD_SYNC_URL is set.',
    );
    throw new Error('Cloud sync not configured');
  }
  return RUNTIME_CONFIG.supabaseCloudSyncUrl;
}

export async function pushToCloud(): Promise<{ entries: number; reflections: number }> {
  const url = getSyncUrl();
  const deviceId = await getOrCreateDeviceId(url);

  const [entries, reflections] = await Promise.all([getAllEntries(), getAllReflections()]);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'push',
      device_id: deviceId,
      entries: entries.map((e) => ({
        date: e.date,
        emoji_score: e.emoji_score,
        word: e.word,
        breath_taken: e.breath_taken,
        created_at: e.created_at,
      })),
      reflections: reflections.map((r) => ({
        week_start: r.week_start,
        s1: r.s1,
        s2: r.s2,
        s3: r.s3,
        avatar_key: r.avatar_key,
        is_crisis: r.is_crisis,
        created_at: r.created_at,
      })),
    }),
  });

  if (!response.ok) {
    throw new Error(`Push failed: ${response.status}`);
  }

  const data = (await response.json()) as { synced_entries: number; synced_reflections: number };
  return { entries: data.synced_entries, reflections: data.synced_reflections };
}

export async function pullFromCloud(): Promise<{ entries: number; reflections: number }> {
  const url = getSyncUrl();
  const deviceId = await getSetting(DEVICE_ID_KEY);

  if (!deviceId) {
    throw new Error(NO_BACKUP_ERROR_MESSAGE);
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'pull', device_id: deviceId }),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(NO_BACKUP_ERROR_MESSAGE);
    }
    throw new Error(`Pull failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    entries: Array<{
      date: string;
      emoji_score: number;
      word: string;
      breath_taken: boolean;
      created_at: string;
    }>;
    reflections: Array<{
      week_start: string;
      s1: string;
      s2: string;
      s3: string;
      avatar_key: string;
      is_crisis: boolean;
      created_at: string;
    }>;
  };

  const entries = (data.entries ?? []).map((e) => ({
    id: 0,
    date: e.date,
    emoji_score: e.emoji_score as 1 | 2 | 3 | 4 | 5,
    word: e.word,
    breath_taken: e.breath_taken,
    created_at: e.created_at,
  }));

  const mergedEntries = await mergeEntries(entries);

  let mergedReflections = 0;
  for (const r of data.reflections ?? []) {
    const inserted = await mergeReflection(
      r.week_start,
      r.s1,
      r.s2,
      r.s3,
      r.avatar_key as AvatarKey,
      r.is_crisis,
      r.created_at,
    );
    if (inserted) {
      mergedReflections += 1;
    }
  }

  return { entries: mergedEntries, reflections: mergedReflections };
}

export async function deleteFromCloud(): Promise<void> {
  const url = getSyncUrl();
  const deviceId = await getSetting(DEVICE_ID_KEY);

  if (!deviceId) return; // Nothing to delete

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', device_id: deviceId }),
  });

  if (!response.ok) {
    throw new Error(`Delete failed: ${response.status}`);
  }

  await setSetting(DEVICE_ID_KEY, '');
}
