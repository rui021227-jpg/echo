# ECHO

ECHO is a minimalist mood check-in app: one emoji, one word, one optional breath, then the app gets out of the way. The weekly payoff is a three-sentence AI reflection every Sunday.

## Start Here

- Read `ARCHITECT.md` for the current system shape, non-negotiable product rules, file routing, and QA expectations.
- Use this `README.md` for install, environment setup, scripts, and repo overview.
- Project rule: keep `README.md` and `ARCHITECT.md` updated as part of every relevant change. Do not leave doc updates as follow-up cleanup.
- Use `IMPLEMENTATION_PLAN.md` only as the phased build reference, not the current source of truth.
- `VIBE_CODING.md` and `CLAUDE.md` are lightweight compatibility pointers back to `ARCHITECT.md`.

## Quick Start

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and fill in the client-side config values.
3. Start the app with `npm start`, `npm run ios`, `npm run android`, or `npm run web`.
4. Run `npm run verify` before you ship behavior changes.

## Environment Setup

Client-visible runtime config is loaded from `.env` through `app.config.ts` and exposed in `src/config/runtime.ts`.

Client runtime config:

- `EXPO_PUBLIC_SUPABASE_EDGE_FUNCTION_URL`
- `EXPO_PUBLIC_REVENUECAT_IOS_KEY`
- `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`
- `EXPO_PUBLIC_PRIVACY_POLICY_URL`

Optional Sentry config:

- `EXPO_PUBLIC_SENTRY_DSN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_AUTH_TOKEN`
- `SENTRY_URL`

Server-only config:

- `OPENAI_API_KEY` lives in the Supabase Edge Function environment, never in the client app.
- Do not add, paste, rotate, or use any API key unless the project owner explicitly approves it for that task.

## Scripts

- `npm start` starts the Expo dev server.
- `npm run ios` opens the iOS target through Expo.
- `npm run android` opens the Android target through Expo.
- `npm run web` opens the Expo web preview in the browser.
- `npm test` runs Jest once.
- `npm run test:watch` runs Jest in watch mode.
- `npm run typecheck` runs TypeScript without emitting files.
- `npm run verify` runs typecheck plus the Jest suite.

## Repo Map

- `src/screens` contains the product flows.
- `src/services` contains timer, notifications, AI reflection, and purchases logic.
- `src/db` contains the local SQLite layer.
- `src/store/AppContext.tsx` wires bootstrapping and global app state.
- `supabase/functions/weekly-reflection/index.ts` is the only server-side code in the repo.

## Current App Shape

- No home screen. The default route is the emoji picker.
- The 3-minute cap is an architecture rule, not a setting.
- Raw entries stay on device; only the anonymized weekly payload reaches the edge function.
- Free users get monthly reflections, premium users get weekly reflections.

## Tooling Notes

- `postinstall` patches the local Expo launcher so `npx expo start` keeps working reliably in this repo.
- `npm run web` serves the app locally at `http://localhost:8081` for Mac/browser preview.
- The repo is pinned to Expo SDK 54-compatible package versions to avoid Metro compatibility drift.
