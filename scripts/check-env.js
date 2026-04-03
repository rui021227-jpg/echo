#!/usr/bin/env node
// Validates all required EXPO_PUBLIC_ env vars before a build.
// Usage: node scripts/check-env.js

const REQUIRED = [
  {
    key: 'EXPO_PUBLIC_SUPABASE_EDGE_FUNCTION_URL',
    label: 'Supabase weekly-reflection URL',
  },
  {
    key: 'EXPO_PUBLIC_SUPABASE_CLOUD_SYNC_URL',
    label: 'Supabase cloud-sync URL',
  },
  {
    key: 'EXPO_PUBLIC_REVENUECAT_IOS_KEY',
    label: 'RevenueCat iOS key',
  },
  {
    key: 'EXPO_PUBLIC_REVENUECAT_ANDROID_KEY',
    label: 'RevenueCat Android key',
  },
  {
    key: 'EXPO_PUBLIC_SENTRY_DSN',
    label: 'Sentry DSN',
  },
  {
    key: 'EXPO_PUBLIC_PRIVACY_POLICY_URL',
    label: 'Privacy policy URL',
  },
];

const PLACEHOLDER_PATTERNS = ['YOUR_', 'YOUR-', 'example.com', 'localhost'];

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

// Load .env if present
try {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  }
} catch {
  // ignore
}

let allPassed = true;
const rows = [];

for (const { key, label } of REQUIRED) {
  const value = process.env[key] ?? '';
  const isEmpty = !value;
  const isPlaceholder = !isEmpty && PLACEHOLDER_PATTERNS.some((p) => value.includes(p));

  let status, statusText;
  if (isEmpty) {
    status = 'MISSING';
    statusText = `${RED}✗ MISSING${RESET}`;
    allPassed = false;
  } else if (isPlaceholder) {
    status = 'PLACEHOLDER';
    statusText = `${YELLOW}⚠ PLACEHOLDER${RESET}`;
    allPassed = false;
  } else {
    status = 'OK';
    statusText = `${GREEN}✓ OK${RESET}`;
  }

  rows.push({ key, label, statusText, status, value });
}

console.log(`\n${BOLD}ECHO — Environment Variable Check${RESET}\n`);
console.log('─'.repeat(72));

for (const row of rows) {
  const preview =
    row.status === 'OK'
      ? `${row.value.slice(0, 40)}${row.value.length > 40 ? '…' : ''}`
      : '';
  console.log(`${row.statusText.padEnd(30)} ${row.key}`);
  if (preview) console.log(`${''.padEnd(18)} ${RESET}${preview}`);
}

console.log('─'.repeat(72));

if (allPassed) {
  console.log(`\n${GREEN}${BOLD}All checks passed. Ready to build.${RESET}\n`);
  process.exit(0);
} else {
  const failed = rows.filter((r) => r.status !== 'OK').length;
  console.log(`\n${RED}${BOLD}${failed} check(s) failed. See docs/ENV_SETUP.md.${RESET}\n`);
  process.exit(1);
}
