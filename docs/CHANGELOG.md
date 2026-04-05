# Changelog

All notable changes to ECHO will be documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Changed (2026-04-05 — Sanctuary redesign)
- Full UI redesign to "Radiant Sanctuary" light theme — warm cream backgrounds (#fcf9f1), sage green (#586a48), peach/gold accents (#ffcf93→#ffdcc4). Dark navy palette retired.
- `theme.ts` fully replaced: new COLORS, GRADIENTS, SHADOWS, BORDER_RADIUS tokens, GRAIN_OPACITY added, BORDERS removed
- `EmojiPickerScreen`: arch emoji layout with organic translateY offsets, "How are you today?" headline, ambient glow behind arch, progress bar, gradient Continue button, footer quote
- `EmojiCircle`: new props `{ emoji, selected, onPress, size? }`; selected=peach gradient+green border, unselected=white card with soft shadow
- `WordInputScreen` + `WordStep`: floating cloud animation (☁️), 44px centered weight-300 input, focus scale/glow, "OneWord" headline, progress bar
- `BreathingScreen` + `BreathingAnimation` + `BreathingStep`: "OneMinute" layout; 4-layer concentric animation (outer glow → mid ring → gradient inner circle → green core), breathing instructions, pill skip button
- `ReflectionCardScreen`: "Sunday Reflection" card with LinearGradient avatar section, decorative particles, 3 icon-labelled sentence rows, closing quote, insight card, green CTA
- `WeatherAvatar`: warm peach-glow circular container; renders emoji + label; falls back to 🌤️
- `OnboardingEmojiPickerScreen`: updated to new EmojiCircle API
- `GlassCard`: warm glass surface (surfaceGlass token), updated border opacity

### Changed (previous)
- Shared the word-entry and breathing-step UI between onboarding and the daily flow
- Added a shared safe-area, scroll, and keyboard-aware screen shell for settings, about, paywall, and word-entry layouts
- Reminder time now saves and edits both hour and minute consistently across onboarding and settings
- Reminder replacement is now rollback-safe, so a failed reschedule does not wipe the user’s existing daily notifications
- Added optional cloud backup/restore in Settings with additive restore semantics so local entries and reflections are not overwritten
- Weekly reflection payloads now send the actual device locale instead of hardcoding English
- RevenueCat webhook persistence now fails loudly so backend write errors can retry instead of silently dropping subscription-state updates
- Weather avatars now render with both configured gradient colors
- Updated project docs to match the current `src/` structure and shared UI components

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
- Optional cloud backup and restore for entries/reflections via Supabase edge functions
- About screen: version display

### Architecture
- React Native / Expo SDK 54
- Supabase Edge Functions (Deno) for AI reflection, optional cloud backup, and RevenueCat webhook handling
- OpenAI GPT-4o mini in JSON mode
- TypeScript strict mode
- 67 unit tests passing across 12 suites

---

## Versioning Rules

| Change type | Version bump |
|---|---|
| New feature, significant UX change | Minor: 1.x.0 |
| Bug fix, crash fix, text change | Patch: 1.0.x |
| Breaking change, major rearchitecture | Major: x.0.0 |

Tag format: `v1.0.0` → triggers automated EAS production build via GitHub Actions.
