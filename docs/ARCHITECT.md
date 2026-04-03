# ECHO — Architecture Reference

> **Always read this file at the start of every new conversation about this project.**
> Update this file whenever a significant architectural decision is made or changed.
> Use `README.md` only for setup, env, and commands.
> Project rule: keep `ARCHITECT.md` and `README.md` current together. If a change affects architecture, product rules, setup, env, scripts, or integration paths, update the relevant doc before closing the task.
> `VIBE_CODING.md` and `CLAUDE.md` are compatibility pointers back to this file.

## Doc Map

- `ARCHITECT.md` = single engineering source of truth for rules, architecture, file routing, and QA
- `README.md` = install, environment setup, scripts, and repo overview
- Both must be kept current as part of project maintenance, not treated as optional cleanup
- `IMPLEMENTATION_PLAN.md` = historical phased plan and remaining launch work, not the current source of truth
- `VIBE_CODING.md` and `CLAUDE.md` = short compatibility shims for tools or old habits

## Current Phase

Core v1 implementation exists. The active phase is stabilization and launch prep: production config, device QA, prompt QA, store setup, and submission work.

---

## Project Defaults

- Language: TypeScript (strict) for all new files
- Framework: React Native / Expo SDK 54
- Navigation: flat stacks only; no tabs, no drawer, no nested navigators inside render functions
- State: React Context only; no Redux or Zustand
- Local data: expo-sqlite only; no AsyncStorage
- Wrap up changes with `npm run verify`

---

## Non-Negotiables

- No home screen. `EmojiPickerScreen` is the default route.
- The 3-minute hard cap must survive screen transitions and fade before close. It is not a setting and cannot be disabled.
- AI is a mirror, not a coach. No advice, diagnosis, or guilt language in any AI output.
- Raw entries stay on device by default. Weekly reflections still send only the anonymized weekly summary, and cloud backup uploads entries/reflections only when the user manually triggers it in Settings.
- `OPENAI_API_KEY` never goes in client config. Server-side only, in the Supabase Edge Function environment.
- No API key may be added, pasted, rotated, or used unless the project owner explicitly approves it for that task.

---

## Change Routing

- Change onboarding flow: `src/screens/onboarding`, `src/navigation/OnboardingNavigator.tsx`, `src/constants/copy.ts`
- Change the daily ritual: `src/screens/daily`, `src/types/navigation.ts`, `src/database/entries.ts`
- Change the hard cap: `src/state/AppContext.tsx`, `src/AppRoot.tsx`, `src/services/timer.ts`, `src/components/FadeOverlay.tsx`, `src/utils/closeApp.ts`
- Change weekly reflections: `src/services/reflection.ts`, `src/screens/reflection`, `src/database/reflections.ts`, `supabase/functions/weekly-reflection/index.ts`
- Change notification behavior: `src/services/notifications.ts`, `src/hooks/useNotificationResponse.ts`, `src/AppRoot.tsx`
- Change premium gating: `src/services/purchases.ts`, `src/hooks/useEntitlements.ts`, `src/screens/paywall/PaywallScreen.tsx`, `src/screens/reflection/ReflectionCardScreen.tsx`
- Change settings/about links or public keys: `.env.example`, `app.config.ts`, `src/config.ts`, `src/screens/settings`
- Change cloud backup/restore: `src/services/cloudSync.ts`, `src/screens/settings/SettingsScreen.tsx`, `src/database/entries.ts`, `src/database/reflections.ts`, `supabase/functions/cloud-sync/index.ts`, `supabase/migrations/20240101000000_cloud_sync.sql`
- Change RevenueCat webhook storage: `supabase/functions/revenuecat-webhook/index.ts`, `supabase/migrations/20240101000001_subscription_events.sql`
- Change Expo startup or web preview: `package.json`, `scripts/repair-expo-bin.js`, `app.json`, `app.config.ts`

---

## Working Rhythm

1. Read `ARCHITECT.md` before large changes or new sessions.
2. Use `README.md` for setup, env, and command reference.
3. Patch the smallest surface area that solves the problem.
4. Update `ARCHITECT.md` when a product rule, architecture rule, or integration path changes.
5. Update `README.md` when setup, env, scripts, or integration-facing workflow changes.
6. If a change affects both engineering truth and setup/usage, update both docs in the same task.
7. Add or update tests when you change pure logic.
8. Run `npm run verify` before wrapping up behavior changes.

---

## Manual QA For Risky Changes

- Onboarding: first launch, notification permission, reminder scheduling, first entry flow
- Daily flow: notification launch, timer visibility, hard-cap fade, completion close behavior
- Sunday flow: reflection notification tap, cached reflection reuse, crisis-card routing
- Daily repeat-entry rule: same-day reopen shows a done state and does not overwrite the stored entry
- Monetization: premium entitlement refresh, paywall redirect after monthly free reflection
- Settings: reminder changes, rollback-safe rescheduling, cloud backup/restore merge behavior, privacy-policy link, About screen version display

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | React Native (Expo SDK 54) | Single codebase iOS + Android |
| Language | TypeScript (strict) | `tsconfig` extends `expo/tsconfig.base` |
| Local DB | expo-sqlite (~16 / Expo SDK 54) | All raw data is stored on-device first. Optional manual cloud backup mirrors entries and reflections when enabled. |
| Backend | Supabase Edge Functions + SQL migrations | Functions: `weekly-reflection`, `cloud-sync`, `revenuecat-webhook`. Supabase tables back cloud sync and subscription event storage. |
| AI | OpenAI GPT-4o mini | JSON mode enforced. ~$0.0001/call. Called server-side only. |
| Push Notifications | expo-notifications | Local scheduled only. No server push. |
| Payments | react-native-purchases (RevenueCat) | iOS + Android abstraction. Entitlement: `premium`. |
| Crash Reporting | @sentry/react-native | No user ID. No session replay. Non-PII only. |
| Runtime Config | `app.config.ts` + `src/config.ts` | Expo `extra` bridges `.env` values into the app safely. |
| Navigation | @react-navigation/native-stack | All stacks. No tabs. No drawer. |
| Animation | react-native-reanimated v4 | Used in BreathingAnimation, FadeOverlay |
| State | React Context (AppContext) | No Redux/Zustand. Global: bootstrap state, premium state, onboarding state, timed-session state. |
| Testing | jest-expo | 67 unit tests. 12 suites. All green. |
| Web Preview | react-dom + react-native-web | Browser preview supported on Mac via `npx expo start --web`. |
| Build | EAS Build | eas.json: development / preview / production profiles |

---

## Directory Structure

```
ECHO/
├── App.tsx                          — Entry point. Sentry.wrap() + AppRoot.
├── app.json                         — Base Expo config. scheme: "echo". dark UI.
├── app.config.ts                    — Injects `.env` values into Expo `extra` and conditionally enables native Sentry plugin config.
├── eas.json                         — EAS Build profiles.
├── .env.example                     — Client runtime config template.
├── README.md                        — Setup, env, commands, and repo overview.
├── ARCHITECT.md                     — Primary engineering doc. Read first in new sessions.
├── VIBE_CODING.md                   — Compatibility pointer to ARCHITECT.md.
├── CLAUDE.md                        — Compatibility pointer to ARCHITECT.md.
├── IMPLEMENTATION_PLAN.md           — Full phased build plan.
├── PRD_v1.md                        — Product Requirements Document.
├── scripts/repair-expo-bin.js       — Repairs the local Expo launcher after installs so `npx expo start` works reliably.
│
├── src/
│   ├── AppRoot.tsx                  — NavigationContainer + AppProvider + notification routing.
│   │
│   ├── navigation/
│   │   ├── RootNavigator.tsx        — Reads onboardingComplete, renders Onboarding or Main.
│   │   ├── OnboardingNavigator.tsx  — Flat stack: 4 intro + 4 first-entry screens (no nested navigators).
│   │   └── MainNavigator.tsx        — Flat stack: EmojiPicker (default) + all daily/reflection/settings screens.
│   │
│   ├── screens/
│   │   ├── onboarding/              — WelcomeScreen, EmojiExplainScreen, NotificationScreen,
│   │   │                              ReminderTimeScreen, OnboardingEmojiPickerScreen,
│   │   │                              OnboardingWordInputScreen, OnboardingBreathingScreen,
│   │   │                              OnboardingCompletionScreen
│   │   ├── daily/                   — EmojiPickerScreen, WordInputScreen, BreathingScreen, CompletionScreen
│   │   ├── reflection/              — ReflectionCardScreen, CrisisCardScreen
│   │   ├── paywall/                 — PaywallScreen
│   │   └── settings/                — SettingsScreen, AboutScreen
│   │
│   ├── components/
│   │   ├── AppScreen.tsx            — Shared safe-area, scroll, and keyboard-aware screen shell.
│   │   ├── WordStep.tsx             — Shared word-entry UI used by onboarding + daily flow.
│   │   ├── BreathingStep.tsx        — Shared breathing/skip UI used by onboarding + daily flow.
│   │   ├── ReminderTimePicker.tsx   — Shared reminder time picker used by onboarding + settings.
│   │   ├── EmojiCircle.tsx          — Tappable emoji circle with haptic feedback.
│   │   ├── BreathingAnimation.tsx   — Reanimated expanding/contracting circle. 4s inhale/4s exhale.
│   │   ├── WeatherAvatar.tsx        — Displays one of 9 weather emoji states.
│   │   └── FadeOverlay.tsx          — Full-screen fade overlay. Used for 3-min cap close animation.
│   │
│   ├── database/
│   │   ├── database.ts              — initDatabase(), getSetting(), setSetting(). Called once on app launch.
│   │   ├── entries.ts               — insertEntry(), getEntryByDate(), getEntriesForWeek(), hasEntryToday(), getAllEntries(), mergeEntries().
│   │   └── reflections.ts           — insertReflection(), mergeReflection(), getReflectionForWeek(), getReflectionCountThisMonth().
│   │
│   ├── services/
│   │   ├── timer.ts                 — startSessionTimer(). 180s hard cap. Returns clear() + getRemainingMs().
│   │   ├── contentFilter.ts         — isContentSafe(). Case-insensitive scan of s1+s2+s3 for prohibited strings.
│   │   ├── crisisDetector.ts        — isCrisis(). Checks response.crisis === true.
│   │   ├── cloudSync.ts             — Manual backup/restore of entries + reflections through Supabase.
│   │   ├── notifications.ts         — Scheduling + notification parsing helpers, including rollback-safe reminder replacement and week-start fallback.
│   │   ├── reflection.ts            — buildPayload() with device locale, fetchReflection() (3 retries, 15s timeout), processReflection(), runtime AI response validation.
│   │   └── purchases.ts             — initPurchases(), checkEntitlement(), getOfferings(), purchasePackage(), restorePurchases().
│   │
│   ├── hooks/
│   │   ├── useTimer.ts              — Shared timer helpers used by countdown UI/tests.
│   │   ├── useEntitlements.ts       — Checks RevenueCat premium state. Refreshes on app foreground.
│   │   └── useNotificationResponse.ts — Listens for notification taps. Dedupe + clear cold-start responses.
│   │
│   ├── state/
│   │   ├── AppContext.tsx           — AppProvider + useApp(). Bootstrap + timed session ownership.
│   │   └── bootstrap.ts             — Critical-vs-soft app bootstrap orchestration.
│   │
│   ├── config.ts                    — Normalized client runtime config + dev warnings for missing values.
│   │
│   ├── constants/
│   │   ├── theme.ts                 — COLORS, FONT_SIZES, SPACING, BORDER_RADIUS. Dark navy base (#1a1a2e).
│   │   ├── emojis.ts                — EMOJI_SCALE: 5 options with score, emoji char, color (dark→bright).
│   │   ├── avatars.ts               — AVATAR_MAP: 9 weather states → emoji + gradient colors.
│   │   ├── prohibited.ts            — PROHIBITED_STRINGS: 8 banned AI output terms.
│   │   ├── crisis.ts                — getCrisisLine(), getCrisisPhone(). Locale-keyed crisis resources.
│   │   └── copy.ts                  — All user-facing strings. i18n-ready key structure.
│   │
│   ├── utils/
│   │   ├── dateHelpers.ts           — todayISO(), formatDate(), getWeekStart(), getDayName(), isSunday(), getWeekDates().
│   │   ├── closeApp.ts              — closeApp(). Android: BackHandler.exitApp(). iOS: returns false (inert state).
│   │   └── validators.ts            — isValidWord(). Trims, checks length ≤ 20, non-empty.
│   │
│   └── types/
│       ├── entry.ts                 — Entry interface. EmojiScore = 1|2|3|4|5.
│       ├── reflection.ts            — Reflection, AvatarKey (9-member union), AIPayload, AIResponse, VALID_AVATAR_KEYS.
│       └── navigation.ts            — OnboardingStackParamList, MainStackParamList.
│
├── supabase/config.toml                         — Local Supabase service and function settings.
├── supabase/migrations/20240101000000_cloud_sync.sql         — Cloud backup tables (`device_identities`, `synced_entries`, `synced_reflections`).
├── supabase/migrations/20240101000001_subscription_events.sql — RevenueCat event + subscription state tables.
├── supabase/functions/weekly-reflection/index.ts             — Deno edge function for AI reflection generation. Rate limited (2 req/IP/hr).
├── supabase/functions/cloud-sync/index.ts                    — Deno edge function for anonymous device backup/restore.
├── supabase/functions/revenuecat-webhook/index.ts            — Deno edge function for RevenueCat webhook ingestion with retry-safe failure responses.
│
├── __tests__/
│   ├── services/                    — contentFilter, crisisDetector, notifications, reflectionPayload, reflectionResponse, timer
│   ├── database/                    — entries duplicate protection, restore merge helpers
│   ├── state/                       — bootstrap behavior
│   └── utils/                       — dateHelpers, validators
│
└── __mocks__/                       — Jest stubs: expo-sqlite, expo-notifications, expo-device,
                                       expo-asset, expo-file-system, react-native-purchases
```

---

## Database Schema

```sql
-- One entry per day
entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,           -- YYYY-MM-DD
  emoji_score INTEGER NOT NULL,        -- 1–5
  word TEXT NOT NULL,                  -- max 20 chars
  breath_taken INTEGER NOT NULL,       -- 0 or 1
  created_at TEXT
)

-- One reflection per week
reflections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week_start TEXT NOT NULL UNIQUE,     -- YYYY-MM-DD (Monday)
  s1 TEXT NOT NULL,
  s2 TEXT NOT NULL,
  s3 TEXT NOT NULL,
  avatar_key TEXT NOT NULL,            -- one of 9 AvatarKey values
  is_crisis INTEGER NOT NULL,          -- 0 or 1 (crisis reflections are never stored)
  created_at TEXT
)

-- Key-value settings
settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
)
-- Keys: reminder_hour, reminder_minute, onboarding_complete, first_launch_date
```

---

## Global State (AppContext)

```typescript
interface AppContextValue {
  isReady: boolean;              // local DB bootstrap complete
  bootstrapError: string | null; // blocking startup failure if local data cannot be opened
  retryBootstrap: () => Promise<void>;
  onboardingComplete: boolean;   // drives RootNavigator branch
  setOnboardingComplete: (v) => void;
  isPremium: boolean;            // RevenueCat entitlement "premium"
  isLoadingPremium: boolean;
  refreshPremium: () => Promise<void>;
  secondsRemaining: number;
  isTimedSessionActive: boolean;
  hasTimedSessionExpired: boolean;
  startTimedSession: () => void;
  endTimedSession: () => void;
}
```

Daily flow state (emojiScore, word, breath) is passed via **navigation params**, not context. Entry is saved to SQLite only at the BreathingScreen transition — after all 3 fields are collected.

---

## Navigation Architecture

```
RootNavigator
├── OnboardingNavigator (if onboardingComplete === false)
│   Flat stack — NO nested navigators inside render functions
│   Welcome → EmojiExplain → NotificationPermission → ReminderTime
│   → OnboardingEmojiPicker → OnboardingWordInput → OnboardingBreathing → OnboardingCompletion
│
└── MainNavigator (if onboardingComplete === true)
    Flat stack. Default route = EmojiPicker (NO home screen by design).
    EmojiPicker → WordInput → Breathing → Completion
    EmojiPicker → Settings → About
    (notification tap) → ReflectionCard | CrisisCard
    (paywall trigger) → Paywall
```

**Critical rule:** There is no home screen. `EmojiPickerScreen` is the default route.
**No nested navigators created inside render functions** (this was the original bug — fixed by creating explicit onboarding variants of the daily screens).

---

## 3-Minute Hard Cap

- Timer starts in `AppRoot` as soon as a daily notification tap is handled.
- `AppContext` owns the shared timer state so the cap survives navigation across the full daily flow.
- On expiry: app-level state flips into fade mode, then `FadeOverlay` closes the app on completion.
- Android: `BackHandler.exitApp()`. iOS: navigates to inert state (user swipes away).
- Timer is **not** started when user opens the app directly (cold open without notification).
- This is enforced in code. It is not a setting. It cannot be disabled.
- If the user already checked in today, the app shows a passive done state and does not overwrite the entry.

---

## Notification Flow

| Notification type | Trigger | Data payload | On tap |
|---|---|---|---|
| Daily | Local, repeating, user-set time | `{ type: 'daily' }` | Navigate to EmojiPicker with `fromNotification: true` |
| Sunday | Local, weekly, Sunday 9am | `{ type: 'reflection' }` | Compute `weekStart` on tap, then call `processReflection()` |

Cold start handling: `Notifications.getLastNotificationResponseAsync()` is deduped and cleared after handling so old taps are not replayed on later mounts.

---

## Cloud Backup

- Cloud backup is optional and only appears when `EXPO_PUBLIC_SUPABASE_CLOUD_SYNC_URL` is configured.
- `pushToCloud()` registers an anonymous `device_id`, then uploads entries and reflections to Supabase-managed backup tables.
- `pullFromCloud()` merges remote entries/reflections into local SQLite and intentionally does not overwrite existing local days or weeks.
- `deleteAllData()` clears local SQLite only. Cloud backup deletion is a separate service concern and is not wired into the current Settings UI.

---

## Tooling Notes

- `postinstall` runs `scripts/repair-expo-bin.js` so `npx expo start` keeps working when Expo CLI is nested under `expo/node_modules`.
- The dependency set is aligned to Expo SDK 54-compatible versions to avoid Metro compatibility warnings and web bundle drift.
- Web preview is available through `npx expo start --web`, which serves locally on `http://localhost:8081`.

---

## AI Reflection Pipeline

```
Sunday notification tapped
  → useNotificationResponse detects type: 'reflection'
  → processReflection(weekStart)  [services/reflection.ts]
      1. Check if reflection already stored for this week → return 'cached'
      2. getEntriesForWeek() from SQLite
      3. If 0 entries → store moonlit fallback → return 'success'
      4. buildPayload() → anonymized JSON (no PII)
      5. fetchReflection() → POST to Supabase Edge Function (3 retries, 15s timeout)
      6. Validate avatar key → fallback to 'cloudy' if invalid
      7. isCrisis() → if true, do NOT store, return 'crisis'
      8. isContentSafe() → if false, store fallback card, return 'filtered'
      9. insertReflection() → return 'success'
  → Navigate to ReflectionCard | CrisisCard based on result
```

---

## Safety Architecture

| Layer | Mechanism |
|---|---|
| Content filter | `isContentSafe()` scans s1+s2+s3 for 8 prohibited strings (case-insensitive). Fallback card if triggered. |
| Crisis detection | `isCrisis()` checks `response.crisis === true`. Crisis card shown, reflection never stored, never logged. |
| Avatar validation | `validateAvatarKey()` in `processReflection()`. Falls back to `'cloudy'` if AI returns unknown key. |
| No PII in AI payload | Only day names, score integers, one-word strings, breath boolean sent to server. |
| No raw data off-device | All SQLite data stays local. Only anonymized weekly summary hits the Edge Function. |

---

## Monetisation

| Tier | What's gated |
|---|---|
| Free | Full daily loop forever. Monthly AI reflection (1 per calendar month). |
| Premium ($4.99/mo, $29.99/yr) | Weekly Sunday reflection every week. Future illustrated avatars. |

Gating logic in `ReflectionCardScreen`: show cached reflections first. Only if no reflection exists for that week and the free monthly allowance is exhausted does the app redirect to Paywall.
RevenueCat entitlement ID: `"premium"`.
Product IDs: `echo_premium_monthly`, `echo_premium_yearly`.

---

## Key Files to Know

| File | Why it matters |
|---|---|
| [README.md](README.md) | Setup, scripts, and top-level project map |
| [ARCHITECT.md](ARCHITECT.md) | Single source of truth for rules, architecture, file routing, and QA |
| [app.config.ts](app.config.ts) | Bridges `.env` values into Expo runtime config |
| [src/config.ts](src/config.ts) | Normalizes client config and removes placeholder leakage |
| [src/services/timer.ts](src/services/timer.ts) | The 3-min hard cap — most critical non-negotiable constraint |
| [src/services/reflection.ts](src/services/reflection.ts) | Full AI pipeline orchestration |
| [src/services/contentFilter.ts](src/services/contentFilter.ts) | Safety layer — scans every AI output before display |
| [src/database/database.ts](src/database/database.ts) | SQLite init + settings CRUD — foundation everything depends on |
| [src/state/AppContext.tsx](src/state/AppContext.tsx) | Global state — DB init, premium state, session state |
| [src/AppRoot.tsx](src/AppRoot.tsx) | Root provider + notification tap routing |
| [src/navigation/RootNavigator.tsx](src/navigation/RootNavigator.tsx) | Onboarding vs Main branch |
| [supabase/functions/weekly-reflection/index.ts](supabase/functions/weekly-reflection/index.ts) | Edge Function — only server-side code in the project |

---

## Runtime Config To Set Before Shipping

| Surface | Key | Purpose |
|---|---|---|
| `.env` / EAS env | `EXPO_PUBLIC_SENTRY_DSN` | Sentry project DSN |
| `.env` / EAS env | `SENTRY_ORG` | Optional native Sentry plugin org; only needed for sourcemap/upload workflows |
| `.env` / EAS env | `SENTRY_PROJECT` | Optional native Sentry plugin project; only needed for sourcemap/upload workflows |
| `.env` / EAS env | `SENTRY_AUTH_TOKEN` | Optional Sentry auth token for build-time uploads |
| `.env` / EAS env | `SENTRY_URL` | Optional self-hosted Sentry base URL; defaults to `https://sentry.io/` |
| `.env` / EAS env | `EXPO_PUBLIC_SUPABASE_EDGE_FUNCTION_URL` | Supabase Edge Function URL for weekly reflections |
| `.env` / EAS env | `EXPO_PUBLIC_REVENUECAT_IOS_KEY` | RevenueCat iOS public API key |
| `.env` / EAS env | `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` | RevenueCat Android public API key |
| `.env` / EAS env | `EXPO_PUBLIC_PRIVACY_POLICY_URL` | Privacy policy link shown in Settings > About |
| Supabase function env | `OPENAI_API_KEY` | Server-side OpenAI key for `weekly-reflection` |
| [eas.json](eas.json) | Apple/Google IDs | App Store Connect + Play Console credentials |

Secret-handling rule: no API key may be added, pasted, rotated, or used anywhere in this project unless the project owner explicitly approves it for that task. This includes local `.env` files, hosted environment variables, CLI commands, and dashboard updates.

---

## Open Decisions (from PRD)

| # | Question | Status |
|---|---|---|
| 1 | App name (Wisp, Pulse, Nod, Blink, Felt, Hush, Ember, Tide) | Undecided |
| 2 | Emoji scale — Unicode v1 or custom illustrated? | Unicode shipped in v1 |
| 3 | Free Sunday reflections for first 4 weeks? | Not implemented — decide before RevenueCat setup |
| 4 | iOS only first, or iOS + Android simultaneously? | Both supported in code |
| 5 | i18n-ready strings from day one? | Yes — `copy.ts` uses keyed structure |

---

## v2 Upgrade Paths

| Feature | Current v1 | v2 plan |
|---|---|---|
| Word input | Text field, max 20 chars | Voice mic — 5s tap-to-speak |
| Emoji scale | Unicode emoji | Custom illustrated states |
| Weekly avatar | Unicode weather emoji | 9 hand-illustrated SVG figures |
| Data backup | Device-local only | Optional encrypted iCloud/Google Drive |
| Account | None | Optional, for cross-device backup only |
| AI chat | Not in v1 | Conversational AI companion |

---

*Last updated: 2026-03-31 — Consolidated project guidance into ARCHITECT.md, kept README.md for setup, shrank VIBE_CODING.md and CLAUDE.md into compatibility pointers, and added a project rule to keep ARCHITECT.md and README.md current.*
