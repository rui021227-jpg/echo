import type { Entry } from '../types/entry';
import type { AIPayload, AIResponse, AvatarKey } from '../types/reflection';
import { VALID_AVATAR_KEYS } from '../types/reflection';
import { getDayName } from '../utils/dateHelpers';
import { isContentSafe } from './contentFilter';
import { isCrisis } from './crisisDetector';
import { getEntriesForWeek } from '../db/entries';
import { insertReflection, getReflectionForWeek } from '../db/reflections';
import { COPY } from '../constants/copy';
import { RUNTIME_CONFIG, warnMissingRuntimeConfig } from '../config';

export function buildPayload(weekStart: string, entries: Entry[]): AIPayload {
  return {
    week_start: weekStart,
    entries: entries.map((e) => ({
      day: getDayName(e.date),
      emoji_score: e.emoji_score,
      word: e.word,
      breath: e.breath_taken,
    })),
    entry_count: entries.length,
    emoji_scale: '1=lowest 5=highest',
    user_locale: 'en',
  };
}

async function fetchReflection(payload: AIPayload): Promise<AIResponse> {
  if (!RUNTIME_CONFIG.supabaseEdgeFunctionUrl) {
    warnMissingRuntimeConfig(
      'supabaseEdgeFunctionUrl',
      'Weekly reflections are disabled until EXPO_PUBLIC_SUPABASE_EDGE_FUNCTION_URL is set.',
    );
    throw new Error('Missing Supabase Edge Function URL');
  }

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15_000);

      const response = await fetch(RUNTIME_CONFIG.supabaseEdgeFunctionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return parseAIResponse(data);
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        // Exponential backoff: 1s, 2s
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError ?? new Error('Failed to fetch reflection');
}

function validateAvatarKey(key: string): AvatarKey {
  if (VALID_AVATAR_KEYS.includes(key as AvatarKey)) {
    return key as AvatarKey;
  }
  return 'cloudy'; // fallback
}

export function parseAIResponse(input: unknown): AIResponse {
  if (!input || typeof input !== 'object') {
    throw new Error('Malformed AI response');
  }

  const candidate = input as Record<string, unknown>;
  if (
    typeof candidate.s1 !== 'string' ||
    typeof candidate.s2 !== 'string' ||
    typeof candidate.s3 !== 'string'
  ) {
    throw new Error('Malformed AI response');
  }

  if (candidate.crisis !== undefined && typeof candidate.crisis !== 'boolean') {
    throw new Error('Malformed AI response');
  }

  return {
    s1: candidate.s1,
    s2: candidate.s2,
    s3: candidate.s3,
    avatar:
      typeof candidate.avatar === 'string'
        ? validateAvatarKey(candidate.avatar)
        : 'cloudy',
    ...(candidate.crisis !== undefined ? { crisis: candidate.crisis } : {}),
  };
}

export type ReflectionResult = 'success' | 'crisis' | 'filtered' | 'cached' | 'error';

export async function processReflection(
  weekStart: string,
): Promise<{ result: ReflectionResult; error?: string }> {
  try {
    // Check if we already have a reflection for this week
    const existing = await getReflectionForWeek(weekStart);
    if (existing) {
      return { result: 'cached' };
    }

    const entries = await getEntriesForWeek(weekStart);

    // No entries: store a moonlit reflection
    if (entries.length === 0) {
      await insertReflection(
        weekStart,
        'A quiet week.',
        'Sometimes rest is the whole story.',
        'See you when you\u2019re ready.',
        'moonlit',
        false,
      );
      return { result: 'success' };
    }

    const payload = buildPayload(weekStart, entries);
    const response = await fetchReflection(payload);
    const avatarKey = response.avatar;

    // Crisis check — do NOT store, just signal
    if (isCrisis(response)) {
      return { result: 'crisis' };
    }

    // Content filter
    if (!isContentSafe(response)) {
      // Store the fallback card
      await insertReflection(
        weekStart,
        COPY.reflection.fallback,
        '',
        '',
        'cloudy',
        false,
      );
      return { result: 'filtered' };
    }

    // Store the reflection
    await insertReflection(
      weekStart,
      response.s1,
      response.s2,
      response.s3,
      avatarKey,
      false,
    );

    return { result: 'success' };
  } catch (error) {
    return {
      result: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
