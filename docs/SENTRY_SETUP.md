# Sentry Setup Guide

ECHO uses Sentry for crash reporting. The integration is already wired — you just need to create the project and fill in the env vars.

## Step 1 — Create a Sentry account and project

1. Go to [sentry.io](https://sentry.io) and sign up or log in
2. Create a new **Organization** (e.g. `echo-app`)
3. Create a new **Project**:
   - Platform: **React Native**
   - Project name: `echo-app`
   - Team: default

## Step 2 — Get the DSN

1. In your project: **Settings → Client Keys (DSN)**
2. Copy the DSN — it looks like:
   ```
   https://abc123@o123456.ingest.sentry.io/789012
   ```
3. Set it in `.env`:
   ```
   EXPO_PUBLIC_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/789012
   ```

## Step 3 — Get an Auth Token (for source maps upload during EAS build)

1. Go to **sentry.io → Settings → Auth Tokens**
2. Create a new token with scope: `project:write`
3. Set in `.env`:
   ```
   SENTRY_AUTH_TOKEN=sntrys_your_token_here
   ```

## Step 4 — Set org and project slugs

From your Sentry project URL (`sentry.io/organizations/YOUR_ORG/projects/YOUR_PROJECT/`):

```
SENTRY_ORG=echo-app
SENTRY_PROJECT=echo-app
```

`SENTRY_URL` can stay as `https://sentry.io/` (default, only change if self-hosted).

## Step 5 — Verify it works

After setting the DSN and running a dev build, trigger a test error:

```ts
import * as Sentry from '@sentry/react-native';
Sentry.captureException(new Error('Sentry test'));
```

Check **sentry.io → Issues** — the error should appear within seconds.

## What's already implemented

- `App.tsx` — `Sentry.init()` called on startup, app wrapped with `Sentry.wrap()`
- `app.config.ts` — Sentry Expo plugin enabled automatically when `SENTRY_ORG` + `SENTRY_PROJECT` are set
- `src/config.ts` — DSN validated, ignored in dev and when set to placeholder value
- `tracesSampleRate: 0` — performance tracing disabled (crash reporting only)
- Sentry is silently disabled in dev mode and simulator builds
