# ECHO

ECHO is a minimalist mood check-in app: one emoji, one word, one optional breath, then the app gets out of the way. The weekly payoff is a three-sentence AI reflection every Sunday.

## Start Here

- Read `docs/ARCHITECT.md` for the current system shape, non-negotiable product rules, file routing, and QA expectations.
- Use this `README.md` for install, environment setup, scripts, and repo overview.
- Project rule: keep `README.md` and `docs/ARCHITECT.md` updated as part of every relevant change. Do not leave doc updates as follow-up cleanup.
- Use `docs/IMPLEMENTATION_PLAN.md` only as the phased build reference, not the current source of truth.

## Quick Start

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and fill in the client-side config values.
3. Start the app with `npm start`, `npm run ios`, `npm run android`, or `npm run web`.
4. Run `npm run verify` before you ship behavior changes.

## Environment Setup

Client-visible runtime config is loaded from `.env` through `app.config.ts` and exposed in `src/config.ts`.

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

## Folder Map

```
ECHO/
├── App.tsx                  # Entry point — Sentry init + mounts AppRoot
├── index.ts                 # Expo registerRootComponent
├── app.config.ts            # Expo config (env vars, plugins)
├── app.json                 # Expo base manifest
├── eas.json                 # EAS build profiles
├── tsconfig.json            # TypeScript config
│
├── src/
│   ├── AppRoot.tsx          # Root component: NavigationContainer + AppProvider
│   ├── config.ts            # Runtime config loaded from app.config.ts extras
│   │
│   ├── screens/             # Every screen in the app
│   │   ├── daily/           # Core loop: EmojiPicker → WordInput → Breathing → Completion
│   │   ├── onboarding/      # First-run flow (8 screens)
│   │   ├── reflection/      # Weekly reflection card + crisis card
│   │   ├── paywall/         # Premium upgrade screen
│   │   └── settings/        # Settings + About
│   │
│   ├── components/          # Reusable UI: EmojiCircle, BreathingAnimation, WeatherAvatar, FadeOverlay, GlassCard
│   ├── navigation/          # React Navigation stacks: Root, Main, Onboarding
│   ├── state/               # Global state (AppContext) + bootstrap logic
│   ├── services/            # Business logic: timer, notifications, reflection, purchases, content filter, crisis detector
│   ├── database/            # SQLite: database setup, entries CRUD, reflections CRUD
│   ├── hooks/               # Custom hooks: useTimer, useEntitlements, useNotificationResponse
│   ├── constants/           # Static data: theme tokens, copy strings, emojis, avatars, crisis lines, prohibited words
│   ├── types/               # TypeScript types: navigation params, entry shape, reflection shape
│   └── utils/               # Helpers: dateHelpers, validators, closeApp
│
├── supabase/
│   └── functions/
│       └── weekly-reflection/  # Edge function: generates AI reflection from weekly entries
│
├── assets/                  # App icon, splash, favicon
├── docs/                    # ARCHITECT.md, PRD, deployment guide, changelog
├── scripts/                 # Dev utilities (test-prompt-qa, repair-expo-bin)
├── __tests__/               # Jest tests mirroring src/ structure
└── __mocks__/               # Jest mocks for Expo/native modules
```

## Current App Shape

- No home screen. The default route is the emoji picker.
- The 3-minute cap is an architecture rule, not a setting.
- Raw entries stay on device; only the anonymized weekly payload reaches the edge function.
- Free users get monthly reflections, premium users get weekly reflections.

## Tooling Notes

- `postinstall` patches the local Expo launcher so `npx expo start` keeps working reliably in this repo.
- `npm run web` serves the app locally at `http://localhost:8081` for Mac/browser preview.
- The repo is pinned to Expo SDK 54-compatible package versions to avoid Metro compatibility drift.
