// Supabase Edge Function: cloud-sync
// Handles anonymous device backup and restore of entries + reflections.
// Deploy with: supabase functions deploy cloud-sync

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'Content-Type',
};

interface Entry {
  date: string;          // YYYY-MM-DD
  emoji_score: 1 | 2 | 3 | 4 | 5;
  word: string;
  breath_taken: boolean;
  created_at: string;
}

interface Reflection {
  week_start: string;
  s1: string;
  s2: string;
  s3: string;
  avatar_key: string;
  is_crisis: boolean;
  created_at: string;
}

type Action = 'register' | 'push' | 'pull' | 'delete';

interface RequestBody {
  action: Action;
  device_id?: string;
  entries?: Entry[];
  reflections?: Reflection[];
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(s: string): boolean {
  return UUID_REGEX.test(s);
}

function validateEntry(e: unknown): e is Entry {
  if (!e || typeof e !== 'object') return false;
  const entry = e as Record<string, unknown>;
  return (
    typeof entry.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(entry.date) &&
    typeof entry.emoji_score === 'number' &&
    entry.emoji_score >= 1 &&
    entry.emoji_score <= 5 &&
    typeof entry.word === 'string' &&
    entry.word.length <= 20 &&
    typeof entry.breath_taken === 'boolean' &&
    typeof entry.created_at === 'string'
  );
}

function validateReflection(r: unknown): r is Reflection {
  if (!r || typeof r !== 'object') return false;
  const ref = r as Record<string, unknown>;
  return (
    typeof ref.week_start === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(ref.week_start) &&
    typeof ref.s1 === 'string' &&
    typeof ref.s2 === 'string' &&
    typeof ref.s3 === 'string' &&
    typeof ref.avatar_key === 'string' &&
    typeof ref.is_crisis === 'boolean' &&
    typeof ref.created_at === 'string'
  );
}

// Persistent rate limit: 10 requests per device per hour
async function checkRateLimit(deviceId: string): Promise<boolean> {
  const kv = await Deno.openKv();
  const key = ['rate_limit_sync', deviceId];
  const now = Date.now();

  const existing = await kv.get<{ count: number; resetAt: number }>(key);

  if (!existing.value || now > existing.value.resetAt) {
    await kv.set(key, { count: 1, resetAt: now + 3_600_000 }, { expireIn: 3_600_000 });
    return true;
  }

  if (existing.value.count >= 10) return false;

  await kv.set(
    key,
    { count: existing.value.count + 1, resetAt: existing.value.resetAt },
    { expireIn: existing.value.resetAt - now },
  );
  return true;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  const { action, device_id } = body;

  if (!action || !['register', 'push', 'pull', 'delete'].includes(action)) {
    return jsonResponse({ error: 'Invalid action' }, 400);
  }

  // All non-register actions require a valid device_id
  if (action !== 'register') {
    if (!device_id || !isValidUUID(device_id)) {
      return jsonResponse({ error: 'Invalid device_id' }, 400);
    }
    if (!(await checkRateLimit(device_id))) {
      return jsonResponse({ error: 'Rate limit exceeded' }, 429);
    }
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    // ── register ──────────────────────────────────────────────────────────────
    if (action === 'register') {
      const { data, error } = await supabase
        .from('device_identities')
        .insert({})
        .select('device_id')
        .single();

      if (error) throw error;
      return jsonResponse({ device_id: data.device_id });
    }

    // Verify device exists for all other actions
    const { data: identity } = await supabase
      .from('device_identities')
      .select('device_id')
      .eq('device_id', device_id!)
      .single();

    if (!identity) {
      return jsonResponse({ error: 'Device not found' }, 404);
    }

    // Update last_seen_at
    await supabase
      .from('device_identities')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('device_id', device_id!);

    // ── push ──────────────────────────────────────────────────────────────────
    if (action === 'push') {
      const entries: Entry[] = (body.entries ?? []).filter(validateEntry);
      const reflections: Reflection[] = (body.reflections ?? []).filter(validateReflection);

      let syncedEntries = 0;
      let syncedReflections = 0;

      if (entries.length > 0) {
        const { error } = await supabase.from('synced_entries').upsert(
          entries.map((e) => ({
            device_id: device_id!,
            date: e.date,
            emoji_score: e.emoji_score,
            word: e.word,
            breath_taken: e.breath_taken,
            created_at: e.created_at,
          })),
          { onConflict: 'device_id,date', ignoreDuplicates: false },
        );
        if (error) throw error;
        syncedEntries = entries.length;
      }

      if (reflections.length > 0) {
        const { error } = await supabase.from('synced_reflections').upsert(
          reflections.map((r) => ({
            device_id: device_id!,
            week_start: r.week_start,
            s1: r.s1,
            s2: r.s2,
            s3: r.s3,
            avatar_key: r.avatar_key,
            is_crisis: r.is_crisis,
            created_at: r.created_at,
          })),
          { onConflict: 'device_id,week_start', ignoreDuplicates: false },
        );
        if (error) throw error;
        syncedReflections = reflections.length;
      }

      return jsonResponse({ synced_entries: syncedEntries, synced_reflections: syncedReflections });
    }

    // ── pull ──────────────────────────────────────────────────────────────────
    if (action === 'pull') {
      const [entriesResult, reflectionsResult] = await Promise.all([
        supabase
          .from('synced_entries')
          .select('date, emoji_score, word, breath_taken, created_at')
          .eq('device_id', device_id!)
          .order('date', { ascending: true }),
        supabase
          .from('synced_reflections')
          .select('week_start, s1, s2, s3, avatar_key, is_crisis, created_at')
          .eq('device_id', device_id!)
          .order('week_start', { ascending: true }),
      ]);

      if (entriesResult.error) throw entriesResult.error;
      if (reflectionsResult.error) throw reflectionsResult.error;

      return jsonResponse({
        entries: entriesResult.data ?? [],
        reflections: reflectionsResult.data ?? [],
      });
    }

    // ── delete ────────────────────────────────────────────────────────────────
    if (action === 'delete') {
      const { error } = await supabase
        .from('device_identities')
        .delete()
        .eq('device_id', device_id!);

      if (error) throw error;
      return jsonResponse({ deleted: true });
    }

    return jsonResponse({ error: 'Unknown action' }, 400);
  } catch (err) {
    console.error('cloud-sync error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
