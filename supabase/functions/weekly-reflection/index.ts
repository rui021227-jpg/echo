// Supabase Edge Function: weekly-reflection
// Deploy with: supabase functions deploy weekly-reflection

const SYSTEM_PROMPT = `You are a warm, perceptive weekly reflection for a mood app.
Your reader is a university student aged 18-25.

Return ONLY this JSON and nothing else:
{
  "s1": "[What happened — factual, specific, no judgment]",
  "s2": "[One pattern noticed — gentle, curious, not prescriptive]",
  "s3": "[One small warm observation — ends the card softly]",
  "avatar": "[one of: sunny|mostly_sunny|cloudy|overcast|rainy|stormy|foggy|clearing|moonlit]"
}

HARD RULES:
- Each sentence is 15-25 words maximum
- Never use: 'you should', 'try to', 'I recommend', 'this suggests you have'
- Never diagnose, score, or label the week as good or bad
- Never mention the app, streaks, or missing days critically
- If 4+ entries score 1, add: "crisis": true to the JSON
- Raw JSON only — no markdown, no preamble, no explanation

TONE: a wise friend who pays close attention. Warm but never saccharine.
Not a therapist. Not a coach. A mirror.`;

const VALID_AVATARS = new Set([
  'sunny', 'mostly_sunny', 'cloudy', 'overcast',
  'rainy', 'stormy', 'foggy', 'clearing', 'moonlit',
]);

// Sanitize user-submitted word before it reaches the AI prompt
function sanitizeWord(word: unknown): string {
  if (typeof word !== 'string') return '';
  // Allow letters, numbers, spaces, apostrophes, hyphens only
  return word.replace(/[^a-zA-Z0-9 '\-]/g, '').trim().slice(0, 20);
}

function parseAIResponse(input: unknown) {
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
      typeof candidate.avatar === 'string' && VALID_AVATARS.has(candidate.avatar)
        ? candidate.avatar
        : 'cloudy',
    ...(candidate.crisis !== undefined ? { crisis: candidate.crisis } : {}),
  };
}

interface AIPayload {
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

// Persistent rate limiting via Deno KV (survives cold starts, unlike in-memory Map)
async function checkRateLimit(ip: string): Promise<boolean> {
  const kv = await Deno.openKv();
  const key = ['rate_limit', ip];
  const now = Date.now();
  const resetAt = now + 3_600_000; // 1 hour window

  const existing = await kv.get<{ count: number; resetAt: number }>(key);

  if (!existing.value || now > existing.value.resetAt) {
    await kv.set(key, { count: 1, resetAt }, { expireIn: 3_600_000 });
    return true;
  }

  if (existing.value.count >= 2) return false;

  await kv.set(
    key,
    { count: existing.value.count + 1, resetAt: existing.value.resetAt },
    { expireIn: existing.value.resetAt - now },
  );
  return true;
}

Deno.serve(async (req: Request) => {
  // Health check
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({ status: 'ok', function: 'weekly-reflection', ts: new Date().toISOString() }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  }

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Rate limit (persistent across cold starts)
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (!(await checkRateLimit(ip))) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const payload: AIPayload = await req.json();

    // Validate
    if (!payload.entries || payload.entries.length === 0) {
      return new Response(JSON.stringify({ error: 'No entries provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    for (const entry of payload.entries) {
      if (entry.emoji_score < 1 || entry.emoji_score > 5) {
        return new Response(JSON.stringify({ error: 'Invalid emoji_score' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Sanitize user words before they reach the AI prompt
    const sanitizedPayload = {
      ...payload,
      entries: payload.entries.map((e) => ({ ...e, word: sanitizeWord(e.word) })),
    };

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: JSON.stringify(sanitizedPayload) },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', errorText);
      return new Response(JSON.stringify({ error: 'AI service unavailable' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(JSON.stringify({ error: 'Empty AI response' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = parseAIResponse(JSON.parse(content));

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
