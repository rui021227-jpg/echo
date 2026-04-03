# Environment Variables Setup

Copy `.env.example` to `.env` and fill in each value before building.

```bash
cp .env.example .env
```

Run the validator at any time:

```bash
node scripts/check-env.js
```

---

## Supabase

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_EDGE_FUNCTION_URL` | Yes | Full URL to the `weekly-reflection` edge function |
| `EXPO_PUBLIC_SUPABASE_CLOUD_SYNC_URL` | Yes | Full URL to the `cloud-sync` edge function |

**Already filled in** — the `echo v1` project is deployed at `ppwhyawhdsydhajkyxof.supabase.co`.

**Server-side secrets** (set in Supabase Dashboard → Project Settings → Edge Functions → Secrets, never in `.env`):

| Secret | Used By | How to get |
|---|---|---|
| `OPENAI_API_KEY` | `weekly-reflection` | [platform.openai.com](https://platform.openai.com) → API Keys |
| `REVENUECAT_WEBHOOK_AUTH_TOKEN` | `revenuecat-webhook` | Generate any strong random string (e.g. `openssl rand -hex 32`). Paste the same value into RevenueCat dashboard → Webhooks → Authorization header |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically by Supabase into edge functions — you do not set these manually.

---

## RevenueCat

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_REVENUECAT_IOS_KEY` | Yes (iOS) | Public SDK key from RevenueCat dashboard → Apps → Apple App Store |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` | Yes (Android) | Public SDK key from RevenueCat dashboard → Apps → Google Play Store |

**How to get:**
1. Create a RevenueCat account at [app.revenuecat.com](https://app.revenuecat.com)
2. Create a new Project → add iOS and Android apps
3. Each app has a **Public API Key** in its settings — copy these

**Products to create in RevenueCat:**
- `echo_premium_monthly` — $4.99/month
- `echo_premium_yearly` — $29.99/year
- Entitlement ID: `premium` (must match exactly — it's hardcoded in `src/services/purchases.ts`)

---

## Sentry

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_SENTRY_DSN` | Yes | DSN from Sentry project settings → Client Keys |
| `SENTRY_ORG` | Yes (builds) | Your Sentry org slug (enables source map upload) |
| `SENTRY_PROJECT` | Yes (builds) | Your Sentry project slug |
| `SENTRY_AUTH_TOKEN` | Yes (builds) | Auth token with `project:write` scope |
| `SENTRY_URL` | No | Leave as `https://sentry.io/` unless self-hosted |

See `docs/SENTRY_SETUP.md` for the full setup walkthrough.

---

## App

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_PRIVACY_POLICY_URL` | Yes | URL to the hosted privacy policy page |

Deploy `privacy-policy/` to Vercel (`vercel --prod` from that folder), then set this to the resulting URL.

---

## EAS / Production builds

For EAS builds, all `EXPO_PUBLIC_` vars must also be added as **EAS Secrets** (not just local `.env`):

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_EDGE_FUNCTION_URL --value "https://ppwhyawhdsydhajkyxof.supabase.co/functions/v1/weekly-reflection"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_CLOUD_SYNC_URL --value "https://ppwhyawhdsydhajkyxof.supabase.co/functions/v1/cloud-sync"
eas secret:create --scope project --name EXPO_PUBLIC_REVENUECAT_IOS_KEY --value "YOUR_IOS_KEY"
eas secret:create --scope project --name EXPO_PUBLIC_REVENUECAT_ANDROID_KEY --value "YOUR_ANDROID_KEY"
eas secret:create --scope project --name EXPO_PUBLIC_SENTRY_DSN --value "YOUR_DSN"
eas secret:create --scope project --name EXPO_PUBLIC_PRIVACY_POLICY_URL --value "https://echo-privacy.vercel.app"
eas secret:create --scope project --name SENTRY_AUTH_TOKEN --value "YOUR_TOKEN"
```
