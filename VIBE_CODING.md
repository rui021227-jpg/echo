# Vibe Coding Guide

Use this file when you want the fastest safe path through the repo.

## Document Roles

- `ARCHITECT.md` = current implementation truth
- `IMPLEMENTATION_PLAN.md` = phase tracker and remaining work
- `VIBE_CODING.md` = fastest file-routing guide for making changes

## Current Phase

Core v1 implementation exists. The active phase is stabilization and launch prep: production config, device QA, prompt QA, store setup, and submission work.

## Non-Negotiables

- No home screen. The app opens into the daily loop.
- The 3-minute cap must survive screen transitions and fade before close.
- AI is a mirror, not a coach. No advice, diagnosis, or guilt language.
- Raw entries stay on device. Only the weekly summary goes to the Supabase Edge Function.
- Never put `OPENAI_API_KEY` in client config.

## Change Routing

- Change onboarding flow: `src/screens/onboarding`, `src/navigation/OnboardingNavigator.tsx`, `src/constants/copy.ts`
- Change the daily ritual: `src/screens/daily`, `src/types/navigation.ts`, `src/db/entries.ts`
- Change the hard cap: `src/store/AppContext.tsx`, `src/app/AppRoot.tsx`, `src/services/timer.ts`, `src/components/FadeOverlay.tsx`, `src/utils/closeApp.ts`
- Change weekly reflections: `src/services/reflection.ts`, `src/screens/reflection`, `src/db/reflections.ts`, `supabase/functions/weekly-reflection/index.ts`
- Change notification behavior: `src/services/notifications.ts`, `src/hooks/useNotificationResponse.ts`, `src/app/AppRoot.tsx`
- Change premium gating: `src/services/purchases.ts`, `src/hooks/useEntitlements.ts`, `src/screens/paywall/PaywallScreen.tsx`, `src/screens/reflection/ReflectionCardScreen.tsx`
- Change settings/about links or public keys: `.env.example`, `app.config.ts`, `src/config/runtime.ts`, `src/screens/settings`
- Change Expo startup or web preview: `package.json`, `scripts/repair-expo-bin.js`, `app.json`, `app.config.ts`

## Working Rhythm

1. Read `ARCHITECT.md` before large changes.
2. Patch the smallest surface area that solves the problem.
3. Update docs when a product rule, architecture rule, or integration path changes.
4. Add or update tests when you change pure logic.
5. Run `npm run verify` before wrapping up.

## Manual QA For Risky Changes

- Onboarding: first launch, notification permission, reminder scheduling, first entry flow
- Daily flow: notification launch, timer visibility, hard-cap fade, completion close behavior
- Sunday flow: reflection notification tap, cached reflection reuse, crisis-card routing
- Daily repeat-entry rule: same-day reopen shows a done state and does not overwrite the stored entry
- Monetization: premium entitlement refresh, paywall redirect after monthly free reflection
- Settings: reminder changes, privacy-policy link, About screen version display

## Config Notes

- Client config is loaded from `.env` into `app.config.ts`, then read at runtime from `src/config/runtime.ts`.
- Missing client config values fail softly in dev with warnings instead of placeholder strings.
- Native Sentry plugin config is optional and only turns on when `SENTRY_ORG` and `SENTRY_PROJECT` are set.
- The edge function still needs its own environment setup, especially `OPENAI_API_KEY`.
- Mac/browser preview is available with `npx expo start --web`.
