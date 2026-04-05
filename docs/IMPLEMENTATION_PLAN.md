# ECHO App - Complete Implementation Plan

> Status note: this file is the original phased plan. For the current codebase shape, use `ARCHITECT.md` first and `README.md` for setup details.

## Document Roles

- `ARCHITECT.md` = single engineering source of truth
- `README.md` = setup, env, commands, and repo overview
- `IMPLEMENTATION_PLAN.md` = phase tracker and remaining work

## Current Phase Snapshot

| Phase | Status | Notes |
|---|---|---|
| Phase 0: Scaffolding & Config | Complete | Expo app exists, docs exist, runtime config flows through `.env` -> `app.config.ts` -> `src/config.ts`, and local web preview works. |
| Phase 1: Database | Complete | SQLite schema and CRUD layer are in place. |
| Phase 2: Types, Constants & Utilities | Complete | Core type system, copy/constants, and helpers exist. |
| Phase 3: Services | Mostly complete | Timer, notifications, reflection, purchases, config guards, and AI response validation exist; production keys still need to be set. |
| Phase 4: Navigation | Complete | Flat onboarding and main stacks are implemented. |
| Phase 5: Screens | Complete | Core onboarding, daily loop, reflection, paywall, and settings screens exist. |
| Phase 6: State Management | Complete | `AppContext` now owns bootstrap state and timed-session state. |
| Phase 7: Supabase Edge Function | Mostly complete | Function exists with runtime output validation; production env and prompt QA remain. |
| Phase 8: Push Notifications | Mostly complete | Local scheduling, deduped cold-start handling, and tap routing work; device QA remains. |
| Phase 9: Sentry | Partial | `Sentry.init()` and wrapping are implemented; production DSN and any breadcrumbs still need finishing. |
| Phase 10: RevenueCat | Mostly complete | Client gating exists; real products, keys, and store-side setup remain. |
| Phase 11: Testing | In progress | `npm run verify` passes with 60 tests in 10 suites; manual/device QA remains. |
| Phase 12: App Store Submission | Pending | Store metadata, assets, builds, and privacy-policy setup remain. |

## Context

Build a daily mood check-in app for university students (18-25) from scratch based on [PRD_v1.md](PRD_v1.md). The app minimizes time-in-app (3-minute hard cap), uses a daily emoji+word+breath loop, and delivers AI-powered weekly reflections every Sunday. Tech stack: React Native (Expo), SQLite, Supabase Edge Functions, OpenAI GPT-4o mini, RevenueCat, Sentry.

---

## Phase 0: Project Scaffolding & Configuration

### 0.1 Initialize Expo Project
```bash
npx create-expo-app@latest ECHO --template blank-typescript
```

### 0.2 Install Dependencies
```bash
# Core
npx expo install expo-sqlite expo-notifications expo-device expo-constants expo-linking expo-haptics expo-application expo-status-bar expo-font expo-splash-screen expo-localization react-native-reanimated react-native-gesture-handler react-native-safe-area-context react-native-screens react-dom react-native-web @react-navigation/native @react-navigation/native-stack react-native-purchases @sentry/react-native expo-background-fetch expo-task-manager

# Dev
npm install -D @types/react jest @testing-library/react-native @testing-library/jest-native
```

### 0.3 Directory Structure
```
ECHO/
├── app.json / app.config.ts / eas.json
├── .env.example
├── README.md / ARCHITECT.md / VIBE_CODING.md / CLAUDE.md / IMPLEMENTATION_PLAN.md
├── App.tsx                          # Entry point
├── scripts/repair-expo-bin.js       # Keeps npx expo start working after installs
├── supabase/functions/weekly-reflection/index.ts
├── src/
│   ├── AppRoot.tsx                  # Navigation + providers wrapper
│   ├── navigation/
│   │   ├── RootNavigator.tsx        # Onboarding vs Main
│   │   ├── OnboardingNavigator.tsx  # 8-screen onboarding + first-entry flow
│   │   └── MainNavigator.tsx        # Daily loop + reflection + settings
│   ├── screens/
│   │   ├── onboarding/              # Welcome, EmojiExplain, Notification, ReminderTime, onboarding daily-loop variants
│   │   ├── daily/                   # EmojiPicker, WordInput, Breathing, Completion
│   │   ├── reflection/              # ReflectionCard, CrisisCard
│   │   ├── paywall/PaywallScreen.tsx
│   │   └── settings/               # Settings, About
│   ├── components/                  # AppScreen, WordStep, BreathingStep, ReminderTimePicker, EmojiCircle, BreathingAnimation, WeatherAvatar, FadeOverlay, GlassCard
│   ├── config.ts                    # normalized client config
│   ├── database/
│   │   ├── database.ts             # SQLite init + migrations + settings CRUD
│   │   ├── entries.ts              # Daily entry CRUD
│   │   └── reflections.ts          # Weekly reflection CRUD
│   ├── services/
│   │   ├── notifications.ts        # Schedule/cancel push notifications
│   │   ├── reflection.ts           # Build payload, call edge function, parse + filter
│   │   ├── purchases.ts            # RevenueCat init + entitlement checks
│   │   ├── timer.ts                # 3-minute hard cap logic
│   │   ├── contentFilter.ts        # Prohibited string scanner
│   │   └── crisisDetector.ts       # Crisis flag handler
│   ├── hooks/                       # useDatabase, useTimer, useEntitlements, useNotificationResponse
│   ├── state/AppContext.tsx         # React Context for global state
│   ├── constants/                   # emojis, avatars, copy, crisis, prohibited, theme
│   ├── utils/                       # dateHelpers, closeApp, validators
│   └── types/                       # entry, reflection, navigation param types
├── assets/                          # icon, splash, fonts
└── __tests__/                       # Unit + integration tests
```

---

## Phase 1: Database Layer

### SQLite Schema

```sql
-- entries: one per day
CREATE TABLE IF NOT EXISTS entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,                -- YYYY-MM-DD
  emoji_score INTEGER NOT NULL CHECK(emoji_score BETWEEN 1 AND 5),
  word TEXT NOT NULL CHECK(length(word) <= 20),
  breath_taken INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- reflections: one per week
CREATE TABLE IF NOT EXISTS reflections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week_start TEXT NOT NULL UNIQUE,          -- YYYY-MM-DD (Monday)
  s1 TEXT NOT NULL,
  s2 TEXT NOT NULL,
  s3 TEXT NOT NULL,
  avatar_key TEXT NOT NULL,
  is_crisis INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- settings: key-value store
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
-- Defaults: reminder_hour=21, reminder_minute=0, onboarding_complete=0
```

### Key Functions
- `src/database/database.ts`: `initDatabase()`, `getSetting()`, `setSetting()`
- `src/database/entries.ts`: `insertEntry()`, `getEntryByDate()`, `getEntriesForWeek()`, `hasEntryToday()`
- `src/database/reflections.ts`: `insertReflection()`, `getReflectionForWeek()`, `getLatestReflection()`

---


## Phase 2: Types, Constants & Utilities

### Types
- `Entry` — id, date, emoji_score (1-5), word, breath_taken, created_at
- `Reflection` — id, week_start, s1-s3, avatar_key, is_crisis, created_at
- `AvatarKey` — union of 9 weather states
- `AIPayload` / `AIResponse` — per PRD section 4.3
- Navigation param lists for type-safe routing

### Constants
- `emojis.ts` — 5 emoji definitions with score, emoji char, color (dark-to-bright)
- `avatars.ts` — 9 weather states mapped to emoji + background color
- `prohibited.ts` — banned AI output strings: 'should', 'recommend', 'disorder', 'diagnose', 'depressed', 'anxiety disorder', 'mental illness', 'you need to'
- `crisis.ts` — locale-to-crisis-line map + hardcoded crisis card text
- `copy.ts` — all UI strings (i18n-ready structure)
- `theme.ts` — Sanctuary light theme: cream bg (#fcf9f1), sage green (#586a48), peach/gold accents. COLORS, GRADIENTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS, GRAIN_OPACITY.

### Utilities
- `dateHelpers.ts` — todayISO, getWeekStart, getDayName, isSunday
- `closeApp.ts` — platform-specific app close (Android: BackHandler.exitApp; iOS: navigate to inert completion state)
- `validators.ts` — word input validation

---

## Phase 3: Services Layer

### 3.1 Timer Service (`services/timer.ts`)
- 180-second countdown from notification tap
- `onExpire` callback triggers fade-and-close
- App-level ownership lives in `AppContext`, so the timed session survives navigation

### 3.2 Content Filter (`services/contentFilter.ts`)
- Scans s1, s2, s3 against prohibited strings (case-insensitive)
- Returns `{ safe: boolean }` — if unsafe, reflection replaced with fallback card

### 3.3 Crisis Detector (`services/crisisDetector.ts`)
- Checks `response.crisis === true`
- If true: show hardcoded crisis card, never store reflection

### 3.4 Notification Service (`services/notifications.ts`)
- `registerForPushNotifications()` — request permission, get token
- `scheduleDailyReminder(hour, minute)` — repeating local notification, 5 rotating copy variants
- `scheduleSundayReflection()` — weekly Sunday 9am local notification
- Notification data: daily uses `{ type: 'daily' }`; reflection uses `{ type: 'reflection' }` and computes the current `weekStart` on tap

### 3.5 Reflection Service (`services/reflection.ts`)
- `buildPayload(weekStart, entries)` — anonymized JSON per PRD 4.3
- `fetchReflection(payload)` — POST to Supabase Edge Function, 3 retries, 15s timeout
- `processReflection(weekStart)` — full orchestration: fetch entries -> build payload -> call API -> validate avatar key (fallback: 'cloudy') -> check crisis -> filter content -> store

### 3.6 Purchases Service (`services/purchases.ts`)
- RevenueCat configure, check entitlement, get offerings, purchase, restore
- Hook: `useEntitlements` returns `{ isPremium, isLoading }`

### 3.7 Runtime / Tooling Notes
- `app.config.ts` conditionally enables native Sentry plugin config only when `SENTRY_ORG` and `SENTRY_PROJECT` are set
- `postinstall` runs `scripts/repair-expo-bin.js` so `npx expo start` keeps working when Expo CLI is nested
- Browser preview is available via `npx expo start --web`

---

## Phase 4: Navigation

### Architecture: All stacks, no tabs, no drawer

- **RootNavigator** — reads `onboarding_complete` setting, renders Onboarding or Main stack
- **OnboardingNavigator** — 8 screens: Welcome -> EmojiExplain -> NotificationPermission -> ReminderTime -> OnboardingEmojiPicker -> OnboardingWordInput -> OnboardingBreathing -> OnboardingCompletion
- **MainNavigator** — flat stack with EmojiPicker as the default route
- **AppRoot + useNotificationResponse** handle notification tap routing into the correct main-stack screen

**No home screen.** The emoji picker IS the default screen.

---

## Phase 5: Screens

### Onboarding (8 screens, <90s total)
1. **WelcomeScreen** — app name, "Emoji. Word. Breath. Done.", disclaimer, "Get started" CTA
2. **EmojiExplainScreen** — 5 emoji circles shown, "Pick how you feel. Once a day."
3. **NotificationScreen** — "We tap your shoulder once a day. That's it." + permission request
4. **ReminderTimeScreen** — time picker, default 9pm, "We'll come to you."
5. **OnboardingEmojiPickerScreen** — first-entry emoji step
6. **OnboardingWordInputScreen** — first-entry word step
7. **OnboardingBreathingScreen** — first-entry breath step
8. **OnboardingCompletionScreen** — completes onboarding and hands off to the main app

### Daily Loop (4 screens, <3 min)
1. **EmojiPickerScreen** — 5 emoji circles in an organic arch (translateY offsets), "How are you today?" headline, ambient peach glow, progress bar, gradient Continue button. Haptic on tap. Starts timer if from notification.
2. **WordInputScreen** — "OneWord" headline, floating ☁️ cloud animation, 44px centered input, focus scale/glow, progress bar. maxLength 20, autoFocus.
3. **BreathingScreen** — "OneMinute" layout; 4-layer concentric glow animation (BreathingAnimation); breathing instructions; pill skip button (1.5s confirm); progress bar. Entry saved to SQLite at this transition.
4. **CompletionScreen** — soft checkmark/emoji, 3s display, fade out, close app

### Reflection (2 screens)
1. **ReflectionCardScreen** — "Sunday Reflection" card: LinearGradient avatar section with decorative particles + WeatherAvatar, divider, 3 icon-labelled sentence rows (🕐 ✨ ⚖️), closing quote, insight card, green "Begin a New Week" CTA. Free tier: check monthly allowance, show paywall if exceeded.
2. **CrisisCardScreen** — hardcoded text + locale-appropriate crisis line number (tappable to dial). Never logged.

### Other
- **PaywallScreen** — $4.99/mo + $29.99/yr options, feature list, restore purchases
- **SettingsScreen** — reminder time, manage subscription, about, privacy policy link
- **AboutScreen** — app name, version, disclaimer, privacy policy link

---

## Phase 6: State Management

**React Context only** (no Redux/Zustand needed).

```typescript
interface AppState {
  isReady: boolean;
  bootstrapError: string | null;
  isPremium: boolean;
  isLoadingPremium: boolean;
  onboardingComplete: boolean;
  secondsRemaining: number;
  isTimedSessionActive: boolean;
  hasTimedSessionExpired: boolean;
}
```

Daily flow state (emoji score, word, breath) passed via **navigation params** — ephemeral, not global. Entry saved to SQLite only after breathing screen.

---

## Phase 7: Supabase Edge Function (Backend)

### Single Edge Function: `weekly-reflection`
1. Parse request body as AIPayload
2. Validate: entry_count > 0, scores 1-5
3. Call OpenAI GPT-4o mini with JSON mode + system prompt from PRD 4.4
4. Validate avatar key in allowed set
5. Return AIResponse JSON
6. Simple rate limit: max 2 requests per IP per hour

**No Supabase database tables. No RLS. Stateless function only.**

### System Prompt
Hardcoded in the Edge Function per PRD section 4.4. Version-controlled.

---

## Phase 8: Push Notifications Detail

- **Daily**: local repeating notification at user-set time, 5 rotating body variants
- **Sunday**: local weekly notification, Sunday 9am, "Your week, reflected."
- **Tap routing** (`useNotificationResponse`):
  - `'daily'` -> EmojiPicker + start timer
  - `'reflection'` -> compute current `weekStart` -> navigate to `ReflectionCard`
- **Reflection screen work**: `ReflectionCardScreen` handles cached reflections first, then entitlement checks, `processReflection()`, and crisis redirection
- **Cold start**: check `getLastNotificationResponseAsync()` on app init, dedupe it, and clear it after handling
- **Warm start**: listener fires directly

---

## Phase 9: Sentry Integration
- Current state: `Sentry.init()` in `App.tsx`, root wrapped with `Sentry.wrap()`
- Native plugin config is opt-in through `app.config.ts` and only enabled when `SENTRY_ORG` + `SENTRY_PROJECT` are present
- No user identification
- Performance monitoring disabled
- Remaining work: add any high-value breadcrumbs only after the core flow is stable on device

---

## Phase 10: RevenueCat Integration
- Create subscription products: `echo_premium_monthly` ($4.99), `echo_premium_yearly` ($29.99)
- Entitlement: "premium" — gates weekly reflections (free tier gets monthly only)
- Check on launch + on foreground return
- Gating logic: in ReflectionCardScreen, check if reflection stored this calendar month

---

## Phase 11: Testing

Current status: `npm run verify` passes with 60 tests across 10 suites.

### Unit Tests (priority order)
1. `contentFilter.test.ts` — every prohibited string, case insensitivity, partial matches
2. `timer.test.ts` — 180s expiry, clear on completion
3. `reflectionPayload.test.ts` — payload builder behavior
4. `reflectionResponse.test.ts` — runtime AI response validation
5. `notifications.test.ts` — reflection week-start fallback + notification dedupe helpers
6. `entries.test.ts` — insert, duplicate rejection, non-overwrite behavior
7. `bootstrap.test.ts` — critical DB bootstrap vs soft purchases failure
8. `dateHelpers.test.ts` — week boundaries across month/year

### Prompt Testing
Test 50 different weekly payloads against AI prompt before launch. Verify: no prohibited words, valid avatar keys, warm tone, correct crisis flag behavior.

### Manual Testing Checklist
- [ ] Notification at set time (cold + warm start)
- [ ] 3-minute cap closes app mid-flow
- [ ] Sunday reflection flow (premium + free tier)
- [ ] Crisis card with correct locale phone number
- [ ] Prohibited word fallback card
- [ ] Missed day = blank (no guilt)
- [ ] "Rest counts too." on breath skip
- [ ] 20-char word limit enforced
- [ ] All 9 avatar states display
- [ ] Settings: time change reschedules notification
- [ ] App opened directly shows emoji picker without timer
- [ ] Web preview loads on `http://localhost:8081`

---

## Phase 12: App Store Submission

### Apple
- **Category**: Health & Fitness (NOT Medical)
- **Avoid** "mental health" in metadata — use "mood check-in", "daily wellness"
- **Privacy label**: "Data Not Collected"
- **Review notes**: not a medical device, crisis resource link, Apple guideline 5.1.3
- **Screenshots**: emoji picker, word input, breathing, reflection card, onboarding

### Google Play
- **Category**: Health & Fitness
- **Data safety**: No data shared/collected
- Mirror iOS pricing

### Required Assets
- App icon 1024x1024 (iOS), 512x512 (Android)
- Splash screen, screenshot frames
- Privacy policy URL (static page)

---

## Build Order (Critical Path)

| Order | Phase | Can Parallelize? |
|-------|-------|-----------------|
| 1 | Phase 0: Scaffolding | No — must be first |
| 2 | Phase 1: Database | No — everything depends on this |
| 3 | Phase 2: Types/Constants | No — used by all code |
| 4 | Phase 3: Services | No — depends on DB + types |
| 5 | Phase 4: Navigation + Phase 7: Backend | Yes — independent of each other |
| 6 | Phase 5: Screens + Phase 8: Notifications | Yes — can build in parallel |
| 7 | Phase 6: State wiring | After screens exist |
| 8 | Phase 9: Sentry + Phase 10: RevenueCat | Yes — integrate after core works |
| 9 | Phase 11: Testing | Continuous, formal pass after all features |
| 10 | Phase 12: Submission | Last step |

---

## Key Architecture Decisions

1. **No home screen** — EmojiPickerScreen is the default route (PRD commitment)
2. **Nav params for daily flow** — emoji/word/breath accumulate as params, not global state
3. **SQLite for everything** — no AsyncStorage, settings table covers preferences
4. **Local notifications only** — no server push infrastructure needed
5. **Stateless Edge Function** — no Supabase DB, no RLS, no PII storage
6. **Client-side content filter** — defense in depth even if server is compromised
7. **iOS app close** — navigate to inert completion state + fade; user swipes away. Budget $100-200 to hire specialist if needed per PRD

---

## Verification

1. Run `npm run verify`
2. Run `npx expo start` and test on iOS Simulator + Android Emulator
3. Test full daily flow: notification -> emoji -> word -> breath -> close
4. Test 3-minute cap: start flow, wait 3 minutes, verify auto-close
5. Test same-day reopen: app should show a done state and not overwrite the stored entry
6. Test Sunday reflection: mock edge function response, verify cached reflections stay visible and paywall round-trip returns to the correct week
7. Test crisis path: mock `"crisis": true` response, verify crisis card shown
8. Test content filter: mock response with prohibited words, verify fallback card
9. Build with `eas build` for both platforms
10. Test on physical devices before submission
