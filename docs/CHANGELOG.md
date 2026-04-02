# Changelog

All notable changes to ECHO will be documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### In Progress
- App Store Connect submission (iOS)
- Google Play Console submission (Android)
- RevenueCat product configuration
- Privacy policy hosting
- Sentry DSN activation

---

## [1.0.0] — TBD (First Public Release)

### Added
- Daily mood check-in flow: emoji (1–5) → one word (≤20 chars) → optional 60s breathing
- 3-minute hard cap enforced at architecture level; app closes automatically
- Push notification scheduling with custom reminder time (set during onboarding)
- Weekly AI reflection: 3 sentences + weather-state avatar (Sundays at 9 AM)
- Crisis detection: redirects to CrisisCardScreen with local helpline numbers when triggered
- Content filtering: 8 prohibited strings removed from AI output
- 8-screen onboarding flow with notification permission request
- SQLite local database — entries, reflections, and settings never leave the device
- RevenueCat premium subscription (monthly + annual) for weekly AI reflections
- Sentry crash reporting integration (opt-in via DSN env var)
- Settings screen: reminder time configuration
- About screen: version display

### Architecture
- React Native / Expo SDK 54
- Supabase Edge Function (Deno) for AI relay — rate-limited 2 req/IP/hr
- OpenAI GPT-4o mini in JSON mode
- TypeScript strict mode
- 60 unit tests passing across 10 suites

---

## Versioning Rules

| Change type | Version bump |
|---|---|
| New feature, significant UX change | Minor: 1.x.0 |
| Bug fix, crash fix, text change | Patch: 1.0.x |
| Breaking change, major rearchitecture | Major: x.0.0 |

Tag format: `v1.0.0` → triggers automated EAS production build via GitHub Actions.
