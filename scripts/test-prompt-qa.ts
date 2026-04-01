/**
 * Prompt QA script — tests 50 payloads against the deployed edge function.
 *
 * Usage:
 *   npx ts-node scripts/test-prompt-qa.ts
 *
 * Requires EXPO_PUBLIC_SUPABASE_EDGE_FUNCTION_URL to be set in .env
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env manually (no dotenv dependency needed)
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
}

const EDGE_FUNCTION_URL = process.env.EXPO_PUBLIC_SUPABASE_EDGE_FUNCTION_URL;
const PROHIBITED = ['should', 'recommend', 'disorder', 'diagnose', 'depressed', 'anxiety disorder', 'mental illness', 'you need to'];
const VALID_AVATARS = new Set(['sunny', 'mostly_sunny', 'cloudy', 'overcast', 'rainy', 'stormy', 'foggy', 'clearing', 'moonlit']);
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface Entry { day: string; emoji_score: number; word: string; breath: boolean; }
interface Payload { week_start: string; entries: Entry[]; entry_count: number; emoji_scale: string; user_locale: string; }
interface Result { s1: string; s2: string; s3: string; avatar: string; crisis?: boolean; }

function randomScore(min = 1, max = 5): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 50 test scenarios covering a range of week patterns
const WORDS = ['tired', 'good', 'okay', 'heavy', 'light', 'stuck', 'calm', 'anxious', 'focused', 'lost', 'happy', 'numb', 'hopeful', 'drained', 'alive'];

function makePayload(scenario: {
  label: string;
  scores: number[];
  words?: string[];
  days?: string[];
}): { label: string; payload: Payload } {
  const entries = scenario.scores.map((score, i) => ({
    day: (scenario.days ?? DAYS)[i] ?? DAYS[i % DAYS.length],
    emoji_score: score,
    word: scenario.words?.[i] ?? pick(WORDS),
    breath: Math.random() > 0.5,
  }));

  return {
    label: scenario.label,
    payload: {
      week_start: '2026-03-23',
      entries,
      entry_count: entries.length,
      emoji_scale: '1=awful,2=rough,3=okay,4=good,5=great',
      user_locale: 'en-AU',
    },
  };
}

const SCENARIOS = [
  // Happy weeks
  makePayload({ label: 'All 5s — great week', scores: [5, 5, 5, 5, 5, 5, 5] }),
  makePayload({ label: 'All 4s — steady good week', scores: [4, 4, 4, 4, 4, 4, 4] }),
  makePayload({ label: 'Mixed high — mostly good', scores: [5, 4, 5, 3, 5, 4, 5] }),

  // Difficult weeks
  makePayload({ label: 'All 1s — crisis threshold (4+ scores of 1)', scores: [1, 1, 1, 1, 1, 1, 1] }),
  makePayload({ label: 'Exactly 4 ones — crisis edge case', scores: [1, 1, 1, 1, 3, 4, 5] }),
  makePayload({ label: 'All 2s — rough week', scores: [2, 2, 2, 2, 2, 2, 2] }),
  makePayload({ label: 'Mixed low', scores: [1, 2, 1, 2, 3, 2, 1] }),

  // Mixed weeks
  makePayload({ label: 'Rollercoaster', scores: [1, 5, 1, 5, 1, 5, 3] }),
  makePayload({ label: 'Improving through week', scores: [1, 2, 2, 3, 4, 4, 5] }),
  makePayload({ label: 'Declining through week', scores: [5, 4, 4, 3, 2, 2, 1] }),
  makePayload({ label: 'Mid-week dip', scores: [4, 4, 1, 2, 1, 4, 4] }),
  makePayload({ label: 'Weekend recovery', scores: [2, 2, 2, 2, 3, 5, 5] }),
  makePayload({ label: 'Strong start, weak finish', scores: [5, 5, 5, 3, 2, 1, 1] }),
  makePayload({ label: 'Flat neutral week', scores: [3, 3, 3, 3, 3, 3, 3] }),

  // Sparse entries (missed days)
  makePayload({ label: '1 entry only — Monday', scores: [3], days: ['Monday'] }),
  makePayload({ label: '2 entries — Mon + Fri', scores: [4, 2], days: ['Monday', 'Friday'] }),
  makePayload({ label: '3 entries — scattered', scores: [5, 1, 3], days: ['Tuesday', 'Thursday', 'Sunday'] }),
  makePayload({ label: '3 entries — all low', scores: [1, 2, 1], days: ['Monday', 'Wednesday', 'Friday'] }),
  makePayload({ label: '4 entries — good mix', scores: [4, 3, 5, 2], days: ['Monday', 'Tuesday', 'Thursday', 'Saturday'] }),
  makePayload({ label: '5 entries — one missing', scores: [3, 4, 2, 5, 3], days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] }),

  // Word variety
  makePayload({ label: 'Emotional words', scores: [3, 3, 3, 3, 3], words: ['lost', 'heavy', 'numb', 'stuck', 'tired'], days: DAYS.slice(0, 5) }),
  makePayload({ label: 'Positive words + low scores', scores: [2, 2, 1, 2, 1], words: ['hopeful', 'calm', 'okay', 'light', 'alive'], days: DAYS.slice(0, 5) }),
  makePayload({ label: 'Negative words + high scores', scores: [4, 5, 4, 5, 4], words: ['tired', 'drained', 'heavy', 'anxious', 'stuck'], days: DAYS.slice(0, 5) }),
  makePayload({ label: 'Single-char words', scores: [3, 3, 3], words: ['ok', 'eh', 'no'], days: ['Monday', 'Wednesday', 'Friday'] }),

  // Breath patterns
  makePayload({ label: 'All breath taken', scores: [3, 3, 3, 3, 3, 3, 3] }),
  makePayload({ label: 'No breath taken', scores: [3, 3, 3, 3, 3, 3, 3] }),

  // Locales
  ...(['en-AU', 'en-US', 'en-GB'] as const).map(locale => ({
    label: `Locale: ${locale}`,
    payload: {
      week_start: '2026-03-23',
      entries: [{ day: 'Monday', emoji_score: 3, word: 'okay', breath: true }],
      entry_count: 1,
      emoji_scale: '1=awful,2=rough,3=okay,4=good,5=great',
      user_locale: locale,
    } as Payload,
  })),

  // More diverse weeks to reach 50
  makePayload({ label: 'Monday 5, rest 1s', scores: [5, 1, 1, 1, 1, 1, 1] }),
  makePayload({ label: 'Sunday only — low', scores: [1], days: ['Sunday'] }),
  makePayload({ label: 'Sunday only — high', scores: [5], days: ['Sunday'] }),
  makePayload({ label: 'Alternating 1 and 5', scores: [1, 5, 1, 5, 1, 5, 1] }),
  makePayload({ label: 'Alternating 5 and 1', scores: [5, 1, 5, 1, 5, 1, 5] }),
  makePayload({ label: '3 ones exactly — no crisis', scores: [1, 1, 1, 4, 5, 4, 3] }),
  makePayload({ label: 'Week with one outlier high', scores: [2, 2, 2, 5, 2, 2, 2] }),
  makePayload({ label: 'Week with one outlier low', scores: [4, 4, 4, 1, 4, 4, 4] }),
  makePayload({ label: '6 entries, one missing day', scores: [3, 4, 3, 4, 3, 4], days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday', 'Sunday'] }),
  makePayload({ label: 'All 3s with words', scores: [3, 3, 3, 3, 3, 3, 3], words: ['okay', 'fine', 'meh', 'okay', 'okay', 'okay', 'okay'] }),
  makePayload({ label: 'High scores, negative words', scores: [5, 5, 4, 5, 4], words: ['overwhelmed', 'drained', 'anxious', 'tired', 'heavy'], days: DAYS.slice(0, 5) }),
  makePayload({ label: 'Low scores, positive words', scores: [1, 2, 1, 2, 1], words: ['hopeful', 'grateful', 'calm', 'peaceful', 'okay'], days: DAYS.slice(0, 5) }),
  makePayload({ label: 'All breath skipped, mixed scores', scores: [2, 3, 4, 2, 3, 4, 2] }),
  makePayload({ label: 'Crisis with mixed words', scores: [1, 1, 1, 1, 2, 3, 4], words: ['dark', 'heavy', 'lost', 'stuck', 'trying', 'okay', 'better'] }),
  makePayload({ label: 'Single entry — high', scores: [5], days: ['Wednesday'] }),
  makePayload({ label: 'Single entry — low', scores: [1], days: ['Wednesday'] }),
  makePayload({ label: 'Two entries same score', scores: [3, 3], days: ['Monday', 'Sunday'] }),
].slice(0, 50);

async function runTest(label: string, payload: Payload, index: number): Promise<{
  index: number;
  label: string;
  passed: boolean;
  issues: string[];
  result?: Result;
}> {
  const issues: string[] = [];

  try {
    const response = await fetch(EDGE_FUNCTION_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      return { index, label, passed: false, issues: [`HTTP ${response.status}: ${text}`] };
    }

    const result = await response.json() as Result;

    // Check required fields
    if (!result.s1 || !result.s2 || !result.s3) issues.push('Missing s1/s2/s3');
    if (!VALID_AVATARS.has(result.avatar)) issues.push(`Invalid avatar: ${result.avatar}`);

    // Check sentence length (15-25 words)
    for (const [key, sentence] of Object.entries({ s1: result.s1, s2: result.s2, s3: result.s3 })) {
      const wordCount = sentence?.split(' ').length ?? 0;
      if (wordCount < 5) issues.push(`${key} too short (${wordCount} words): "${sentence}"`);
      if (wordCount > 30) issues.push(`${key} too long (${wordCount} words): "${sentence}"`);
    }

    // Check prohibited strings
    const fullText = [result.s1, result.s2, result.s3].join(' ').toLowerCase();
    for (const banned of PROHIBITED) {
      if (fullText.includes(banned.toLowerCase())) {
        issues.push(`Prohibited string found: "${banned}"`);
      }
    }

    // Check crisis flag for weeks with 4+ score-1 entries
    const crisisEntries = payload.entries.filter(e => e.emoji_score === 1).length;
    if (crisisEntries >= 4 && result.crisis !== true) {
      issues.push(`Expected crisis:true (${crisisEntries} score-1 entries) but got: ${result.crisis}`);
    }
    if (crisisEntries < 4 && result.crisis === true) {
      issues.push(`Unexpected crisis:true (only ${crisisEntries} score-1 entries)`);
    }

    return { index, label, passed: issues.length === 0, issues, result };
  } catch (err) {
    return { index, label, passed: false, issues: [`Exception: ${err}`] };
  }
}

async function main() {
  if (!EDGE_FUNCTION_URL || EDGE_FUNCTION_URL.includes('YOUR_PROJECT')) {
    console.error('❌  EXPO_PUBLIC_SUPABASE_EDGE_FUNCTION_URL is not set in .env');
    process.exit(1);
  }

  console.log(`\n🧪  Running ${SCENARIOS.length} prompt QA tests against:\n    ${EDGE_FUNCTION_URL}\n`);
  console.log('─'.repeat(70));

  let passed = 0;
  let failed = 0;

  // Run with slight delay to avoid rate limiting (2 req/IP/hr in prod — use staging URL)
  for (let i = 0; i < SCENARIOS.length; i++) {
    const { label, payload } = SCENARIOS[i];
    const result = await runTest(label, payload, i + 1);

    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon}  [${String(i + 1).padStart(2, '0')}] ${label}`);

    if (!result.passed) {
      for (const issue of result.issues) {
        console.log(`       ⚠️  ${issue}`);
      }
      if (result.result) {
        console.log(`       s1: ${result.result.s1}`);
        console.log(`       s2: ${result.result.s2}`);
        console.log(`       s3: ${result.result.s3}`);
        console.log(`       avatar: ${result.result.avatar}${result.result.crisis ? ' | crisis: true' : ''}`);
      }
      failed++;
    } else {
      passed++;
    }

    // Small delay to be polite to the API
    if (i < SCENARIOS.length - 1) await new Promise(r => setTimeout(r, 300));
  }

  console.log('\n' + '─'.repeat(70));
  console.log(`\n📊  Results: ${passed} passed, ${failed} failed out of ${SCENARIOS.length} tests\n`);

  if (failed > 0) {
    console.log('⚠️   Fix the failures above before launch.\n');
    process.exit(1);
  } else {
    console.log('🎉  All tests passed. AI prompt is launch-ready.\n');
  }
}

main();
